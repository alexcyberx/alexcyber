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

   False-positive rules (pehle normal users block ho jaate the):
     - Tool inputs (Mistake Analyzer command, AlexUtils, AlexTrace,
       AlexRecon) aur site search / message fields scan nahi hote:
       wahan "' OR 1=1", "--top-ports", "../" type karna normal use hai.
     - Sirf HIGH confidence payload shapes auto-block ki taraf count
       hote hain. Akela quote, # ya -- kuch bhi trigger nahi karta.
     - Valid Bearer token wala logged-in user kabhi auto-block nahi
       hota: event log hota hai, block ka faisla admin karega.
     - Sensitive fields (password, token, key, secret, ...) ki value
       kabhi security_logs ya console mein nahi jaati: [redacted].
     - Auto-block 24h ke liye hai (expires_at), permanent nahi.

   Fails open: if Supabase isn't configured or a lookup errors, we
   never block a legitimate user because of an infra hiccup.
═══════════════════════════════════════════════════════════ */

const crypto = require('crypto');
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

// Tool APIs: body/query yahan user ka free-text tool input hai (nmap
// commands, CVE keywords, regex, JSON, usernames, emails, passwords,
// recon targets). Security tool mein payload type karna hi kaam hai, isliye
// in fields ko scan nahi karte (na log, na block). URL path aur User-Agent
// yahan bhi scan hote hain.
const TOOL_INPUT_PREFIXES = [
  '/api/tools/',      // Mistake Analyzer
  '/api/alexutils/',
  '/api/alextrace/',
  '/api/alexrecon/',
];

// Kisi bhi route pe user ka khud type kiya hua free text (site search
// ?q=..., contact/support message). Same rule: scan nahi hota.
const FREE_TEXT_FIELDS = new Set(['q', 'query', 'search', 'message', 'msg', 'p_message']);

// Sensitive field names (substring, case-insensitive): password, pass, pwd,
// secret, token, key, authorization, apiKey, access_token, ... Inki value kabhi
// store/print nahi hoti, sirf field name + rule.
const SENSITIVE_FIELD_RE = /pass|pwd|secret|token|key|auth|cookie|session|otp|cred|jwt|signature/i;
// Is route ka har field sensitive hai (AlexTrace password check).
const SENSITIVE_PATH_PREFIXES = ['/api/alextrace/password-check'];
const REDACTED = '[redacted]';

// Express routing case-insensitive hai (/API/AlexTrace/... bhi wahi route
// hai), isliye prefix compare se pehle lowercase + // ko / karo.
function normPath(p) {
  return String(p || '').toLowerCase().replace(/\/{2,}/g, '/');
}

function hasPrefix(p, prefixes) {
  const n = normPath(p);
  return prefixes.some(prefix => n.startsWith(prefix));
}

function isExcludedPath(p) {
  return hasPrefix(p, EXCLUDED_PREFIXES);
}

function isSensitiveField(p, key) {
  return SENSITIVE_FIELD_RE.test(key) || hasPrefix(p, SENSITIVE_PATH_PREFIXES);
}

// URL path raw (percent-encoded) aata hai; ..%2f..%2f bhi pakadne ke liye
// do baar decode (double encoding), galat encoding pe raw hi rakho.
function safeDecode(s) {
  try { return decodeURIComponent(s); } catch (e) { return s; }
}

/* ── Pattern signatures ─────────────────────────────────────
   high: real payload shapes (UNION SELECT, ' OR 1=1, <script, ../../etc/passwd,
         sleep(5), benchmark(...)). Sirf yehi auto-block ki taraf count hote hain.
   low:  SQL/JS jaisa text jo normal bhi ho sakta hai: log hota hai
         (confidence: 'low'), block count nahi.
   Purana /'|#|--/ rule hata diya: O'Brien, India@123#, cool--guy ya
   nmap --top-ports attack ka saboot nahi hain.
   ReDoS: har pattern ya to linear hai ya bounded ({0,N}). SQL comment ki
   body mein comment-end nahi aa sakta, warna union + bahut saare khaali
   comments pe exponential backtracking hoti thi. ── */
const SQL_GAP = String.raw`(?:\s|\+|\/\*(?:[^*]|\*(?!\/)){0,40}\*\/)+`; // space, + ya /**/ SQL words ke beech

const SQLI_HIGH = [
  new RegExp(String.raw`\bunion${SQL_GAP}(?:(?:all|distinct)${SQL_GAP})?select\b`, 'i'),
  /['"`][\s)]*\b(?:or|and)\b[\s(]*['"]?\w+['"]?\s*(?:=|like\b)\s*['"]?\w+/i,   // ' OR 1=1, ' or 'a'='a
  /\b(?:or|and)\s+(\d+)\s*=\s*\1\b/i,                                             // or 1=1
  /;\s*(?:drop\s+table|truncate\s+table|delete\s+from|insert\s+into|shutdown)\b/i, // stacked query
  /\bxp_cmdshell\b/i,
  /\b(?:pg_)?sleep\(\s*\d+(?:\.\d+)?\s*\)/i,
  /\bbenchmark\(\s*\d+\s*,/i,
  /\bwaitfor\s+delay\s+['"]/i,
  /\binformation_schema\b/i,
  /\bload_file\s*\(/i,
  /\binto\s+(?:out|dump)file\b/i,
];
const SQLI_LOW = [
  /\bselect\s+\S[\s\S]{0,60}?\s+from\s+\w/i,
  /\binsert\s+into\s+\w/i,
  /\bdrop\s+table\b/i,
  /\b(?:or|and)\s+\d+\s*=\s*\d+/i,
  /['"]\s*(?:--|#|\/\*)/,
];

const XSS_HIGH = [
  /<\s*script\b/i,
  /<\s*iframe\b/i,
  /<[a-z][^>]{0,200}?\bon[a-z]+\s*=/i,                            // <img src=x onerror=..>, <svg/onload=..>
  /javascript\s*:[\s\S]{0,40}?\b(?:alert|prompt|confirm|eval)\s*\(/i,
  /\bdocument\s*\.\s*(?:cookie|location|domain)\b/i,
];
const XSS_LOW = [
  /javascript\s*:/i,
  /\bon(?:error|load|click|mouseover|focus|blur|submit|toggle|begin|animationstart|pointerover)\s*=/i,
  /<\s*(?:img|svg|body|input|details|video|audio|object|embed)\b/i,
];

const PATH_TRAVERSAL_HIGH = [
  /(?:\.\.[\/\\]){2,}/,                // ../../
  /\/etc\/(?:passwd|shadow)\b/i,
  /\/proc\/self\/environ\b/i,
  /\bboot\.ini\b/i,
  /\bwin\.ini\b/i,
];
const PATH_TRAVERSAL_LOW = [
  /\.\.[\/\\]/,                        // akela ../ (relative link bhi ho sakta hai)
];

const RULES = [
  { eventType: 'sqli_attempt',   high: SQLI_HIGH,           low: SQLI_LOW },
  { eventType: 'xss_attempt',    high: XSS_HIGH,            low: XSS_LOW },
  { eventType: 'path_traversal', high: PATH_TRAVERSAL_HIGH, low: PATH_TRAVERSAL_LOW },
];

// Scanner user-agents: high confidence (browser kabhi yeh nahi bhejta).
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

function matchTier(value, tier) {
  for (const rule of RULES) {
    const m = matchPattern(value, rule[tier]);
    if (m) return { eventType: rule.eventType, matchedPattern: m };
  }
  return null;
}

// Scans query, body, and params for a request, returns
// { eventType, matchedPattern, matchedIn, matchedValue, confidence } or null.
// High confidence match pehle (kisi bhi field mein), phir scanner UA, phir low.
// matchedValue sensitive field ke liye hamesha '[redacted]' hota hai.
function scanRequest(req) {
  const p = req.path || '';
  const toolRoute = hasPrefix(p, TOOL_INPUT_PREFIXES);
  const candidates = [];
  const addFields = (src, obj) => {
    if (toolRoute || !obj || typeof obj !== 'object') return;
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v !== 'string' || FREE_TEXT_FIELDS.has(k.toLowerCase())) continue;
      candidates.push({ field: `${src}.${k}`, value: v, sensitive: isSensitiveField(p, k) });
    }
  };
  addFields('query', req.query);
  addFields('body', req.body);
  addFields('params', req.params);
  // Also scan the raw path itself (covers path-traversal in the URL).
  candidates.push({ field: 'path', value: safeDecode(safeDecode(p)), sensitive: false });

  const found = (c, m, confidence) => ({
    ...m, matchedIn: c.field, matchedValue: c.sensitive ? REDACTED : c.value, confidence,
  });

  for (const c of candidates) {
    const m = matchTier(c.value, 'high');
    if (m) return found(c, m, 'high');
  }

  const ua = req.get('User-Agent') || '';
  const uaMatch = matchPattern(ua, BOT_UA_PATTERNS);
  if (uaMatch) return { eventType: 'bot_scan', matchedPattern: uaMatch, matchedIn: 'user-agent', matchedValue: ua, confidence: 'high' };

  for (const c of candidates) {
    const m = matchTier(c.value, 'low');
    if (m) return found(c, m, 'low');
  }

  return null;
}

/* ── In-memory offender tracking (per-IP) ───────────────────
   Resets on redeploy, which is fine: the Supabase security_logs
   table is the permanent evidence record, this is just the
   short-window counter that decides when to auto-block. ────── */
const OFFENSE_WINDOW_MS  = 10 * 60 * 1000; // 10 minutes
const OFFENSE_THRESHOLD  = 5;              // 5 high-confidence requests
const offenseLog = new Map(); // ip -> [timestamps]

function recordOffense(ip) {
  const now = Date.now();
  const arr = (offenseLog.get(ip) || []).filter(t => now - t < OFFENSE_WINDOW_MS);
  arr.push(now);
  offenseLog.set(ip, arr);
  return arr.length;
}

/* ── Logged-in user check (sirf auto-block se pehle) ──────────
   Threshold cross hone par hi Bearer token verify hota hai. Result 5 min
   cache (key = token ka sha256, token khud store nahi hota), taaki ek
   logged-in user ki har request pe Supabase auth call na ho. ────── */
const TOKEN_CACHE_MS = 5 * 60 * 1000;
const tokenCache = new Map(); // sha256(token) -> { uid, at }

// Resolves { uid } for a valid token, { uid: null } for no/invalid token,
// { unverifiable: true } if Supabase is down/unconfigured/rate-limited (fail open).
async function bearerUser(req) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  if (!token) return { uid: null };

  const key = crypto.createHash('sha256').update(token).digest('hex');
  const hit = tokenCache.get(key);
  if (hit && Date.now() - hit.at < TOKEN_CACHE_MS) return { uid: hit.uid };

  const db = getSupabaseAdmin();
  if (!db) return { unverifiable: true };
  try {
    const { data, error } = await db.auth.getUser(token);
    // Sirf network/5xx (AuthRetryableFetchError) aur 429 pe fail open, cache nahi.
    // Baaki har error (gateway/WAF ka HTML 4xx bhi, jo AuthUnknownError bina
    // status ke aata hai) = "logged in nahi": warna junk header se ban bypass.
    if (error && (error.name === 'AuthRetryableFetchError' || error.status === 429)) {
      return { unverifiable: true };
    }
    const uid = !error && data && data.user ? data.user.id : null;
    if (tokenCache.size > 1000) tokenCache.clear();
    tokenCache.set(key, { uid, at: Date.now() });
    return { uid };
  } catch (e) {
    console.error('[AttackDetection] token check failed:', e.message);
    return { unverifiable: true };
  }
}

// Periodic cleanup so the maps don't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [ip, arr] of offenseLog.entries()) {
    const fresh = arr.filter(t => now - t < OFFENSE_WINDOW_MS);
    if (fresh.length === 0) offenseLog.delete(ip);
    else offenseLog.set(ip, fresh);
  }
  for (const [k, v] of tokenCache.entries()) {
    if (now - v.at >= TOKEN_CACHE_MS) tokenCache.delete(k);
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

// Auto-block 24 ghante ka (CGNAT / hostel Wi-Fi pe ek IP ke peeche bahut log
// hote hain, permanent ban sabko lock kar deta tha). Admin panel ka manual
// block (expires_at null) permanent rehta hai. expires_at column DB mein na
// ho to purane tarike se, bina expiry, insert hota hai.
const AUTO_BLOCK_MS = 24 * 60 * 60 * 1000;

function isExpired(row) {
  return !!(row && row.expires_at) && Date.parse(row.expires_at) <= Date.now();
}

function missingExpiresColumn(err) {
  return !!err && /expires_at/i.test(String(err.message || ''));
}

async function blockIP(ip, reason) {
  const db = getSupabaseAdmin();
  if (!db) return;
  try {
    const expires_at = new Date(Date.now() + AUTO_BLOCK_MS).toISOString();
    // select('*'): expires_at column ho ya na ho, dono case mein chalta hai
    const { data: rows } = await db
      .from('blocked_ips')
      .select('*')
      .eq('ip', ip);

    if (rows && rows.some(r => !isExpired(r))) return; // already blocked, nothing to do

    if (rows && rows.length) {
      // purana auto-block expire ho chuka: wahi row phir se 24h ke liye
      const { error: updErr } = await db.from('blocked_ips').update({ reason, expires_at }).eq('ip', ip);
      if (updErr) {
        console.error('[AttackDetection] auto-block update failed:', updErr.message);
        return;
      }
    } else {
      let { error: insertErr } = await db.from('blocked_ips').insert({ ip, reason, expires_at });
      if (missingExpiresColumn(insertErr)) {
        ({ error: insertErr } = await db.from('blocked_ips').insert({ ip, reason }));
      }
      if (insertErr) {
        console.error('[AttackDetection] auto-block insert failed:', insertErr.message);
        return;
      }
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
    const { data, error } = await db.from('blocked_ips').select('*');
    if (!error && data) {
      blockedIPCache = new Set(data.filter(r => !isExpired(r)).map(r => r.ip));
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
  const details = {
    path: req.path,
    method: req.method,
    matchedIn: match.matchedIn,
    matchedPattern: match.matchedPattern,
    confidence: match.confidence,
    // Truncate to keep log rows small; full payload rarely needs to exceed this for evidence purposes.
    // Sensitive fields are already '[redacted]' by scanRequest.
    matchedValue: String(match.matchedValue).slice(0, 500),
    userAgent: ua,
  };

  // Low confidence: sirf evidence ke liye log, block count nahi.
  const count = match.confidence === 'high' ? recordOffense(ip) : 0;
  if (count < OFFENSE_THRESHOLD) {
    logSecurityEvent(match.eventType, ip, JSON.stringify(details));
    // Not blocked yet - request continues normally. We only log, we don't
    // interfere with the actual request/response for isolated attempts,
    // so legitimate users triggering a false positive aren't disrupted.
    return next();
  }

  // Threshold cross. Logged-in user (valid Bearer token) ko auto-block nahi
  // karte: event userId ke saath log hota hai, block admin review ke baad.
  bearerUser(req).then((who) => {
    if (who.uid || who.unverifiable) {
      if (who.uid) details.userId = who.uid;
      details.autoBlock = who.uid ? 'skipped: logged-in user, needs admin review' : 'skipped: could not verify token';
      logSecurityEvent(match.eventType, ip, JSON.stringify(details));
      return next();
    }
    logSecurityEvent(match.eventType, ip, JSON.stringify(details));
    blockIP(ip, `${count} suspicious requests (${match.eventType}) within ${OFFENSE_WINDOW_MS / 60000} minutes`);
    blockedIPCache.add(ip); // block immediately, don't wait for next cache refresh
    res.status(403).json({
      error: 'Access blocked due to suspicious activity. This incident has been logged for legal action.'
    });
  }, () => next()); // bearerUser khud reject nahi karta, phir bhi fail open
}

module.exports = { blockGate, attackDetector, getClientIp, scanRequest };
