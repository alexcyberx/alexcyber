/* New CTF room web-08 "Other People's Orders" (IDOR), docs/LABS.md. */
/* Run once in the Supabase SQL Editor, at the same time the labs service and */
/* the main site are deployed with this room: inserting it active sends every */
/* user a "New CTF room" notification (acx_notify_new_content), so do not run */
/* it before the room is live. The flag is never stored here: both servers */
/* fill flag_hash from the shared secret on start (syncFlagHashes). */
/* Only block comments on purpose (a phone paste can put it all on one line). */

insert into public.ctf_challenges (slug, title, category, difficulty, points, xp, status, description, hints, requires)
values (
  'web-08',
  'Other People''s Orders',
  'web',
  'easy',
  60,
  100,
  'active',
  'Gharkart is a small online grocery store in Indore. You have a normal customer account. The owner placed an order last week, and its delivery note was meant for the delivery boy only. Read that note.',
  '[]'::jsonb,
  '[]'::jsonb
)
on conflict (slug) do nothing;
