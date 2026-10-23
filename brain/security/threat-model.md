# Threat model: AlexCyberX

Last verified against the code: 2026-10-23 (admin panel section; full pass 2026-10-16, commit `fffd15f`), Supabase project `rwjwjltlfkxadywfqxbs`.
Re-verify when a section below names a file you change. Labels used everywhere in this folder:
**CONFIRMED** (reproduced or proven from code/DB) · **WEAKNESS** (works, but weaker than it should be) ·
**MISSING** (control does not exist) · **VERIFY** (possible risk, not proven) · **REC** (recommendation).

> The CTF labs under `server/labs/` are vulnerable **on purpose** (SQLi in web-03, cookie tampering in web-02, prompt
> injection in ai-01, etc.). That is the product. A lab bug only counts as a real issue when it escapes the lab:
> runs on the main origin against real users, touches real data, or hurts availability.

## 1. System in one paragraph
One Express service (`server/index.js`) is the public entry point on Render. It serves the old SPA (`index.html`,
`js/*`), the admin panel HTML, the CTF lab APIs (`/api/lab/*`) and the tools APIs (`/api/alexrecon`, `/api/alexutils`,
`/api/alextrace`, `/api/tools`), and proxies most pages to an embedded Next.js server (`web/`, `server/nextEmbedded.js`,
`server/middleware/nextProxy.js`). Data and auth live in Supabase (Postgres + RLS + Auth + Storage). The browser talks
to Supabase directly with the public anon key; the server uses the service-role key for privileged work.

## 2. Assets
| Asset | Where | Why it matters |
|---|---|---|
| Supabase service-role key | Render env `SUPABASE_SERVICE_ROLE_KEY` | Bypasses all RLS: full DB read/write, auth admin |
| CTF flag secret | Render env `FLAG_SECRET`, else the service-role key (`server/labs/flags.js:30`) | Anyone with it can compute every flag |
| Other API keys | Render env: `RESEND_API_KEY`, `SEND_EMAIL_HOOK_SECRET`, `GROQ_API_KEY`/`AI_API_KEY`, `GEMINI_API_KEY` | Email sending, AI quota/cost |
| User accounts + sessions | Supabase Auth; browser `localStorage` key `alexcyberx-auth`, admin `alexcyberx-admin-auth` | Account takeover, admin takeover |
| Admin role | `profiles.role = 'admin'` | Full content/user control through RLS admin policies |
| User data (PII) | `profiles` (name, username, bio, `last_login_ip`), `contact_messages`, `security_logs`, tool history tables | Privacy (Indian students, possibly minors) |
| Scoreboard integrity | `profiles.xp/level/ctf_solves`, `ctf_solves`, `ctf_challenges.flag_hash` | Fair leaderboard is the core of the CTF product |
| Content | `content_chapters`, `courses`, `blog_posts`, `resources` + Storage bucket `resources` | Defacement, stored XSS |
| Availability | single Render free instance, in-memory state | Labs/tools/rate limits are per process |

## 3. Actors
- **Anonymous visitor**: anyone on the internet; can call every unauthenticated route and every anon-executable RPC.
- **Logged-in student**: has a Supabase JWT; can call tool APIs and authenticated RPCs.
- **CTF player trying to cheat**: wants XP without solving (flag sharing, replay, client tampering).
- **Malicious student**: plants content (community posts, profile name) or abuses tools (SSRF, DoS, scanning others).
- **Admin / moderator**: trusted; but an admin session is the most valuable target.
- **Attacker with repo access**: the GitHub repo is **public**, so everyone has full source.
- **Third parties**: Supabase, Render, Resend, Groq, Google Gemini/Translate/Fonts, jsDelivr, ipapi, NVD, HIBP, macvendors.

## 4. Trust boundaries
1. Browser ⇄ Express (`server/index.js`): helmet + CSP + CORS + attack detection + rate limits.
2. Browser ⇄ Supabase directly (anon key): **RLS is the only gate** for table writes, including every admin write
   from the admin panel.
3. Express ⇄ Supabase with service role: bypasses RLS; must check identity/role itself.
4. Express ⇄ embedded Next (`127.0.0.1:3101`), Next ⇄ Supabase with anon key (server-side reads, ISR cache).
5. Express ⇄ the internet (AlexRecon/AlexUtils/AlexTrace outbound fetches) — SSRF boundary.
6. Express ⇄ LLM providers — prompt-injection boundary.
7. Supabase Auth ⇄ Express webhook `/auth/email-hook` (signed).
8. Lab code ⇄ main origin: labs run on the **same origin** as the real site (shared `localStorage`).

## 5. Entry points (details in `attack-surface.md`)
Static/SPA pages, Next pages, `/api/lab/*` (unauthenticated), `/api/tools/*` + `/api/alex*` (login), `/api/me/seen`,
`/auth/email-hook`, the admin panel page, Supabase REST/RPC (`/rest/v1/*`), Supabase Storage public URLs.

## 6. Threats and scenarios
Severity = impact × likelihood (Critical / High / Medium / Low).

### T1. Session theft through reflected XSS in lab pages on the main origin — **FIXED 2026-10-16** (was High · CONFIRMED; see `server/middleware/labSession.js`)
- Evidence: `server/labs/web02-cookie/routes.js:158`, `web03-sqli101/routes.js:189`, `web04-robots/routes.js:284`
  write `?session=` into an inline `<script>` with `JSON.stringify`, which does not escape `</script>`. Reproduced
  locally 2026-10-16: `POST /api/lab/cookie/instance/restart?session=<payload>` then
  `GET /api/lab/cookie/page?session=<payload>` returns the injected `<script>` (no login needed).
- Scenario: attacker sends a student or the admin a link; the script runs on the real origin, reads
  `localStorage['alexcyberx-auth']` / `alexcyberx-admin-auth` and sends the tokens out.
- Existing mitigations: CSP exists but allows `'unsafe-inline'` scripts (`server/index.js:22,26`); `/api/lab/` is
  excluded from attack detection (`server/middleware/attackDetection.js:55-58`).
- Missing: output encoding for script context; labs on a separate origin; CSP without `'unsafe-inline'`.
- Impact: account takeover, admin takeover → full content/user control. Likelihood: medium (needs a click).

### T2. Admin takeover in general — **High impact · mitigated by RLS**
- The admin panel (`/panel-1b47c1ab561e`, Next; the old `.html` was deleted 2026-10-23 and redirects) is served
  without auth and its path is public (repo is public). The role + aal2 check runs in the browser
  (`web/src/admin/AdminApp.tsx`), all admin writes go to Supabase with the admin's JWT (RLS + aal2 policies).
- Existing mitigations (verified in DB): RLS admin policies on every admin-written table; `profiles` trigger
  `protect_profile_privileged_columns` blocks non-admins from changing `role/xp/level/ctf_solves/is_banned`; insert
  policy forces `role='user'`; admin RPCs check `acx_is_admin`.
- Since 2026-10-16 admin data, writes and RPCs need the two-step login (aal2). **MISSING**: server-side gate for the panel page; admin session isolation from lab XSS (T1).
- Impact critical, likelihood low today (requires stealing an admin session or password).

### T3. Stored XSS through DB content — **Medium · CONFIRMED sink, admin-only writers**
- `content_chapters.content` is rendered unsanitized: Next `web/src/components/ChapterView.tsx:157` (first render of
  DB chapters, `web/src/lib/chapters.ts:205-213`) and SPA `js/chapters.js:178`.
- Only admins can write the table (RLS), so the risk is a compromised admin or a pasted malicious snippet.
- Blog bodies are escaped (`web/src/lib/blog.ts:81-130`). SPA `js/blog.js:61,87,93,156`, `js/resources.js:56,82,84`,
  `js/courses.js:148-149` put admin-controlled fields into `onclick`/HTML without full escaping (WEAKNESS).

### T4. CTF cheating — **Medium · largely mitigated**
- Flags are derived from a server secret (`server/labs/flags.js`), DB keeps only sha256 in `flag_hash` (migration
  `supabase/migrations/2026-10-20_ctf_flag_hashes.sql`, applied 2026-10-16), anon cannot read `flag`/`flag_hash`.
- `submit_ctf_flag` rate-limits wrong attempts (5/60 s per user per challenge) and locks per user/challenge.
- Lab-flow solves are recorded server-side only (`server/labs/recordSolve.js`, `record_lab_ctf_solve` executable only
  by service_role).
- WEAKNESS: flags are the same for every player, so flag sharing works (no per-user flags).
- WEAKNESS: `ctf_challenges.hints` is readable by anon although `unlock_ctf_hint` charges XP for hints; today every
  hint has cost 0, so no live impact (VERIFY when paid hints are added).
- WEAKNESS: dead client function `_saveSolveToDb` (`js/ctf-sync.js:123-200`); blocked by RLS (no insert policy on
  `ctf_solves`) and the profile trigger, but should be removed.

### T5. Denial of service on the single instance — **Medium · CONFIRMED pieces**
- Regex DoS: `server/tools/alextrace/modules/utils.js:38` email regex is quadratic; input length is not limited
  before it (`server/tools/alextrace/routes.js:92`). Login required, 8 req/10 min.
- Unbounded in-memory lab instances: any `?session=` string creates state; `web03-sqli101` builds a full sql.js DB per
  session (`server/labs/web03-sqli101/routes.js:41-47,89-92`), no rate limit, cleanup every 10 min
  (`server/index.js:242,268`).
- `hidden-sight` rewrites `data/hidden.db` synchronously on every submit (`server/db/sqlite.js:77`).
- All rate limits are in memory (`server/middleware/rateLimit.js`), reset on restart, per instance.

### T6. SSRF through the security tools — **Low · well mitigated**
- AlexRecon/AlexUtils resolve DNS, block private/reserved ranges, pin the connection to the checked IP and re-check
  redirects (`server/tools/alexrecon/modules/utils.js:153-272,380`, `server/tools/alexutils/target.js:47-105`).
- WEAKNESS: `assertPublicDomain` fails open on DNS errors (later per-connection checks still apply).
- Fixed-host fetches (NVD, ipapi, HIBP, platforms) follow redirects without the SSRF guard (low: fixed hosts).

### T7. Abuse of AI features (cost, prompt injection) — **Low/Medium**
- Site-wide AI quota is in memory (`server/ai/llm.js:36-55`); `/api/lab/aichat-easy/health` calls the provider
  outside the quota (cached 60 s). Per-session caps can be reset with a new session id (`ai01`, hints).
- Gemini key is sent in the URL query (`server/tools/mistake-analyzer/routes.js:55`) — leaks into any proxy/log that
  records URLs (WEAKNESS).

### T8. Secret leakage — see `secrets.md`. Current state: no live secret in the repo or git history (only the public
anon key). WEAKNESS: the service-role key doubles as the flag secret when `FLAG_SECRET` is unset.

### T9. Privacy — **Medium**
- `profiles` is world-readable (all columns except `last_login_ip`), including `is_banned`, `role`, `last_seen`.
- Logs keep every submitted flag, lab inputs and admin search queries in plaintext (`server/middleware/logger.js`,
  `data/logs/attempts.log`, no rotation); Morgan logs full URLs with query strings.
- MISSING: data retention rules, account deletion flow for users, age/consent handling beyond the signup checkbox.

### T10. Supply chain — **Low/Medium**
- jsDelivr scripts (`supabase-js`, `jspdf`) load without SRI (`index.html:2107-2108`, panel page). CSP allows all of
  `cdn.jsdelivr.net`.
- Lockfiles exist; no automated dependency audit in CI (MISSING).

## 7. Risk summary (fix order)
| # | Threat | Severity | Status |
|---|---|---|---|
| T1 | Reflected XSS in lab pages on main origin → token theft | High | FIXED 2026-10-16 |
| T2 | Admin takeover (no MFA, client-gated panel) | High impact | WEAKNESS / MISSING |
| T5 | ReDoS + unbounded lab state | Medium | ReDoS fixed; lab state rate-limited (no global cap) |
| T3 | Stored XSS via admin-written content | Medium | CONFIRMED sink |
| T9 | Public profile columns, plaintext logs | Medium | WEAKNESS |
| T4 | Flag sharing, public hints column | Medium/Low | WEAKNESS |
| T7 | AI quota/key handling | Low/Medium | WEAKNESS |
| T10 | No SRI, no dep audit | Low/Medium | MISSING |
| T6 | SSRF | Low | mitigated |
