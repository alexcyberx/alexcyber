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

// Cyber Mistake Analyzer limiter, 15 per 10 minutes per IP.
// Keeps us well inside Gemini's free-tier rate limits even if several
// students use the tool from the same network at once.
const analyzeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfterSec = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
    res.status(429).json({
      error: 'Too many analysis requests. Please wait a few minutes and try again.',
      retryAfter: Math.max(0, retryAfterSec)
    });
  }
});

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

// AlexTrace limiter, 8 lookups per 10 minutes per IP.
// A single lookup fans out to 25+ external platforms plus Gravatar/HIBP/DNS,
// so this is intentionally tighter than AlexRecon's limiter to stay polite
// to third-party services and avoid getting AlexCyberX's IP blocklisted.
const traceLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfterSec = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
    res.status(429).json({
      error: 'Too many lookups. Please wait a few minutes and try again.',
      retryAfter: Math.max(0, retryAfterSec)
    });
  }
});

module.exports = { loginLimiter, flagLimiter, analyzeLimiter, reconLimiter, traceLimiter };
