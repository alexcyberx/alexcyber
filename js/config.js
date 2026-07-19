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

// Global reference, index.html aur pages/*.html mein window._supabase use hota hai
window._supabase = _supabase;

/* ═══════════════════════════════════════════
   MAINTENANCE MODE
   Admin panel ke Settings → Access Control → Maintenance Mode se
   controlled. ON hone par sabhi non-admin visitors (anon + normal
   logged-in users) ko ek block screen dikhta hai; admins normally
   browse kar sakte hain taaki wo mode off kar sakein.
═══════════════════════════════════════════ */
async function _enforceMaintenanceMode() {
  if (!_supabase) return;

  try {
    const { data: settings, error: settingsErr } = await _supabase.rpc('get_site_settings');
    if (settingsErr || !settings || !settings.maintenance_mode) return; // off, or couldn't check -> fail open

    // Maintenance is ON. Check if the current visitor is an admin, if any.
    let isAdmin = false;
    try {
      const { data: { session } } = await _supabase.auth.getSession();
      if (session?.user?.id) {
        const { data: profile } = await _supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        isAdmin = profile?.role === 'admin';
      }
    } catch (e) { /* treat as non-admin on any error */ }

    if (isAdmin) return; // admins can still use the site to turn it back off

    // Don't lock out the admin panel itself
    if (window.location.pathname.includes('panel-')) return;

    _showMaintenanceScreen(settings.site_name || 'This site');
  } catch (e) {
    // Fail open, never let a settings-fetch error brick the whole site
    console.warn('[Maintenance] check failed:', e?.message);
  }
}

function _showMaintenanceScreen(siteName) {
  document.documentElement.innerHTML = '';
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:#0a0a0d;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;font-family:system-ui,-apple-system,sans-serif;z-index:999999;';
  overlay.innerHTML = `
    <div style="font-size:40px;margin-bottom:16px;">🛠️</div>
    <h1 style="font-size:22px;margin:0 0 10px;">${siteName} is under maintenance</h1>
    <p style="color:#9a9aa5;font-size:14px;max-width:420px;line-height:1.6;">We're making some improvements and will be back shortly. Please check back soon.</p>
  `;
  document.body?.appendChild(overlay) ?? document.documentElement.appendChild(overlay);
}

// Run as early as possible, but don't block page-view tracking below on it.
_enforceMaintenanceMode();

/* ═══════════════════════════════════════════
   PAGE VIEW TRACKING
   Har page load pe silently ek baar call hota hai
   (anon ya logged-in dono users track hote hain).
   Admin dashboard "Visitor Trend" isi data se banta hai.
═══════════════════════════════════════════ */

// Session ID, ek browser tab session ke liye same rehta hai (sessionStorage),
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
    // na ho), TypeError crash deta tha jo poori config.js load hi rok deta,
    // isliye pura site hi tootne laga tha. .then(onSuccess, onError) safe hai.
    _supabase.rpc('track_page_view', {
      p_page: _pageForTracking,
      p_device_type: _detectDeviceType(),
      p_session_id: _getOrCreateSessionId()
    }).then(() => {}, () => { /* silent fail, tracking kabhi bhi UX block nahi karega */ });
  } catch (e) { /* silent */ }
}

