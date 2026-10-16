# Security rules: AlexCyberX

Last verified: 2026-10-16 (commit `fffd15f`). These are the rules code in this repo must follow. Full assessment and
evidence: `brain/security/` (threat model, secrets, attack surface, checklist with the open-findings list).
Labels: Implemented · Missing · Inferred · Unknown.

## 1. Non-negotiable rules (from the owner, `CLAUDE.md`)
- R1. Never put secrets or CTF flags in client code, the repo, chat, logs or docs. The repo is public. — Implemented
  (no secrets in repo/history except the public anon key; flags derived in `server/labs/flags.js`).
- R2. The Supabase service-role key is entered only in Render, never pasted in chat. — Implemented (process).
- R3. DB changes = a file in `supabase/migrations/`, applied to `rwjwjltlfkxadywfqxbs`. — Implemented (process).
- R4. Test before every push (mock-Supabase Playwright suites, real server checks). — Implemented (process).

## 2. Identity and access
- S1. Server endpoints that use the service role must verify the caller's JWT with `auth.getUser` and check ban
  status before acting for a user (`server/middleware/toolAccess.js`). — Implemented for tools, `/api/me/seen`,
  lab solve recording; admin-search checks role, not ban (gap).
- S2. User id always comes from the verified token, never from body/query (`toolAccess.js:99-100`). — Implemented.
- S3. Every public table has RLS on with explicit policies; admin writes require `role='admin'`. — Implemented.
- S4. Clients cannot change `role, xp, level, ctf_solves, is_banned` (trigger). XP/solves change only inside
  SECURITY DEFINER RPCs. — Implemented.
- S5. `SECURITY DEFINER` functions must `SET search_path` and check `auth.uid()`/admin inside. — Implemented for most;
  Missing for `blog_publish_due_posts`, `blog_increment_views`, `blog_set_updated_at` (search_path) and
  `blog_publish_due_posts` (no admin check).
- S6. Admin accounts use MFA. — Missing (0 MFA factors on the admin account).

## 3. CTF integrity
- S7. Flags only from `flagFor(slug)`; DB stores only `flag_hash` (sha256); `flag`/`flag_hash` never readable by
  anon/authenticated; backups exclude them. — Implemented (`server/labs/flags.js`,
  `supabase/migrations/2026-10-20_ctf_flag_hashes.sql`).
- S8. Solves/XP only through `submit_ctf_flag` or `server/labs/recordSolve.js` → `record_lab_ctf_solve`
  (service role). — Implemented.
- S9. Labs are intentionally vulnerable only inside their sandbox (in-memory data, fake accounts). A lab must never
  reflect input into an executable context on the main origin or touch real tables. — Implemented 2026-10-16 for the known
  case (session ids validated in `server/middleware/labSession.js`; pages escape `<`). Labs still share the main origin.

## 4. Output and input handling
- S10. Escape all DB/user/URL data before it reaches HTML; inside `<script>` use JSON with `<` escaped; React text
  over `dangerouslySetInnerHTML`. — Mostly implemented; gaps: lab XSS (S9), DB chapter HTML unsanitized
  (`web/src/components/ChapterView.tsx:157`, `js/chapters.js:178`), SPA `onclick` interpolation (`js/blog.js`,
  `js/resources.js`, `js/courses.js`).
- S11. Validate length/format of every input before regex or DB work. — Implemented for tools/RPCs; lab session ids and
  AlexTrace email fixed 2026-10-16.
- S12. Outbound requests to user-supplied hosts go through the SSRF guards (`safeFetch`, `safeLookup`,
  `resolvePublic`). — Implemented (`server/tools/alexrecon/modules/utils.js`, `server/tools/alexutils/target.js`).
- S13. No `eval`, `new Function`, user-controlled paths or shell arguments. — Implemented.

## 5. Abuse controls
- S14. Every new public route gets a rate limit. — Implemented for login/flags/tools/AI; Missing for lab
  `instance/*`, `sqli101/search`, `alextrace/breach-search`, alexrecon history/schedules.
- S15. Rate limits/quotas are in memory (reset on restart). — Implemented as is; shared store Missing.
- S16. Attack detection auto-blocks IPs after repeated high-confidence payloads, skipping labs and tool free-text
  fields (`server/middleware/attackDetection.js`). — Implemented.

## 6. Transport, headers, CORS
- S17. helmet + CSP + Permissions-Policy on every response (`server/index.js:18-39`). — Implemented; CSP allows
  `'unsafe-inline'` scripts (gap).
- S18. CORS origin should be the site origin. — `ALLOWED_ORIGIN` defaults to `*` (Unknown whether set on Render).
- S19. Third-party scripts pinned + SRI. — Pinned versions Implemented; SRI Missing.

## 7. Logging and privacy
- S20. Never log tokens, passwords, secrets. — Implemented. Plaintext flags/lab inputs are logged
  (`server/middleware/logger.js`) — gap.
- S21. `last_login_ip` never public. — Implemented (no anon SELECT, backup excludes it).
- S22. Public profile data limited to what pages need. — Gap (`role`, `is_banned`, `last_seen` public).
- S23. Data retention / user self-deletion. — Missing.

## 8. Contradictions between business, security and permissions
1. Business: "courses need login"; security/permissions: content is public in HTML (UI-only gate).
2. Business: "admin can close registration"; Auth still accepts sign-ups.
3. Business: "resources for logged-in users"; Storage bucket is public.
4. Security S9 (labs sandboxed) vs implementation (labs run on the main origin; known reflection fixed 2026-10-16).
5. Permissions: `moderator` accepted by admin search only.
6. Business: paid hints possible; permissions: hints column public.

## 9. How to use these rules (for AI agents)
Before writing code: find the matching rule here, follow it, and if the change adds a route, table, RPC, role, page
that renders data, or a secret, update `brain/rules/` and `brain/security/` in the same PR. If a rule is marked
Missing or a contradiction applies, do not silently "fix" behaviour; ask the owner unless the fix is a security bug.
