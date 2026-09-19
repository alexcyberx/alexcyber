const express    = require('express');
const router     = express.Router();
const { getHiddenDb } = require('../../db/sqlite');
const { flagLimiter }  = require('../../middleware/rateLimit');
const { logAttempt }   = require('../../middleware/logger');

const FLAG  = process.env.FLAG_HIDDEN || 'ACX{c0mm3nts_4r3_n0t_s3cr3t}';
const FLAG_ALT = 'ACX{html_comments_are_not_safe}'; // legacy alias, also accept
const PART1_B64  = 'UEFSVDE6QUNYe2MwbW0zbnRzXw=='; // decodes to PART1:ACX{c0mm3nts_
const FAKE1_B64  = 'Q29ycFgtQnVpbGQtdjIuNC4xLWludGVybmFs'; // decodes to CorpX-Build-v2.4.1-internal
const FAKE2_B64  = 'c2Vzc2lvbl9iYWNrdXBfa2V5X0RPX05PVF9TSEFSRQ=='; // decodes to session_backup_key_DO_NOT_SHARE
const PART2_HDR  = '4r3_';   // hidden in X-Debug-Token response header on /internal/
const PART3_HEX  = '6e30745f7333637233747d'; // hex of n0t_s3cr3t}

const INSTANCE_DURATION_SEC = 30 * 60; // 30 minutes per instance

// In-memory instance tracking, keyed by session id
// { sessionId: { startedAt: epochMs, solved: bool } }
const instances = {};

function getOrCreateInstance(sessionId) {
  if (!instances[sessionId]) {
    instances[sessionId] = { startedAt: Date.now(), solved: false };
  }
  return instances[sessionId];
}

function resetInstance(sessionId) {
  instances[sessionId] = { startedAt: Date.now(), solved: false };
  return instances[sessionId];
}

function getInstanceStatus(sessionId) {
  const inst = getOrCreateInstance(sessionId);
  const elapsedSec = Math.floor((Date.now() - inst.startedAt) / 1000);
  const remainingSec = Math.max(0, INSTANCE_DURATION_SEC - elapsedSec);
  return {
    running:       remainingSec > 0,
    remaining_sec: remainingSec,
    solved:        inst.solved
  };
}

// Instance existing aur abhi running honi chahiye, agar kabhi start hi nahi
// hui, ya stop/expire ho gayi hai, to false. (getOrCreateInstance se alag, 
// ye naya instance silently create nahi karta.)
function isInstanceRunning(sessionId) {
  const inst = instances[sessionId];
  if (!inst) return false;
  const elapsedSec = Math.floor((Date.now() - inst.startedAt) / 1000);
  return (INSTANCE_DURATION_SEC - elapsedSec) > 0;
}

function sendInstanceNotActive(res) {
  res.status(403).setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Instance Not Active</title>
<style>
  body{background:#0a0a12;color:#e4e4ef;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;}
  .box{max-width:420px;padding:32px;}
  h1{font-size:20px;margin:0 0 10px;}
  p{font-size:14px;color:#9999a6;line-height:1.6;}
</style></head>
<body>
  <div class="box">
    <h1>Instance Not Active</h1>
    <p>This lab instance is not running. Go back to the challenge and press Start (or Restart Instance) to begin a fresh session.</p>
  </div>
</body>
</html>`);
}

// GET /api/lab/hidden/instance/status
router.get('/instance/status', (req, res) => {
  const sessionId = req.headers['x-lab-session'] || req.query.session || req.ip;
  res.json(getInstanceStatus(sessionId));
});

// POST /api/lab/hidden/instance/restart
router.post('/instance/restart', (req, res) => {
  const sessionId = req.headers['x-lab-session'] || req.query.session || req.ip;
  resetInstance(sessionId);
  logAttempt('HIDDEN', req.ip, 'instance_restart', 'ok');
  res.json({ success: true, ...getInstanceStatus(sessionId) });
});

// POST /api/lab/hidden/instance/stop
// Called when user starts a different challenge, stops this instance immediately
router.post('/instance/stop', (req, res) => {
  const sessionId = req.headers['x-lab-session'] || req.query.session || req.ip;
  if (instances[sessionId]) {
    // Expire by setting startedAt far in the past
    instances[sessionId].startedAt = Date.now() - (INSTANCE_DURATION_SEC + 1) * 1000;
  }
  logAttempt('HIDDEN', req.ip, 'instance_stop', 'ok');
  res.json({ success: true, running: false, remaining_sec: 0 });
});

// GET /api/lab/hidden/page
// Returns the target site HTML with 3 base64 strings in comments, only one is real
// Session resolution order: X-Lab-Session header (used by fetch() calls) ->
// ?session= query param (used by the <iframe src> load, which cannot set
// custom headers) -> req.ip as a last resort. Without the query-param
// fallback, the iframe's page load and the lab page's own status/restart/
// submit calls (which DO send the header) would resolve to two different
// session buckets server-side, breaking instance status sync.
router.get('/page', (req, res) => {
  const sessionId = req.headers['x-lab-session'] || req.query.session || req.ip;
  if (!isInstanceRunning(sessionId)) return sendInstanceNotActive(res);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>CorpX Internal Portal</title>
<style>
  body{background:#f5f5f5;font-family:Arial,sans-serif;margin:0;}
  header{background:#1a1a2e;color:#fff;padding:16px 32px;}
  header h1{margin:0;font-size:20px;}
  nav{background:#16213e;padding:8px 32px;display:flex;gap:20px;}
  nav a{color:#a0aec0;text-decoration:none;font-size:13px;}
  nav a:hover{color:#fff;}
  .hero{background:#fff;border-bottom:1px solid #e2e8f0;padding:48px 32px;}
  .hero h2{color:#1a1a2e;font-size:28px;margin:0 0 12px;}
  .hero p{color:#718096;font-size:14px;line-height:1.7;max-width:560px;}
  .cards{display:flex;gap:20px;padding:32px;flex-wrap:wrap;}
  .card{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:20px;width:200px;}
  .card h3{font-size:14px;color:#2d3748;margin:0 0 6px;}
  .card p{font-size:12px;color:#718096;margin:0;}
  footer{background:#1a1a2e;color:#4a5568;text-align:center;padding:16px;font-size:12px;}
</style>
</head>
<body>

<!-- 
  build-ref: ${FAKE1_B64}
  cache-buster: v2024.11
-->

<!-- auth-fallback: ${FAKE2_B64} -->

<!--
  TODO: cleanup before go-live
  legacy-cfg: ${PART1_B64}
-->

<header><h1>CorpX Internal Portal</h1></header>

<nav>
  <a href="#">Home</a>
  <a href="#">Dashboard</a>
  <a href="#">Reports</a>
  <a href="#">Settings</a>
  <a href="#">Logout</a>
</nav>

<div class="hero">
  <h2>Welcome back, Employee</h2>
  <p>This is the internal employee portal for CorpX Ltd. Access your reports, manage your profile, and stay updated with company announcements.</p>
</div>

<div class="cards">
  <div class="card"><h3>Reports</h3><p>View your monthly performance reports.</p></div>
  <div class="card"><h3>Directory</h3><p>Browse the internal employee directory.</p></div>
  <div class="card"><h3>Announcements</h3><p>Latest company news and updates.</p></div>
  <div class="card"><h3>Support</h3><p>Raise a ticket or contact IT helpdesk.</p></div>
</div>

<footer>CorpX Ltd. Internal Portal v2.4.1. Unauthorized access is prohibited.</footer>

<script src="/api/lab/hidden/static/portal.js"></script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// GET /api/lab/hidden/robots.txt
// Disallows /internal/, gives student the next breadcrumb
router.get('/robots.txt', (req, res) => {
  const sessionId = req.headers['x-lab-session'] || req.query.session || req.ip;
  if (!isInstanceRunning(sessionId)) return sendInstanceNotActive(res);
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *
Disallow: /internal/
Disallow: /backup/
Disallow: /admin/
Disallow: /api/
`);
});

// GET /api/lab/hidden/internal/
// 404 page, but X-Debug-Token header contains PART2
router.get('/internal/', (req, res) => {
  const sessionId = req.headers['x-lab-session'] || req.query.session || req.ip;
  if (!isInstanceRunning(sessionId)) return sendInstanceNotActive(res);
  res.setHeader('X-Debug-Token', PART2_HDR);
  res.setHeader('X-Powered-By', 'CorpX-Engine/2.4');
  res.status(404).json({
    error: 'Not found',
    code:  404,
    path:  '/internal/'
  });
});

// GET /api/lab/hidden/static/portal.js
// JS file with hex-encoded string buried in a comment
router.get('/static/portal.js', (req, res) => {
  const sessionId = req.headers['x-lab-session'] || req.query.session || req.ip;
  if (!isInstanceRunning(sessionId)) return res.status(403).send('// instance not active');
  const js = `// CorpX Internal Portal, v2.4.1
// Last modified: 2024-11-08

(function() {
  'use strict';

  var _cfg = {
    session_timeout: 1800,
    refresh_interval: 30,
    debug: false
  };

  // portal init
  function init() {
    document.querySelectorAll('nav a').forEach(function(a) {
      a.addEventListener('click', function(e) { e.preventDefault(); });
    });
  }

  // internal ref: 0x${PART3_HEX}
  // checksum: e3b0c44298fc1c149afb

  document.addEventListener('DOMContentLoaded', init);
})();
`;
  res.setHeader('Content-Type', 'application/javascript');
  res.send(js);
});

// POST /api/lab/hidden/submit
router.post('/submit', flagLimiter, async (req, res) => {
  const { flag } = req.body;
  const session_id = req.headers['x-lab-session'] || req.query.session || req.ip;
  const ip         = req.ip;

  if (!flag) return res.status(400).json({ error: 'No flag provided' });

  const correct = flag.trim() === FLAG || flag.trim() === FLAG_ALT;
  logAttempt('HIDDEN', ip, flag.trim(), correct ? 'correct' : 'wrong');

  try {
    const db = await getHiddenDb();
    db.prepare(
      'INSERT INTO attempts (session_id, flag_input, result) VALUES (?, ?, ?)'
    ).run(session_id, flag.trim(), correct ? 'correct' : 'wrong');
  } catch (err) {
    console.error('[HIDDEN] DB error:', err.message);
  }

  if (correct) {
    const inst = getOrCreateInstance(session_id);
    inst.solved = true;
    return res.json({
      success: true,
      flag:    FLAG,
      message: 'Correct. Three separate locations, three pieces. This is how real data leaks happen.'
    });
  }

  // Deliberately vague, do not tell them which part is wrong
  res.status(401).json({
    success: false,
    message: 'Incorrect. The flag has three parts spread across the application.'
  });
});

router._instances = instances;

module.exports = router;
