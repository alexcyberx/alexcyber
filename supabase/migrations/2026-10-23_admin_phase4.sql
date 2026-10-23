/* Admin panel phase 4 (docs/ADMIN-PORT.md): what the new Community, Tools, */
/* XP and Leaderboard and Backup sections need from the DB, plus the owner's */
/* decisions of 2026-10-23 (admins off the public leaderboard, a course is */
/* announced only the first time it goes live, old backups cleaned up). */
/* Run once in the Supabase SQL Editor. Everything runs in one transaction: */
/* if any step fails, nothing is changed. */
/* Only block comments on purpose: pasting on a phone can put the whole file on */
/* one line, and a line comment would then hide everything after it. */

begin;

/* 1. Community, Activity tab: record which admin did each admin action. */
/* Until now log_admin_event stored no actor, so the log could not say who acted. */
alter table public.security_logs add column if not exists actor_id uuid references public.profiles(id) on delete set null;
create index if not exists security_logs_actor_id_idx on public.security_logs (actor_id) where actor_id is not null;
/* Same function and admin check as before (create or replace keeps the grants), */
/* now also saving the caller. No aal2 check, as before: the sign-in page logs a */
/* wrong 2-step code while the session is still aal1. */
create or replace function public.log_admin_event(p_event_type text, p_details text, p_ip text default 'unknown'::text)
returns void language plpgsql security definer set search_path to 'public'
as $function$
begin
  if not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') then
    return;
  end if;
  insert into public.security_logs (event_type, details, ip, created_at, actor_id)
  values (p_event_type, p_details, p_ip, now(), auth.uid());
end;
$function$;

/* 2. community_replies had no aal2 rule for reading: an admin session with only */
/* the password could read hidden (rejected) replies. Same restrictive policy as */
/* community_reports; approved replies and a user's own replies stay readable. */
drop policy if exists acx_admin_mfa_select on public.community_replies;
create policy acx_admin_mfa_select on public.community_replies as restrictive for select to authenticated
  using (public.acx_mfa_ok() or status = 'approved' or user_id = auth.uid());

/* 3. Feedback tab and the older audit log: the RLS policies were there (admin */
/* with two-step only) but the table grants were not, so reading failed with */
/* "permission denied". Only the status of a feedback row can be changed. */
grant select on public.admin_feedback to authenticated;
grant update (status) on public.admin_feedback to authenticated;
grant select on public.admin_audit_log to authenticated;

/* 4. Tools: AlexTrace counts for the admin page, counts only. The lookups */
/* themselves stay private to the person who ran them (no admin read policy). */
create or replace function public.admin_alextrace_counts(p_since timestamptz)
returns jsonb language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.acx_admin_mfa() then
    raise exception 'Admin two-step verification required' using errcode = '42501';
  end if;
  return (
    select jsonb_build_object(
      'total', count(*),
      'd30', count(*) filter (where l.created_at >= p_since),
      'low', count(*) filter (where l.overall_level = 'low'),
      'medium', count(*) filter (where l.overall_level = 'medium'),
      'high', count(*) filter (where l.overall_level = 'high'),
      'last', max(l.created_at)
    )
    from public.alextrace_lookups l
  );
end;
$$;
revoke all on function public.admin_alextrace_counts(timestamptz) from public, anon;
grant execute on function public.admin_alextrace_counts(timestamptz) to authenticated, service_role;

/* 5. Only the server logs tool uses (service role, which skips RLS). This policy */
/* let anyone with the public anon key add fake uses for any tool, which inflated */
/* every number on the Tools page. No client code inserts into tool_usage_logs. */
drop policy if exists "Users can log their own tool usage" on public.tool_usage_logs;

/* 6. AlexTrace stored the full checked email inside the saved report. The server */
/* now masks it before saving (j***@example.com); this masks the rows already */
/* saved the same way. The domain column was always domain only. */
update public.alextrace_lookups
   set result = regexp_replace(result::text, '([A-Za-z0-9])[A-Za-z0-9._%+-]*@', '\1***@', 'g')::jsonb
 where result::text ~ '[A-Za-z0-9][A-Za-z0-9._%+-]*@';

/* 7. XP and Leaderboard: totals over every account in one call (no per-user */
/* data). Admin with two-step only. */
create or replace function public.admin_xp_summary()
returns jsonb language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.acx_admin_mfa() then
    raise exception 'Admin two-step verification required' using errcode = '42501';
  end if;
  return (
    select jsonb_build_object(
      'users', count(*),
      'total_xp', coalesce(sum(p.xp), 0),
      'users_with_xp', count(*) filter (where p.xp > 0),
      'banned', count(*) filter (where coalesce(p.is_banned, false))
    )
    from public.profiles p
  );
end;
$$;
revoke all on function public.admin_xp_summary() from public, anon;
grant execute on function public.admin_xp_summary() to authenticated, service_role;

/* 8. Owner decision: admins are not on the public leaderboard. Banned users stay */
/* out as before. Same XP order; equal XP keeps the older account first so the */
/* order does not change between page loads. */
create or replace function public.get_leaderboard(p_limit integer default 50)
returns table(id uuid, username text, full_name text, xp integer, level integer, ctf_solves integer, badge_count integer, rank bigint)
language sql security definer set search_path to 'public'
as $function$
  select p.id, p.username, p.full_name, p.xp, p.level, p.ctf_solves,
         0::integer as badge_count,
         row_number() over (order by p.xp desc nulls last, p.created_at asc, p.id) as rank
  from public.profiles p
  where coalesce(p.is_banned, false) = false
    and coalesce(p.role, 'user') <> 'admin'
  order by p.xp desc nulls last, p.created_at asc, p.id
  limit least(greatest(coalesce(p_limit, 50), 1), 200);
$function$;

/* 9. Backup section. The list and the schedule had RLS policies (admin with */
/* two-step) but no table grants, so the panel could not read them. The big data */
/* column is not granted: a download goes through admin_get_backup, which logs it. */
grant select (id, type, status, size_bytes, error, created_at) on public.admin_backup_snapshots to authenticated;
grant select on public.admin_backup_schedule to authenticated;
grant update (frequency, updated_at) on public.admin_backup_schedule to authenticated;
/* Leftover default grants nothing uses (TRUNCATE ignores RLS). */
revoke truncate, trigger, references, maintain on public.admin_backup_snapshots, public.admin_backup_schedule from anon, authenticated;

/* Download one snapshot. Admin with two-step only. Logged here, so it cannot be skipped. */
create or replace function public.admin_get_backup(p_id text)
returns jsonb language plpgsql security definer set search_path to 'public'
as $fn$
declare v_data jsonb;
begin
  if not public.acx_admin_mfa() then
    raise exception 'Admin two-step verification required' using errcode = '42501';
  end if;
  select s.data into v_data from public.admin_backup_snapshots s where s.id = p_id and s.status = 'success';
  if v_data is null then
    raise exception 'Snapshot not found or it has no data' using errcode = 'P0001';
  end if;
  perform public.log_admin_event('admin_backup_downloaded', 'downloaded snapshot ' || p_id, null);
  return v_data;
end
$fn$;
revoke execute on function public.admin_get_backup(text) from public, anon;
grant execute on function public.admin_get_backup(text) to authenticated, service_role;

/* Delete one snapshot. Admin with two-step only. The newest good snapshot cannot */
/* be deleted, so one always stays. Logged here. Returns the deleted id. */
create or replace function public.admin_delete_backup(p_id text)
returns text language plpgsql security definer set search_path to 'public'
as $fn$
declare v_newest text; v_id text;
begin
  if not public.acx_admin_mfa() then
    raise exception 'Admin two-step verification required' using errcode = '42501';
  end if;
  select s.id into v_newest from public.admin_backup_snapshots s
   where s.status = 'success' order by s.created_at desc, s.id desc limit 1;
  if p_id = v_newest then
    raise exception 'The newest good snapshot is kept and cannot be deleted' using errcode = '22023';
  end if;
  delete from public.admin_backup_snapshots as s where s.id = p_id returning s.id into v_id;
  if v_id is null then
    raise exception 'Snapshot not found' using errcode = 'P0001';
  end if;
  perform public.log_admin_event('admin_backup_deleted', 'deleted snapshot ' || v_id, null);
  return v_id;
end
$fn$;
revoke execute on function public.admin_delete_backup(text) from public, anon;
grant execute on function public.admin_delete_backup(text) to authenticated, service_role;

/* Owner decision: clean-up so the table stops growing (about 1 MB per snapshot). */
/* Same schedule rules as before (the cron job decides daily or weekly). After */
/* each GOOD scheduled snapshot: delete scheduled and failed snapshots older than */
/* 30 days, but always keep the newest 7 good scheduled ones. Good manual */
/* snapshots are never deleted automatically. */
create or replace function public.run_scheduled_backup()
returns void language plpgsql security definer set search_path to 'public'
as $fn$
declare v_freq text; v_status text;
begin
  select frequency into v_freq from public.admin_backup_schedule where id = true;
  if v_freq is null or v_freq = 'off' then
    return;
  end if;
  select r.status into v_status from public.run_backup_snapshot('scheduled') r;
  if v_status = 'success' then
    delete from public.admin_backup_snapshots s
     where s.created_at < now() - interval '30 days'
       and (s.type = 'scheduled' or s.status = 'failed')
       and s.id not in (
         select k.id from public.admin_backup_snapshots k
          where k.status = 'success' and k.type = 'scheduled'
          order by k.created_at desc limit 7);
  end if;
end
$fn$;
revoke execute on function public.run_scheduled_backup() from public, anon, authenticated;

/* Backup now already refuses everyone except an admin with two-step; this also */
/* removes the PUBLIC and anon grants. */
revoke execute on function public.trigger_manual_backup() from public, anon;
grant execute on function public.trigger_manual_backup() to authenticated, service_role;

/* 10. Owner decision: a course is announced ("New course: ...") only the first */
/* time it goes live. Switching an old course off and on again sent everyone a */
/* "New course" notice (it happened on 2026-10-22 for Network Forensics). */
alter table public.courses add column if not exists announced_at timestamptz;
/* Every course that exists today is old news. */
update public.courses set announced_at = coalesce(created_at, now()) where announced_at is null;
create or replace function public.acx_notify_new_content()
returns trigger language plpgsql security definer set search_path to 'public'
as $function$
begin
  if tg_table_name = 'ctf_challenges' then
    if new.status = 'active' and (tg_op = 'INSERT' or old.status is distinct from 'active') then
      perform public.acx_announce('ctf', 'New CTF room: ' || new.title,
        left(coalesce(new.description, ''), 140), '/rooms?open=' || new.slug);
    end if;
  elsif tg_table_name = 'courses' then
    if new.enabled and new.announced_at is null and (tg_op = 'INSERT' or not coalesce(old.enabled, false)) then
      perform public.acx_announce('course', 'New course: ' || new.title,
        left(coalesce(new.description, ''), 140),
        case when coalesce(new.slug, '') <> '' then '/tutorials/' || new.slug else '/tutorials' end);
      /* Not UPDATE OF enabled, so this does not run the trigger again. */
      update public.courses set announced_at = now() where id = new.id;
    end if;
  elsif tg_table_name = 'blog_posts' then
    if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
      perform public.acx_announce('blog', 'New on the blog: ' || new.title,
        left(coalesce(new.meta_desc, ''), 140), '/blog/' || new.slug);
    end if;
  end if;
  return new;
end;
$function$;
/* The wrong notice from that test (its read marks go with it). */
delete from public.notifications
 where user_id is null and type = 'course' and title = 'New course: Network Forensics'
   and link = '/tutorials/network-forensics'
   and created_at >= '2026-10-22' and created_at < '2026-10-23';

commit;

notify pgrst, 'reload schema';
