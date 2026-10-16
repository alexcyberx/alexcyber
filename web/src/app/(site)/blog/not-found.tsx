export default function NotFound() {
  return (
    <div id="blogPage" className="page active">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'calc(var(--nav-h) + 32px) 24px 80px' }}>
        <div className="blog-post-wrap">
          <a className="blog-back-btn" href="/blog">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 2L2.5 6l5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Back to Blog
          </a>
          <div className="blog-empty">Article not found. It may have been unpublished or removed.</div>
        </div>
      </div>
    </div>
  );
}
