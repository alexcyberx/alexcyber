'use client';

// React port of the <nav id="mainNav"> + mobile menu from index.html.
// Same ids/classes so css/nav.css styles it unchanged. Links that belong to
// the old SPA are plain <a href> (full page load into index.html); the old
// SPA reads ?auth= / ?lang= / #section on load (see js/router.js).

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
    icon: <path d="M3 12V7M7 12V2M11 12V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    href: '/blog',
    label: 'Blog',
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
    icon: <path d="M2 3.5h4l1.2 1.5H12v6.5a1 1 0 01-1 1H2a1 1 0 01-1-1v-7a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />,
  },
  {
    href: '/community',
    label: 'Community',
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
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    if (!menuOpen) setMMoreOpen(false);
  }, [menuOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    const close = () => setMoreOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [moreOpen]);

  const openMore = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setMoreOpen(true); };
  const scheduleClose = () => { closeTimer.current = setTimeout(() => setMoreOpen(false), 180); };

  return (
    <>
      <nav id="mainNav">
        <a className="nav-logo" href="/">
          <div className="logo-text"><strong>Alex <em>CyberX</em></strong></div>
        </a>

        <div className="nav-center" id="homeNavCenter">
          <a className="nav-link" href="/">Home</a>
          <a className="nav-link" href="/#tutorials">Tutorials</a>
          <a className="nav-link" href="/tools">Tools</a>
          <a className="nav-link" href="/rooms">CTF</a>
          <div
            className={'nav-dropdown' + (moreOpen ? ' open' : '')}
            id="navMoreDropdown"
            onMouseEnter={openMore}
            onMouseLeave={scheduleClose}
          >
            <button
              className="nav-link nav-dropdown-trigger"
              onClick={(e) => { e.stopPropagation(); setMoreOpen((v) => !v); }}
            >
              More <Chevron />
            </button>
            <div className="nav-dropdown-menu" id="navMoreDropdownMenu">
              {MORE_LINKS.map((l) => (
                <a key={l.href} className="nav-dropdown-item" href={l.href}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">{l.icon}</svg>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
          <a className="nav-link" href="/#about">About</a>
          <a className="nav-link" href="/#contact">Contact</a>
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
          {!user && (
            <>
              <a className="nav-btn ghost" id="navLoginBtn" href={`/?auth=login&next=${next}`} onClick={(e) => { e.preventDefault(); openAuth('login'); }} data-i18n="nav.login" suppressHydrationWarning>Login</a>
              <a className="nav-btn fill" id="navSignupBtn" href={`/?auth=signup&next=${next}`} onClick={(e) => { e.preventDefault(); openAuth('signup'); }} data-i18n="nav.signup" suppressHydrationWarning>Sign Up</a>
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
            <div className="nav-avatar-dropdown">
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

      <div className={'mobile-menu' + (menuOpen ? ' show' : '')} id="mobileMenu">
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
        <a className="m-nav" href="/?lang=1" onClick={(e) => { setMenuOpen(false); openLangModal(e); }} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <GlobeIcon size={15} />
          <span id="mLangLabel" data-i18n="nav.lang" suppressHydrationWarning>Select Language</span>
        </a>
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
