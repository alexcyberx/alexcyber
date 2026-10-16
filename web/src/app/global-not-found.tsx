import type { Metadata } from 'next';
import SiteDocument from '@/components/SiteDocument';
import { SITE_URL } from '@/lib/blog';
import NotFound from './(site)/not-found';

// Unknown URLs (no route matched). With two root layouts ((site), (admin))
// Next would otherwise send its bare 404; this renders the site's own page,
// server-side, with the nav and language scripts.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Page not found - AlexCyberX',
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return <SiteDocument><NotFound /></SiteDocument>;
}
