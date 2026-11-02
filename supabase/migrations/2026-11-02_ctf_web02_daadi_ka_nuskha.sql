/* web-02 rebuilt: "Cookie Monster" (NovaCorp portal) becomes "Daadi ka Nuskha", */
/* the Ayurdant ayurvedic toothpaste store (cookie tampering, OWASP A07:2021, */
/* plus an API that sends more than the page needs). Owner choice 2026-11-02: */
/* Medium, 250 XP (unchanged). Same slug and lab name, so old solves and solver */
/* counts stay. The flag changes; both servers refill flag_hash from the shared */
/* secret on start. Apply after the deploy that ships server/labs/web02-ayurdant. */
/* Only block comments on purpose (a phone paste can put it all on one line). */

update public.ctf_challenges
set title = 'Daadi ka Nuskha',
    points = 150,
    xp = 250,
    description = 'Ayurdant, a desi toothpaste brand from Haridwar, keeps its secret Kesar Gold recipe in the owner''s vault on its online store. A customer, Riya, shared her login in a WhatsApp group. Use it and open the owner''s vault.'
where slug = 'web-02';
