import AuthModals from '@/components/AuthModals';
import CookieBanner from '@/components/CookieBanner';
import LegacyI18n from '@/components/LegacyI18n';
import Nav from '@/components/Nav';
import SiteRuntime from '@/components/SiteRuntime';
import ThemeSync from '@/components/ThemeSync';
import { AuthProvider } from '@/lib/auth-context';
import { THEME_BOOT } from '@/lib/theme';
import '../app/(site)/compat.css';
import '../app/(site)/nav-upgrade.css';
import '../app/(site)/search.css';

// The stylesheets are the old site's own files (served by Express from /css),
// in the same order as index.html (later files override earlier ones),
// so the migrated pages look exactly like the rest of the site and stay in sync.
const SHARED_CSS = ['variables', 'nav', 'home', 'learn', 'auth', 'profile', 'modal', 'animations', 'ctf-room'];

/** The site's whole document (head, nav, auth, cookie banner, language, runtime).
 * Used by (site)/layout.tsx and by app/global-not-found.tsx, so unknown URLs get
 * the same server-rendered page as every other site page. */
export default function SiteDocument({ children }: { children: React.ReactNode }) {
  return (
    // No data-theme here: THEME_BOOT / ThemeSync own it. A value in JSX was
    // written back as "dark" (green) whenever React rendered <html> itself.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600;700&display=swap"
        />
        {SHARED_CSS.map((name) => (
          // eslint-disable-next-line @next/next/no-css-tags
          <link key={name} rel="stylesheet" href={`/css/${name}.css`} />
        ))}
      </head>
      <body>
        <ThemeSync />
        {/* Same fixed background glow as index.html (css/home.css) */}
        <div className="glow-orb"></div>
        <AuthProvider>
          <Nav />
          {children}
          <AuthModals />
        </AuthProvider>
        <CookieBanner />
        <LegacyI18n />
        <SiteRuntime />
        <script src="/js/spotlight.js" defer />
      </body>
    </html>
  );
}
