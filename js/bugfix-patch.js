/* ═══════════════════════════════════════════════════════════════
   bugfix-patch.js  —  AlexCyberX
   
   2 bugs fix karta hai:
   1. Profile page pe data nahi dikhta (race condition)
   2. Logout/login ke baad CTF solves reset (sync timing bug)
   
   HOW TO USE:
   index.html mein profile.js aur auth.js ke BAAD add karo:
   <script src="js/bugfix-patch.js"></script>
═══════════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────────────
   BUG 1 FIX: Profile page race condition
   
   Problem: initProfilePage() call hota hai jab page show hota hai,
   lekin kabhi kabhi window._currentUser abhi null hota hai kyunki
   Supabase auth async hai. Profile page blank dikhta hai.
   
   Fix: initProfilePage mein retry logic add karo — agar user null
   hai toh 100ms baad dobara try karo, max 20 baar (2 seconds).
────────────────────────────────────────────────────────────────*/
(function patchInitProfilePage() {
  // Wait for profile.js to load
  const _waitForProfile = setInterval(() => {
    if (typeof initProfilePage !== 'function') return;
    clearInterval(_waitForProfile);

    const _origInit = window.initProfilePage;

    window.initProfilePage = function() {
      // Agar user already available hai toh seedha call karo
      if (window._currentUser && window._supabase) {
        return _origInit.apply(this, arguments);
      }

      // User abhi load nahi hua — retry karo
      let retries = 0;
      const MAX_RETRIES = 25; // 2.5 seconds max wait

      const _retry = setInterval(() => {
        retries++;
        if (window._currentUser && window._supabase) {
          clearInterval(_retry);
          _origInit.apply(this, arguments);
        } else if (retries >= MAX_RETRIES) {
          clearInterval(_retry);
          console.warn('[Profile] User still null after 2.5s — giving up');
        }
      }, 100);
    };

    console.log('[ACX Fix] initProfilePage patched with retry logic');
  }, 50);
})();


/* ──────────────────────────────────────────────────────────────
   BUG 2 FIX: CTF solves reset on logout/login
   
   Problem: syncSolvedFromSupabase() ctf_solves table se data fetch
   karta hai lekin _ctfSlugToUuid map pe depend karta hai. Ye map
   async load hota hai. Agar map ready nahi hua toh freshSolved {}
   (empty) ban jaata hai aur saare solves wipe ho jaate hain.
   
   Fix: syncSolvedFromSupabase ko patch karo — pehle ensure karo ki
   UUID map fully loaded hai, phir sync karo. Agar map empty rahe
   toh ctfSolved ko wipe mat karo.
────────────────────────────────────────────────────────────────*/
(function patchSyncSolved() {
  const _waitForSync = setInterval(() => {
    if (typeof syncSolvedFromSupabase !== 'function') return;
    clearInterval(_waitForSync);

    window.syncSolvedFromSupabase = async function() {
      if (!window._supabase || !window._currentUser) return;

      try {
        // Step 1: UUID map load karo (force reload on fresh login)
        // _ctfSlugToUuid reset karo taki purana user ka stale map na rahe
        if (typeof _ctfSlugToUuid !== 'undefined') {
          window._ctfSlugToUuid = {};
        }
        if (typeof loadCTFUuids === 'function') {
          await loadCTFUuids();
        }

        // Step 2: Supabase se solved challenges fetch karo
        const { data, error } = await window._supabase
          .from('ctf_solves')
          .select('challenge_id, points_earned')
          .eq('user_id', window._currentUser.id)
          .eq('correct', true);

        if (error) {
          console.warn('[CTF Sync] Fetch error:', error.message);
          return;
        }

        if (!data || data.length === 0) {
          // User ne koi challenge solve nahi kiya — legitimately empty
          window.ctfSolved = {};
          if (typeof saveCTFSolvedToStorage === 'function') saveCTFSolvedToStorage();
          if (typeof updateCTFStats === 'function') updateCTFStats();
          if (typeof ctfRender === 'function') ctfRender();
          return;
        }

        // Step 3: UUID → slug reverse map banao
        const slugMap = {};
        if (typeof _ctfSlugToUuid !== 'undefined') {
          Object.entries(_ctfSlugToUuid).forEach(([slug, uuid]) => {
            slugMap[uuid] = slug;
          });
        }

        // Step 4: UUID map empty hai? Tab bhi solve dikho by challenge_id directly
        const freshSolved = {};
        let unmatchedCount = 0;

        data.forEach(row => {
          const slug = slugMap[row.challenge_id];
          if (slug) {
            freshSolved[slug] = {
              xp: row.points_earned || 0,
              solvedAt: null
            };
          } else {
            // UUID map mein nahi mila — challenge_id ko key bana do (fallback)
            freshSolved[row.challenge_id] = {
              xp: row.points_earned || 0,
              solvedAt: null
            };
            unmatchedCount++;
          }
        });

        // Step 5: SAFETY CHECK — agar sab unmatched hain toh UUID map issue hai
        // Is case mein ctfSolved ko wipe mat karo
        if (unmatchedCount === data.length && data.length > 0) {
          console.warn('[CTF Sync] UUID map empty/mismatched — retrying once');
          // One more retry with fresh UUID load
          window._ctfSlugToUuid = {};
          if (typeof loadCTFUuids === 'function') await loadCTFUuids();

          // Retry mapping
          const retrySlugMap = {};
          Object.entries(window._ctfSlugToUuid || {}).forEach(([slug, uuid]) => {
            retrySlugMap[uuid] = slug;
          });

          data.forEach(row => {
            const slug = retrySlugMap[row.challenge_id];
            if (slug) {
              freshSolved[slug] = { xp: row.points_earned || 0, solvedAt: null };
              delete freshSolved[row.challenge_id]; // remove UUID-keyed entry
            }
          });
        }

        window.ctfSolved = freshSolved;
        if (typeof saveCTFSolvedToStorage === 'function') saveCTFSolvedToStorage();
        if (typeof updateCTFStats === 'function') updateCTFStats();
        if (typeof ctfRender === 'function') ctfRender();

        console.log('[CTF Sync] Synced', Object.keys(freshSolved).length, 'solves from Supabase');

      } catch(e) {
        console.warn('[CTF Sync] Error:', e);
        // Error pe ctfSolved wipe mat karo — existing state rakho
      }
    };

    console.log('[ACX Fix] syncSolvedFromSupabase patched');
  }, 50);
})();


/* ──────────────────────────────────────────────────────────────
   BUG 3 FIX: loadCTFUuids() logout pe reset nahi hota
   
   Problem: _ctfSlugToUuid ek module-level variable hai.
   Logout ke baad ye populated rehta hai (purane user ka data).
   Fresh login pe loadCTFUuids() early return kar deta hai
   (Object.keys length > 0 check) — toh naya UUID map load nahi hota.
   
   Fix: auth.js ke SIGNED_OUT event pe _ctfSlugToUuid reset karo.
────────────────────────────────────────────────────────────────*/
(function patchLogoutUuidReset() {
  // Listen for Supabase auth state change
  const _waitForSupabase = setInterval(() => {
    if (!window._supabase) return;
    clearInterval(_waitForSupabase);

    window._supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        // UUID map reset karo taaki next login fresh load kare
        if (typeof _ctfSlugToUuid !== 'undefined') {
          window._ctfSlugToUuid = {};
        }
        console.log('[ACX Fix] UUID map cleared on logout');
      }
    });
  }, 100);
})();
