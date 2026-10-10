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
};

// Exact paths go to Next; /tutorials/<course> stays in the SPA.
// /search-index.json feeds the nav search on the Next pages.
const EXACT = new Set([...Object.values(NEXT_PAGES), '/search-index.json']);
const PREFIXES = ['/blog/', '/_next/'];

function isNextPath(p) {
  const clean = p.length > 1 ? p.replace(/\/+$/, '') : p;
  return EXACT.has(clean) || PREFIXES.some((pre) => p.startsWith(pre));
}

function nextProxy(req, res, next) {
  if (!TARGET || !isNextPath(req.path)) return next();
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  const target = new URL(TARGET + req.originalUrl);
  const client = target.protocol === 'https:' ? https : http;

  const headers = { ...req.headers, host: target.host };
  headers['x-forwarded-host']  = req.headers.host || '';
  headers['x-forwarded-proto'] = req.protocol;
  headers['x-forwarded-for']   = req.ip;

  // Free tier: a sleeping Next service can take ~30-50 s to wake up.
  const upstream = client.request(target, { method: req.method, headers, timeout: 60000 }, (up) => {
    // helmet ke security headers (CSP etc.) res pe pehle se set hain; Next ke
    // headers unke upar copy hote hain, lekin CSP hum apna hi rakhte hain.
    Object.entries(up.headers).forEach(([k, v]) => {
      if (k === 'content-security-policy' || k === 'transfer-encoding' || k === 'connection') return;
      res.setHeader(k, v);
    });
    res.status(up.statusCode || 502);
    up.pipe(res);
  });

  upstream.on('timeout', () => upstream.destroy(new Error('upstream timeout')));
  upstream.on('error', (err) => {
    console.error('[nextProxy]', err.message);
    if (!res.headersSent) res.status(502).send('This page is temporarily unavailable. Please try again shortly.');
    else res.end();
  });
  upstream.end();
}

nextProxy.enabled = Boolean(TARGET);
nextProxy.pages = TARGET ? NEXT_PAGES : {};

module.exports = nextProxy;
