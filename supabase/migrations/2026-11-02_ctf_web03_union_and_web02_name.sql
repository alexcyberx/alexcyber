/* web-03 rebuilt: "SQL Injection 101" (VaultBank portal) becomes "SQL */
/* Injection: UNION Attack", the Narmada Valley College library catalogue. */
/* Owner choice 2026-11-02: Medium, 250 XP; room names use the real */
/* vulnerability name, so web-02 "Daadi ka Nuskha" becomes "Session Cookie". */
/* Same slugs, so old solves and solver counts stay. web-03's flag changes; */
/* both servers refill flag_hash from the shared secret on start. Apply after */
/* the deploy that ships server/labs/web03-library. */
/* Only block comments on purpose (a phone paste can put it all on one line). */

update public.ctf_challenges
set title = 'SQL Injection: UNION Attack',
    points = 150,
    xp = 250,
    description = 'Narmada Valley College put its library catalogue online in 2004 and never changed the code. The rare manuscripts archive sits in the same database. Use the catalogue search to read the archive''s access code.'
where slug = 'web-03';

update public.ctf_challenges
set title = 'Session Cookie'
where slug = 'web-02';
