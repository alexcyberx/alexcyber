/* Admin panel phase 3 (docs/ADMIN-PORT.md): what the new Courses, Resources and */
/* CTF sections need from the DB, plus the bugs found while building them. */
/* Run once in the Supabase SQL Editor. Everything runs in one transaction: */
/* if any step fails, nothing is changed. */
/* Only block comments on purpose: pasting on a phone can put the whole file on */
/* one line, and a line comment would then hide everything after it. */

begin;

/* 1. Chapter switches really hide chapters on the site. */
/* The site reads with the anon key, and RLS lets anon see only enabled = true */
/* rows, so a switched-off chapter looked like "no row = visible" and stayed on */
/* the site. This returns only (course, slug) of switched-off chapters, no text. */
create or replace function public.get_hidden_chapters()
returns table (course text, slug text)
language sql stable security definer set search_path = public
as $$ select c.course, c.slug from public.content_chapters c where c.enabled = false $$;
revoke all on function public.get_hidden_chapters() from public;
grant execute on function public.get_hidden_chapters() to anon, authenticated;

/* 2. Chapter slugs are unique per course, not site-wide: the site's own slugs */
/* repeat across courses (sql-injection is in Cyber Attacks and Ethical Hacking). */
/* Then the Ethical Hacking rows get the site's slugs (they were 'eh-<slug>', so */
/* none matched the site, chapter_progress or the switches). All 23 Ethical */
/* Hacking chapters have their text in the code, so no page content changes. */
alter table public.content_chapters drop constraint if exists content_chapters_slug_key;
/* If a plain-slug Ethical Hacking row was already made for a chapter that also */
/* has an 'eh-' row, keep one row (hidden if either was hidden) so the rename */
/* below cannot collide. */
update public.content_chapters e set enabled = false
  from public.content_chapters p
 where e.course = 'ethical-hacking' and p.course = 'ethical-hacking' and e.slug like 'eh-%'
   and p.slug = case e.slug when 'eh-evading-ids-firewalls-honeypots' then 'evading-ids-firewalls-and-honeypots'
                            when 'eh-advanced-iot-ot-security' then 'advanced-iot-and-ot-security' else substr(e.slug, 4) end
   and p.enabled = false;
delete from public.content_chapters p
 using public.content_chapters e
 where e.course = 'ethical-hacking' and p.course = 'ethical-hacking' and e.slug like 'eh-%'
   and p.slug = case e.slug when 'eh-evading-ids-firewalls-honeypots' then 'evading-ids-firewalls-and-honeypots'
                            when 'eh-advanced-iot-ot-security' then 'advanced-iot-and-ot-security' else substr(e.slug, 4) end;
alter table public.content_chapters add constraint content_chapters_course_slug_key unique (course, slug);
update public.content_chapters
   set slug = case slug
     when 'eh-evading-ids-firewalls-honeypots' then 'evading-ids-firewalls-and-honeypots'
     when 'eh-advanced-iot-ot-security' then 'advanced-iot-and-ot-security'
     else substr(slug, 4)
   end
 where course = 'ethical-hacking' and slug like 'eh-%';

/* 3. Admins can read resource files in Storage. Supabase Storage remove() */
/* needs SELECT as well as DELETE; without it a delete or replace removed */
/* nothing and returned no error (files were left behind). The restrictive */
/* acx_admin_mfa_resources policy keeps it to two-step (aal2) sessions. */
/* The bucket is public, so what it accepts is enforced here, not only in the */
/* panel: no HTML/SVG/scripts served from our domain's storage, 50 MB max. */
/* (Same list the new panel sends; existing files are not touched.) */
update storage.buckets
   set allowed_mime_types = array['application/pdf','text/plain','application/octet-stream','image/png','image/jpeg','image/webp'],
       file_size_limit = 52428800
 where id = 'resources';
drop policy if exists "Admins can read resource files" on storage.objects;
create policy "Admins can read resource files" on storage.objects for select to authenticated
  using (bucket_id = 'resources' and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

/* 4. CTF: lab rooms check prerequisites too, and ctf_solves.points_earned */
/* stores the XP actually given (coalesce(xp, points)), so profiles show the */
/* right number. Bodies are the live ones with only those two changes. */
create or replace function public.record_lab_ctf_solve(p_user_id uuid, p_slug text)
returns jsonb
language plpgsql security definer set search_path to 'public'
as $function$
declare
  v_challenge   ctf_challenges%rowtype;
  v_already     boolean;
  v_new_xp      integer;
  v_new_level   integer;
  v_award       integer;
  v_req_slug    text;
  v_req_solved  boolean;
  v_missing     text[] := '{}';
begin
  select * into v_challenge from ctf_challenges where slug = p_slug;
  if not found then
    return jsonb_build_object('success', false, 'error', 'not_found');
  end if;
  if not public.acx_not_banned(p_user_id) then
    return jsonb_build_object('success', false, 'error', 'suspended');
  end if;

  if v_challenge.status <> 'active' then
    return jsonb_build_object('success', false, 'error', 'inactive');
  end if;

  /* Same prerequisite rule as submit_ctf_flag. */
  if v_challenge.requires is not null and jsonb_array_length(v_challenge.requires) > 0 then
    for v_req_slug in select jsonb_array_elements_text(v_challenge.requires) loop
      select exists(
        select 1 from ctf_solves s
        join ctf_challenges rc on rc.id = s.challenge_id
        where s.user_id = p_user_id and rc.slug = v_req_slug
      ) into v_req_solved;
      if not v_req_solved then
        v_missing := array_append(v_missing, v_req_slug);
      end if;
    end loop;
    if array_length(v_missing, 1) > 0 then
      return jsonb_build_object('success', false, 'error', 'locked',
        'message', 'Solve the required challenge(s) first: ' || array_to_string(v_missing, ', '),
        'missing_requirements', to_jsonb(v_missing));
    end if;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || v_challenge.id::text, 0));

  select exists(
    select 1 from ctf_solves
    where user_id = p_user_id and challenge_id = v_challenge.id
  ) into v_already;

  if v_already then
    return jsonb_build_object('success', true, 'already_solved', true);
  end if;

  v_award := coalesce(v_challenge.xp, v_challenge.points, 0);

  /* on_ctf_solve_insert trigger increments ctf_challenges.solvers; no manual +1. */
  insert into ctf_solves (user_id, challenge_id, points_earned, correct)
  values (p_user_id, v_challenge.id, v_award, true);

  update profiles
    set xp = coalesce(xp, 0) + v_award,
        ctf_solves = coalesce(ctf_solves, 0) + 1
    where id = p_user_id
    returning xp into v_new_xp;

  v_new_level := greatest(1, floor(coalesce(v_new_xp, 0) / 500.0) + 1);
  update profiles set level = v_new_level where id = p_user_id;

  return jsonb_build_object(
    'success', true,
    'already_solved', false,
    'points_earned', v_award,
    'xp_earned', v_award,
    'new_xp', v_new_xp,
    'new_level', v_new_level
  );
end;
$function$;

create or replace function public.submit_ctf_flag(p_challenge_id uuid, p_flag text)
returns jsonb
language plpgsql security definer set search_path to 'public'
as $function$
declare
  v_challenge   ctf_challenges%rowtype;
  v_uid         uuid := auth.uid();
  v_already     boolean;
  v_new_xp      integer;
  v_new_level   integer;
  v_award       integer;
  v_req_slug    text;
  v_req_solved  boolean;
  v_missing     text[] := '{}';
  v_max_wrong   constant integer  := 5;
  v_window      constant interval := interval '60 seconds';
  v_fifth       timestamptz;
  v_retry       integer;
begin
  if v_uid is null then
    return jsonb_build_object('correct', false, 'already_solved', false,
      'error', 'auth_required', 'message', 'Login required to submit flags.');
  end if;
  if not public.acx_not_banned(v_uid) then
    return jsonb_build_object('correct', false, 'already_solved', false,
      'error', 'suspended', 'message', 'Your account is suspended.');
  end if;

  if p_flag is null or btrim(p_flag) = '' then
    return jsonb_build_object('correct', false, 'already_solved', false,
      'error', 'no_flag', 'message', 'No flag provided.');
  end if;

  select * into v_challenge from ctf_challenges where id = p_challenge_id;
  if not found then
    return jsonb_build_object('correct', false, 'already_solved', false,
      'error', 'not_found', 'message', 'Challenge not found.');
  end if;

  if v_challenge.status <> 'active' then
    return jsonb_build_object('correct', false, 'already_solved', false,
      'error', 'inactive', 'message', 'This challenge is not currently active.');
  end if;

  /* requires holds slugs; ctf_solves tracks challenge_id (uuid), so join to get the solved slugs. */
  if v_challenge.requires is not null and jsonb_array_length(v_challenge.requires) > 0 then
    for v_req_slug in select jsonb_array_elements_text(v_challenge.requires) loop
      select exists(
        select 1 from ctf_solves s
        join ctf_challenges rc on rc.id = s.challenge_id
        where s.user_id = v_uid and rc.slug = v_req_slug
      ) into v_req_solved;
      if not v_req_solved then
        v_missing := array_append(v_missing, v_req_slug);
      end if;
    end loop;

    if array_length(v_missing, 1) > 0 then
      return jsonb_build_object('correct', false, 'already_solved', false,
        'error', 'locked',
        'message', 'Solve the required challenge(s) first: ' || array_to_string(v_missing, ', '),
        'missing_requirements', to_jsonb(v_missing));
    end if;
  end if;

  /* Lock first, so two parallel submissions from the same user cannot both */
  /* count as a first solve (and so the rate limit below cannot be raced). */
  perform pg_advisory_xact_lock(hashtextextended(v_uid::text || ':' || v_challenge.id::text, 0));

  select exists(
    select 1 from ctf_solves
    where user_id = v_uid and challenge_id = v_challenge.id
  ) into v_already;

  /* Rate limit: 5 wrong attempts per user per challenge in 60 seconds. */
  select attempted_at into v_fifth
  from ctf_flag_attempts
  where user_id = v_uid
    and challenge_id = v_challenge.id
    and attempted_at > now() - v_window
  order by attempted_at desc
  limit 1 offset (v_max_wrong - 1);

  if v_fifth is not null then
    v_retry := greatest(1, ceil(extract(epoch from (v_fifth + v_window - now())))::integer);
    return jsonb_build_object('correct', false, 'already_solved', false,
      'error', 'rate_limited',
      'message', 'Too many incorrect attempts. Try again in ' || v_retry || ' seconds.',
      'retry_after', v_retry);
  end if;

  /* The flag is checked for everyone, including players who already solved it. */
  if v_challenge.flag_hash is null or encode(extensions.digest(btrim(p_flag), 'sha256'), 'hex') <> v_challenge.flag_hash then
    insert into ctf_flag_attempts (user_id, challenge_id) values (v_uid, v_challenge.id);
    delete from ctf_flag_attempts
      where user_id = v_uid and challenge_id = v_challenge.id
        and attempted_at < now() - interval '1 hour';
    return jsonb_build_object('correct', false, 'already_solved', false,
      'error', 'wrong_flag', 'message', 'Incorrect flag. Keep digging.');
  end if;

  if v_already then
    return jsonb_build_object('correct', true, 'already_solved', true, 'points_earned', 0,
      'message', 'Already solved. Nice work the first time around.');
  end if;

  v_award := coalesce(v_challenge.xp, v_challenge.points, 0);

  /* Correct + first solve. The on_ctf_solve_insert trigger adds 1 to solvers. */
  insert into ctf_solves (user_id, challenge_id, points_earned, correct)
  values (v_uid, v_challenge.id, v_award, true);

  update profiles
    set xp = coalesce(xp, 0) + v_award,
        ctf_solves = coalesce(ctf_solves, 0) + 1
    where id = v_uid
    returning xp, level into v_new_xp, v_new_level;

  v_new_level := greatest(1, floor(coalesce(v_new_xp, 0) / 500.0) + 1);
  update profiles set level = v_new_level where id = v_uid;

  return jsonb_build_object(
    'correct', true,
    'already_solved', false,
    'points_earned', v_award,
    'xp_earned', v_award,
    'new_xp', v_new_xp,
    'new_level', v_new_level,
    'message', 'Correct flag.'
  );
end;
$function$;

/* Past solves stored points instead of the XP given; fix the ones that differ */
/* (only rows that still hold the points value, so this is safe to re-run). */
update public.ctf_solves s
   set points_earned = coalesce(c.xp, c.points, 0)
  from public.ctf_challenges c
 where c.id = s.challenge_id and s.correct is true
   and c.xp is not null and s.points_earned = c.points and c.xp <> c.points;

/* 5. The solver counter players see was reset to 0 by the old panel; set it */
/* to the real number of correct solves (the trigger keeps it from here). */
update public.ctf_challenges c
   set solvers = (select count(*) from public.ctf_solves s where s.challenge_id = c.id and s.correct is true);

/* 6. Blog category names unique without case ('Tools' and 'tools' would be two */
/* filter buttons with the same label on the blog). */
create unique index if not exists blog_categories_name_lower_key on public.blog_categories (lower(name));

/* 7. Chapter XP only for real chapters that are switched on, never twice. */
/* Before, any made-up (course, slug) pair gave chapter XP (XP farming), a */
/* hidden chapter still gave XP, banned users got XP, and two calls at the same */
/* time could both award it. Every chapter of the site has a content_chapters */
/* row (checked 2026-10-21: 25 + 11 + 23 after step 2). */
create or replace function public.track_chapter_view(p_course text, p_chapter_slug text)
returns void
language plpgsql security definer set search_path to 'public'
as $function$
declare
  v_inserted   integer;
  v_chapter_xp integer;
begin
  if auth.uid() is null then
    return; /* visitors are not tracked */
  end if;
  if not public.acx_not_banned(auth.uid()) then
    return;
  end if;
  /* Same rule as the site: the chapter row is on AND its course is on. */
  if not exists (select 1 from public.content_chapters c
                 join public.courses k on k.course_key = c.course and k.enabled = true
                 where c.course = p_course and c.slug = p_chapter_slug and c.enabled = true) then
    return; /* not a chapter of the site, or it (or its course) is switched off */
  end if;

  insert into public.chapter_progress (user_id, course, chapter_slug)
  values (auth.uid(), p_course, p_chapter_slug)
  on conflict (user_id, course, chapter_slug) do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return; /* already seen: no XP again (also when two calls race) */
  end if;

  select coalesce((value->>'chapter_completion')::integer, 25) into v_chapter_xp
    from public.platform_settings where key = 'xp_rules';

  update public.profiles
     set xp    = coalesce(profiles.xp, 0) + coalesce(v_chapter_xp, 25),
         level = greatest(1, floor((coalesce(profiles.xp, 0) + coalesce(v_chapter_xp, 25)) / 500) + 1)
   where id = auth.uid();
end;
$function$;

/* 8. Blog "last edited" is not bumped by page views (blog_increment_views */
/* updates the row on every view). */
create or replace function public.blog_set_updated_at()
returns trigger
language plpgsql set search_path = public
as $function$
begin
  if (to_jsonb(new) - 'views' - 'updated_at') = (to_jsonb(old) - 'views' - 'updated_at') then
    new.updated_at = old.updated_at;
  else
    new.updated_at = now();
  end if;
  return new;
end;
$function$;

commit;
