'use client';

// React port of the <nav id="mainNav"> + mobile menu from index.html.
// Same ids/classes so css/nav.css styles it; app/nav-upgrade.css adds the
// Next-only upgrade (sliding hover pill, active underline, scroll state,
// reading progress, animated menus). Links that belong to
// the old SPA are plain <a href> (full page load into index.html); the old
// SPA reads ?auth= / ?lang= / #section on load (see js/router.js).

import LogoMark from '@/components/LogoMark';
import ThemeToggle, { ThemeIcon } from '@/components/ThemeToggle';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DesktopSearch, MobileSearch } from './NavSearch';

function GlobeIcon({ size = 14 }: { size?: number }) {
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <circle cx={c} cy={c} r={c - 1} stroke="#6a6a7a" strokeWidth="1.2" />
      <ellipse cx={c} cy={c} rx={size / 5} ry={c - 1} stroke="#6a6a7a" strokeWidth="1.2" />
      <line x1="1.2" y1={size * 0.32} x2={size - 1.2} y2={size * 0.32} stroke="#6a6a7a" strokeWidth="1.2" />
      <line x1="1.2" y1={size * 0.68} x2={size - 1.2} y2={size * 0.68} stroke="#6a6a7a" strokeWidth="1.2" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Opens the old language modal (js/i18n.js is loaded on every Next page).
function openLangModal(e: React.MouseEvent) {
  const w = window as unknown as { showLangModal?: () => void };
  if (typeof w.showLangModal === 'function') {
    e.preventDefault();
    w.showLangModal();
  }
}

const MORE_LINKS = [
  {
    href: '/leaderboard',
    label: 'Leaderboard',
    desc: 'Top hackers by XP',
    icon: <path d="M3 12V7M7 12V2M11 12V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    href: '/blog',
    label: 'Blog',
    desc: 'Writeups, CVEs and guides',
    icon: (
      <>
        <rect x="1.5" y="1.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M4 4.5h6M4 7h6M4 9.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </>
    ),
  },
  {
    href: '/resources',
    label: 'Resources',
    desc: 'Notes, cheat sheets, files',
    icon: <path d="M2 3.5h4l1.2 1.5H12v6.5a1 1 0 01-1 1H2a1 1 0 01-1-1v-7a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />,
  },
  {
    href: '/community',
    label: 'Community',
    desc: 'Ask and share with others',
    icon: <path d="M2 3h10a1 1 0 011 1v5a1 1 0 01-1 1H6l-3 2.5V10H2a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />,
  },
];

export default function Nav() {
  // After login the SPA sends the user back to the page they came from.
  const next = encodeURIComponent(usePathname() || '/');
  const { user, openAuth, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mMoreOpen, setMMoreOpen] = useState(false);
  const [mThemeOpen, setMThemeOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const path = usePathname() || '/';
  const centerRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number; on: boolean }>({ x: 0, w: 0, on: false });
  const [mark, setMark] = useState<{ x: number; w: number } | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  // Which top-level link belongs to this page (for the active underline).
  const activeKey = path === '/' ? 'home'
    : path.startsWith('/tutorials') ? 'tutorials'
    : path.startsWith('/tools') ? 'tools'
    : path.startsWith('/rooms') ? 'ctf'
    : MORE_LINKS.some((l) => path.startsWith(l.href)) || path.startsWith('/u/') ? 'more'
    : '';

  // Hover pill: one highlight that slides to whichever link is under the mouse.
  function hover(e: React.MouseEvent<HTMLElement>) {
    const c = centerRef.current; if (!c) return;
    const r = e.currentTarget.getBoundingClientRect(), cr = c.getBoundingClientRect();
    setPill({ x: r.left - cr.left + c.scrollLeft, w: r.width, on: true });
  }
  const unhover = () => setPill((p) => ({ ...p, on: false }));

  // Active underline sits under the current page's link.
  useEffect(() => {
    const place = () => {
      const c = centerRef.current; if (!c) return;
      const el = c.querySelector<HTMLElement>(`[data-key="${activeKey}"]`);
      if (!el) { setMark(null); return; }
      const r = el.getBoundingClientRect(), cr = c.getBoundingClientRect();
      setMark({ x: r.left - cr.left + c.scrollLeft + r.width / 2, w: Math.min(18, r.width - 16) });
    };
    place();
    const t = setTimeout(place, 400); // after web fonts settle
    window.addEventListener('resize', place);
    return () => { clearTimeout(t); window.removeEventListener('resize', place); };
  }, [activeKey]);

  // Scrolled state (stronger glass + shadow) and the reading-progress line.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
        setScrolled(y > 8);
        setProgress(max > 0 ? Math.min(1, y / max) : 0);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    if (!menuOpen) { setMMoreOpen(false); setMThemeOpen(false); }
  }, [menuOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    const close = () => setMoreOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [moreOpen]);

  // The menu is position:fixed (css/nav.css explains why), so place it under the trigger.
  const placeMenu = () => {
    const t = moreRef.current?.querySelector('.nav-dropdown-trigger'); if (!t) return;
    const r = t.getBoundingClientRect();
    // <nav> has backdrop-filter, so a fixed child is placed relative to it.
    const nav = centerRef.current?.closest('nav');
    const o = nav ? nav.getBoundingClientRect() : { left: 0, top: 0 };
    const left = Math.max(12, Math.min(r.left + r.width / 2 - 140, innerWidth - 292));
    setMenuPos({ top: r.bottom + 10 - o.top, left: left - o.left });
  };
  const openMore = () => { if (closeTimer.current) clearTimeout(closeTimer.current); placeMenu(); setMoreOpen(true); };
  const scheduleClose = () => { closeTimer.current = setTimeout(() => setMoreOpen(false), 180); };

  return (
    <>
      <nav id="mainNav" className={'nx' + (scrolled ? ' nx-scrolled' : '')}>
        <span className="nx-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
        <a className="nav-logo" href="/" aria-label="AlexCyberX home">
          <LogoMark />
          <div className="logo-text"><strong>Alex <em>CyberX</em></strong></div>
        </a>

        <div className="nav-center" id="homeNavCenter" ref={centerRef} onMouseLeave={unhover}>
          <span className={'nx-pill' + (pill.on ? ' on' : '')} style={{ transform: `translateX(${pill.x}px)`, width: pill.w }} aria-hidden="true" />
          {mark && <span className="nx-mark" style={{ transform: `translateX(${mark.x - mark.w / 2}px)`, width: mark.w }} aria-hidden="true" />}
          <a className={'nav-link' + (activeKey === 'home' ? ' active' : '')} data-key="home" href="/" onMouseEnter={hover}>Home</a>
          <a className={'nav-link' + (activeKey === 'tutorials' ? ' active' : '')} data-key="tutorials" href="/#tutorials" onMouseEnter={hover}>Tutorials</a>
          <a className={'nav-link' + (activeKey === 'tools' ? ' active' : '')} data-key="tools" href="/tools" onMouseEnter={hover}>Tools</a>
          <a className={'nav-link' + (activeKey === 'ctf' ? ' active' : '')} data-key="ctf" href="/rooms" onMouseEnter={hover}>CTF</a>
          <div
            className={'nav-dropdown' + (moreOpen ? ' open' : '')}
            id="navMoreDropdown"
            ref={moreRef}
            onMouseEnter={openMore}
            onMouseLeave={scheduleClose}
          >
            <button
              className={'nav-link nav-dropdown-trigger' + (activeKey === 'more' ? ' active' : '')}
              data-key="more"
              aria-expanded={moreOpen}
              aria-haspopup="true"
              onMouseEnter={hover}
              onClick={(e) => { e.stopPropagation(); if (!moreOpen) placeMenu(); setMoreOpen((v) => !v); }}
            >
              More <Chevron />
            </button>
          </div>
          <a className="nav-link" data-key="about" href="/#about" onMouseEnter={hover}>About</a>
          <a className="nav-link" data-key="contact" href="/#contact" onMouseEnter={hover}>Contact</a>
        </div>

        {/* Outside .nav-center: its overflow would clip the menu at 1024-1366px. */}
        <div className={'nav-dropdown-menu nx-menu' + (moreOpen ? ' open' : '')} id="navMoreDropdownMenu" style={menuPos ? { top: menuPos.top, left: menuPos.left } : undefined}
          onMouseEnter={openMore} onMouseLeave={scheduleClose} onClick={(e) => e.stopPropagation()}>
          {MORE_LINKS.map((l, i) => (
            <a key={l.href} className={'nav-dropdown-item nx-item' + (path.startsWith(l.href) ? ' current' : '')} href={l.href} style={{ ['--i' as string]: i }}>
              <span className="nx-item-ic"><svg width="14" height="14" viewBox="0 0 14 14" fill="none">{l.icon}</svg></span>
              <span className="nx-item-tx"><b>{l.label}</b><small>{l.desc}</small></span>
              <svg className="nx-item-go" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 2.5 8 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
          ))}
        </div>

        <div className="nav-right" id="homeNavRight">
          <DesktopSearch />
          <a
            className="nav-btn ghost"
            id="langNavBtn"
            href="/?lang=1"
            onClick={openLangModal}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px' }}
            title="Change Language"
          >
            <GlobeIcon />
            <span style={{ fontSize: 11, letterSpacing: 0.3 }} id="langNavLabel" suppressHydrationWarning>Language</span>
          </a>
          <ThemeToggle />
          {!user && (
            <>
              <a className="nav-btn ghost" id="navLoginBtn" href={`/?auth=login&next=${next}`} onClick={(e) => { e.preventDefault(); openAuth('login'); }} data-i18n="nav.login" suppressHydrationWarning>Login</a>
              <a className="nav-btn fill nx-shine" id="navSignupBtn" href={`/?auth=signup&next=${next}`} onClick={(e) => { e.preventDefault(); openAuth('signup'); }} data-i18n="nav.signup" suppressHydrationWarning>Sign Up</a>
            </>
          )}
          <div
            className={'nav-avatar' + (user ? ' show' : '')}
            id="navAvatar"
            onClick={() => { window.location.href = '/profile'; }}
            style={{ position: 'relative' }}
          >
            <div className="nav-avatar-pic" id="navAvatarPic">{user?.initial ?? 'A'}</div>
            <span className="nav-avatar-name" id="navAvatarName">{user?.name ?? 'User'}</span>
            <div className="nav-avatar-dropdown nx-menu">
              <a className="nav-avatar-dropdown-item" href="/profile" onClick={(e) => e.stopPropagation()}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4.5" r="2.5" stroke="#888" strokeWidth="1.2" /><path d="M2 12c0-2.8 2.2-4 5-4s5 1.2 5 4" stroke="#888" strokeWidth="1.2" strokeLinecap="round" /></svg>
                My Profile
              </a>
              <hr />
              <button className="nav-avatar-dropdown-item danger" onClick={(e) => { e.stopPropagation(); logout(); }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 7h7M9 4.5L12 7l-3 2.5" stroke="#e06060" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M6 2H3a1 1 0 00-1 1v8a1 1 0 001 1h3" stroke="#e06060" strokeWidth="1.2" strokeLinecap="round" /></svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="nav-mobile-right" id="navMobileRight">
          <MobileSearch />
          <button
            className={'hamburger' + (menuOpen ? ' open' : '')}
            id="hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <div className={'mobile-menu nx-mobile' + (menuOpen ? ' show' : '')} id="mobileMenu">
        <a className="m-nav" href="/" data-i18n="nav.home" suppressHydrationWarning>Home</a>
        <a className="m-nav" href="/#tutorials" data-i18n="nav.tutorials" suppressHydrationWarning>Tutorials</a>
        <a className="m-nav" href="/tools">Tools</a>
        <a className="m-nav" href="/rooms">CTF Challenges</a>
        <div className={'m-more-group' + (mMoreOpen ? ' open' : '')} id="mMoreGroup">
          <button
            className="m-nav m-more-toggle"
            onClick={(e) => { e.stopPropagation(); setMMoreOpen((v) => !v); }}
            aria-expanded={mMoreOpen}
          >
            More <Chevron />
          </button>
          <div className="m-more-panel">
            <div className="m-more-panel-inner">
              {MORE_LINKS.map((l) => (
                <a key={l.href} className="m-nav" href={l.href}>{l.label}</a>
              ))}
            </div>
          </div>
        </div>
        <a className="m-nav" href="/#about" data-i18n="nav.about" suppressHydrationWarning>About</a>
        <a className="m-nav" href="/#contact" data-i18n="nav.contact" suppressHydrationWarning>Contact</a>
        <div className="m-divider"></div>
        {/* Language | Theme on one row; Theme opens the preview cards below. */}
        <div className="m-split">
          <a className="m-nav" href="/?lang=1" onClick={(e) => { setMenuOpen(false); openLangModal(e); }} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <GlobeIcon size={15} />
            <span id="mLangLabel" data-i18n="nav.lang" suppressHydrationWarning>Select Language</span>
          </a>
          <span className="m-split-line" aria-hidden="true" />
          <button className={'m-nav m-theme-btn' + (mThemeOpen ? ' open' : '')} onClick={(e) => { e.stopPropagation(); setMThemeOpen((v) => !v); }}
            aria-expanded={mThemeOpen} aria-controls="mThemePanel">
            <ThemeIcon /> <span>Theme</span> <Chevron />
          </button>
        </div>
        <div className={'m-theme-panel' + (mThemeOpen ? ' open' : '')} id="mThemePanel">
          <div className="m-theme-inner"><ThemeToggle inline /></div>
        </div>
        <div className="m-divider"></div>
        {user ? (
          <div className="m-auth" id="mobileUserBtns">
            <a className="ml" href="/profile" style={{ flex: 1, textAlign: 'center' }}>My Profile</a>
            <button className="ms" onClick={logout} style={{ flex: 1, textAlign: 'center' }}>Sign Out</button>
          </div>
        ) : (
          <div className="m-auth" id="mobileAuthBtns">
            <a className="ml" href={`/?auth=login&next=${next}`} onClick={(e) => { e.preventDefault(); setMenuOpen(false); openAuth('login'); }} data-i18n="nav.login" suppressHydrationWarning>Login</a>
            <a className="ms" href={`/?auth=signup&next=${next}`} onClick={(e) => { e.preventDefault(); setMenuOpen(false); openAuth('signup'); }} data-i18n="nav.signup" suppressHydrationWarning>Sign Up</a>
          </div>
        )}
      </div>
    </>
  );
}
