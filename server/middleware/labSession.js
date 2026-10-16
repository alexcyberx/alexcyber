// ── LAB SESSION GUARD (/api/lab/*) ──────────────────────────────
// Labs key their in-memory state by the X-Lab-Session header or ?session=.
// The browser makes these ids itself (sess_xxx, acx_..., hex), so anything
// else is rejected here, once, for every lab: a session id used to reach the
// lab pages' inline scripts unescaped (reflected XSS on the main origin) and
// any string, however long, allocated a new instance.
const { labInstanceLimiter } = require('./rateLimit');

const SESSION_RE = /^[A-Za-z0-9_-]{1,100}$/;

function labSessionGuard(req, res, next) {
  const h = req.headers['x-lab-session'];
  const q = req.query.session;
  for (const v of [h, q]) {
    if (v === undefined) continue;
    if (typeof v !== 'string' || !SESSION_RE.test(v)) {
      return res.status(400).json({ error: 'Invalid lab session.' });
    }
  }
  if (/\/instance\/(status|restart|stop)$/.test(req.path)) return labInstanceLimiter(req, res, next);
  next();
}

module.exports = { labSessionGuard, SESSION_RE };
