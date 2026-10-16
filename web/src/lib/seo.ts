// Structured data (schema.org JSON-LD) shared by the pages, so search engines
// and AI answer engines read who we are and what each page is. One site URL
// (NEXT_PUBLIC_SITE_URL, see lib/blog.ts) feeds every absolute link, so moving
// to the final domain is one setting.

import { SITE_URL } from './blog';

export const ORG_ID = `${SITE_URL}/#org`;
export const PERSON_ID = `${SITE_URL}/#founder`;
export const SITE_ID = `${SITE_URL}/#website`;

export const abs = (p: string) => (p.startsWith('http') ? p : SITE_URL + (p.startsWith('/') ? p : '/' + p));

export const ORG = {
  '@type': 'EducationalOrganization',
  '@id': ORG_ID,
  name: 'AlexCyberX',
  url: SITE_URL + '/',
  logo: abs('/brand/icon-512.png'),
  description: 'Free cybersecurity education platform for Indian students: courses in Hinglish, hands-on CTF labs and security tools.',
  founder: { '@id': PERSON_ID },
  sameAs: ['https://instagram.com/alex.cyberx', 'https://github.com/alexcyberx', 'https://linkedin.com/in/alexcyberx'],
};

export const PERSON = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Pavan Kumar',
  alternateName: 'AlexCyberX',
  jobTitle: 'Founder, AlexCyberX',
  url: SITE_URL + '/#about',
  sameAs: ['https://instagram.com/alex.cyberx', 'https://github.com/alexcyberx', 'https://linkedin.com/in/alexcyberx'],
};

/** JSON for a <script type="application/ld+json"> tag ('<' escaped so text can never close the tag). */
export function ld(obj: Record<string, unknown> | Record<string, unknown>[]): string {
  const graph = Array.isArray(obj) ? { '@context': 'https://schema.org', '@graph': obj } : { '@context': 'https://schema.org', ...obj };
  return JSON.stringify(graph).replace(/</g, '\\u003c');
}

export function breadcrumb(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

/** Plain-text excerpt for descriptions (no tags, no entities, one line). */
export function plain(html: string, max = 160): string {
  const t = html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : t;
}

/** A free web tool page: WebApplication + breadcrumb. */
export function toolLd(t: { title: string; desc: string; href: string; tag: string }): string {
  return ld([
    ORG,
    {
      '@type': 'WebApplication',
      '@id': abs(t.href) + '#app',
      name: t.title,
      description: t.desc.replace(/`/g, ''),
      url: abs(t.href),
      applicationCategory: 'SecurityApplication',
      applicationSubCategory: t.tag,
      operatingSystem: 'Any (web browser)',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'INR' },
      publisher: { '@id': ORG_ID },
      creator: { '@id': PERSON_ID },
    },
    breadcrumb([{ name: 'Home', path: '/' }, { name: 'Tools', path: '/tools' }, { name: t.title, path: t.href }]),
  ]);
}

/** Default share image (app/opengraph-image.tsx). Pages that set their own
 * openGraph lose the inherited one, so they add this explicitly. */
export const OG_IMAGE = { url: '/opengraph-image', width: 1200, height: 630, alt: 'AlexCyberX: free cybersecurity courses, CTF labs and tools' };
