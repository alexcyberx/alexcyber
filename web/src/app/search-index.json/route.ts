import { buildSearchIndex } from '@/lib/search';

// Rebuilt at most every 10 minutes; served at /search-index.json.
export const revalidate = 600;

export async function GET() {
  return Response.json(await buildSearchIndex());
}
