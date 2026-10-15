'use client';

// Nav search for the Next pages (desktop pill + mobile icon), same markup and
// classes as js/search.js. The index comes from /search-index.json (built on
// the server from the DB: courses, every chapter, CTF rooms, blog, tools).

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SearchEntry } from '@/lib/search';

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

export function searchEntries(index: SearchEntry[], raw: string): SearchEntry[] {
  const q = raw.trim().toLowerCase();
  if (!q) return [];
  const scored: { e: SearchEntry; s: number }[] = [];
  for (const e of index) {
    if (!e || !e.title) continue;
    const t = e.title.toLowerCase();
    const tags = e.tags || [];
    let s = 0;
    if (t.startsWith(q)) s = 4;
    else if (t.includes(q)) s = 3;
    else if (tags.some((tag) => tag.startsWith(q))) s = 2;
    else if ((e.sub || '').toLowerCase().includes(q) || tags.some((tag) => tag.includes(q))) s = 1;
    if (s) scored.push({ e, s });
  }
  // Courses/rooms first on equal score, then the order of the index.
  const typeRank: Record<SearchEntry['type'], number> = { course: 0, ctf: 1, tool: 2, chapter: 3, blog: 4 };
  return scored.sort((a, b) => b.s - a.s || typeRank[a.e.type] - typeRank[b.e.type]).slice(0, 8).map((x) => x.e);
}

const BADGE: Record<SearchEntry['type'], string> = { course: 'Course', chapter: 'Chapter', ctf: 'CTF', tool: 'Tool', blog: 'Blog' };

function Highlight({ text, q }: { text: string; q: string }) {
  const i = text.toLowerCase().indexOf(q.trim().toLowerCase());
  if (!q.trim() || i < 0) return <>{text}</>;
  const n = q.trim().length;
  return <>{text.slice(0, i)}<span className="search-highlight">{text.slice(i, i + n)}</span>{text.slice(i + n)}</>;
}

function Results({ results, q, active, onPick }: { results: SearchEntry[]; q: string; active: number; onPick: (e: SearchEntry) => void }) {
  if (!results.length) {
    return <div className="search-no-results">No results for &quot;<strong style={{ color: 'var(--fg-3)' }}>{q}</strong>&quot;</div>;
  }
  return (
    <>
      {results.map((r, i) => (
        <a key={r.href + i} className={'search-result-item' + (i === active ? ' active' : '')} href={r.href}
          style={{ textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); onPick(r); }}>
          <div className="sri-text">
            <div className="sri-title"><Highlight text={r.title} q={q} /></div>
            <div className="sri-sub">{r.sub}</div>
          </div>
          <span className={`sri-badge ${r.type === 'blog' ? 'chapter' : r.type}`}>{BADGE[r.type]}</span>
        </a>
      ))}
    </>
  );
}

function useSearch() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [active, setActive] = useState(-1);
  const req = useRef(0);

  const run = useCallback(async (v: string) => {
    setQ(v);
    setActive(-1);
    if (!v.trim()) { setResults([]); return; }
    const id = ++req.current;
    const index = await loadIndex();
    if (id === req.current) setResults(searchEntries(index, v));
  }, []);

  const onKey = (e: React.KeyboardEvent, pick: (r: SearchEntry) => void, close: () => void) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); const r = results[active >= 0 ? active : 0]; if (r) pick(r); }
    else if (e.key === 'Escape') close();
  };

  return { q, results, active, run, onKey, reset: () => { setQ(''); setResults([]); setActive(-1); } };
}

const go = (r: SearchEntry) => { window.location.href = r.href; };

export function DesktopSearch() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const s = useSearch();
  const close = useCallback(() => { setOpen(false); s.reset(); }, [s]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) close(); };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [open, close]);

  // ?q=... (e.g. from an old link) opens the search with that text.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q && window.matchMedia('(min-width: 769px)').matches) { setOpen(true); s.run(q); input.current?.focus(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="nav-search-desktop" id="navSearchDesktop" ref={wrap}>
      <div className={'nav-search-pill' + (open ? ' expanded' : '')} id="navSearchPill"
        onClick={() => { setOpen(true); loadIndex(); input.current?.focus(); }}>
        <svg width="13" height="13" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="6.5" cy="6.5" r="5" stroke="#555" strokeWidth="1.4" />
          <path d="M10.5 10.5L13.5 13.5" stroke="#555" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input ref={input} type="text" id="desktopSearchInput" placeholder="Search..." autoComplete="off"
          value={s.q} onFocus={() => { setOpen(true); loadIndex(); }} onChange={(e) => s.run(e.target.value)}
          onKeyDown={(e) => s.onKey(e, go, close)} />
      </div>
      <div className="nav-search-desktop-results" id="navSearchDesktopResults" style={{ display: open && s.q.trim() ? '' : 'none' }}>
        {open && s.q.trim() ? <Results results={s.results} q={s.q} active={s.active} onPick={go} /> : null}
      </div>
    </div>
  );
}

export function MobileSearch() {
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const s = useSearch();
  const close = () => { setOpen(false); s.reset(); };

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q !== null && window.matchMedia('(max-width: 768px)').matches) { setOpen(true); if (q) s.run(q); setTimeout(() => input.current?.focus(), 60); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="nav-search-wrap" id="navSearchWrap">
      <button className="nav-search-icon-btn" id="navSearchToggle" title="Search" type="button"
        style={{ display: open ? 'none' : 'flex' }}
        onClick={() => { setOpen(true); loadIndex(); setTimeout(() => input.current?.focus(), 60); }}>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <circle cx="6.5" cy="6.5" r="5" stroke="#6a6a7a" strokeWidth="1.4" />
          <path d="M10.5 10.5L13.5 13.5" stroke="#6a6a7a" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <div className="nav-search-expanded" id="navSearchExpanded" style={{ display: open ? 'flex' : 'none' }}>
        <svg width="13" height="13" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginLeft: 10 }}>
          <circle cx="6.5" cy="6.5" r="5" stroke="#555" strokeWidth="1.4" />
          <path d="M10.5 10.5L13.5 13.5" stroke="#555" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input ref={input} type="text" id="heroSearchInput" placeholder="Search courses, chapters..." autoComplete="off"
          value={s.q} onChange={(e) => s.run(e.target.value)} onKeyDown={(e) => s.onKey(e, go, close)} />
        <button id="searchClearBtn" type="button" onClick={close}
          style={{ display: 'flex', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', opacity: 0.6 }} aria-label="Close search">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="#888" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
      </div>
      <div className="search-results-dropdown" id="searchResultsDropdown" style={{ display: open && s.q.trim() ? '' : 'none' }}>
        {open && s.q.trim() ? <Results results={s.results} q={s.q} active={s.active} onPick={go} /> : null}
      </div>
    </div>
  );
}
