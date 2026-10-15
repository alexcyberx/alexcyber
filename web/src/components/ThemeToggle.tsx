'use client';

// Nav theme picker: Green / Blue / Red (lib/theme.ts). One button with a small menu
// on desktop; `inline` renders the same choices as chips for the mobile menu.

import { useEffect, useRef, useState } from 'react';
import { applyPref, readPref, type ThemePref } from '@/lib/theme';

const OPTIONS: { value: ThemePref; label: string; color: string }[] = [
  { value: 'green', label: 'Green', color: '#10b981' },
  { value: 'blue', label: 'Blue', color: '#0a66c2' },
  { value: 'red', label: 'Red', color: '#dc1414' },
];

function Swatch({ color, size = 12 }: { color: string; size?: number }) {
  return <span className="theme-swatch" style={{ width: size, height: size, background: color, boxShadow: `0 0 8px ${color}` }} aria-hidden="true" />;
}

function PaletteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5a6.5 6.5 0 1 0 0 13c.9 0 1.4-.6 1.4-1.3 0-.4-.2-.7-.4-1-.2-.3-.4-.6-.4-1 0-.7.6-1.3 1.3-1.3h1.6A3 3 0 0 0 14.5 7 5.8 5.8 0 0 0 8 1.5Z" />
      <circle cx="4.8" cy="7.2" r=".8" /><circle cx="7.2" cy="4.6" r=".8" /><circle cx="10.4" cy="5.2" r=".8" />
    </svg>
  );
}

export default function ThemeToggle({ inline = false }: { inline?: boolean }) {
  const [pref, setPref] = useState<ThemePref>('green');
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPref(readPref());
    const onStorage = (e: StorageEvent) => { if (e.key === 'acx_theme') { const p = readPref(); setPref(p); applyPref(p); } };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
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
            <Swatch color={o.color} size={10} /> {o.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="theme-toggle" ref={box}>
      <button type="button" className="nav-btn ghost theme-btn" id="themeBtn" aria-haspopup="menu" aria-expanded={open}
        aria-label={`Theme: ${pref}`} title="Theme" onClick={() => setOpen((v) => !v)}>
        <PaletteIcon />
      </button>
      {open && (
        <div className="theme-menu" role="menu">
          {OPTIONS.map((o) => (
            <button key={o.value} type="button" role="menuitemradio" aria-checked={pref === o.value}
              className={'theme-item' + (pref === o.value ? ' on' : '')} onClick={() => choose(o.value)}>
              <Swatch color={o.color} /> <span>{o.label}</span>
              {pref === o.value && <svg className="theme-check" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2.5 6.5 5 9l4.5-6" /></svg>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
