'use client';

import { useState } from 'react';
import BlogImage from './BlogImage';
import { capitalize, excerpt, formatDate, type BlogPost } from '@/lib/blog';

export default function BlogList({ posts }: { posts: BlogPost[] }) {
  const [active, setActive] = useState('');
  const cats = [...new Set(posts.map((p) => p.category).filter((c): c is string => Boolean(c)))];
  const list = active ? posts.filter((p) => p.category === active) : posts;

  return (
    <>
      <div className="blog-filters" id="blogFilters">
        {cats.length > 0 && (
          <>
            <button className={'blog-filter-btn' + (active === '' ? ' active' : '')} onClick={() => setActive('')}>All</button>
            {cats.map((c) => (
              <button key={c} className={'blog-filter-btn' + (active === c ? ' active' : '')} onClick={() => setActive(c)}>
                {capitalize(c)}
              </button>
            ))}
          </>
        )}
      </div>

      <div className="blog-grid" id="blogGrid">
        {list.length === 0 ? (
          <div className="blog-empty">No articles here yet. Check back soon.</div>
        ) : (
          list.map((p) => (
            <a key={p.id} className="blog-card" href={`/blog/${encodeURIComponent(p.slug)}`}>
              {p.image ? (
                <BlogImage className="blog-card-img" src={p.image} alt={p.title} lazy />
              ) : (
                <div className="blog-card-img-placeholder">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.4" /><path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                </div>
              )}
              <div className="blog-card-body">
                <div className="blog-card-cat">{capitalize(p.category)}</div>
                <div className="blog-card-title">{p.title}</div>
                <div className="blog-card-excerpt">{excerpt(p)}</div>
                <div className="blog-card-meta">
                  <span>{formatDate(p.publish_date)}</span>
                  <span>{(p.views || 0).toLocaleString('en-US')} views</span>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </>
  );
}
