# Frontend migration: vanilla SPA -> Next.js

Goal: move the frontend to Next.js (React + TypeScript) **one page at a time**, without changing how the
site looks. Express stays the public entry point; each migrated path is proxied to the Next.js app in `web/`.
The old SPA keeps serving everything that is not migrated yet.

```
Browser ──► Express (server/index.js)
              ├─ migrated paths + /_next/*  ──► nextProxy ──► Next.js (web/)
              └─ everything else            ──► old SPA (index.html, /css, /js, ...) + /api/*
```

The list of migrated paths lives in one place: `NEXT_PAGES` in `server/middleware/nextProxy.js`
(SPA page id -> URL). `/js/flags.js` sends the same map to the SPA as `window.ACX_NEXT_PAGES`, and
`showPage(id)` in `js/router.js` does a full page load for those ids. To migrate a page: add its route in
`web/src/app/`, add it to `NEXT_PAGES`, and that's it.

## Status
| Step | Paths | Status |
|------|-------|--------|
| 1 | `/blog`, `/blog/<slug>`, `/blog/sitemap.xml` | Done |
| 2 | `/tutorials` (course list) and the 7 legal pages | Done |
| 3 | Home + login/signup/reset modals + nav search | Done |
| 4 | `/leaderboard`, `/u/<id>`, `/profile` | Done |
| 4b | `/rooms` (CTF list, room view, labs flow) | In progress: lab-solve fix done, page port next |
| 5 | Tools, community, resources, admin panel | |

All of it is behind `NEXT_APP_URL` (old name `NEXT_BLOG_URL` still works).

## Step 1: what changed
- `web/`: Next.js 16 App Router, TypeScript, no Tailwind. Blog pages: `src/app/blog/page.tsx` (list),
  `src/app/blog/[slug]/page.tsx` (post), `src/app/blog/sitemap.ts`.
- **Same look**: the layout links the old stylesheets from `/css` in the same order as `index.html`, and the
  components reuse the old ids/classes. Nav (`src/components/Nav.tsx`), the cookie banner and the background
  glow are React ports of the ones in `index.html`.
- **SEO**: posts are server-rendered with `<title>`, description, canonical, Open Graph/Twitter tags from
  `meta_title` / `meta_desc`. ISR every 5 minutes, so a post published in the admin panel appears without a deploy.
  `/blog/sitemap.xml` lists every published post and is linked from `robots.txt`.
- **Safety**: the post body uses the same escape-first Markdown renderer as the old `js/blog.js`
  (`src/lib/blog.ts`), so raw HTML in a post never runs.
- **Login state** is shared: same origin and same Supabase `storageKey` (`alexcyberx-auth`).
- **Links back to the SPA**: Login/Sign Up -> `/?auth=login&next=<current path>`, search -> `/?q=...`,
  About/Contact -> `/#about`, `/#contact`. `js/router.js` handles these on load.
- Scheduled posts: the list page still calls `blog_publish_due_posts` (as the old page did), on each ISR rebuild.

## Step 2: what changed
- `/tutorials`: `src/app/tutorials/page.tsx`, same queries as `js/courses.js` (ISR 5 min). Course cards link
  to the course pages, which are still in the SPA (it asks for login there).
- Legal pages: `src/app/[legal]/page.tsx`. The content is still authored in `pages/*.html` (one source for
  both apps), read at build time and cleaned like the SPA does (no scripts or inline handlers;
  `data-page` links become real links). A legal text change therefore needs a redeploy of `web/` too.
- **Language**: every Next page loads the old `js/i18n.js` and the language modal
  (`components/lang-modal.html`), so the chosen language (same localStorage key) applies on both apps and
  the Language button opens the modal in place. Text it translates has `data-i18n` +
  `suppressHydrationWarning`.
- `/?reset=1` (password reset link) now works again: `js/router.js` strips the query before `auth.js` read it.

## Step 3: what changed
- **Home** (`src/app/page.tsx`): hero, about, contact info and footer are read from `index.html` at build
  time (`src/lib/home.ts`, one source for both apps; SPA `onclick`s become links). Marquee (courses + CTF rooms
  from the DB + tools), course cards (`show_on_home`), contact form and scroll-reveal are React. The JSON-LD
  structured data from `index.html` is kept.
- **Auth on Next pages** (`src/lib/auth-context.tsx`, `src/components/AuthModals.tsx`): login, signup, Google,
  forgot password, and a new **"set a new password"** step after the reset link (the old site never had one;
  the link only opened the login modal). Same classes as the old overlays. Login/Sign Up open the modal in place.
  Old links `/?auth=login&next=<path>` still work; after login the user goes back to `next`.
- The SPA sends a logged-out visitor of a protected page to `/?auth=login&next=<that page>`.
- **Remember me** works now (it did nothing): session in localStorage, or only sessionStorage for this tab.
  Same storage adapter in `js/config.js` and `web/src/lib/supabase.ts`, so both apps share the session.
- **Nav search** on Next pages (`src/components/NavSearch.tsx`) uses `/search-index.json`, built on the server
  from the DB: courses, every chapter of every course, CTF rooms, blog posts, tools. Results deep-link into the
  SPA: `/tutorials/<course>?ch=<chapter-slug>`, `/rooms?open=<ctf-id>` (handled in `js/router.js`).
- Next pages now also run the maintenance-mode check and page-view tracking (`SiteRuntime`), which the
  migrated pages had been missing since step 1 (their visits did not count in the admin dashboard).
- Last-seen / login IP is recorded by the server: `POST /api/me/seen` (`server/routes/me.js`).

## Step 4: what changed
- `/leaderboard` (ISR 1 min): uses the `get_leaderboard()` RPC, which leaves out banned users (the old page
  listed them). Refresh button and the YOU row run in the browser.
- `/u/<id>` (ISR 5 min): public profile with rank among non-banned users and CTF history. Banned users show
  "User not found". `/u` redirects to the leaderboard.
- `/profile`: Notifications + Settings like before. Logged out -> login modal, then back here. Username is checked
  for duplicates before saving (the DB doesn't enforce it yet, see
  `supabase/migrations/2026-10-11_unique_username.sql`, not applied: one duplicate pair exists).
- SPA fix: a logged-out direct visit to `/leaderboard` or `/u/<id>` stayed on "Loading…" (script order race).

## Step 4b (part 1): lab solves
- Lab challenges are checked by their own Express routes (`/api/lab/<name>/submit`). Their solves were never
  saved (see AUDIT item 21). `server/labs/recordSolve.js` is mounted in front of the 6 lab routers: when the
  lab answers `success: true`, it verifies the Bearer token and calls `record_lab_ctf_solve()` with the
  service-role key (needs `SUPABASE_SERVICE_ROLE_KEY` on the Express service). The answer gets
  `recorded`, `already_solved`, `xp_earned`, `new_xp`; the room modal uses them.

Not migrated yet (still SPA): rooms, tools, community, resources, admin panel.

## Deploy on Render
1. New **Web Service** from this repo:
   - Root directory: `web`
   - Build command: `npm ci && npm run build`
   - Start command: `npm start`
   - Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same values as `js/config.js`),
     `NEXT_PUBLIC_SITE_URL` (e.g. `https://alexcyberx.com`). These are read at build time, so redeploy after
     changing them.
2. On the existing Express service set `NEXT_APP_URL` to the new service's URL (e.g.
   `https://alexcyber-web.onrender.com`) and redeploy.
3. Check: `curl -s https://<site>/blog/<some-slug> | grep '<title>'` shows the post title.

Staging today: `alexcyber` (Express) + `alexcyber-web` (Next), both free plan, deployed manually from `main`.
Deploy both after a merge that touches `web/` or `pages/*.html`.

**Rollback**: remove `NEXT_APP_URL` / `NEXT_BLOG_URL` from the Express service. All migrated pages come back
from the old SPA immediately.

Free tier note: if the Next service is asleep, the first `/blog` request waits for it to wake up
(proxy timeout 60 s).

## Local development
```bash
npm start                         # Express on :3000 (repo root)
cd web && cp .env.example .env    # fill NEXT_PUBLIC_SUPABASE_*
npm install && npm run dev        # Next on :3001
# then run Express with NEXT_APP_URL=http://localhost:3001 and open http://localhost:3000/blog
```
`npm run typecheck` in `web/` runs TypeScript.

## Removing old SPA copies (after a step has run fine for 1–2 weeks)
Delete `js/blog.js`, the `#blogPage` block in `index.html`, the `/blog` entries in the SPA catch-all in
`server/index.js`, and the blog CSS that nothing else uses. Same pattern for the step 2 pages
(`#coursesPage`, the legal-page loader in `index.html`).
