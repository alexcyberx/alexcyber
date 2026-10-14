import type { SupabaseClient } from '@supabase/supabase-js';

// The one tool list: hub cards (/tools), nav search and the home marquee.
// Same texts as the #toolsPage cards in index.html (js/search.js still reads
// those on the SPA). Only the Mistake Analyzer page is on Next so far; the
// other three hrefs are SPA pages (they ask for login there).
export type Tool = {
  key: string;          // tool_settings.tool_key
  page: string;         // SPA page id (js/router.js PAGE_TO_PATH)
  href: string;
  title: string;
  tag: string;
  desc: string;         // `backticks` -> <code>
  searchTags: string[]; // data-search-tags of the old card
  addedAt: string;      // marquee "NEW" badge (same as js/marquee.js)
};

export const TOOLS: Tool[] = [
  {
    key: 'mistake_analyzer', page: 'mistakeAnalyzer', href: '/tools/mistake-analyzer',
    title: 'Cyber Mistake Analyzer', tag: 'Learning',
    desc: "Paste a command like `nmap -A target.com`, get instant feedback on what's right, what's wrong, and a better version.",
    searchTags: ['mistake', 'analyzer', 'command', 'nmap', 'feedback', 'learning', 'correction'],
    addedAt: '2026-09-16',
  },
  {
    key: 'alexrecon', page: 'alexrecon', href: '/tools/alexrecon',
    title: 'AlexRecon', tag: 'Recon',
    desc: 'Enter a domain and get a combined attack-surface report: DNS, web, SSL, subdomains, tech stack, risk indicators, and more.',
    searchTags: ['recon', 'reconnaissance', 'dns', 'ssl', 'subdomain', 'port', 'scan', 'attack surface', 'domain', 'tech stack'],
    addedAt: '2026-09-16',
  },
  {
    key: 'alexutils', page: 'alexutils', href: '/tools/alexutils',
    title: 'AlexUtils', tag: 'Utilities',
    desc: 'A toolkit of everyday utilities: IP/DNS lookup, SSL checker, hash generator, Base64, subnet calculator, CVE search, and more.',
    searchTags: ['utils', 'utilities', 'ip', 'dns', 'lookup', 'ssl', 'checker', 'hash', 'generator', 'base64', 'subnet', 'calculator', 'cve', 'search'],
    addedAt: '2026-09-16',
  },
  {
    key: 'alextrace', page: 'alextrace', href: '/tools/alextrace',
    title: 'AlexTrace', tag: 'OSINT',
    desc: 'Audit your own digital footprint: cross-platform username check, email breach lookup, and photo metadata scan, with a clear exposure score and fix-it steps.',
    searchTags: ['trace', 'osint', 'digital footprint', 'username', 'breach', 'email', 'photo', 'metadata', 'exposure'],
    addedAt: '2026-09-16',
  },
];

/** Card text without the `code` markers (search index). */
export const plainDesc = (t: Tool) => t.desc.replace(/`/g, '');

// Same default as initToolsPage() in js/page-scripts.js.
export const TOOL_DISABLED_DEFAULT = 'This tool is temporarily unavailable.';

/** tool_key -> message, for every tool an admin has switched off. */
export type DisabledTools = Record<string, string>;

// tool_settings is public (RLS: SELECT for everyone). null = could not read it,
// then the caller keeps what it had (all enabled at first, like the old page).
export async function readDisabledTools(sb: SupabaseClient | null): Promise<DisabledTools | null> {
  if (!sb) return null;
  try {
    const { data, error } = await sb.from('tool_settings').select('tool_key, is_enabled, disabled_message');
    if (error || !Array.isArray(data)) return null;
    const out: DisabledTools = {};
    for (const r of data) {
      if (!r || typeof r.tool_key !== 'string' || r.is_enabled) continue;
      out[r.tool_key] = (typeof r.disabled_message === 'string' && r.disabled_message) || TOOL_DISABLED_DEFAULT;
    }
    return out;
  } catch {
    return null;
  }
}
