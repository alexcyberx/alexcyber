# web-02 Ayurdant store: design assets

web-02 "Daadi ka Nuskha" (lab name `cookie`, built 2026-11-02 on this design).
Cookie tampering (OWASP A07:2021): the store trusts an unsigned Base64
`ayd_session` cookie; the owner's vault also needs her customer ID, which the
reviews API (`api/reviews`) sends but the page never shows. The owner ID is
random per instance. Medium, 250 XP. Code: `routes.js`.

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

## Language
Every text is in `i18n.js` for the 8 site languages (English default). The
lab reads `?lang=` and keeps it on every link and on the reviews API call.

## Pages
`page` (home), `login`, `product?item=<laung|neem|kesar|manjan>`, `account`,
`nuskha` (the vault), `logout`, `api/reviews?product=`, `css/store.css`,
`img/<name>.webp` (fixed whitelist). Practice login: shown in the room scenario
and filled in on the login page.
