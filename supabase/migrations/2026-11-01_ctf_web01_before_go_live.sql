/* web-01 upgraded: "Hidden in Plain Sight" becomes "Before Go-Live" (secrets in */
/* client-side code, OWASP A02:2025, CWE-615), owner choice 2026-11-01: Easy, */
/* 120 XP. Same slug, so old solves and solver counts stay. The flag changes; */
/* both servers refill flag_hash from the shared secret on start. Apply after */
/* the deploy that ships server/labs/web01-golive. */
/* Only block comments on purpose (a phone paste can put it all on one line). */

update public.ctf_challenges
set title = 'Before Go-Live',
    points = 60,
    xp = 120,
    description = 'Lumio is about to launch a new laptop. Its online store went live in a hurry and the developers forgot the cleanup before go-live. Find what they left behind and get the launch code.'
where slug = 'web-01';
