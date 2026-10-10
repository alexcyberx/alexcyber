# AlexCyberX CTF Platform

Cybersecurity learning + CTF platform. Vanilla JS SPA + Node/Express + Supabase.

> Deployment note: the current Render deployment is **staging only**. A custom domain and proper hosting
> will be set up when the project is complete; don't treat Render free-tier limits as permanent.

## Run locally
```bash
npm install
cp .env.example .env   # fill SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GROQ_API_KEY ...
npm start              # http://localhost:3000
```

## Docs (read these first)
- `docs/ARCHITECTURE.md` — stack, request flow, server modules, env vars, known gaps
- `docs/DB-SCHEMA.md` — tables, RLS, RPC functions, rules
- `docs/WEB-FLOW.md` — URLs, pages, user journeys
- `docs/MIGRATION.md` — Next.js migration (step 1: /blog), deploy + rollback
- `docs/AUDIT-2026-10-09.md` — security audit: what was fixed, what is still open
- `supabase/migrations/` — SQL applied/prepared by the audit (see header comments for ordering)

## Rules for AI-assisted changes
- Read `docs/` first; one task at a time; update the docs when behaviour changes.
- Never trust a user id from the request body; use `requireAuth` (JWT).
- Never put secrets in the repo; names only in `.env.example`.
- New tool/feature: write the PRD + TRD + schema (incl. RLS) *before* coding.
