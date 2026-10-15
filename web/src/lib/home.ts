import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathForPage } from './routes';

// The static parts of the home page (hero, about, contact info, footer) are
// read from index.html at build time, so the text and markup have one source
// while the SPA still has its own copy. Dynamic parts (course cards,
// contact form) are React components.
const INDEX = readFileSync(path.join(process.cwd(), '..', 'index.html'), 'utf8');

function slice(from: string, to: string): string {
  const a = INDEX.indexOf(from);
  const b = INDEX.indexOf(to, a + from.length);
  if (a < 0 || b < 0) throw new Error(`index.html: home markers not found (${from} .. ${to})`);
  return INDEX.slice(a + from.length, b);
}

// SPA handlers -> plain links; anything else inline is dropped.
function clean(html: string): string {
  return html
    .replace(/<button([^>]*?)\sonclick="scrollToSection\('([a-z-]+)'\)"([^>]*)>([\s\S]*?)<\/button>/g,
      (_m, a, id, b, inner) => `<a${a}${b} href="#${id}">${inner}</a>`)
    .replace(/<a([^>]*?)\shref="#"\s+onclick="showPage\('([A-Za-z]+)'\)"([^>]*)>/g,
      (_m, a, page, b) => `<a${a} href="${pathForPage(page)}"${b}>`)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, '');
}

export function homeSections() {
  // Contact: the info column comes from index.html; the section/grid wrapper
  // and the form are JSX (dangerouslySetInnerHTML needs balanced HTML).
  const contactLeft = slice('<!-- CONTACT -->', '<div class="contact-form"');
  const leftStart = contactLeft.indexOf('<div class="contact-left"');
  if (leftStart < 0) throw new Error('index.html: contact-left not found');
  return {
    heroLeft: clean(slice('<div class="hero-left">', '<!-- /HERO LEFT -->')),
    // Starting screen of the home terminal (HeroTerminal makes it interactive).
    terminalDemo: clean(slice('<!-- TERMINAL DEMO -->', '<!-- /TERMINAL DEMO -->')),
    about: clean(slice('<!-- ABOUT -->', '<!-- CONTACT -->')),
    contactLeft: clean(contactLeft.slice(leftStart)),
    footer: clean(slice('<!-- FOOTER -->', '</div><!-- end #homePage -->')),
  };
}

// Structured data (JSON-LD) from the <head> of index.html, kept as-is for SEO.
export function homeJsonLd(): string[] {
  const head = INDEX.slice(0, INDEX.indexOf('</head>'));
  return Array.from(head.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)).map((m) => m[1].trim());
}
