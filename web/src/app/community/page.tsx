import type { Metadata } from 'next';
import CommunityView from '@/components/CommunityView';
import { getThreads } from '@/lib/community';

// Rendered per request: a user who just posted and reloads must see the post.
// It is one RPC, the same work the SPA did in the browser.
export const dynamic = 'force-dynamic';

const TITLE = 'Community - AlexCyberX';
const DESC = 'Join the AlexCyberX cybersecurity learning community.';
export const metadata: Metadata = { title: TITLE, description: DESC, alternates: { canonical: '/community' }, openGraph: { url: '/community', title: TITLE, description: DESC } };

export default async function CommunityPage() {
  const threads = await getThreads();
  return (
    <div id="communityPage" className="page active">
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>
        <CommunityView initial={threads} now={Date.now()} />
      </div>
    </div>
  );
}
