// Pinned / Locked pill after a thread title (list) or in the post meta (thread).
// Open threads get nothing, so they look exactly like on the old page.
export default function CommunityBadge({ status }: { status: string }) {
  if (status !== 'pinned' && status !== 'locked') return null;
  return <span className={'comm-badge comm-badge--' + status}>{status === 'pinned' ? 'Pinned' : 'Locked'}</span>;
}
