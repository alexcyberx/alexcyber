# Attack surface: AlexCyberX

Last verified: 2026-10-16 (commit `fffd15f`). Labels: CONFIRMED · WEAKNESS · MISSING · VERIFY · REC (see
`threat-model.md`). "IP" limits use `req.ip` (correct: `app.set('trust proxy', 1)`, `server/index.js:13`).

## 1. Network / deployment exposure
- Render web service `alexcyber`, one instance, free tier (sleeps, restarts often). Public URL `alexcyber.onrender.com`;
  final paid domain planned. No `render.yaml`/Dockerfile in repo; start = `node server/index.js`; `postinstall`
  builds `web/` when `RENDER=true` (`scripts/build-web.js`).
- Embedded Next listens on `127.0.0.1:3101` only (`server/nextEmbedded.js`), reached through the Express proxy.
- Global middleware order (`server/index.js`): trust proxy → helmet/CSP (18-34) → Permissions-Policy → CORS (41-45:
  origin `ALLOWED_ORIGIN || '*'`, GET/POST, no credentials) → `express.json` (100 kb default, keeps `rawBody`) →
  urlencoded → cookieParser → morgan → `blockGate` → `attackDetector` (skips `/api/lab/`, `/pages/labs/`) → old admin
  paths 404 → Next embed/proxy → static (`css js pages components diagrams brand`, `dotfiles:'deny'`) → routes →
  Next 404 page / JSON 404 → error handler (generic message).
- CSP: `script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://*.googleapis.com`, `script-src-attr
  'unsafe-inline'`, `connect-src` Supabase + Google + MyMemory, `img-src https:`, `frame-ancestors 'self'`.
  WEAKNESS: `'unsafe-inline'` makes any HTML injection executable (see T1). Next responses get Express's CSP
  (`nextProxy.js:139` drops Next's own).

## 2. Public (unauthenticated) endpoints
| Route | File | Notes |
|---|---|---|
| SPA + static files, `/robots.txt`, `/sitemap.xml`, icons | `server/index.js:111-207` | whitelist dirs only |
| `/js/flags.js` | `server/index.js:111` | list of Next pages (not CTF flags) |
| `/.well-known/security.txt` | `server/index.js:105` | builds URL from `Host` when site URL env unset (low) |
| `/api/ctf/disabled` (GET) | `server/index.js:183` | in-memory list |
| Next pages: `/`, `/blog*`, `/tutorials*`, `/rooms`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/opengraph-image`, `/tools*`, `/resources`, `/community*`, `/leaderboard`, `/profile`, `/u/*`, legal pages, `/search-index.json` | `server/middleware/nextProxy.js:16-51` | GET/HEAD only; ISR caches public data only |
| **Admin panel HTML** `/panel-1b47c1ab561e.html` + `/js/admin-panel-app.js` | `server/index.js:132` | WEAKNESS: no server auth; path is public in the repo |
| **New admin panel** `/panel-1b47c1ab561e` (Next, being ported: `docs/ADMIN-PORT.md`) | `web/src/app/(admin)/`, `web/src/admin/` | client-only page, `noindex`; same gate as the old one (role + aal2 in the browser, RLS/aal2 in the DB); all DB text rendered by React (no innerHTML); no browser IP in admin logs |
| `/auth/email-hook` (POST) | `server/routes/authEmailHook.js:118` | signed (standardwebhooks, ±5 min); WEAKNESS: no replay cache by webhook id |
| **All CTF labs** `/api/lab/{hidden,cookie,sqli101,robots,packet,metadata,caesar,base64,deserialize,deserialize-medium,aichat-easy}` | `server/index.js:139-149`, `server/labs/*/routes.js` | no login; session = `X-Lab-Session` header → `?session=` → IP; state in memory, no cap |
| `/api/lab/hint` (AI hints) | `server/ai/hints.js:142` | 4/min, 40/h per IP |
| `/api/lab/search` (AI site search) | `server/ai/search.js:138` | cache served before limiter; 6/min, 60/h |

### Lab-specific notes (beyond the intended vulnerabilities)
- **FIXED 2026-10-16** (session guard `server/middleware/labSession.js`): `?session=` was reflected into inline script — `web02-cookie/routes.js:158`,
  `web03-sqli101/routes.js:189`, `web04-robots/routes.js:284` (see T1).
- WEAKNESS: cookie values echoed unescaped in web-02 dashboard (`web02-cookie/routes.js:291,297,303,311`) — self-XSS
  unless cookies can be planted.
- WEAKNESS: `/api/lab/sqli101/search` has no limiter and returns DB error text (intended for the lab) — the DB is a
  per-session in-memory sql.js, not real data.
- WEAKNESS: `instance/status|restart` have no limiter; every new session id allocates memory (sql.js DB in web-03).
- WEAKNESS: robots `/submit` has no type check (`web04-robots/routes.js:341-342`) → generic 500 on non-string.
- Intended: SQLi (web-03), cookie tampering (web-02), hidden data (web-01), robots.txt (web-04), regex "deserialize"
  (web-06/07), flag inside the AI system prompt (ai-01).

## 3. Authenticated endpoints (Supabase JWT, verified server-side)
| Route | File | Limits | Notes |
|---|---|---|---|
| `GET /rooms/details` (Next) | `web/src/app/rooms/details/route.ts` | — | room scenario + hints; Bearer token checked with `auth.getUser`; `no-store`, `noindex`. The `/rooms` HTML ships only the card texts |
| `POST /api/admin/invite`, `POST /api/admin/users/:id/delete` | `server/routes/admin.js` | 60/h per IP | admin role read fresh (no cache), not banned, token must be **aal2**; service role invites (`inviteUserByEmail`) / deletes the auth user (profile + data cascade); admins and self cannot be deleted; logged to `security_logs` |
| `POST /api/me/seen` | `server/routes/me.js:16` | 20/10 min/IP | service role writes `profiles.last_login_ip` |
| `POST /api/tools/analyze-command` | `server/tools/mistake-analyzer/routes.js:143` | 60/10 min/IP pre-auth, 15/10 min/user, 150/10 min global | ≤500 chars → Gemini (key in URL, WEAKNESS) |
| `/api/alexutils/*` (ssl-check, mac-lookup, cve-search, ip-lookup, dns-resolve) | `server/tools/alexutils/routes.js:35-136` | per-user limiters | SSRF checks in `target.js`; cve query length unbounded (low) |
| `/api/alexrecon/*` (scan, history, scan/:id, schedules CRUD) | `server/tools/alexrecon/routes.js:46-450` | `reconLimiter` 6/10 min **per IP**; history/schedules unlimited | user id from token overrides body/query (`toolAccess.js:99-100`); max 2 running scans, 10 queued |
| `/api/alextrace/*` (lookup, metadata upload, password-check, breach-search, history) | `server/tools/alextrace/routes.js:77-232` | per-user limiters; **breach-search none** | ReDoS in email regex fixed 2026-10-16 (`modules/utils.js` `isValidEmail`); multer 15 MB image-only, in memory |
| `/api/lab/admin-search` | `server/ai/adminSearch.js:124-195` | 20/min, 300/h | staff check server-side (role cached 5 min, ban not checked — WEAKNESS); under `/api/lab/` so attack detection skips it |

## 4. Authentication / authorization surfaces
- Supabase Auth: email+password, Google OAuth, reset; client in `web/src/lib/supabase.ts`, `js/config.js`
  (`detectSessionInUrl: true`). Session in `localStorage` (or `sessionStorage` when "remember me" is off).
- Server checks: `requireAuth` / `requireToolLogin` → `auth.getUser(token)` + `isUserBanned` (60 s cache)
  (`server/middleware/toolAccess.js`).
- Redirect after login: `safeNextPath` (`web/src/lib/auth-context.tsx:37-40`), SPA `router.js:789` — no open redirect found.
- Client-only checks (not security boundaries): admin panel gate, maintenance mode, registration toggle, ban sign-out
  (`js/admin-panel-app.js:4869`, `js/config.js:46-77`, `web/src/components/SiteRuntime.tsx:40-55`,
  `AuthModals.tsx:162-166`). WEAKNESS: registration "off" is enforced only in the UI (VERIFY: Supabase Auth
  "allow new users" setting).
- Supabase leaked-password protection: **disabled** (Supabase advisor, MISSING).

## 5. Database access (Supabase, verified 2026-10-16)
- RLS enabled on every public table. `ctf_challenges_public` is a `security_invoker` view (anon writes fail).
- Browser writes directly: `profiles`, `community_threads/replies/reports/votes`, admin writes to `courses`,
  `content_chapters`, `blog_posts`, `blog_categories`, `resources`, `ctf_challenges`, `contact_messages`,
  `tool_settings`, `platform_settings`, `app_config` — all behind RLS admin policies.
- `profiles`: public SELECT (all columns except `last_login_ip`); privileged columns protected by trigger
  `protect_profile_privileged_columns`; insert policy forces defaults.
- RPC surface (anon/authenticated EXECUTE): `submit_ctf_flag`, `unlock_ctf_hint`, `vote_thread/reply`,
  `submit_contact_message`, `track_page_view` (×2), `track_chapter_view`, `get_*` read RPCs, `award_daily_login_xp`,
  admin RPCs that check `acx_is_admin` (`save_site_settings`, `send_broadcast`, `block_ip`, `unblock_ip`,
  `trigger_manual_backup`, ...). Service-role only: `record_lab_ctf_solve`, `run_backup_snapshot`, schedulers.
- WEAKNESS: `blog_publish_due_posts()` is anon-executable without an admin check (only publishes posts already due,
  low impact) and, with `blog_increment_views`, `blog_set_updated_at`, has a mutable `search_path` (advisor).
- WEAKNESS: anon/authenticated hold broad table grants (incl. TRUNCATE) on most tables; PostgREST cannot TRUNCATE
  and RLS limits row access, but grants should be least-privilege (REC).
- WEAKNESS: `pg_net` extension in `public` schema (advisor).
- `ctf_challenges.hints` anon-readable while `unlock_ctf_hint` charges XP (all costs 0 today, VERIFY later).

## 6. Storage
- Bucket `resources`: **public**, no size limit, no MIME whitelist; upload/update/delete only for admins (storage
  policies). WEAKNESS: files are downloadable without login if the URL is known, while the `resources` table is
  login-only; no type/size checks (admin-only upload limits the risk).

## 7. User inputs that reach HTML or the DB
- Community threads/replies/reports (escaped in renderers: `js/community.js`, Next components), profile
  name/username/bio (escaped in `profile.js`, `leaderboard.js`, Next), contact form (RPC with limits),
  blog/chapters/courses/resources (admin input; see T3 for unescaped sinks), AI questions (sent to LLM),
  tool targets (validated), uploaded images (AlexTrace, memory only).
- Orphan page `pages/ctf-room.html` renders `profiles.full_name` raw (`:727`) — not linked anywhere, but served under
  `/pages/` (REC: delete it).

## 8. Webhooks
- Only `/auth/email-hook` (Supabase Auth → Resend). Signature verified, fails closed without secret.

## 9. Third-party integrations
Supabase (DB/Auth/Storage), Render, Resend (email), Groq/OpenAI-compatible (AI labs, hints, search), Google Gemini
(Mistake Analyzer), Google Translate free endpoint (chapter/CTF translation, sends lesson text), Google Fonts,
jsDelivr (supabase-js, jspdf — **no SRI**), MyMemory, ipapi.co, NVD, HIBP, macvendors, Gravatar/GitHub and social
platform URLs (AlexTrace), `api.ipify.org` (admin panel IP display; client-controlled value is logged).

## 10. Admin surfaces
- Admin panel page (public HTML, client gate, writes via RLS) — see §2, §5.
- `/api/lab/admin-search` (server staff check).
- Supabase dashboard / Render dashboard (owner accounts — protect with MFA, MISSING/VERIFY).

## 11. Dependencies
Root: express 4.22.3, helmet 7.2.0, cors 2.8.6, multer 2.4.0, express-rate-limit 7.5.1, sql.js 1.14.1,
resend 4.8.0, standardwebhooks 1.1.1, ipaddr.js 1.9.1, exifr 7.1.3, @supabase/supabase-js 2.110.3.
web/: next 16.3.8, react 19.3.0, @supabase/supabase-js 2.117.1. Lockfiles committed. MISSING: `npm audit` /
Dependabot in CI.
