/* New CTF room ai-02 "Trust the Query" (OWASP LLM05 Improper Output Handling), docs/LABS.md. */
/* Run once, at the same time the labs service and the main site are deployed */
/* with this room: inserting it active sends every user a "New CTF room" */
/* notification (acx_notify_new_content), so do not run it before the room is */
/* live. The flag is never stored here: both servers fill flag_hash from the */
/* shared secret on start (syncFlagHashes). */
/* Only block comments on purpose (a phone paste can put it all on one line). */

insert into public.ctf_challenges (slug, title, category, difficulty, points, xp, status, description, hints, requires)
values (
  'ai-02',
  'Trust the Query',
  'ai',
  'medium',
  150,
  220,
  'active',
  'Kaveri Valley Institute of Technology added an AI assistant to its student portal. It turns your questions into database queries, and the portal runs whatever it writes. The end-sem papers live in the same database.',
  '[]'::jsonb,
  '[]'::jsonb
)
on conflict (slug) do nothing;
