'use client';

// Same banner + same localStorage key as index.html, so consent given on
// either app is respected by both.
import { useEffect, useState } from 'react';

const KEY = 'acx_cookie_consent';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v !== 'accepted' && v !== 'declined') setShow(true);
    } catch { /* localStorage unavailable (private mode etc) - skip banner */ }
  }, []);

  const choose = (v: 'accepted' | 'declined') => {
    try { localStorage.setItem(KEY, v); } catch { /* ignore */ }
    setShow(false);
  };

  if (!show) return null;
  return (
    <div id="cookieBanner" style={{ display: 'flex', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999, background: '#111118', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '14px 20px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <p style={{ margin: 0, fontSize: 12, color: '#9090a0', flex: 1, minWidth: 200 }}>
        We use strictly necessary cookies to keep you logged in and remember your preferences.{' '}
        <a href="/cookie-notice" style={{ color: '#dc1414', textDecoration: 'none' }}>Cookie Notice</a>
      </p>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={() => choose('accepted')} style={{ background: '#dc1414', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>Accept</button>
        <button onClick={() => choose('declined')} style={{ background: 'transparent', color: '#666', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '8px 14px', fontSize: 12, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>Decline</button>
      </div>
    </div>
  );
}
