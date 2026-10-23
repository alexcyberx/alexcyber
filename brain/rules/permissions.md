# Permissions: AlexCyberX

Last verified: 2026-10-16 (commit `fffd15f` + live Supabase). Labels: Implemented · UI-only · Missing · Inferred ·
Unknown. Rule of thumb: **the browser never decides permissions; RLS, RPC checks and Express middleware do.**

## 1. Roles
| Role | Where defined | Count (2026-10-16) | Status |
|---|---|---|---|
| `anon` (visitor) | Supabase role for requests without JWT | — | Implemented |
| `user` (`profiles.role='user'`, Supabase `authenticated`) | default on signup (`handle_new_user`, insert policy) | 14 | Implemented |
| `admin` (`profiles.role='admin'`) | set only by an admin or the DB owner (trigger blocks self-promotion) | 1 | Implemented |
| `moderator` | only `server/ai/adminSearch.js:39` (`ALLOWED_ROLES`) | 0 | Inferred/partial: no DB policy, no UI |
| `banned` (flag, not a role: `profiles.is_banned`) | admin sets it | — | Implemented |
| `service_role` (server) | Supabase key on Render | — | Implemented; bypasses RLS |

Checks: `acx_is_admin(uid)` = `profiles.role='admin'`; `acx_admin_mfa()` = admin **and** session `aal2` (two-step login) — required by restrictive policies on admin data and by admin RPCs (`supabase/migrations/2026-10-21_admin_mfa.sql`); `acx_mfa_ok()` = not admin or aal2; `acx_not_banned(uid)` = logged in and not banned (DB functions).
Server: `requireAuth` / `requireToolLogin` verify JWT (`auth.getUser`) and ban (`isUserBanned`, 60 s cache)
(`server/middleware/toolAccess.js`); `verifyStaff` for admin search (`server/ai/adminSearch.js:124-146`).

## 2. Permission matrix (DB, from RLS policies)
`R` read · `C` create · `U` update · `D` delete · `own` = only rows where `user_id/id = auth.uid()`.

| Table | anon | user | admin | Notes |
|---|---|---|---|---|
| `profiles` | R (all cols except `last_login_ip`) | R; C own (defaults forced); U own (not role/xp/level/solves/ban) | R, U any, D | trigger `protect_profile_privileged_columns` |
| `ctf_challenges` | R (not `flag`, `flag_hash`) | R | C/U/D | flag typed by admin is hashed by trigger |
| `ctf_challenges_public` (view) | R | R | R | `security_invoker` |
| `ctf_solves` | R | R (no direct C) | R | writes only via `submit_ctf_flag` / `record_lab_ctf_solve` |
| `ctf_hint_unlocks` | — | R own | R | write via `unlock_ctf_hint` |
| `ctf_flag_attempts`, `ctf_attempts` | — | — | R (`ctf_attempts`) | written by RPC |
| `courses`, `content_chapters` | R enabled | R enabled | R all, C/U/D | |
| `chapter_progress` | — | R own, C own | R | XP via `track_chapter_view` |
| `blog_posts`, `blog_categories` | R published / all categories | same | full | |
| `community_threads` | R | C (rate-limited), U own (content only), D own | U/D any | trigger `acx_community_guard` |
| `community_replies` | R approved | C, R own, D own | R/U/D | |
| `community_votes` | R | C/U/D own | — | prefer RPCs `vote_thread/reply` |
| `community_reports` | — | C (once per post) | R/U | |
| `resources` | — | R active | R/C/U/D | Storage bucket `resources` is public for files |
| `notifications` | — | R own + global, U own | via `send_broadcast` | |
| `contact_messages` | — (insert via RPC) | — | R/U/D | |
| `platform_settings` | R | R | C/U | `site_settings`, `xp_rules`, `about_bio` |
| `tool_settings` | R | R | U | |
| `alexrecon_*`, `alextrace_lookups`, `tool_usage_logs` | — | own rows (alextrace: R own) | R (scans, usage); alextrace: counts only via `admin_alextrace_counts` | server uses service role with `user_id` filter; only the server inserts `tool_usage_logs` |
| `security_logs`, `blocked_ips`, `page_views`, `admin_*`, `app_config`, `broadcasts` | — | — (`admin_feedback`: C) | R (+ limited writes) | `security_logs.actor_id` = admin who acted (set by `log_admin_event`); `admin_backup_snapshots`: list columns only, the data column only through `admin_get_backup`; `admin_backup_schedule`: U `frequency`; `admin_feedback`: U `status` (all aal2) |

## 3. RPC permissions
- Anyone (anon EXECUTE; function itself checks login where needed): `submit_ctf_flag` (login), `unlock_ctf_hint`
  (login), `vote_thread`/`vote_reply` (login, not banned), `award_daily_login_xp` (login), `track_chapter_view`
  (login, else no-op), `track_page_view`, `submit_contact_message`, `get_leaderboard`, `get_profile_stats`,
  `get_site_settings`, `get_xp_rules`, `get_about_bio`, `get_community_threads`, `get_thread_with_replies`,
  `blog_increment_views`, `blog_publish_due_posts` (**no admin check**, Inferred unintended), `get_hidden_chapters` (course + slug of switched-off chapters only, no text; migration 2026-10-22).
- Admin (function checks `role='admin'`): `save_site_settings`, `save_xp_rules`, `save_about_bio`, `send_broadcast`,
  `block_ip`, `unblock_ip`, `trigger_manual_backup`, `get_page_view_stats`, `get_course_completion_stats`,
  `log_security_event`, `log_admin_event`, `admin_get_last_ips` (authenticated only).
- Admin with two-step (aal2, `acx_admin_mfa`), no anon EXECUTE (migration 2026-10-23): `admin_xp_summary()`
  (totals only), `admin_alextrace_counts(p_since)` (counts only), `admin_get_backup(p_id)` (logs the download),
  `admin_delete_backup(p_id)` (keeps the newest good snapshot, logs). `trigger_manual_backup`: PUBLIC/anon grant removed.
- `get_leaderboard` leaves out banned users and admin accounts (2026-10-23).
- Logged-in only (no anon EXECUTE): `get_notifications(p_user_id)` and `mark_notifications_read(p_user_id)` (both
  require `p_user_id = auth.uid()`), `get_notifications_feed`, `increment_resource_downloads`.
- Service role only: `record_lab_ctf_solve`, `run_backup_snapshot`, `run_scheduled_backup`,
  `trigger_due_alexrecon_scans`, `acx_announce`.

## 4. Server (Express) permissions
| Surface | Who | Evidence |
|---|---|---|
| Static pages, Next pages, `/api/lab/*` (all labs, hints, search) | anyone | `server/index.js:139-152` |
| Lab solve recording (XP) | logged-in, not banned (JWT on `/submit`) | `server/labs/recordSolve.js` |
| `/api/tools/*`, `/api/alexutils/*`, `/api/alextrace/*` | logged-in, not banned, tool enabled | `requireToolLogin`, `checkToolEnabled` |
| `/api/alexrecon/*` | logged-in, not banned (enabled check on scan/schedule) | `server/tools/alexrecon/routes.js:46` |
| `/rooms/details` (CTF scenario + hints) | logged-in (token checked) | `web/src/app/rooms/details/route.ts` |
| `/api/admin/*` (invite user, delete account) | admin, not banned, two-step (aal2) session | `server/routes/admin.js` |
| `/api/me/seen` | logged-in | `server/routes/me.js:16` |
| `/api/lab/admin-search` | `admin` or `moderator` (role cached 5 min, ban not checked) | `server/ai/adminSearch.js` |
| `/auth/email-hook` | Supabase (signed webhook) | `server/routes/authEmailHook.js` |
| Admin panel page (Next `/panel-1b47c1ab561e`; the old `.html` redirects there) | anyone can load the page; actions need admin RLS + aal2 | `server/index.js`, `web/src/admin/AdminApp.tsx` (UI-only gate) |

## 5. Client-only (UI) permission checks — never rely on these
Admin panel gate (`web/src/admin/AdminApp.tsx`: role + aal2 before showing sections), registration toggle,
maintenance mode, ban sign-out, hidden/disabled challenges list (`acx_ctf_disabled`), solved state in localStorage.

## 6. Contradictions / gaps
1. `moderator` exists only in admin-search; DB treats moderators as normal users → a moderator can search admin data
   but cannot moderate. Decide: add moderator policies, or remove the role from `ALLOWED_ROLES`.
2. Admin search does not check `is_banned`; a banned admin/mod keeps access for up to 5 min (role cache) and beyond
   if the role stays.
3. Admin panel HTML is public; data access is protected by RLS and, since 2026-10-16, needs the two-step login (aal2).
4. `blog_publish_due_posts` callable by anyone (low impact).
5. Registration toggle is enforced only in the UI (course reading is public by decision).
6. `profiles` public SELECT exposes `role`, `is_banned`, `last_seen` (Inferred unintended; leaderboard/profile pages
   need only name/username/xp/level/solves/bio).
