# Security checklist: AlexCyberX

Last verified: 2026-10-24 (labs on their own origin; 2026-10-23 admin panel phase 4; full audit 2026-10-16, commit `fffd15f`). **Read this before changing auth, labs, tools, Supabase SQL, the admin
panel, or anything that renders HTML.** `[x]` = in place (verified), `[ ]` = gap. Each gap: Severity → Evidence →
Risk → Location → Why it matters → Fix. Labels: CONFIRMED · WEAKNESS · MISSING · VERIFY · REC.

## Open findings, in fix order
1. **FIXED 2026-10-16** (was High · CONFIRMED) — reflected XSS in lab pages on the main origin. Fix: `server/middleware/labSession.js` rejects session ids not matching `^[A-Za-z0-9_-]{1,100}$` for all `/api/lab/*`, and the three pages escape `<` in the embedded JSON. Original finding:
   Evidence: `?session=` → `const LAB_SESSION = ${JSON.stringify(s)}` inside `<script>`; reproduced locally.
   Location: `server/labs/web02-cookie/routes.js:158`, `web03-sqli101/routes.js:189`, `web04-robots/routes.js:284`.
   Why: runs on the real site's origin, so it can read login tokens from `localStorage` (students and admin).
   Fix: encode for script context (`JSON.stringify(s).replace(/</g,'\\u003c')`) or, better, validate session ids
   (`/^[A-Za-z0-9_-]{8,64}$/`) at one place for all labs; long term serve labs from a separate origin.
2. **FIXED 2026-10-16** — admin MFA live: admin enrolled (1 verified TOTP factor); migration `2026-10-21_admin_mfa.sql` applied (59 restrictive policies + 10 admin RPCs guarded; verified: admin aal1 sees 0 security logs/messages, aal2 sees all, normal users unaffected). Panel asks for an authenticator code (TOTP enroll + verify, `js/admin-panel-app.js` `startMfa`), admin search requires `aal2` (`server/ai/adminSearch.js`);  Was: **High · MISSING — admin hardening**: no MFA on admin accounts (DB 2026-10-16: 1 admin, 0 verified MFA factors, no `aal2` policies); admin panel HTML public with client-only gate
   (`server/index.js:132`, `js/admin-panel-app.js:4869`). Fix: enable Supabase MFA (TOTP) and require AAL2 for admin
   RLS policies; serve the panel only after a server-side role check; move it to Next later.
3. **FIXED 2026-10-16** (linear `isValidEmail`, 254-char cap) — was Medium · CONFIRMED — ReDoS `server/tools/alextrace/modules/utils.js:38` (quadratic email regex, no length cap
   before it, `routes.js:92`). Fix: `if (email.length > 254) reject` before the regex; use a linear regex.
4. **PARTLY FIXED 2026-10-16** (session id format + `labInstanceLimiter` 40 per 10 min per IP on `instance/*`; no global cap yet) — was Medium · CONFIRMED weakness — unbounded lab state: any session id allocates memory (`web03-sqli101` builds a
   sql.js DB). `server/labs/*/routes.js`, cleanup `server/index.js:242,268`. Fix: validate session id format, cap
   instances per IP and globally, rate-limit `instance/*`.
5. **Medium · CONFIRMED sink — unsanitized DB chapter HTML** `web/src/components/ChapterView.tsx:157` (first render),
   `js/chapters.js:178`. Admin-only writers. Fix: run DB chapter HTML through the same sanitizer as translations (or
   DOMPurify) server-side in `web/src/lib/chapters.ts`.
6. **Medium · WEAKNESS — CSP allows `'unsafe-inline'` scripts** `server/index.js:22,26`. Fix: nonces/hashes for the
   few inline scripts (theme boot, lab pages), then drop `'unsafe-inline'`.
7. **Medium · WEAKNESS — plaintext flags and inputs in logs** `server/middleware/logger.js`, `data/logs/attempts.log`
   (no rotation), `data/hidden.db`. Fix: log `sha256(input).slice(0,12)` + result instead of the text; rotate/size-cap.
8. **Medium · WEAKNESS — public profile columns** `profiles` SELECT for anon includes `role`, `is_banned`,
   `last_seen`. Fix: column-level SELECT grant for public columns only, or a public view.
9. **Low/Medium · MISSING — Supabase leaked-password protection disabled** (advisor). Fix: enable in Auth settings.
10. **Low · WEAKNESS — Gemini key in URL** `server/tools/mistake-analyzer/routes.js:55`. Fix: `x-goog-api-key` header.
11. **Low · WEAKNESS — anon-callable `blog_publish_due_posts`; mutable `search_path` on 3 blog functions; `pg_net`
    in `public`** (advisor). Fix: revoke EXECUTE from anon/authenticated (run it from cron), `SET search_path`.
12. **Low · WEAKNESS — public `resources` bucket** while the table is login-only. Size/MIME limit: FIXED by
    migration 2026-10-22, verified live 2026-10-22 (pdf, text/plain, octet-stream, png, jpeg, webp; 50 MB). Still open: private
    bucket + signed URLs from a server/RPC check.
13. **Low · MISSING — SRI on jsDelivr scripts** `index.html:2107-2108`, panel page. Fix: add `integrity` + `crossorigin`.
14. **Low · WEAKNESS — webhook replay window** `server/routes/authEmailHook.js` (no webhook-id cache). Fix: remember
    ids for 10 min.
15. **Low · WEAKNESS — dead/orphan code**: `js/ctf-sync.js:123-200` `_saveSolveToDb` (blocked by RLS), `pages/ctf-room.html`
    (raw `full_name` in HTML). Fix: delete.
16. **Low · WEAKNESS — in-memory rate limits/quotas** (`server/middleware/rateLimit.js`, `server/ai/llm.js:36-55`)
    reset on every restart. Fix when moving to paid hosting: shared store (Redis/Postgres).
17. **VERIFY** — Supabase Auth "allow new signups" matches the site's registration toggle (UI-only today).
18. **VERIFY** — paid hints: `ctf_challenges.hints` is anon-readable; before adding XP-cost hints, hide the column.

## Authentication
- [x] Supabase Auth (email+password, Google OAuth, reset); server verifies JWT with `auth.getUser` (`server/middleware/toolAccess.js`).
- [x] Ban check on tool APIs (`isUserBanned`, 60 s cache); 30-minute idle sign-out (`web/src/lib/auth-context.tsx:186-203`).
- [x] Safe post-login redirects (`safeNextPath`).
- [x] MFA for admins (aal2 required for admin data and RPCs). [ ] Leaked-password protection (#9). [ ] Server-side registration toggle (#17).

## Authorization / RBAC
- [x] RLS on all public tables; admin writes need `profiles.role='admin'` policies; privileged profile columns guarded by trigger.
- [x] Lab solves recorded only by service role (`record_lab_ctf_solve`); flag check server-side (`submit_ctf_flag`, `/api/lab/flag`).
- [x] Labs on their own origin: live 2026-10-24 (`alexcyber-labs.onrender.com`, `server/labs-server.js`, no DB key, `noopener` tabs, shared `FLAG_SECRET` checked on start; `docs/LABS.md`).
- [x] Admin RPCs check `acx_is_admin`; `admin-search` checks staff role server-side.
- [ ] Admin panel page gated server-side (#2). [ ] `admin-search` ban check / role cache 5 min (low).
- Rule: any new table → RLS on + policies in a migration in `supabase/migrations/`; any new RPC → `SECURITY DEFINER`
  only with `SET search_path` and an explicit `auth.uid()`/admin check; revoke EXECUTE from `anon` when not needed.

## Session / token security
- [x] Tokens never logged; logout wipes app keys (`clearUserStorage`).
- [ ] Tokens live in `localStorage` → any XSS on the origin steals them (#1, #5, #6). Labs share the origin (MISSING isolation).

## Input validation
- [x] Tools: length/format checks, record-type whitelist, user id taken from token.
- [ ] Lab session ids unvalidated (#1, #4). [ ] AlexTrace email length (#3). [ ] CVE query length (low).

## Injection
- [x] No `eval`/`new Function`; `child_process` only with fixed args; no user paths in `sendFile`.
- [x] Supabase calls parameterised (PostgREST/RPC).
- Intended only: SQLi in web-03 (in-memory per-session sql.js DB, never the real DB).

## XSS / CSRF
- [x] Blog body, community, profiles, leaderboard, admin tables escaped.
- [ ] #1 (reflected), #5 (stored, admin-only), #6 (CSP), SPA `onclick` interpolation in `js/blog.js`, `js/resources.js`,
  `js/courses.js` (admin data, low).
- [x] CSRF: APIs use Bearer tokens (no cookie auth), CORS without credentials → classic CSRF not applicable.
- REC: set `ALLOWED_ORIGIN` on Render to the real site origin instead of `*`.

## API security
- [x] Generic error responses; `dotfiles:'deny'`; whitelist static dirs; body limit 100 kb (default).
- [ ] `/api/lab/admin-search` sits under `/api/lab/` and is skipped by attack detection (move to `/api/admin/`).

## Rate limiting / abuse
- [x] Login 20/15 min, flags 10/min/IP, DB flag attempts 5/60 s/user, tool limiters, AI quotas, auto IP block (attack detection).
- [ ] Unlimited: lab `instance/*`, `sqli101/search`, `alextrace/breach-search`, alexrecon history/schedules (#4).
- [ ] Limits are in memory (#16). AI `/health` bypasses quota (low).

## File uploads
- [x] AlexTrace: multer memory, 15 MB, image MIME only, not stored.
- [ ] Storage bucket `resources`: public (#12). Size/MIME limits set (verified live 2026-10-22: 6 types, 50 MB).
- [x] `track_chapter_view` XP farming with made-up slugs / hidden chapters / hidden courses / banned users / races: fixed (migration 2026-10-22, verified live).

## Database security
- [x] RLS everywhere, flags stored as sha256 only, `flag`/`flag_hash` not readable by anon/authenticated, backups exclude them.
- [ ] Least-privilege grants (#11), `search_path` fixes (#11), public profile columns (#8).
- Rule: DB changes only via a file in `supabase/migrations/` applied to project `rwjwjltlfkxadywfqxbs`; run the
  Supabase security advisor after every migration.

## Secrets
- See `secrets.md`. [x] No secrets in repo/history except the public anon key. [ ] Set a dedicated `FLAG_SECRET` (REC).

## Encryption
- [x] HTTPS by Render/Supabase; flags hashed (sha256 of high-entropy values); webhook HMAC.
- No custom crypto beyond `server/labs/flags.js` (HMAC-SHA256). Do not add any.

## CORS
- [ ] `ALLOWED_ORIGIN` defaults to `*` (`server/index.js:42`) — set it on Render (REC). Methods GET/POST only (PATCH/DELETE
  tool routes rely on same-origin).

## Dependency security
- [x] Lockfiles committed; pinned versions in `web/`.
- [ ] No `npm audit`/Dependabot (#MISSING). [ ] SRI for CDN scripts (#13).

## Logging / monitoring
- [x] `security_logs` with sensitive fields redacted; auto-block events logged.
- [ ] Plaintext flags/inputs in `attempts.log` (#7); full URLs in morgan; no alerting on security events (MISSING).

## Admin security
- [x] MFA (aal2) for admin data, writes and RPCs (#2). [ ] Server-side panel gate (the page is public; data is not).
- [x] Admin actions logged via `log_admin_event`, with `actor_id` = the admin (2026-10-23); the new panel sends no IP (a browser IP proves nothing).
- [x] Old panel deleted 2026-10-23 (no second admin UI to keep patched). `/api/lab/admin-search` has no caller now: remove it or wire it in.
- [x] Admin-only reads with no per-user exposure where a count is enough: AlexTrace (`admin_alextrace_counts`), XP totals (`admin_xp_summary`).

## Deployment / infrastructure
- [x] Single Express entry, Next bound to localhost, `trust proxy 1`.
- [ ] `NODE_ENV` unused; no startup check for required env (REC). Render/Supabase/GitHub owner accounts: MFA (VERIFY).

## Data privacy
- [x] `last_login_ip` hidden from public; contact form via RPC.
- [ ] Public profile columns (#8); no retention policy for logs/IPs; no self-service account deletion (MISSING);
  third-party translation sends lesson text (not personal data) to Google.

## Error handling
- [x] Generic 500, stacks only in server logs, `uncaughtException` logged. Lab endpoints may return error text by design.

## Backup / recovery
- [x] `run_backup_snapshot` (service role) excludes `flag`, `flag_hash`, `last_login_ip`; 2 pg_cron jobs.
- [x] Panel reads the snapshot list without the data column; a download goes through `admin_get_backup` (admin + aal2, logged); delete keeps the newest good snapshot; old scheduled snapshots are cleaned up after 30 days (newest 7 kept) (2026-10-23).
- [ ] Snapshots are stored in the same database (`admin_backup_snapshots`) — not a real off-site backup (VERIFY Supabase
  plan backups / PITR). [ ] No documented restore test.

## Rules for AI agents working on this repo (keep these green)
1. Never output, commit, or log a secret or a CTF flag; flags only via `flagFor()`.
2. Anything that writes user/DB/URL data into HTML must escape it (or use `textContent`/React text). Inside `<script>`
   use JSON with `<` escaped. Never add `dangerouslySetInnerHTML` for DB/user data without a sanitizer.
3. New routes: decide auth + rate limit + input validation explicitly; tool routes go behind `requireToolLogin`.
4. Never trust the browser for roles, XP, solves, bans or flags; the server/DB decides.
5. Any SQL change = migration file + RLS/grants review + Supabase security advisor run.
6. Labs may be vulnerable only inside the lab's own sandbox (in-memory data, fake accounts); no lab may reflect input
   into the main site's pages or touch real tables except through `recordSolve.js`. New labs go in `server/labs/mount.js`,
   run on the labs server (`docs/LABS.md`), and must work without a database key or login token.
7. Update this folder when a finding is fixed or a new surface is added (bump "Last verified").
