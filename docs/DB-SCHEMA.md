# AlexCyberX — Database schema & RLS (as-is, 2026-10-09)

Supabase project `alexcyberx-fresh` (Postgres 17). 35 tables in `public`, **RLS enabled on all**.

Legend: `own` = `auth.uid() = user_id`; `admin` = caller's `profiles.role = 'admin'`.
Express (service role) bypasses RLS — see `ARCHITECTURE.md` §3.


## Users & progress

| Table | Columns | Access |
|---|---|---|
| `profiles` | id uuid, full_name, username, bio, xp, level, ctf_solves, role, last_seen, is_banned, created_at, last_login_ip | SELECT everyone; INSERT own (role/xp locked); UPDATE own (trigger blocks role/xp/level/ctf_solves/is_banned for non-admins) or admin; DELETE admin |
| `chapter_progress` | id, user_id, course, chapter_slug, viewed_at | INSERT/SELECT own; SELECT admin |
| `notifications` | id, user_id (null = global), title, body, type, read, created_at | SELECT own; UPDATE own (read via RPCs) |
| `notification_reads` | id, user_id, notification_id, read_at | SELECT own (written by RPC) |

## CTF

| Table | Columns | Access |
|---|---|---|
| `ctf_challenges` | id, slug, title, category, difficulty, points, xp, status, description, flag, hints jsonb, lab_url, solvers, requires jsonb | SELECT everyone (column grants: `flag` NOT readable, `hints` readable); write admin |
| `ctf_solves` | id, user_id, challenge_id, points_earned, correct, solved_at | SELECT everyone; writes only via RPC |
| `ctf_flag_attempts` | id, user_id, challenge_id, attempted_at | no policies (RPC/service role only) — rate-limit log |
| `ctf_hint_unlocks` | id, user_id, challenge_id, hint_index, cost_paid, unlocked_at | SELECT own/admin; written by `unlock_ctf_hint` |
| `ctf_attempts` | id, lab_id, ip, payload, result, created_at | SELECT admin (lab telemetry) |

## Content

| Table | Columns | Access |
|---|---|---|
| `courses` | id, course_key, page_key, slug, title, tag, description, icon_key, display_order, enabled, show_on_home | SELECT public (enabled); write admin |
| `content_chapters` | id, slug, title, description, course, chapter_order, enabled, has_content, content | SELECT public (enabled); write admin |
| `blog_posts / blog_categories` | blog_posts: id, title, slug, category, tags[], content, image, meta_*, status, publish_date, views, author | SELECT published; write admin |
| `resources` | id, name, type, file_path, file_size, chapter_tag, downloads, status | SELECT authenticated (active); write admin |
| `platform_settings` | key, value jsonb | SELECT everyone; write admin |

## Community

| Table | Columns | Access |
|---|---|---|
| `community_threads` | id, user_id, title, body, category, status, votes | SELECT all; INSERT/UPDATE/DELETE own; admin moderate |
| `community_replies` | id, thread_id, user_id, body, status, votes | SELECT visible/own/admin; INSERT/DELETE own; admin moderate |
| `community_votes` | id, user_id, thread_id, reply_id, vote_value | SELECT all; own write (also RPCs vote_thread/vote_reply) |
| `community_reports` | id, reporter_id, thread_id, reply_id, reason, status | INSERT own; SELECT/UPDATE admin |

## Tools

| Table | Columns | Access |
|---|---|---|
| `alexrecon_scans` | id, user_id, project_id, target, target_type, status, modules_requested, progress, result jsonb, error, started_at, completed_at | own CRUD (+admin SELECT); server writes with service role |
| `alexrecon_schedules` | id, user_id, target, target_type, frequency, modules, is_active, last_run_at | own CRUD |
| `alexrecon_projects` | id, user_id, name | own CRUD |
| `alextrace_lookups` | id, user_id, username, email_domain, overall_score, overall_level, result jsonb | SELECT own (server inserts) |
| `tool_settings` | tool_key, display_name, is_enabled, disabled_message, updated_by | SELECT everyone; UPDATE admin |
| `tool_usage_logs` | id, tool_key, user_id, created_at | INSERT own (or null user); SELECT admin |

## Admin / ops

| Table | Columns | Access |
|---|---|---|
| `admin_audit_log` | id, actor_id, action, target | admin only |
| `admin_backup_snapshots / admin_backup_schedule` | snapshot: id, type, status, size_bytes, data jsonb, error | admin only |
| `admin_feedback` | id, user_id, type, message, status | INSERT own; SELECT/UPDATE admin |
| `broadcasts` | id, title, body, audience, recipient_count, sent_by | admin only (written by `send_broadcast`) |
| `blocked_ips` | id, ip, reason | DELETE/SELECT admin (read by server `blockGate`) |
| `security_logs` | id, ip, event_type, details | SELECT admin (written by RPCs/server) |
| `contact_messages` | id, name, email, message, is_read | admin only (inserted by `submit_contact_message`) |
| `page_views` | id, page, user_id, device_type, session_id | SELECT admin (written by `track_page_view`) |
| `app_config` | id bool, app_url, cron_secret, updated_at | admin only |

## RPC functions (SECURITY DEFINER, schema `public`)
| Group | Functions |
|-------|-----------|
| CTF | `submit_ctf_flag(challenge_id, flag)`, `unlock_ctf_hint(slug, index)`, `record_lab_ctf_solve(user_id, slug)` (server-only), `increment_challenge_solvers` |
| Profile / XP | `award_daily_login_xp`, `get_profile_stats(user_id)`, `get_leaderboard(limit)`, `get_xp_rules` / `save_xp_rules` (admin), `handle_new_user` (auth trigger) |
| Notifications | `get_notifications(user_id, limit)`, `mark_notifications_read(user_id)` — caller must equal user_id; `send_broadcast` (admin) |
| Community | `get_thread_with_replies`, `vote_thread`, `vote_reply` |
| Content | `blog_increment_views`, `blog_publish_due_posts`, `increment_resource_downloads`, `get_course_completion_stats`, `track_chapter_view`, `track_page_view` (2 overloads), `get_page_view_stats`, `get_about_bio` / `save_about_bio` (admin), `get_site_settings` / `save_site_settings` (admin), `submit_contact_message` |
| Security / admin | `block_ip`, `unblock_ip`, `log_security_event`, `log_admin_event` (admin), `admin_get_last_ips` (admin), `trigger_manual_backup` (admin), `run_backup_snapshot`, `run_scheduled_backup` (cron only) |
| Internal | `trigger_due_alexrecon_scans` (cron only; target route missing), `rls_auto_enable` (event trigger: auto-enables RLS on new tables), `protect_profile_privileged_columns` (trigger on `profiles`) |

## Triggers / cron
- `protect_profile_privileged_columns` BEFORE UPDATE on `profiles`.
- pg_cron: `alexcyberx-scheduled-backup` (03:00 daily), `alexcyberx-alexrecon-scheduler` (every 15 min; dead).

## Rules to keep
1. Every new table: RLS on (an event trigger does it automatically) **and** explicit policies.
2. Never `select('*')` on `profiles` once `supabase/migrations/2026-10-09_hide_last_login_ip.sql` is applied; add new columns to its GRANT.
3. SECURITY DEFINER functions must check `auth.uid()` / admin themselves, and revoke `anon` execute unless truly public.
4. Never trust a user id from the request body — derive it from the JWT.

## Not in this repo yet
The authoritative schema/RLS SQL. Export with `supabase db dump --schema public` and commit it.
