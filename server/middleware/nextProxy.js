// ── NEXT.JS PROXY (frontend migration, docs/MIGRATION.md) ───────
// Jo pages Next.js (web/) mein migrate ho chuke hain, unki requests yahan se
// NEXT_APP_URL pe forward hoti hain. Express hi public entry point rehta hai;
// baaki sab purana SPA (index.html) serve karta hai.
//
// NEXT_APP_URL set nahi hai -> proxy off, sab pages purane SPA se.
// Rollback = Render pe NEXT_APP_URL hata do. (NEXT_BLOG_URL purana naam hai,
// abhi bhi chalta hai.)
const http  = require('http');
const https = require('https');

const TARGET = (process.env.NEXT_APP_URL || process.env.NEXT_BLOG_URL || '').replace(/\/$/, '');

// SPA page id -> URL of every page now served by Next. /js/flags.js sends this
// to the SPA so showPage(id) does a full page load for these.
const NEXT_PAGES = {
  home:         '/',
  blog:         '/blog',
  courses:      '/tutorials',
  privacy:      '/privacy-policy',
  terms:        '/terms-of-service',
  disclaimer:   '/disclaimer',
  refund:       '/refund-policy',
  cookie:       '/cookie-notice',
  donotsell:    '/do-not-sell',
  legalwarning: '/legal-warning',
  leaderboard:  '/leaderboard',
  profile:      '/profile',
  publicProfile: '/u',
  ctf:          '/rooms',
  // Exact paths only: /tools/alexrecon|alexutils|alextrace are still SPA pages.
  tools:        '/tools',
  mistakeAnalyzer: '/tools/mistake-analyzer',
  resources:    '/resources',
  // community: '/community' is ported (web/src/app/community) but stays on the
  // SPA until the owner decides whether the forum stays. To switch it on, add
  // it here and '/community/' to PREFIXES.
};

// Exact paths go to Next; /tutorials/<course> stays in the SPA.
// /search-index.json feeds the nav search on the Next pages.
const EXACT = new Set([...Object.values(NEXT_PAGES), '/search-index.json']);
const PREFIXES = ['/blog/', '/u/', '/_next/'];

function isNextPath(p) {
  const clean = p.length > 1 ? p.replace(/\/+$/, '') : p;
  return EXACT.has(clean) || PREFIXES.some((pre) => p.startsWith(pre));
}

// Only plain browser headers go upstream. Forwarding everything also sent
// Render's own edge headers (render-proxy-ttl, rndr-id, cf-*, x-forwarded-*),
// and Render answered a quick 502 instead of waking the sleeping Next service.
const PASS_HEADERS = [
  'accept', 'accept-encoding', 'accept-language', 'cache-control', 'cookie', 'if-modified-since',
  'if-none-match', 'pragma', 'range', 'referer', 'user-agent',
  'rsc', 'next-router-state-tree', 'next-router-prefetch', 'next-router-segment-prefetch', 'next-url',
];

// Free tier: a sleeping Next service takes ~30-50 s to wake up, and meanwhile
// Render may answer 502/503. GET/HEAD are safe to repeat, so retry until then.
const WAKE_DEADLINE_MS = 55000;
const RETRY_STATUS = new Set([502, 503, 504]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function requestOnce(target, method, headers) {
  const client = target.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const upstream = client.request(target, { method, headers, timeout: 60000 }, resolve);
    upstream.on('timeout', () => upstream.destroy(new Error('upstream timeout')));
    upstream.on('error', reject);
    upstream.end();
  });
}

async function fetchWithWake(target, method, headers) {
  const started = Date.now();
  let delay = 1000;
  for (;;) {
    let up = null;
    let err = null;
    try { up = await requestOnce(target, method, headers); } catch (e) { err = e; }
    if (up && !RETRY_STATUS.has(up.statusCode)) return up;
    if (Date.now() - started + delay > WAKE_DEADLINE_MS) {
      if (up) return up;
      throw err;
    }
    if (up) up.resume(); // drop the error body
    await sleep(delay);
    delay = Math.min(delay * 2, 8000);
  }
}

function nextProxy(req, res, next) {
  if (!TARGET || !isNextPath(req.path)) return next();
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  const target = new URL(TARGET + req.originalUrl);
  const headers = { host: target.host };
  PASS_HEADERS.forEach((h) => { if (req.headers[h] !== undefined) headers[h] = req.headers[h]; });
  headers['x-forwarded-host']  = req.headers.host || '';
  headers['x-forwarded-proto'] = req.protocol;
  headers['x-forwarded-for']   = req.ip;

  fetchWithWake(target, req.method, headers).then((up) => {
    if (RETRY_STATUS.has(up.statusCode)) console.error('[nextProxy]', req.path, 'upstream', up.statusCode);
    // helmet ke security headers (CSP etc.) res pe pehle se set hain; Next ke
    // headers unke upar copy hote hain, lekin CSP hum apna hi rakhte hain.
    Object.entries(up.headers).forEach(([k, v]) => {
      if (k === 'content-security-policy' || k === 'transfer-encoding' || k === 'connection') return;
      res.setHeader(k, v);
    });
    res.status(up.statusCode || 502);
    up.pipe(res);
  }, (err) => {
    console.error('[nextProxy]', req.path, err.message);
    if (!res.headersSent) res.status(502).send('This page is temporarily unavailable. Please try again shortly.');
    else res.end();
  });
}

// Express itself sleeps on the free tier too. When it wakes up, wake the Next
// service right away, so the visitor's first page doesn't wait for both.
function warmUp() {
  if (!TARGET) return;
  fetchWithWake(new URL(TARGET + '/'), 'HEAD', { host: new URL(TARGET).host, 'user-agent': 'alexcyber-warmup' })
    .then((up) => { up.resume(); console.log('[nextProxy] warm-up', up.statusCode); },
      (e) => console.error('[nextProxy] warm-up failed', e.message));
}

nextProxy.enabled = Boolean(TARGET);
nextProxy.pages = TARGET ? NEXT_PAGES : {};
nextProxy.warmUp = warmUp;

module.exports = nextProxy;
