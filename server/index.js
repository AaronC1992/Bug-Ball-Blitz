import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

// Load env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create app
const app = express();
app.use(express.json({ limit: '2mb' }));

// CORS (allow all for now)
app.use(cors());

// Simple health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Helper: read catalog
const catalogPath = path.join(__dirname, 'soundCatalog.json');
function readCatalog() {
  const raw = fs.readFileSync(catalogPath, 'utf-8');
  return JSON.parse(raw);
}

// (a) GET /sounds
app.get('/sounds', (req, res) => {
  try {
    const catalog = readCatalog();
    res.json(catalog);
  } catch (e) {
    console.error('Error reading catalog:', e);
    res.status(500).json({ error: 'Failed to read catalog' });
  }
});

// Helper: call OpenAI to analyze transcript
async function analyzeTranscript({ transcript, mode, context }) {
  const catalog = readCatalog();
  const ids = catalog.map((c) => c.id);

  const systemPrompt = `You are CueAI, an intelligent audio companion.\n` +
    `Given a transcript and mode, choose music and sfx ONLY from this catalog of IDs: ${ids.join(', ')}.\n` +
    `Return STRICT JSON with keys: scene (string), music {id, action}, sfx [ {id, when, volume} ].\n` +
    `Allowed music.action: play_or_continue | stop | change.\n` +
    `Allowed sfx.when: immediate | next_beat | background. Volume is 0.0 - 1.0.\n` +
    `Do not invent IDs. If nothing fits, return an empty sfx array and omit music or set action to stop.`;

  const userPrompt = {
    transcript,
    mode,
    context: context || {}
  };

  const body = {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(userPrompt) }
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' }
  };

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify(body)
  });

  const data = await resp.json();
  // Prefer response_format JSON
  let raw = data?.choices?.[0]?.message?.content;
  if (!raw) {
    // Fallback: try to repair if text
    raw = JSON.stringify({ scene: '', music: null, sfx: [] });
  }
  return safeJson(raw, { scene: '', music: null, sfx: [] });
}

// Robust JSON repair
function safeJson(text, fallback) {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch (e) {
    // Try to extract first {...}
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
    // Try to strip code fences
    const fenced = text.replace(/```json|```/g, '');
    try { return JSON.parse(fenced); } catch {}
    return fallback;
  }
}

// (b) POST /analyze
app.post('/analyze', async (req, res) => {
  try {
    const { transcript, mode, context } = req.body || {};
    if (!transcript) return res.status(400).json({ error: 'Missing transcript' });
    const result = await analyzeTranscript({ transcript, mode, context });

    // Enforce catalog IDs only
    const catalogIds = new Set(readCatalog().map((c) => c.id));

    if (result?.music && result.music.id && !catalogIds.has(result.music.id)) {
      delete result.music; // remove invalid music
    }
    if (Array.isArray(result?.sfx)) {
      result.sfx = result.sfx.filter((s) => catalogIds.has(s.id));
    } else {
      result.sfx = [];
    }

    res.json(result);
  } catch (e) {
    console.error('Analyze error:', e);
    res.status(500).json({ error: 'Analyze failed' });
  }
});

// (c) GET /admin
app.get('/admin', (req, res) => {
  const catalog = readCatalog();
  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>CueAI Admin</title>
<style>
body{font-family:system-ui,Arial,sans-serif;background:#0b0b0b;color:#f4f4f4;margin:0;padding:20px}
.container{max-width:900px;margin:0 auto}
.card{background:#151515;border:1px solid #2a2a2a;border-radius:10px;padding:16px;margin:12px 0}
.btn{background:#1e88e5;color:white;border:none;border-radius:8px;padding:8px 12px;cursor:pointer}
.btn.secondary{background:#424242}
input,select,textarea{background:#0f0f0f;color:#e6e6e6;border:1px solid #333;border-radius:6px;padding:8px;width:100%;}
pre{white-space:pre-wrap;background:#0f0f0f;border:1px solid #333;border-radius:6px;padding:12px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
.badge{display:inline-block;padding:2px 8px;border-radius:999px;background:#263238;margin:2px;font-size:12px}
</style>
</head>
<body>
<div class="container">
<h1>🎛️ CueAI Admin</h1>
<div class="card">
<h2>Catalog</h2>
<div class="grid" id="catalog"></div>
</div>
<div class="card">
<h2>Add Sound</h2>
<form id="addForm">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
    <div><label>ID</label><input name="id" required/></div>
    <div><label>Type</label><select name="type"><option>music</option><option>sfx</option></select></div>
    <div><label>Tags (comma)</label><input name="tags" placeholder="fantasy,dnd"/></div>
    <div><label>Src</label><input name="src" placeholder="/media/file.mp3"/></div>
    <div><label>Loop</label><select name="loop"><option value="false">false</option><option value="true">true</option></select></div>
    <div><label>License</label><input name="license" placeholder="epidemic-sound-pro-2025-10"/></div>
  </div>
  <p style="font-size:12px;color:#aaa">Note: This demo form only prints JSON. Add persistence later.</p>
  <button class="btn" type="submit">Preview JSON</button>
</form>
<pre id="preview"></pre>
</div>
<div class="card">
<h2>Test Analyze</h2>
<textarea id="transcript" rows="3" placeholder="Describe your scene or say something..."></textarea>
<div style="display:flex;gap:8px;margin-top:8px">
  <input id="mode" placeholder="dnd" style="max-width:200px"/>
  <button id="run" class="btn">Run Analyze</button>
</div>
<pre id="result"></pre>
</div>
</div>
<script>
async function loadCatalog(){
  const res=await fetch('/sounds');
  const cat=await res.json();
  const grid=document.getElementById('catalog');
  grid.innerHTML=cat.map(item=>`<div class=card><strong>${item.id}</strong><div>type: ${item.type}</div><div>src: ${item.src}</div><div>${(item.tags||[]).map(t=>`<span class=badge>${t}</span>`).join('')}</div></div>`).join('');
}
loadCatalog();

const form=document.getElementById('addForm');
form.addEventListener('submit',(e)=>{
  e.preventDefault();
  const fd=new FormData(form);
  const obj={
    id:fd.get('id'),
    type:fd.get('type'),
    tags:(fd.get('tags')||'').split(',').map(s=>s.trim()).filter(Boolean),
    src:fd.get('src'),
    loop:fd.get('loop')==='true',
    license:fd.get('license')||'epidemic-sound-pro-2025-10'
  };
  document.getElementById('preview').textContent=JSON.stringify(obj,null,2);
});

document.getElementById('run').addEventListener('click', async()=>{
  const transcript=document.getElementById('transcript').value||'the wizard opened the old door and a dragon roared';
  const mode=document.getElementById('mode').value||'dnd';
  const res=await fetch('/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({transcript,mode,context:{recentSounds:['door_creak_01'],recentMusic:'epic_fantasy_tension'}})});
  const data=await res.json();
  document.getElementById('result').textContent=JSON.stringify(data,null,2);
});
</script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Create HTTP server and WS server
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// WebSocket: /ws/transcribe
const wss = new WebSocketServer({ server, path: '/ws/transcribe' });

wss.on('connection', (client) => {
  console.log('Client connected to /ws/transcribe');

  // Connect to Deepgram realtime
  const dg = new WebSocket('wss://api.deepgram.com/v1/listen', {
    headers: { Authorization: `Token ${process.env.DEEPGRAM_API_KEY}` }
  });

  dg.on('open', () => {
    console.log('Connected to Deepgram');
  });

  dg.on('message', (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      // Deepgram message shape may vary; pick transcript if present
      // Common: data.channel.alternatives[0].transcript
      const t = data?.channel?.alternatives?.[0]?.transcript;
      if (t) {
        client.send(JSON.stringify({ transcript: t }));
      }
    } catch (e) {
      // non-JSON frames can be ignored
    }
  });

  dg.on('close', () => console.log('Deepgram closed'));
  dg.on('error', (err) => console.error('Deepgram error:', err));

  // Pipe client audio -> Deepgram
  client.on('message', (data) => {
    // TODO: normalize audio to Deepgram requirements (16-bit PCM, correct sample rate)
    if (dg.readyState === WebSocket.OPEN) {
      dg.send(data);
    }
  });

  client.on('close', () => {
    if (dg && dg.readyState === WebSocket.OPEN) dg.close();
    console.log('Client disconnected from /ws/transcribe');
  });
});

server.listen(PORT, () => {
  console.log(`CueAI server listening on http://localhost:${PORT}`);
});
