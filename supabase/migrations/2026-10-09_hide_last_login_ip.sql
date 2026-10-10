-- RUN THIS ONLY AFTER the frontend from this version is deployed.
-- Why: profiles has the policy "Profiles are viewable by everyone", and
-- last_login_ip / role / is_banned were readable by anyone holding the public
-- anon key (it is in js/config.js), i.e. every user's last login IP was public.
--
-- This version of the frontend no longer selects last_login_ip (admins use the
-- admin_get_last_ips() RPC) and no longer uses select('*') on profiles, so the
-- column can be hidden. If you run it BEFORE deploying, login breaks
-- (auth.js used select('*') -> "permission denied for column last_login_ip").
--
-- NOTE: after this, any NEW column on profiles must be added to the GRANT below
-- (or the client cannot read it), and never use select('*') on profiles.

REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, full_name, username, bio, xp, level, ctf_solves, role, last_seen, is_banned, created_at) ON public.profiles TO anon, authenticated;

-- Rollback:
-- GRANT SELECT ON public.profiles TO anon, authenticated;
