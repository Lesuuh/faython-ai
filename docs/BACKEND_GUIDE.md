# Backend Build Guide

> A step-by-step guide for building the Faython Scholar backend, ordered by dependency. Each step builds on the one before it.

---

## Prerequisites & Decisions

Before writing code, make three calls:

### 1. Database: Supabase Postgres (recommended)

You already have Supabase configured for auth. Using the same project for Postgres keeps everything in one place and gives you Row Level Security for free. If you prefer more control, Drizzle + standalone Postgres works too.

### 2. ORM: Supabase JS client (if using Supabase DB)

The official `@supabase/supabase-js` client handles queries and RLS out of the box. If you're using a standalone Postgres database, use **Drizzle** or **Kysely** for lightweight type-safe queries without a full ORM.

### 3. Payment provider: Paystack (live)

Paystack is already the mock in the frontend. Go live with their API. You'll need a **business-verified Paystack account** and your test/live keys in `../server/.env`.

---

## Step 1 — Database Schema

Create the following tables in Supabase (via the dashboard SQL editor or migration files):

### conversations

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` (PK) | default `gen_random_uuid()` |
| `user_id` | `uuid` (FK → auth.users) | indexed |
| `title` | `text` | not null |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()`, updated via trigger |

### messages

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` (PK) | default `gen_random_uuid()` |
| `conversation_id` | `uuid` (FK → conversations.id, CASCADE) | indexed |
| `role` | `text` | `'user'` or `'assistant'` |
| `mode` | `text` | `'topics'` or `'chapter'` |
| `chapter_number` | `int` | nullable, set only for chapter messages |
| `content` | `text` | not null |
| `created_at` | `timestamptz` | default `now()` |

### token_accounts

| Column | Type | Notes |
|---|---|---|
| `user_id` | `uuid` (PK, FK → auth.users) | one row per user |
| `balance` | `int` | current token balance |
| `consumed_this_period` | `int` | tokens used this month |
| `granted_this_period` | `int` | allowance granted this month |
| `period_start` | `text` | `YYYY-M` format, checked on each request for rollover |

### token_ledger

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` (PK) | default `gen_random_uuid()` |
| `user_id` | `uuid` (FK → auth.users) | indexed |
| `type` | `text` | `'grant'`, `'topup'`, or `'usage'` |
| `amount` | `int` | positive for grants/topups, negative for usage |
| `kind` | `text` | nullable — `'plan'`, `'topup'`, `'topics'`, `'chapter'` |
| `note` | `text` | nullable, human-readable description |
| `created_at` | `timestamptz` | default `now()` |

### billing_state

| Column | Type | Notes |
|---|---|---|
| `user_id` | `uuid` (PK, FK → auth.users) | one row per user |
| `plan_id` | `text` | default `'free'` |
| `payments` | `jsonb` | array of payment objects, capped at 100 |

### research_profiles

| Column | Type | Notes |
|---|---|---|
| `user_id` | `uuid` (PK, FK → auth.users) | one row per user |
| `university` | `text` | default `''` |
| `course` | `text` | default `''` |
| `level` | `text` | default `''` |
| `referencing_style` | `text` | default `'APA (7th ed.)'` |
| `chapter_names` | `jsonb` | array of 5 strings |

### exports

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` (PK) | default `gen_random_uuid()` |
| `user_id` | `uuid` (FK → auth.users) | indexed |
| `name` | `text` | export display name |
| `kind` | `text` | `'conversation'` |
| `ref_id` | `uuid` | conversation id |
| `exported_at` | `timestamptz` | default `now()` |

### RLS policies

Enable Row Level Security on every table. Add a policy that allows users to only access rows where `user_id = auth.uid()`. This prevents any cross-user data leaks at the database level.

---

## Step 2 — Supabase Client on the Server

Add to `../server/.env`:

```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

> Use the **service_role** key, not the anon key. This key bypasses RLS — your server verifies auth via middleware and is trusted.

Create `../server/src/lib/supabase.ts`:

```ts
import { createClient } from "@supabase/supabase-js";
import { config } from "../config/index.js";

export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
);
```

Update `config/index.ts` to read and export these variables.

---

## Step 3 — Auth Middleware

Create `../server/src/middleware/auth.ts`:

```ts
import { supabase } from "../lib/supabase.js";
import { unauthorized } from "../lib/errors.js";

// Attaches the verified Supabase user to the request.
// Use requireAuth on all protected routes.
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next(unauthorized("Missing token"));

  const token = header.slice(7);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return next(unauthorized("Invalid token"));

  req.user = { id: data.user.id, email: data.user.email };
  next();
}
```

Apply it in `app.ts`:

```ts
// Before the protected routes
app.use("/api/topics", requireAuth, topicsRoutes);
app.use("/api/chapters", requireAuth, chaptersRoutes);
```

`GET /api/health` stays public.

---

## Step 4 — Conversation & Message CRUD

Create `../server/src/routes/conversations.routes.ts`:

| Method | Route | Auth | Body / Notes |
|---|---|---|---|
| `GET` | `/api/conversations` | Yes | Returns all conversations for the user, sorted by `updated_at desc` |
| `POST` | `/api/conversations` | Yes | Body: `{ title }`. Returns the new conversation. |
| `PATCH` | `/api/conversations/:id` | Yes | Body: `{ title }`. Updates the title. |
| `DELETE` | `/api/conversations/:id` | Yes | Deletes conversation and its messages (CASCADE). |
| `POST` | `/api/conversations/:id/messages` | Yes | Body: `{ role, mode, content, chapter_number? }`. Appends a message. Updates `updated_at` on the conversation. |
| `PATCH` | `/api/conversations/:id/messages/:msgId` | Yes | Body: `{ content }`. Updates message content (used during streaming). |

All queries use `req.user.id` to scope to the authenticated user.

Mount in `app.ts`:

```ts
import conversationsRoutes from "./routes/conversations.routes.js";
app.use("/api/conversations", conversationsRoutes);
```

---

## Step 5 — Token Enforcement on Generation

This is the most important step — it makes the billing model real.

### On every generation request:

1. Look up the user's `token_accounts` row
2. Check `period_start` — if it's a new month, refresh the allowance (reset `consumed_this_period`, add new `granted_this_period` to `balance`, add a grant ledger entry)
3. Check `balance >= cost` (topics = 300, chapters = 1200). If not, return `402 { error: "Insufficient tokens" }`
4. Call n8n (the existing generation flow)
5. On success, deduct tokens: decrement `balance`, increment `consumed_this_period`, insert a ledger entry
6. Return the response **plus** `{ tokens: { balance, consumed, allowance } }` so the client can update its UI

### What changes in existing code:

- `chat.routes.ts` and `chapters.routes.ts` gain a token check before calling n8n
- Token logic moves from the client (`token-store.ts`) to the server
- The client reads tokens from the API response instead of localStorage

### Token account creation:

- Create a `token_accounts` row for a user on first generation or first sign-in
- Default to the Free plan allowance (3,000 tokens)

---

## Step 6 — Profile Routes

Create `../server/src/routes/profile.routes.ts`:

| Method | Route | Auth | Notes |
|---|---|---|---|
| `GET` | `/api/profile` | Yes | Returns the user's research profile (or defaults) |
| `PATCH` | `/api/profile` | Yes | Body: partial profile fields. Upserts. |

The generation routes read the profile from the database instead of trusting client-provided data.

---

## Step 7 — Payment & Billing Routes

Create `../server/src/routes/billing.routes.ts`:

| Method | Route | Auth | Notes |
|---|---|---|---|
| `POST` | `/api/billing/checkout` | Yes | Body: `{ kind: "plan"|"topup", planId?, pack? }`. Initializes a Paystack transaction. Returns `{ authorization_url, reference }`. |
| `POST` | `/api/billing/webhook` | No (Paystack verifies) | Receives `charge.success` event. Verifies the signature, updates `billing_state`, applies tokens, records the payment. |
| `GET` | `/api/billing/account` | Yes | Returns `{ planId, balance, allowance, consumed }` |
| `GET` | `/api/billing/history` | Yes | Returns payment history (last 100) |

### Paystack integration:

1. Sign up at [paystack.com](https://paystack.com), verify your business
2. Get your test/live secret key → add `PAYSTACK_SECRET_KEY` to `../server/.env`
3. Register your webhook URL in the Paystack dashboard: `https://<your-api>/api/billing/webhook`
4. Use Paystack's Initialize Transaction API for checkout
5. Use Paystack's Verify Transaction API in the webhook handler
6. Verify the `x-paystack-signature` header on every webhook request

### Plan changes:

- Upgrading: charge the price difference, apply the new allowance
- Downgrading to Free: apply Free allowance, preserve purchased top-up balance
- Top-ups: charge once, add tokens to balance (no expiry)

---

## Step 8 — Export Recording

Create `../server/src/routes/exports.routes.ts`:

| Method | Route | Auth | Notes |
|---|---|---|---|
| `GET` | `/api/exports` | Yes | List user's export history |
| `POST` | `/api/exports` | Yes | Body: `{ name, kind, refId }`. Records an export. |
| `DELETE` | `/api/exports/:id` | Yes | Removes from history |

---

## Step 9 — Client-Side Cleanup

This is the biggest refactor on the client side.

### Replace localStorage stores with API calls:

| Current store | What changes |
|---|---|
| `chat-store.ts` | Conversations fetched from `GET /api/conversations`, mutations hit the API |
| `ChatContext.tsx` | Loads conversations from API on mount and on auth change |
| `token-store.ts` | Tokens read from API responses; remove localStorage logic |
| `billing-store.ts` | Billing state fetched from `GET /api/billing/account` |
| `profile-store.ts` | Profile fetched from `GET /api/profile` |
| `file-store.ts` | Export history fetched from `GET /api/exports` |
| `export.ts` | Records export via `POST /api/exports` |

### Token chip:

- Re-fetch balance after every generation (or use the balance returned in the generation response)
- Show real-time `balance / allowance` from the API

### Keep demo mode:

- The `demoMode` flag in `supabase.ts` should still work for local development
- Instead of localStorage, mock the API responses in `api.ts` when `demoMode` is true

---

## Step 10 — Deployment Prep

### Environment variables (final `../server/.env.example`):

```
# Server
PORT=4000
NODE_ENV=production
CLIENT_URL=https://your-domain.com

# Supabase
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# n8n
N8N_TOPICS_WEBHOOK_URL=
N8N_CHAPTER_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=
N8N_TIMEOUT_MS=90000

# Paystack
PAYSTACK_SECRET_KEY=
PAYSTACK_WEBHOOK_SECRET=
```

### Checklist:

- [ ] Supabase migration files versioned in `../server/migrations/`
- [ ] RLS enabled on all tables with user-scoped policies
- [ ] CORS updated for production domain
- [ ] Rate limiting added (express-rate-limit or Supabase RLS)
- [ ] `GET /api/health` returns 200 for load balancers
- [ ] Error logs go to a monitoring service (Sentry, Logtail, etc.)
- [ ] Client `../client/.env` points to the production API URL (`VITE_API_URL`, not yet implemented in the client)
- [ ] Paystack webhook URL registered in the Paystack dashboard
- [ ] Test the full flow: register → generate topic → generate chapters → export → upgrade plan → top-up → downgrade

---

## Build Order Summary

| Step | What | Dependency |
|---|---|---|
| 1 | Database schema | — |
| 2 | Supabase server client | Step 1 |
| 3 | Auth middleware | Step 2 |
| 4 | Conversation CRUD | Steps 2 + 3 |
| 5 | Token enforcement | Steps 2 + 3 |
| 6 | Profile routes | Steps 2 + 3 |
| 7 | Payment / billing | Steps 2 + 3 + 5 |
| 8 | Export recording | Steps 2 + 3 |
| 9 | Client cleanup | Steps 4–8 |
| 10 | Deployment prep | Step 9 |

Steps 1–5 are the critical path. Once you have auth + DB + token enforcement, the app is production-ready for its core feature (generation). Steps 6–8 are polish. Step 9 is the biggest client refactor. Step 10 is go-live.
