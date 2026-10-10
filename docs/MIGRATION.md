# Frontend migration: vanilla SPA -> Next.js

Goal: move the frontend to Next.js (React + TypeScript) **one page at a time**, without changing how the
site looks. Express stays the public entry point; each migrated path is proxied to the Next.js app in `web/`.
The old SPA keeps serving everything that is not migrated yet.

```
Browser ──► Express (server/index.js)
              ├─ /blog, /blog/*  ──► nextBlogProxy ──► Next.js (web/, basePath /blog)
              └─ everything else ──► old SPA (index.html, /css, /js, ...) + /api/*
```

## Status
| Step | Paths | Status |
|------|-------|--------|
| 1 | `/blog`, `/blog/<slug>`, `/blog/sitemap.xml` | Done (behind `NEXT_BLOG_URL`) |
| 2 | Home, `/tutorials` list, legal pages (public, SEO) | Next |
| 3 | Profile, leaderboard, rooms | |
| 4 | Tools, admin panel | |

## Step 1: what changed
- `web/`: Next.js 16 App Router, TypeScript, no Tailwind. Pages: `src/app/page.tsx` (list),
  `src/app/[slug]/page.tsx` (post), `src/app/sitemap.ts`.
- **Same look**: the layout links the old stylesheets from `/css` (`variables`, `nav`, `auth`, `animations`,
  `ctf-room`), and the components reuse the old ids/classes. Nav (`src/components/Nav.tsx`) and the cookie
  banner are React ports of the ones in `index.html`.
- **SEO**: posts are server-rendered with `<title>`, description, canonical, Open Graph/Twitter tags from
  `meta_title` / `meta_desc`. ISR every 5 minutes, so a post published in the admin panel appears without a deploy.
  `/blog/sitemap.xml` lists every published post and is linked from `robots.txt`.
- **Safety**: the post body uses the same escape-first Markdown renderer as the old `js/blog.js`
  (`src/lib/blog.ts`), so raw HTML in a post never runs.
- **Login state** is shared: same origin and same Supabase `storageKey` (`alexcyberx-auth`).
- **Links back to the SPA**: Login/Sign Up -> `/?auth=login&next=/blog`, Language -> `/?lang=1`,
  search -> `/?q=...`, About/Contact -> `/#about`, `/#contact`. `js/router.js` handles these on load.
- In the SPA, `showPage('blog')` does a full page load to `/blog` when `/js/flags.js` says the Next blog is on.
- Scheduled posts: the list page still calls `blog_publish_due_posts` (as the old page did), on each ISR rebuild.

Not migrated in step 1 (still SPA, same as before): the admin blog editor, the search results, the language
system (`i18n.js` / `translate.js`).

## Deploy on Render
1. New **Web Service** from this repo:
   - Root directory: `web`
   - Build command: `npm ci && npm run build`
   - Start command: `npm start`
   - Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same values as `js/config.js`),
     `NEXT_PUBLIC_SITE_URL` (e.g. `https://alexcyberx.com`). These are read at build time, so redeploy after
     changing them.
2. On the existing Express service set `NEXT_BLOG_URL` to the new service's URL (e.g.
   `https://alexcyberx-web.onrender.com`) and redeploy.
3. Check: `curl -s https://<site>/blog/<some-slug> | grep '<title>'` shows the post title.

**Rollback**: remove `NEXT_BLOG_URL` from the Express service. The old in-SPA blog comes back immediately.

Free tier note: if the Next service is asleep, the first `/blog` request waits for it to wake up
(proxy timeout 60 s).

## Local development
```bash
npm start                         # Express on :3000 (repo root)
cd web && cp .env.example .env    # fill NEXT_PUBLIC_SUPABASE_*
npm install && npm run dev        # Next on :3001
# then run Express with NEXT_BLOG_URL=http://localhost:3001 and open http://localhost:3000/blog
```
`npm run typecheck` in `web/` runs TypeScript.

## Removing the old blog (after step 1 has run fine for 1–2 weeks)
Delete `js/blog.js`, the `#blogPage` block in `index.html`, the `/blog` entries in the SPA catch-all in
`server/index.js`, and the blog CSS that nothing else uses.
