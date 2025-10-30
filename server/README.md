# CueAI Server (Backend mode)

A minimal Node/Express backend for CueAI – Intelligent Audio Companion. Provides:

- GET /sounds – serve curated catalog (Epidemic-hosted files under /public/media)
- POST /analyze – call OpenAI to choose music/SFX from the catalog based on a transcript/mode/context
- GET /admin – tiny admin UI to browse catalog and test /analyze
- WebSocket /ws/transcribe – proxy browser microphone audio to Deepgram realtime, stream transcripts back

## Quick start

```bash
cd server
cp .env.example .env
# edit .env with your keys
# OPENAI_API_KEY=...
# DEEPGRAM_API_KEY=...

npm install
npm run start
# or: npm run dev  (if you have nodemon installed globally)
```

In another terminal, run your frontend as usual. Frontend should:

- fetch GET http://localhost:3000/sounds on init
- open ws://localhost:3000/ws/transcribe and send raw audio chunks
- POST http://localhost:3000/analyze with { transcript, mode, context }

## Notes

- Do not expose Epidemic Sound credentials. Serve static media (mp3) under /public/media via your hosting. Catalog `src` should point to those served files.
- Keys (OpenAI, Deepgram) belong in server/.env only – never in the browser.
- If Deepgram audio format mismatches, normalize the microphone audio (16-bit PCM, proper sample rate). See TODO in server/index.js.

## Admin panel

Open http://localhost:3000/admin

- shows catalog
- form to preview a new sound JSON (persistence is a future step)
- button to test /analyze with a demo transcript
