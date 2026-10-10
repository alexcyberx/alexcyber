'use client';

// Site-wide checks that js/config.js runs on every SPA page, done here for
// the Next pages: maintenance mode (admin switch) and page-view tracking for
// the admin dashboard's visitor stats.

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { browserSupabase } from '@/lib/supabase';

function sessionId(): string | null {
  try {
    let sid = sessionStorage.getItem('acx_session_id');
    if (!sid) {
      sid = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem('acx_session_id', sid);
    }
    return sid;
  } catch { return null; }
}

function deviceType(): string {
  const ua = navigator.userAgent || '';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|android|iphone/i.test(ua)) return 'mobile';
  return 'desktop';
}

export default function SiteRuntime() {
  const pathname = usePathname();
  const [maintenance, setMaintenance] = useState<string | null>(null);

  useEffect(() => {
    const sb = browserSupabase();
    if (!sb) return;
    sb.rpc('track_page_view', { p_page: pathname || '/', p_device_type: deviceType(), p_session_id: sessionId() })
      .then(() => {}, () => {});
  }, [pathname]);

  useEffect(() => {
    const sb = browserSupabase();
    if (!sb) return;
    (async () => {
      try {
        const { data: settings, error } = await sb.rpc('get_site_settings');
        if (error || !settings || !settings.maintenance_mode) return; // off, or unknown -> fail open
        const { data: { session } } = await sb.auth.getSession();
        if (session?.user?.id) {
          const { data: p } = await sb.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
          if (p?.role === 'admin') return; // admins keep access to switch it off
        }
        setMaintenance(settings.site_name || 'This site');
      } catch { /* fail open */ }
    })();
  }, []);

  if (!maintenance) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a0d', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, fontFamily: 'system-ui,-apple-system,sans-serif', zIndex: 999999 }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🛠️</div>
      <h1 style={{ fontSize: 22, margin: '0 0 10px' }}>{maintenance} is under maintenance</h1>
      <p style={{ color: '#9a9aa5', fontSize: 14, maxWidth: 420, lineHeight: 1.6 }}>We&apos;re making some improvements and will be back shortly. Please check back soon.</p>
    </div>
  );
}
