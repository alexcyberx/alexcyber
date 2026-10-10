import type { Metadata, Viewport } from 'next';
import CookieBanner from '@/components/CookieBanner';
import Nav from '@/components/Nav';
import { SITE_URL } from '@/lib/blog';
import './compat.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Blog - AlexCyberX',
  description: 'Cybersecurity articles and tutorials from AlexCyberX.',
  openGraph: { siteName: 'AlexCyberX', locale: 'en_IN', type: 'website' },
  twitter: { card: 'summary_large_image', site: '@alexcyberx', creator: '@alexcyberx' },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  colorScheme: 'dark',
};

// The stylesheets are the old site's own files (served by Express from /css),
// so the blog looks exactly like the rest of the site and stays in sync with it.
const SHARED_CSS = ['variables', 'nav', 'auth', 'animations', 'ctf-room'];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
        />
        {SHARED_CSS.map((name) => (
          // eslint-disable-next-line @next/next/no-css-tags
          <link key={name} rel="stylesheet" href={`/css/${name}.css`} />
        ))}
      </head>
      <body>
        <Nav />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
