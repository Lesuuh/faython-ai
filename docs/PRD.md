# Faython (Scholar) — Product Requirements Document

## Document control

| | |
| --- | --- |
| Product | Faython (Scholar) |
| Owner | CogniTech Integrated Solution (CIS) |
| Status | In development (beta) |
| Version | 1.0.0 |
| Last updated | 2026-09-12 |
| Project ID | faython-scholar-001 |

### Revision history

| Version | Date | Author | Summary |
| --- | --- | --- | --- |
| 0.1 | 2026-09-12 | Product Team | First consolidated draft |
| 1.0.0 | 2026-09-12 | Product Team | Restructured to standard industry PRD format; removed dev-only scaffolding notes |

---

## 1. Executive summary

Faython (Scholar) is an AI research assistant for undergraduate and postgraduate students.
A student describes an area of interest as plain text or a photo of an assignment brief, receives
**5–8 well-scoped research topics**, saves one, and generates **Chapter One for free** (subject
to a transparent daily cap). **Chapters Two to Five** are released per project through a one-time
Paystack payment.

The product's core job is to move a student from a vague interest to a validated topic and a
complete, references-backed draft. **AI output quality and student trust are the differentiators —
not feature breadth.** Students are willing to pay, but only for output they can defend to a
supervisor.

This document defines the product's scope, user profiles, functional and non-functional
requirements, monetisation model, technical architecture, data model, measurement plan, roadmap
and release criteria. It is the single source of truth for engineering and product decisions;
open questions are tracked in §13.

## 2. Background & problem statement

Nigerian university students in their final year are typically required to submit a research
project (project/proposal) comprising five chapters: an introduction, a literature review,
methodology, results/discussion, and conclusions. The two hardest, most time-consuming steps are
i) arriving at a defensible, well-scoped topic, and ii) writing **Chapter One** that satisfies a
supervisor's expectations for structure, gaps and research questions.

Current alternatives are unsatisfactory:

- **Generic chatbots** return broad, unverifiable answers that students copy verbatim, risking
  poor scoping and weak academic judgment.
- **PDF "project banks"** offer copy-paste materials that lack original framing and frequently do
  not map to the student's discipline, level or supervisor requirements.
- **Manual writing** is slow, and most students cannot easily restructure content along the
  chapter framework their institution expects.

**Impact:** students stall at the topic-selection and Chapter One stages, extending completion
time and increasing dropout risk. Students are willing to pay, but only for output they can
defend to a supervisor.

**Faython's thesis:** if a student can describe an interest in plain language (even via a photo
of an assignment brief) and receive immediately-useful, well-scoped topics plus a generated
Chapter One for free, conversion to a paid unlock of the remaining chapters becomes a natural,
trust-based step rather than a hard sell.

## 3. Objectives & success metrics

### 3.1 Goals

- **G1** — Help a student reach a validated, well-scoped topic as fast as possible (target first
  interaction → saved topic in under 10 minutes).
- **G2** — Provide Chapter One that is institutionally structured (background, problem statement,
  objectives, research questions, scope, significance) and defensible to a supervisor.
- **G3** — Monetise Chapters Two–Five transparently on a per-project basis without degrading the
  free tier's trust (no sneaky caps, clear daily limits).
- **G4** — Keep the AI orchestration (prompting, parsing, retries, model-sourcing) swappable
  without a code deploy, via an n8n pipeline.

### 3.2 Non-goals (aspirational, out of scope for v1)

- **NG1** — Serve as a "write my full project" service producing unedited deliverables.
- **NG2** — Provide citation/plagiarism guarantees. References are generated as guidance; the
  student remains responsible for academic integrity.
- **NG3** — Multi-language/multi-country launch; v1 targets Nigerian institutions.
- **NG4** — Voice input, desktop apps, team/enterprise plans, marketplace of supervisors.

### 3.3 Success metrics (north-star & guardrails)

| Metric | Type | Target (v1) |
| --- | --- | --- |
| Activation: % signups that save ≥1 topic within 24h | North star | ≥ 40% |
| Conversion: % projects with Chapter One generated that unlock Chapters 2–5 (paid) | North star | ≥ 8% |
| Time to first saved topic | Experience | < 10 min |
| Chapter One generation success rate (no error/timeout) | Reliability | ≥ 95% |
| Topic generation success rate | Reliability | ≥ 96% |
| Average generation latency (topic set) | Experience | < 10 s |
| Average Chapter One latency | Experience | < 25 s |
| Entitlement verification failures after successful payment | Correctness | ~0% |
| Daily free-cap transparency (users who correctly report their remaining allowance) | Trust | ≥ 85% |

## 4. Target users & personas

- **P1 — Final-year undergraduate (primary).** Mobile-first, cash-sensitive, often uses a photo
  of an assignment brief as input. Needs a defensible topic fast; may or may not pay for the rest.
  High propensity to convert only after trust is established via Chapter One.
- **P2 — Postgraduate / funded student (secondary).** Has a validated topic; more likely to pay
  one-time per project to complete chapters 2–5 within a deadline.
- **P3 — Supervisor (tertiary).** Uses the tool to shortlist topics for advisees; validates
  quality but is not a payer.

Primary use context: late-night/last-minute sessions on a phone screen; interrupted connectivity;
limited patience for long forms.

## 5. User journeys

1. **First-time discovery → pay:** User lands → signs up → describes interest (text/photo) →
   receives 5–8 topics → saves one → generates Chapter One (sees daily cap messaging) → attempts
   Chapter Two → paywall → Paystack checkout → entitlement granted server-side → Chapters 2–5
   unlock for that project.
2. **Returning user → resume work:** logs in → dashboard → reopens a project → continues the
   persisted conversation, reads/generates chapters, views payment and usage status.
3. **Account management:** updates name/email/password and notification preferences, reviews
   payment history, deletes account (cascades topics, chapters, entitlements, payments).

## 6. Functional requirements

Priorities: **P0** = must ship for beta, **P1** = should, **P2** = later/nice-to-have.

### 6.1 Authentication & account

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-001 | Email/password signup with email verification link | P0 |
| FR-002 | Login/logout using JWT access + refresh issued as httpOnly cookies | P0 |
| FR-003 | Forgot / reset password flow via email | P0 |
| FR-004 | Google OAuth sign-in | P2 (stubbed) |
| FR-005 | Rate-limiting on auth endpoints (login, signup, reset) | P0 |
| FR-006 | Edit name/email in profile | P0 |
| FR-007 | Notification on/off, change password, delete account (cascades all user data) | P0 |
| FR-008 | Session refresh and silent re-authentication on dashboard reload | P0 |
| FR-009 | Auth UI in **preview/demo mode** when backend credentials are absent so the product can be explored before deployment | P0 |

> Note FR-009: when Supabase env vars are not configured, the client runs a local demo session
> (any credentials create a demo user). This is a frontend-only affordance for development and
> demoing; it is automatically disabled once real Supabase credentials are configured.

### 6.2 Topic generation

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-010 | Generate topics from a text prompt or an uploaded image (assignment brief) | P0 |
| FR-011 | Return 5–8 topics with scope notes; every AI message (user prompt + AI reply) is persisted per topic so the conversation can be replayed/reopened | P0 |
| FR-012 | Save/unsave a topic set (also from dashboard) | P0 |
| FR-013 | Daily free-tier generation cap (~3/day) with clear "X of 3 used today" messaging; server-enforced, not just UI | P0 |
| FR-014 | Include project profile (course, level, university, referencing style, custom chapter names) in the prompt context so outputs are tailored | P0 |
| FR-015 | Filter/search/sort dashboard history (level, discipline, saved, keyword, pagination) | P0 |
| FR-016 | Clear all history / delete individual topic sets | P0 |

### 6.3 Chapter generation

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-017 | Chapter One generation for any saved topic (free, capped ~3/day) | P0 |
| FR-018 | Chapters 2–5 generation **gated server-side** by entitlement (never trust the client) | P0 |
| FR-019 | Per-chapter status in UI: locked / unlocked / progress ("2 of 5", "5 of 5") | P0 |
| FR-020 | Show paywall/upgrade UI when user attempts a locked chapter | P0 |
| FR-021 | Persist each generated chapter (title/number/content) per topic for later reading | P0 |
| FR-022 | Regenerate a chapter using saved conversation context | P1 |

### 6.4 Monetisation (Paystack)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-023 | One-time per-project payment unlocks Chapters 2–5 **for that project only** (entitlement per topicId) | P0 |
| FR-024 | Paystack checkout initiation, webhook → entitlement granted server-side (signature-verified) | P0 |
| FR-025 | Payment history view | P0 |
| FR-026 | Retry flow if payment fails/abandons | P0 |
| FR-027 | Failure handling: verify webhook signature server-side; never derive entitlement from client input | P0 |
| FR-028 | Pricing page communicating free vs. paid tiers | P0 |

### 6.5 Dashboard

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-029 | Land on dashboard after login: usage summary, recent activity, saved-caps indicator | P0 |
| FR-030 | Searchable/filterable/paginated history with illustrated empty states | P0 |
| FR-031 | Saved-topics list | P0 |
| FR-032 | Payments history page | P0 |
| FR-033 | Profile & settings pages (name/email, password, notifications, delete account) | P0 |
| FR-034 | Illustrated empty states throughout (no broken-looking blank screens) | P0 |

### 6.6 Design system & UX

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-035 | Restrained purple-accent system on a neutral base (80–90% neutral, 10–20% purple); purple for primary CTAs, active states, links, badges, selected tabs | P0 |
| FR-036 | Tailwind CSS utility-first styling with inline utilities (no heavy custom CSS layer) | P0 |
| FR-037 | Mobile-first responsive layout throughout | P0 |
| FR-038 | Consistent buttons/cards/empty themes with a small set of reusable design tokens | P0 |

## 7. Monetisation & pricing

| Tier | Topic generation | Chapter One | Chapters Two–Five |
| --- | --- | --- | --- |
| Free | ✅ capped (~3/day) | ✅ capped (~3/day) | ❌ |
| One-time per project | ✅ | ✅ | ✅ via Paystack unlock |

- Payment is a one-time, per-project Paystack purchase. Unlocking Chapters 2–5 on one project
  does **not** unlock another.
- Paywall is enforced server-side by entitlement record; the client paywall is UX only.
- Exact daily cap numbers and reset window are tracked as open questions (§13).

## 8. Non-functional requirements

### 8.1 Security

| ID | Requirement |
| --- | --- |
| NFR-SEC-001 | Passwords hashed (bcrypt); tokens in httpOnly cookies |
| NFR-SEC-002 | CORS locked to the client origin |
| NFR-SEC-003 | Paystack webhooks verified by signature; entitlement granted server-side only |
| NFR-SEC-004 | Server-side entitlement checks on every chapter endpoint (no client trust) |
| NFR-SEC-005 | n8n webhook endpoint authenticated (shared secret/header) so it can't be invoked by unauthenticated callers |
| NFR-SEC-006 | Auth endpoints rate-limited |

### 8.2 Performance & reliability

| ID | Requirement |
| --- | --- |
| NFR-PRF-001 | Topic generation < 10 s; Chapter One < 25 s (including Express ↔ n8n hop), with visible progress |
| NFR-PRF-002 | Generation success ≥ 95%; timeouts surface graceful, retryable errors |
| NFR-PRF-003 | Server boots resiliently if the database is unavailable (warns rather than crashes) so health endpoints remain reachable |

### 8.3 Compatibility

| ID | Requirement |
| --- | --- |
| NFR-COM-001 | Mobile-first; supported on modern evergreen browsers |
| NFR-COM-002 | Low-bandwidth-tolerant (progressive loading, no heavy media on landing) |

## 9. Architecture & integrations

### 9.1 Stack

React (Vite) + Node/Express + PostgreSQL/Prisma + JWT auth + Supabase for auth/tokens + Paystack
for payments + n8n for AI orchestration. Two independent projects: `client/` (SPA) + `server/` (API),
with documentation in `docs/`.

### 9.2 n8n orchestration

The generation workflow (prompt → LLM → parse response → persist result) is **orchestrated in
n8n**, not written as custom Express service code:

- Express receives the user's request (topic prompt or chapter request), validates it, checks
  entitlement/rate limits, then **calls an n8n webhook** with the prompt + context.
- The n8n workflow calls the LLM, parses/validates the model's output into the expected shape,
  and returns it to Express.
- Express persists `Topic`/`Chapter` rows and responds to the client.

This means: swapping AI providers, adjusting prompts, or adding a review/retry step later is a
workflow change in n8n, not a code deploy.

### 9.3 Repository layout

```
client/            # React SPA — standalone npm project
  src/pages/       # landing, auth, generate, dashboard, project, chapters
  src/components/  # navbar, footer, layouts, topic cards, payments, empty states, chat
  src/lib/         # api client, hooks, auth token, project profile, mock data
  package.json     # client dependencies and scripts
server/            # Express API — standalone npm project
  src/routes/      # auth, chat, topics, chapters, payments, user
  src/services/    # n8n client, mail, auth, google, paystack
  prisma/          # schema, migrations, seed
  package.json     # server dependencies and scripts
docs/              # PRD, README, backend build guide
n8n/               # workflow exports (generation workflow, versioned)
```

### 9.4 Data model (key entities)

- **User** — id, email, name, passwordHash, role, emailVerified, notificationsOn, timestamps.
- **Topic** — id, userId, prompt, inputType (TEXT/IMAGE), level?, discipline?, reply, saved.
- **Message** — id, topicId, role (USER/AI), content — every turn of the AI conversation is
  persisted per topic so the full history can be replayed/reopened.
- **Chapter** — id, topicId, chapterNumber (1–5), content, generatedAt.
- **Entitlement** — id, userId, topicId, unlockedChapters, source (one-time payment).
- **Payment** — id, userId, topicId, Paystack reference, amount, status, timestamps.
- **GenerationUsage** — id, userId, date, count (tracks daily free-tier cap).

### 9.5 Key API endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/chat` | Generate topics (calls n8n workflow), saves each message |
| GET | `/api/topics/:id/messages` | Retrieve the full saved conversation for a topic |
| POST | `/api/chapters/:topicId/one` | Generate Chapter One (free, capped, calls n8n) |
| POST | `/api/chapters/:topicId/:chapterNum` | Generate Chapter 2–5 (requires entitlement, calls n8n) |
| POST | `/api/payments/initiate` | Start Paystack checkout for a topic unlock |
| POST | `/api/payments/webhook` | Paystack webhook → grant entitlement |
| GET | `/api/payments/history` | List past payments |
| — | (auth, topics, user CRUD) | Standard endpoints |

## 10. Analytics & measurement

- Track: signup, topic generation (success/timeout/cap-hit), saved topics, Chapter One
  generation, payment initiation → success, project unlocks.
- KPI dashboard: activation (save ≥1 topic in 24h), conversion (paid unlock), generation success
  rate & latency, cap-usage share.
- Privacy: store only event-level product telemetry tied to the user id; no raw prompt content in
  analytics.

## 11. Roadmap & milestones

- **M0 — Foundation (in progress):** backend boot resilience, Supabase env wiring, full auth.
- **M1 — Core loop (beta):** topic generation + Chapter One (free), dashboard/history, project
  chapter view, empty-state polish, demo/preview mode, inline Tailwind design system.
- **M2 — Monetisation:** Paystack checkout, webhook + entitlement, payment history,
  charge/failure retry.
- **M3 — Hardening:** rate limiting tuning, timeout/retry UX, testing, deploy + monitoring.
- **M4 — Post-beta:** Google OAuth, chapter regeneration from conversation, image-tuning.

## 12. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| AI output quality/plagiarism risk | Medium | High | Clear disclaimers; student owns integrity; references as guidance; human review flags |
| Paystack webhook failures → paid user locked out | Low | High | Signature-verified webhook, retry, entitlement verified at read-time not just grant-time |
| Daily cap reset ambiguity frustrates users | Medium | Medium | Clear "X of 3 used today" messaging; server-side counters; document reset window (§13) |
| Generation latency over 25 s hurts retention | Medium | Medium | Progress UI, graceful timeout; tune n8n retry budget |
| Supabase/n8n credentials missing at deploy | Medium | High | Boot-resilient server; demo-mode client; deployment checklists |

## 13. Assumptions & open questions

- [ ] Exact free-tier daily cap number/reset window (placeholders currently ~3/day).
- [ ] Price for the one-time Chapter 2–5 unlock (flat vs. tiered).
- [ ] Is a Pro *subscription* also planned, or is per-project payment the only paid path?
- [ ] Does image upload apply to Chapter One generation too, or topics only?
- [ ] Does chapter generation support multi-turn refinement (full conversation) or store only
      final content?
- [ ] n8n hosting (self-hosted vs. cloud) and auth scheme for the Express → n8n webhook call.
- [ ] `PAYSTACK_SECRET_KEY`, Gemini credentials (held by n8n), DB connection string, deployment
      target — all TBD.

## 14. Release acceptance checklist (beta)

- [ ] Auth (email verification, reset, logout) verified against a live Supabase project.
- [ ] Topic generation via n8n returns 5–8 topics with scope; messages persisted; daily cap works.
- [ ] Chapter One free + capped; Chapters 2–5 locked server-side until entitlement granted.
- [ ] Paystack checkout → webhook → entitlement → chapters unlock (per project).
- [ ] Dashboard history/saved/payments/profile flows pass; empty states illustrated.
- [ ] `tsc --noEmit` clean + production build green.
- [ ] Security: no client-side entitlement trust; webhook signatures; httpOnly cookies.
