import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathForPage } from './routes';

// The legal pages stay authored as the old fragments in /pages/*.html (one
// source for both apps). They are read at build time from the repo root.
export const LEGAL_PAGES = {
  privacy: {
    path: '/privacy-policy', file: 'privacy.html',
    title: 'Privacy Policy - AlexCyberX',
    desc: 'Read the AlexCyberX privacy policy covering how user data is collected, used, and protected.',
  },
  terms: {
    path: '/terms-of-service', file: 'terms.html',
    title: 'Terms of Service - AlexCyberX',
    desc: 'Terms of Service for using the AlexCyberX cybersecurity education platform.',
  },
  disclaimer: {
    path: '/disclaimer', file: 'disclaimer.html',
    title: 'Disclaimer - AlexCyberX',
    desc: 'Legal disclaimer for AlexCyberX educational content and CTF labs.',
  },
  refund: {
    path: '/refund-policy', file: 'refund.html',
    title: 'Refund Policy - AlexCyberX',
    desc: 'Refund policy for AlexCyberX paid tools and subscriptions.',
  },
  cookie: {
    path: '/cookie-notice', file: 'cookie.html',
    title: 'Cookie Notice - AlexCyberX',
    desc: 'How AlexCyberX uses cookies across the platform.',
  },
  donotsell: {
    path: '/do-not-sell', file: 'donotsell.html',
    title: 'Do Not Sell My Info - AlexCyberX',
    desc: 'Opt out of data sharing on AlexCyberX.',
  },
  legalwarning: {
    path: '/legal-warning', file: 'legalwarning.html',
    title: 'Legal Warning - AlexCyberX',
    desc: 'Legal warning regarding unauthorized use of AlexCyberX cybersecurity tools and CTF content.',
  },
} as const;

export type LegalKey = keyof typeof LEGAL_PAGES;

const PAGES_DIR = path.join(process.cwd(), '..', 'pages');

// Same clean-up the SPA does when it injects these files (index.html): no
// <script>, no inline handlers. data-page="x" buttons/links become real links.
export function loadLegalHtml(key: LegalKey): string {
  let html = readFileSync(path.join(PAGES_DIR, LEGAL_PAGES[key].file), 'utf8');
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  html = html.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, '');
  html = html.replace(/<button([^>]*?)\sdata-page="([^"]+)"([^>]*)>([\s\S]*?)<\/button>/gi,
    (_m, a, page, b, inner) => `<a${a}${b} href="${pathForPage(page)}">${inner}</a>`);
  html = html.replace(/<a([^>]*?)\shref="#"([^>]*?)\sdata-page="([^"]+)"([^>]*)>/gi,
    (_m, a, b, page, c) => `<a${a}${b}${c} href="${pathForPage(page)}">`);
  return html;
}
