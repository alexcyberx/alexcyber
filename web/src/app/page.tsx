import type { Metadata } from 'next';
import BlogList from '@/components/BlogList';
import { getPublishedPosts } from '@/lib/blog';

// ISR: rebuilt at most every 5 minutes, so newly published posts show up without a deploy.
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Blog - AlexCyberX',
  description: 'Cybersecurity articles and tutorials from AlexCyberX.',
  alternates: { canonical: '/blog' },
  openGraph: { url: '/blog', title: 'Blog - AlexCyberX', description: 'Cybersecurity articles and tutorials from AlexCyberX.' },
};

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <div id="blogPage" className="page active">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div id="blogListView">
          <div className="blog-hero">
            <div style={{ fontSize: 10, letterSpacing: 4, color: '#dc1414', fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, marginBottom: 14, padding: '3px 14px', border: '1px solid #dc141433', borderRadius: 20, background: '#dc14140a', display: 'inline-block' }}>BLOG</div>
            <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 34, fontWeight: 700, color: '#f4f4f5', marginBottom: 12 }}>Articles, News &amp; Writeups</h1>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: '#8a8a95', lineHeight: 1.7 }}>Tutorials, CVE breakdowns, tool guides and CTF writeups from the AlexCyberX team.</p>
          </div>

          {posts === null ? (
            <div className="blog-grid" id="blogGrid">
              <div className="blog-empty">Could not load articles right now. Please try again later.</div>
            </div>
          ) : (
            <BlogList posts={posts} />
          )}
        </div>
      </div>
    </div>
  );
}
