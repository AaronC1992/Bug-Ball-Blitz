// Tiny client API helper for CueAI server
// Uses same-origin calls assuming served under server/public

let ws;
let audioContext;
let processor;
let mediaStream;

export async function fetchCatalog() {
  const res = await fetch('/sounds');
  if (!res.ok) throw new Error('Catalog fetch failed');
  return res.json();
}

export function openTranscribeSocket(onMessage) {
  if (ws && ws.readyState === WebSocket.OPEN) return;
  ws = new WebSocket(getWSUrl('/ws/transcribe'));
  ws.onopen = () => console.log('WS open');
  ws.onclose = () => console.log('WS close');
  ws.onerror = (e) => console.warn('WS error', e);
  ws.onmessage = (evt) => {
    try {
      const data = JSON.parse(evt.data);
      onMessage && onMessage(data);
    } catch {}
  };
}

export function closeTranscribeSocket() {
  if (ws) {
    try { ws.close(); } catch {}
    ws = undefined;
  }
}

export async function startMicCapture() {
  // Get mic
  mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });

  const source = audioContext.createMediaStreamSource(mediaStream);
  // ScriptProcessorNode is deprecated but simpler for a demo; Worklet is recommended.
  processor = audioContext.createScriptProcessor(4096, 1, 1);
  source.connect(processor);
  processor.connect(audioContext.destination);

  processor.onaudioprocess = (e) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const input = e.inputBuffer.getChannelData(0); // Float32Array [-1,1]
    const pcm16 = floatTo16BitPCM(input);
    ws.send(pcm16);
  };
}

export async function stopMicCapture() {
  try {
    if (processor) {
      processor.disconnect();
      processor.onaudioprocess = null;
      processor = undefined;
    }
    if (audioContext) {
      await audioContext.close();
      audioContext = undefined;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
      mediaStream = undefined;
    }
  } catch {}
}

export async function analyze(body) {
  const res = await fetch('/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('Analyze failed');
  return res.json();
}

function getWSUrl(path) {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${location.host}${path}`;
}

function floatTo16BitPCM(float32Array) {
  // Convert Float32 [-1,1] to signed 16-bit PCM Little Endian
  const len = float32Array.length;
  const buffer = new ArrayBuffer(len * 2);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < len; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    // scale to 16-bit signed int
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return buffer;
}
