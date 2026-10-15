import type { Metadata, Viewport } from 'next';
import AuthModals from '@/components/AuthModals';
import CookieBanner from '@/components/CookieBanner';
import LegacyI18n from '@/components/LegacyI18n';
import Nav from '@/components/Nav';
import SiteRuntime from '@/components/SiteRuntime';
import { AuthProvider } from '@/lib/auth-context';
import { SITE_URL } from '@/lib/blog';
import { THEME_BOOT } from '@/lib/theme';
import './compat.css';
import './nav-upgrade.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'AlexCyberX',
  description: 'AlexCyberX: free cybersecurity education in Hindi with hands-on CTF labs.',
  openGraph: { siteName: 'AlexCyberX', locale: 'en_IN', type: 'website' },
  twitter: { card: 'summary_large_image', site: '@alexcyberx', creator: '@alexcyberx' },
};

export const viewport: Viewport = {
  themeColor: '#0b0d0d',
  colorScheme: 'dark',
};

// The stylesheets are the old site's own files (served by Express from /css),
// in the same order as index.html (later files override earlier ones),
// so the migrated pages look exactly like the rest of the site and stay in sync.
const SHARED_CSS = ['variables', 'nav', 'home', 'learn', 'auth', 'profile', 'modal', 'animations', 'ctf-room'];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
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
