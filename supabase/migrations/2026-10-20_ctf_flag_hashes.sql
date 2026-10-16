-- CTF flags: the DB keeps only sha256(flag), never the flag itself.
--
-- Before: ctf_challenges.flag held the plain flag, the same text as the
-- defaults in the public repo, so anyone could copy them from GitHub.
-- Now the lab server derives every flag from a secret (server/labs/flags.js)
-- and on start-up writes sha256(flag) into flag_hash; submit_ctf_flag()
-- compares hashes. An admin who types a flag in the panel still can: the
-- trigger below hashes it and clears the plain column.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

ALTER TABLE public.ctf_challenges ADD COLUMN IF NOT EXISTS flag_hash text;
-- anon/authenticated only have column-level SELECT; flag_hash is not one of them.
REVOKE SELECT (flag_hash) ON public.ctf_challenges FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.acx_hash_ctf_flag()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $fn$
BEGIN
  IF NEW.flag IS NOT NULL AND btrim(NEW.flag) <> '' THEN
    NEW.flag_hash := encode(extensions.digest(btrim(NEW.flag), 'sha256'), 'hex');
  END IF;
  NEW.flag := NULL;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_hash_ctf_flag ON public.ctf_challenges;
CREATE TRIGGER trg_hash_ctf_flag BEFORE INSERT OR UPDATE ON public.ctf_challenges
  FOR EACH ROW EXECUTE FUNCTION public.acx_hash_ctf_flag();

-- Hash the current flags and clear them (they keep working until the server
-- writes the new hashes on its next start).
UPDATE public.ctf_challenges SET flag = flag WHERE flag IS NOT NULL;

-- submit_ctf_flag: compare hashes (a row without a hash accepts nothing).
DO $$
DECLARE d text; n text;
BEGIN
  d := pg_get_functiondef('public.submit_ctf_flag(uuid, text)'::regprocedure);
  IF position('flag_hash' in d) = 0 THEN
    n := replace(d, 'IF btrim(p_flag) <> v_challenge.flag THEN',
      'IF v_challenge.flag_hash IS NULL OR encode(extensions.digest(btrim(p_flag), ''sha256''), ''hex'') <> v_challenge.flag_hash THEN');
    IF n = d THEN RAISE EXCEPTION 'submit_ctf_flag: anchor not found'; END IF;
    EXECUTE n;
  END IF;

  -- Admin backups leave the hash out too, like the flag.
  d := pg_get_functiondef('public.run_backup_snapshot(text)'::regprocedure);
  IF position('flag_hash' in d) = 0 THEN
    n := replace(d, 'to_jsonb(cc) - ''flag''', 'to_jsonb(cc) - ''flag'' - ''flag_hash''');
    IF n = d THEN RAISE EXCEPTION 'run_backup_snapshot: anchor not found'; END IF;
    EXECUTE n;
  END IF;
END $$;
