# Faython | Scholar

**Your AI-powered academic research assistant.** A conversation-first web app where students explore research topics and draft their project chapters, one chapter at a time.

Built for CogniTech Integrated Solution (CIS).

- **Conversation is the project.** Start a chat about your research interest, get scoped topic ideas, then generate Chapters 1–5 that build on each other.
- **Client + API proxy.** A React SPA talking to a thin Express server that orchestrates generation through n8n webhook workflows (Gemini under the hood).
- **Runs without a backend too.** In demo mode the client generates realistic sample responses and persists everything to `localStorage`, so the whole thing works offline.

---

## Features

- **Generate Topic** — short, scoped research-idea suggestions from a one-line research interest.
- **Generate Chapter** — a long, structured draft (Chapter 1–5) built from your topic, your saved research profile, and previous chapters in the same conversation.
- **Streaming replies** — responses are revealed token-by-token with a typewriter effect.
- **My Projects** — every conversation is a project. Open it, rename it, delete it, or **Export DOCX** — exports compile the latest version of each chapter into a clean document.
- **Files & Documents** — history of every export so you can re-download.
- **Research profile** — set your university, course, level, referencing style, and chapter names; these are injected into every chapter prompt as context.
- **Billing & Tokens** — every generation spends tokens. Free / Student Pro / Researcher plans refresh a monthly allowance; one-time top-ups never expire. Checkout is a simulated Paystack flow (preview only).
- **Accounts** — optional Supabase auth (email/password + Google) with login redirect to your previous page.

---

## Getting started

Requires **Node.js ≥ 20** and npm.

```sh
npm i
cp .env.example .env      # then fill in the values below
npm run dev              # server on :4000 + client on :5173
```

Open [http://localhost:5173](http://localhost:5173).

> No `.env` values set? The app still runs: the client falls back to **demo mode** (sample responses, `localStorage` persistence, no auth).

---

## Environment variables

### Server (`.env`)

| Variable | Description |
| --- | --- |
| `PORT` | API port (default `4000`) |
| `NODE_ENV` | `development` / `production` |
| `CLIENT_URL` | Allowed CORS origin, e.g. `http://localhost:5173` |
| `N8N_TOPICS_WEBHOOK_URL` | n8n workflow URL for topic generation |
| `N8N_CHAPTER_WEBHOOK_URL` | n8n workflow URL for chapter generation |
| `N8N_WEBHOOK_SECRET` | Shared secret sent as `X-Faython-Secret`; must match the n8n workflow guard |
| `N8N_TIMEOUT_MS` | Webhook request timeout (default `90000`) |

### Client (`.env`, optional)

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |

When either Supabase variable is missing, the client runs in **demo mode**.

---

## API

The server is a small orchestration layer: it validates input and forwards to n8n workflows. It has no database and no auth of its own.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness check |
| `POST` | `/api/chat` | Generate topic suggestions. Body: `{ prompt?, level?, discipline? }` or `multipart/form-data` with an `image/*` `file`. Returns `{ reply }`. |
| `POST` | `/api/chapters/:topicId/:chapterNum` | Generate a chapter (`chapterNum` 1–5). Body: `{ topicTitle?, prompt?, reply?, previousChapters? }`. Returns `{ chapterNumber, content }`. |

The client proxies `/api/*` to `http://localhost:4000` in dev (`client/vite.config.ts`).

---

## Workspace layout

```
.
├── client/                 # React 19 + Vite + Tailwind v4 SPA
│   ├── src/
│   │   ├── components/     # AppShell, ChatSidebar, chat/markdown/UI components
│   │   ├── context/        # ChatContext, AuthContext, useChat store
│   │   ├── lib/            # api, chat/project/billing/token/file/profile stores
│   │   ├── pages/          # Chat, Projects, Files, Billing, Settings, auth pages
│   │   └── router.tsx      # AppShell layout + routes
│   └── vercel.json         # SPA rewrites for static hosting
├── server/                 # Express 5 API (tsx dev, tsc build)
│   └── src/
│       ├── routes/         # chat.routes.ts, chapters.routes.ts
│       ├── services/       # n8n.service.ts (webhook orchestration)
│       └── config/         # env config + validation
└── package.json            # npm workspaces (client + server)
```

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run server (:4000) and client (:5173) concurrently |
| `npm run build` | Type-check + build server and client |
| `npm run start` | Run the built server (`node dist/index.js`) |
| `npm run build -w client` | Build just the client |
| `npm run lint -w client` | Type-check the client |

---

## How data flows

1. You type a research interest and pick **Generate Topic** or **Generate Chapter** (1–5).
2. The client checks the token balance, then calls the API; the server forwards to the configured n8n workflow and streams the AI response back.
3. Replies appear as **Idea** or **Chapter N** messages in the conversation.
4. Chapters saved in a conversation are that project's chapters — **My Projects** lists every conversation, and **Export DOCX** compiles the latest Chapter 1…N into a formatted document.

All client state (conversations, exports, research profile, billing, tokens) is stored in `localStorage`, keyed by user id (or `guest`).

---

## Tokens & billing model

| Action | Cost |
| --- | --- |
| Generate Topic | 300 tokens |
| Generate Chapter | 1,200 tokens |

| Plan | Price | Monthly allowance |
| --- | --- | --- |
| Free | $0 | 3,000 |
| Student Pro | $9/mo | 50,000 |
| Researcher | $18/mo | 200,000 |

Top-ups (`5k/$3`, `20k/$9`, `100k/$35`) never expire and roll over between months. Monthly allowance is refreshed at the start of each calendar month.

> **Disclaimer:** in this preview, checkout is **simulated inside the browser** and no real charge is made. Token accounting is implemented client-side for the demo.

---

## Known limitations

- **No server-side persistence or token enforcement.** Conversations, exports, and token balances live in `localStorage` and are shared across all accounts on the same browser. Real per-user isolation requires adding storage + auth enforcement to the backend.
- **Simulated payments.** Switch `lib/supabase.ts`'s `demoMode` off / wire a real provider in `lib/payments.ts` before taking payments.
- **Minimal Markdown renderer.** Headers, lists, and bold are supported; italics, links, and code blocks render as plain text.
- **Demo responses** are sample content — real quality depends on wiring the n8n → Gemini workflows and setting `N8N_*` credentials.

---

## Support

CogniTech Integrated Solution (CIS) — Port Harcourt, Rivers State, Nigeria.

Email: `cognitechsolutions.official@gmail.com` · Phone/WhatsApp: `+234-915-7612-026`

© 2026 CogniTech Integrated Solution (CIS). Built with ❤️ for university students.