/* ═══════════════════════════════════════════════════════════
   ATTACK DETECTION & LEGAL-EVIDENCE LOGGING MIDDLEWARE
   ═══════════════════════════════════════════════════════════
   Purpose: capture tamper-evident evidence (IP, timestamp, payload,
   user-agent, path) of real attack attempts against the live site
   (SQLi/XSS on actual forms, path traversal, bot/scanner probing),
   so an admin can hand it to police/cyber-crime cell for an FIR if
   needed. This is NOT for CTF labs - those routes are excluded on
   purpose because SQLi/XSS payloads are the expected, legitimate
   activity there (see EXCLUDED_PREFIXES below).

   Two responsibilities:
     1. blockGate       - runs first on every request, rejects
                           requests from IPs already in blocked_ips
                           (this also fixes a pre-existing gap: the
                           admin panel's block/unblock IP feature
                           updated the table but nothing ever read
                           it back to actually enforce a block).
     2. attackDetector   - runs on real-site routes only, scans for
                           suspicious patterns, logs evidence, and
                           auto-blocks an IP after repeated hits.

   Fails open: if Supabase isn't configured or a lookup errors, we
   never block a legitimate user because of an infra hiccup.
═══════════════════════════════════════════════════════════ */

const { createClient } = require('@supabase/supabase-js');

let supabaseAdmin = null;
function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return null;
    }
    supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return supabaseAdmin;
}

// Routes where SQLi/XSS/etc. payloads are the legitimate, expected
// activity (CTF labs) - never scan or block based on these paths.
const EXCLUDED_PREFIXES = [
  '/api/lab/',
  '/pages/labs/',
];

function isExcludedPath(p) {
  return EXCLUDED_PREFIXES.some(prefix => p.startsWith(prefix));
}

/* ── Pattern signatures ─────────────────────────────────── */
const SQLI_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
  /\bunion\b.{0,40}\bselect\b/i,
  /\bselect\b.{0,40}\bfrom\b/i,
  /\bdrop\b\s+\btable\b/i,
  /\binsert\b\s+\binto\b/i,
  /\b(or|and)\b\s+[\'"]?\d+[\'"]?\s*=\s*[\'"]?\d+/i,
  /\bxp_cmdshell\b/i,
  /\bsleep\s*\(/i,
  /\bwaitfor\b\s+\bdelay\b/i,
];

const XSS_PATTERNS = [
  /<script[\s\S]*?>/i,
  /on\w+\s*=\s*["']?[^"'>]+/i,
  /<img[^>]+on\w+/i,
  /<svg[\s\S]*?on\w+/i,
  /javascript\s*:/i,
  /<iframe[\s\S]*?>/i,
  /document\.(cookie|location)/i,
];

const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//,
  /\.\.\\/,
  /\/etc\/passwd/i,
  /\/etc\/shadow/i,
  /boot\.ini/i,
  /win\.ini/i,
];

const BOT_UA_PATTERNS = [
  /sqlmap/i, /nikto/i, /nmap/i, /nessus/i, /acunetix/i, /w3af/i,
  /masscan/i, /zgrab/i, /gobuster/i, /dirbuster/i, /wpscan/i,
  /havij/i, /metasploit/i,
];

function matchPattern(str, patterns) {
  if (!str) return null;
  for (const p of patterns) {
    if (p.test(str)) return p.toString();
  }
  return null;
}

// Scans query, body, and params for a request, returns
// { eventType, matchedPattern, matchedIn } or null.
function scanRequest(req) {
  const candidates = [];
  if (req.query) {
    for (const [k, v] of Object.entries(req.query)) {
      if (typeof v === 'string') candidates.push({ field: `query.${k}`, value: v });
    }
  }
  if (req.body && typeof req.body === 'object') {
    for (const [k, v] of Object.entries(req.body)) {
      if (typeof v === 'string') candidates.push({ field: `body.${k}`, value: v });
    }
  }
  if (req.params) {
    for (const [k, v] of Object.entries(req.params)) {
      if (typeof v === 'string') candidates.push({ field: `params.${k}`, value: v });
    }
  }
  // Also scan the raw path itself (covers path-traversal in the URL).
  candidates.push({ field: 'path', value: req.path });

  for (const { field, value } of candidates) {
    let m = matchPattern(value, SQLI_PATTERNS);
    if (m) return { eventType: 'sqli_attempt', matchedPattern: m, matchedIn: field, matchedValue: value };

    m = matchPattern(value, XSS_PATTERNS);
    if (m) return { eventType: 'xss_attempt', matchedPattern: m, matchedIn: field, matchedValue: value };

    m = matchPattern(value, PATH_TRAVERSAL_PATTERNS);
    if (m) return { eventType: 'path_traversal', matchedPattern: m, matchedIn: field, matchedValue: value };
  }

  const ua = req.get('User-Agent') || '';
  const uaMatch = matchPattern(ua, BOT_UA_PATTERNS);
  if (uaMatch) return { eventType: 'bot_scan', matchedPattern: uaMatch, matchedIn: 'user-agent', matchedValue: ua };

  return null;
}

/* ── In-memory offender tracking (per-IP) ───────────────────
   Resets on redeploy, which is fine: the Supabase security_logs
   table is the permanent evidence record, this is just the
   short-window counter that decides when to auto-block. ────── */
const OFFENSE_WINDOW_MS  = 10 * 60 * 1000; // 10 minutes
const OFFENSE_THRESHOLD  = 5;              // 5 suspicious requests
const offenseLog = new Map(); // ip -> [timestamps]

function recordOffense(ip) {
  const now = Date.now();
  const arr = (offenseLog.get(ip) || []).filter(t => now - t < OFFENSE_WINDOW_MS);
  arr.push(now);
  offenseLog.set(ip, arr);
  return arr.length;
}

// Periodic cleanup so the map doesn't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [ip, arr] of offenseLog.entries()) {
    const fresh = arr.filter(t => now - t < OFFENSE_WINDOW_MS);
    if (fresh.length === 0) offenseLog.delete(ip);
    else offenseLog.set(ip, fresh);
  }
}, 5 * 60 * 1000);

/* ── Evidence logging ───────────────────────────────────── */
function logSecurityEvent(eventType, ip, details) {
  const db = getSupabaseAdmin();
  if (!db) return;
  db.from('security_logs')
    .insert({ event_type: eventType, ip: ip || 'unknown', details, created_at: new Date().toISOString() })
    .then(({ error }) => {
      if (error) console.error('[AttackDetection] log insert failed:', error.message);
    });
}

async function blockIP(ip, reason) {
  const db = getSupabaseAdmin();
  if (!db) return;
  try {
    const { data: existing } = await db
      .from('blocked_ips')
      .select('id')
      .eq('ip', ip)
      .maybeSingle();

    if (existing) return; // already blocked, nothing to do

    const { error: insertErr } = await db.from('blocked_ips').insert({ ip, reason });
    if (insertErr) {
      console.error('[AttackDetection] auto-block insert failed:', insertErr.message);
      return;
    }
    logSecurityEvent('ip_blocked', ip, `Auto-blocked: ${reason}`);
    console.warn(`[AttackDetection] Auto-blocked IP ${ip}: ${reason}`);
  } catch (e) {
    console.error('[AttackDetection] blockIP error:', e.message);
  }
}

/* ── In-memory blocked-IP cache, refreshed periodically, so we
   don't hit Supabase on every single request just to check the
   block list. ──────────────────────────────────────────────── */
let blockedIPCache = new Set();
let lastCacheRefresh = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

async function refreshBlockedIPCache() {
  const db = getSupabaseAdmin();
  if (!db) return;
  try {
    const { data, error } = await db.from('blocked_ips').select('ip');
    if (!error && data) {
      blockedIPCache = new Set(data.map(r => r.ip));
    }
  } catch (e) {
    console.error('[AttackDetection] blocked-IP cache refresh failed:', e.message);
  }
}

function getClientIp(req) {
  // trust proxy is already set in server/index.js, so req.ip is the
  // real client IP (Render's proxy header chain), not the proxy's own IP.
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

/* ── Middleware 1: block gate (runs on every request) ────── */
async function blockGate(req, res, next) {
  const ip = getClientIp(req);

  if (Date.now() - lastCacheRefresh > CACHE_TTL_MS) {
    lastCacheRefresh = Date.now();
    refreshBlockedIPCache(); // fire and forget, don't block this request on it
  }

  if (blockedIPCache.has(ip)) {
    return res.status(403).json({
      error: 'Access blocked due to suspicious activity. This incident has been logged for legal action.'
    });
  }
  next();
}

/* ── Middleware 2: attack detector (runs on real-site routes) ── */
function attackDetector(req, res, next) {
  if (isExcludedPath(req.path)) return next();

  const match = scanRequest(req);
  if (!match) return next();

  const ip = getClientIp(req);
  const ua = req.get('User-Agent') || 'unknown';
  const details = JSON.stringify({
    path: req.path,
    method: req.method,
    matchedIn: match.matchedIn,
    matchedPattern: match.matchedPattern,
    // Truncate to keep log rows small; full payload rarely needs to exceed this for evidence purposes.
    matchedValue: String(match.matchedValue).slice(0, 500),
    userAgent: ua,
  });

  logSecurityEvent(match.eventType, ip, details);

  const count = recordOffense(ip);
  if (count >= OFFENSE_THRESHOLD) {
    blockIP(ip, `${count} suspicious requests (${match.eventType}) within ${OFFENSE_WINDOW_MS / 60000} minutes`);
    blockedIPCache.add(ip); // block immediately, don't wait for next cache refresh
    return res.status(403).json({
      error: 'Access blocked due to suspicious activity. This incident has been logged for legal action.'
    });
  }

  // Not blocked yet - request continues normally. We only log, we don't
  // interfere with the actual request/response for isolated attempts,
  // so legitimate users triggering a false positive aren't disrupted.
  next();
}

module.exports = { blockGate, attackDetector, getClientIp };
