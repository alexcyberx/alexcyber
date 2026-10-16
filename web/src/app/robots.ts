import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/blog';

// /robots.txt (Express proxies it here). Owner goal: search engines and AI
// answer engines should read and cite every public page, so all crawlers,
// including AI search and training bots, are allowed. Private or useless
// URLs are kept out.
const AI_BOTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot', 'Applebot-Extended', 'bingbot',
  'DuckAssistBot', 'meta-externalagent', 'Amazonbot', 'cohere-ai', 'YouBot', 'CCBot',
];
const PRIVATE = ['/api/', '/profile', '/auth/'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      { userAgent: AI_BOTS, allow: '/', disallow: PRIVATE },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/tutorials/sitemap.xml`, `${SITE_URL}/blog/sitemap.xml`],
    host: SITE_URL,
  };
}
