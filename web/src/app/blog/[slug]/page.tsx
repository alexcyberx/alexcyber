import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogImage from '@/components/BlogImage';
import ViewCounter from '@/components/ViewCounter';
import { capitalize, excerpt, formatDate, getPostBySlug, getPublishedPosts, renderContent, safeDecode } from '@/lib/blog';

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

// Pre-render every published post at build time; new slugs render on first request.
export async function generateStaticParams() {
  const posts = (await getPublishedPosts()) || [];
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(safeDecode(slug));
  if (!post) return { title: 'Article not found - AlexCyberX Blog', robots: { index: false } };

  const title = (post.meta_title || post.title) + ' - AlexCyberX Blog';
  const description = excerpt(post);
  const url = `/blog/${encodeURIComponent(post.slug)}`;
  return {
    title,
    description,
    keywords: post.tags || undefined,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      publishedTime: post.publish_date || undefined,
      tags: post.tags || undefined,
      images: post.image ? [post.image] : undefined,
    },
    twitter: { title, description, images: post.image ? [post.image] : undefined },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(safeDecode(slug));
  if (!post) notFound();

  return (
    <div id="blogPage" className="page active">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'calc(var(--nav-h) + 32px) 24px 80px' }}>
        <div id="blogDetailView">
          <div className="blog-post-wrap">
            <a className="blog-back-btn" href="/blog">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 2L2.5 6l5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Back to Blog
            </a>
            <article id="blogDetailContent">
              <div className="blog-post-cat">{capitalize(post.category)}</div>
              <h1 className="blog-post-title">{post.title}</h1>
              <div className="blog-post-meta">
                <span>{formatDate(post.publish_date)}</span>
                <span>{(post.views || 0).toLocaleString('en-US')} views</span>
              </div>
              {post.image && <BlogImage className="blog-post-img" src={post.image} alt={post.title} />}
              {/* renderContent escapes the raw text before adding its own tags. */}
              <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: renderContent(post.content) }} />
              {post.tags && post.tags.length > 0 && (
                <div className="blog-post-tags">
                  {post.tags.map((t) => <span key={t} className="blog-tag">{t}</span>)}
                </div>
              )}
            </article>
          </div>
        </div>
      </div>
      <ViewCounter slug={post.slug} />
    </div>
  );
}
