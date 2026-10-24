// ── ALEXCYBERX LABS SERVER ──────────────────────────────────────
// The CTF labs on their own origin (docs/LABS.md). A bug in a lab (they are
// vulnerable on purpose) cannot reach the main site's login: the student's
// session lives in the main site's storage, which this origin cannot read.
//
// This server has no database keys and never sees a login token. It needs:
//   FLAG_SECRET  same value as the main server (labs show flags made from it)
//   SITE_URL     the main site, for links back (e.g. https://alexcyber.onrender.com)
//   AI_API_KEY   only for the AI room (ai-01)
// Start: node server/labs-server.js (Render: its own web service).
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { mountLabs, startLabCleanup } = require('./labs/mount');
const flags = require('./labs/flags');

const SITE = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

if (flags.SECRET_SOURCE !== 'FLAG_SECRET') {
  console.error('[labs] FLAG_SECRET is not set: the flags shown here will not match the main site.');
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // The lab pages are single HTML documents with inline scripts and handlers.
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
}));
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/robots.txt', (req, res) => res.type('text/plain').send('User-agent: *\nDisallow: /\n'));
// The main server compares this with its own to catch a different FLAG_SECRET.
app.get('/healthz', (req, res) => res.set('Cache-Control', 'no-store').json({ ok: true, fp: flags.secretFingerprint(), secret: flags.SECRET_SOURCE }));
// Lab pages link back to the CTF page.
app.get('/rooms', (req, res) => {
  const open = typeof req.query.open === 'string' && /^[a-z0-9-]{1,20}$/.test(req.query.open) ? '?open=' + req.query.open : '';
  res.redirect(302, SITE + '/rooms' + open);
});
app.get('/', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AlexCyberX Labs</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0d;color:#e4e4ef;font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:24px}
.b{max-width:440px}h1{font-size:20px;margin:0 0 10px}p{font-size:14px;color:#9a9aa5;line-height:1.6;margin:0 0 18px}
a{display:inline-block;background:#10b981;color:#04130d;font-weight:600;text-decoration:none;padding:10px 18px;border-radius:8px}</style></head>
<body><div class="b"><h1>AlexCyberX Labs</h1><p>This is where the CTF labs run. Open a room on the CTF page and press Start: your lab opens here in a new tab.</p>
<a href="${SITE}/rooms">Go to the CTF rooms</a></div></body></html>`);
});

mountLabs(app);
startLabCleanup();

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

process.on('unhandledRejection', (reason) => console.error('[labs] Unhandled rejection:', reason));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`AlexCyberX labs on http://localhost:${PORT} (site ${SITE})`));
