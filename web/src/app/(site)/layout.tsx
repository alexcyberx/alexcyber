import type { Metadata, Viewport } from 'next';
import SiteDocument from '@/components/SiteDocument';
import { SITE_URL } from '@/lib/blog';
import { OG_IMAGE } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'AlexCyberX',
  description: 'AlexCyberX: free cybersecurity education in Hindi with hands-on CTF labs.',
  openGraph: { images: [OG_IMAGE], siteName: 'AlexCyberX', locale: 'en_IN', type: 'website' },
  twitter: { card: 'summary_large_image', site: '@alexcyberx', creator: '@alexcyberx' },
  // brand/ (served by Express at the root): Glitch X mark.
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }, { url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  // Search Console / Bing Webmaster ownership tags, set on Render when the
  // final domain is live (empty -> no tag).
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_VERIFICATION ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION } : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: '#0b0d0d',
  colorScheme: 'dark',
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument>{children}</SiteDocument>;
}
