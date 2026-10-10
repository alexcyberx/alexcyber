# AlexCyberX — Architecture (as-is, 2026-10-09)

Written from the code and the live Supabase project, not from memory. Where something is a gap or
a guess it says so. Companion docs: `DB-SCHEMA.md`, `WEB-FLOW.md`, `AUDIT-2026-10-09.md`.

## 1. What it is
Cybersecurity learning + CTF platform: tutorials (courses/chapters), CTF "rooms" (labs with flags),
tools (AlexRecon, AlexUtils, AlexTrace, Cyber Mistake Analyzer), blog, resources, community forum,
leaderboard, profiles, admin panel. (AlexSync was removed on 2026-10-09.)

## 2. Stack
| Layer | Tech |
|-------|------|
| Frontend | Vanilla JS single-page app. One `index.html` holds all page shells (`#homePage`, `#ctfRoomPage`, ...); `js/router.js` shows/hides them and syncs the URL (History API). No build step. **Being migrated to Next.js page by page** (`web/`, see `docs/MIGRATION.md`); done so far: `/blog`, `/tutorials`, legal pages. |
| Backend | Node.js (>=18) + Express 4, `server/index.js`. Also serves the static frontend. |
| DB / Auth | Supabase (Postgres 17, RLS, RPC functions, pg_cron, pg_net, Supabase Auth). Project `alexcyberx-fresh`, region ap-northeast-1. |
| Lab data | sql.js (SQLite in memory/file) for the SQL-injection labs; in-memory objects for per-player lab "instances". |
| Email | Supabase Auth "Send Email" hook -> `server/routes/authEmailHook.js` -> Resend. |
| AI | Groq (OpenAI-compatible) via `server/ai/llm.js` for the AI lab, hints and search. |
| Hosting | Render (currently staging; custom domain planned). |

## 3. Request flow
```
Browser ── static files (/css /js /pages /components /diagrams, index.html) ──► Express
Browser ── supabase-js (anon key + user JWT) ─────────────► Supabase (RLS decides access)
Browser ── fetch('/api/...') + Authorization: Bearer <JWT> ► Express ──► (service-role) Supabase
```
- **Direct-to-Supabase** (most of the app): profiles, courses, blog, community, progress, leaderboard,
  admin panel. Security = RLS policies + SECURITY DEFINER RPCs.
- **Via Express** (`/api/*`): CTF lab backends, tools, AI. Express uses the **service-role key (bypasses RLS)**,
  so it MUST verify the caller itself — done by `requireAuth` in `server/middleware/toolAccess.js`.
  `js/page-scripts.js` wraps `fetch` to attach the Bearer token to every same-origin `/api/` call.

## 4. Express middleware order (`server/index.js`)
helmet (CSP) -> Permissions-Policy -> CORS -> `express.json` (keeps `req.rawBody` for the auth-email webhook)
-> urlencoded -> cookie-parser -> morgan -> `blockGate` (denies IPs in `blocked_ips`) -> `attackDetector`
(real-site routes only; labs excluded) -> admin-path blocklist -> static (whitelist: css, js, pages,
components, diagrams) -> routes -> SPA catch-all (clean URLs -> `index.html`) -> 404 -> error handler.
`trust proxy` = 1 (Render).

## 5. Server modules
| Path | Purpose |
|------|---------|
| `server/labs/<lab>/routes.js` | One router per CTF lab, mounted at `/api/lab/<name>` (list below). Per-player instance keyed by `X-Lab-Session` header (fallback `req.ip`). Cleanup job every 10 min for expired instances. |
| `server/ai/` | `llm.js` shared LLM client + global quotas; `hints.js` (`/api/lab/hint`), `search.js`, `adminSearch.js` (admin only, checks `profiles.role`). |
| `server/tools/alexrecon/` | Recon scanner (modules: dns, ssl, webrecon, assets/subdomains, tier2 wayback/commoncrawl/js/cloud/github, ports) + `scheduler.js` (in-process setInterval for scheduled scans). Domains only; IP scanning disabled in v1. Private/loopback targets blocked. |
| `server/tools/alextrace/` | OSINT footprint: username enumeration, Gravatar, HIBP breach list, EXIF metadata, password intel, risk scorer. |
| `server/tools/alexutils/` | MAC lookup, CVE lookup, IP/DNS utilities. |
| `server/tools/mistake-analyzer/` | Explains mistakes in pasted security commands (LLM). |
| `server/routes/authEmailHook.js` | Supabase Auth email hook -> Resend, signature verified with `standardwebhooks`. |
| `server/middleware/` | `attackDetection`, `rateLimit` (login 20/15min, flag 10/min, analyze 15/10min, recon 6/10min, trace 8/10min), `toolAccess` (requireAuth, checkToolEnabled, logToolUsage), `logger`. |
| `server/db/sqlite.js` | sql.js wrapper that mimics better-sqlite3 for lab databases. |
| `data/hidden.db` | SQLite file for the "hidden-sight" lab. |

### Lab routes (`/api/lab/...`)
web01 (SQLi), web02 (stored XSS), hidden (hidden-sight), cookie, sqli101, robots, packet, metadata,
loghunter, caesar, base64, deserialize, deserialize-medium, aichat-easy, plus hint / search / admin-search.

## 6. Auth model
- Login: Supabase Auth (email+password, Google OAuth, password reset). Session key `alexcyberx-auth`
  in localStorage (supabase-js).
- Roles: `profiles.role` = `user` | `admin`. Admin-only DB access is enforced by RLS/RPC checks, not by the
  hidden admin URL (`/panel-<hex>.html`, which is only obscurity).
- Protected pages (login required in the UI): ctf, profile, learn*, resources, alexrecon, mistakeAnalyzer,
  alexutils, alextrace. The UI gate is cosmetic — real enforcement is RLS and `requireAuth`.
- Admin tool switches: `tool_settings` (`checkToolEnabled`), usage in `tool_usage_logs`.

## 7. Scheduled jobs
| Job | Where | Status |
|-----|-------|--------|
| AlexRecon scheduled scans | in-process `scheduler.js` (setInterval) | Works only while the server is awake (Render free tier sleeps). |
| `alexcyberx-alexrecon-scheduler` (pg_cron, */15) | calls `trigger_due_alexrecon_scans()` -> POST `/api/tools/alexrecon/run-scheduled` | **Dead: that route does not exist.** Remove or implement. |
| `alexcyberx-scheduled-backup` (pg_cron, daily 03:00) | `run_scheduled_backup()` -> `admin_backup_snapshots` | Active (JSON snapshots in the DB, admin-only). |

## 8. Environment variables (Render)
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (required), `ALLOWED_ORIGIN`, `PORT`,
`RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `SEND_EMAIL_HOOK_SECRET`,
`GROQ_API_KEY` (or `AI_API_KEY` + `AI_BASE_URL`), `GEMINI_API_KEY`, `AI_MODEL_EASY`, `AI_MODEL_FALLBACK`,
`AI_GLOBAL_PER_MIN`, `AI_GLOBAL_PER_DAY`, lab flags `FLAG_*` (WEB01, WEB02, WEB06, WEB07, HIDDEN, COOKIE,
SQLI101, ROBOTS, PACKET, METADATA, LOGHUNTER, CAESAR, BASE64, AI_EASY). Names only — never commit values.
Note: labs have default flags hard-coded as fallbacks; set `FLAG_*` on Render for anything real.

## 9. Known gaps (as-is)
1. **Two kinds of labs.** Static pages in `pages/labs/` (web-06, web-07, for-03, cry-01, cry-02, ai-01) and
   server-rendered labs whose HTML is generated by the backend at `/api/lab/<name>/page?session=...`
   (web-01 hidden, web-02 cookie, web-03 sqli101, web-04 robots, for-01 packet, for-02 metadata;
   `hasLabFlow: true` in `js/ctf-challenges-data.js`). Both work.
2. Stale data: `ctf_challenges.lab_url` in the DB still points to `/pages/labs/lab-hidden.html` etc. for the
   server-rendered labs (those files don't exist and are not used — the frontend uses `labApiPath`), and
   `for-03` has `lab_url = NULL`. Harmless today, but confusing: set them to the real launch path or clear them.
   Also `server/labs/web01-sqli` and `web02-xss` are mounted but have no challenge row/page (unused legacy labs).
3. Dead cron job (see 7). 4. Lab/instance state and rate limits are in memory (lost on restart, not shared
   across instances). 5. No automated tests. 6. Schema/RLS SQL is not in the repo
   (only `supabase/migrations/2026-10-09_*`); export with `supabase db dump`.
7. Next.js migration in progress: `/blog`, `/tutorials` and the legal pages are served by `web/` (Next.js)
   through `server/middleware/nextProxy.js` when `NEXT_APP_URL` is set. Everything else is still the vanilla SPA.
   Details and the step plan: `docs/MIGRATION.md`.
