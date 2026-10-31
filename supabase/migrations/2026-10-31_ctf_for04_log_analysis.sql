/* New CTF room for-04 "Midnight Login" (log analysis), docs/LABS.md. */
/* Run once, at the same time the labs service and the main site are deployed */
/* with this room: inserting it active sends every user a "New CTF room" */
/* notification (acx_notify_new_content), so do not run it before the room is */
/* live. The flag is never stored here: both servers fill flag_hash from the */
/* shared secret on start (syncFlagHashes). */
/* Only block comments on purpose (a phone paste can put it all on one line). */

insert into public.ctf_challenges (slug, title, category, difficulty, points, xp, status, description, hints, requires)
values (
  'for-04',
  'Midnight Login',
  'forensics',
  'easy',
  75,
  120,
  'active',
  'Last night Paynova''s IDS saw a big burst of failed SSH logins on a VPN server, and then one login that looks wrong. You have the server''s auth.log. Find out who got in.',
  '[]'::jsonb,
  '[]'::jsonb
)
on conflict (slug) do nothing;
