# Admin panel → Next.js (plan + inventory)

The old panel lives in `panel-1b47c1ab561e.html` (inline CSS + markup) and `js/admin-panel-app.js` (all logic,
~5,100 lines). The new one is a client app in `web/src/app/(admin)/panel-1b47c1ab561e/` with its own root layout,
so the site nav, cookie banner and page-view tracking do not load. Code is in `web/src/admin/`.
The old panel stays live at `/panel-1b47c1ab561e.html` until every section is ported, then it redirects.

Security does not depend on the page: RLS, the admin RPC checks and the two-step login (aal2,
`supabase/migrations/2026-10-21_admin_mfa.sql`) protect the data. The page only decides what to show.

## Owner decisions (2026-10-16)
- URL stays secret: `/panel-1b47c1ab561e` (new) next to `/panel-1b47c1ab561e.html` (old).
- Remove the mock sections **Progress & Certs** and **Moderation**. Moderation's useful parts (user Feedback =
  `admin_feedback`, Activity log = `admin_audit_log`) move into Community.
- **Backup** becomes real: list of `admin_backup_snapshots` + "Backup now" (`trigger_manual_backup`). No restore
  from the browser.
- **Users + Public Profiles** merge: one Users list, a detail panel per user (XP, CTF history, course progress,
  activity heatmap, ban, award XP).
- Remove: `force_https` toggle (read nowhere), weekly/monthly leaderboard (always 0), CTF "Sync" banner +
  "Reset solver counts" + `CTF_LOCAL_SEED`.
- **Add User** becomes real: admin enters an email, the server sends a Supabase invite (service role, admin +
  aal2 checked on the server).

## Status
- Phase 1 done: shell, login, Dashboard, Messages.
- Phase 2 done: Users (merged with Profiles: paged search, filters, sort, CSV with formula guard, detail drawer with
  last IP, stats, 12-week heatmap, course progress, CTF solves; edit name/role, ban, award XP with reason, delete
  account via server, invite by email), Security (24 h counts, block/unblock with IPv4/IPv6 check, log with
  filters/search/paging/CSV), Notifications (real person search, history).

## Phases
1. Shell + login (password → admin role → TOTP enroll/verify → aal2), sidebar, hash routing, toasts/modals,
   idle sign-out. Dashboard (real numbers, rendered after login) and Messages (detail view, unread filter).
2. Users (merged with Profiles, invite, award XP), Security, Notifications.
3. Courses + chapters, Blog, Resources, CTF manager.
4. Community (+ Feedback, Activity log), Tools manager, Settings (+ XP rules, About bio), Analytics, Backup.
   Then switch: old `.html` redirects to the new URL; delete the old files and the dead `css/admin.css`.

Sections not yet ported link to the old panel.

## Bugs found in the old panel (fixed by the port, not patched in the old file)
- Dashboard rendered before login (anon numbers until a hash was set).
- A mock `users` array (8 fake people) fed Export CSV and the "Specific user" broadcast picker.
- Hardcoded sidebar badges ("1.2k", "3", "7") and "Welcome back, Pawan".
- Messages: All/Unread/Spam filter not wired; no detail view; unread count written into the Community badge.
- Users: "Email" column showed the username; role `mod` does not exist; sorting by formatted date strings;
  CSV without quoting (formula injection).
- CTF: editing a challenge wiped its `lab_url`; scoreboard counted `correct = null` rows; static "Live" pill.
- Resources: `renderResources` defined twice, the list never loaded.
- Blog: ids unquoted in inline `onclick` (uuid → broken buttons); category manager not used by the post form.
- Tools manager: `alextrace_lookups` has no admin SELECT policy (count wrong); 4 queries per tool.
- Analytics: course completion averaged only two hardcoded courses; signup chart labels 1..14.
- Community: report filter offers "pending" (DB: open/resolved/dismissed/escalated); no escalate action.
- Award XP wrote `profiles.xp` directly (no audit, no notification).
- Admin log IP came from the browser (ipify), so it can be faked.
- Progress, Moderation and Backup rendered data with no escaping (mock today, XSS if wired as written).

## Data used per section (old panel, for reference)
| Section | Reads | Writes |
|---|---|---|
| Dashboard | `profiles` counts (all, 7d, `last_seen` 24h), `ctf_solves` count `correct`, `contact_messages` unread, `get_page_view_stats`, last 5 profiles | `save_site_settings` (maintenance) |
| Users | `profiles` (≤200), `admin_get_last_ips` | `profiles.update(full_name, role, is_banned)`, `profiles.delete` |
| Content | `courses`, `content_chapters` | courses/chapters insert/update/delete, chapter reorder |
| Analytics | `get_page_view_stats`, `get_course_completion_stats`, `profiles.created_at` 14d | — |
| Messages | `contact_messages` (≤100) | `is_read`, delete |
| Security | `blocked_ips`, `security_logs` | `block_ip`, `unblock_ip`, `log_security_event` |
| Notifications | `broadcasts`, `profiles` picker | `send_broadcast(p_title, p_body, p_audience, p_target_user_id)` |
| Settings | `get_site_settings`, `get_about_bio` | `save_site_settings`, `save_about_bio`, `auth.updateUser(password)` |
| Gamification | `profiles` top 50, `get_xp_rules` | `save_xp_rules` |
| CTF | `ctf_challenges`, `ctf_solves`, `get_xp_rules` | challenge insert/upsert/update/delete (flag hashed by trigger) |
| Resources | `resources`, Storage `resources` | upload/remove, insert/update/delete |
| Tools | `tool_settings`, `tool_usage_logs`, `alexrecon_scans`, `alextrace_lookups` | `tool_settings` enable/message |
| Community | `community_threads`, `community_reports`, `community_replies`, `profiles` | thread status/delete, report status, reply status |
| Blog | `blog_posts`, `blog_categories` | posts CRUD, categories insert/delete |
| Profiles | `profiles`, `ctf_solves`, `chapter_progress`, `content_chapters`, `courses` | `is_banned`, `xp`/`level` |
| Topbar | search `profiles` + `content_chapters`, `broadcasts`, unread messages | — |
| Login | `profiles.role`, MFA factors | `log_admin_event` |
