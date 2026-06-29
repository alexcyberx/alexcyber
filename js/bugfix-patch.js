/* ═══════════════════════════════════════════════════════════════
   bugfix-patch.js — AlexCyberX v76
   Clean rewrite — single source of truth for CTF sync
═══════════════════════════════════════════════════════════════ */

/* ── User-specific localStorage key ── */
function _acxKey(uid) {
  return uid ? 'acx_ctf_solved_u_' + uid : 'acx_ctf_solved';
}
function _uid() {
  return window._currentUser?.id || null;
}

/* ══════════════════════════════════════════════════════════════
   CORE: UUID map — shared on window so all functions use same ref
══════════════════════════════════════════════════════════════ */
window._ctfSlugToUuid = window._ctfSlugToUuid || {};

async function _loadUuidMap() {
  if (!window._supabase) return;
  try {
    const { data, error } = await window._supabase
      .from('ctf_challenges')
      .select('id, title, status');

    if (error || !data || !data.length) {
      console.warn('[ACX] ctf_challenges fetch failed:', error?.message);
      return;
    }

    window._ctfSlugToUuid = {};

    // Pass 1: slug → uuid (DB slug column, exact match with JS c.id like 'web-01')
    data.forEach(r => {
      if (r.slug) window._ctfSlugToUuid[r.slug] = r.id;
    });

    // Pass 2: JS c.id → uuid via title match (for any that didn't match by slug)
    if (window.CTF_CHALLENGES) {
      window.CTF_CHALLENGES.forEach(c => {
        if (window._ctfSlugToUuid[c.id]) return; // already mapped
        const match = data.find(r => r.title === c.title);
        if (match) window._ctfSlugToUuid[c.id] = match.id;
      });
    }

    // Pass 3: title → uuid (fallback for leaderboard/display, not for solve tracking)
    data.forEach(r => {
      if (r.title && !window._ctfSlugToUuid[r.title]) {
        window._ctfSlugToUuid[r.title] = r.id;
      }
    });

    console.log('[ACX] UUID map loaded:', Object.keys(window._ctfSlugToUuid).length, 'entries');
    if (typeof ctfRender === 'function') ctfRender();
  } catch(e) {
    console.warn('[ACX] _loadUuidMap error:', e);
  }
}

/* ══════════════════════════════════════════════════════════════
   CORE: Push local solves to Supabase profiles table
══════════════════════════════════════════════════════════════ */
async function _pushProfileToSupabase() {
  if (!window._supabase || !window._currentUser) return;
  try {
    const solved  = window.ctfSolved || {};
    const keys    = Object.keys(solved).filter(k => solved[k] != null);
    const totalXP = keys.reduce((s, k) => s + (solved[k]?.xp || 0), 0);
    const count   = keys.length;
    const level   = Math.max(1, Math.floor(totalXP / 500) + 1);

    await window._supabase
      .from('profiles')
      .update({ xp: totalXP, level, ctf_solves: count, last_seen: new Date().toISOString() })
      .eq('id', window._currentUser.id);

    console.log('[ACX] Profile synced — XP:', totalXP, 'Solves:', count);
  } catch(e) {
    console.warn('[ACX] _pushProfileToSupabase error:', e);
  }
}

/* ══════════════════════════════════════════════════════════════
   CORE: Sync from Supabase — safe, never wipes on failure
══════════════════════════════════════════════════════════════ */
let _syncInProgress = false;

async function _syncFromSupabase(userId) {
  if (!window._supabase || !userId) return;
  if (_syncInProgress) return;
  _syncInProgress = true;

  try {
    // Step 1: Ensure UUID map is loaded
    if (Object.keys(window._ctfSlugToUuid).length === 0) {
      await _loadUuidMap();
    }

    // Step 2: Fetch user's solves
    const { data, error } = await window._supabase
      .from('ctf_solves')
      .select('challenge_id')
      .eq('user_id', userId);

    if (error) {
      console.warn('[ACX] ctf_solves fetch error:', error.message);
      return;
    }

    if (!data || data.length === 0) {
      // No DB records — push local if we have any
      const localCount = Object.keys(window.ctfSolved || {}).length;
      if (localCount > 0) await _pushProfileToSupabase();
      return;
    }

    // Step 3: Build reverse map UUID → slug
    // Priority: short slug (like 'web-01') over title (like 'Hidden in Plain Sight')
    // because ctfSolved uses c.id which matches the short slug format
    const reverseMap = {};
    const jsIds = new Set((window.CTF_CHALLENGES || []).map(c => c.id));
    // First pass: only map JS c.id slugs (like 'web-01')
    Object.entries(window._ctfSlugToUuid).forEach(([slug, uuid]) => {
      if (jsIds.has(slug)) reverseMap[uuid] = slug;
    });
    // Second pass: fill gaps with title-based keys (fallback only)
    Object.entries(window._ctfSlugToUuid).forEach(([slug, uuid]) => {
      if (!reverseMap[uuid]) reverseMap[uuid] = slug;
    });

    // Step 4: Build dbSolved from Supabase data
    const dbSolved = {};
    data.forEach(row => {
      const slug = reverseMap[row.challenge_id];
      if (slug) {
        dbSolved[slug] = { xp: 0, solvedAt: null };
      }
    });

    const dbCount    = Object.keys(dbSolved).length;
    const localCount = Object.keys(window.ctfSolved || {}).length;

    console.log('[ACX] Sync — DB solves:', dbCount, '| Local solves:', localCount);

    if (dbCount >= localCount && dbCount > 0) {
      // DB has same or more — use DB as truth
      window.ctfSolved = dbSolved;
      try {
        localStorage.setItem(_acxKey(userId), JSON.stringify(dbSolved));
        localStorage.setItem('acx_ctf_solved', JSON.stringify(dbSolved));
      } catch(e) {}
      if (typeof updateCTFStats === 'function') updateCTFStats();
      if (typeof ctfRender      === 'function') ctfRender();
      console.log('[ACX] Loaded', dbCount, 'solves from DB');
    } else if (localCount > dbCount) {
      // Local has more — push to profile
      console.log('[ACX] Local ahead — pushing to profile');
      await _pushProfileToSupabase();
    }

  } catch(e) {
    console.warn('[ACX] _syncFromSupabase error:', e);
  } finally {
    _syncInProgress = false;
  }
}

/* ══════════════════════════════════════════════════════════════
   OVERRIDE: loadCTFUuids — use shared window map
══════════════════════════════════════════════════════════════ */
(function patchLoadCTFUuids() {
  const _wait = setInterval(() => {
    if (typeof loadCTFUuids !== 'function') return;
    clearInterval(_wait);
    window.loadCTFUuids = _loadUuidMap;
    console.log('[ACX] BUG-05 fixed: loadCTFUuids slug-based');
  }, 50);
})();

/* ══════════════════════════════════════════════════════════════
   OVERRIDE: syncSolvedFromSupabase — use new safe sync
══════════════════════════════════════════════════════════════ */
(function patchSyncSolved() {
  const _wait = setInterval(() => {
    if (typeof syncSolvedFromSupabase !== 'function') return;
    clearInterval(_wait);
    window.syncSolvedFromSupabase = async function() {
      const uid = _uid();
      if (uid) await _syncFromSupabase(uid);
    };
    console.log('[ACX] BUG-08 fixed: syncSolvedFromSupabase non-destructive');
  }, 50);
})();

/* ══════════════════════════════════════════════════════════════
   OVERRIDE: saveCTFSolvedToStorage — save to user-specific key
══════════════════════════════════════════════════════════════ */
(function patchSaveStorage() {
  const _wait = setInterval(() => {
    if (typeof saveCTFSolvedToStorage !== 'function') return;
    clearInterval(_wait);
    window.saveCTFSolvedToStorage = async function() {
      try {
        const uid     = _uid();
        const payload = JSON.stringify(window.ctfSolved || {});
        if (uid) localStorage.setItem(_acxKey(uid), payload);
        localStorage.setItem('acx_ctf_solved', payload);
      } catch(e) {}
      await _pushProfileToSupabase();
    };
    console.log('[ACX] BUG-02+03 fixed: user-isolated storage active');
  }, 50);
})();

/* ══════════════════════════════════════════════════════════════
   OVERRIDE: loadCTFSolvedFromStorage — load user-specific key
══════════════════════════════════════════════════════════════ */
(function patchLoadStorage() {
  const _wait = setInterval(() => {
    if (typeof loadCTFSolvedFromStorage !== 'function') return;
    clearInterval(_wait);
    window.loadCTFSolvedFromStorage = function() {
      try {
        const uid = _uid();
        if (uid) {
          const raw = localStorage.getItem(_acxKey(uid));
          if (raw) {
            window.ctfSolved = JSON.parse(raw);
            localStorage.setItem('acx_ctf_solved', raw);
            return;
          }
        }
        window.ctfSolved = {};
      } catch(e) { window.ctfSolved = {}; }
    };
  }, 50);
})();

/* ══════════════════════════════════════════════════════════════
   OVERRIDE: refreshCTFSolvedForCurrentUser — load local first,
   then sync from DB in background
══════════════════════════════════════════════════════════════ */
(function patchRefreshCTF() {
  const _wait = setInterval(() => {
    if (typeof refreshCTFSolvedForCurrentUser !== 'function') return;
    clearInterval(_wait);
    window.refreshCTFSolvedForCurrentUser = function() {
      const uid = _uid();

      // Step 1: Load local data instantly
      try {
        if (uid) {
          const raw = localStorage.getItem(_acxKey(uid));
          if (raw) {
            window.ctfSolved = JSON.parse(raw);
            localStorage.setItem('acx_ctf_solved', raw);
          } else {
            window.ctfSolved = {};
          }
        } else {
          window.ctfSolved = {};
        }
        if (typeof updateCTFStats === 'function') updateCTFStats();
        if (typeof ctfRender      === 'function') ctfRender();
      } catch(e) { window.ctfSolved = {}; }

      // Step 2: Background DB sync
      if (uid && window._supabase) {
        setTimeout(() => _syncFromSupabase(uid), 1000);
      }
    };
    console.log('[ACX] BUG-04 fixed: refreshCTFSolvedForCurrentUser');
  }, 50);
})();

/* ══════════════════════════════════════════════════════════════
   OVERRIDE: submitCTFFlag — pre-load UUID map before submit
══════════════════════════════════════════════════════════════ */
(function patchSubmitFlag() {
  const _wait = setInterval(() => {
    if (typeof submitCTFFlag !== 'function') return;
    clearInterval(_wait);
    const _orig = window.submitCTFFlag;
    window.submitCTFFlag = async function() {
      if (window._supabase && Object.keys(window._ctfSlugToUuid).length === 0) {
        await _loadUuidMap();
      }
      return _orig.apply(this, arguments);
    };
    console.log('[ACX] BUG-06 fixed: UUID pre-load on submit');
  }, 100);
})();

/* ══════════════════════════════════════════════════════════════
   OVERRIDE: getChallengeUuid — use shared window map
══════════════════════════════════════════════════════════════ */
(function patchGetChallengeUuid() {
  const _wait = setInterval(() => {
    if (typeof getChallengeUuid !== 'function') return;
    clearInterval(_wait);
    window.getChallengeUuid = function(slugOrId) {
      return window._ctfSlugToUuid[slugOrId] || null;
    };
  }, 50);
})();

/* ══════════════════════════════════════════════════════════════
   OVERRIDE: initProfilePage — race condition fix
══════════════════════════════════════════════════════════════ */
(function patchInitProfile() {
  const _wait = setInterval(() => {
    if (typeof initProfilePage !== 'function') return;
    clearInterval(_wait);
    const _orig = window.initProfilePage;
    window.initProfilePage = function() {
      if (window._currentUser && window._supabase) {
        return _orig.apply(this, arguments);
      }
      let tries = 0;
      const _r = setInterval(() => {
        tries++;
        if (window._currentUser && window._supabase) {
          clearInterval(_r);
          _orig.apply(this, arguments);
        } else if (tries >= 40) {
          clearInterval(_r);
        }
      }, 100);
    };
    console.log('[ACX] BUG-01 fixed: initProfilePage race condition');
  }, 50);
})();

/* ══════════════════════════════════════════════════════════════
   OVERRIDE: showPage — reset profile cache on visit
══════════════════════════════════════════════════════════════ */
(function patchShowPage() {
  const _wait = setInterval(() => {
    if (typeof showPage !== 'function') return;
    clearInterval(_wait);
    const _orig = window.showPage;
    window.showPage = function(page, skipPush) {
      _orig.call(this, page, skipPush);
      if (page === 'profile') {
        window._pfLbLoaded     = false;
        window._pfNotifsLoaded = false;
        window._pfInitRunning  = false;
      }
    };
    console.log('[ACX] BUG-09 fixed: profile cache reset on visit');
  }, 50);
})();

/* ══════════════════════════════════════════════════════════════
   OVERRIDE: pfShowTab — reset tabs on switch
══════════════════════════════════════════════════════════════ */
(function patchPfShowTab() {
  const _wait = setInterval(() => {
    if (typeof pfShowTab !== 'function') return;
    clearInterval(_wait);
    const _orig = window.pfShowTab;
    window.pfShowTab = function(tab) {
      if (tab === 'notifications') window._pfNotifsLoaded = false;
      if (tab === 'leaderboard')   window._pfLbLoaded     = false;
      return _orig.apply(this, arguments);
    };
    console.log('[ACX] BUG-13 fixed: notification tab refresh');
  }, 100);
})();

/* ══════════════════════════════════════════════════════════════
   AUTH EVENTS: Login → sync from DB, Logout → preserve keys
══════════════════════════════════════════════════════════════ */
(function patchAuthEvents() {
  const _wait = setInterval(() => {
    if (!window._supabase) return;
    clearInterval(_wait);

    window._supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const uid = session.user?.id;
        if (!uid) return;

        // Load local data immediately
        try {
          const raw = localStorage.getItem(_acxKey(uid));
          if (raw) {
            window.ctfSolved = JSON.parse(raw);
            localStorage.setItem('acx_ctf_solved', raw);
            if (typeof updateCTFStats === 'function') updateCTFStats();
            if (typeof ctfRender      === 'function') ctfRender();
          }
        } catch(e) {}

        // Background DB sync after slight delay
        setTimeout(() => _syncFromSupabase(uid), 1500);
      }

      if (event === 'SIGNED_OUT') {
        window._ctfSlugToUuid = {};
        window.ctfSolved = {};
        try { localStorage.removeItem('acx_ctf_solved'); } catch(e) {}
        // NOTE: user-specific keys (_acxKey) are never deleted
      }
    });

    console.log('[ACX] Auth event handlers patched');
  }, 100);
})();

/* ══════════════════════════════════════════════════════════════
   INIT: Pre-load UUID map as early as possible
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  console.log('[ACX] bugfix-patch.js loaded');
  setTimeout(() => {
    if (window._supabase) _loadUuidMap();
  }, 300);
});
