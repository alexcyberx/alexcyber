# Secrets: AlexCyberX

Last verified: 2026-10-24 (labs on their own origin; 2026-10-23 admin panel phase 4; full audit 2026-10-16, commit `fffd15f`). This file lists **where** secrets live and the risks. It must never
contain a secret value. The GitHub repo is **public**: anything committed is public forever (git history).

## 1. Where secrets are expected
All real secrets are environment variables on the Render service `alexcyber` (`srv-d8oil4beo5us73eatqig`), entered
in the Render dashboard by the owner. Never in chat, never in the repo. Template with names only: `.env.example`.

| Name | Used by (file:line) | Type / power | Required |
|---|---|---|---|
| `SUPABASE_URL` | `server/middleware/toolAccess.js:21`, `attackDetection.js:45`, `tools/alexrecon/routes.js:51`, `tools/alextrace/routes.js:69`, `routes/authEmailHook.js:100` | not secret (public URL) | yes |
| `SUPABASE_SERVICE_ROLE_KEY` | same files (`:24/48/54/72`), `server/labs/flags.js:30` | **full DB + auth admin, bypasses RLS** | yes |
| `FLAG_SECRET` | `server/labs/flags.js:30` | derives every CTF flag | main + labs server, same value (Render env group); required once the labs server runs (`docs/LABS.md`); the main server falls back to the service-role key, which must never go to the labs server |
| `RESEND_API_KEY` | `server/routes/authEmailHook.js:50` | sends email as the site | yes for email |
| `SEND_EMAIL_HOOK_SECRET` | `server/routes/authEmailHook.js:56` | verifies Supabase → server webhook | yes for email |
| `EMAIL_FROM_ADDRESS` | `authEmailHook.js:110` | not secret | optional |
| `GROQ_API_KEY` / `AI_API_KEY` (+ `AI_BASE_URL`) | `server/ai/llm.js:26-27` | LLM spend | yes for AI labs/hints |
| `GEMINI_API_KEY` | `server/tools/mistake-analyzer/routes.js:153` | LLM spend | yes for Mistake Analyzer |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `web/src/lib/supabase.ts:3-4`; at build read from `js/config.js` by `scripts/build-web.js:19-25` | **public by design** (anon role) | yes |

Non-secret config: `ALLOWED_ORIGIN`, `PORT`, `NEXT_APP_URL`, `NEXT_EMBEDDED`, `NEXT_EMBEDDED_PORT`, `NEXT_COMMUNITY`,
`NEXT_PUBLIC_SITE_URL`, `RENDER_EXTERNAL_URL`, AI tuning numbers (`AI_GLOBAL_PER_MIN`, `AI_EASY_MAX_MSGS`, ...).
The old per-lab `FLAG_*` variables are no longer read (removed 2026-10-16).

## 2. Environment / configuration handling
- Express reads `process.env` directly; there is no config module and no startup check that required secrets exist
  (MISSING: fail fast with a clear log line when `SUPABASE_SERVICE_ROLE_KEY` is missing).
- `NODE_ENV` is not read by the server (only forced to `production` for the embedded Next child,
  `server/nextEmbedded.js:22`).
- `.gitignore` covers `.env`, `.env.*` (keeps `.env.example`), `*.log`, `data/*.db`.

## 3. Hard-coded secret risk — current findings
| Finding | Evidence | Label |
|---|---|---|
| Supabase **anon** JWT in client code | `js/config.js:7`, `web/src/lib/supabase*` via `NEXT_PUBLIC_SUPABASE_ANON_KEY` (decoded `role=anon`) | OK (public by design; protection is RLS) |
| Lab demo credentials / passcodes / decoy tokens | `server/labs/web02-cookie/routes.js:204`, `web03-sqli101/routes.js:35,231`, `web04-robots/routes.js:8`, `web01-golive/routes.js` (per-instance staging key, a decoy by design) | OK (part of the challenges, not real accounts) |
| CTF flags | none in the repo since 2026-10-16; derived in `server/labs/flags.js` | FIXED (old flags are in git history but no longer accepted) |
| Service-role, Resend, Groq, Gemini, webhook secrets | not found in tracked files | OK |

## 4. Client-side exposure risk
- Only the anon key and the Supabase URL ship to browsers. No `service_role` usage in `js/`, `web/src/`, `pages/`.
- The admin panel uses the anon key + the admin's JWT; any table it writes must be protected by RLS.
- Next.js server code reads Supabase with the anon key (`web/src/lib/search.ts:35`, `web/src/lib/players.ts:34` read
  base `ctf_challenges`); `flag` and `flag_hash` have no SELECT grant for anon (verified in DB 2026-10-16).
- REC: never add a `NEXT_PUBLIC_*` variable that holds a secret; anything `NEXT_PUBLIC_` is bundled to the client.

## 5. Git / history exposure
- History scan 2026-10-16 (103 commits, all refs): JWT-shaped strings are only the anon key; no Resend (`re_`), Groq
  (`gsk_`), Google (`AIza`), webhook (`whsec_` values), or `sk_live` secrets. `whsec_` appears only in comments.
- Old CTF flags exist in history (plain defaults in old `server/labs/*/routes.js`, `data/hidden.db`). They are dead:
  the server only accepts derived flags and the DB keeps hashes. Do not "restore" old flag code.
- `data/hidden.db` was committed until 2026-10-16 (contained old flag attempts); now untracked and ignored.

## 6. Logging / error exposure
| What | Where | Risk | Label |
|---|---|---|---|
| Every submitted flag (wrong and correct) in plaintext | `server/middleware/logger.js:9-21` → `data/logs/attempts.log`; callers e.g. older labs' `/submit` routes (new labs log only `submit`, never the flag) | correct flags readable by anyone with server/log access | WEAKNESS |
| web-01 attempts incl. flag text | was `data/hidden.db` (old `hidden-sight` lab) | removed 2026-11-01: `web01-golive` stores no attempts | FIXED |
| Full URLs with query strings | `morgan('dev')`, `server/index.js:56` | `?session=`, `?q=`, `?key=` style values land in Render logs | WEAKNESS |
| Gemini key in request URL | `server/tools/mistake-analyzer/routes.js:55` | key appears in any outbound proxy/URL log | WEAKNESS (REC: send as `x-goog-api-key` header) |
| Provider error bodies (300 chars), Resend error objects, user email on unknown hook action | `server/ai/llm.js:144`, `server/routes/authEmailHook.js:208,217` | PII in logs | WEAKNESS |
| Error handler | `server/index.js:216-219` logs stack, returns generic JSON | no stack leak to clients | OK |
| `Authorization` header | not logged | OK |

## 7. Rotation requirements
| Secret | Rotate when | How / side effects |
|---|---|---|
| Service-role key | suspected leak, staff change, yearly | Supabase dashboard → new key → Render env → redeploy. **If `FLAG_SECRET` is unset, every CTF flag changes**; the server re-syncs `flag_hash` on start (`syncFlagHashes`). Set `FLAG_SECRET` to decouple (REC). |
| `FLAG_SECRET` | flag leak, new season | Change on Render → redeploy → all flags change, hashes re-sync automatically; tell players. |
| `RESEND_API_KEY`, `SEND_EMAIL_HOOK_SECRET` | leak, yearly | Resend / Supabase Auth hook settings → Render env. |
| AI keys | leak, abuse spikes | Provider console → Render env. |
| Anon key | only if the JWT secret is rotated | Changes `js/config.js` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`; rebuild. |

## 8. Rules for anyone (human or AI) touching secrets
1. Never paste a secret into chat, code, docs, tests, commit messages or screenshots. Name + location only.
2. New secret → add the **name** to `.env.example` and this file; value goes to Render only.
3. Never use the service-role key in browser code or in Next.js client components.
4. Never log request headers, tokens, passwords, or full request bodies of auth routes.
5. Lab flags come only from `flagFor(slug)` in `server/labs/flags.js`; never write a flag literal anywhere.
