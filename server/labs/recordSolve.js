// ── LAB SOLVE RECORDING ─────────────────────────────────────────
// Lab challenges (hasLabFlow) are checked by their own Express route
// (POST /api/lab/<name>/submit). Earlier the browser was supposed to save the
// solve afterwards, but that call (acxRecordSolve in js/ctf-sync.js) had been
// turned into a no-op, so since July no lab solve reached ctf_solves and
// nobody got XP for these 6 challenges.
//
// Now the server records it: when the lab's own /submit answers
// { success: true }, this middleware verifies the player's Supabase JWT
// (Authorization header, added by the fetch wrapper in js/page-scripts.js)
// and calls record_lab_ctf_solve() with the service-role key. The browser
// can't award itself XP: that RPC is only executable by service_role.
const { getSupabaseAdmin } = require('../middleware/toolAccess');

async function recordForRequest(req, slug) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  if (!token) return { recorded: false, reason: 'login_required' };
  const db = getSupabaseAdmin();
  if (!db) return { recorded: false, reason: 'not_configured' };
  const { data: u, error: authErr } = await db.auth.getUser(token);
  if (authErr || !u || !u.user) return { recorded: false, reason: 'login_required' };
  const { data, error } = await db.rpc('record_lab_ctf_solve', { p_user_id: u.user.id, p_slug: slug });
  if (data && data.error === 'suspended') return { recorded: false, reason: 'suspended' };
  // Prerequisites (ctf_challenges.requires) not solved yet: the flag was right, but it does not count.
  if (data && data.error === 'locked') return { recorded: false, reason: 'locked', message: data.message || 'Solve the required challenge(s) first.' };
  if (error || !data || data.success === false) {
    console.error('[recordSolve]', slug, error ? error.message : data && data.error);
    return { recorded: false, reason: 'server_error' };
  }
  return {
    recorded: true,
    already_solved: !!data.already_solved,
    xp_earned: data.already_solved ? 0 : (data.xp_earned || 0),
    new_xp: data.new_xp,
  };
}

// Mount in front of a lab router: app.use('/api/lab/hidden', recordLabSolve('web-01'), labRouter)
function recordLabSolve(slug) {
  return function (req, res, next) {
    if (req.method !== 'POST' || req.path !== '/submit') return next();
    const send = res.json.bind(res);
    res.json = function (body) {
      if (!body || body.success !== true) return send(body);
      recordForRequest(req, slug)
        .then((r) => send({ ...body, ...r }))
        .catch((e) => { console.error('[recordSolve]', slug, e.message); send({ ...body, recorded: false, reason: 'server_error' }); });
      return res;
    };
    next();
  };
}

module.exports = { recordLabSolve };
