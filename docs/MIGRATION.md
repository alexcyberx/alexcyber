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
| 2 | `/tutorials` (course list) and the legal pages (now 5: privacy, terms, disclaimer, cookie, report-a-bug; refund / do-not-sell / legal-warning redirect) | Done |
| 3 | Home + login/signup/reset modals + nav search | Done |
| 4 | `/leaderboard`, `/u/<id>`, `/profile` | Done |
| 4b | `/rooms` (CTF list, room view, labs flow) | Done |
| 5a | Security fixes in tools, community, admin panel (no page moves) | Done |
| 5b | `/tools`, `/tools/mistake-analyzer`, `/resources` (+ `/community`, `/community/<id>` ported, switched off) | Done |
| 5c | AlexRecon, AlexUtils, AlexTrace | |
| 5d | Admin panel | |

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

## Step 4b (part 2): /rooms on Next
- `src/app/rooms/page.tsx` (ISR 1 min) + `src/components/RoomsView.tsx`: same markup and classes as `#ctfPage`.
  Username setup, My Stats + daily challenge, filters/search, room modal (hints, AI hint, START / Restart /
  View Lab, 30 min timer that survives a reload, flag submit, solve toast + chime), Esc to close.
- Room texts (scenario, hints, lab paths) are still authored in `js/ctf-challenges-data.js` and read at build
  time (`src/lib/ctf.ts`); the DB decides which rooms are shown (`status = active`), their XP and solver count.
  A text change there needs a redeploy.
- Language: the hand-written CTF texts from `js/translate.js` (`CTF_OVERRIDES`, read at build time), the rest
  machine-translated like before, cached under the same `acx_ctf_<lang>` key. The language modal calls
  `window.applyCTFTranslation` as on the old page.
- Coming back from a lab tab works the same three ways (`window.opener.acxLabReturn`, the
  `acx_return_to_modal` storage signal, `acx_back_to_ctf` after a same-tab redirect), plus `/rooms?open=<id>`
  (kept through the login modal).
- `/rooms/<anything>` is still the old SPA.

## Step 5b: tools hub, Mistake Analyzer, resources, community
- `/tools` (ISR 1 min, `ToolsHub.tsx`): same 4 cards, now real links. The admin on/off switch (`tool_settings`)
  is read on the server and again in the browser (on load, on focus, when the tab comes back), so a tool that
  is switched back on works without a reload. One tool list for hub, nav search and home marquee:
  `src/lib/tools.ts`.
- `/tools/mistake-analyzer` (`MistakeAnalyzerView.tsx`): login modal when logged out, token in the
  `Authorization` header, the model's JSON is checked and normalized before it is shown, the server's own error
  text is shown (session expired, suspended, rate limit, switched off, timeout), one request at a time.
- `/resources` (`ResourcesView.tsx`): login gate, filters, cards are real `target=_blank` links (no popup
  blocker); the download counter counts once per user per resource per day (DB, `resource_download_log`).
- `/community` and `/community/<id>` are ported (pinned first, approved-only reply counts, a real URL per
  thread with its own title/description, lock enforced in the UI, Report button, DB error messages inline) but
  **switched off**: the owner decides first whether the forum stays. `NEXT_COMMUNITY=1` on the Express service
  turns them on (`NEXT_PAGES.community` + the `/community/` prefix).
- Blog, resources and community pages now start below the fixed nav (the old 40px padding put the page title
  and the blog post's "Back to Blog" button under the 58px nav), on the SPA too.
- AlexRecon, AlexUtils, AlexTrace (`/tools/<name>`) are still SPA pages (step 5c).

Not migrated yet (still SPA): AlexRecon, AlexUtils, AlexTrace, community (switched off), admin panel.

## Theme: green brand, mouse glow, Dark / Light / System (2026-10-15)

- **Brand colour is green** (owner's choice, look modelled on cyberctf.org). `css/variables.css` defines `--accent` (`#10b981`),
  `--accent-bright`, `--accent-deep`, `--on-accent`; the old name `--red` now points at `--accent`. Hard-coded brand reds were
  swapped for the greens across css/, index.html, pages/, components/, js/ and web/src. Red is kept where it means danger
  (logout, errors, "wrong", delete, timers running out). Course chapter content (`js/chapters*.js`, `js/chapter-content/`) and
  the admin panel keep their red, because there red marks attacks/failures inside the lessons.
- **Theme vars.** Neutral greys and translucent whites now go through `--fg-1..4`, `--fg-rgb`, `--surface/2/3`, `--line-strong`,
  `--nav-bg`, `--overlay` (mapped by `scripts/themeify.py`, kept for reference). `[data-theme="light"]` in variables.css
  redefines them.
- **Which pages theme.** Only Next pages: `web/src/app/layout.tsx` runs `THEME_BOOT` (lib/theme.ts) in `<head>` before first
  paint and sets `<html data-theme>`. The choice is `localStorage acx_theme` = `dark` (default) / `light` / `system`.
  `components/ThemeToggle.tsx` sits next to the language button (desktop menu + mobile chips). The old SPA never sets
  `data-theme`, so its pages stay dark until they move to Next. The home terminal and the About terminal stay dark in light mode.
- **Mouse glow.** `js/spotlight.js` (loaded by index.html and the Next layout) adds `.spot-on` + `--mx/--my` to the card under
  the cursor and moves one soft `.cursor-glow` behind the page. Mouse only; touch devices get nothing.
- Test: `theme.js` (14 checks: default dark, toggle, persistence before first paint, system + live device change, contrast,
  spotlight, SPA stays dark, mobile chips) plus the usual suites.

## Deploy on Render
**One service (current):** the Express service also runs Next.js.
- Render's build command stays `npm install`. The root `postinstall` (`scripts/build-web.js`) builds `web/` when
  `RENDER=true` (Render sets it). Supabase URL + anon key come from `js/config.js` unless
  `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set; site URL from `NEXT_PUBLIC_SITE_URL`
  (falls back to `RENDER_EXTERNAL_URL`).
- Env `NEXT_EMBEDDED=1`: `server/nextEmbedded.js` starts `next start` on `127.0.0.1:3101` (child process,
  restarted if it crashes) and the proxy uses it. `NEXT_APP_URL` is then ignored.
- Why: on the free plan the separate `alexcyber-web` service went to sleep, and requests from Express never
  woke it up, so every migrated page answered 502. With one service there is one sleep/wake, and it is the same
  setup a single paid server will use. Memory: about 100 MB for Next + 80 MB for Express.
- After a change to `web/` or `pages/*.html`: deploy the Express service only.

**Rollback**: remove `NEXT_EMBEDDED` (and `NEXT_APP_URL`) from the Express service. All migrated pages come
back from the old SPA immediately.

The old separate service `alexcyber-web` is not needed any more. It can be suspended or deleted from the
Render dashboard (setting `NEXT_EMBEDDED` off and `NEXT_APP_URL` to its URL would use it again).

Proxy details: the proxy retries GET/HEAD for up to 55 s on 502/503/504 or a refused connection (covers the
few seconds Next needs to start), forwards only plain browser headers, and Express sends a warm-up request
to Next on start.

## Local development
```bash
npm start                         # Express on :3000 (repo root)
cd web && cp .env.example .env    # fill NEXT_PUBLIC_SUPABASE_*
npm install && npm run dev        # Next on :3001
# then run Express with NEXT_APP_URL=http://localhost:3001 and open http://localhost:3000/blog
# or, like on Render: npm run build:web && NEXT_EMBEDDED=1 npm start
```
`npm run typecheck` in `web/` runs TypeScript.

## Removing old SPA copies (after a step has run fine for 1–2 weeks)
Delete `js/blog.js`, the `#blogPage` block in `index.html`, the `/blog` entries in the SPA catch-all in
`server/index.js`, and the blog CSS that nothing else uses. Same pattern for the step 2 pages
(`#coursesPage`, the legal-page loader in `index.html`).
