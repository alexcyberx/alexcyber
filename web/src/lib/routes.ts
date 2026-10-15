// Page id -> URL, same as PAGE_TO_PATH in js/router.js (only the ones the Next
// pages link to). Keep in sync when a page moves.
export const SPA_PATHS: Record<string, string> = {
  home: '/',
  courses: '/tutorials',
  learn: '/tutorials/network-forensics',
  learn2: '/tutorials/cyber-attacks-fundamentals',
  learn3: '/tutorials/ethical-hacking',
  ctf: '/rooms',
  tools: '/tools',
  mistakeAnalyzer: '/tools/mistake-analyzer',
  alexrecon: '/tools/alexrecon',
  alexutils: '/tools/alexutils',
  alextrace: '/tools/alextrace',
  blog: '/blog',
  resources: '/resources',
  community: '/community',
  profile: '/profile',
  leaderboard: '/leaderboard',
  privacy: '/privacy-policy',
  terms: '/terms-of-service',
  disclaimer: '/disclaimer',
  refund: '/refund-policy',
  cookie: '/cookie-notice',
  donotsell: '/do-not-sell',
  legalwarning: '/legal-warning',
};

export function pathForPage(pageId: string | null | undefined, fallback = '/'): string {
  return (pageId && SPA_PATHS[pageId]) || fallback;
}
