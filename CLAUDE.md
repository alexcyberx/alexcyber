# AlexCyberX: working notes for Claude

Read this first in every session. It records what the owner wants; follow it.

## Talking to the owner
- Talk in **Hinglish** (simple words; the owner is not a developer and relies on your judgement).
- After every deploy, tell the owner it is done (what changed, what to test).
- Before **removing** any feature/page/section, ask once and get a yes. Improving or fixing does not need a question.

## What we are building (product direction, from the owner)
- AlexCyberX is **not only a CTF site**. It will have many **powerful, genuinely useful security tools**, **courses**,
  CTF labs, and more over time. Aim: the **best platform of its kind**, and keep upgrading it.
- Do **not** port old code 1:1 just because it exists. When moving a page to Next.js, keep what is useful,
  **modernise** what is old-style, and **propose removing** what is useless (then confirm with the owner).
  Example the owner called out: the home page "Skills covered across the platform" text scroller looks pointless;
  real platforms don't do that.
- Study how the good platforms do it (TryHackMe, Hack The Box / HTB Academy, PortSwigger Web Security Academy,
  picoCTF, OverTheWire, CyberDefenders/LetsDefend, Root-Me, PentesterLab, and modern well-made indie/vibe-coded
  products) and copy what works: structure, onboarding, progress, UX patterns, clean modern UI. Use common sense;
  nothing decorative without a purpose.
- Audience: Indian students learning cybersecurity (Hindi/Hinglish + other Indian languages via the language picker).

## Hosting
- **Render is only for testing** until the project is complete. The final site goes on **paid domain + hosting**.
  Keep the setup portable (single Express service that also runs Next.js, see docs/MIGRATION.md). The CTF labs
  run as a second service on their own origin (`alexcyber-labs`, no database keys, see docs/LABS.md).

## Rules (read first)
- `brain/rules/` = what the project allows: `business.md` (XP, CTF, courses, community...), `permissions.md`
  (roles, who can do what), `security.md` (rules code must follow). Build only inside these rules; if a change adds a
  route/table/RPC/role/page, update the matching file in the same PR. Contradictions listed there need the owner.

## Security (read first)
- `brain/security/` is the security source of truth: `threat-model.md`, `secrets.md`, `attack-surface.md`,
  `security-checklist.md`. Read the checklist before touching auth, labs, tools, Supabase SQL, the admin panel or
  anything that renders HTML; follow its "Rules for AI agents"; update it (and "Last verified") when you fix a finding
  or add a surface. Never write secret values or CTF flags there.

## How we work
- Branch `claude/fervent-pascal-cmg7k6` → PR to `main` → merge → deploy the `alexcyber` Render service
  (`srv-d8oil4beo5us73eatqig`, workspace `tea-d8grqaernols73f0l7k0`; autoDeploy is off, trigger it manually).
  A change to `server/labs/`, `pages/labs/` or `server/labs-server.js` also needs a deploy of the labs service
  `alexcyber-labs` (`srv-dbe5odvb9u1s73c938q0`, same repo and branch, autoDeploy off).
- Test before every push (mock-Supabase Playwright suites, real server checks). Never put secrets or CTF flags in
  client code. DB changes: write a file in `supabase/migrations/` and apply it (Supabase project `rwjwjltlfkxadywfqxbs`).
- The GitHub repo is public: anything committed is public.
- Docs to keep up to date: `docs/MIGRATION.md` (what is on Next, how it is deployed), `docs/AUDIT-2026-10-09.md`
  (bugs found and fixed, open items).
