/* ================================================================
   ctf-sync.js — AlexCyberX
   Simple, clean CTF solve persistence
   Replaces bugfix-patch.js complexity
================================================================ */

'use strict';

// ── Bridge to index.html's real `ctfSolved` variable ───────────
// index.html declares `let ctfSolved` at the top level of an inline
// <script> tag — that's a script-scoped binding, NOT window.ctfSolved
// (top-level let/const never attach to window, only var does). So
// setting window.ctfSolved here used to update a completely different,
// invisible variable: ctfRender()/updateCTFStats()/flag-submit code
// all read the bare `ctfSolved` identifier and never saw DB-synced data.
// _getSolved/_setSolved go through index.html's exposed getter/setter
// so this file actually updates what the page renders.
function _getSolved() {
  return (typeof window.getCtfSolved === 'function') ? window.getCtfSolved() : (window.ctfSolved || {});
}
function _setSolved(val) {
  if (typeof window.setCtfSolved === 'function') window.setCtfSolved(val);
  else window.ctfSolved = val; // fallback if index.html hasn't loaded yet
}

// ── Wait for Supabase to be ready ──────────────────────────────
function _waitFor(fn, maxMs = 10000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = setInterval(() => {
      if (fn()) { clearInterval(check); resolve(true); }
      else if (Date.now() - start > maxMs) { clearInterval(check); resolve(false); }
    }, 50);
  });
}

// ── User key ───────────────────────────────────────────────────
function _userKey() {
  const uid = window._currentUser?.id;
  return uid ? 'acx_solved_' + uid : null;
}

// ── Load solved from localStorage ──────────────────────────────
function _loadLocal() {
  try {
    const key = _userKey();
    if (!key) return {};
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch(e) { return {}; }
}

// ── Save solved to localStorage ────────────────────────────────
function _saveLocal(solved) {
  try {
    const key = _userKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(solved));
    // Also keep legacy key in sync
    localStorage.setItem('acx_ctf_solved', JSON.stringify(solved));
  } catch(e) {}
}

// ── Get challenge UUID from title ──────────────────────────────
let _titleToUuid = {};
let _uuidToId    = {};

async function _buildUuidMap() {
  if (!window._supabase) return;
  if (Object.keys(_titleToUuid).length > 0) return;

  try {
    const { data, error } = await window._supabase
      .from('ctf_challenges')
      .select('id, title');

    if (error || !data) {
      console.warn('[SYNC] ctf_challenges fetch error:', error?.message);
      return;
    }

    // Map: JS c.id → DB UUID (via title match)
    // Map: DB UUID → JS c.id (for reverse lookup)
    (window.CTF_CHALLENGES || []).forEach(c => {
      const row = data.find(r => r.title === c.title);
      if (row) {
        _titleToUuid[c.id]    = row.id;  // 'web-01' → UUID
        _titleToUuid[c.title] = row.id;  // 'Cookie Monster' → UUID
        _uuidToId[row.id]     = c.id;    // UUID → 'web-01'
      }
    });

    console.log('[SYNC] UUID map ready:', Object.keys(_titleToUuid).length, 'entries');
  } catch(e) {
    console.warn('[SYNC] _buildUuidMap error:', e);
  }
}

// ── Save a solve to Supabase ───────────────────────────────────
async function _saveSolveToDb(challengeId, xp) {
  if (!window._supabase || !window._currentUser) return;

  await _buildUuidMap();
  const uuid = _titleToUuid[challengeId];
  if (!uuid) {
    console.warn('[SYNC] No UUID for:', challengeId);
    return;
  }

  const userId = window._currentUser.id;

  // Check already solved
  const { data: existing } = await window._supabase
    .from('ctf_solves')
    .select('id')
    .eq('user_id', userId)
    .eq('challenge_id', uuid)
    .maybeSingle();

  if (existing) return; // already in DB

  // Insert solve
  const { error: insertErr } = await window._supabase
    .from('ctf_solves')
    .insert({
      user_id:       userId,
      challenge_id:  uuid,
      solved_at:     new Date().toISOString(),
      points_earned: xp,   // FIX: get_profile_stats recent_solves query yeh field read karta hai
      correct:       true  // FIX: get_profile_stats mein correct = true filter hai
    });

  if (insertErr) {
    console.warn('[SYNC] Insert error:', insertErr.message);
    return;
  }

  // Update profile XP
  const currentXP = window._currentUser.xp || 0;
  const newXP     = currentXP + xp;
  const newLevel  = Math.max(1, Math.floor(newXP / 500) + 1);
  const newSolves = (window._currentUser.ctf_solves || 0) + 1;

  await window._supabase
    .from('profiles')
    .update({ xp: newXP, level: newLevel, ctf_solves: newSolves, last_seen: new Date().toISOString() })
    .eq('id', userId);

  // Update in-memory user
  window._currentUser.xp         = newXP;
  window._currentUser.level      = newLevel;
  window._currentUser.ctf_solves = newSolves;

  console.log('[SYNC] Solve saved to DB:', challengeId, '+' + xp + ' XP');
}

// ── Load solves FROM Supabase on login/refresh ─────────────────
async function _loadSolvesFromDb() {
  if (!window._supabase || !window._currentUser) return;

  await _buildUuidMap();

  const { data, error } = await window._supabase
    .from('ctf_solves')
    .select('challenge_id, solved_at')
    .eq('user_id', window._currentUser.id);

  if (error) {
    console.warn('[SYNC] ctf_solves load error:', error.message);
    return;
  }

  if (!data || data.length === 0) return;

  // Build solved object from DB rows
  const dbSolved = {};
  data.forEach(row => {
    const cid = _uuidToId[row.challenge_id];
    if (cid) {
      const c   = (window.CTF_CHALLENGES || []).find(ch => ch.id === cid);
      dbSolved[cid] = { xp: c?.xp || 0, solvedAt: row.solved_at };
    }
  });

  if (Object.keys(dbSolved).length === 0) return;

  // Merge with local (DB wins for solved status)
  const localSolved = _loadLocal();
  const merged      = Object.assign({}, localSolved, dbSolved);

  _setSolved(merged);
  _saveLocal(merged);

  console.log('[SYNC] Loaded', Object.keys(dbSolved).length, 'solves from DB');

  if (typeof updateCTFStats === 'function') updateCTFStats();
  if (typeof ctfRender      === 'function') ctfRender();
}

// ── MAIN INIT ─────────────────────────────────────────────────
// FIX: pehle yeh saare window.* overrides ek `await _waitFor(...)` ke
// PEECHE the. _waitFor 50ms setInterval se poll karta hai, jabki
// auth.js ka `await _supabase.auth.getSession()` usually usse pehle
// resolve ho jaata hai (cached/local session — bahut fast). Result:
// refresh pe auth.js purane, unpatched refreshCTFSolvedForCurrentUser()
// ko call kar deta tha (jo ctfSolved = {} kar deta aur 0/0 render karta),
// patch tab tak nahi laga hota tha — isliye solve "reset" dikhta tha.
// FIX: overrides ab turant, synchronously lagao (script load hote hi,
// koi await se pehle). Sirf UUID-map build karna genuinely async rahega,
// woh kisi override se block nahi hota.

// Override saveCTFSolvedToStorage — save to user-specific key
const _origSave = window.saveCTFSolvedToStorage;
window.saveCTFSolvedToStorage = function() {
  _saveLocal(_getSolved());
  if (typeof _origSave === 'function') _origSave();
};

// Override loadCTFSolvedFromStorage — load from user-specific key
window.loadCTFSolvedFromStorage = function() {
  const loaded = _loadLocal();
  _setSolved(loaded);
  // Sync legacy key
  try { localStorage.setItem('acx_ctf_solved', JSON.stringify(loaded)); } catch(e) {}
};

// Override refreshCTFSolvedForCurrentUser — load local first, then DB
window.refreshCTFSolvedForCurrentUser = function() {
  // Step 1: Load local immediately so UI is instant (never flashes to 0)
  _setSolved(_loadLocal());
  if (typeof updateCTFStats === 'function') updateCTFStats();
  if (typeof ctfRender      === 'function') ctfRender();

  // Step 2: Background DB sync
  if (window._currentUser && window._supabase) {
    setTimeout(() => _loadSolvesFromDb(), 800);
  }
};

// Override syncSolvedFromSupabase
window.syncSolvedFromSupabase = _loadSolvesFromDb;

// Override loadCTFUuids — use our title-based map
window.loadCTFUuids = _buildUuidMap;

// Override getChallengeUuid
window.getChallengeUuid = function(idOrTitle) {
  return _titleToUuid[idOrTitle] || null;
};

(async function init() {
  // Wait for both Supabase and CTF_CHALLENGES to be ready before
  // building the UUID map (this part is fine to be async — nothing
  // depends on it being instant, _saveSolveToDb/_loadSolvesFromDb
  // both call _buildUuidMap themselves before they need it).
  await _waitFor(() => window._supabase && window.CTF_CHALLENGES);
  await _buildUuidMap();
  console.log('[SYNC] ctf-sync.js ready');
})();

// ── PUBLIC: called after a correct solve ──────────────────────
window.acxRecordSolve = async function(challengeId, xp) {
  await _saveSolveToDb(challengeId, xp);
};

// ── Listen for auth changes ───────────────────────────────────
(async function setupAuthListener() {
  await _waitFor(() => window._supabase);

  window._supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      // Wait for _currentUser to be set by auth.js
      await _waitFor(() => window._currentUser?.id);
      await _buildUuidMap();
      // Load local first
      _setSolved(_loadLocal());
      if (typeof updateCTFStats === 'function') updateCTFStats();
      if (typeof ctfRender      === 'function') ctfRender();
      // Then sync from DB
      setTimeout(() => _loadSolvesFromDb(), 1000);
    }

    if (event === 'SIGNED_OUT') {
      _titleToUuid = {};
      _uuidToId    = {};
      _setSolved({});
      if (typeof updateCTFStats === 'function') updateCTFStats();
      if (typeof ctfRender      === 'function') ctfRender();
    }
  });
})();
