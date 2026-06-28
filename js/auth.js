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
  // Clear display text too
  const textsToClear = ['profileAvatarBig', 'profileDisplayName', 'profileDisplayEmail', 'profileMsg'];
  textsToClear.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
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
    const { data } = await _supabase.from('profiles').select('*').eq('id', authUser.id).single();
    if (data) {
      profile.name     = data.full_name     || profile.name;
      profile.username = data.username      || profile.username;
      profile.bio      = data.bio           || profile.bio;
    }
  }
  updateNavForUser(profile);
  window._currentUser = profile;
  refreshCTFSolvedForCurrentUser();

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
// re-render once the real user id is known — this is what makes account switches
// inside the same tab/browser show correct solves without a manual refresh.
function refreshCTFSolvedForCurrentUser() {
  try {
    // FIX Bug 2: Pehle localStorage clear karo (purane user ka data na rahe)
    // Phir Supabase se fresh data lo — yahi cross-device sync karta hai
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
    const fields = { profileName: user.name, profileEmail: user.email, profileUsername: user.username || '', profileBio: user.bio || '' };
    Object.entries(fields).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.value = val || ''; });
  } else {
    // User logged out — wipe all profile fields so no stale data shows
    // if a different account logs in next on the same tab
    if (typeof clearProfileFields === 'function') clearProfileFields();
  }
}

/* ═══════════════════════════════════════════
   SAVE PROFILE
═══════════════════════════════════════════ */
async function saveProfile() {
  // CSRF protection: ensure request is from same origin
  if (window.location.origin !== document.location.origin) return;

  const msg    = document.getElementById('profileMsg');
  const name   = (document.getElementById('profileName').value    || '').trim();
  const uname  = (document.getElementById('profileUsername').value || '').trim();
  const bio    = (document.getElementById('profileBio').value     || '').trim();
  const newPw  =  document.getElementById('profileNewPw').value   || '';
  const confPw =  document.getElementById('profileConfirmPw').value || '';

  if (!name) { if (msg) { msg.style.color='#e06060'; msg.textContent='Name cannot be empty.'; } return; }
  if (name.length > 60) { if (msg) { msg.style.color='#e06060'; msg.textContent='Name must be 60 characters or less.'; } return; }
  if (/<[^>]*>/.test(name)) { if (msg) { msg.style.color='#e06060'; msg.textContent='Name mein HTML tags allowed nahi hain.'; } return; }
  if (uname.length > 30) { if (msg) { msg.style.color='#e06060'; msg.textContent='Username 30 characters se zyada nahi ho sakta.'; } return; }
  if (uname && !/^[a-zA-Z0-9_.-]+$/.test(uname)) { if (msg) { msg.style.color='#e06060'; msg.textContent='Username mein sirf letters, numbers, _ . - allowed hain.'; } return; }
  if (bio.length > 200) { if (msg) { msg.style.color='#e06060'; msg.textContent='Bio 200 characters se zyada nahi ho sakti.'; } return; }
  if (newPw && newPw.length < 8) { if (msg) { msg.style.color='#e06060'; msg.textContent='Password must be at least 8 characters.'; } return; }
  if (newPw && newPw !== confPw) { if (msg) { msg.style.color='#e06060'; msg.textContent='Passwords do not match.'; } return; }

  if (!_supabase) {
    if (msg) { msg.style.color='#e06060'; msg.textContent='Service not configured.'; }
    return;
  }

  const updates = { data: { full_name: name, username: uname, bio } };
  if (newPw) updates.password = newPw;

  const { data, error } = await _supabase.auth.updateUser(updates);

  if (error) {
    if (msg) { msg.style.color='#e06060'; msg.textContent = 'Could not save changes. Please try again.'; }
    return;
  }

  // Also upsert into profiles table if available
  if (data.user) {
    await _supabase.from('profiles').upsert({
      id: data.user.id, full_name: name, username: uname, bio,
      updated_at: new Date().toISOString()
    }).catch(() => {});
  }

  if (newPw) {
    document.getElementById('profileNewPw').value   = '';
    document.getElementById('profileConfirmPw').value = '';
  }
  updateNavForUser({ email: data.user.email, name, username: uname, bio, id: data.user.id });
  if (msg) { msg.style.color='#60c060'; msg.textContent='Changes saved!'; }
  setTimeout(() => { showPage('home'); }, 1200);
}

/* ═══════════════════════════════════════════
   AUTH STATE LISTENER - auto detect login/logout
═══════════════════════════════════════════ */
(async function initAuth() {
  if (!_supabase) {
    console.warn('[ACX] Supabase not configured');
    // Still show the URL-requested page so the site isn't blank —
    // login-only features just won't work until Supabase is reachable.
    const pg = window._initialPage || 'home';
    window._initialPage = null;
    const protectedPages = ['ctf', 'profile'];
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
  // Doosri call pe sab null hota hai aur showPage('home') chala jaata hai — yahi bug tha.
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

    // Already ran once this page load — don't clobber the current page with home
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
      // No session — route to URL-requested page (if not protected)
      const pg = window._initialPage || 'home';
      window._initialPage = null;
      const protectedPages = ['ctf', 'profile'];
      if (protectedPages.includes(pg)) {
        showPage('home');
      } else {
        showPage(pg);
      }
    }
  } catch (e) {
    // Network/Supabase failure — don't leave the page blank.
    console.warn('[ACX] getSession failed, falling back to URL routing', e);
    const pg = window._initialPage || 'home';
    window._initialPage = null;
    const protectedPages = ['ctf', 'profile'];
    showPage(protectedPages.includes(pg) ? 'home' : pg);
  }

  // Listen for auth changes (login, logout, token refresh)
  _supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN'  && session) {
      closeAuth();
      await loadUserProfile(session.user);
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



