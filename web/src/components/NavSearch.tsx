'use client';

// Nav search for the Next pages: a command palette (Ctrl/Cmd+K or "/").
// Triggers: the desktop pill (#navSearchPill) and the mobile icon
// (#navSearchToggle). The palette is portalled to <body> because <nav> has a
// backdrop-filter, which would trap a fixed child inside the bar.
// The index comes from /search-index.json (built on the server from the DB:
// courses, every chapter, CTF rooms, blog, tools).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { SearchEntry } from '@/lib/search';

type Type = SearchEntry['type'];

let indexPromise: Promise<SearchEntry[]> | null = null;
function loadIndex(): Promise<SearchEntry[]> {
  if (!indexPromise) {
    indexPromise = fetch('/search-index.json').then((r) => (r.ok ? r.json() : [])).catch(() => {
      indexPromise = null; // retry next time
      return [];
    });
  }
  return indexPromise;
}

// Every word of the query must match the title, a tag or the subtitle;
// prefix/title matches rank higher.
export function searchEntries(index: SearchEntry[], raw: string, limit = 12): SearchEntry[] {
  const q = raw.trim().toLowerCase();
  if (!q) return [];
  const words = q.split(/\s+/);
  const scored: { e: SearchEntry; s: number }[] = [];
  for (const e of index) {
    if (!e || !e.title) continue;
    const t = e.title.toLowerCase();
    const tags = e.tags || [];
    const sub = (e.sub || '').toLowerCase();
    let s = 0;
    if (t.startsWith(q)) s = 5;
    else if (t.includes(q)) s = 4;
    else if (tags.some((tag) => tag.startsWith(q))) s = 3;
    else if (sub.includes(q) || tags.some((tag) => tag.includes(q))) s = 2;
    else if (words.length > 1 && words.every((w) => t.includes(w) || sub.includes(w) || tags.some((tag) => tag.startsWith(w)))) s = 1;
    if (s) scored.push({ e, s });
  }
  // Courses/rooms first on equal score, then the order of the index.
  return scored.sort((a, b) => b.s - a.s || RANK[a.e.type] - RANK[b.e.type]).slice(0, limit).map((x) => x.e);
}

const RANK: Record<Type, number> = { course: 0, ctf: 1, tool: 2, chapter: 3, blog: 4 };
const GROUP: Record<Type, string> = { course: 'Courses', ctf: 'CTF Rooms', tool: 'Tools', chapter: 'Chapters', blog: 'Blog' };
const BADGE: Record<Type, string> = { course: 'Course', chapter: 'Chapter', ctf: 'CTF', tool: 'Tool', blog: 'Blog' };
const SUGGEST = ['nmap', 'sql injection', 'wireshark', 'xss', 'forensics'];
const QUICK = [
  { title: 'All Courses', sub: 'Start learning step by step', href: '/tutorials', type: 'course' as Type },
  { title: 'CTF Challenges', sub: 'Find the flag, earn XP', href: '/rooms', type: 'ctf' as Type },
  { title: 'Tools', sub: 'Mistake Analyzer, AlexRecon and more', href: '/tools', type: 'tool' as Type },
  { title: 'Leaderboard', sub: 'Top hackers by XP', href: '/leaderboard', type: 'blog' as Type },
];
const RECENT_KEY = 'acx_recent_search';

function TypeIcon({ type }: { type: Type }) {
  const p = { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (type === 'course') return <svg {...p}><path d="M2 4.5 8 2l6 2.5L8 7Z" /><path d="M4.5 6v3.5c0 1 1.6 2 3.5 2s3.5-1 3.5-2V6" /></svg>;
  if (type === 'chapter') return <svg {...p}><path d="M3 2.5h7l3 3v8H3Z" /><path d="M5.5 8h5M5.5 10.5h3.5" /></svg>;
  if (type === 'ctf') return <svg {...p}><path d="M3.5 14V2.5" /><path d="M3.5 3h8l-1.6 2.6L11.5 8.5h-8" /></svg>;
  if (type === 'tool') return <svg {...p}><path d="M10 2.5a3 3 0 0 0-3 4l-4.2 4.2a1.3 1.3 0 0 0 1.8 1.8L8.8 8.3a3 3 0 0 0 4-3L11 7 9.2 6.8 9 5Z" /></svg>;
  return <svg {...p}><rect x="2.5" y="2.5" width="11" height="11" rx="2" /><path d="M5 6h6M5 8.5h6M5 11h3.5" /></svg>;
}

function SearchGlyph({ size = 15 }: { size?: number }) {
  return (
    <svg className="sp-glyph" width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.8" stroke="currentColor" strokeWidth="1.5" />
      <path d="m10.6 10.6 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Highlight({ text, q }: { text: string; q: string }) {
  const n = q.trim();
  const i = n ? text.toLowerCase().indexOf(n.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<span className="search-highlight">{text.slice(i, i + n.length)}</span>{text.slice(i + n.length)}</>;
}

function readRecent(): string[] {
  try { const v = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); return Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 5) : []; } catch { return []; }
}
function saveRecent(q: string) {
  const v = q.trim(); if (!v) return;
  try { localStorage.setItem(RECENT_KEY, JSON.stringify([v, ...readRecent().filter((x) => x.toLowerCase() !== v.toLowerCase())].slice(0, 5))); } catch {}
}

const OPEN_EVENT = 'acx:search-open';
const openPalette = (q?: string) => window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: q }));

function Palette() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [q, setQ] = useState('');
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  const show = useCallback((initial?: string) => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setClosing(false); setOpen(true); setQ(initial || ''); setActive(0); setRecent(readRecent());
    loadIndex().then(setIndex);
    requestAnimationFrame(() => input.current?.focus());
  }, []);

  const hide = useCallback(() => {
    setClosing(true);
    setTimeout(() => { setOpen(false); setClosing(false); setQ(''); lastFocus.current?.focus?.(); }, 170);
  }, []);

  // Triggers + keyboard shortcuts (Ctrl/Cmd+K anywhere, "/" when not typing).
  useEffect(() => {
    const onOpen = (e: Event) => show((e as CustomEvent<string | undefined>).detail);
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); if (open) hide(); else show(); }
      else if (e.key === '/' && !typing && !open) { e.preventDefault(); show(); }
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener(OPEN_EVENT, onOpen); window.removeEventListener('keydown', onKey); };
  }, [open, show, hide]);

  // ?q=... (e.g. from an old link) opens the palette with that text.
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get('q');
    if (v !== null) show(v);
  }, [show]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const results = useMemo(() => (index && q.trim() ? searchEntries(index, q) : []), [index, q]);
  // Grouped by type, in rank order of the best hit of each group.
  const groups = useMemo(() => {
    const m = new Map<Type, SearchEntry[]>();
    for (const r of results) { if (!m.has(r.type)) m.set(r.type, []); m.get(r.type)!.push(r); }
    return [...m.entries()];
  }, [results]);
  const flat = useMemo(() => groups.flatMap(([, items]) => items), [groups]);
  const emptyItems = useMemo(() => [
    ...recent.map((r) => ({ kind: 'recent' as const, label: r })),
    ...QUICK.map((x) => ({ kind: 'quick' as const, ...x })),
  ], [recent]);
  const count = q.trim() ? flat.length : emptyItems.length;

  useEffect(() => { setActive(0); }, [q]);
  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const go = (href: string) => { saveRecent(q); window.location.href = href; };
  const pickActive = () => {
    if (q.trim()) { const r = flat[active]; if (r) go(r.href); return; }
    const it = emptyItems[active]; if (!it) return;
    if (it.kind === 'recent') { setQ(it.label); input.current?.focus(); } else go(it.href);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (count ? (a + 1) % count : 0)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (count ? (a - 1 + count) % count : 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); pickActive(); }
    else if (e.key === 'Escape') { e.preventDefault(); hide(); }
  };

  const removeRecent = (r: string) => {
    const next = readRecent().filter((x) => x !== r);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
    setRecent(next);
  };

  if (!mounted || !open) return null;

  let n = -1;
  const loading = !index && q.trim();
  return createPortal(
    <div className={'sp-root' + (closing ? ' closing' : '')} onMouseDown={(e) => { if (e.target === e.currentTarget) hide(); }}>
      <div className="sp-panel" role="dialog" aria-modal="true" aria-label="Search AlexCyberX">
        <div className="sp-input-row">
          <SearchGlyph size={18} />
          <input ref={input} id="desktopSearchInput" className="sp-input" type="text" placeholder="Search courses, chapters, CTF rooms, tools..."
            autoComplete="off" spellCheck={false} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
            role="combobox" aria-expanded="true" aria-controls="navSearchDesktopResults" aria-activedescendant={count ? `sp-opt-${active}` : undefined} />
          {q && <button type="button" className="sp-clear" aria-label="Clear" onClick={() => { setQ(''); input.current?.focus(); }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>}
          <button type="button" className="sp-esc" onClick={hide}>Esc</button>
        </div>
        <div className="sp-line" aria-hidden="true"><span className={loading ? 'on' : ''} /></div>

        <div className="sp-body" id="navSearchDesktopResults" role="listbox" ref={list}>
          {!q.trim() && (
            <>
              {recent.length > 0 && <div className="sp-group">Recent</div>}
              {recent.map((r) => { n++; const i = n; return (
                <div key={'r' + r} id={`sp-opt-${i}`} data-idx={i} role="option" aria-selected={active === i}
                  className={'sp-item sp-recent' + (active === i ? ' active' : '')} style={{ ['--d' as string]: i }}
                  onMouseMove={() => setActive(i)} onClick={() => { setQ(r); input.current?.focus(); }}>
                  <span className="sp-ic sp-ic-muted"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="8" cy="8" r="5.8" /><path d="M8 4.8V8l2.2 1.4" /></svg></span>
                  <span className="sp-tx"><b>{r}</b></span>
                  <button type="button" className="sp-x" aria-label={`Remove ${r}`} onClick={(e) => { e.stopPropagation(); removeRecent(r); }}>
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                  </button>
                </div>); })}
              <div className="sp-group">Quick links</div>
              {QUICK.map((x) => { n++; const i = n; return (
                <a key={x.href} href={x.href} id={`sp-opt-${i}`} data-idx={i} role="option" aria-selected={active === i}
                  className={'sp-item' + (active === i ? ' active' : '')} style={{ ['--d' as string]: i }}
                  onMouseMove={() => setActive(i)} onClick={(e) => { e.preventDefault(); go(x.href); }}>
                  <span className="sp-ic"><TypeIcon type={x.type} /></span>
                  <span className="sp-tx"><b>{x.title}</b><small>{x.sub}</small></span>
                  <span className="sp-enter" aria-hidden="true">↵</span>
                </a>); })}
            </>
          )}

          {q.trim() && loading && [0, 1, 2].map((k) => <div key={k} className="sp-skel"><i /><span><b /><small /></span></div>)}

          {q.trim() && !loading && !flat.length && (
            <div className="search-no-results sp-empty">
              <div className="sp-empty-ic"><SearchGlyph size={22} /></div>
              <p>No results for &quot;<strong>{q}</strong>&quot;</p>
              <div className="sp-chips">{SUGGEST.map((s) => <button key={s} type="button" onClick={() => { setQ(s); input.current?.focus(); }}>{s}</button>)}</div>
            </div>
          )}

          {q.trim() && groups.map(([type, items]) => (
            <div key={type}>
              <div className="sp-group">{GROUP[type]}</div>
              {items.map((r) => { n++; const i = n; return (
                <a key={r.href + i} href={r.href} id={`sp-opt-${i}`} data-idx={i} role="option" aria-selected={active === i}
                  className={'search-result-item sp-item' + (active === i ? ' active' : '')} style={{ ['--d' as string]: i }}
                  onMouseMove={() => setActive(i)} onClick={(e) => { e.preventDefault(); go(r.href); }}>
                  <span className={'sp-ic sp-ic-' + r.type}><TypeIcon type={r.type} /></span>
                  <span className="sp-tx"><b><Highlight text={r.title} q={q} /></b><small>{r.sub}</small></span>
                  <span className={`sri-badge ${r.type === 'blog' ? 'chapter' : r.type}`}>{BADGE[r.type]}</span>
                  <span className="sp-enter" aria-hidden="true">↵</span>
                </a>); })}
            </div>
          ))}
        </div>

        <div className="sp-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> move</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
          <span className="sp-brand">AlexCyberX search</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function useShortcutLabel() {
  const [label, setLabel] = useState('Ctrl K');
  useEffect(() => { if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) setLabel('⌘ K'); }, []);
  return label;
}

export function DesktopSearch() {
  const kbd = useShortcutLabel();
  return (
    <div className="nav-search-desktop" id="navSearchDesktop">
      <button type="button" className="nav-search-pill sp-trigger" id="navSearchPill" aria-label="Search (Ctrl+K)"
        onMouseEnter={() => loadIndex()} onFocus={() => loadIndex()} onClick={() => openPalette()}>
        <SearchGlyph size={13} />
        <span className="sp-trigger-tx">Search</span>
        <kbd className="sp-trigger-kbd" suppressHydrationWarning>{kbd}</kbd>
      </button>
      <Palette />
    </div>
  );
}

export function MobileSearch() {
  return (
    <div className="nav-search-wrap" id="navSearchWrap">
      <button className="nav-search-icon-btn sp-trigger-m" id="navSearchToggle" title="Search" type="button" aria-label="Search"
        onClick={() => { loadIndex(); openPalette(); }}>
        <SearchGlyph size={16} />
      </button>
    </div>
  );
}
