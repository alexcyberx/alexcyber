# web-02 Ayurdant store: design assets

Reusable UI design for a planned web-02 CTF room, built in an earlier session.
The room code (`routes.js`) is **not** implemented yet; only the look and the
product art are here, so a later session does not have to redo the design.

## What is here
- `store.css` : the full stylesheet for the store (home, login, product page,
  account page). Desi ayurvedic look: cream background, maroon/saffron/gold,
  Rozha One + Mukta fonts (loaded from Google Fonts by the page).
- `img/*.webp` : our own 3D product renders (three.js), no real brand. Files:
  `hero` (hero shot), `laung`, `neem`, `kesar` (toothpaste tubes + cartons),
  `manjan` (jar + brass bowl).

## The brand (all fictional)
**Ayurdant** (आयुर्दंत), a made-up Indian ayurvedic toothpaste and dant-manjan
company. Products: Laung, Neem, Kesar Gold toothpaste and Dant Manjan. Tagline
feel: "daadi ka nuskha, ab tube mein". A fictional online store for a CTF room,
not a copy of any real company.

## For the next session
Read the root `CLAUDE.md` and `brain/rules/` + `brain/security/` first. Build
the lab under this folder (`routes.js`), register it in
`server/labs/mount.js`, give it a flag theme in `server/labs/flags.js`, and
follow the same pattern as the other flow labs (`server/labs/web08-orders`,
`server/labs/web01-golive`). Serve `store.css` and `img/:name.webp` from a
fixed whitelist, exactly like web01-golive serves its assets. The owner will
describe the room's topic and difficulty.
