const rateLimit = require('express-rate-limit');

// Per-IP limiter for login endpoint, 20 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    // FIX: pehle retryAfter = resetTime / 1000 tha lekin resetTime
    // pehle se epoch milliseconds mein hai, divide karne se galat
    // value milti thi (e.g. 1700000 seconds instead of 900 seconds).
    // Ab resetTime se current time minus karo for correct countdown.
    const retryAfterSec = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
    res.status(429).json({
      error: 'Too many login attempts. Try again in 15 minutes.',
      retryAfter: Math.max(0, retryAfterSec)
    });
  }
});

// Flag submission limiter, 10 per minute (was 5, too strict for legit users
// who mistype a flag and retry. 10 still prevents brute force.)
const flagLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfterSec = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
    res.status(429).json({
      error: 'Too many flag attempts. Wait a moment.',
      retryAfter: Math.max(0, retryAfterSec)
    });
  }
});

// Lab instance start/stop/status. Each new session id holds memory until the
// cleanup (web-03 builds a whole sql.js DB), so cap how fast one IP can mint them.
const labInstanceLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ error: 'Too many lab restarts. Please wait a few minutes.' })
});

// ── Per-tool limiters (keyed by user) ──────────────────────
// Pehle Mistake Analyzer + saare AlexUtils endpoints ek hi analyzeLimiter
// share karte the (15 / 10 min per IP), aur AlexTrace ke lookup/metadata/
// password teeno ek traceLimiter. 15 DNS lookups ke baad analyzer bhi lock
// ho jata tha, aur ek hostel/college IP pe poori class ek hi budget share
// karti thi. Ab har tool / endpoint group ka apna bucket hai, keyed by the
// logged-in user (req.toolUserId from requireAuth), IP sirf fallback.
// So these must be mounted AFTER requireAuth / requireToolLogin.
function toolKey(req) {
  return req.toolUserId ? `user:${req.toolUserId}` : `ip:${req.ip}`;
}

function makeToolLimiter({ max, message, windowMs = 10 * 60 * 1000, keyGenerator = toolKey }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler: (req, res) => {
      const retryAfterSec = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
      res.status(429).json({ error: message, retryAfter: Math.max(0, retryAfterSec) });
    }
  });
}

// Cyber Mistake Analyzer limiter, 15 per 10 minutes per user.
const analyzeLimiter = makeToolLimiter({
  max: 15,
  message: 'Too many analysis requests. Please wait a few minutes and try again.'
});

// Site-wide cap for the analyzer: the Gemini free-tier quota is per API key,
// not per user, so many users together must not burn through it.
const analyzeGlobalLimiter = makeToolLimiter({
  max: 150,
  message: 'The analyzer is busy right now. Please try again in a few minutes.',
  keyGenerator: () => 'mistake-analyzer:all'
});

// AlexUtils, one bucket per endpoint group. DNS tab does one record type
// per call, so it gets the most room; CVE search hits NVD (5 req / 30 s
// without a key) so it stays tight.
const utilsDnsLimiter = makeToolLimiter({ max: 60, message: 'Too many DNS lookups. Please wait a few minutes and try again.' });
const utilsIpLimiter = makeToolLimiter({ max: 30, message: 'Too many IP lookups. Please wait a few minutes and try again.' });
const utilsMacLimiter = makeToolLimiter({ max: 30, message: 'Too many MAC lookups. Please wait a few minutes and try again.' });
const utilsSslLimiter = makeToolLimiter({ max: 20, message: 'Too many SSL checks. Please wait a few minutes and try again.' });
const utilsCveLimiter = makeToolLimiter({ max: 15, message: 'Too many CVE searches. Please wait a few minutes and try again.' });

// AlexRecon scan limiter, 6 scans per 10 minutes per IP.
// Recon fans out to several external services (crt.sh, BGPView, target
// host) per scan, so this keeps abuse/hammering in check without being
// annoying for a student running a couple of scans back to back.
const reconLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfterSec = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
    res.status(429).json({
      error: 'Too many recon scans. Please wait a few minutes and try again.',
      retryAfter: Math.max(0, retryAfterSec)
    });
  }
});

// AlexTrace lookup limiter, 8 lookups per 10 minutes per user.
// A single lookup fans out to 25+ external platforms plus Gravatar/HIBP/DNS,
// so this is intentionally tighter than AlexRecon's limiter to stay polite
// to third-party services and avoid getting AlexCyberX's IP blocklisted.
const traceLimiter = makeToolLimiter({
  max: 8,
  message: 'Too many lookups. Please wait a few minutes and try again.'
});
// Metadata (in-memory EXIF read) and password check (fully offline) make no
// external calls, so they get their own, more generous buckets.
const traceMetadataLimiter = makeToolLimiter({ max: 20, message: 'Too many image checks. Please wait a few minutes and try again.' });
const tracePasswordLimiter = makeToolLimiter({ max: 30, message: 'Too many password checks. Please wait a few minutes and try again.' });

// Cheap per-IP limit in front of the login check of /api/tools/analyze-command,
// so junk/anonymous requests can't hammer Supabase auth (the per-user
// analyzeLimiter only runs after a valid login).
const analyzePreAuthLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ error: 'Too many requests. Please wait a few minutes and try again.' })
});

module.exports = {
  loginLimiter, flagLimiter, labInstanceLimiter, reconLimiter, analyzePreAuthLimiter,
  analyzeLimiter, analyzeGlobalLimiter,
  utilsDnsLimiter, utilsIpLimiter, utilsMacLimiter, utilsSslLimiter, utilsCveLimiter,
  traceLimiter, traceMetadataLimiter, tracePasswordLimiter
};
