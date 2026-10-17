// ── ADMIN API (/api/admin) ─────────────────────────────────────
// The few admin actions that need the service-role key, so they cannot run
// from the browser: inviting a user and deleting an account (auth user +
// everything that cascades from it). Every request must carry an admin's
// access token from a two-step (aal2) session; the role is read fresh from
// the DB each time (no cache), and banned admins are refused.
const express = require('express');
const rateLimit = require('express-rate-limit');
const { getSupabaseAdmin } = require('../middleware/toolAccess');

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ error: 'Too many admin actions. Try again later.' }),
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Linear check (no backtracking): one @, a dot in the domain, no spaces, ≤254.
function isEmail(s) {
  if (typeof s !== 'string' || s.length > 254 || /\s/.test(s)) return false;
  const at = s.indexOf('@');
  if (at < 1 || at !== s.lastIndexOf('@')) return false;
  const domain = s.slice(at + 1);
  return domain.length > 2 && domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.');
}

async function requireAdmin(req, res, next) {
  try {
    const header = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token) return res.status(401).json({ error: 'Please sign in again.' });
    const sb = getSupabaseAdmin();
    if (!sb) return res.status(503).json({ error: 'Admin actions are not configured on the server.' });
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data || !data.user) return res.status(401).json({ error: 'Your session has expired. Sign in again.' });
    // Verified by getUser above, so its claims can be read.
    let aal = null;
    try { aal = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).aal; } catch { /* bad shape */ }
    if (aal !== 'aal2') return res.status(403).json({ error: 'Two-step verification required. Sign in to the admin panel again.' });
    const { data: prof, error: pErr } = await sb.from('profiles').select('role, is_banned').eq('id', data.user.id).single();
    if (pErr || !prof || prof.role !== 'admin' || prof.is_banned) return res.status(403).json({ error: 'Not allowed.' });
    req.admin = { id: data.user.id, email: data.user.email || '' };
    req.sb = sb;
    next();
  } catch (e) {
    console.error('[admin] auth check failed:', e.message);
    res.status(401).json({ error: 'Please sign in again.' });
  }
}

function audit(sb, type, details) {
  sb.from('security_logs').insert({ event_type: type, details: String(details).slice(0, 500), ip: null }).then(() => {}, () => {});
}

function siteUrl(req) {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.RENDER_EXTERNAL_URL || ('https://' + req.get('host'))).replace(/\/$/, '');
}

router.use(limiter, requireAdmin);

// POST /api/admin/invite { email, name? } → Supabase sends the invite mail
// (through /auth/email-hook); the link signs the person in on the site and
// asks them to set a password.
router.post('/invite', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const name = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 60) : '';
  if (!isEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  const { data, error } = await req.sb.auth.admin.inviteUserByEmail(email, {
    data: name ? { full_name: name } : {},
    redirectTo: siteUrl(req) + '/?invited=1',
  });
  if (error) {
    const msg = /already|registered|exists/i.test(error.message || '') ? 'This email already has an account.' : 'Could not send the invite: ' + (error.message || 'unknown error');
    return res.status(/already|registered|exists/i.test(error.message || '') ? 409 : 502).json({ error: msg });
  }
  audit(req.sb, 'admin_user_invited', `${req.admin.email} invited ${email}`);
  res.json({ ok: true, id: data?.user?.id || null });
});

// POST /api/admin/users/:id/delete → deletes the auth user; the profile and
// the user's solves, progress, posts, notifications etc. cascade with it.
router.post('/users/:id/delete', async (req, res) => {
  const id = req.params.id;
  if (!UUID.test(id)) return res.status(400).json({ error: 'Bad user id.' });
  if (id === req.admin.id) return res.status(400).json({ error: 'You cannot delete your own account here.' });
  const { data: target } = await req.sb.from('profiles').select('role, full_name, username').eq('id', id).maybeSingle();
  if (target && target.role === 'admin') return res.status(400).json({ error: 'Remove the admin role first, then delete the account.' });
  const { error } = await req.sb.auth.admin.deleteUser(id);
  if (error) return res.status(502).json({ error: 'Could not delete the account: ' + (error.message || 'unknown error') });
  audit(req.sb, 'admin_user_deleted', `${req.admin.email} deleted user ${(target && (target.username || target.full_name)) || id}`);
  res.json({ ok: true });
});

module.exports = router;
module.exports._isEmail = isEmail;
