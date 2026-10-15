import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Thread not found - AlexCyberX Community', robots: { index: false } };

// Unknown or malformed thread id (404). Same frame as the thread view.
export default function ThreadNotFound() {
  return (
    <div id="communityPage" className="page active">
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'calc(var(--nav-h) + 32px) 24px 80px' }}>
        <div id="commDetailView">
          <div className="comm-toolbar">
            <a className="blog-back-btn" style={{ margin: 0 }} href="/community">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 2L2.5 6l5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Back
            </a>
            <div className="pf-section-label" style={{ margin: 0 }} id="commDetailTitle">Thread</div>
          </div>
          <div id="commDetailBody"><div className="blog-empty">Thread not found.</div></div>
        </div>
      </div>
    </div>
  );
}
