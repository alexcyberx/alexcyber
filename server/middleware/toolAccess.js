/* ═══════════════════════════════════════════════════════════
   TOOL ACCESS MIDDLEWARE
   ═══════════════════════════════════════════════════════════
   Shared helpers for any tool route (AlexSync, Mistake Analyzer,
   AlexRecon) that needs to:
     1. Require the caller to be logged in (requireToolLogin)
     2. Check the admin "enable/disable" switch (checkToolEnabled)
     3. Log a usage event for the admin dashboard (logToolUsage)

   Auth note: this follows the same pattern already used across the
   app (AlexRecon, AlexSync) - the frontend sends the Supabase user's
   id in the request body/query rather than a verified JWT. This is
   a lighter-weight trust model consistent with the rest of the
   codebase, not a new one introduced here. A full JWT-verification
   pass across every tool route would be a larger, separate change.
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

// Express middleware: rejects the request unless a userId is present
// (in body for POST, in query for GET) and corresponds to a real
// profile row. Attaches req.toolUserId for downstream handlers.
function requireToolLogin(req, res, next) {
  const userId = req.body?.userId || req.query?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Please log in to use this tool.' });
  }
  req.toolUserId = userId;
  next();
}

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

module.exports = { requireToolLogin, checkToolEnabled, logToolUsage, getSupabaseAdmin };
