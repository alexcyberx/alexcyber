# CTF labs on their own origin

Live since 2026-10-24: main `alexcyber` (`LAB_ORIGIN=https://alexcyber-labs.onrender.com`), labs service
`alexcyber-labs` (`srv-dbe5odvb9u1s73c938q0`, Singapore, free, autoDeploy off), env group `acx-flags`
(`FLAG_SECRET`) linked to both. The main server logged "uses the same flag secret" after the switch.
A change to the labs (`server/labs/`, `pages/labs/`, `server/labs-server.js`) needs a deploy of **both** services.

Owner decision 2026-10-24: the labs move off the main site, the way picoCTF (`play.picoctf.org` / `*.picoctf.net`)
and PortSwigger (`*.web-security-academy.net`) do it. The labs are vulnerable on purpose; on their own origin a bug
in one cannot read the student's login (the Supabase session lives in the main site's `localStorage`), and the labs
server holds no database key.

## Two services, one repo
| | Main site (`alexcyber`) | Labs server (`alexcyber-labs`, new) |
|---|---|---|
| Start | `node server/index.js` | `node server/labs-server.js` (`npm run start:labs`) |
| Serves | site, Next, login, CTF page, flag check, XP | `/api/lab/<lab>/*`, `/pages/labs/*`, `/healthz`, `/` |
| Keys | Supabase service role, Resend, AI, `FLAG_SECRET` | `FLAG_SECRET`, `AI_API_KEY` (AI room only). **No Supabase key.** |
| Env | `LAB_ORIGIN=https://alexcyber-labs.onrender.com` | `SITE_URL=https://alexcyber.onrender.com`, `SKIP_WEB_BUILD=1` |

Without `LAB_ORIGIN` the main server mounts the labs itself (local dev, tests, rollback). Code: `server/labs/mount.js`
(the list of labs, start page, cleanup), `server/labs/origin.js` (LAB_ORIGIN + start-up secret check),
`server/routes/labFlag.js` (flag submit), `server/labs-server.js`.

## Flow
1. CTF page (`/rooms`, `RoomsView.tsx`): Start makes a lab session id; View Lab opens a new tab with `noopener`
   (the lab tab gets no handle to the CTF page). The CTF page itself never sends a request to the labs origin, so
   the main CSP and CORS stay as they were.
2. Lab-flow labs open `<LAB_ORIGIN>/api/lab/<lab>/start?session=<id>`: that page restarts the instance and loads
   `/page`. Opening the lab again goes to `/page` (no restart). Static labs open `<LAB_ORIGIN>/pages/labs/...`.
3. The student submits the flag on the CTF page. Lab-flow rooms: `POST /api/lab/flag {slug, flag}` on the main
   server (with the login token), checked with the shared secret (`flags.js isFlag`) and recorded with
   `record_lab_ctf_solve`. Other rooms: `submit_ctf_flag` RPC (sha256 in `ctf_challenges.flag_hash`), as before.
4. "Back to CTF" in a lab closes the tab; if the browser does not allow that, it goes to `/rooms?open=<id>`, which
   the labs server redirects to the main site.
5. Old links to a lab on the main site redirect (GET) to the labs server; a POST there answers 410.

`FLAG_SECRET` must be the same on both services. The labs server's `/healthz` returns a fingerprint
(HMAC of the secret, says nothing about a flag); the main server checks it after start and logs an error if the
two differ.

## Render setup (testing; the paid domain later)
1. Environment Group `acx-flags` with `FLAG_SECRET` (value from the dashboard's generate button, never in chat),
   linked to both services. Setting it changes every flag once: the main server re-syncs `flag_hash` on start;
   solves and XP already earned stay.
2. New web service `alexcyber-labs` (free): same repo, branch `main`, build `npm install`, start
   `node server/labs-server.js`, env `SITE_URL`, `SKIP_WEB_BUILD=1`, `NODE_ENV=production`, plus `AI_API_KEY`
   (and `AI_BASE_URL` / models if the main service sets them). Health check path `/healthz`.
3. Main service: `LAB_ORIGIN=https://alexcyber-labs.onrender.com`, redeploy. Check the log for
   "labs server ... uses the same flag secret".
4. Free plan: the labs service sleeps after 15 min idle; the first lab then takes 30 to 60 s (Render shows its own
   loading page, then our "Starting your lab" page).

Rollback: remove `LAB_ORIGIN` from the main service and redeploy; the labs run on the main site again.

## Later (paid domain)
- Labs on a separate registrable domain (e.g. `alexcyberx-labs.com`), not a subdomain of the main one, with HTTPS.
- A random subdomain per instance (`k3f9a2.alexcyberx-labs.com`, wildcard DNS + certificate) instead of `?session=`.
- Per-student containers for rooms that need a real database or shell.

## Rules for new labs
- Add the lab to `LABS` in `server/labs/mount.js` and its flag theme to `server/labs/flags.js`; never write a flag.
- A lab must not need a database key or a login token. Anything that awards XP happens on the main server.
- Links back to the site use `/rooms?open=<slug>` (redirected by the labs server); no `window.opener` calls.
