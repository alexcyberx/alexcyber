# Business rules: AlexCyberX

Last verified: 2026-10-16 (commit `fffd15f` + live Supabase `rwjwjltlfkxadywfqxbs`). Status labels:
**Implemented** (enforced in code/DB) · **UI-only** (implemented in the browser, not enforced) · **Missing** (stated
or implied, not built) · **Inferred** (follows from code, not written down anywhere) · **Unknown** (cannot be decided
from the project). Owner direction lives in `CLAUDE.md`; security detail in `brain/security/`.

## 1. Product scope
- Free cybersecurity platform for Indian students: courses (Hinglish), CTF labs, security tools, blog, community,
  resources, leaderboard. Implemented. Evidence: `CLAUDE.md`, `web/src/app/*`, `server/labs/*`, `server/tools/*`.
- Everything is free; no payments anywhere. Inferred (no payment code; Permissions-Policy disables `payment`,
  `server/index.js:36-39`).
- 8 UI languages: hl (Hinglish), hi, en, pa, ta, te, bn, mr. Default `en` for new visitors. Implemented
  (`js/i18n.js:20-29`, `web/src/lib/ui-text.ts`). Chapters/CTF text in other languages are machine-translated in the
  browser (`web/src/lib/chapter-translate.ts`, `ctf-translate.ts`).
- Language modal shows once; Continue or X both count as answered (`acx_lang_seen`). Implemented (`js/i18n.js`).
- Themes: Green "Matrix" (default), Blue "Midnight", Red "Crimson"; no light mode. Implemented (`web/src/lib/theme.ts`).

## 2. Accounts
| Rule | Status | Evidence |
|---|---|---|
| Sign up with email+password or Google; email confirmation flow via Supabase Auth + Resend hook | Implemented | `web/src/components/AuthModals.tsx`, `server/routes/authEmailHook.js` |
| Must confirm "18+ or parent/guardian permission" to sign up | UI-only (checkbox; stored as `age_confirmed` in user metadata, not verified) | `AuthModals.tsx` signup, `options.data.age_confirmed` |
| Password ≥ 8 characters | Implemented in UI; server side = Supabase Auth setting (Unknown value) | `AuthModals.tsx` |
| New profile row: role `user`, xp 0, level 1, 0 solves | Implemented (trigger `handle_new_user` on `auth.users`; insert policy forces defaults) | DB |
| Usernames unique | Implemented | `supabase/migrations/2026-10-11_unique_username.sql` |
| Admin can switch off registration (`site_settings.user_registration`) | UI-only (signup form checks it; Supabase Auth still accepts sign-ups) | `AuthModals.tsx:162-166`, `js/auth.js:259-265` |
| Idle sign-out after 30 min; "remember me" chooses localStorage vs sessionStorage | Implemented (client) | `web/src/lib/auth-context.tsx:186-203`, `web/src/lib/supabase.ts` |
| Banned (`profiles.is_banned`) users: signed out in the browser, blocked from tools, flag submit, votes, daily XP, solves; hidden from leaderboard | Implemented (server/DB) + UI | `acx_not_banned` uses in RPCs, `server/middleware/toolAccess.js`, `get_leaderboard` |
| Users can delete their own account | Missing | no self-delete flow; only admins delete profiles |

## 3. XP and levels
- Level = `floor(xp / 500) + 1`, minimum 1. Implemented consistently in `submit_ctf_flag`, `record_lab_ctf_solve`,
  `award_daily_login_xp`, `track_chapter_view` (DB).
- XP rules stored in `platform_settings.xp_rules`: `daily_login` 10, `chapter_completion` 25, `ctf_easy` 50,
  `ctf_medium` 100, `ctf_hard` 200, `quiz_pass` 15. Admin edits them via `save_xp_rules` (admin check).
- Daily login: +`daily_login` XP once per calendar day (UTC date of `now()`), not for banned users. Implemented.
  Inferred inconsistency: the day boundary is UTC, users are in IST (+5:30).
- Chapter completion: +`chapter_completion` XP the first time a logged-in user opens a chapter
  (`track_chapter_view`, unique per user/course/chapter). Implemented. Note: "completion" = first view.
- CTF solve: XP = `ctf_challenges.xp` (else `points`), once per user per challenge. Implemented. `xp_rules.ctf_*` are
  only defaults the admin panel pre-fills for new challenges (`js/admin-panel-app.js:2562-2573`), not used at solve time.
- `quiz_pass`: Missing (no quiz feature exists).
- Hint unlock costs `hints[i].cost` XP, XP never below 0, paid once per hint. Implemented (`unlock_ctf_hint`); all
  current hints cost 0.
- Clients cannot change their own xp/level/solves. Implemented (trigger `protect_profile_privileged_columns`).

## 4. CTF
| Rule | Status | Evidence |
|---|---|---|
| Rooms list = active `ctf_challenges` (11 active today; categories shown only if they have rooms) | Implemented | `web/src/app/rooms`, `RoomsView.tsx` |
| Must be logged in to submit a flag and get XP | Implemented | `submit_ctf_flag` (`auth_required`), `server/labs/recordSolve.js` |
| Flags are `ACX{...}`, derived per challenge from a server secret; same flag for every player | Implemented | `server/labs/flags.js` |
| Wrong attempts: max 5 per 60 s per user per challenge (DB) and 10/min per IP on lab `/submit` | Implemented | `submit_ctf_flag`, `server/middleware/rateLimit.js:24` |
| Prerequisites: a challenge with `requires` stays locked until those slugs are solved | Implemented (DB) | `submit_ctf_flag` |
| Lab instance lasts 30 minutes, can be restarted/stopped | Implemented (server state + client timer) | `server/labs/*/routes.js` `INSTANCE_DURATION_SEC`, `RoomsView.tsx:19` |
| Inactive challenges cannot be solved | Implemented | `submit_ctf_flag`, `record_lab_ctf_solve` |
| `solvers` count increases on first solve | Implemented (trigger) | `increment_challenge_solvers` |
| New active challenge → notification to everyone | Implemented | `acx_notify_new_content` trigger |
| Removed room Log Hunter (for-03) | Implemented (row deleted 2026-10-16) | `supabase/migrations/2026-10-17_remove_log_hunter.sql`, `2026-10-19_delete_log_hunter_row.sql` |
| Per-player unique flags / anti-sharing | Missing | — |

## 5. Courses
- Three courses: Network Forensics (`learn`), Cyber Attacks Fundamentals (`learn2`), Ethical Hacking (`learn3`);
  each chapter has its own URL `/tutorials/<course>/<chapter>`. Implemented (`web/src/lib/chapters.ts`).
- Courses/chapters can be enabled/disabled by admin; public sees only enabled ones. Implemented (RLS
  "Public can read enabled courses", "Enabled chapters are viewable by everyone").
- **Reading a chapter needs login** — UI-only: logged-out visitors see a login gate, but the chapter HTML is already
  in the page source (verified: `curl` of a chapter page contains the lesson text). Evidence:
  `web/src/components/ChapterView.tsx:58,120`. Contradiction with the stated rule (see §10).
- New enabled course → notification. Implemented (trigger).

## 6. Tools
- AlexRecon, AlexUtils, AlexTrace, Mistake Analyzer require login; each can be switched off by admin
  (`tool_settings`, `checkToolEnabled`). Implemented (`server/middleware/toolAccess.js`, tool routers).
- Per-user / per-IP rate limits per tool (see `brain/security/attack-surface.md` §3). Implemented (in memory).
- AlexRecon: only public domains, max 2 running scans + 10 queued site-wide, max 3 active schedules per user.
  Implemented (`server/tools/alexrecon/routes.js:86,94-95,356`).
- Tool usage is logged per user (`tool_usage_logs`). Implemented.

## 7. Community
| Rule | Status | Evidence |
|---|---|---|
| Anyone can read threads and approved replies; posting needs login | Implemented | RLS on `community_threads/replies` |
| Max 5 threads/hour and 30 replies/hour per user | Implemented | trigger `acx_community_guard` |
| New threads start `open`, new replies are auto-`approved` (no pre-moderation) | Implemented | `acx_community_guard` |
| Users cannot change status/votes/author of posts | Implemented | `acx_community_guard` |
| Votes ±1 per user per thread/reply, toggle; not on locked threads; not when banned | Implemented | `vote_thread`, `vote_reply` |
| Report a post once per user | Implemented | `supabase/migrations/2026-10-16_community_reports_unique.sql` |
| Thread statuses: open / pinned / locked; categories general/help/ctf/tools/news | Implemented | constraints in `2026-10-14_step5a_security.sql` |
| Users can delete their own threads/replies | Implemented | RLS |
| Banned users cannot post | Unknown for direct inserts (votes/RPCs check bans; insert policies not verified for ban) | — |

## 8. Content, blog, resources, contact
- Blog: admin writes; public reads `published`; `scheduled` posts go live when due (`blog_publish_due_posts`);
  view counter per slug (`blog_increment_views`). Implemented. New post → notification.
- Resources: list visible to logged-in users only (RLS); files in public Storage bucket `resources`; downloads
  counted once per user (`increment_resource_downloads`). Implemented. Inconsistency: files themselves are public.
- Contact form: name ≤60, valid email ≤254, message 10–1000 chars; max 3 per email per hour and 60 per hour site-wide.
  Implemented (`submit_contact_message`).
- Maintenance mode (`site_settings.maintenance_mode`) shows an overlay. UI-only, fails open
  (`web/src/components/SiteRuntime.tsx:40-55`, `js/config.js:46-77`).
- About bio, site name, social links editable by admin (`save_about_bio`, `save_site_settings`). Implemented.

## 9. Admin operations (what the admin can do)
Users (ban/unban, role, XP edits, delete), courses/chapters, CTF challenges (create/edit/flag/hints/status), blog,
resources (upload), community moderation (status, delete, reports), contact messages, broadcasts/notifications,
XP rules, site settings, tool on/off, IP block/unblock, backups, analytics. Evidence: `js/admin-panel-app.js`, admin
RLS policies and admin RPCs (DB).

## 10. Contradictions / gaps found
1. **Courses "need login"** but lesson HTML is public in the page source (UI-only gate). Decide: keep public (SEO) and
   drop the gate, or render chapter text only after login.
2. **Registration toggle** only hides the form; Supabase Auth still accepts sign-ups.
3. **Resources are login-only** in the table, but the Storage bucket is public.
4. **`xp_rules.ctf_*`** look like the solve reward but solve XP comes from each challenge's own `xp`.
5. **`quiz_pass`** XP rule has no quiz feature.
6. **Daily XP day** is UTC, audience is IST.
7. **Moderator role** is accepted by `server/ai/adminSearch.js:39` but no DB policy or UI knows `moderator`
   (0 moderators exist). See `permissions.md`.
8. **Paid hints** are supported by `unlock_ctf_hint` while the `hints` column is publicly readable.
9. **Community replies** have a `pending` status and "approved only" read policy, but every reply is auto-approved.
10. **Age confirmation** is a checkbox only; no age data is kept or verified (Unknown whether legally sufficient).
