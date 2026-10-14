import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ThreadView from '@/components/ThreadView';
import { getThread } from '@/lib/community';

// A real route for /community/<id> (the SPA showed the list on a direct visit or
// reload: community-2). Rendered per request so a new reply survives a reload.
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await getThread((await params).id);
  if (d === 'error') return { title: 'Community - AlexCyberX', robots: { index: false } };
  if (!d) return { title: 'Thread not found - AlexCyberX Community', robots: { index: false } };
  const title = `${d.thread.title} - AlexCyberX Community`;
  const body = d.thread.body.replace(/\s+/g, ' ').trim();
  const description = body.length > 160 ? body.slice(0, 157) + '...' : body;
  const url = `/community/${d.thread.id}`;
  return { title, description, alternates: { canonical: url }, openGraph: { type: 'article', url, title, description } };
}

export default async function ThreadPage({ params }: Props) {
  const d = await getThread((await params).id);
  if (!d) notFound();
  return (
    <div id="communityPage" className="page active">
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'calc(var(--nav-h) + 32px) 24px 80px' }}>
        {d === 'error' ? (
          <div id="commDetailView">
            <div className="comm-toolbar">
              <a className="blog-back-btn" style={{ margin: 0 }} href="/community">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 2L2.5 6l5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Back
              </a>
              <div className="pf-section-label" style={{ margin: 0 }} id="commDetailTitle">Thread</div>
            </div>
            <div id="commDetailBody"><div className="blog-empty">Could not load thread.</div></div>
          </div>
        ) : (
          <ThreadView key={d.thread.id} initial={d} now={Date.now()} />
        )}
      </div>
    </div>
  );
}
