const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const cookieParser = require('cookie-parser');
const path     = require('path');

const app = express();

// Render reverse proxy ke peeche hai, trust proxy on karo taaki req.ip
// asli client IP de, na ki proxy ka internal IP (jo har request pe
// inconsistent ho sakta hai aur instance session fallback ko todta hai)
app.set('trust proxy', 1);

// CSP + Permissions-Policy used to be set only via Netlify's netlify.toml.
// Since this app isn't deploying to Netlify, they're set here instead so
// nothing is lost.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://*.googleapis.com"],
      // helmet adds script-src-attr 'none' by default, which blocks every inline
      // onclick="..." attribute. This site's buttons and navbar all use inline
      // handlers, so they must be allowed (same trust level as script-src above).
      scriptSrcAttr: ["'unsafe-inline'"],
      connectSrc: ["'self'", "https://*.supabase.co", "wss://*.supabase.co", "https://cdn.jsdelivr.net", "https://*.googleapis.com", "https://translate.googleapis.com", "https://api.mymemory.translated.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      frameAncestors: ["'self'"],
    },
  },
}));
// helmet 7.x doesn't set Permissions-Policy by default; netlify.toml did.
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()');
  next();
});

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Lab-Session', 'Authorization']
}));

// The Supabase Auth email hook (server/routes/authEmailHook.js) needs the
// raw request body to verify its webhook signature, so capture it here
// before JSON parsing discards it. req.rawBody is just an extra property
// alongside the normally-parsed req.body.
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf.toString('utf8'); }
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// ── ATTACK DETECTION & IP BLOCKING ──────────────────────────────
// blockGate: runs first on every request, rejects requests from any
// IP already in blocked_ips (this also enforces the admin panel's
// block/unblock feature, which previously updated the table but
// nothing read it back to actually deny requests).
const { blockGate, attackDetector } = require('./middleware/attackDetection');
app.use(blockGate);
app.use(attackDetector);

// ── ADMIN PANEL PROTECTION ──────────────────────────────────────
// Admin panel ab ek secret, unguessable URL pe hai (panel-<hex>.html).
// Purane/guessable paths (admin.html, admin, admin-panel, etc.) explicitly
// block karo taaki koi accidentally cached link ya scanner unhe hit na kar
// paye, static middleware unhe serve karne se pehle hi yahan 404 de do.
const BLOCKED_ADMIN_PATHS = [
  '/admin.html', '/admin', '/admin/', '/administrator', '/administrator.html',
  '/admin-panel', '/admin-panel.html', '/panel.html', '/dashboard.html'
];
app.use((req, res, next) => {
  const p = req.path.toLowerCase();
  if (BLOCKED_ADMIN_PATHS.includes(p)) {
    return res.status(404).json({ error: 'Not found' });
  }
  next();
});

// SECURITY FIX: pehle yahan express.static(path.join(__dirname, '..')) tha,
// jo poora project root serve karta tha, matlab /server/**, /data/hidden.db,
// /package.json, /windows-app/** sab publicly download ho sakte the (labs ke
// routes.js mein tab default flags bhi the). Ab sirf frontend ke public folders
// aur chand root files whitelist hain. Naya public folder add karna ho to
// PUBLIC_DIRS mein naam jodo.
const ROOT = path.join(__dirname, '..');

// Frontend migration (docs/MIGRATION.md): migrated pages Next.js app se aate
// hain (NEXT_APP_URL set ho tab). /js/flags.js SPA ko batata hai kaun se pages
// ab Next pe hain, taaki unke links full page load karein. Static /js se pehle.
// NEXT_EMBEDDED=1: Next isi service mein child process ki tarah chalta hai
// (server/nextEmbedded.js), proxy usi ko point karta hai.
require('./nextEmbedded').start();

// Removed legal pages (2026-10): old links go to their replacement.
const MOVED = { '/refund-policy': '/privacy-policy', '/do-not-sell': '/privacy-policy', '/legal-warning': '/report-a-bug' };
app.get(Object.keys(MOVED), (req, res) => res.redirect(301, MOVED[req.path.replace(/\/+$/, '')] || '/'));

// RFC 9116: where security researchers report problems.
app.get('/.well-known/security.txt', (req, res) => {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || process.env.RENDER_EXTERNAL_URL || ('https://' + req.get('host'))).replace(/\/$/, '');
  const expires = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
  res.type('text/plain').send(
    `Contact: ${site}/report-a-bug\nExpires: ${expires}\nPolicy: ${site}/report-a-bug\nPreferred-Languages: en, hi\nCanonical: ${site}/.well-known/security.txt\n`);
});
// CTF labs on their own origin (docs/LABS.md): with LAB_ORIGIN set, this
// server runs no lab code; old links to a lab here go to the labs server.
const { LABS, mountLabs, startLabCleanup } = require('./labs/mount');
const LAB_ORIGIN = require('./labs/origin').labOrigin();
if (LAB_ORIGIN) {
  const names = LABS.map((l) => l.name.replace(/[^a-z0-9-]/g, '')).join('|');
  const LAB_PATH = new RegExp('^/(api/lab/(' + names + ')(/|$)|pages/labs(/|$))');
  app.use((req, res, next) => {
    if (!LAB_PATH.test(req.path)) return next();
    if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(410).json({ error: 'The labs moved to their own address.', labOrigin: LAB_ORIGIN });
    res.redirect(302, LAB_ORIGIN + req.originalUrl);
  });
}

const nextProxy = require('./middleware/nextProxy');
app.get('/js/flags.js', (req, res) => {
  res.type('application/javascript').set('Cache-Control', 'no-cache');
  res.send('window.ACX_NEXT_PAGES = ' + JSON.stringify(nextProxy.pages) + ';\n');
});
app.use(nextProxy);

const PUBLIC_DIRS = ['css', 'js', 'pages', 'components', 'diagrams', 'quiz', 'brand'];
PUBLIC_DIRS.forEach((dir) => {
  app.use('/' + dir, express.static(path.join(ROOT, dir), { dotfiles: 'deny' }));
});

// Root ki public files (index.html '/' route se serve hoti hai, neeche)
['robots.txt', 'sitemap.xml'].forEach((f) => {
  app.get('/' + f, (req, res) => res.sendFile(path.join(ROOT, f)));
});
// Site icons (brand/): browsers ask for these at the root.
['favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'site.webmanifest'].forEach((f) => {
  app.get('/' + f, (req, res) => res.set('Cache-Control', 'public, max-age=86400').sendFile(path.join(ROOT, 'brand', f)));
});

// Admin panel secret URL pe hai. The panel is the Next app at
// /panel-1b47c1ab561e; old bookmarks of the removed .html page go there.
app.get('/panel-1b47c1ab561e.html', (req, res) => {
  res.set('X-Robots-Tag', 'noindex, nofollow'); // never in search results
  res.redirect(302, '/panel-1b47c1ab561e');
});

// Lab API routes. Session id format + instance rate limit for every /api/lab
// route (server/middleware/labSession.js). The labs themselves: here only
// without LAB_ORIGIN (local dev, tests, rollback), else on the labs server.
app.use('/api/lab', require('./middleware/labSession').labSessionGuard);
if (!LAB_ORIGIN) {
  // Lab-flow challenges: the old in-lab /submit also records the solve + XP.
  const { recordLabSolve } = require('./labs/recordSolve');
  mountLabs(app, { wrap: (l) => (l.flow ? recordLabSolve(l.slug) : null) });
  startLabCleanup();
}
// Flag submit of the lab-flow rooms (CTF page): checked and recorded here, in both setups.
app.use('/api/lab/flag', require('./routes/labFlag'));
app.use('/api/lab/hint', require('./ai/hints'));
app.use('/api/lab/search', require('./ai/search'));
app.use('/api/lab/admin-search', require('./ai/adminSearch'));

app.use('/api/me', require('./routes/me'));
// Admin actions that need the service role (invite, delete account); admin + aal2 checked per request.
app.use('/api/admin', require('./routes/admin'));
app.use('/api/tools', require('./tools/mistake-analyzer/routes'));
app.use('/api/alexrecon', require('./tools/alexrecon/routes'));
app.use('/api/alexutils', require('./tools/alexutils/routes'));
app.use('/api/alextrace', require('./tools/alextrace/routes'));

// Supabase "Send Email" Auth Hook -> Resend (premium-designed auth emails)
// Configure the hook URL + secret in Supabase Dashboard > Authentication > Hooks.
app.use('/auth', require('./routes/authEmailHook'));

/* ── CTF Disabled Challenges API ──
   GET-only, read side of the CTF enable/disable toggle. Every visitor's
   index.html calls this on load to know which challenge slugs to hide.

   FIX: this used to also expose POST /api/ctf/disabled with no auth at
   all, so any visitor could hide/unhide challenges for every other
   visitor. It was also dead weight even before that: the admin panel's
   actual CTF enable/disable control (admToggleCTF / renderCTF in
   panel-*.html) writes through Supabase (tool_settings-style pattern,
   RLS-gated to admins), not this route, so nothing legitimate ever
   called the POST handler. Removed the write side entirely rather than
   bolt on a one-off auth scheme that doesn't match the rest of the app's
   Supabase-RLS-based admin model.

   In-memory store, resets on redeploy - the Supabase side is the
   persistent source of truth, this is just what index.html reads.
*/
let _ctfDisabledSlugs = [];

app.get('/api/ctf/disabled', (req, res) => {
  res.json({ disabled: _ctfDisabledSlugs });
});


// Root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// SPA catch-all: sab clean URLs index.html pe serve hongi
// (Lab pages /pages/labs/ ke under hain - static middleware unhe serve karega pehle)
app.get([
  '/rooms', '/rooms/*',
  '/tutorials', '/tutorials/*',
  '/tools', '/tools/*', '/profile',
  '/blog', '/blog/*',
  '/resources',
  '/community', '/community/*',
  '/leaderboard', '/u', '/u/*',
  '/privacy-policy', '/terms-of-service', '/disclaimer',
  '/cookie-notice', '/report-a-bug'
], (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// 404 (pages: Next's themed not-found page; everything else: JSON)
app.use(nextProxy.notFoundPage);
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AlexCyberX CTF running on http://localhost:${PORT}`);
  nextProxy.warmUp();
  // CTF page flag check (submit_ctf_flag) compares against these hashes.
  require('./labs/flags').syncFlagHashes(require('./middleware/toolAccess').getSupabaseAdmin())
    .catch((e) => console.error('[flags] sync failed', e.message));
  if (LAB_ORIGIN) require('./labs/origin').checkLabServer(LAB_ORIGIN);
});

// ── PROCESS STABILITY ───────────────────────────────────────────
// FIX: Unhandled promise rejections crash the server silently in older Node versions
// or cause warnings in newer ones. Log them properly.
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught exception:', err.message);
  // Don't exit, keep server running for CTF availability
});
