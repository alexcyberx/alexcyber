/* ═══════════════════════════════════════════════════════════
   TOOL ACCESS MIDDLEWARE
   ═══════════════════════════════════════════════════════════
   Shared helpers for any tool route (Mistake Analyzer,
   AlexRecon) that needs to:
     1. Require the caller to be logged in and not suspended
        (requireToolLogin)
     2. Check the admin "enable/disable" switch (checkToolEnabled)
     3. Log a usage event for the admin dashboard (logToolUsage)

   Auth note: tool routes now verify the caller's Supabase access token
   (Authorization: Bearer ...) via requireAuth. The user id is taken from
   the verified token, never from the request body or query string.
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

// ── Banned / suspended users ─────────────────────────────────
// Admin panel ka "Suspend"/"Ban" sirf profiles.is_banned set karta hai,
// session/refresh token chalta rehta hai. Isliye har tool request pe
// is_banned check karte hain (service-role client se, RLS se independent).
// Per user ~60 s cache, taaki har request pe ek extra DB query na ho.
const BAN_CACHE_MS = 60 * 1000;
const BAN_CACHE_MAX = 5000;
const banCache = new Map(); // uid -> { banned, at }

async function isUserBanned(uid) {
  const now = Date.now();
  const cached = banCache.get(uid);
  if (cached && now - cached.at < BAN_CACHE_MS) return cached.banned;

  const db = getSupabaseAdmin();
  if (!db) return cached ? cached.banned : false;

  try {
    const { data, error } = await db
      .from('profiles')
      .select('is_banned')
      .eq('id', uid)
      .maybeSingle();
    if (error) throw new Error(error.message);

    const banned = !!(data && data.is_banned);
    if (banCache.size >= BAN_CACHE_MAX) {
      // Simple cleanup: drop expired entries, and if still full just reset.
      for (const [k, v] of banCache) if (now - v.at >= BAN_CACHE_MS) banCache.delete(k);
      if (banCache.size >= BAN_CACHE_MAX) banCache.clear();
    }
    banCache.set(uid, { banned, at: now });
    return banned;
  } catch (e) {
    // DB hiccup: agar pehle se pata hai ki banned hai to block hi rakho,
    // warna fail open (same as checkToolEnabled), taaki ek Supabase glitch
    // saare tools offline na kar de.
    console.error('[ToolAccess] ban check failed:', e.message);
    return cached ? cached.banned : false;
  }
}

// Express middleware: the caller must send a valid Supabase access token
// ("Authorization: Bearer <token>"). The token is verified server-side with
// auth.getUser(), and the user id comes ONLY from that verified token.
// Any userId the client puts in the body/query is overwritten, so a caller
// can never read or write another user's data by guessing a UUID.
// Suspended users (profiles.is_banned) get 403 even with a valid token.
// Fails closed: if Supabase isn't configured, the request is rejected.
async function requireAuth(req, res, next) {
  try {
    const header = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
    if (!token) return res.status(401).json({ error: 'Please log in to use this tool.' });

    const db = getSupabaseAdmin();
    if (!db) return res.status(503).json({ error: 'Authentication is not configured on the server.' });

    const { data, error } = await db.auth.getUser(token);
    if (error || !data || !data.user) {
      return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
    }

    const uid = data.user.id;
    if (await isUserBanned(uid)) {
      return res.status(403).json({ error: 'Your account is suspended.' });
    }

    req.authUserId = uid;
    req.toolUserId = uid;
    if (req.body && typeof req.body === 'object') req.body.userId = uid;
    if (req.query && typeof req.query === 'object') req.query.userId = uid;
    next();
  } catch (e) {
    console.error('[ToolAccess] auth check failed:', e.message);
    res.status(401).json({ error: 'Please log in to use this tool.' });
  }
}

// Backwards-compatible name used by the existing tool routers.
const requireToolLogin = requireAuth;

// Express middleware factory: blocks the request with a friendly
// message if an admin has disabled this tool. Fails open (allows
// the request through) if Supabase isn't configured or the lookup
// itself errors, so a Supabase hiccup never takes a tool offline.
function checkToolEnabled(toolKey) {
  return async (req, res, next) => {
    const db = getSupabaseAdmin();
    if (!db) return next();

    try {
      const { data, error } = await db
        .from('tool_settings')
        .select('is_enabled, disabled_message')
        .eq('tool_key', toolKey)
        .single();

      if (error || !data) return next(); // no row yet - fail open
      if (!data.is_enabled) {
        return res.status(503).json({
          error: data.disabled_message || 'This tool is temporarily unavailable. Please check back soon.',
          toolDisabled: true
        });
      }
      next();
    } catch (e) {
      console.error(`[ToolAccess] enabled-check failed for ${toolKey}:`, e.message);
      next(); // fail open
    }
  };
}

// Fire-and-forget usage log insert. Never blocks or fails the
// request that triggered it - logging is a nice-to-have for the
// admin dashboard, not something that should break a tool.
function logToolUsage(toolKey, userId) {
  const db = getSupabaseAdmin();
  if (!db) return;
  db.from('tool_usage_logs')
    .insert({ tool_key: toolKey, user_id: userId || null })
    .then(({ error }) => {
      if (error) console.error(`[ToolAccess] usage log failed for ${toolKey}:`, error.message);
    });
}

module.exports = { requireAuth, requireToolLogin, checkToolEnabled, logToolUsage, getSupabaseAdmin, isUserBanned };
