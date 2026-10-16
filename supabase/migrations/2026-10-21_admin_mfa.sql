-- Admin powers need the two-step login (MFA, session level aal2).
--
-- Before: anyone holding the admin's password (or an aal1 session) had full
-- admin access through RLS. Now admin-only data and every admin write need an
-- aal2 session, which the admin panel gets after the authenticator-app code
-- (js/admin-panel-app.js startMfa / doMfaVerify).
--
-- Normal users are not affected: for non-admins the new policies are always
-- true. The admin's own normal-site actions (own profile, own posts/reports)
-- keep working without MFA.
--
-- Lost phone: delete the admin's factor in Supabase (Authentication -> Users ->
-- the user -> MFA factors, or `delete from auth.mfa_factors where user_id = ...`)
-- and set it up again on the next admin login.

CREATE OR REPLACE FUNCTION public.acx_admin_mfa(p_uid uuid DEFAULT auth.uid())
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $fn$ select public.acx_is_admin(p_uid) and coalesce(auth.jwt() ->> 'aal', '') = 'aal2' $fn$;
REVOKE EXECUTE ON FUNCTION public.acx_admin_mfa(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.acx_admin_mfa(uuid) TO authenticated, service_role;

-- True for everyone except an admin without aal2.
CREATE OR REPLACE FUNCTION public.acx_mfa_ok()
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $fn$ select not public.acx_is_admin(auth.uid()) or coalesce(auth.jwt() ->> 'aal', '') = 'aal2' $fn$;
REVOKE EXECUTE ON FUNCTION public.acx_mfa_ok() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.acx_mfa_ok() TO authenticated, service_role;

DO $$
DECLARE t text; own text; cmd text;
BEGIN
  -- 1) Admin-only tables (no access for normal users at all): every command needs MFA.
  FOREACH t IN ARRAY ARRAY['admin_audit_log','admin_backup_schedule','admin_backup_snapshots','app_config',
    'blocked_ips','broadcasts','contact_messages','ctf_attempts','page_views','security_logs'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS acx_admin_mfa_all ON public.%I', t);
    EXECUTE format('CREATE POLICY acx_admin_mfa_all ON public.%I AS RESTRICTIVE FOR ALL TO authenticated
      USING (public.acx_mfa_ok()) WITH CHECK (public.acx_mfa_ok())', t);
  END LOOP;

  -- 2) Shared tables: admin writes need MFA; own rows stay free.
  FOR t, own IN SELECT * FROM (VALUES
      ('profiles', 'id = auth.uid()'),
      ('community_threads', 'user_id = auth.uid()'),
      ('community_replies', 'user_id = auth.uid()'),
      ('community_reports', 'reporter_id = auth.uid()'),
      ('admin_feedback', 'user_id = auth.uid()'),
      ('notifications', 'user_id = auth.uid()'),
      ('courses', 'false'), ('content_chapters', 'false'), ('blog_posts', 'false'), ('blog_categories', 'false'),
      ('resources', 'false'), ('ctf_challenges', 'false'), ('platform_settings', 'false'), ('tool_settings', 'false')
    ) v(t, own) LOOP
    FOREACH cmd IN ARRAY ARRAY['insert','update','delete'] LOOP
      EXECUTE format('DROP POLICY IF EXISTS acx_admin_mfa_%s ON public.%I', cmd, t);
      IF cmd = 'insert' THEN
        EXECUTE format('CREATE POLICY acx_admin_mfa_insert ON public.%I AS RESTRICTIVE FOR INSERT TO authenticated
          WITH CHECK (public.acx_mfa_ok() OR (%s))', t, own);
      ELSIF cmd = 'update' THEN
        EXECUTE format('CREATE POLICY acx_admin_mfa_update ON public.%I AS RESTRICTIVE FOR UPDATE TO authenticated
          USING (public.acx_mfa_ok() OR (%s)) WITH CHECK (public.acx_mfa_ok() OR (%s))', t, own, own);
      ELSE
        EXECUTE format('CREATE POLICY acx_admin_mfa_delete ON public.%I AS RESTRICTIVE FOR DELETE TO authenticated
          USING (public.acx_mfa_ok() OR (%s))', t, own);
      END IF;
    END LOOP;
  END LOOP;

  -- 3) Other users' private rows that admins may read: reading them needs MFA.
  FOR t, own IN SELECT * FROM (VALUES
      ('alexrecon_scans', 'user_id = auth.uid()'), ('chapter_progress', 'user_id = auth.uid()'),
      ('ctf_hint_unlocks', 'user_id = auth.uid()'), ('tool_usage_logs', 'user_id = auth.uid()'),
      ('admin_feedback', 'user_id = auth.uid()'), ('community_reports', 'reporter_id = auth.uid()')
    ) v(t, own) LOOP
    EXECUTE format('DROP POLICY IF EXISTS acx_admin_mfa_select ON public.%I', t);
    EXECUTE format('CREATE POLICY acx_admin_mfa_select ON public.%I AS RESTRICTIVE FOR SELECT TO authenticated
      USING (public.acx_mfa_ok() OR (%s))', t, own);
  END LOOP;
END $$;

-- 4) Resource files (Storage bucket "resources"): admin uploads/changes need MFA.
DROP POLICY IF EXISTS acx_admin_mfa_resources ON storage.objects;
CREATE POLICY acx_admin_mfa_resources ON storage.objects AS RESTRICTIVE FOR ALL TO authenticated
  USING (bucket_id <> 'resources' OR public.acx_mfa_ok())
  WITH CHECK (bucket_id <> 'resources' OR public.acx_mfa_ok());

-- 5) Admin RPCs: same rule (they run as owner, so RLS does not cover them).
DO $$
DECLARE f text; d text; n text;
  guard constant text := E'\n  IF NOT public.acx_admin_mfa() THEN RAISE EXCEPTION ''Admin two-step verification required'' USING errcode = ''42501''; END IF;';
BEGIN
  FOREACH f IN ARRAY ARRAY['save_site_settings(jsonb)','save_xp_rules(jsonb)','save_about_bio(jsonb)',
    'send_broadcast(text,text,text,uuid)','block_ip(text,text)','unblock_ip(text)','trigger_manual_backup()',
    'get_page_view_stats()','get_course_completion_stats()','admin_get_last_ips()'] LOOP
    d := pg_get_functiondef(('public.' || f)::regprocedure);
    IF position('acx_admin_mfa' in d) > 0 THEN CONTINUE; END IF;
    n := regexp_replace(d, '(AS \$function\$.*?\mbegin\M)', '\1' || guard, 'i');
    IF n = d THEN RAISE EXCEPTION '%: begin not found', f; END IF;
    EXECUTE n;
  END LOOP;
END $$;
