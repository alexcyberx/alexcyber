/* ═══════════════════════════════════════════
   REAL CLIENT IP (cached) - used to record last_login_ip
   on the user's profile so admins can see it in Users tab.
═══════════════════════════════════════════ */
let _acxCachedClientIP = null;
async function acxGetClientIP() {
  if (_acxCachedClientIP) return _acxCachedClientIP;
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const json = await res.json();
    _acxCachedClientIP = json.ip || null;
  } catch (e) {
    _acxCachedClientIP = null;
  }
  return _acxCachedClientIP;
}

// Fire-and-forget: updates profiles.last_login_ip and last_seen for the
// given user. Never blocks login/signup on this - if it fails or the IP
// lookup times out, the user still gets in normally.
async function acxRecordLoginIP(userId) {
  if (!userId || !_supabase) return;
  try {
    const ip = await acxGetClientIP();
    const updates = { last_seen: new Date().toISOString() };
    if (ip) updates.last_login_ip = ip;
    await _supabase.from('profiles').update(updates).eq('id', userId);
  } catch (e) {
    console.error('[Auth] acxRecordLoginIP error:', e);
  }
}

/* ═══════════════════════════════════════════
   LIGHTWEIGHT XP TOAST
   Small self-contained popup, no dependency on
   admin panel's toast() which does not exist here.
═══════════════════════════════════════════ */
function _acxXpToast(message) {
  try {
    const el = document.createElement('div');
    el.textContent = message;
    el.style.cssText = [
      'position:fixed', 'bottom:24px', 'right:24px', 'z-index:99999',
      'background:#1a1a1f', 'color:#fff', 'border:1px solid rgba(239,68,68,0.4)',
      'padding:12px 18px', 'border-radius:10px', 'font-size:13px', 'font-weight:500',
      'box-shadow:0 8px 24px rgba(0,0,0,0.4)', 'opacity:0', 'transition:opacity .3s ease',
      'pointer-events:none'
    ].join(';');
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = '1'; });
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 350);
    }, 3200);
  } catch (e) {}
}

/* ═══════════════════════════════════════════
   SECURITY UTILITY - XSS Prevention
═══════════════════════════════════════════ */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}


/* ═══════════════════════════════════════════
   SESSION IDLE TIMEOUT - 30 min
═══════════════════════════════════════════ */
let _idleTimer = null;
const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function _resetIdleTimer() {
  if (!window._currentUser) return;
  clearTimeout(_idleTimer);
  _idleTimer = setTimeout(async () => {
    if (!window._currentUser) return;
    if (_supabase) await _supabase.auth.signOut();
    window._currentUser = null;
    updateNavForUser(null);
    showAuth('login');
    // Subtle notice
    setTimeout(() => authMsg('error','loginError','You were logged out after 30 minutes of inactivity.'), 300);
  }, IDLE_TIMEOUT);
}

// Track user activity
['click','keydown','touchstart','scroll'].forEach(evt =>
  document.addEventListener(evt, _resetIdleTimer, { passive: true })
);

/* ═══════════════════════════════════════════
   AUTH HELPERS
═══════════════════════════════════════════ */
// Pending redirect after login
window._pendingRedirect = null;

function showAuth(type, redirectAfter) {
  if (redirectAfter) {
    window._pendingRedirect = redirectAfter;
    try { sessionStorage.setItem('acx_pending_redirect', redirectAfter); } catch(e) {}
  }
  closeAuth();
  if (type === 'login')   { document.getElementById('loginOverlay').classList.add('active');  setTimeout(()=>{ const el=document.getElementById('loginEmail'); if(el)el.focus(); },80); }
  if (type === 'signup')  { document.getElementById('signupOverlay').classList.add('active'); setTimeout(()=>{ const el=document.getElementById('signupName'); if(el)el.focus(); },80); }
  if (type === 'forgot')  { document.getElementById('forgotOverlay').classList.add('active'); setTimeout(()=>{ const el=document.getElementById('forgotEmail'); if(el)el.focus(); },80); }
  if (type === 'profile') showPage('profile');
}
function closeAuth() {
  ['loginOverlay','signupOverlay','forgotOverlay'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
}

// Close on backdrop click
['loginOverlay','signupOverlay','forgotOverlay'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', function(e) { if (e.target === this) closeAuth(); });
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAuth(); });

// Toggle password visibility
function togglePw(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  btn.innerHTML = show
    ? '<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><ellipse cx="7.5" cy="7.5" rx="6" ry="4" stroke="#888" stroke-width="1.3"/><line x1="2" y1="2" x2="13" y2="13" stroke="#888" stroke-width="1.3" stroke-linecap="round"/></svg>'
    : '<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><ellipse cx="7.5" cy="7.5" rx="6" ry="4" stroke="#444" stroke-width="1.3"/><circle cx="7.5" cy="7.5" r="2" stroke="#444" stroke-width="1.3"/></svg>';
}

// Password strength
function checkStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const colors = ['','#e05050','#e08840','#d4c020','#3cb878'];
  const labels = ['','Weak','Fair','Good','Strong'];
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById('sb' + i);
    if (el) el.style.background = i <= score ? colors[score] : 'rgba(255,255,255,0.06)';
  }
  const txt = document.getElementById('strengthText');
  if (txt) { txt.textContent = pw.length ? labels[score] : ''; txt.style.color = colors[score] || '#444'; }
}

// Show message in auth forms
function authMsg(type, id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = type === 'error' ? 'auth-error show' : 'auth-success show';
}
function clearAuthMsg(ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.className = el.className.replace(' show', ''); }
  });
}

// Loading state on button
function setBtnLoading(btn, loading, label) {
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait...' : label;
}

/* ═══════════════════════════════════════════
   SUPABASE NOT CONFIGURED - friendly notice
═══════════════════════════════════════════ */
function warnNotConfigured(errId) {
  authMsg('error', errId,
    'Service not configured. Please contact the administrator.'
  );
}

/* ═══════════════════════════════════════════
   LOGIN (Email + Password)
═══════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   BRUTE FORCE PROTECTION
═══════════════════════════════════════════ */
const _rl = { n: 0, t: 0 };
function _checkRL(errId) {
  const now = Date.now();
  if (now - _rl.t > 60000) { _rl.n = 0; _rl.t = now; }
  _rl.n++;
  if (_rl.n > 5) {
    const wait = Math.ceil((60000 - (now - _rl.t)) / 1000);
    authMsg('error', errId, 'Too many attempts. Please wait ' + wait + ' seconds.');
    return false;
  }
  return true;
}

async function doLogin() {
  clearAuthMsg(['loginError']);
  if (!_checkRL('loginError')) return;
  const email = (document.getElementById('loginEmail').value || '').trim();
  const pw    =  document.getElementById('loginPassword').value || '';
  if (!email) { authMsg('error','loginError','Please enter your email address.'); return; }
  if (!pw)    { authMsg('error','loginError','Please enter your password.'); return; }

  if (!_supabase) { warnNotConfigured('loginError'); return; }

  const btn = document.querySelector('#loginOverlay .auth-btn');
  setBtnLoading(btn, true, 'Sign In');
  const { data, error } = await _supabase.auth.signInWithPassword({ email, password: pw });
  setBtnLoading(btn, false, 'Sign In');

  if (error) {
    const msg = 'Incorrect email or password.';
    authMsg('error', 'loginError', msg);
    return;
  }
  closeAuth();
  await loadUserProfile(data.user);
  // Handle pending redirect (e.g. course click → login → learn page)
  if (window._pendingRedirect) {
    const redirect = window._pendingRedirect;
    window._pendingRedirect = null;
    try { sessionStorage.removeItem('acx_pending_redirect'); } catch(e) {}
    showPage(redirect);
  }
}

/* ═══════════════════════════════════════════
   SIGNUP (Email + Password)
═══════════════════════════════════════════ */
async function doSignup() {
  clearAuthMsg(['signupError','signupSuccess']);
  const name  = (document.getElementById('signupName').value || '').trim();
  const email = (document.getElementById('signupEmail').value || '').trim();
  const pw    =  document.getElementById('signupPassword').value || '';
  const pw2   =  document.getElementById('signupConfirm').value || '';

  if (!name)  { authMsg('error','signupError','Please enter your name.'); return; }
  if (name.length > 60) { authMsg('error','signupError','Name must be 60 characters or less.'); return; }
  if (/<[^>]*>/.test(name)) { authMsg('error','signupError','Name cannot contain HTML or special tags.'); return; }
  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) { authMsg('error','signupError','Please enter a valid email address.'); return; }
  if (pw.length < 8) { authMsg('error','signupError','Password must be at least 8 characters.'); return; }
  if (pw !== pw2) { authMsg('error','signupError','Passwords do not match.'); return; }

  if (!_supabase) { warnNotConfigured('signupError'); return; }

  // Respect admin's "User Registration" toggle (Settings → Access Control)
  try {
    const { data: settings } = await _supabase.rpc('get_site_settings');
    if (settings && settings.user_registration === false) {
      authMsg('error', 'signupError', 'New sign-ups are currently disabled. Please check back later.');
      return;
    }
  } catch (e) { /* fail open, don't block signups because of a settings-check error */ }

  const btn = document.querySelector('#signupOverlay .auth-btn');
  setBtnLoading(btn, true, 'Create Account');
  const { data, error } = await _supabase.auth.signUp({
    email, password: pw,
    options: { data: { full_name: name, username: '', bio: '' } }
  });
  setBtnLoading(btn, false, 'Create Account');

  if (error) {
    const safeMsg = error.message.includes('already registered') ? 'Ye email already registered hai.' :
                    error.message.includes('Password') ? 'Password must be at least 8 characters.' :
                    'Could not create account. Please try again.';
    authMsg('error','signupError', safeMsg); return;
  }

  if (data.user && !data.session) {
    // Email confirmation required
    // authMsg uses .textContent - safe from XSS, but escape anyway for defence-in-depth
    authMsg('success','signupSuccess',
      'Account created! A confirmation email has been sent to ' + escapeHtml(email) + '. Please verify your email then sign in.');
    return;
  }
  // Auto confirmed
  authMsg('success','signupSuccess', 'Account created! Welcome, ' + escapeHtml(name) + '.');
  setTimeout(async () => {
    closeAuth();
    await loadUserProfile(data.user);
    // Safety-net: trigger handles profile creation, but if trigger is missing/delayed,
    // yeh upsert ensure karta hai ki profiles row exist kare before profile page load ho
    if (_supabase && data.user) {
      // FIX: ignoreDuplicates:true, sirf naye users ke liye insert karo.
      // Pehle onConflict:'id' bina ignoreDuplicates ke tha, matlab existing
      // user ke xp=0, level=1 se overwrite ho jaata tha har login pe.
      // Ab agar row pehle se exist kare toh kuch nahi karo (trigger handle karta hai).
      // FIX AU-BUG: .upsert(...).catch() Supabase JS v2 mein bina await/then ke
      // valid nahi hai, TypeError deta tha. Ab proper try-catch use kiya hai.
      try {
        await _supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: name,
          username: '',
          bio: '',
          xp: 0, level: 1, ctf_solves: 0, role: 'user'
        }, { onConflict: 'id', ignoreDuplicates: true });
      } catch (e) {
        console.warn('[Signup] Fallback profile upsert failed:', e.message);
      }
    }
    if (window._pendingRedirect) {
      const redirect = window._pendingRedirect;
      window._pendingRedirect = null;
      try { sessionStorage.removeItem('acx_pending_redirect'); } catch(e) {}
      showPage(redirect);
    }
  }, 1200);
}

/* ═══════════════════════════════════════════
   GOOGLE LOGIN
═══════════════════════════════════════════ */
async function doGoogleLogin() {
  if (!_supabase) {
    const id = document.querySelector('.auth-overlay.active') ?
      (document.getElementById('loginOverlay').classList.contains('active') ? 'loginError' : 'signupError') : 'loginError';
    warnNotConfigured(id);
    return;
  }
  // Security: Only allow redirect to same origin (prevent open redirect)
  const safeRedirect = window.location.origin + window.location.pathname;
  const { error } = await _supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: safeRedirect }
  });
  if (error) authMsg('error','loginError', error.message);
}

/* ═══════════════════════════════════════════
   FORGOT PASSWORD
═══════════════════════════════════════════ */
async function doForgot() {
  clearAuthMsg(['forgotError','forgotSuccess']);
  const email = (document.getElementById('forgotEmail').value || '').trim();
  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) { authMsg('error','forgotError','Please enter a valid email address.'); return; }

  if (!_supabase) { warnNotConfigured('forgotError'); return; }

  const btn = document.querySelector('#forgotOverlay .auth-btn');
  setBtnLoading(btn, true, 'Send Reset Link');
  const { error } = await _supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname + '?reset=1'
  });
  setBtnLoading(btn, false, 'Send Reset Link');

  if (error) { authMsg('error','forgotError', 'Could not send reset email. Please try again.'); return; }
  authMsg('success','forgotSuccess',
    'Password reset link sent to ' + escapeHtml(email) + '. Please check your email and click the link.');
}

/* ═══════════════════════════════════════════
   LOGOUT
═══════════════════════════════════════════ */
/* ═══════════════════════════════════════════
   CLEAR PROFILE FIELDS - call on logout / user switch
   Prevents stale data from a previous session leaking into
   the profile page when a different account logs in.
═══════════════════════════════════════════ */
function clearProfileFields() {
  const fieldsToClear = [
    'profileName', 'profileEmail', 'profileUsername', 'profileBio',
    'profileNewPw', 'profileConfirmPw'
  ];
  fieldsToClear.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  // Clear all display elements, prevents stale data leaking to next account
  // FIX: pehle sirf 4 elements clear hote the. pfBioDisplay, pfUsernameTag,
  // pfXP, pfLevel, pfRank, pfSolved, pfRemaining, pfBadges, pfFirstBloods
  // sab clear nahi hote the, Account A logout ke baad Account B login karte
  // hi profile page kholo toh initProfilePage chalane se pehle A ka data
  // briefly visible rehta tha (especially agar Supabase fetch slow ho).
  const textsToClear = [
    'profileAvatarBig', 'profileDisplayName', 'profileDisplayEmail',
    'profileMsg', 'pfBioDisplay', 'pfUsernameTag',
    'pfXP', 'pfLevel', 'pfRank',
    'pfSolved', 'pfRemaining', 'pfBadges', 'pfFirstBloods',
    'pfStreakCurrent', 'pfStreakLongest', 'pfXpBarPct', 'pfXpBarLabel'
  ];
  textsToClear.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  // Reset notification list (only visible panel now, others hidden)
  const pfNotifList = document.getElementById('pfNotifList');
  if (pfNotifList) pfNotifList.innerHTML = '<div class="pf-empty">-</div>';
  // Reset notification dot
  const pfNotifDot = document.getElementById('pfNotifDot');
  if (pfNotifDot) pfNotifDot.style.display = 'none';
}

async function doLogout() {
  if (_supabase) await _supabase.auth.signOut();
  window._currentUser = null;
  clearProfileFields();
  updateNavForUser(null);
  showPage('home');
}

/* ═══════════════════════════════════════════
   LOAD USER PROFILE from Supabase
═══════════════════════════════════════════ */
// Global user state - accessible from anywhere
window._currentUser = null;

async function loadUserProfile(authUser) {
  if (!authUser) {
    window._currentUser = null;
    updateNavForUser(null);
    refreshCTFSolvedForCurrentUser();
    return;
  }
  let profile = {
    email    : authUser.email,
    name     : authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
    username : authUser.user_metadata?.username  || '',
    bio      : authUser.user_metadata?.bio        || '',
    id       : authUser.id
  };
  // Try to get extended profile from profiles table if it exists
  if (_supabase) {
    const { data, error } = await _supabase.from('profiles').select('*').eq('id', authUser.id).single();
    if (data) {
      profile.name        = data.full_name   || profile.name;
      profile.username    = data.username    || profile.username;
      profile.bio         = data.bio         || profile.bio;
      // FIX JS-1: data.xp could be NULL if column was just added via ALTER TABLE
      // (existing rows get DEFAULT 0 but if trigger fired before column existed,
      // the row might have NULL). Use Number() to safely coerce null/undefined → 0.
      profile.xp          = Number(data.xp)          || 0;
      // FIX: profiles.level column DB mein stale ho sakta hai (purane
      // update paths mein XP toh badha par level column sync nahi hua).
      // Level ko hamesha live xp se compute karo, stored column pe trust
      // mat karo, yehi formula har jagah (RPC, ctf-sync.js) use hota hai.
      profile.level       = Math.max(1, Math.floor(profile.xp / 500) + 1);
      profile.ctf_solves  = Number(data.ctf_solves)  || 0;
    } else {
      // FIX: profiles row nahi mili (trigger fail hua ya old user before trigger)
      // Safety-net: row create karo taaki profile page aur XP system kaam kare
      // FIX AU-BUG: pehle .upsert(...).catch(() => {}) likha tha, Supabase JS v2
      // ka query builder .catch() ko directly support nahi karta jab tak await na ho
      // ya .then() se chain na ho. Ye TypeError throw karta tha aur poore getSession
      // flow ko crash kar deta tha, isliye profile kabhi set hi nahi hoti thi.
      if (!error || error.code === 'PGRST116') { // PGRST116 = no rows returned
        try {
          await _supabase.from('profiles').upsert({
            id: authUser.id,
            full_name: profile.name,
            username:  profile.username || '',
            bio:       profile.bio      || '',
            xp: 0, level: 1, ctf_solves: 0, role: 'user'
          }, { onConflict: 'id', ignoreDuplicates: true });
        } catch (e) {
          console.warn('[Auth] Fallback profile upsert failed:', e.message);
        }
      }
    }
  }
  updateNavForUser(profile);
  window._currentUser = profile;
  refreshCTFSolvedForCurrentUser();

  // Daily login XP: server-side RPC ensures only once per calendar day,
  // amount comes from admin's platform_settings.xp_rules (daily_login).
  // Fire-and-forget so it never blocks page render; UI just reflects the
  // new XP if/when it lands.
  if (_supabase) {
    _supabase.rpc('award_daily_login_xp').then(({ data, error }) => {
      if (error) { console.warn('[Auth] Daily login XP error:', error.message); return; }
      if (data && data.awarded && window._currentUser) {
        window._currentUser.xp    = Number(data.new_xp) || window._currentUser.xp;
        window._currentUser.level = Math.max(1, Math.floor((window._currentUser.xp || 0) / 500) + 1);
        updateNavForUser(window._currentUser);
        if (typeof _acxXpToast === 'function') _acxXpToast(`+${data.xp_gained} XP for logging in today!`);
      }
    }, () => {});
  }

  // Agar CTF page already active hai (e.g. /rooms direct open hua)
  // toh initCTFPage reinit karo kyunki pehle user null tha
  const ctfEl = document.getElementById('ctfPage');
  if (ctfEl && ctfEl.classList.contains('active')) {
    if (typeof initCTFPage === 'function') initCTFPage();
  }

  // Agar Profile page already active hai (e.g. /profile direct open hua)
  // toh initProfilePage reinit karo kyunki pehle user null tha
  const pfEl = document.getElementById('profilePage');
  if (pfEl && pfEl.classList.contains('active')) {
    if (typeof initProfilePage === 'function') initProfilePage();
  }
}

// CTF page's solved-state is namespaced by user id in localStorage (see ctf.html).
// loadUserProfile() resolves asynchronously, so if the CTF page already rendered
// with the wrong/empty bucket (e.g. guest, or a previous account), re-load and
// re-render once the real user id is known, this is what makes account switches
// inside the same tab/browser show correct solves without a manual refresh.
function refreshCTFSolvedForCurrentUser() {
  try {
    // FIX Bug 2: Pehle localStorage clear karo (purane user ka data na rahe)
    // Phir Supabase se fresh data lo, yahi cross-device sync karta hai
    ctfSolved = {};
    if (typeof updateCTFStats === 'function') updateCTFStats();
    if (typeof ctfRender === 'function') ctfRender();
    // Supabase se authoritative data fetch karo (async, non-blocking)
    if (typeof syncSolvedFromSupabase === 'function') {
      syncSolvedFromSupabase();
    } else {
      // Fallback: sirf localStorage (should not happen normally)
      if (typeof loadCTFSolvedFromStorage === 'function') loadCTFSolvedFromStorage();
      if (typeof ctfRender === 'function') ctfRender();
      if (typeof updateCTFStats === 'function') updateCTFStats();
    }
  } catch(e) {}
}

/* ═══════════════════════════════════════════
   UPDATE NAV (logged in / out)
═══════════════════════════════════════════ */
function updateNavForUser(user) {
  const loggedIn    = !!user;
  const initial     = user ? (user.name || user.email || 'U')[0].toUpperCase() : 'A';
  const displayName = user ? (user.name || (user.email || '').split('@')[0]) : '';

  const setDisplay = (id, show) => { const el = document.getElementById(id); if (el) el.style.display = show ? '' : 'none'; };
  const setText    = (id, txt)  => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  const toggleCls  = (id, cls, on) => { const el = document.getElementById(id); if (el) el.classList.toggle(cls, on); };

  setDisplay('navLoginBtn',  !loggedIn);
  setDisplay('navSignupBtn', !loggedIn);
  toggleCls('navAvatar', 'show', loggedIn);
  setText('navAvatarPic',  initial);
  setText('navAvatarName', displayName);

  setDisplay('lsnLoginBtn',  !loggedIn);
  setDisplay('lsnSignupBtn', !loggedIn);
  toggleCls('lsnAvatar', 'show', loggedIn);
  setText('lsnAvatarPic',  initial);
  setText('lsnAvatarName', displayName);

  // Mobile menu
  setDisplay('mobileAuthBtns', !loggedIn);
  setDisplay('mobileUserBtns',  loggedIn);

  if (loggedIn) {
    setText('profileAvatarBig',    initial);
    setText('profileDisplayName',  user.name     || 'User');
    setText('profileDisplayEmail', user.email    || '');
    setText('pfUsernameTag',       user.username ? '@' + user.username : '');
    setText('pfBioDisplay',        user.bio      || '');
    // CTF page My Stats button visibility
    if (typeof ctfUpdateMyStatsBtn === 'function') ctfUpdateMyStatsBtn();
    const fields = { profileName: user.name, profileEmail: user.email, profileUsername: user.username || '', profileBio: user.bio || '' };
    Object.entries(fields).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.value = val || ''; });
  } else {
    // User logged out, wipe all profile fields so no stale data shows
    // if a different account logs in next on the same tab
    if (typeof clearProfileFields === 'function') clearProfileFields();
  }
}

/* ═══════════════════════════════════════════
   SAVE PROFILE
═══════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
   PROFILE REAL-TIME VALIDATION HELPERS
══════════════════════════════════════════════════════════════ */
function pfShowFieldError(input, message) {
  input.style.borderColor = '#e06060';
  let err = input.parentNode.querySelector('.pf-field-error');
  if (!err) {
    err = document.createElement('div');
    err.className = 'pf-field-error';
    err.style.cssText = 'color:#e06060;font-size:12px;margin-top:4px;';
    input.parentNode.appendChild(err);
  }
  err.textContent = message;
}

function pfClearFieldError(input) {
  input.style.borderColor = '';
  const err = input.parentNode.querySelector('.pf-field-error');
  if (err) err.remove();
}

function pfValidateName(input) {
  const val = (input.value || '').trim();
  if (!val) { pfShowFieldError(input, 'Name cannot be empty.'); return false; }
  if (val.length < 2) { pfShowFieldError(input, 'At least 2 characters required.'); return false; }
  if (/<[^>]*>/.test(val) || /[<>"'&;]/.test(val)) { pfShowFieldError(input, 'Invalid characters.'); return false; }
  pfClearFieldError(input);
  return true;
}

function pfValidateUsername(input) {
  const val = (input.value || '').trim();
  if (!val) { pfClearFieldError(input); return true; } // optional field
  if (val.length < 3) { pfShowFieldError(input, 'At least 3 characters required.'); return false; }
  if (!/^[a-zA-Z0-9_.-]+$/.test(val)) { pfShowFieldError(input, 'Only letters, numbers, _ . - allowed.'); return false; }
  if (/^[._-]/.test(val)) { pfShowFieldError(input, 'Cannot start with . _ -'); return false; }
  pfClearFieldError(input);
  return true;
}

async function saveProfile() {
  // CSRF protection: ensure request is from same origin
  if (window.location.origin !== document.location.origin) return;

  const msg    = document.getElementById('profileMsg');
  const name   = (document.getElementById('profileName').value    || '').trim();
  const uname  = (document.getElementById('profileUsername').value || '').trim();
  const bio    = (document.getElementById('profileBio').value     || '').trim();
  const newPw  =  document.getElementById('profileNewPw').value   || '';
  const confPw =  document.getElementById('profileConfirmPw').value || '';

  function showErr(msg_el, text) {
    if (msg_el) { msg_el.style.color = '#e06060'; msg_el.textContent = text; }
  }

  // ── Name validation ─────────────────────────────────────────
  if (!name) { showErr(msg, 'Name cannot be empty.'); return; }
  if (name.length < 2)  { showErr(msg, 'Name must be at least 2 characters.'); return; }
  if (name.length > 60) { showErr(msg, 'Name must be 60 characters or less.'); return; }
  if (/<[^>]*>/.test(name)) { showErr(msg, 'Name cannot contain HTML.'); return; }
  if (/[<>"'&;]/.test(name)) { showErr(msg, 'Name contains invalid characters.'); return; }

  // ── Username validation ─────────────────────────────────────
  if (uname && uname.length < 3) { showErr(msg, 'Username must be at least 3 characters.'); return; }
  if (uname.length > 30) { showErr(msg, 'Username cannot exceed 30 characters.'); return; }
  if (uname && !/^[a-zA-Z0-9_.-]+$/.test(uname)) { showErr(msg, 'Username can only contain letters, numbers, _ . -'); return; }
  if (uname && /^[._-]/.test(uname)) { showErr(msg, 'Username cannot start with . _ -'); return; }
  if (uname && /[._-]{2,}/.test(uname)) { showErr(msg, 'Username cannot have consecutive special characters.'); return; }

  // ── Bio validation ──────────────────────────────────────────
  if (bio.length > 200) { showErr(msg, 'Bio cannot exceed 200 characters.'); return; }
  if (/<[^>]*>/.test(bio)) { showErr(msg, 'Bio cannot contain HTML.'); return; }

  // ── Password validation ─────────────────────────────────────
  if (newPw && newPw.length < 8) { showErr(msg, 'Password must be at least 8 characters.'); return; }
  if (newPw && newPw.length > 72) { showErr(msg, 'Password cannot exceed 72 characters.'); return; }
  if (newPw && !/[A-Za-z]/.test(newPw)) { showErr(msg, 'Password must contain at least one letter.'); return; }
  if (newPw && !/[0-9]/.test(newPw)) { showErr(msg, 'Password must contain at least one number.'); return; }
  if (newPw && newPw !== confPw) { showErr(msg, 'Passwords do not match.'); return; }

  if (!_supabase) {
    if (msg) { msg.style.color='#e06060'; msg.textContent='Service not configured.'; }
    return;
  }

  const updates = { data: { full_name: name, username: uname, bio } };
  if (newPw) updates.password = newPw;

  const { data, error } = await _supabase.auth.updateUser(updates);

  if (error) {
    console.error('[saveProfile] auth.updateUser error:', error);
    if (msg) { msg.style.color='#e06060'; msg.textContent = 'Could not save changes. Please try again.'; }
    return;
  }

  // Also upsert into profiles table if available
  // NOTE: updated_at column profiles table mein nahi hai, isliye woh field
  // nahi bhej rahe. onConflict: 'id' se Supabase ko pata lagta hai ki update
  // karna hai naya row insert nahi, bina is flag ke upsert silently fail
  // hota tha jab profiles RLS INSERT policy block karta tha (row already exists).
  if (data.user) {
    // FIX: updated_at column profiles table mein nahi hai (schema mein define
    // nahi kiya tha), ise bhejne se upsert silently fail hota tha.
    // Sirf defined columns bhejo.
    const { error: upsertErr } = await _supabase.from('profiles').upsert({
      id: data.user.id, full_name: name, username: uname, bio
    }, { onConflict: 'id' });
    // FIX: pehle upsertErr sirf console.error hota tha, user ko "Changes saved!"
    // dikhta tha even when DB update fail ho jaata. Name/username save nahi hota
    // lekin success message milta tha. Ab user ko actual error batao.
    if (upsertErr) {
      console.error('[saveProfile] profiles upsert error:', upsertErr);
      if (msg) { msg.style.color='#e06060'; msg.textContent = 'Profile saved partially. Some changes may not persist.'; }
      return;
    }
  }

  if (newPw) {
    document.getElementById('profileNewPw').value   = '';
    document.getElementById('profileConfirmPw').value = '';
  }
  // FIX JS-7: In-memory update ONLY after BOTH auth.updateUser AND profiles upsert
  // succeed. Pehle upsert response se pehle hi _currentUser update ho jaata tha, 
  // agar upsert fail hota (return karo upar se), _currentUser galat data rakhta.
  // Ab yahan tak sirf tab pahuncha jab dono succeed ho jaate hain.
  if (window._currentUser) {
    window._currentUser.name     = name;
    window._currentUser.username = uname;
    window._currentUser.bio      = bio;
  }
  updateNavForUser({
    email: data.user.email, name, username: uname, bio, id: data.user.id,
    xp:          window._currentUser?.xp          || 0,
    level:       window._currentUser?.level        || 1,
    ctf_solves:  window._currentUser?.ctf_solves   || 0,
  });
  if (msg) { msg.style.color='#60c060'; msg.textContent='Changes saved!'; }
  // Stay on profile page, do NOT redirect to home
}

/* ═══════════════════════════════════════════
   AUTH STATE LISTENER - auto detect login/logout
═══════════════════════════════════════════ */
(async function initAuth() {
  if (!_supabase) {
    console.warn('[ACX] Supabase not configured');
    // Still show the URL-requested page so the site isn't blank, 
    // login-only features just won't work until Supabase is reachable.
    const pg = window._initialPage || 'home';
    window._initialPage = null;
    const protectedPages = ['ctf', 'profile', 'learn', 'learn2'];
    showPage(protectedPages.includes(pg) ? 'home' : pg);
    return;
  }

  // Restore pending redirect from sessionStorage (survives full-page OAuth redirects)
  try {
    const stored = sessionStorage.getItem('acx_pending_redirect');
    if (stored) window._pendingRedirect = stored;

  } catch(e) {}

  // Guard: consumePendingRedirect sirf ONCE run karna chahiye per page load.
  // Supabase onAuthStateChange SIGNED_IN page load pe bhi fire karta hai,
  // toh getSession() branch aur onAuthStateChange dono call karte hain.
  // Doosri call pe sab null hota hai aur showPage('home') chala jaata hai, yahi bug tha.
  let _redirectConsumed = false;

  const consumePendingRedirect = () => {
    // Channel C (same-tab lab return): acx_back_to_ctf sessionStorage se set hua
    // autoOpenFromReturn IIFE ne window._acxPendingLabReturn mein store kiya
    if (window._acxPendingLabReturn) {
      const returnId = window._acxPendingLabReturn;
      window._acxPendingLabReturn = null;
      _redirectConsumed = true;
      if (typeof window.acxLabReturn === 'function') {
        window.acxLabReturn(returnId);
      } else {
        showPage('ctf');
      }
      return;
    }

    // Already ran once this page load, don't clobber the current page with home
    if (_redirectConsumed) return;
    _redirectConsumed = true;

    if (window._pendingRedirect) {
      const redirect = window._pendingRedirect;
      window._pendingRedirect = null;
      try { sessionStorage.removeItem('acx_pending_redirect'); } catch(e) {}
      showPage(redirect);
      if (redirect === 'ctf') {
        if (document.getElementById('ctfPage') && document.getElementById('ctfPage').classList.contains('active')) {
          document.dispatchEvent(new CustomEvent('acx:ctf-page-shown'));
        }
      }
    } else if (window._initialPage && window._initialPage !== 'home') {
      const pg = window._initialPage;
      window._initialPage = null;
      showPage(pg);
    } else {
      showPage('home');
    }
  };

  // Handle Google OAuth redirect / password reset redirect
  const hash = window.location.hash;
  if (hash.includes('access_token') || hash.includes('error')) {
    try {
      const { data } = await _supabase.auth.getSession();
      if (data.session) {
        await loadUserProfile(data.session.user);
        history.replaceState(null, '', window.location.pathname + window.location.search);
        consumePendingRedirect();
        return;
      }
    } catch (e) {
      console.warn('[ACX] getSession failed during OAuth redirect handling', e);
    }
  }

  // Handle password reset flow
  if (window.location.search.includes('reset=1')) {
    showAuth('login');
  }

  // Check existing session on page load
  try {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
      await loadUserProfile(session.user);
      consumePendingRedirect();
    } else {
      // No session, route to URL-requested page (if not protected)
      const pg = window._initialPage || 'home';
      window._initialPage = null;
      const protectedPages = ['ctf', 'profile', 'learn', 'learn2'];
      if (protectedPages.includes(pg)) {
        showPage('home');
        if (typeof showAuth === 'function') showAuth('login', pg);
      } else {
        showPage(pg);
      }
    }
  } catch (e) {
    // Network/Supabase failure, don't leave the page blank.
    console.warn('[ACX] getSession failed, falling back to URL routing', e);
    const pg = window._initialPage || 'home';
    window._initialPage = null;
    const protectedPages = ['ctf', 'profile', 'learn', 'learn2'];
    showPage(protectedPages.includes(pg) ? 'home' : pg);
  }

  // Listen for auth changes (login, logout, token refresh)
  _supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN'  && session) {
      closeAuth();
      await loadUserProfile(session.user);
      // Record last-seen + last-login-IP for the admin Users tab. Throttled
      // to once per browser tab-session (not on every SIGNED_IN re-fire,
      // e.g. token refresh or a silent session restore on page load),
      // so we don't hit the ipify lookup more than necessary.
      if (!window._acxLoginIPRecorded) {
        window._acxLoginIPRecorded = true;
        acxRecordLoginIP(session.user.id);
      }
      // Re-anchor lab session to the newly signed-in user so instance
      // state is per-user, not per-IP or per-page-load.
      if (typeof ctfInitUserSession === 'function') ctfInitUserSession();
      // Redirect to pending page if set (e.g. learn page after course click)
      consumePendingRedirect();
    }
    if (event === 'SIGNED_OUT' && window._currentUser) {
      window._currentUser = null;
      clearProfileFields();
      updateNavForUser(null);
      // Reset lab session to a fresh anonymous token on logout so a
      // new login on the same browser gets a clean session.
      if (typeof ctfLabSession !== 'undefined') {
        window.ctfLabSession = 'sess_' + Math.random().toString(36).substring(2, 10);
      }

      // ── FULL CTF/LAB STATE WIPE ──
      // sessionStorage/localStorage are scoped to the BROWSER, not the
      // account. Without this, switching accounts on the same browser
      // (Account A logs out, Account B logs in) lets Account B inherit
      // Account A's "lab still running" UI: the in-memory ctfActiveTab
      // reference, the polling interval, and every acx_lab_* key written by
      // the lab pages all survive a plain logout. This wipes all of it so
      // each new login on this browser starts from a clean Start state.
      window.ctfActiveTab = null;
      if (typeof ctfTimerPoll !== 'undefined' && ctfTimerPoll) {
        clearInterval(ctfTimerPoll);
        window.ctfTimerPoll = null;
      }
      // Live leaderboard polling + cached rank-comparison state bhi yahin
      // reset karo, warna account switch (same browser/tab) pe naya user
      // purane user ka stale leaderboard data ya galat rank-arrows dekh
      // sakta hai jab tak fresh poll na chale.
      if (typeof pfResetLeaderboardState === 'function') pfResetLeaderboardState();
      if (typeof ctfSolved !== 'undefined') window.ctfSolved = {};
      if (typeof ctfCurrentChallenge !== 'undefined') window.ctfCurrentChallenge = null;
      if (typeof closeCTFModal === 'function') { try { closeCTFModal(); } catch(e) {} }

      try {
        const keysToWipe = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && (k.startsWith('acx_lab_') || k === 'acx_back_to_ctf' || k === 'acx_back_ts' || k === 'acx_pending_redirect')) {
            keysToWipe.push(k);
          }
        }
        keysToWipe.forEach(k => sessionStorage.removeItem(k));
      } catch(e) {}

      try {
        const lKeysToWipe = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('acx_lab_') || k === 'acx_return_to_modal' || k === 'acx_return_ts' || k === 'acx_ctf_solved' || k === 'acx_ctf_disabled')) {
            lKeysToWipe.push(k);
          }
        }
        lKeysToWipe.forEach(k => localStorage.removeItem(k));
      } catch(e) {}
    }
    if (event === 'USER_UPDATED' && session) { await loadUserProfile(session.user); }
  });
})();



