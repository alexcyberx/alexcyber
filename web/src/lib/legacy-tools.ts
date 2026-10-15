import { readFileSync } from 'node:fs';
import path from 'node:path';

// AlexRecon / AlexUtils / AlexTrace on Next (step 5c). Their markup is read
// from index.html at build time (one source for both apps, like lib/home.ts)
// and their logic is the same browser script the SPA runs (js/tools/*.js),
// loaded by components/LegacyTool.tsx. A change to the markup in index.html
// therefore needs a redeploy of web/ too; the scripts are served by Express.
const INDEX = readFileSync(path.join(process.cwd(), '..', 'index.html'), 'utf8');

export type LegacyToolKey = 'alexrecon' | 'alexutils' | 'alextrace';

export type LegacyToolInfo = {
  key: LegacyToolKey;
  pageId: string; // SPA page div id (css/<tool>.css selects on it)
  path: string;
  title: string;
  desc: string;
};

// Titles/descriptions: same as the SPA's PAGE_META in js/router.js.
export const LEGACY_TOOLS: Record<LegacyToolKey, LegacyToolInfo> = {
  alexrecon: {
    key: 'alexrecon', pageId: 'alexReconPage', path: '/tools/alexrecon',
    title: 'AlexRecon - Free Attack Surface Reconnaissance Tool | AlexCyberX',
    desc: 'AlexRecon generates a combined attack-surface report for any domain: DNS, SSL, subdomains, port scanning, tech stack, and risk indicators. Free recon tool by AlexCyberX.',
  },
  alexutils: {
    key: 'alexutils', pageId: 'alexUtilsPage', path: '/tools/alexutils',
    title: 'AlexUtils - IP, DNS, SSL & CVE Lookup Toolkit | AlexCyberX',
    desc: 'AlexUtils is a free cybersecurity utility toolkit: IP/DNS lookup, SSL checker, hash generator, Base64 encode/decode, subnet calculator, and CVE search.',
  },
  alextrace: {
    key: 'alextrace', pageId: 'alexTracePage', path: '/tools/alextrace',
    title: 'AlexTrace - Digital Footprint & OSINT Audit Tool | AlexCyberX',
    desc: 'AlexTrace audits your digital footprint: cross-platform username check, email breach lookup, and photo metadata scan with an exposure score and fix-it steps.',
  },
};

/** Inner markup of the tool's page div in index.html, ready for the Next page. */
export function legacyToolMarkup(key: LegacyToolKey): string {
  const { pageId } = LEGACY_TOOLS[key];
  const from = `<div id="${pageId}" class="page">`;
  const to = `</div><!-- end #${pageId} -->`;
  const a = INDEX.indexOf(from);
  const b = INDEX.indexOf(to, a + from.length);
  if (a < 0 || b < 0) throw new Error(`index.html: markers for #${pageId} not found`);
  return INDEX.slice(a + from.length, b)
    // "Back to Tools" is a real link here.
    .replace(/<a\s+onclick="showPage\('tools'\)"\s+style="cursor:pointer;/g, '<a href="/tools" style="text-decoration:none;')
    .replace(/<script[\s\S]*?<\/script>/gi, '');
  // The tool buttons keep their onclick="..." (handlers from js/tools/*.js;
  // the CSP allows inline handlers, script-src-attr 'unsafe-inline').
}
