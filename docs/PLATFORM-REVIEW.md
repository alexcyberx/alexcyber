# AlexCyberX: Platform Review (synthesis of 5 research lenses, revised after critic pass)

_Date: 2026-10-15. Synthesis of five lenses: own-site audit, learning platforms, CTF and labs, security tools, modern UI. Revised after a completeness and accuracy critique._
_Read-only review. Nothing in the repo or DB was changed. File:line and URLs are cited throughout._

> **Before you act on this:** three safety items that the lenses call "live" are **already fixed in the current branch**. Verify them, don't redo them. (1) Attack commands no longer aim at real domains: `paynova.com` became `paynova.example`, `target.com` became `target.example`, and the analyzer uses `scanme.nmap.org` (commits `94bd141`, `3b2b4b1`; AUDIT item 49). (2) Live CTF flags were removed from client code (AUDIT item 32). **Flag rotation and git-history cleanup are still open**, and so are the server-side fallback flags (§2 CTF). (3) AlexTrace no longer logs plaintext passwords (AUDIT item 33). The raw password **still reaches the server** (`POST /api/alextrace/password-check`, `server/tools/alextrace/routes.js:172`). That is now a compliance item (§2 Tools, Stage 0).

> **Corrections from the previous draft:** BGPView has not shut down yet. Its announced closure date is **26 Nov 2026** (see §2 Tools). Indian criminal law now means the **BNS**, not the IPC. The dark-patterns citation is India's **Central** Consumer Protection Authority, not California's CCPA. The AI coach and AI search run on **Groq**; only the Mistake Analyzer uses Gemini. The roadmap is now ordered by risk, not by calendar week.

---

## 1. Executive summary

**The content is real and good. The packaging is what holds the platform back.** There are 3 Hinglish courses (Ethical Hacking has about 23 chapters with a running "PayNova" story and India-law boxes), 12 CTF rooms and 4 tools. One of the tools, AlexRecon, does more than most single free tools. The writing, the Hinglish voice, the server-checked flags and the AI hint coach are worth protecting.

**What's holding it back, in priority order:**

1. **Everything useful is behind a login wall.** `ACX_PROTECTED_PAGES` gates `ctf, learn, learn2, learn3, resources` and all 4 tools (`js/auth.js:84`). A logged-out `/rooms` visit shows only a login modal (`RoomsView.tsx:195-197, 223`). Visitors **and Google** never see a chapter, a lab or a tool. That includes in-browser utilities such as base64 and JWT, which make no server call. All five lenses independently name this as the biggest growth and SEO lever. Making content public also exposes the server tools to bots, so it needs abuse protection (Turnstile + per-user quotas).
2. **The home page doesn't show the product.** The hero says only "Learn Cyber Security". Its two CTAs just scroll the same page, and a third link sends beginners to **roadmap.sh**. Below it are:
   - two course cards with a wrong "1 Chapter" count;
   - a fake "rm -rf / … hydra … sqlmap" terminal;
   - a mislabelled auto-scrolling marquee of room and tool names;
   - a Title-Case founder bio next to a second fake terminal;
   - a contact form and a legal-only footer.

   CTF and tools appear only as names in the marquee.
3. **Learning has no loop.** Chapters are passive walls of text. There is no chapter H1 (the course banner repeats), no progress, no questions, no "practice this" link to a matching lab, and no chapter downloads. Yet `track_chapter_view`, `resources.chapter_tag` and an unused `chapter_completion` XP rule already exist. Rooms dump all hints at once, run a fake 30-minute "instance" timer on static puzzles, and explain nothing after a solve. TryHackMe, HTB Academy and PortSwigger all run the same loop: read, answer or solve, checkmark, next.
4. **Trust, correctness and Indian-law gaps.**
   - **Founder claims conflict.** The meta says "BCA student". The JSON-LD says "Certified Ethical Hacker (CEH), EC-Council" and points to `/assets/pawan-tanwar.jpg`, **which is not in the repo**.
   - **Canonical URLs point to a host that doesn't serve the site.** Every canonical, OG and sitemap URL uses `alexcyberx.com`, but the site runs on `alexcyber.onrender.com`.
   - **The leaderboard copy is wrong.** It says "ranked across courses and CTF", but courses award no XP.
   - **Real names are public by default.** The leaderboard and `/u/<id>` show `full_name` first (`player-utils.ts:9`). The audience includes minors.
   - **AlexRecon scans any domain.** Its intrusive tier (port scan, dir/backup brute) fires at any domain a student types, with no ownership check. That is an IT Act s.43/66 risk.
   - **The password meter is misleading.** AlexUtils rates `India@123` "Very strong".
   - **The legal set is out of date and not shaped for India.** The Legal Warning cites the repealed IPC, the removed "₹1 crore" s.43 cap and the Budapest Convention, which India hasn't joined. The privacy page says "13 and above", but the DPDP Act treats everyone under 18 as a child.
   - **Users cannot delete their account or download their data.**
   - **The free Gemini tier is barred for services likely used by under-18s.**
5. **Fragile i18n and a piled-up UI.** Chapters are machine-translated **in the browser** through the unofficial `translate.googleapis.com` gtx endpoint, one call per text node, behind a blocking "Translating… 12/59" overlay. The endpoint can rate-limit or ban IPs, and search engines never see the translations. The CSS has about 90 hex colours, 31 font sizes and 314 inline styles. There are no accessible dialog or menu primitives, and dim text fails WCAG AA in 118+ places.

**What to keep and promote:**
- The Cyber Mistake Analyzer, the most distinctive learning tool. Feature it on the home hero after the Gemini terms fix.
- The PayNova story and the India-law boxes (rewritten to the BNS).
- The Hinglish voice.
- Server-recorded XP, the solve toast and the chime.
- The AI hint coach (tie it to the user).
- AI search (port it to Next).
- Browser-only labs (no VPN or VM).
- The `/rooms` card design, as the base of the new design system.

**The migration is the opportunity, and it is bigger than the status table says.** Steps 1-5b are on Next. 5c (AlexRecon/AlexUtils/AlexTrace) and 5d (admin) remain. There is also a third, unlisted step: **the course reader.** `learn/learn2/learn3` are still SPA pages, and the course text lives in about 1.7 MB of `js/` files (`chapters2.js`, `chapters3.js`, `chapter-content/*`), not in the DB. Server-rendering chapters means porting that content pipeline, which is **larger than 5c and 5d combined**. Add it to `docs/MIGRATION.md` as **step 5e**. Switch to the new design system and do the make-public + gate-actions change **during** 5c/5d/5e. Porting a page twice is the only expensive path.

---

## 2. Page / feature table: Keep · Modernise · Remove · Add

Impact is H/M/L and effort is S/M/L. "Remove" always means *ask the owner first*. Items that need a VPS are tagged `[paid-host]`.

### Global

| Area | Verdict | What to do | Impact / Effort | Sources |
|---|---|---|---|---|
| **Access model (login wall)** | Modernise | Make content public and server-rendered: course chapters, the CTF list, room pages, the tools hub and every browser-only tool. Gate only these: start lab, submit flag, AI hints, save progress, and the server/network tools (Recon, Trace, SSL, CVE, IP). Logged-out readers get a slim "Login karke progress save karo" bar instead of a modal. Remove `learn*/ctf/resources` and the client-side utils from `ACX_PROTECTED_PAGES`. Add **Cloudflare Turnstile** (free, unlimited) to signup and to every server-tool endpoint as part of the same change. | **H / M** | `js/auth.js:84`, `RoomsView.tsx:196,223`; portswigger.net/web-security; picoctf.com/get_started; developers.cloudflare.com/turnstile/plans/ |
| **Top nav / IA** | Modernise | Nav order: `Learn · Practice · Tools · Community · ⌘K search · language · Log in · Start free`. Logged-in users get an avatar DropdownMenu (Dashboard/Profile/Progress/Settings/Sign out), and the avatar becomes a real button instead of a `<div onClick>`. Move About and Contact to the footer. Use one name per thing ("Courses" at `/tutorials`, "CTF Labs"). | **H / S** | `Nav.tsx:101-124,151`; help.hackthebox.com academy intro |
| **Search (incl. AI search)** | Keep / Modernise | The SPA has Groq-backed natural-language search (`/api/lab/search`, `server/ai/search.js`; the "Search with AI" row in `js/search.js:245`) plus an admin AI search (`server/ai/adminSearch.js`). The Next `NavSearch.tsx` reads only `/search-index.json` and **dropped AI search**. Port it into the ⌘K palette as a last "Ask AI" row, logged-in only, with the quota stored per `user_id`. | M / S | `web/src/components/NavSearch.tsx`; `server/ai/search.js` |
| **Footer + legal** | Modernise | Use a 4-column footer (Learn/Practice/Tools/Company) and one legal row. Rewrite Privacy and Terms for **India's DPDP Act 2023 and the DPDP Rules (notified 14 Nov 2025; most duties phase in by about May 2027)**, with a grievance contact. Merge Refund and "Do Not Sell" into Privacy/Terms. Replace the threatening "Legal Warning" with a **Responsible Disclosure** page and `/.well-known/security.txt` (RFC 9116). Any law cited must be current: **IT Act s.43/66 and the BNS** (the IPC was replaced on 1 Jul 2024; mischief is now BNS s.324). Drop the "₹1 crore" s.43 cap, which the 2008 amendment removed, and the Budapest Convention line, since India is not a party. Make the year automatic (it currently says "© 2025"). | **M / S** | `pages/legalwarning.html:34-39`; rfc-editor.org/rfc/rfc9116; ey.com DPDP Rules 2025 POV; devgan.in/bns; sethassociates.com IT Amendment 2008; drishtiias.com UN cybercrime convention |
| **Minors + DPDP (new)** | Add | Under DPDP s.9 a child is under 18. It requires verifiable parental consent and bars tracking or behavioural monitoring of children. The privacy page says "13 and above" (`pages/privacy.html:94`), which conflicts with that. **The owner must decide one of two:** (a) 18+ signup with a self-declaration, or (b) a parental-consent flow plus a check against the educational-institution exemption in the Rules (Fourth Schedule, Part A). Either way, stop page-view tracking for under-18 accounts and make usernames the default public identity. | **H / M** | dpdpa.com/dpdpa2023/chapter-2/section9.html; EY DPDP Rules POV |
| **Data-principal rights (new)** | Add | Add self-serve **"Delete my account"** and **"Download my data"** to Settings. Today `deleteUser` is admin-only, but the privacy page promises erasure within 30 days. This is a legal requirement, not polish. | **H / S** | `pages/privacy.html`; DPDP Act ss.11-13 |
| **First visit** | Modernise / Remove | Choose the starting language from `navigator.languages` and show a slim, non-blocking bar ("हिंदी/Hinglish mein padhna hai? Switch"). **Remove** the 700 ms full-screen language modal and the Accept/Decline cookie banner. Decline does nothing: page-view tracking runs either way via `SiteRuntime.tsx:36`. Keep the Cookie Notice link in the footer. | **M / S** | `i18n.js:265-270`, `CookieBanner.tsx`, `SiteRuntime.tsx:36` |
| **Translation (i18n)** | Modernise (sequenced) | Pre-translate each chapter and room **once at publish time**, store it per locale, and server-render it with `hreflang` and the correct `html lang`. Ship **Hinglish, English and Hindi (Devanagari), human-reviewed**, first. Mark the other 6 languages "auto-translated (beta)". **Cost/tooling:** about 540k characters of course text × 8 languages ≈ 4.3M characters. On Google Cloud Translation (500k chars/month free, then $20/M) that is about **$75 one-off**. Bhashini or self-hosted **AI4Bharat IndicTrans2** (MIT) costs nothing and was built for Indian languages. Keep a never-translate glossary (commands, payloads, attack names). **Remove the gtx translator only after the per-locale pages ship.** Otherwise the 6 other languages fall back to English. When it goes, drop `translate.googleapis.com` and `api.mymemory.translated.net` from the CSP (`server/index.js:27`). | **H / L** | `js/translate.js:112`, `ctf-translate.ts:24-40`; cloud.google.com/translate/pricing; ai4bharat.iitm.ac.in; arxiv.org/abs/2305.16307 |
| **Visual system + a11y** | Modernise | Build a token-based component set on Tailwind + shadcn (see §4). Raise dim text to at least AA, use `var(--nav-h)` padding everywhere, add a visible focus ring, use real `<a>`/`<button>` elements, put `role=dialog` and a focus trap on every overlay, and add `@axe-core/playwright` to the test suite. | **M (H for a11y) / M** | `variables.css:4-45`; WCAG 2.4.7 / 2.1.1; `RoomsView.tsx:693` |
| **SEO plumbing** | Modernise | **Fix the canonical host first.** `alexcyberx.com` is hardcoded 458× (the `SITE_URL` fallback is at `web/src/lib/blog.ts:130`), but that domain doesn't serve the site. Every canonical, OG URL, sitemap entry and JSON-LD points at a dead host. Read one `SITE_URL` env everywhere: set it to the Render URL on staging (plus `noindex`) and to the real domain at launch. Generate `app/sitemap.ts` from the DB: fix `cyber-attacks` → `cyber-attacks-fundamentals`, add Network Forensics, chapters, rooms and tools, drop `/profile`, use real `lastmod`. Drop the deprecated `SearchAction`. Add `Article` + `BreadcrumbList` to chapters and posts. Add per-page OG images for WhatsApp and Instagram sharing. | **H / S** | `sitemap.xml`; `web/src/lib/blog.ts:130`; searchengineland sitelinks-search-box removal |
| **AI platform (new)** | Modernise | **AI hints and AI search run on Groq** (`openai/gpt-oss-20b` → `-120b`, `server/ai/llm.js:11-32`). Only the Mistake Analyzer uses Gemini. All AI features share one site-wide bucket, `AI_GLOBAL_PER_DAY` (default 600). One busy class day can starve hints, search and the analyzer together. Groq's free tier is about 30 RPM and 1,000 RPD per model, per org. Fix: keep per-feature budgets (hints > analyzer > search), per-user quotas in the DB, and a clear Hinglish "aaj ka AI quota khatam" state. Plan a paid key before launch. **Gemini terms issue:** the Gemini API Additional Terms bar services "directed to or likely to be used by" under-18s. Move the Mistake Analyzer to the same Groq path (simplest), or use a paid Gemini tier and confirm the age clause with the owner. Drop the retired `gemini-2.0-flash` fallback (`mistake-analyzer/routes.js:31`). | **H / S** | console.groq.com/docs/rate-limits; ai.google.dev/gemini-api/terms; tokencost.app gemini-2.0-flash deprecation |
| **Email delivery (new)** | Keep / Harden | Signup, reset and email-change emails go through a Supabase "Send Email" auth hook to Resend (`server/routes/authEmailHook.js`). Supabase HTTP hooks must answer in about **5 s**. A Render free instance cold-starts in about **1 minute**, so a cold start can break signup emails. On staging, keep the service warm or temporarily fall back to Supabase's built-in mailer. On the paid host this goes away. Resend's free plan is **3,000 emails/month, 100/day**, which is a launch-day cap to plan for. | **H / S** | supabase.com/docs/guides/auth/auth-hooks; render.com/docs/free; wpmailsmtp.com/resend-review |
| **Hosting region (new)** | Modernise `[paid-host]` | Supabase is in **Tokyo (ap-northeast-1)** (`docs/ARCHITECTURE.md:16`). The Render service is reportedly in Singapore (confirm in the dashboard), so every DB round-trip crosses regions. For the paid move, put **app and DB both in Mumbai (ap-south-1)**. Budget reference: Render Starter **$7/month (512 MB)**, with outbound-bandwidth allowances cut in Aug 2026; Supabase Pro **$25/month** (daily backups, no pausing). | M / M | supabase.com/docs/guides/platform/regions; render.com/changelog (bandwidth); supabase.com/pricing |

### Home

| Area | Verdict | What to do | Impact / Effort | Sources |
|---|---|---|---|---|
| Hero | Modernise | Use one Hinglish promise and one CTA: H1 "Cybersecurity seekho apni bhasha mein", CTA "Start free: pehla lab 10 min mein". **Remove** the fake terminal (rm -rf / hydra / sqlmap). Replace it with a switchable Learn/Practice/Tools product preview **or** a live mini Mistake-Analyzer box. Don't use `opacity:0` on the LCP text. Replace the roadmap.sh link with an internal "Start here". | **H / M** | `index.html:583-616`; `home-desk-new.png`; evilmartians devtool-landing study |
| Marquee "Skills covered" | **Remove** | It is mislabelled (room and tool names, not skills), decorative, low contrast (2.59:1) and can't be paused on touch (WCAG 2.2.2). Replace it with a static "New on AlexCyberX" row: the 3 newest items with real dates and deep links, reusing `marquee.ts` and the NEW-badge logic. | M / S | `HomeMarquee.tsx`, `marquee.ts`; WCAG 2.2.2 |
| Pillars + "Start here" | Add | Add a Learn / Practice / Tools block with **real DB counts**, and fix the "1 Chapter" bug on the cards. Count playable labs honestly (see the CTF table). Follow it with a 3-step path, then the course cards, then one final CTA. | **H / M** | `page.tsx:32-80` |
| Founder / proof | Modernise | Show one honest founder card: photo, a 2-3 sentence bio in normal sentence case, verifiable links. Make the claims match everywhere: keep CEH only with an EC-Council verify link, otherwise drop it. Add the photo the JSON-LD references, or remove the reference. Show product facts from the DB ("3 courses · N chapters · X labs"). **Remove** the second fake terminal and the scholarly `citation_*` meta tags. Never fake "X online". India's **Central Consumer Protection Authority Dark Patterns Guidelines, 2023** name "false urgency" and similar patterns. | **H / S** | `index.html:652-680,1508-1510`; scconline.com CCPA Dark Patterns Guidelines 2023 |
| About + Contact sections | Remove (move) | Move them to `/about` and `/contact` and link them from the footer. The mobile home page is about 3,300 px tall, and a third of it is bio, terminal and form. | M / S | `home-mob-new.png` |
| Logged-in home | Add | Render a dashboard: Continue learning, today's challenge, XP/streak, next room, "New since last visit". | **H / M** | TryHackMe/HTB dashboards |

### Courses / Learning

| Area | Verdict | What to do | Impact / Effort | Sources |
|---|---|---|---|---|
| **Course reader port (step 5e)** | Modernise | This is its own migration step. Move chapter content out of `js/chapters2.js`, `js/chapters3.js` and `js/chapter-content/*` (about 1.7 MB) into MDX files or DB rows, then server-render `/tutorials/<course>/<chapter>` on Next. Every other learning item in this table depends on it. | **H / L** | `NEXT_PAGES` has no learn routes; `docs/MIGRATION.md` |
| Chapter page | Modernise | Add a chapter-title H1 and breadcrumb (drop the repeated banner), a progress bar with "continue", reading time, a real `<a href>` per chapter, a thin TOC, "Mark complete & next", and a chapter downloads block (`resources.chapter_tag`). | **H / L** | `learn3.png`; HTB Academy sections |
| Knowledge checks | Add | Add 2-4 server-checked questions per chapter (MCQ plus a THM-style answer mask). Award the **unused** `quiz_pass`/`chapter_completion` XP. Answers never go in client JS. | **H / M** | `admin-panel-app.js:2032`; testing-effect research |
| Course↔lab↔tool links | Add | Add "Practice this: <lab>" on chapters, "Learn this first" on rooms, and tool deep-links. The mapping is exact (SQLi→web-03, PCAP→for-01, crt.sh→AlexRecon…). **Cheapest high-value change on the list.** It can ship on the current SPA before the reader port. | **H / S** | `ctf-challenges-data.js`; portswigger learning-path |
| Course overview page | Add | Add `/tutorials/<course>` with outcome, level, hours, syllabus in modules, prerequisites, Start/Continue and certificate info. Change the CEH wording to "CEH v13 **syllabus-aligned**, not EC-Council official training". | **H / M** | EC-Council trademark; PentesterLab badges |
| Course cards + `/tutorials` meta | Modernise | Add a level badge, hours, chapter and related-lab counts, language, a progress ring and Start/Continue. Fix the meta that omits **Ethical Hacking** (`tutorials/page.tsx` DESC). Generate JSON-LD from the DB. | M / S | `tutorials/page.tsx:10`; `page.tsx:47-70` |
| Learning paths | Add | Add 3 ordered paths (Shuruaat / SOC-Blue / Ethical-Hacker) as small DB tables with a % bar. "Choose Your Path" currently shows cards, not paths. | **H / M** | TryHackMe/HTB/PortSwigger paths |
| Progress visible to learner | Modernise | Count a chapter complete when its questions are answered (or on an explicit Mark-complete). Show checkmarks and % on cards, a Continue card on home and profile, and courses on `/u/<id>`. | **H / M** | `chapters.js:20`; HTB checkmarks |
| Certificates | Add | Offer a free "Certificate of **Completion**" earned through a final scenario assessment (the PayNova mission as a real lab), with a cert ID, a public `/cert/<id>` verify page and "Add to LinkedIn". Show the username, not the real name, unless the user opts in. This replaces the demo admin section (AUDIT item 16). | **H / M** | NPTEL/ISEA cert culture; TryHackMe completion-vs-certification |
| Content format + structure | Modernise | Convert the inline-styled HTML strings to Markdown/MDX with a component set (Callout/Table/Terminal/Diagram/Quiz/Practice) during step 5e. Update the India-law boxes from IPC to **BNS** section numbers. **Get the owner's yes first** on the Network Forensics 20.x career/duplicate chapters, the empty ch12 and the Attacks↔EH overlap. | M / L | `forensics-03.js`; `learn.html` chapter list; devgan.in/bns |
| Foundations course | Add | Write a 6-8 chapter Linux + "how the web works" mini-course in the Bandit format. Later add a browser shell (v86/WebAssembly for the first levels, no server cost). | **H / M** `[paid-host for full shell]` | overthewire bandit; v86 |
| Cheat sheets / offline notes | Add | Auto-generate a per-chapter command cheat sheet and a printable PDF (after the MDX move). | M / S | HTB cheat-sheet button |

### CTF / Labs

| Area | Verdict | What to do | Impact / Effort | Sources |
|---|---|---|---|---|
| **Honest room count** | Modernise | There are 12 room IDs, but 6 have no server instance (`hasLabFlow:false`: web-06, web-07, for-03, cry-01, cry-02, ai-01). These are static puzzles or downloads, and for-03 is currently broken. Say "12 challenges (6 live labs)" in copy, or split the labels into "Lab" and "Challenge". | M / S | `js/ctf-challenges-data.js` |
| **Log Hunter (bug)** | Modernise | The only Hard room is unplayable. `.gitignore:9` (`*.log`) drops `server/files/corpx_access.log`, so the download returns 500. `/download` is also gated behind an instance nothing starts, so it returns 403. Commit the log as `.txt` (or add `!server/files/*.log`), drop the instance gate on static downloads, and add a post-deploy smoke test that opens every lab and downloads every file. | **H / S** | `for03-loghunter/routes.js:8,43-53`; `.gitignore:9` |
| **Flags / anti-cheat** | Modernise | Now: rotate every flag, delete every `\|\| 'ACX{…}'` fallback (14 routers) so a missing env var fails closed, and **delete `FLAG_ALT`** in `server/labs/hidden-sight/routes.js:8`. It is a second accepted flag hardcoded in a public repo, so the rotation covers more than 12 strings. `hidden-sight` also serves web-01 (`server/index.js:125`). The downloadable PCAP/JPG files do **not** contain flags (checked). Later: per-user HMAC flags, "solve-on-exploit" for web labs and a flag-share detection table. | **H / S then M** | `server/labs/*/routes.js`; AUDIT item 32; Juice Shop HMAC |
| Room pages + access | Modernise | Build public, server-rendered `/rooms/<slug>` pages (objective, difficulty, time, "learn this first", task list, OG image, sitemap entry). Remove the forced username gate and suggest a username at signup instead. | **H / M** | `RoomsView.tsx:195-223`; tryhackme/htb public pages |
| Hints | Modernise | Use a hint ladder: H1 free, H2 costs 10% of the XP, H3 costs 25%, and "Show solution" gives 0 XP but marks the room done. Serve hint text only through `unlock_ctf_hint` and revoke SELECT on `hints` (AUDIT item 9). Rewrite the 3rd hints that currently give the answer away. | **H / S** | `RoomsView.tsx:752-762`; CTFd hints |
| Onboarding / header | Modernise | **Remove** the "My Stats" accordion. Replace it with one visible stat strip and a visible Daily Challenge card. Pin a 5-room "Start here" track. | **H / S** | `rooms-desk-new.png`; `RoomsView.tsx:629-668` |
| Tasks / guided mode | Modernise | Split rooms into numbered tasks with per-task answer boxes, format hints and partial credit, and offer Guided vs Challenge mode. Step lists for web-01 and ai-01 already exist in the data but `ctf.ts` drops them. | **H / M** | `ctf-challenges-data.js`; `ctf.ts` |
| START + timers | Remove (partial) | Drop the START button and the 30-minute "Instance Time Remaining" timer on the 6 static rooms: show "Open lab"/"Download" and the answer box at once. The Central Consumer Protection Authority's 2023 dark-patterns guidelines name **"false urgency"**, and a countdown with nothing behind it is exactly that. Keep a real server-side timer only for stateful labs. | M / M `[paid-host for real instances]` | `RoomsView.tsx:282,385-414`; scconline.com CCPA Dark Patterns 2023 |
| Filters | Modernise / Remove | Build chips only from categories that **have** rooms, with counts (Web 6 · Forensics 3 · Crypto 2 · AI 1). **Remove** the 4 empty chips (OSINT/Pwn/Reversing/Misc). On mobile, use one scrollable chip row plus a filter sheet. | M / S | `RoomsView.tsx:88-98`; `rooms-mob-new.png` |
| AI hint coach | Keep | Store the quota per `user_id` + room in the DB, not in sessionStorage. Feed it the last 3 wrong submissions, and switch to "explain mode" after a solve. Runs on Groq, so it is affected by the shared AI bucket (Global table). Market it as "AI mentor jo Hinglish mein samjhaata hai". | **H / S** | `server/ai/hints.js`, `server/ai/llm.js`; TryHackMe Echo / HTB Coach |
| Content pipeline + releases | Modernise | Move room content (story, tasks, hints, files, `published_at`) into the DB with an admin editor. Release 1 room a week, with first blood and recent solvers. Today `getRooms()` reads only the JS file, so rooms created in admin never appear. | **H / M** | `ctf.ts:64-100`; HTB Seasons |
| After-solve | Add | Show a debrief tab on solve: the bug, a 3-line fix and the next room. Add solver-only writeups and a per-room Q&A thread, reusing `community_threads`. | **H / M** | Root-Me/CTFd solutions |
| Leaderboard | Modernise | **Show the username by default, never `full_name`** (`player-utils.ts:9`); the audience includes minors. Fix the copy. Separate the CTF score (flags, after penalties) from Learning XP, and break ties by time. Add Weekly/All-time tabs and a pinned "You: #N", and later a College filter. Drop the fake "Live" dot. | **H / S** | `LeaderboardList.tsx:30`; `web/src/lib/player-utils.ts:9`; CTFd scores |
| Daily challenge | Modernise | Make the card visible now. Later, build a "Daily Drill" (1 question a day from a bank of about 100) with a streak that counts learning actions, not logins. | **H / M** | `RoomsView.tsx:229-239`; TryHackMe streaks |
| Browser Linux wargame | Add `[paid-host]` | A Bandit-style wargame of 15-20 levels, with xterm.js and a per-user container. The first 5 or so levels run free in v86. | **H / L** | overthewire bandit; v86 |
| Student CTF + clubs | Add `[paid-host]` | A quarterly weekend CTF with teams of up to 3 and dynamic scoring, plus private scoreboards for college clubs (the picoCTF classrooms model). | **H / L** | HTB Seasons; picoCTF classrooms; Amrita InCTF |

### Tools

| Area | Verdict | What to do | Impact / Effort | Sources |
|---|---|---|---|---|
| Per-tool public URLs | Modernise | Split AlexUtils' 14 utilities into `/tools/<name>` pages. The browser-only ones (base64, hash, JWT, URL, subnet, UUID, regex, JSON, password-gen) need **no login** and should say "runs in your browser, input never leaves your device". Keep UUID and JSON under a "Dev utilities" group. They are free search-traffic pages and cost nothing. Server tools keep login + Turnstile + per-user limits. | **H / M** | `page-scripts.js:1305-1345`; CyberChef/it-tools |
| Rate-limit keys | Modernise | `express-rate-limit@8.7.1` keys IPv6 by subnet by default (`ipv6Subnet`), and `trust proxy` is `1` (`server/index.js:13`). Jio mobile users (heavily IPv6) and a hostel behind one IPv4 CGNAT address are therefore limited very differently. Key the server-tool limits on `user_id` (login is required anyway) and keep IP limits only as a loose backstop. | M / S | `server/index.js:13`; express-rate-limit docs |
| Hinglish "samjho" explanations | Add | Add a collapsible Hinglish explanation to each result block (what an open 3389 means, why missing DMARC matters). Generic free tools can't copy this. | **H / M** | explainshell; regex101 |
| Password meter (Utils + Trace) | Modernise (**compliance, Stage 0**) | The naive meter rates `India@123` "Very strong". Replace it with **zxcvbn-ts + HIBP k-anonymity**: hash locally and send only the 5-character SHA-1 prefix. Move AlexTrace's password check fully client-side. Under the **SPDI Rules 2011 r.3 a password is sensitive personal data**, which triggers IT Act s.43A security duties. The cleanest fix is to never receive it. | **H / M** | `page-scripts.js` auCheckPassword; `alextrace/routes.js:172`; cloudflare k-anonymity; mondaq SPDI Rules review |
| AlexRecon ASN module | Modernise | `server/tools/alexrecon/modules/assets.js:143` calls `api.bgpview.io`, which has announced closure on **26 Nov 2026**. It still works today, but it **will** break then. Switch to RIPEstat (`stat.ripe.net/data/...`, free, no key) before that date; Wikimedia made the same move. | M / S | MISP warninglists #318; phabricator.wikimedia.org/T411309 |
| AlexRecon intrusive tier | Modernise | Port scan, dir/backup brute and bucket guessing fire at **any** typed domain, which is a plausible IT Act s.43/66 liability. Split it into a passive tier (free, any domain) and an active tier that needs DNS-TXT ownership proof **or** is limited to `scanme.nmap.org`. After this fix it is the flagship tool. | **H / M** | `alexrecon/modules/tier2.js`; worldlawdigest port-scanning-India |
| CVE search | Modernise | It uses NVD only, and NVD stopped enriching most CVEs (15 Apr 2026), so severity shows blank. Add CISA KEV and FIRST EPSS, and fall back to the CNA's CVSS score. | M / M | `alexutils/cve.js`; socket.dev NVD |
| AlexTrace username check | Modernise | It marks any HTTP 200 as "found", which gives false positives on login-walled sites when checked from a datacenter IP. Adopt the WhatsMyName detection model and report unverifiable sites as "couldn't verify". **Lookup-of-others ethics:** BNS s.78 (stalking) covers monitoring a woman's use of the internet or email. Show a "only check yourself / with consent" notice and keep no search history tied to other people's identifiers. | **H / M** | `alextrace/modules/username.js`; WhatsMyName; devgan.in/bns (s.78) |
| AlexTrace EXIF | Keep | Add a Hinglish note that sending a photo as a document on WhatsApp keeps its metadata, and a one-click "strip EXIF & download clean". | M / S | `alextrace/modules/metadata.js` |
| Mistake Analyzer | Keep / Modernise | The most distinctive tool. **First fix the Gemini terms issue**: move it to Groq, or use a paid tier and confirm the under-18 clause (see the AI platform row). Then put it on the home hero, allow a few logged-out runs a day (with Turnstile), add `scanme.nmap.org` example chips, and **answer in the user's language**. Today it answers only in English because `acx_lang_v4` is never sent. Add a "real passwords mat daalo" note. | **H / S** | `mistake-analyzer/routes.js:28-31`; ai.google.dev/gemini-api/terms |
| Tools hub cards | Modernise | Title each card by what it does (brand name second). Add footer badges: "No login / runs in browser" vs "Login, X/day". Group cards into Learn/Recon/OSINT/Utilities/Dev utilities. Add a lesson link and an output preview per card. Drop "More coming soon". | M / S | `index.html:1169-1258`; `tools.png` |
| New tools | Add | Add a reverse-shell generator, a hash identifier, an **email-header/phishing analyzer** (a SOC skill relevant in India), a security-headers grader, URL/file reputation (hash lookup only) and an **India Safety Toolkit** (Sanchar Saathi/TAFCOP, Aadhaar lock, 1930). Every tool gets Hinglish teaching. | **H / M** | revshells; Name-That-Hash; MDN Observatory; sancharsaathi.gov.in |
| Shareable result URLs | Add | Encode client-tool input in the URL hash (CyberChef-style) and add read-only share links for Recon reports. Never add them for Trace, whose reports describe a person. This is free organic growth. | **H / M** | CyberChef; regex101 |
| External API licences | Keep (audit) | Before the paid launch, check the terms of Shodan InternetDB, Safe Browsing, VirusTotal public, ipapi, HIBP (keep the CC-BY attribution AlexTrace shows), Groq and Gemini. Several are non-commercial or have age clauses. | **H / M** | shodan/vt/safe-browsing terms; ai.google.dev/gemini-api/terms |

### Community / Resources / Profile

| Area | Verdict | What to do | Impact / Effort | Sources |
|---|---|---|---|---|
| Forum | **Remove from nav** | It has 0 posts. It is already ported but switched off in Next (`NEXT_COMMUNITY`). Keep it off the nav and link Discord/Telegram/WhatsApp instead. Later, reuse the tables for solver-only writeups and per-room Q&A. | M / S | `community.js:62`; `Nav.tsx:63-68`; tryhackme/htb Discord |
| Resources | Modernise | Show matching resources as "Downloads for this chapter", and in the matching room too. Keep `/resources` as a **public** filterable index. Today the files come from **public Supabase Storage URLs** (`getPublicUrl`, `ResourcesView.tsx:21`), so the login gate is cosmetic: anyone with the URL can download. For free cheat sheets that's fine, so drop the gate. Use signed URLs only for anything that must stay members-only. | M / S | `resources.js:30-40`; `ResourcesView.tsx:21` |
| Profile → Dashboard | Modernise | Show Continue learning, per-course bars, labs by category, XP/level, streak and the daily challenge. The old dashboard elements exist only as hidden placeholders. Move Settings to a tab, including **Delete account / Download my data** and a "show my real name publicly" toggle (off by default). | **H / M** | `ProfileView.tsx`; `index.html:1884-1897` |
| `/u/<id>` skill card | Add | Add a shareable skills card: courses done, labs by category, certificates, "Verified on AlexCyberX", OG image. Show the username by default. For Indian students this works like a résumé line. | **H / M** | `u/[id]/page.tsx`; DSCI-SANS skilling report |
| Onboarding after signup | Add | Ask for a username at signup (auto-suggest) and the age band the DPDP decision needs. Then one 3-tap "Aap kahan se start kar rahe ho?" screen opens the right first chapter and lab. | M / M | `AuthModals.tsx:270-295`; `RoomsView.tsx:223` |

---

## 3. Remove candidates (owner must confirm each)

The structured `remove_candidates` list has the full set with replacements. In short, by confidence:

- **High confidence** (low risk; the owner already called out the first one): the "Skills covered" **marquee**; both **fake terminals** (hero and about); the **first-visit language modal** and the **Accept/Decline cookie banner**; the **4 empty CTF category chips**; the **"My Stats" accordion**; the **fake START/30-minute timers** on static rooms; the **forced username screen**; the **fractalNoise overlay + glow orb**.
- **Needs a clear yes** (user-facing pages or features): the **forum link** in the nav (keep the code, just take it off the nav); the **Refund + "Do Not Sell"** legal pages (merge into Privacy/Terms); the threatening **"Legal Warning"** (becomes Responsible Disclosure; its IPC/₹1 crore/Budapest text is wrong anyway).
- **Sequenced removal:** the **in-browser Google translator + overlay**. Remove it only after per-locale pages ship, or the 6 other languages fall back to English.
- **Content restructuring** (don't touch without a yes): Network Forensics 20.x career/duplicate chapters, the empty ch12, the Attacks↔EH overlap.
- **No longer proposed for removal:** UUID Generator and JSON Formatter. They stay as free, no-login "Dev utilities" pages, which supports lever #1.

Nothing here deletes real learning content. It removes decoration, dead UI, outdated US-style legal pages and fake urgency, and replaces each with something useful.

---

## 4. Design direction (decision, not options)

**Decision: adopt Tailwind CSS v4 + shadcn/ui (on Base UI, the shadcn default since Jul 2026) + lucide-react, introduced during migration steps 5c/5d/5e, with the old CSS quarantined in a cascade layer so nothing breaks.** No lens argues against this. Plain CSS would mean hand-building focus-trapped dialogs, menus, tabs and toasts, which is exactly what's missing today. AI-assisted work (how this site is built) is also most reliable on the most common stack.

**Pinned versions: exact, and at least two weeks old (checked on npm 2026-10-15; compatible with Next 16.3.8 / React 19.3.0):**
- `tailwindcss@4.3.3`
- `@tailwindcss/postcss@4.3.3`
- shadcn CLI `shadcn@4.21.0` (4 Sep). Not 4.21.5, released 14 Oct.
- `@base-ui/react@1.8.0` (4 Sep). Not 1.9.0, released 9 Oct.
- `lucide-react@1.49.0` (29 Sep). Not 1.57.0, released 14 Oct.
- `motion@13.4.6` (29 Sep), using `LazyMotion` + `m`. Not the brand-new 14.x major.
- `next-intl@4.14.9`
- `@zxcvbn-ts/core@4.2.0` (+ language packs)
- `cmdk@1.1.1`
- `sonner@2.0.8`
- `tw-animate-css@1.4.0`
- `@axe-core/playwright@4.13.0`: published 11 Aug 2026 and the current `latest` dist-tag (verified with `npm view`), so it installs fine.

Bump these deliberately later, with the Playwright suites as the gate.

**The quarantine trick (so the migration doesn't break anything):**
1. In `globals.css`, declare the layer order `@layer theme, base, legacy, components, utilities;`.
2. Then `@import "tailwindcss";`.
3. Then import the copied `/css` with `layer(legacy)`.
4. Unlayered CSS beats every layer, so first rename the **bare `nav`/`footer`** selectors (`css/nav.css:4`, `css/home.css:429`) to `#mainNav`/`.site-footer`. Otherwise any new semantic `<nav>` or `<footer>` gets the old fixed positioning and jumps to the top of the screen.
5. Point the old vars at the new tokens (`--red: var(--primary)`, `--text-dim: var(--muted-foreground)`) so both apps stay in sync.

**Tokens (dark-first; all text passes AA on the surfaces, checked):**
- Surfaces: `background #0a0a0c`, `card #111114`, `popover #17171b`, `muted #1f1f24`; border `rgb(255 255 255/.08)`.
- Text: `foreground #f4f4f5` (18:1), `secondary #b4b4bd` (9.6:1), `muted #8b8b96` (5.6-5.9:1). The muted token replaces every `#6a6a7a/#666/#555`. **Quick win today:** set `--text-dim: #8b8b96` in `variables.css`, which fixes 118 uses in both apps at once.
- Red: `primary #dc1414` is a **fill only** (white on it is 5.06:1 ✓). Red **text, links and focus rings** use `#f05252` (5.4:1 ✓), because `#dc1414` as text is only 3.9:1. `destructive` gets its own token.
- Category colours: reuse the existing CTF set, all ≥7:1 on cards: web `#60a5fa`, forensics `#a78bfa`, crypto `#fbbf24`, AI `#f472b6`. Use them site-wide, including on course cards.

**Type:**
- One scale: 12/14/16/18/20/24/30/36/48/60.
- **Body text 16px with line-height 1.6** (1.7 for Indic scripts).
- Rajdhani for headings ≥20px only, Inter for UI and body, **JetBrains Mono for data** (flags, XP, timers). The mono accent is what makes it read as a security product rather than a template.
- Radii 6/10/16.

**Fonts for Indian languages:** switch to `next/font/google` (self-hosted, no layout shift).
- **Rajdhani already ships a Devanagari subset**, so Hindi headings can stay in Rajdhani.
- Inter has **no** Indic subsets, so Hindi body text needs Noto Sans Devanagari. Tamil, Telugu, Bengali and Gurmukhi each need their own Noto Sans.
- `unicode-range` means English/Hinglish readers download none of it.
- This depends on the `html lang` fix.

**Motion:** use motion for feedback only: dialogs, toasts, correct/wrong answers, XP count-up and progress. Use CSS + `tw-animate-css`, and `motion` via `LazyMotion` for the few interactive pieces. Drop page fades, pulsing dots and blinking cursors. Keep the `prefers-reduced-motion` handling.

**Components to build once and reuse everywhere:**
- General: `PageHeader, Card, Chip, Button, Stat, EmptyState, Dialog, Sheet, DropdownMenu, Tabs, Command(⌘K), Toast`.
- Domain: `RoomCard, DifficultyBadge, CategoryIcon, XPBadge, FlagInput, TerminalBlock (real commands only), ChapterReader, QuizBlock`.

**Write the direction down:** add `docs/DESIGN.md` covering audience, tokens, type and do/don'ts: no fake terminals, no auto-marquees, no `opacity:0` hero, no red body text, no fake urgency, no flag icons for languages. Reference it from `CLAUDE.md`. Add a `/design` page that renders every component. This is what stops AI-built pages drifting back to 90 colours.

**Apply it page by page as each page migrates (never port a page twice):**
1. Foundation (1-2 days): Tailwind + shadcn init, tokens, `next/font`, the legacy layer, renaming the bare `nav`/`footer`.
2. Primitives, then port Nav, AuthModals, the room modal and ToolsHub.
3. With each remaining migration step, restyle that page and delete its legacy CSS:
   - **5c**: the three tools (do the public-URL split here);
   - the **home** rebuild;
   - **5e**: the course reader;
   - **5d**: admin.

   The existing old-vs-new Playwright screenshot suites catch regressions.

---

## 5. Product roadmap (ordered by risk, aligned to the migration)

This is a one-owner + AI team, and step 5e is large, so the work is ordered by **risk and dependency**, not by calendar week. Each stage ships on its own. Rough sizes are shown, but don't promise dates.

**Stage 0: safety, legal and un-break (a few days; do first)**
- Rotate every flag, delete the `|| 'ACX{…}'` fallbacks and `FLAG_ALT` (fail closed), and confirm the real-domain fix shipped.
- Fix **Log Hunter** (`.gitignore` and the download gate) and add the lab smoke test.
- Move the AlexTrace/AlexUtils password check client-side (zxcvbn + HIBP), so the server never receives passwords (sensitive data under the SPDI Rules).
- Gate AlexRecon's intrusive tier to owned domains or `scanme.nmap.org`.
- Show the username on the leaderboard and `/u/<id>`, not `full_name`.
- Mistake Analyzer: move it to Groq (or a paid Gemini tier) and drop `gemini-2.0-flash`. Split `AI_GLOBAL_PER_DAY` into per-feature budgets.
- Signup emails: keep staging warm or fall back to Supabase's mailer so the 5 s hook doesn't time out on a cold start.
- Read `SITE_URL` from env everywhere, and add `noindex` on staging.
- Quick wins: `--text-dim: #8b8b96`, automatic footer year, and correct the Legal Warning's law citations (or take the page down if the owner agrees).

**Stage 1: owner decisions (one conversation, unblocks Stages 3-5)**
- DPDP minors: 18+ signup, or parental consent + the education exemption? Is CEH real (keep it with a verify link) or dropped? The remove list in §3.

**Stage 2: design system + 5c tools, made public (about 1-2 weeks)**
- Design-system foundation and primitives (§4).
- Port AlexUtils, AlexTrace and AlexRecon to **public per-tool URLs**. Gate the server tools with login + Turnstile + per-user limits.
- Fix the AlexTrace username model and add the consent notice. Add Hinglish "samjho" blurbs. Ship the Mistake Analyzer in the user's language. Swap the ASN source to RIPEstat (before 26 Nov 2026).
- Remove the browser-only tools from `ACX_PROTECTED_PAGES`.
- Port AI search into ⌘K.

**Stage 3: home + quick learning wins on the current SPA (about 1 week)**
- Rebuild the home page: hero, pillars with real counts, "Start here", "New this week", an honest founder card.
- Remove the marquee, both terminals, the language modal and the cookie banner.
- Fix the "1 Chapter" count. Generate meta and JSON-LD from the DB.
- Add **Practice-this / Learn-this-first links** (cheapest high-value change).
- Remove `learn*/ctf/resources` from the login wall.

**Stage 4: CTF upgrade + profile (about 1-2 weeks)**
- Build public `/rooms/<slug>` pages and the hint ladder.
- Add the visible stat strip and daily card. Remove the accordion, the empty chips and the fake timers.
- Add the after-solve debrief.
- Turn `/profile` into a dashboard, with delete/export account and the real-name toggle. Make `/u/<id>` a skill card. Add post-signup onboarding.

**Stage 5: step 5e, the course reader (the largest item, several weeks)**
- Move chapter content from the `js/` files into MDX or the DB, then server-render the chapter pages.
- Add chapter H1, progress, 2-4 server-checked questions (awarding the unused XP), chapter downloads, BNS-updated law boxes, course overview pages and learning paths.
- Then the i18n pipeline: pre-translate (IndicTrans2/Bhashini, or about $75 of Cloud Translation), human-review Hinglish/English/Hindi, set up next-intl + hreflang. **Only then** remove the gtx translator and its CSP entries.

**Stage 6: 5d admin + content operations**
- Port the admin panel with room and chapter editors and the DB content pipeline. Replace the demo sections (certificates, moderation). Add completion certificates.

**Later / `[paid-host]`:**
- Move app and DB to Mumbai, attach the real domain, and switch `SITE_URL`.
- Weekly room releases with first blood.
- Browser Linux wargame.
- Per-user lab instances and a labs subdomain.
- Student CTF and college clubs.
- New tools (revshells, hash-id, email-header, India Safety Toolkit).
- A paid AI key.

**Monetisation (keep it free now):** every lens agrees. Reading, questions, basic rooms and completion certificates stay free; that drives growth and SEO with a price-sensitive audience. Add a *tier column* to the schema now, so a future ₹499-999 tier is possible later (proctored cert, heavy labs, unlimited AI) with UPI and student pricing. Don't build a paywall now.

---

## 6. Resolved contradictions between lenses

- **Course SEO markup.** The learning-platforms lens wanted "Course JSON-LD + Course Info carousel". The modern-UI lens said Course Info is dead. **Resolved:** Google deprecated the Course Info rich result on 12 Jun 2025, so don't build for it. Prioritise `Article` + `BreadcrumbList` on chapters, accurate per-page meta, `hreflang`, and a canonical host that actually serves the site. Add plain `Course` JSON-LD for correctness and for other search engines, but expect no rich result.
- **Real-domain attack examples.** Three lenses flag `paynova.com`/`target.com` as live. **Resolved:** already fixed in the branch (AUDIT item 49). What remains is the fake hero terminal, and, separately and still open, AlexRecon scanning any typed domain.
- **BGPView urgency.** One lens called the ASN module "dead". **Resolved:** the closure is announced for 26 Nov 2026. Schedule the RIPEstat swap in Stage 2. It is not an outage today.
- **Forum.** "Remove from nav" vs "build writeups on it". **Resolved:** not a conflict. Take the empty forum off the nav now (point to Discord/Telegram), keep the `community_*` tables, and reuse them later for solver-only writeups and per-room Q&A.
- **Daily challenge.** "Make visible" vs "replace/remove". **Resolved:** same direction, phased. A visible card now; a daily-drill content model and a learning streak later.
- **Flags.** "Rotate now" vs "per-user HMAC". **Resolved:** do them in order. Rotate + fail closed + delete `FLAG_ALT` in Stage 0; per-user HMAC and solve-on-exploit next.
- **Translator.** "Remove now" vs "it's the only path for 6 languages". **Resolved:** build the per-locale pipeline first, then remove the translator.
- **UUID/JSON tools.** "Drop as off-topic" vs "free public SEO pages". **Resolved:** keep them, grouped under Dev utilities.

---

### Open items from the audit (still true, worth tracking)
- Flag rotation + git history (item 32).
- Lab instances lost on restart (item 8).
- `ctf_challenges.hints` readable by anon (item 9).
- Unique-username migration not applied (item 20).
- Admin demo sections (item 16).
- CORS `*` fallback, CSP `unsafe-inline` and same-origin labs (open #1-2). Class-based styling from the design system helps retire `unsafe-inline`; the labs subdomain is a `[paid-host]` item.

New from this review: no account delete/export, no DPDP minors decision, Gemini age terms, the shared AI quota, signup-hook cold starts, and canonical URLs on a host that doesn't serve the site.
