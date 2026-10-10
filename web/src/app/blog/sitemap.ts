import type { MetadataRoute } from 'next';
import { getPublishedPosts, SITE_URL } from '@/lib/blog';

export const revalidate = 3600;

// Served at /blog/sitemap.xml (basePath). Linked from the root robots.txt.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = (await getPublishedPosts()) || [];
  return [
    { url: `${SITE_URL}/blog`, changeFrequency: 'daily', priority: 0.8 },
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${encodeURIComponent(p.slug)}`,
      lastModified: p.publish_date ? new Date(p.publish_date) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
