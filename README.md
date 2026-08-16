# FlirtyAI — Vercel-ready build

## Deployment
1. Upload the contents of this folder to GitHub.
2. Import the repository into Vercel.
3. In Vercel → Project → Settings → Environment Variables, add `OPENAI_API_KEY`.
4. Redeploy.

## Important
`.env.example` is only a template. Do NOT rename it to a real `.env` and commit your secret. On Vercel, the real key belongs in Environment Variables. For local development, create `.env` locally (it is ignored by Git).

Optional environment variables:
- `OPENAI_CHAT_MODEL` (default: `gpt-5.6-luna`)
- `OPENAI_IMAGE_MODEL` (default: `gpt-image-2`)
- `OPENAI_TTS_MODEL` (default: `gpt-4o-mini-tts`)
- `OPENAI_TTS_VOICE` (default: `coral`)

## Fixed in this build
- ESM/CommonJS conflict in `/api/chat` removed.
- Frontend/backend chat payload mismatch fixed.
- Frontend now reads both `reply` and `text`.
- Image endpoint mismatch `/api/image` vs `/api/images` fixed.
- Image generation uses `gpt-image-2`.
- All Vercel functions use the same ESM style.
- Local Express server is separated from Vercel serverless functions and serves the root `index.html`.
- `/api/health` is available in local mode.
- Secrets are never embedded in frontend code.
