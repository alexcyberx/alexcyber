'use client';

// /tools cards: same markup/classes as the #toolsPage cards in index.html.
// Admin on/off switch (tool_settings) from initToolsPage() in js/page-scripts.js,
// but as React state: a tool switched back on gets its tag, link and look back
// (on the old page it stayed a dead "Unavailable" card until a reload).

import { useEffect, useState } from 'react';
import { browserSupabase } from '@/lib/supabase';
import { TOOLS, readDisabledTools, type DisabledTools } from '@/lib/tools';

const S = { stroke: '#10b981' } as const;

// Same SVGs as the old cards (also used in the analyzer page header).
export function ToolIcon({ toolKey }: { toolKey: string }) {
  switch (toolKey) {
    case 'mistake_analyzer':
      return (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M3 15.5 8.5 4 11 9l2-3 4 9.5H3Z" {...S} strokeWidth="1.2" strokeLinejoin="round" />
          <circle cx="14.5" cy="5.5" r="1.3" {...S} strokeWidth="1" />
        </svg>
      );
    case 'alexrecon':
      return (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <circle cx="9" cy="9" r="6" {...S} strokeWidth="1.2" />
          <path d="M13.5 13.5 17.5 17.5" {...S} strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="9" cy="9" r="2.4" {...S} strokeWidth="1" />
        </svg>
      );
    case 'alexutils':
      return (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 2.5a3.6 3.6 0 00-3.6 4.5L2.5 13.4a1.7 1.7 0 002.4 2.4l6.4-6.4a3.6 3.6 0 004.5-3.6l-2.6 2.6-2-2 2.6-2.6a3.6 3.6 0 00-2.5-.7z" {...S} strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      );
    case 'alextrace':
      return (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="7" r="3" {...S} strokeWidth="1.2" />
          <path d="M4.5 16.5c0-2.8 2.5-5 5.5-5s5.5 2.2 5.5 5" {...S} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M15.5 3.5 17 5M17 3.5l-1.5 1.5" {...S} strokeWidth="1.1" strokeLinecap="round" />
          <circle cx="16.2" cy="4.2" r="2.2" {...S} strokeWidth="1" />
        </svg>
      );
    default:
      return null;
  }
}

// "`code`" in the card text -> <code>
const descNodes = (desc: string) =>
  desc.split('`').map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part));

export default function ToolsHub({ initial }: { initial: DisabledTools }) {
  const [disabled, setDisabled] = useState<DisabledTools>(initial);

  // The page HTML can be up to a minute old (ISR): read the switches again on
  // load, and whenever the tab comes back, so an admin change shows quickly.
  useEffect(() => {
    let alive = true;
    const load = () => {
      readDisabledTools(browserSupabase()).then((d) => { if (alive && d) setDisabled(d); });
    };
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) load(); }; // back/forward cache
    load();
    window.addEventListener('focus', load);
    window.addEventListener('pageshow', onShow);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      window.removeEventListener('focus', load);
      window.removeEventListener('pageshow', onShow);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return (
    <div className="cards-grid">
      {TOOLS.map((t) => {
        const msg = disabled[t.key];
        const off = msg !== undefined;
        return (
          <a
            key={t.key}
            className="tut-card"
            href={t.href}
            data-tool-key={t.key}
            data-search-page={t.page}
            data-search-tags={t.searchTags.join(',')}
            data-tool-disabled={off ? 'true' : undefined}
            aria-disabled={off || undefined}
            style={off ? { cursor: 'not-allowed', opacity: 0.45 } : { cursor: 'pointer' }}
            // Switched off: stay here and say why (same alert as the old page).
            onClick={off ? (e) => { e.preventDefault(); alert(msg); } : undefined}
            data-reveal
          >
            <div className="card-icon-wrap"><ToolIcon toolKey={t.key} /></div>
            <div className="card-tag" style={off ? { color: '#8a8a95' } : undefined}>{off ? 'Unavailable' : t.tag}</div>
            <div className="card-title">{t.title}</div>
            <p className="card-desc">{descNodes(t.desc)}</p>
            <div className="card-footer">
              <span className="card-chapters">Free</span>
              <div className="card-arrow">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6h8M6.5 3l3 3-3 3" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
