// ── web-01 "Before Go-Live" (secrets in client-side code) ───────
// Lumio, a fictional laptop and desktop maker, runs an old-style online
// store. The developers shipped it without the final cleanup: an HTML comment
// points to js/store.js, which still holds a staging API key and the path of
// an internal pre-order API for an unreleased laptop. Calling that API with
// the key returns the launch code, which is the flag. OWASP A02:2025 Security
// Misconfiguration, CWE-615 (sensitive information in source comments) and
// CWE-200 (exposure of sensitive information).
//
// The staging key is random per lab instance, so a copied writeup does not
// work; the API finds the instance by its key, so the student does not have
// to carry ?session= over. Product images are our own 3D renders (no real
// brand). All data is made up. No flag is ever logged.
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { flagFor } = require('../flags');
const { flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt } = require('../../middleware/logger');

const router = express.Router();
const FLAG = flagFor('web-01');
const INSTANCE_DURATION_SEC = 30 * 60;
const instances = {};

const CSS = fs.readFileSync(path.join(__dirname, 'store.css'), 'utf8');
const IMAGES = {};
for (const n of ['hero', 'laptop', 'one', 'mini', 'keys']) IMAGES[n] = fs.readFileSync(path.join(__dirname, 'img', n + '.png'));

function sid(req) { return req.headers['x-lab-session'] || req.query.session || req.ip; }
const newKey = () => 'lmo_stg_' + crypto.randomBytes(6).toString('hex');
function newInst() { return { startedAt: Date.now(), key: newKey(), solved: false }; }
function getOrCreate(s) { if (!instances[s]) instances[s] = newInst(); return instances[s]; }
function resetInst(s) { instances[s] = newInst(); return instances[s]; }
const alive = (inst) => !!inst && (INSTANCE_DURATION_SEC - Math.floor((Date.now() - inst.startedAt) / 1000)) > 0;
function instStatus(s) {
  const inst = getOrCreate(s);
  const remaining = Math.max(0, INSTANCE_DURATION_SEC - Math.floor((Date.now() - inst.startedAt) / 1000));
  return { running: remaining > 0, remaining_sec: remaining, solved: inst.solved };
}
function isRunning(s) { return alive(instances[s]); }
function byKey(key) {
  if (typeof key !== 'string' || !/^lmo_stg_[0-9a-f]{12}$/.test(key)) return null;
  for (const inst of Object.values(instances)) if (inst.key === key && alive(inst)) return inst;
  return null;
}

function notActive(res) {
  res.status(403).type('html').send(`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Instance not active</title></head><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;font:14px/1.6 Verdana,Arial,sans-serif;background:#e9ecef;color:#333"><div style="max-width:420px;padding:24px"><h1 style="font-size:20px">Instance not active</h1><p>This lab is not running. Go back to the challenge and press Start (or Restart Instance) to begin a fresh session.</p></div></body></html>`);
}

// ── The store ──
function storePage(s) {
  const q = encodeURIComponent(s);
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<title>Lumio Store: Lumio Book Air, Lumio One and more</title>
<!-- Lumio Store v2.4.1, build 0812 -->
<!-- TODO before go-live: take the staging config out of js/store.js (Karan) -->
<link rel="stylesheet" type="text/css" href="css/store.css?session=${q}" />
<script type="text/javascript" src="js/store.js?session=${q}"></script>
</head>
<body>
<div id="wrap">
 <div id="top">
  <div class="logo"><i></i>Lumio</div>
  <ul id="nav"><li><a class="on" href="#">Store</a></li><li><a href="#">Lumio Book</a></li><li><a href="#">Lumio One</a></li><li><a href="#">Lumio Mini</a></li><li><a href="#">Accessories</a></li><li><a href="#">Support</a></li></ul>
  <div class="search"><input type="text" value="Search Store" aria-label="Search Store" /><span class="cart">Cart (<b id="cartCount">0</b>)</span></div>
 </div>
 <div id="hero">
  <img class="heroimg" src="img/hero.png" alt="Lumio Book Air" width="380" />
  <div><h1>The new Lumio Book Air.<br />Thinner than ever.</h1><p>14-inch display. All-day battery. Starting at &#8377;89,900.</p><a class="aqua buy" data-sku="LBA-14" href="#">Buy now</a> &nbsp; <a href="#" style="color:#9cc6ff">Watch the film &rsaquo;</a></div>
 </div>
 <div id="grid">
  <div class="prod"><div class="pic"><img src="img/laptop.png" alt="Lumio Book Air" /></div><h3>Lumio Book Air</h3><div class="from">From &#8377;89,900</div><a class="aqua buy" data-sku="LBA-14" href="#">Buy now</a></div>
  <div class="prod"><div class="pic"><img src="img/one.png" alt="Lumio One" /></div><h3>Lumio One 24"</h3><div class="from">From &#8377;1,24,900</div><a class="aqua buy" data-sku="LO-24" href="#">Buy now</a></div>
  <div class="prod"><div class="pic"><img src="img/mini.png" alt="Lumio Mini" /></div><h3>Lumio Mini</h3><div class="from">From &#8377;59,900</div><a class="aqua buy" data-sku="LM-1" href="#">Buy now</a></div>
  <div class="prod"><div class="pic"><img src="img/keys.png" alt="Lumio Keys" /></div><h3>Lumio Keys</h3><div class="from">From &#8377;7,900</div><a class="aqua buy" data-sku="LK-1" href="#">Buy now</a></div>
 </div>
 <div id="news"><b>Hot News:</b><span>Free engraving on every Lumio Book.</span><span>Student offer: save &#8377;10,000 with a valid college ID.</span><span>Something big is coming on 20 November.</span></div>
 <div id="foot"><span>Copyright &copy; 2026 Lumio Inc. A fictional store built for AlexCyberX Labs. All rights reserved.</span><span><a href="#">Site Map</a> | <a href="#">Hot News</a> | <a href="#">Contact Us</a> | <a href="#">Privacy Policy</a></span></div>
</div>
</body>
</html>`;
}

function storeJs(inst) {
  return `/* Lumio Online Store, store.js
   v2.4.1 (build 0812), (c) 2008 Lumio Inc. */

var Lumio = Lumio || {};

Lumio.config = {
  apiBase: './api/v1',
  currency: 'INR',
  analyticsId: 'LMO-UA-482913',
  /* STAGING ONLY, remove before go-live (Karan) */
  stagingKey: '${inst.key}'
};

/* Pre-order data for the new Lumio Book Pro is not public yet.
   QA can test it at (same folder as the store page):
   ./api/v1/preorder/book-pro?key=<stagingKey> */

Lumio.cart = {
  items: [],
  add: function (sku) {
    this.items.push(sku);
    document.getElementById('cartCount').innerHTML = this.items.length;
  }
};

window.onload = function () {
  var links = document.getElementsByTagName('a');
  for (var i = 0; i < links.length; i++) {
    if (links[i].getAttribute('href') === '#') links[i].onclick = function () { return false; };
  }
  var btns = document.getElementsByClassName('buy');
  for (var j = 0; j < btns.length; j++) {
    btns[j].onclick = function () { Lumio.cart.add(this.getAttribute('data-sku')); return false; };
  }
};
`;
}

const PUBLIC_PRODUCTS = [
  { sku: 'LBA-14', name: 'Lumio Book Air', price_inr: 89900, in_stock: true },
  { sku: 'LO-24', name: 'Lumio One 24"', price_inr: 124900, in_stock: true },
  { sku: 'LM-1', name: 'Lumio Mini', price_inr: 59900, in_stock: true },
  { sku: 'LK-1', name: 'Lumio Keys', price_inr: 7900, in_stock: false },
];

// ── Instance endpoints ──
router.get('/instance/status', (req, res) => res.json(instStatus(sid(req))));
router.post('/instance/restart', (req, res) => { resetInst(sid(req)); logAttempt('GOLIVE', req.ip, 'instance_restart', 'ok'); res.json({ success: true, ...instStatus(sid(req)) }); });
router.post('/instance/stop', (req, res) => { const s = sid(req); if (instances[s]) instances[s].startedAt = Date.now() - (INSTANCE_DURATION_SEC + 1) * 1000; res.json({ success: true, running: false, remaining_sec: 0 }); });

// ── Store files ──
router.get('/page', (req, res) => {
  const s = sid(req);
  if (!isRunning(s)) return notActive(res);
  res.set('Cache-Control', 'no-store').type('html').send(storePage(s));
});
router.get('/js/store.js', (req, res) => {
  const s = sid(req);
  if (!isRunning(s)) return res.status(403).type('application/javascript').send('/* This lab is not running. Press Start on the CTF page. */\n');
  res.set({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }).type('application/javascript').send(storeJs(instances[s]));
});
router.get('/css/store.css', (req, res) => res.set('Cache-Control', 'public, max-age=3600').type('text/css').send(CSS));
router.get('/img/:name.png', (req, res, next) => {
  const img = Object.prototype.hasOwnProperty.call(IMAGES, req.params.name) ? IMAGES[req.params.name] : null;
  if (!img) return next();
  res.set('Cache-Control', 'public, max-age=86400').type('image/png').send(img);
});

// ── The store's API ──
router.get('/api/v1/products', (req, res) => res.json({ products: PUBLIC_PRODUCTS }));
router.get('/api/v1/preorder/book-pro', (req, res) => {
  const key = req.get('x-api-key') || req.query.key;
  if (!key) return res.status(401).json({ error: 'missing_api_key', message: 'Send your API key as ?key= or in the X-Api-Key header.' });
  const inst = byKey(String(key).trim());
  if (!inst) {
    logAttempt('GOLIVE', req.ip, 'preorder:bad_key', 'wrong');
    return res.status(403).json({ error: 'invalid_api_key', message: 'This key is not valid for the pre-order API.' });
  }
  inst.solved = true;
  logAttempt('GOLIVE', req.ip, 'preorder:ok', 'correct');
  res.set('Cache-Control', 'no-store').json({
    product: 'Lumio Book Pro 16',
    status: 'embargoed',
    launch_date: '2026-11-20',
    price_inr: 189900,
    preorder_open: false,
    internal_note: 'Do not share. Launch code for the press kit: ' + FLAG,
  });
});

// ── Flag submit (the CTF page posts to the MAIN server; this is a fallback) ──
router.post('/submit', flagLimiter, (req, res) => {
  const { flag } = req.body || {};
  const s = sid(req);
  if (typeof flag !== 'string' || !flag.trim()) return res.status(400).json({ error: 'No flag provided' });
  const correct = flag.trim() === FLAG;
  logAttempt('GOLIVE', req.ip, 'submit', correct ? 'correct' : 'wrong'); // never log a flag
  if (correct) { getOrCreate(s).solved = true; return res.json({ success: true, flag: FLAG, message: 'Anything you send to the browser is public. Keep keys and internal API paths on the server.' }); }
  res.status(401).json({ success: false, message: 'Incorrect flag.' });
});

router._instances = instances;
module.exports = router;
