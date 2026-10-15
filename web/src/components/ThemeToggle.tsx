'use client';

// Nav theme picker: Dark / Light / System (lib/theme.ts). One button with a
// small menu on desktop; `inline` renders three chips for the mobile menu.

import { useEffect, useRef, useState } from 'react';
import { applyPref, readPref, resolve, type ThemePref } from '@/lib/theme';

const OPTIONS: { value: ThemePref; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
];

function Icon({ kind, size = 14 }: { kind: ThemePref; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (kind === 'light') return <svg {...p}><circle cx="8" cy="8" r="3" /><path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" /></svg>;
  if (kind === 'system') return <svg {...p}><rect x="1.5" y="2.5" width="13" height="9" rx="1.5" /><path d="M5.5 14h5M8 11.5V14" /></svg>;
  return <svg {...p}><path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z" /></svg>;
}

export default function ThemeToggle({ inline = false }: { inline?: boolean }) {
  const [pref, setPref] = useState<ThemePref>('dark');
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPref(readPref());
    // "System" follows the device setting live.
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => { if (readPref() === 'system') document.documentElement.setAttribute('data-theme', resolve('system')); };
    mq.addEventListener('change', onChange);
    const onStorage = (e: StorageEvent) => { if (e.key === 'acx_theme') { const p = readPref(); setPref(p); applyPref(p); } };
    window.addEventListener('storage', onStorage);
    return () => { mq.removeEventListener('change', onChange); window.removeEventListener('storage', onStorage); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  function choose(p: ThemePref) {
    setPref(p);
    applyPref(p);
    setOpen(false);
  }

  if (inline) {
    return (
      <div className="theme-chips" role="radiogroup" aria-label="Theme">
        {OPTIONS.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={pref === o.value}
            className={'theme-chip' + (pref === o.value ? ' on' : '')} onClick={() => choose(o.value)}>
            <Icon kind={o.value} size={13} /> {o.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="theme-toggle" ref={box}>
      <button type="button" className="nav-btn ghost theme-btn" id="themeBtn" aria-haspopup="menu" aria-expanded={open}
        aria-label={`Theme: ${pref}`} title="Theme" onClick={() => setOpen((v) => !v)} suppressHydrationWarning>
        <Icon kind={pref} />
      </button>
      {open && (
        <div className="theme-menu" role="menu">
          {OPTIONS.map((o) => (
            <button key={o.value} type="button" role="menuitemradio" aria-checked={pref === o.value}
              className={'theme-item' + (pref === o.value ? ' on' : '')} onClick={() => choose(o.value)}>
              <Icon kind={o.value} /> <span>{o.label}</span>
              {pref === o.value && <svg className="theme-check" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2.5 6.5 5 9l4.5-6" /></svg>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
