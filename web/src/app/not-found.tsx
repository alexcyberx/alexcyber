'use client';

import { uiText, useUiLang } from '@/lib/ui-text';

export default function NotFound() {
  const lang = useUiLang();
  return (
    <div className="page active">
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'calc(var(--nav-h) + 60px) 24px 80px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 30, fontWeight: 700, color: 'var(--fg-1)', marginBottom: 12 }}>{uiText('notfound.title', lang)}</h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: 24 }}>{uiText('notfound.desc', lang)}</p>
        <a className="nav-btn fill" href="/" style={{ display: 'inline-flex', textDecoration: 'none' }}>{uiText('notfound.home', lang)}</a>
      </div>
    </div>
  );
}
