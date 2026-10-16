'use client';

// Frame of a course page (#learnPage / #learn2Page / #learn3Page in index.html):
// the learn sub-nav (sidebar toggle + breadcrumb), the chapter sidebar and the
// banner. It lives in the course layout, so it stays mounted while the reader
// moves between chapters (sidebar open/closed and its scroll position stay).
// Same ids and classes as the SPA, styled by css/learn.css.
//
// Changes from the SPA: chapters are real links (/tutorials/<course>/<chapter>,
// open in a new tab, shareable, Back works), the breadcrumb goes to the course
// list, and the active chapter is scrolled into view in the sidebar.

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export type ShellChapter = { num: string; title: string; slug: string };

type Props = {
  course: string;
  page: string;
  ids: { overlay: string; sidebar: string; list: string; main: string };
  itemClass: string;
  header: string;
  banner: { tag: string; h1: string; desc: string };
  chapters: ShellChapter[]; // enabled ones only, in order
  firstSlug: string;
  children: React.ReactNode;
};

const MOBILE = 768;

export default function CourseShell({ course, page, ids, itemClass, header, banner, chapters, firstSlug, children }: Props) {
  const path = usePathname() || '';
  const router = useRouter();
  const base = `/tutorials/${course}`;
  const seg = path.startsWith(base + '/') ? decodeURIComponent(path.slice(base.length + 1).split('/')[0]) : '';
  const active = seg || firstSlug;

  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Old deep links /tutorials/<course>?ch=<slug> (Express redirects them; this
  // covers a direct hit on the Next app).
  useEffect(() => {
    const ch = new URLSearchParams(window.location.search).get('ch');
    if (ch && /^[a-z0-9-]+$/.test(ch) && !seg) router.replace(`${base}/${ch}`);
  }, [base, seg, router]);

  // Mobile: a chapter click closes the drawer (the SPA did this in loadChapter()).
  useEffect(() => { setMobileOpen(false); }, [path]);

  // Keep the active chapter visible in a long sidebar.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('.chapter-item.active');
    const box = el?.closest('.sidebar') as HTMLElement | null;
    if (el && box && (el.offsetTop < box.scrollTop || el.offsetTop + el.offsetHeight > box.scrollTop + box.clientHeight)) {
      box.scrollTop = el.offsetTop - box.clientHeight / 3;
    }
  }, [active]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > MOBILE) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Diagram iframes (/diagrams/*.html) report their height (router.js did this).
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string; height?: unknown } | null;
      if (!d || d.type !== 'acx-diagram-height') return;
      document.querySelectorAll<HTMLIFrameElement>('iframe.acx-diagram-frame').forEach((f) => {
        if (f.contentWindow === e.source) {
          const h = Math.max(parseInt(String(d.height), 10) || 0, 100);
          f.style.height = h + 8 + 'px';
          f.setAttribute('scrolling', 'no');
          f.style.overflow = 'hidden';
        }
      });
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const toggle = () => {
    if (window.innerWidth <= MOBILE) setMobileOpen((o) => !o);
    else setDesktopOpen((o) => !o);
  };

  return (
    <div id={`${page}Page`} className="page active course-page">
      <div id="learnSubNav" className="visible">
        <div className="lsn-left">
          <button className="lsn-toggle" id="sidebarToggle" onClick={toggle} aria-label="Show or hide chapters" aria-controls={ids.sidebar}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1" y="2.5" width="14" height="1.5" rx="1" fill="currentColor" />
              <rect x="1" y="7.25" width="14" height="1.5" rx="1" fill="currentColor" />
              <rect x="1" y="12" width="14" height="1.5" rx="1" fill="currentColor" />
            </svg>
          </button>
          {/* div, not <nav>: css/nav.css styles every nav as the fixed top bar */}
          <div className="lsn-breadcrumb" role="navigation" aria-label="Breadcrumb">
            <Link href="/tutorials" data-i18n="nav.tutorials" suppressHydrationWarning>Tutorials</Link>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <span id="lsnBreadcrumbLabel">{header}</span>
          </div>
        </div>
      </div>

      <div className={'overlay' + (mobileOpen ? ' show' : '')} id={ids.overlay} onClick={() => setMobileOpen(false)} />

      <div className="learn-layout">
        <aside className={'sidebar' + (desktopOpen ? '' : ' hidden') + (mobileOpen ? ' show' : '')} id={ids.sidebar} aria-label={`${header} chapters`}>
          <div className="sidebar-header">{header}</div>
          <div className="chapter-list" id={ids.list} ref={listRef}>
            {chapters.map((c) => (
              <Link
                key={c.slug}
                href={`${base}/${c.slug}`}
                className={(itemClass ? itemClass + ' ' : '') + 'chapter-item' + (c.slug === active ? ' active' : '')}
                aria-current={c.slug === active ? 'page' : undefined}
                data-slug={c.slug}
              >
                <span className="chapter-num">{c.num}</span><span style={{ flex: 1 }}>{c.title}</span>
                <svg className="chapter-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </Link>
            ))}
          </div>
        </aside>

        <main className={'learn-main' + (desktopOpen ? '' : ' full')} id={ids.main}>
          <div className="content-area">
            <div className="topic-banner">
              <div className="topic-banner-tag" data-i18n={`${page}.tag`} suppressHydrationWarning>{banner.tag}</div>
              <h1 data-i18n={`${page}.title`} suppressHydrationWarning>{banner.h1}</h1>
              <p data-i18n={`${page}.desc`} suppressHydrationWarning>{banner.desc}</p>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
