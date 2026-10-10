// ── NEXT.JS BLOG PROXY (migration step 1) ───────────────────────
// /blog aur /blog/* ab web/ wale Next.js app se aate hain. Express hi public
// entry point rehta hai; ye middleware un requests ko NEXT_BLOG_URL pe forward
// karta hai (Next ka basePath '/blog' hai, isliye path waisa hi bhejte hain).
//
// NEXT_BLOG_URL set nahi hai -> proxy off, purana SPA blog (index.html) chalega.
// Rollback = Render pe NEXT_BLOG_URL hata do.
const http  = require('http');
const https = require('https');

const TARGET = (process.env.NEXT_BLOG_URL || '').replace(/\/$/, '');

function isBlogPath(p) {
  return p === '/blog' || p.startsWith('/blog/');
}

function nextBlogProxy(req, res, next) {
  if (!TARGET || !isBlogPath(req.path)) return next();
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  const target = new URL(TARGET + req.originalUrl);
  const client = target.protocol === 'https:' ? https : http;

  const headers = { ...req.headers, host: target.host };
  headers['x-forwarded-host']  = req.headers.host || '';
  headers['x-forwarded-proto'] = req.protocol;
  headers['x-forwarded-for']   = req.ip;

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
    console.error('[nextBlogProxy]', err.message);
    if (!res.headersSent) res.status(502).send('Blog is temporarily unavailable. Please try again shortly.');
    else res.end();
  });
  upstream.end();
}

nextBlogProxy.enabled = Boolean(TARGET);

module.exports = nextBlogProxy;
