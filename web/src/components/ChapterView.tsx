'use client';

// One chapter of a course: the lesson HTML (the SPA's own string, rendered on
// the server), Previous / Next, and what loadChapter() / loadCyberChapter() /
// loadEthicalChapter() did in the browser:
//   - login gate (course pages were protected pages in the SPA): logged out ->
//     login modal, then back to this chapter;
//   - track_chapter_view (course progress) for logged-in readers;
//   - translation into the chosen language (lib/chapter-translate.ts), also
//     when the language modal changes it (i18n.js calls applyChapterTranslation
//     / restoreLabTranslation for currentPage learn/learn2/learn3);
//   - lighter svg text greys in diagrams.
// The lesson HTML itself (inline styles, red highlights) is unchanged.

import Link from 'next/link';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { browserSupabase } from '@/lib/supabase';
import { currentLang, readCache, sanitize, translateChapter } from '@/lib/chapter-translate';
import { themeChapterHtml } from '@/lib/chapter-theme';

type NavTarget = { title: string; href: string } | null;

type Props = {
  courseKey: string; // track_chapter_view p_course
  page: string; // learn | learn2 | learn3
  index: number;
  slug: string;
  /** URL of this chapter (login comes back here) */
  path: string;
  title: string;
  html: string;
  ids: { content: string; nav: string; prev: string; next: string };
  xlInfix: string;
  svgFill: Record<string, string>;
  prev: NavTarget;
  next: NavTarget;
  terms: string[];
  langNames: Record<string, string>;
};

type W = Window & {
  currentPage?: string;
  applyChapterTranslation?: (lang: string) => void;
  restoreLabTranslation?: () => void;
};

export default function ChapterView(p: Props) {
  const { user, ready, openAuth } = useAuth();
  const boxRef = useRef<HTMLDivElement>(null);
  // Read during the first client render (not rendered itself, so no hydration
  // mismatch), so the layout effect below already knows it on mount.
  const [lang, setLang] = useState<string | null>(() => (typeof window === 'undefined' ? null : currentLang()));
  const [shown, setShown] = useState<string>(p.html); // what is in the box (original or translated)
  const [progress, setProgress] = useState<{ name: string; done: number; total: number } | null>(null);

  const here = p.path;
  // Lessons are free and public (also for search engines); logging in only
  // saves progress and XP, offered by the strip above the lesson.
  const guest = ready && !user;

  // Course progress (same RPC + args as the SPA).
  const uid = user?.id;
  useEffect(() => {
    if (!uid) return;
    browserSupabase()?.rpc('track_chapter_view', { p_course: p.courseKey, p_chapter_slug: p.slug }).then(() => {}, () => {});
  }, [uid, p.courseKey, p.slug]);

  // Language: follow the language modal.
  useEffect(() => {
    const w = window as W;
    const prevPage = w.currentPage;
    w.currentPage = p.page;
    w.applyChapterTranslation = (l: string) => setLang(l || 'en');
    w.restoreLabTranslation = () => setLang('hl');
    return () => { w.currentPage = prevPage; delete w.applyChapterTranslation; delete w.restoreLabTranslation; };
  }, [p.page]);

  // Translate (or restore) whenever chapter or language changes. Layout effect:
  // a cached translation (or the "busy" state that hides the box) is in place
  // before the browser paints, so the Hinglish text never flashes.
  useLayoutEffect(() => {
    if (lang === null) return;
    const html = document.documentElement;
    const name = p.langNames[lang];
    if (lang === 'hl' || !name) { setShown(p.html); setProgress(null); html.classList.remove('acx-xl-wait'); return; }
    const key = `${lang}_${p.xlInfix}${p.index}`;
    const hit = readCache(key);
    if (hit) { setShown(sanitize(hit)); setProgress(null); html.classList.remove('acx-xl-wait'); return; }
    let cancelled = false;
    setProgress({ name, done: 0, total: 0 });
    html.classList.remove('acx-xl-wait'); // .xl-busy hides the box from now on
    translateChapter(p.html, lang, key, p.terms, (d, t) => { if (!cancelled) setProgress({ name, done: d, total: t }); }, () => cancelled)
      .then((out) => { if (!cancelled) setShown(out ?? p.html); }, () => { if (!cancelled) setShown(p.html); })
      .finally(() => { if (!cancelled) setProgress(null); });
    return () => { cancelled = true; };
  }, [lang, p.html, p.index, p.xlInfix, p.terms, p.langNames]);

  // Same as the SPA's setTimeout after each chapter load: lift dark svg text.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    box.querySelectorAll('svg text, svg tspan').forEach((t) => {
      const f = t.getAttribute('fill');
      if (f && p.svgFill[f]) t.setAttribute('fill', p.svgFill[f]);
    });
  }, [shown, p.svgFill]);

  // Old fixed colours -> theme variables (lib/chapter-theme.ts).
  const themed = useMemo(() => themeChapterHtml(shown), [shown]);

  const pct = progress && progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <>
      {progress && (
        <div className="xl-loader" role="status" aria-live="polite">
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <circle cx="18" cy="18" r="15" stroke="rgba(var(--accent-rgb),0.15)" strokeWidth="2.5" />
            <path d="M18 3a15 15 0 0 1 15 15" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div className="xl-loader-title">Translating to {progress.name}</div>
          <div className="xl-loader-bar"><div style={{ width: pct + '%' }} /></div>
          <div className="xl-loader-status">{progress.total ? `${progress.done} / ${progress.total} done` : 'Starting...'}</div>
        </div>
      )}
      {guest && (
        <div className="course-save-strip chapter-body" role="note">
          <span>Free lesson. Log in to save your progress and earn XP.</span>
          <a href={`/?auth=login&next=${encodeURIComponent(here)}`} onClick={(e) => { e.preventDefault(); openAuth('login', here); }}>Log in</a>
          <a href={`/?auth=signup&next=${encodeURIComponent(here)}`} onClick={(e) => { e.preventDefault(); openAuth('signup', here); }}>Create free account</a>
        </div>
      )}
      <div
        ref={boxRef}
        className={'content chapter-body' + (progress ? ' xl-busy' : '')}
        id={p.ids.content}
        data-chapter={p.slug}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: themed }}
      />
      <div className="chapter-nav chapter-body" id={p.ids.nav}>
        <NavBtn dir="prev" id={p.ids.prev} target={p.prev} />
        <NavBtn dir="next" id={p.ids.next} target={p.next} />
      </div>
    </>
  );
}

function NavBtn({ dir, id, target }: { dir: 'prev' | 'next'; id: string; target: NavTarget }) {
  const arrow = dir === 'prev'
    ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M9 2L5 7l4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
    : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M5 2l4 5-4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
  const label = <div style={dir === 'next' ? { textAlign: 'right' } : undefined}><span className="label">{dir === 'prev' ? 'Previous' : 'Next'}</span><span className="title">{target ? target.title : '-'}</span></div>;
  if (!target) return <span className={`chapter-nav-btn ${dir}`} id={id} style={{ visibility: 'hidden' }} aria-hidden="true">{dir === 'prev' ? <>{arrow}{label}</> : <>{label}{arrow}</>}</span>;
  return (
    <Link className={`chapter-nav-btn ${dir}`} id={id} href={target.href} rel={dir}>
      {dir === 'prev' ? <>{arrow}{label}</> : <>{label}{arrow}</>}
    </Link>
  );
}
