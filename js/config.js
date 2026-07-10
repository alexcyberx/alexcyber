/* ═══════════════════════════════════════════
   SUPABASE CONFIG - Apni credentials yahan daalo
═══════════════════════════════════════════ */
// ⚠️ SECURITY: Apni actual credentials yahan daalo - hardcode mat karo public files mein
// In values ko environment variables ya server-side config se load karo
const SUPABASE_URL  = 'https://rwjwjltlfkxadywfqxbs.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3andqbHRsZmt4YWR5d2ZxeGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMTY5MzgsImV4cCI6MjA5ODY5MjkzOH0.y_VTm74AdRjejT5b5cHkirctKqbkixrYY4pP4WOG_KM';

const _supabase = (typeof supabase !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL')
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: {
        storageKey: 'alexcyberx-auth',  // unique key, dusri sites se clash nahi
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Global reference — index.html aur pages/*.html mein window._supabase use hota hai
window._supabase = _supabase;

/* ═══════════════════════════════════════════
   PAGE VIEW TRACKING
   Har page load pe silently ek baar call hota hai
   (anon ya logged-in dono users track hote hain).
   Admin dashboard "Visitor Trend" isi data se banta hai.
═══════════════════════════════════════════ */

// Session ID — ek browser tab session ke liye same rehta hai (sessionStorage),
// taaki "Avg. Session" aur "Unique Visitors" sahi calculate ho sake bina
// login ke bhi. Naya tab/session = naya ID.
function _getOrCreateSessionId() {
  try {
    let sid = sessionStorage.getItem('acx_session_id');
    if (!sid) {
      sid = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem('acx_session_id', sid);
    }
    return sid;
  } catch (e) {
    return null; // private browsing wagairah mein sessionStorage block ho sakta hai
  }
}

// Simple device-type detection from user-agent (koi library nahi chahiye)
function _detectDeviceType() {
  const ua = navigator.userAgent || '';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|android|iphone/i.test(ua)) return 'mobile';
  return 'desktop';
}

if (_supabase) {
  try {
    const _pageForTracking = window.location.pathname || '/';
    // FIX: .rpc(...).catch() Supabase JS v2 mein direct chain nahi hota
    // (query builder .catch() method nahi rakhta jab tak thenable resolve
    // na ho) — TypeError crash deta tha jo poori config.js load hi rok deta,
    // isliye pura site hi tootne laga tha. .then(onSuccess, onError) safe hai.
    _supabase.rpc('track_page_view', {
      p_page: _pageForTracking,
      p_device_type: _detectDeviceType(),
      p_session_id: _getOrCreateSessionId()
    }).then(() => {}, () => { /* silent fail — tracking kabhi bhi UX block nahi karega */ });
  } catch (e) { /* silent */ }
}

