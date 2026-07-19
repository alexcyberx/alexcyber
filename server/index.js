const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const path     = require('path');

const app = express();

// Render reverse proxy ke peeche hai, trust proxy on karo taaki req.ip
// asli client IP de, na ki proxy ka internal IP (jo har request pe
// inconsistent ho sakta hai aur instance session fallback ko todta hai)
app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Lab-Session']
}));

// AlexSync's Cashfree webhook needs the raw request body to verify the
// HMAC signature, capture it here before JSON parsing discards it.
// This doesn't affect any other route; req.rawBody is just an extra
// property alongside the normally-parsed req.body.
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf.toString('utf8'); }
}));
app.use(express.urlencoded({ extended: true }));
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

// Serve entire frontend project as static
// index.html, pages/, css/, js/, diagrams/, sab accessible
app.use(express.static(path.join(__dirname, '..')));

// Lab API routes
app.use('/api/lab/web01', require('./labs/web01-sqli/routes'));
app.use('/api/lab/web02', require('./labs/web02-xss/routes'));
app.use('/api/lab/hidden', require('./labs/hidden-sight/routes'));
app.use('/api/lab/cookie', require('./labs/web02-cookie/routes'));
app.use('/api/lab/sqli101', require('./labs/web03-sqli101/routes'));
app.use('/api/lab/robots', require('./labs/web04-robots/routes'));
app.use('/api/lab/packet', require('./labs/for01-packet/routes'));
app.use('/api/lab/metadata', require('./labs/for02-metadata/routes'));
app.use('/api/lab/loghunter', require('./labs/for03-loghunter/routes'));
app.use('/api/lab/caesar', require('./labs/cry01-caesar/routes'));
app.use('/api/lab/base64', require('./labs/cry02-base64/routes'));

// AlexSync payment routes (Cashfree order creation + webhook)
app.use('/api/alexsync', require('./payments/alexsync/routes'));
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
  '/privacy-policy', '/terms-of-service', '/disclaimer',
  '/refund-policy', '/cookie-notice', '/do-not-sell', '/legal-warning'
], (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// 404
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
});

// ── INSTANCE MEMORY CLEANUP ─────────────────────────────────────
// FIX: Sab instance-based labs mein instances{} object kabhi clean
// nahi hota tha, expired sessions memory mein accumulate karte rahe.
// web03-sqli101 mein sql.js Database objects bhi hain jo aur bhi
// expensive hain. Har 10 minute mein expired instances clean karo
// sab labs se.
//
// Har lab ka apna TTL hai (5 min buffer after that lab's own
// INSTANCE_DURATION_SEC, jo difficulty ke hisaab se alag hai -
// Easy 15min, Medium 30min, Hard 45min) - ek single global TTL nahi,
// warna Easy labs ka instance expire hone ke baad bhi der tak memory
// mein reh jaata (waste, though not a bug), aur for-03 (45min) global
// 35min TTL se pehle hi galat tarike se clean ho jaata.
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

function cleanExpiredInstances(labName, instancesObj, ttlSec, hasSqlDb = false) {
  const now = Date.now();
  let cleaned = 0;
  for (const [key, inst] of Object.entries(instancesObj)) {
    const ageSec = Math.floor((now - (inst.startedAt || 0)) / 1000);
    if (ageSec > ttlSec) {
      if (hasSqlDb && inst.db) {
        try { inst.db.close(); } catch(e) {}
      }
      delete instancesObj[key];
      cleaned++;
    }
  }
  if (cleaned > 0) console.log(`[Cleanup] ${labName}: removed ${cleaned} expired instances`);
}

setInterval(() => {
  try {
    // Each lab router exports _instances so we can clean expired ones.
    // require() returns cached module, same object as used in routes.
    // ttlSec = that lab's own INSTANCE_DURATION_SEC + 5 min buffer.
    const labConfigs = [
      { name: 'hidden',    path: './labs/hidden-sight/routes',    sql: false, ttlSec: 20 * 60 }, // Easy 15min + 5min buffer
      { name: 'cookie',    path: './labs/web02-cookie/routes',    sql: false, ttlSec: 35 * 60 }, // Medium 30min + 5min buffer
      { name: 'sqli101',   path: './labs/web03-sqli101/routes',   sql: true,  ttlSec: 35 * 60 }, // Medium 30min + 5min buffer
      { name: 'robots',    path: './labs/web04-robots/routes',    sql: false, ttlSec: 20 * 60 }, // Easy 15min + 5min buffer
      { name: 'packet',    path: './labs/for01-packet/routes',    sql: false, ttlSec: 35 * 60 }, // Medium 30min + 5min buffer
      { name: 'metadata',  path: './labs/for02-metadata/routes',  sql: false, ttlSec: 20 * 60 }, // Easy 15min + 5min buffer
      { name: 'loghunter', path: './labs/for03-loghunter/routes', sql: false, ttlSec: 50 * 60 }, // Hard 45min + 5min buffer
    ];
    labConfigs.forEach(({ name, path: p, sql, ttlSec }) => {
      try {
        const mod = require(p);
        const instances = mod._instances;
        if (instances && typeof instances === 'object') {
          cleanExpiredInstances(name, instances, ttlSec, sql);
        }
      } catch(e) {}
    });
  } catch(e) {
    console.error('[Cleanup] Error:', e.message);
  }
}, CLEANUP_INTERVAL_MS);

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
