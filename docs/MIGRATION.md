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
| 5c | `/tools/alexrecon`, `/tools/alexutils`, `/tools/alextrace` | Done |
| 5e | Course pages `/tutorials/<course>` + every chapter `/tutorials/<course>/<chapter>` | Done |
| 5d | Admin panel (`/panel-1b47c1ab561e`, plan in `docs/ADMIN-PORT.md`) | Phase 1 (shell, login, dashboard, messages) |

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
  from the DB: courses, every chapter of every course, CTF rooms, blog posts, tools. Results deep-link to
  `/tutorials/<course>/<chapter-slug>` (since step 5e; was `?ch=`), `/rooms?open=<ctf-id>`.
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
- Scenario and hints are not in the `/rooms` HTML (owner: CTF is login-only). After login RoomsView fetches them
  from `/rooms/details` (Next route, Bearer token; the Express proxy passes `authorization`).
- `/rooms/<anything>` else is still the old SPA.

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
  thread with its own title/description, lock enforced in the UI, Report button, DB error messages inline).
  **On by default since 2026-10-15**; `NEXT_COMMUNITY=0` on the Express service sends them back to the SPA.
- Blog, resources and community pages now start below the fixed nav (the old 40px padding put the page title
  and the blog post's "Back to Blog" button under the 58px nav), on the SPA too.
- AlexRecon, AlexUtils, AlexTrace moved in step 5c (below).

## Step 5c: AlexRecon, AlexUtils, AlexTrace on Next
- `/tools/alexrecon`, `/tools/alexutils`, `/tools/alextrace` (`src/app/tools/<name>/page.tsx`, static) now have the
  Next navbar, themes and search. Not a React rewrite: the page markup is read from `index.html` at build time
  (`src/lib/legacy-tools.ts`, one source for both apps; "Back to Tools" becomes a link) and the logic is the SPA's
  own script, so every feature, API call, rate limit and error message is unchanged. Server routes untouched.
- The tool code moved out of `js/page-scripts.js` into `js/tools/alexrecon.js`, `alexutils.js`, `alextrace.js`
  (+ `js/tools/common.js`); `index.html` loads them right after `page-scripts.js`, the Next pages load them via
  `src/components/LegacyTool.tsx`. That component gives the scripts what the SPA did: `escapeHtml()`,
  `window._currentUser` (from the Next login), `showAuth()` (the Next login modal, back to the tool after), the
  fetch wrapper that adds `Authorization: Bearer <token>` to `/api/` calls, and jsPDF for the PDF export; then it
  calls the tool's init function. Logged out: the login modal opens on the page.
- Each tool page links its own stylesheet (`/css/alexrecon.css` etc.).
- Themes: the three tool stylesheets, the page markup and the HTML the scripts build use the theme variables
  (`python3 scripts/themeify.py --tools`), plus by hand: the attack-surface graph reads `--accent`/`--fg-*` when it
  draws, and the HTML export / print view carry the current theme's values. Status colours (green/amber/red) stay.
- A markup change in `index.html` for these pages needs a redeploy of `web/`; a script change does not
  (Express serves `/js`).


## Step 5e: course pages and chapters
- Routes: `src/app/tutorials/[course]/layout.tsx` (sub-nav, sidebar, banner: `CourseShell.tsx`, stays mounted
  between chapters), `[course]/page.tsx` (first chapter, like the SPA), `[course]/[chapter]/page.tsx` (one
  page per chapter, 59 built ahead), shared code in `[course]/chapter.tsx`, lesson in `ChapterView.tsx`.
  ISR 5 min. Proxy: `learn`/`learn2`/`learn3` in `NEXT_PAGES` and the `/tutorials/` prefix.
- **Lesson text is not copied.** `src/lib/chapters.ts` runs the SPA's own files at build time in a Node vm with
  a tiny DOM stub and keeps what each loader writes into the content box: `js/chapter-content/forensics-NN.js`
  (+ the list in `js/router.js`), `js/chapters2.js` (`loadCyberChapter`), `js/chapters3.js`
  (`loadEthicalChapter`). Banner + sidebar title come from `pages/learnN.html`. The HTML is server-rendered
  unchanged (inline styles, red highlights). A lesson text change there needs a redeploy (like the CTF rooms).
- **URLs:** `/tutorials/<course>/<chapter-slug>` (slug = same rule as `track_chapter_view` /
  `content_chapters.slug`). Old `?ch=<slug>` links 301 there (Express, `nextProxy.js`; `CourseShell` also does it
  on the Next app). `/tutorials/cyber-attacks` 308s to the right course, unknown course -> `/tutorials`, unknown
  chapter -> the course. Nav search and the SPA's own search (`acxOpenChapterBySlug`) open the chapter URL.
  `/tutorials/sitemap.xml` lists every enabled chapter (in `robots.txt`).
- **Same behaviour as the SPA:** admin on/off switch (`content_chapters.enabled`: hidden in the sidebar,
  skipped by Previous/Next, its URL goes to the next enabled chapter), Forensics ch. 12 text from the DB,
  login gate (the lesson becomes a login prompt + modal in place, back to the same chapter after login),
  `track_chapter_view` per chapter, page titles, mobile drawer closes on a chapter click, diagram iframe
  height messages, lighter svg text greys.
- **Language:** `src/lib/chapter-translate.ts` is the chapter part of `js/translate.js` (same Google endpoint,
  filters, protected terms, and the same `acx_ch_*` localStorage cache). i18n.js's language modal reaches it
  through `applyChapterTranslation` / `restoreLabTranslation` with `currentPage = learn|learn2|learn3`.
  A small inline script hides the lesson before hydration when it will be translated or gated (no Hinglish
  flash); CSS shows it after 6 s if scripts never run.
- Rollback still works: with the proxy off, `/tutorials/<course>` is the SPA again, and `js/router.js` also
  understands the new chapter URLs (`?ch=` links too).
- Removing the SPA copy later: `#learnPage`/`#learn2Page`/`#learn3Page` + `#learnSubNav` in `index.html`,
  `pages/learn*.html` stay (banner source), the loader code in `js/chapters*.js` stays (it is the content source).

Not migrated yet (still SPA): admin panel only (community is on Next by default since 2026-10-15).

## Theme: green / blue / red, mouse glow (2026-10-15)

- **Two dark themes, no light mode** (owner's choice). Green is the default (`:root` in `css/variables.css`: `--accent`
  `#10b981`, `--accent-bright`, `--accent-deep`, `--accent-rgb`, `--on-accent`; the old name `--red` points at `--accent`).
  Blue is `[data-theme="blue"]`: navy background and LinkedIn Blue (`#0A66C2` family). Red is `[data-theme="red"]`: the
  original AlexCyberX look (`#dc1414` on near-black). The light theme and "System" option were removed.
- Hard-coded brand reds were swapped for green across css/, index.html, pages/, components/, js/ and web/src. Red stays
  where it means danger (logout, errors, wrong answers, delete, timers). Course chapter content (`js/chapters*.js`,
  `js/chapter-content/`) and the admin panel keep their red.
- Neutral greys and translucent whites go through `--fg-1..4`, `--fg-rgb`, `--surface/2/3`, `--line-strong`, `--nav-bg`,
  `--overlay` (mapped by `scripts/themeify.py`, kept for reference), so each theme only redefines variables.
- **Which pages theme.** Only Next pages: `web/src/app/layout.tsx` runs `THEME_BOOT` (lib/theme.ts) in `<head>` before first
  paint and sets `<html data-theme="dark|blue">`. Choice: `localStorage acx_theme2` = `green` (default) / `blue` / `red` (new key since 2026-10-16: tabs running the first picker rewrote `acx_theme` to "dark"; a blue/red value there is carried over once); any other
  saved value falls back to green. `<html>` has no `data-theme` in JSX (React wrote "dark" back whenever it built the
  document in the browser, e.g. the error/not-found shell, where `THEME_BOOT` never runs); `components/ThemeSync.tsx` paints
  the saved choice on mount and puts it back if anything changes it.
- **Language on React parts.** Text React renders itself (404 page, parts of the auth modal) comes from
  `web/src/lib/ui-text.ts` (`useUiLang` + `uiText`, all 8 picker languages). `js/i18n.js` `applyLanguage()` fires
  `acx:lang` so it updates without a reload. Static text keeps using `data-i18n` keys in `js/i18n.js`. `components/ThemeToggle.tsx` sits next to the language button (desktop menu + mobile
  cards: each option is a mini live preview, Matrix/Midnight/Crimson; switching grows the new theme as a circle from the click point via the View Transitions API, instant where unsupported or with reduced motion). The old SPA never sets `data-theme`, so its pages stay green until they move to Next.
- **Chapters.** `lib/chapter-theme.ts` turns the chapters' old fixed colours into theme variables at render time.
- **Mobile menu.** Language and Theme are two buttons (outline + filled, like My Profile / Sign Out); Theme opens the cards.
- **SEO / AEO (2026-10-16).** `web/src/lib/seo.ts` (JSON-LD helpers), `app/robots.ts`, `app/sitemap.ts`,
  `app/llms.txt/route.ts`, `app/opengraph-image.tsx` (CTF rooms stay login-only, no public room pages). Express proxies
  `/robots.txt`, `/sitemap.xml`, `/llms.txt` and `/opengraph-image` to Next (`nextProxy.js`). The root
  `robots.txt`/`sitemap.xml` files are only a fallback when Next is off. Set `NEXT_PUBLIC_SITE_URL` to the final domain.
- **Mouse glow.** `js/spotlight.js` (index.html + Next layout) adds `.spot-on` + `--mx/--my` to the card under the cursor and
  moves one soft `.cursor-glow` behind the page. Mouse only.
- Test: `theme.js` (11 checks) plus the usual suites.

## Navbar upgrade (2026-10-15)

- Next pages only: `web/src/app/nav-upgrade.css` on top of the shared `css/nav.css`; markup in `components/Nav.tsx`
  (same ids, so the old tests and i18n keep working). The old SPA nav is unchanged.
- One sliding hover pill behind the links, an accent underline under the current page's link, lighter bar at the top that
  turns into stronger glass + shadow on scroll, and a 2px reading-progress line along the bottom edge.
- "More" is a panel with an icon tile and a one-line description per link (staggered entrance). It now lives outside
  `.nav-center` and is placed in JS, so the 1024-1366px overflow can no longer clip it.
- Avatar menu fades/scales in (with a hover bridge), Sign Up has a light sweep, buttons lift, the hamburger morph is
  springier, the mobile sheet drops open with staggered rows, and mobile Login / Sign Up text is centred.
- Mobile: Language and Theme share one row split by a thin line; Theme expands the preview cards below.
- All motion is off under `prefers-reduced-motion`.

## Logo and site icons (2026-10-15)

- Official mark "Glitch X" (owner's pick), files in `brand/` (see `brand/README.md`). Express serves `/brand/*` and the root
  icons `/favicon.ico`, `/favicon.svg`, `/apple-touch-icon.png`, `/site.webmanifest`. The Next layout `metadata.icons` and
  `index.html` link them.
- Navbar shows the mark before "Alex CyberX": inline on Next pages (`components/LogoMark.tsx`, follows the theme accent,
  small glitch on hover), `brand/logo-mark-green.svg` on the old SPA.

## Search: command palette (2026-10-15)

- `components/NavSearch.tsx` + `app/search.css` (Next pages). The nav pill (`#navSearchPill`, shows Ctrl K / ⌘ K) and the
  mobile icon (`#navSearchToggle`) open one palette, portalled to `<body>` (the nav's backdrop-filter would trap it).
- Opens with Ctrl/Cmd+K anywhere or `/` when not typing; Esc, click outside or Ctrl+K again closes. Arrow keys move,
  Enter opens. Results are grouped (Courses, CTF Rooms, Tools, Chapters, Blog) with type icons and highlighted matches;
  multi-word queries match all words. Empty state: last 5 searches (`localStorage acx_recent_search`, removable) and
  quick links. No results: suggestion chips. Loading: sweep line + skeleton rows. `?q=` still opens it with that text.
- Same ids as before (`#desktopSearchInput`, `#navSearchDesktopResults`, `.search-result-item`), so the old tests run.
  Test: `search.js` (15 checks). Reduced motion turns the animation off.

## Step 5d: admin panel on Next (in phases)
- `src/app` is split into route groups: `(site)` (every public page, unchanged URLs and layout) and `(admin)`
  (own root layout: no site nav, cookie banner, page-view tracking or site CSS).
- `/panel-1b47c1ab561e` (proxied by Express, `X-Robots-Tag: noindex`) is the new panel; code in `src/admin/`.
  Same Supabase storage key as the old panel (`alexcyberx-admin-auth`) plus its sessionStorage marker, so sections
  not ported yet open the old panel (`/panel-1b47c1ab561e.html#<section>`) without a second login.
- Phase 1: sign-in (password → admin role → TOTP enroll/verify, aal2), sidebar + hash routing, idle sign-out
  (30 min), Dashboard, Messages. Next phases and owner decisions: `docs/ADMIN-PORT.md`.

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
