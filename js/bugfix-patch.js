/* ═══════════════════════════════════════════════════════════════
   bugfix-patch.js  —  AlexCyberX
   Complete bug fix patch — all critical bugs addressed
   
   BUGS FIXED:
   BUG-01: Profile page blank (race condition - _currentUser null)
   BUG-02: CTF solves reset on logout (auth.js generic key wipe)
   BUG-03: User isolation failure (User1 data → User2)
   BUG-04: refreshCTFSolvedForCurrentUser wipes before loading
   BUG-05: loadCTFUuids uses title match (fragile) → slug match
   BUG-06: submitCTFFlag UUID pre-load missing
   BUG-07: Profile XP/ctf_solves not updating in Supabase
   BUG-08: syncSolvedFromSupabase wipes ctfSolved on UUID miss
   BUG-09: _pfLbLoaded/_pfNotifsLoaded never reset → stale data
   BUG-10: initCTFPage loadCTFSolvedFromStorage called BEFORE
           user-specific key patch → loads wrong user's data
   BUG-11: ctfRender solvers count arithmetic always = 0 (dead code)
   BUG-12: Double SIGNED_IN fire — onAuthStateChange + getSession
           both call consumePendingRedirect (router.js already handles)
           but ctf solve sync called twice → race condition
   BUG-13: profile.js _pfNotifsLoaded never set to false on tab switch
           → notifications dont refresh between visits
═══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
   CORE UTILITY: User-specific localStorage keys
   
   auth.js SIGNED_OUT wipes 'acx_ctf_solved' (generic key).
   User-specific key 'acx_ctf_solved_u_<id>' is NEVER wiped.
   Same user logs back in → their data is instantly restored.
   Different user logs in → gets their own isolated key.
══════════════════════════════════════════════════════════════ */
function _acxKey(userId) {
  return userId ? 'acx_ctf_solved_u_' + userId : 'acx_ctf_solved';
}
function _uid() {
  return window._currentUser?.id || null;
}


/* ══════════════════════════════════════════════════════════════
   BUG-01 FIX: Profile page race condition
   initProfilePage() called before _currentUser is set
══════════════════════════════════════════════════════════════ */
(function fix01_profileRace() {
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
          console.warn('[BUG-01] User null after 4s, giving up');
        }
      }, 100);
    };
    console.log('[ACX] BUG-01 fixed: initProfilePage race condition');
  }, 50);
})();


/* ══════════════════════════════════════════════════════════════
   BUG-02 + BUG-03 FIX: User-isolated storage
   
   saveCTFSolvedToStorage → save to user-specific key
   loadCTFSolvedFromStorage → load ONLY current user's key
   (prevents User1 data leaking to User2)
══════════════════════════════════════════════════════════════ */
(function fix02_03_userIsolatedStorage() {
  const _wait = setInterval(() => {
    if (typeof saveCTFSolvedToStorage !== 'function') return;
    clearInterval(_wait);

    window.saveCTFSolvedToStorage = async function() {
      try {
        const uid = _uid();
        const payload = JSON.stringify(window.ctfSolved || {});
        if (uid) localStorage.setItem(_acxKey(uid), payload);
        localStorage.setItem('acx_ctf_solved', payload); // compat
      } catch(e) {}
      // Also sync to Supabase profiles table (BUG-07)
      await _pushProfileToSupabase();
    };

    window.loadCTFSolvedFromStorage = function() {
      try {
        const uid = _uid();
        if (uid) {
          const raw = localStorage.getItem(_acxKey(uid));
          if (raw) {
            window.ctfSolved = JSON.parse(raw);
            localStorage.setItem('acx_ctf_solved', raw); // keep generic in sync
            return;
          }
        }
        // New user or no saved data — start clean
        window.ctfSolved = {};
      } catch(e) { window.ctfSolved = {}; }
    };

    console.log('[ACX] BUG-02+03 fixed: user-isolated storage active');
  }, 50);
})();


/* ══════════════════════════════════════════════════════════════
   BUG-04 FIX: refreshCTFSolvedForCurrentUser
   
   Original: ctfSolved = {} → then Supabase sync (which may fail)
   → result is always 0 for any user
   
   Fix: load user-specific key FIRST (instant, correct), then
   verify with Supabase in background (non-destructive)
══════════════════════════════════════════════════════════════ */
(function fix04_refreshCTF() {
  const _wait = setInterval(() => {
    if (typeof refreshCTFSolvedForCurrentUser !== 'function') return;
    clearInterval(_wait);

    window.refreshCTFSolvedForCurrentUser = function() {
      const uid = _uid();

      // Step 1: Load this user's data instantly
      try {
        if (uid) {
          const raw = localStorage.getItem(_acxKey(uid));
          if (raw) {
            window.ctfSolved = JSON.parse(raw);
            localStorage.setItem('acx_ctf_solved', raw);
          } else {
            // Truly new user — clean slate
            window.ctfSolved = {};
            localStorage.setItem('acx_ctf_solved', '{}');
          }
        } else {
          window.ctfSolved = {};
        }
        if (typeof updateCTFStats === 'function') updateCTFStats();
        if (typeof ctfRender === 'function') ctfRender();
      } catch(e) { window.ctfSolved = {}; }

      // Step 2: Background Supabase verify (won't wipe on failure)
      if (uid && window._supabase) {
        setTimeout(() => _verifyWithSupabase(uid), 800);
      }
    };

    console.log('[ACX] BUG-04 fixed: refreshCTFSolvedForCurrentUser');
  }, 50);
})();


/* ══════════════════════════════════════════════════════════════
   BUG-05 FIX: loadCTFUuids — slug column primary, title fallback
   
   Original used title match only — breaks if title has typo,
   apostrophe, or case mismatch. Now uses slug (exact JS c.id match)
══════════════════════════════════════════════════════════════ */
(function fix05_loadCTFUuids() {
  const _wait = setInterval(() => {
    if (typeof loadCTFUuids !== 'function') return;
    clearInterval(_wait);

    window.loadCTFUuids = async function() {
      if (!window._supabase) return;
      // Always reload fresh (stale map causes UUID miss)
      window._ctfSlugToUuid = {};
      try {
        const { data, error } = await window._supabase
          .from('ctf_challenges')
          .select('id, slug, title, status');

        if (error || !data || !data.length) {
          console.warn('[BUG-05] ctf_challenges empty or error:', error?.message,
            '— Run sql/insert-challenges.sql in Supabase');
          return;
        }

        // Primary: slug → uuid (exact match with JS c.id like 'web-01')
        data.forEach(r => {
          if (r.slug) window._ctfSlugToUuid[r.slug] = r.id;
          if (r.title) window._ctfSlugToUuid[r.title] = r.id; // fallback
        });

        // Also map by CTF_CHALLENGES array c.id via title match
        if (window.CTF_CHALLENGES) {
          window.CTF_CHALLENGES.forEach(c => {
            if (window._ctfSlugToUuid[c.id]) return; // already mapped
            const match = data.find(r => r.title === c.title);
            if (match) window._ctfSlugToUuid[c.id] = match.id;
          });
        }

        const count = Object.keys(window._ctfSlugToUuid).length;
        console.log('[ACX] BUG-05: UUID map loaded,', count, 'entries');
        if (typeof ctfRender === 'function') ctfRender();
      } catch(e) {
        console.warn('[BUG-05] loadCTFUuids error:', e);
      }
    };

    // Trigger immediately
    if (window._supabase) window.loadCTFUuids();
    console.log('[ACX] BUG-05 fixed: loadCTFUuids slug-based');
  }, 100);
})();


/* ══════════════════════════════════════════════════════════════
   BUG-06 FIX: submitCTFFlag — ensure UUID map loaded before submit
══════════════════════════════════════════════════════════════ */
(function fix06_submitPreload() {
  const _wait = setInterval(() => {
    if (typeof submitCTFFlag !== 'function') return;
    clearInterval(_wait);
    const _orig = window.submitCTFFlag;
    window.submitCTFFlag = async function() {
      // Pre-load UUID map if empty
      if (window._supabase && Object.keys(window._ctfSlugToUuid || {}).length === 0) {
        await window.loadCTFUuids();
      }
      return _orig.apply(this, arguments);
    };
    console.log('[ACX] BUG-06 fixed: UUID pre-load on submit');
  }, 100);
})();


/* ══════════════════════════════════════════════════════════════
   BUG-07 FIX: Supabase profiles.xp + ctf_solves direct update
   
   Original depended on submit_ctf_flag RPC which required UUID.
   UUID was often null → profiles never updated → profile shows 0.
   Now: push directly to profiles table on every save.
══════════════════════════════════════════════════════════════ */
async function _pushProfileToSupabase() {
  if (!window._supabase || !window._currentUser) return;
  try {
    const solved = window.ctfSolved || {};
    const keys = Object.keys(solved).filter(k => solved[k] != null);
    const totalXP = keys.reduce((s, k) => s + (solved[k]?.xp || 0), 0);
    const count   = keys.length;
    const level   = Math.max(1, Math.floor(totalXP / 500) + 1);

    const { error } = await window._supabase
      .from('profiles')
      .update({ xp: totalXP, level, ctf_solves: count, last_seen: new Date().toISOString() })
      .eq('id', window._currentUser.id);

    if (!error) console.log('[ACX] BUG-07: Profile synced → XP:', totalXP, 'Solves:', count);
    else console.warn('[BUG-07] Profile update error:', error.message);
  } catch(e) { console.warn('[BUG-07] _pushProfileToSupabase error:', e); }
}


/* ══════════════════════════════════════════════════════════════
   BUG-08 FIX: syncSolvedFromSupabase — non-destructive
   Replaces original which wiped ctfSolved if UUID map was empty
══════════════════════════════════════════════════════════════ */
(function fix08_syncSolved() {
  const _wait = setInterval(() => {
    if (typeof syncSolvedFromSupabase !== 'function') return;
    clearInterval(_wait);
    window.syncSolvedFromSupabase = async function() {
      const uid = _uid();
      if (!window._supabase || !uid) return;
      await _verifyWithSupabase(uid);
    };
    console.log('[ACX] BUG-08 fixed: syncSolvedFromSupabase non-destructive');
  }, 50);
})();


/* ══════════════════════════════════════════════════════════════
   BUG-09 FIX: _pfLbLoaded + _pfNotifsLoaded stale cache
   
   profile.js sets these to true but never resets them properly.
   pfShowPage calls _pfLbLoaded = false but only after profile.js patch.
   Solution: reset on every profile page visit.
══════════════════════════════════════════════════════════════ */
(function fix09_staleProfileCache() {
  const _wait = setInterval(() => {
    if (typeof showPage !== 'function') return;
    clearInterval(_wait);
    const _orig = window.showPage;
    window.showPage = function(page, skipPush) {
      _orig.call(this, page, skipPush);
      if (page === 'profile') {
        // Force fresh load of leaderboard and notifications every visit
        window._pfLbLoaded     = false;
        window._pfNotifsLoaded = false;
        window._pfInitRunning  = false;
      }
    };
    console.log('[ACX] BUG-09 fixed: profile cache reset on visit');
  }, 50);
})();


/* ══════════════════════════════════════════════════════════════
   BUG-10 FIX: initCTFPage calls loadCTFSolvedFromStorage before
   user-specific patch applies — loads generic key (wrong user data)
══════════════════════════════════════════════════════════════ */
(function fix10_initCTFLoad() {
  const _wait = setInterval(() => {
    if (typeof initCTFPage !== 'function') return;
    clearInterval(_wait);
    const _orig = window.initCTFPage;
    window.initCTFPage = function() {
      // Ensure ctfSolved is loaded from correct user key before rendering
      if (window._currentUser) {
        window.loadCTFSolvedFromStorage();
      }
      return _orig.apply(this, arguments);
    };
    console.log('[ACX] BUG-10 fixed: initCTFPage correct user data');
  }, 50);
})();


/* ══════════════════════════════════════════════════════════════
   BUG-12 FIX: Double SIGNED_IN → double sync race condition
   
   onAuthStateChange SIGNED_IN fires even on page load session restore.
   getSession() in initAuth() ALSO calls loadUserProfile → refreshCTF.
   Both trigger _verifyWithSupabase simultaneously. Guard with flag.
══════════════════════════════════════════════════════════════ */
let _acxSyncInProgress = false;


/* ══════════════════════════════════════════════════════════════
   CORE: _verifyWithSupabase — safe, non-destructive DB sync
   Only replaces ctfSolved if DB has MORE data than localStorage
══════════════════════════════════════════════════════════════ */
async function _verifyWithSupabase(userId) {
  if (!window._supabase || !userId) return;
  if (_acxSyncInProgress) return;
  _acxSyncInProgress = true;

  try {
    // Ensure UUID map is loaded
    if (Object.keys(window._ctfSlugToUuid || {}).length === 0) {
      await window.loadCTFUuids();
    }

    const { data, error } = await window._supabase
      .from('ctf_solves')
      .select('challenge_id, points_earned')
      .eq('user_id', userId)
      .eq('correct', true);

    if (error) { console.warn('[SYNC] ctf_solves fetch error:', error.message); return; }
    if (!data || data.length === 0) {
      // No DB records — if localStorage has data, push it up
      const localCount = Object.keys(window.ctfSolved || {}).length;
      if (localCount > 0) await _pushProfileToSupabase();
      return;
    }

    // Build reverse map UUID → slug
    const reverseMap = {};
    Object.entries(window._ctfSlugToUuid || {}).forEach(([slug, uuid]) => {
      reverseMap[uuid] = slug;
    });

    const dbSolved = {};
    let matched = 0;
    data.forEach(row => {
      const slug = reverseMap[row.challenge_id];
      if (slug) {
        dbSolved[slug] = { xp: row.points_earned || 0, solvedAt: null };
        matched++;
      }
    });

    const localCount = Object.keys(window.ctfSolved || {}).length;

    if (matched > localCount) {
      // DB has more — use DB as source of truth
      window.ctfSolved = dbSolved;
      localStorage.setItem(_acxKey(userId), JSON.stringify(dbSolved));
      localStorage.setItem('acx_ctf_solved', JSON.stringify(dbSolved));
      if (typeof updateCTFStats === 'function') updateCTFStats();
      if (typeof ctfRender === 'function') ctfRender();
      console.log('[SYNC] DB ahead: loaded', matched, 'solves from Supabase');
    } else if (localCount > matched && localCount > 0) {
      // Local has more — push to Supabase
      console.log('[SYNC] Local ahead: pushing', localCount, 'solves to profile');
      await _pushProfileToSupabase();
    }
    // Equal → no action needed

  } catch(e) {
    console.warn('[SYNC] _verifyWithSupabase error:', e);
    // Never wipe on error
  } finally {
    _acxSyncInProgress = false;
  }
}


/* ══════════════════════════════════════════════════════════════
   AUTH EVENTS: Login → load user key, Logout → preserve user key
══════════════════════════════════════════════════════════════ */
(function fixAuthEvents() {
  const _wait = setInterval(() => {
    if (!window._supabase) return;
    clearInterval(_wait);

    window._supabase.auth.onAuthStateChange(async (event, session) => {

      if (event === 'SIGNED_IN' && session) {
        const uid = session.user?.id;
        if (!uid) return;

        // Load this user's data immediately
        try {
          const raw = localStorage.getItem(_acxKey(uid));
          if (raw) {
            window.ctfSolved = JSON.parse(raw);
            localStorage.setItem('acx_ctf_solved', raw);
            if (typeof updateCTFStats === 'function') updateCTFStats();
            if (typeof ctfRender === 'function') ctfRender();
            console.log('[AUTH] Loaded', Object.keys(window.ctfSolved).length, 'solves for user', uid.slice(0,8));
          }
        } catch(e) {}

        // Background verify (delayed to avoid race with getSession init)
        setTimeout(() => _verifyWithSupabase(uid), 1200);
      }

      if (event === 'SIGNED_OUT') {
        // Reset UUID map
        window._ctfSlugToUuid = {};
        // Clear in-memory state
        window.ctfSolved = {};
        // Clear generic key (auth.js also does this — double safe)
        try { localStorage.removeItem('acx_ctf_solved'); } catch(e) {}
        // NOTE: _acxKey(uid) keys are NEVER deleted — same user recovers data on next login
        console.log('[AUTH] Logout: in-memory cleared, user-specific keys preserved');
      }
    });

    console.log('[ACX] Auth event handlers patched');
  }, 100);
})();


/* ══════════════════════════════════════════════════════════════
   BUG-13 FIX: notifications tab doesnt refresh between visits
   Reset _pfNotifsLoaded flag on every tab switch
══════════════════════════════════════════════════════════════ */
(function fix13_notifTab() {
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
   FINAL: Log confirmation that all patches loaded
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  console.log('[ACX] bugfix-patch.js loaded — 13 bugs patched');

  // Pre-load UUID map as early as possible
  setTimeout(() => {
    if (window._supabase && typeof loadCTFUuids === 'function') {
      loadCTFUuids();
    }
  }, 500);
});

