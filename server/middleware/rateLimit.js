const rateLimit = require('express-rate-limit');

// Per-IP limiter for login endpoint — 20 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many login attempts. Try again in 15 minutes.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Stricter limiter for flag submission
const flagLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  handler: (req, res) => {
    res.status(429).json({ error: 'Rate limited. Slow down.' });
  }
});

module.exports = { loginLimiter, flagLimiter };
