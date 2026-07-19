# AlexCyberX CTF Platform

> **Deployment status note (read this first):** The current Render deployment is
> **testing/staging only**. A custom domain + proper hosting will be purchased once
> the project is complete. Don't treat Render free-tier constraints (cold starts,
> sleep, ephemeral storage, etc.) as a fixed production limitation when proposing
> features or architecture — they're temporary. No need to re-confirm this with
> Alex each session.

## Setup

```bash
npm install
cp .env.example .env
npm start
```

Server starts on http://localhost:3000

## Structure

```
alexcyberx-ctf/
├── server/              # Node.js Express backend
│   ├── index.js         # Entry point
│   ├── labs/
│   │   ├── web01-sqli/  # SQL Injection lab backend
│   │   └── web02-xss/   # Stored XSS lab backend
│   ├── db/              # SQLite databases (auto-created on start)
│   └── middleware/
├── pages/
│   ├── ctf.html         # CTF challenges listing page
│   └── labs/
│       ├── lab-sqli.html  # WEB-01 SQL Injection lab
│       └── lab-xss.html   # WEB-02 Stored XSS lab
├── css/, js/, components/, diagrams/
└── index.html
```

## Labs

WEB-01 SQL Injection — POST /api/lab/web01/login
WEB-02 Stored XSS   — POST /api/lab/web02/comment, GET /api/lab/web02/comments

## Production Deploy

Set environment variables:
- PORT
- ALLOWED_ORIGIN (your domain)
- FLAG_WEB01, FLAG_WEB02 (change default flags)
