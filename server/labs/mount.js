// ── CTF LABS: one place that mounts every lab ───────────────────
// Used by the labs server (server/labs-server.js, its own origin, no
// database keys) and, when LAB_ORIGIN is not set, by the main server
// (local dev, tests, rollback). See docs/LABS.md.
//
// Lab-flow labs (hasLabFlow) run their own instance (start, page, timer).
// The flag is still submitted on the CTF page, which posts it to the main
// server (/api/ctf/lab-submit): the main server checks it with the shared
// flag secret and records the solve. A lab never sees a login token.
const express = require('express');
const path = require('path');
const { labSessionGuard, SESSION_RE } = require('../middleware/labSession');

// name = /api/lab/<name>; slug = CTF room; flow = lab-flow (own instance + /page);
// ttlSec = instance lifetime + 5 min buffer (memory cleanup); sql = instance holds a sql.js DB.
const LABS = [
  { name: 'hidden', slug: 'web-01', path: './hidden-sight/routes', flow: true, ttlSec: 20 * 60 },
  { name: 'cookie', slug: 'web-02', path: './web02-cookie/routes', flow: true, ttlSec: 35 * 60 },
  { name: 'sqli101', slug: 'web-03', path: './web03-sqli101/routes', flow: true, ttlSec: 35 * 60, sql: true },
  { name: 'robots', slug: 'web-04', path: './web04-robots/routes', flow: true, ttlSec: 20 * 60 },
  { name: 'packet', slug: 'for-01', path: './for01-packet/routes', flow: true, ttlSec: 35 * 60 },
  { name: 'metadata', slug: 'for-02', path: './for02-metadata/routes', flow: true, ttlSec: 20 * 60 },
  { name: 'orders', slug: 'web-08', path: './web08-orders/routes', flow: true, ttlSec: 20 * 60 },
  { name: 'midnight', slug: 'for-04', path: './for04-midnight/routes', flow: true, ttlSec: 35 * 60 },
  { name: 'caesar', slug: 'cry-01', path: './cry01-caesar/routes' },
  { name: 'base64', slug: 'cry-02', path: './cry02-base64/routes' },
  { name: 'deserialize', slug: 'web-06', path: './web06-deserialize/routes' },
  { name: 'deserialize-medium', slug: 'web-07', path: './web07-deserialize-medium/routes' },
  { name: 'aichat-easy', slug: 'ai-01', path: './ai01-helpdesk-easy/routes' },
];
const FLOW_SLUGS = new Set(LABS.filter((l) => l.flow).map((l) => l.slug));

// Opening a lab-flow lab: this page (on the lab's own origin) restarts the
// instance for the session in the URL and then loads the lab. The CTF page
// only opens it in a new tab, so it never talks to the lab origin itself
// (no CORS, no lab origin in the main site's CSP).
function startPage(lab, session) {
  const api = '/api/lab/' + lab;
  const s = JSON.stringify(session).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Starting lab - AlexCyberX Labs</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0d;color:#e4e4ef;font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:24px}
.b{max-width:420px}.s{width:28px;height:28px;border:3px solid #2a2a33;border-top-color:#10b981;border-radius:50%;margin:0 auto 18px;animation:r .8s linear infinite}
@keyframes r{to{transform:rotate(360deg)}}h1{font-size:18px;margin:0 0 8px}p{font-size:13.5px;color:#9a9aa5;line-height:1.6;margin:0}</style></head>
<body><div class="b"><div class="s" id="s"></div><h1 id="t">Starting your lab...</h1><p id="m">This takes a few seconds.</p></div>
<script>
(function () {
  var S = ${s};
  fetch(${JSON.stringify(api)} + '/instance/restart', { method: 'POST', headers: { 'X-Lab-Session': S } })
    .then(function (r) { if (!r.ok) throw new Error(r.status === 429 ? 'Too many lab restarts. Please wait a few minutes.' : 'The lab did not start.'); })
    .then(function () { location.replace(${JSON.stringify(api)} + '/page?session=' + encodeURIComponent(S)); })
    .catch(function (e) {
      document.getElementById('s').style.display = 'none';
      document.getElementById('t').textContent = 'Could not start the lab';
      document.getElementById('m').textContent = (e && e.message) + ' Close this tab and press Start again on the CTF page.';
    });
})();
</script></body></html>`;
}

/** Mount every lab on `app`. `wrap(slug)` optionally returns a middleware put in front of a lab router. */
function mountLabs(app, { wrap } = {}) {
  app.use('/api/lab', labSessionGuard);
  app.get('/api/lab/:lab/start', (req, res, next) => {
    const lab = LABS.find((l) => l.name === req.params.lab && l.flow);
    if (!lab) return next();
    const s = typeof req.query.session === 'string' ? req.query.session : '';
    if (!SESSION_RE.test(s)) return res.status(400).json({ error: 'Invalid lab session.' });
    res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' }).type('html').send(startPage(lab.name, s));
  });
  for (const l of LABS) {
    const router = require(l.path);
    const pre = wrap ? wrap(l) : null;
    if (pre) app.use('/api/lab/' + l.name, pre, router);
    else app.use('/api/lab/' + l.name, router);
  }
  // Static lab pages (the labs without their own instance).
  app.use('/pages/labs', express.static(path.join(__dirname, '../../pages/labs'), { index: false }));
}

// ── Instance memory cleanup ──
// Every lab router exports _instances; expired ones are dropped every 10 min
// (each lab's own lifetime + 5 min buffer). sql.js databases are closed first.
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
function cleanExpiredInstances(name, instances, ttlSec, hasSqlDb) {
  const now = Date.now();
  let cleaned = 0;
  for (const [key, inst] of Object.entries(instances)) {
    if (Math.floor((now - (inst.startedAt || 0)) / 1000) > ttlSec) {
      if (hasSqlDb && inst.db) { try { inst.db.close(); } catch (e) { /* already closed */ } }
      delete instances[key];
      cleaned++;
    }
  }
  if (cleaned > 0) console.log(`[Cleanup] ${name}: removed ${cleaned} expired instances`);
}
function startLabCleanup() {
  return setInterval(() => {
    for (const l of LABS) {
      if (!l.ttlSec) continue;
      try {
        const instances = require(l.path)._instances;
        if (instances && typeof instances === 'object') cleanExpiredInstances(l.name, instances, l.ttlSec, !!l.sql);
      } catch (e) { console.error('[Cleanup]', l.name, e.message); }
    }
  }, CLEANUP_INTERVAL_MS).unref();
}

module.exports = { LABS, FLOW_SLUGS, mountLabs, startLabCleanup };
