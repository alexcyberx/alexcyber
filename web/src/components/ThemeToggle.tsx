'use client';

// Nav theme picker (lib/theme.ts). Each choice is a tiny live preview of the
// site in that theme (nav strip, heading, button, card) instead of a colour dot.
// Switching uses the View Transitions API: the new theme grows as a circle from
// the click point. No API or reduced motion -> instant switch.
// `inline` renders the same cards in the mobile menu.

import { useEffect, useRef, useState } from 'react';
import { applyPref, readPref, type ThemePref } from '@/lib/theme';

type Opt = { value: ThemePref; name: string; sub: string; bg: string; card: string; line: string; accent: string; text: string };

const OPTIONS: Opt[] = [
  { value: 'green', name: 'Matrix', sub: 'Green', bg: '#0b0d0d', card: '#141817', line: 'rgba(255,255,255,0.08)', accent: '#10b981', text: '#e9eeec' },
  { value: 'blue', name: 'Midnight', sub: 'Blue', bg: '#070d1a', card: '#0f1a2e', line: 'rgba(140,180,255,0.12)', accent: '#2f86e6', text: '#e6eefc' },
  { value: 'red', name: 'Crimson', sub: 'Red', bg: '#060608', card: '#111115', line: 'rgba(255,255,255,0.07)', accent: '#dc1414', text: '#f4f4f5' },
];

function Preview({ o }: { o: Opt }) {
  return (
    <span className="tp-prev" style={{ background: o.bg, borderColor: o.line }} aria-hidden="true">
      <span className="tp-prev-glow" style={{ background: `radial-gradient(60% 70% at 70% 0%, ${o.accent}55, transparent 70%)` }} />
      <span className="tp-prev-nav" style={{ borderColor: o.line }}>
        <i style={{ background: o.text }} /><i className="tp-dot" style={{ background: o.accent }} />
      </span>
      <span className="tp-prev-h" style={{ background: o.text }} />
      <span className="tp-prev-h2" style={{ background: o.accent }} />
      <span className="tp-prev-btn" style={{ background: o.accent, boxShadow: `0 0 10px ${o.accent}99` }} />
      <span className="tp-prev-card" style={{ background: o.card, borderColor: o.line }} />
    </span>
  );
}

export function ThemeIcon() {
  // Half-filled circle in the current accent: reads as "appearance" without colour dots.
  return (
    <svg className="tp-icon" width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5Z" style={{ fill: 'var(--accent)' }} />
    </svg>
  );
}

// Circle reveal from (x, y) when the browser supports it.
function switchWithReveal(p: ThemePref, x: number, y: number) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!doc.startViewTransition || reduce) { applyPref(p); return; }
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const t = doc.startViewTransition(() => applyPref(p));
  t.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' },
    );
  }).catch(() => {});
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

  function choose(p: ThemePref, e: React.MouseEvent) {
    if (p === pref) { setOpen(false); return; }
    setPref(p);
    const x = e.clientX || innerWidth / 2, y = e.clientY || innerHeight / 2;
    switchWithReveal(p, x, y);
    setTimeout(() => setOpen(false), 180);
  }

  const cards = (
    <div className="tp-grid" role="radiogroup" aria-label="Theme">
      {OPTIONS.map((o, i) => (
        <button key={o.value} type="button" role="radio" aria-checked={pref === o.value}
          className={'tp-card' + (pref === o.value ? ' on' : '')} style={{ ['--i' as string]: i, ['--tp' as string]: o.accent }}
          onClick={(e) => choose(o.value, e)}>
          <Preview o={o} />
          <span className="tp-label">
            <b>{o.name}</b><small>{o.sub}</small>
          </span>
          <span className="tp-check" aria-hidden="true">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5 5 9l4.5-6" /></svg>
          </span>
        </button>
      ))}
    </div>
  );

  if (inline) return <div className="tp-inline">{cards}</div>;

  return (
    <div className="theme-toggle" ref={box}>
      <button type="button" className={'nav-btn ghost theme-btn' + (open ? ' open' : '')} id="themeBtn" aria-haspopup="true" aria-expanded={open}
        aria-label="Change theme" title="Theme" onClick={() => setOpen((v) => !v)}>
        <ThemeIcon />
      </button>
      {open && (
        <div className="tp-pop" role="dialog" aria-label="Theme">
          <div className="tp-head">Theme</div>
          {cards}
        </div>
      )}
    </div>
  );
}
