-- 2026-10-14: step 5a security fixes (docs/AUDIT-2026-10-09.md items 32+). Applied.
-- (Policies are changed with ALTER POLICY: the Supabase tool waits for a manual
-- confirmation on DROP statements, so nothing is dropped.)
-- 1) Banned users (profiles.is_banned) could still do everything: post, reply,
--    vote, report, submit flags, get lab XP and daily XP. Now refused in the DB.
-- 2) Community: owners could self-pin/unlock, set their own vote count and
--    backdate threads (the UPDATE/INSERT policies had no column limits);
--    vote_value was unbounded; a locked thread still accepted replies and votes;
--    no length or rate limits; status/category were free text (rendered in the
--    admin panel, stored XSS).
-- 3) track_page_view stored any device_type string (stored XSS in the admin
--    Analytics device breakdown) and unbounded page/session values.
-- 4) Admin analytics RPCs were callable by anyone.
-- 5) CTF Manager writes always failed: authenticated had no table privilege on
--    ctf_challenges, so the admin-only RLS policies could never apply.
-- 6) Contact form e-mail allowed quotes/parentheses (used in an admin onclick).
-- 7) AlexRecon schedules/scans could be written directly from the browser,
--    bypassing the server's limits (the server writes them with the service role).

-- ── helpers ──
CREATE OR REPLACE FUNCTION public.acx_is_admin(p_uid uuid DEFAULT auth.uid())
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ select exists(select 1 from profiles where id = p_uid and role = 'admin') $$;

-- true for a logged-in user who is not banned (a missing profile row counts as not banned)
CREATE OR REPLACE FUNCTION public.acx_not_banned(p_uid uuid DEFAULT auth.uid())
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ select p_uid is not null and not exists(select 1 from profiles where id = p_uid and coalesce(is_banned, false)) $$;

REVOKE ALL ON FUNCTION public.acx_is_admin(uuid), public.acx_not_banned(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.acx_is_admin(uuid), public.acx_not_banned(uuid) TO anon, authenticated, service_role;

-- ── 1) bans in the flag / XP functions ──
DO $$
DECLARE d text; n text;
BEGIN
  d := pg_get_functiondef('public.submit_ctf_flag(uuid, text)'::regprocedure);
  IF position('''suspended''' in d) = 0 THEN
    n := regexp_replace(d, '(\n\s*IF p_flag IS NULL OR btrim\(p_flag\) = '''' THEN)',
      E'\n  IF NOT public.acx_not_banned(v_uid) THEN\n    RETURN jsonb_build_object(''correct'', false, ''already_solved'', false,\n      ''error'', ''suspended'', ''message'', ''Your account is suspended.'');\n  END IF;\n\\1');
    IF n = d THEN RAISE EXCEPTION 'submit_ctf_flag: anchor not found'; END IF;
    EXECUTE n;
  END IF;

  d := pg_get_functiondef('public.record_lab_ctf_solve(uuid, text)'::regprocedure);
  IF position('''suspended''' in d) = 0 THEN
    n := regexp_replace(d, '(\n\s*IF v_challenge.status <> ''active'' THEN)',
      E'\n  IF NOT public.acx_not_banned(p_user_id) THEN\n    RETURN jsonb_build_object(''success'', false, ''error'', ''suspended'');\n  END IF;\n\\1');
    IF n = d THEN RAISE EXCEPTION 'record_lab_ctf_solve: anchor not found'; END IF;
    EXECUTE n;
  END IF;

  d := pg_get_functiondef('public.award_daily_login_xp()'::regprocedure);
  IF position('acx_not_banned' in d) = 0 THEN
    n := regexp_replace(d, '(\n\s*SELECT last_seen INTO v_last_seen)',
      E'\n  IF NOT public.acx_not_banned(auth.uid()) THEN\n    RETURN jsonb_build_object(''awarded'', false);\n  END IF;\n\\1');
    IF n = d THEN RAISE EXCEPTION 'award_daily_login_xp: anchor not found'; END IF;
    EXECUTE n;
  END IF;
END $$;

-- ── 2) community ──
ALTER TABLE public.community_threads
  DROP CONSTRAINT IF EXISTS community_threads_status_check,
  DROP CONSTRAINT IF EXISTS community_threads_category_check,
  DROP CONSTRAINT IF EXISTS community_threads_len_check,
  ADD CONSTRAINT community_threads_status_check CHECK (status IN ('open', 'pinned', 'locked')),
  ADD CONSTRAINT community_threads_category_check CHECK (category IN ('general', 'help', 'ctf', 'tools', 'news')),
  ADD CONSTRAINT community_threads_len_check CHECK (char_length(title) BETWEEN 1 AND 200 AND char_length(body) BETWEEN 1 AND 5000);
ALTER TABLE public.community_replies
  DROP CONSTRAINT IF EXISTS community_replies_status_check,
  DROP CONSTRAINT IF EXISTS community_replies_len_check,
  ADD CONSTRAINT community_replies_status_check CHECK (status IN ('pending', 'approved', 'rejected')),
  ADD CONSTRAINT community_replies_len_check CHECK (char_length(body) BETWEEN 1 AND 3000);
ALTER TABLE public.community_reports
  DROP CONSTRAINT IF EXISTS community_reports_status_check,
  DROP CONSTRAINT IF EXISTS community_reports_reason_len_check,
  ADD CONSTRAINT community_reports_status_check CHECK (status IN ('open', 'resolved', 'dismissed', 'escalated')),
  ADD CONSTRAINT community_reports_reason_len_check CHECK (char_length(coalesce(reason, '')) <= 1000);
ALTER TABLE public.community_votes
  DROP CONSTRAINT IF EXISTS community_votes_value_check,
  ADD CONSTRAINT community_votes_value_check CHECK (vote_value IN (1, -1));

-- Direct browser writes (role anon/authenticated) of non-admins may only set
-- the content columns. Moderation fields, counters and timestamps are kept.
-- RPCs (SECURITY DEFINER, e.g. vote_thread) run as the owner and are not limited.
CREATE OR REPLACE FUNCTION public.acx_community_guard()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $fn$
BEGIN
  IF current_user NOT IN ('authenticated', 'anon') OR public.acx_is_admin() THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.created_at := now();
    IF TG_TABLE_NAME = 'community_threads' THEN
      NEW.status := 'open'; NEW.votes := 0;
      IF (SELECT count(*) FROM community_threads WHERE user_id = NEW.user_id AND created_at > now() - interval '1 hour') >= 5 THEN
        RAISE EXCEPTION 'You are posting too fast. Please try again later.' USING errcode = 'P0001';
      END IF;
    ELSIF TG_TABLE_NAME = 'community_replies' THEN
      NEW.status := 'approved'; NEW.votes := 0;
      IF (SELECT count(*) FROM community_replies WHERE user_id = NEW.user_id AND created_at > now() - interval '1 hour') >= 30 THEN
        RAISE EXCEPTION 'You are replying too fast. Please try again later.' USING errcode = 'P0001';
      END IF;
    ELSIF TG_TABLE_NAME = 'community_reports' THEN
      NEW.status := 'open';
    END IF;
  ELSIF TG_TABLE_NAME IN ('community_threads', 'community_replies') THEN
    -- owner edit: only the text may change
    NEW.user_id := OLD.user_id;
    NEW.created_at := OLD.created_at;
    NEW.status := OLD.status;
    NEW.votes := OLD.votes;
    IF TG_TABLE_NAME = 'community_replies' THEN NEW.thread_id := OLD.thread_id; END IF;
  ELSE
    RETURN OLD; -- reports: only admins may change them
  END IF;
  RETURN NEW;
END $fn$;

DROP TRIGGER IF EXISTS acx_community_guard ON public.community_threads;
DROP TRIGGER IF EXISTS acx_community_guard ON public.community_replies;
DROP TRIGGER IF EXISTS acx_community_guard ON public.community_reports;
CREATE TRIGGER acx_community_guard BEFORE INSERT OR UPDATE ON public.community_threads FOR EACH ROW EXECUTE FUNCTION public.acx_community_guard();
CREATE TRIGGER acx_community_guard BEFORE INSERT OR UPDATE ON public.community_replies FOR EACH ROW EXECUTE FUNCTION public.acx_community_guard();
CREATE TRIGGER acx_community_guard BEFORE INSERT OR UPDATE ON public.community_reports FOR EACH ROW EXECUTE FUNCTION public.acx_community_guard();

ALTER POLICY "Logged in users can create threads" ON public.community_threads
  WITH CHECK (auth.uid() = user_id AND public.acx_not_banned());
ALTER POLICY "Logged in users can reply" ON public.community_replies
  WITH CHECK (auth.uid() = user_id AND public.acx_not_banned()
    AND EXISTS (SELECT 1 FROM public.community_threads t WHERE t.id = thread_id AND t.status <> 'locked'));
ALTER POLICY "Logged in users can create reports" ON public.community_reports
  WITH CHECK (auth.uid() = reporter_id AND public.acx_not_banned());
-- Votes only through vote_thread() (it keeps the thread's vote total right).
ALTER POLICY "Logged in users can vote" ON public.community_votes WITH CHECK (false);
ALTER POLICY "Users can change own vote" ON public.community_votes USING (false);

CREATE OR REPLACE FUNCTION public.vote_thread(p_thread_id uuid, p_value integer)
 RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_existing integer;
  v_new_total integer;
  v_status text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Login required'; END IF;
  IF p_value NOT IN (1, -1) THEN RAISE EXCEPTION 'Invalid vote value'; END IF;
  IF NOT public.acx_not_banned() THEN RAISE EXCEPTION 'Your account is suspended.'; END IF;
  SELECT status INTO v_status FROM public.community_threads WHERE id = p_thread_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Thread not found'; END IF;
  IF v_status = 'locked' THEN RAISE EXCEPTION 'This thread is locked.'; END IF;

  -- one vote per user per thread, even with parallel clicks
  PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text || ':vote:' || p_thread_id::text, 0));
  SELECT vote_value INTO v_existing FROM public.community_votes
    WHERE user_id = auth.uid() AND thread_id = p_thread_id;
  IF v_existing IS NULL THEN
    INSERT INTO public.community_votes (user_id, thread_id, vote_value) VALUES (auth.uid(), p_thread_id, p_value);
  ELSIF v_existing = p_value THEN
    DELETE FROM public.community_votes WHERE user_id = auth.uid() AND thread_id = p_thread_id; -- same vote again = remove
  ELSE
    UPDATE public.community_votes SET vote_value = p_value WHERE user_id = auth.uid() AND thread_id = p_thread_id;
  END IF;

  SELECT coalesce(sum(vote_value), 0) INTO v_new_total FROM public.community_votes WHERE thread_id = p_thread_id;
  UPDATE public.community_threads SET votes = v_new_total WHERE id = p_thread_id;
  RETURN v_new_total;
END;
$function$;

-- ── 3) page views ──
CREATE OR REPLACE FUNCTION public.track_page_view(p_page text, p_device_type text DEFAULT 'unknown'::text, p_session_id text DEFAULT NULL::text)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF p_page IS NULL OR btrim(p_page) = '' THEN RETURN; END IF;
  INSERT INTO public.page_views (page, user_id, device_type, session_id)
  VALUES (
    left(p_page, 200),
    auth.uid(),
    CASE WHEN lower(p_device_type) IN ('desktop', 'mobile', 'tablet') THEN lower(p_device_type) ELSE 'unknown' END,
    left(p_session_id, 100)
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.track_page_view(p_page text)
 RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $$ select public.track_page_view(p_page, 'unknown', null) $$;

-- ── 4) admin-only analytics ──
DO $$
DECLARE f text; d text; n text;
BEGIN
  FOREACH f IN ARRAY ARRAY['public.get_page_view_stats()', 'public.get_course_completion_stats()'] LOOP
    d := pg_get_functiondef(f::regprocedure);
    IF position('acx_is_admin' in d) = 0 THEN
      n := regexp_replace(d, '(\n\s*begin\s*\n)', E'\\1  if not public.acx_is_admin() then raise exception ''Not allowed'' using errcode = ''42501''; end if;\n', 'i');
      IF n = d THEN RAISE EXCEPTION '%: anchor not found', f; END IF;
      EXECUTE n;
    END IF;
  END LOOP;
END $$;

-- ── 5) CTF Manager: privileges so the existing admin-only RLS policies apply.
-- (SELECT stays column-level without `flag`, so nobody can read flags.)
GRANT INSERT, UPDATE, DELETE ON public.ctf_challenges TO authenticated;

-- ── 6) contact e-mail: plain address characters only ──
DO $$
DECLARE d text; n text;
BEGIN
  d := pg_get_functiondef('public.submit_contact_message(text, text, text)'::regprocedure);
  IF position('A-Za-z0-9._%+-' in d) = 0 THEN
    n := replace(d, $q$v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'$q$, $q$v_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'$q$);
    IF n = d THEN RAISE EXCEPTION 'submit_contact_message: anchor not found'; END IF;
    EXECUTE n;
  END IF;
END $$;

-- ── 7) AlexRecon: the server (service role) is the only writer ──
ALTER POLICY "Users can insert own alexrecon schedules" ON public.alexrecon_schedules WITH CHECK (false);
ALTER POLICY "Users can update own alexrecon schedules" ON public.alexrecon_schedules USING (false);
ALTER POLICY "Users can delete own alexrecon schedules" ON public.alexrecon_schedules USING (false);
ALTER POLICY "Users can insert own alexrecon scans" ON public.alexrecon_scans WITH CHECK (false);
ALTER POLICY "Users can update own alexrecon scans" ON public.alexrecon_scans USING (false);

-- ── 8) attack detector: auto-blocks expire (server/middleware/attackDetection.js
-- sets expires_at; NULL = permanent manual block from the admin panel) ──
ALTER TABLE public.blocked_ips ADD COLUMN IF NOT EXISTS expires_at timestamptz;
