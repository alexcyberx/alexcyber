-- ═══════════════════════════════════════════════════════════
-- ALEXSYNC — Migration: installed-app detection support
-- Run this in the Supabase SQL editor, AFTER alexsync-schema.sql
-- has already been run once.
-- ═══════════════════════════════════════════════════════════

-- The original platform check only allowed 'youtube'/'spotify'. Now
-- that the Windows app can detect other music apps too (VLC, iTunes,
-- foobar2000, etc.), drop that constraint — the Windows app's
-- app_detect.py is the source of truth for which values are valid,
-- not a hardcoded SQL check.
alter table alexsync_schedules drop constraint if exists alexsync_schedules_platform_check;

-- Stores the list of apps the Windows background app detected as
-- installed on the user's PC, as JSON like:
--   [{"value": "youtube", "label": "YouTube"},
--    {"value": "spotify", "label": "Spotify"}]
-- The website's App dropdown reads this to show only apps that are
-- actually present, instead of a fixed hardcoded list.
alter table alexsync_schedules add column if not exists detected_apps jsonb not null default '[{"value":"youtube","label":"YouTube"}]'::jsonb;

-- ── RPC: save_detected_apps ─────────────────────────────────────
-- Called by the Windows background app (not the website) each time it
-- syncs, to report which apps it found installed. Separate from
-- save_alexsync_schedule() since this can run even if the user hasn't
-- configured a schedule yet — it should still create/update their row
-- so the website has something to show as soon as the app is running.
create or replace function save_detected_apps(p_detected_apps jsonb)
returns void
language plpgsql security definer as $$
begin
  insert into alexsync_schedules (user_id, detected_apps, wake_time)
  values (auth.uid(), p_detected_apps, '22:30:00')
  on conflict (user_id) do update set
    detected_apps = excluded.detected_apps;
end;
$$;
