/* ═══════════════════════════════════════════
   PUBLIC BLOG PAGE
   Loads published posts from Supabase (blog_posts table)
   and renders a listing grid + single-post detail view.
═══════════════════════════════════════════ */

let _blogPublicPosts = [];
let _blogPublicLoaded = false;
let _blogActiveCategory = '';
let _blogCurrentSlug = null;

function initBlogPage() {
  // If URL already points at a specific post (/blog/some-slug), open it directly.
  const path = window.location.pathname.replace(/\/$/, '');
  if (path.startsWith('/blog/')) {
    const slug = path.slice('/blog/'.length);
    if (slug) { openBlogPostBySlug(slug); return; }
  }
  showBlogList();
  loadPublicBlogPosts();
}

async function loadPublicBlogPosts() {
  const grid = document.getElementById('blogGrid');
  const sb = window._supabase;

  if (!sb) {
    if (grid) grid.innerHTML = `<div class="blog-empty">Blog is temporarily unavailable. Please check back soon.</div>`;
    return;
  }

  try {
    // Flip any due "scheduled" posts to "published" first (safe no-op if none due).
    await sb.rpc('blog_publish_due_posts').then(() => {}, () => {});

    const { data, error } = await sb
      .from('blog_posts')
      .select('id, title, slug, category, tags, content, image, meta_title, meta_desc, views, publish_date')
      .eq('status', 'published')
      .order('publish_date', { ascending: false });

    if (error) throw error;

    _blogPublicPosts = data || [];
    _blogPublicLoaded = true;
    renderBlogFilters();
    renderBlogGrid();
  } catch (e) {
    console.error('[Blog] load error:', e);
    if (grid) grid.innerHTML = `<div class="blog-empty">Could not load articles right now. Please try again later.</div>`;
  }
}

function renderBlogFilters() {
  const wrap = document.getElementById('blogFilters');
  if (!wrap) return;
  const cats = [...new Set(_blogPublicPosts.map(p => p.category).filter(Boolean))];
  if (!cats.length) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = `
    <button class="blog-filter-btn ${_blogActiveCategory==='' ? 'active':''}" onclick="filterBlogByCategory('')">All</button>
    ${cats.map(c => `<button class="blog-filter-btn ${_blogActiveCategory===c ? 'active':''}" onclick="filterBlogByCategory('${escBlogAttr(c)}')">${capitalizeBlog(c)}</button>`).join('')}
  `;
}

function filterBlogByCategory(cat) {
  _blogActiveCategory = cat;
  renderBlogFilters();
  renderBlogGrid();
}

function renderBlogGrid() {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  const list = _blogActiveCategory
    ? _blogPublicPosts.filter(p => p.category === _blogActiveCategory)
    : _blogPublicPosts;

  if (!list.length) {
    grid.innerHTML = `<div class="blog-empty">
      ${_blogPublicLoaded ? 'No articles here yet. Check back soon.' : 'Loading articles…'}
    </div>`;
    return;
  }

  grid.innerHTML = list.map(p => `
    <div class="blog-card" onclick="openBlogPostBySlug('${escBlogAttr(p.slug)}')">
      ${p.image
        ? `<img class="blog-card-img" src="${escBlogAttr(p.image)}" alt="${escBlogAttr(p.title)}" loading="lazy" onerror="this.style.display='none'">`
        : `<div class="blog-card-img-placeholder">
             <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2.5" stroke="currentColor" stroke-width="1.4"/><path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
           </div>`}
      <div class="blog-card-body">
        <div class="blog-card-cat">${capitalizeBlog(p.category)}</div>
        <div class="blog-card-title">${escBlogHtml(p.title)}</div>
        <div class="blog-card-excerpt">${escBlogHtml(blogExcerpt(p))}</div>
        <div class="blog-card-meta">
          <span>${blogFormatDate(p.publish_date)}</span>
          <span>${(p.views||0).toLocaleString()} views</span>
        </div>
      </div>
    </div>
  `).join('');
}

async function openBlogPostBySlug(slug) {
  _blogCurrentSlug = slug;

  const detailEl = document.getElementById('blogDetailContent');
  showBlogDetail();
  if (detailEl) detailEl.innerHTML = `<div class="blog-empty">Loading…</div>`;

  // Try from already-loaded list first (avoids a flash of "loading" on click-through)
  let post = _blogPublicPosts.find(p => p.slug === slug);

  const sb = window._supabase;
  if (!post && sb) {
    try {
      const { data, error } = await sb
        .from('blog_posts')
        .select('id, title, slug, category, tags, content, image, meta_title, meta_desc, views, publish_date')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      if (error) throw error;
      post = data;
    } catch (e) {
      console.error('[Blog] fetch post error:', e);
    }
  }

  if (!post) {
    if (detailEl) detailEl.innerHTML = `<div class="blog-empty">Article not found. It may have been unpublished or removed.</div>`;
    return;
  }

  renderBlogDetail(post);

  // Fire-and-forget view increment
  if (sb) sb.rpc('blog_increment_views', { p_slug: slug }).then(() => {}, () => {});

  // Reflect in the URL without a full reload
  const path = '/blog/' + slug;
  if (window.location.pathname !== path) {
    history.pushState({ page: 'blog', slug }, '', path);
  }
  document.title = (post.meta_title || post.title) + ' - AlexCyberX Blog';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderBlogDetail(post) {
  const detailEl = document.getElementById('blogDetailContent');
  if (!detailEl) return;

  detailEl.innerHTML = `
    <div class="blog-post-cat">${capitalizeBlog(post.category)}</div>
    <h1 class="blog-post-title">${escBlogHtml(post.title)}</h1>
    <div class="blog-post-meta">
      <span>${blogFormatDate(post.publish_date)}</span>
      <span>${(post.views||0).toLocaleString()} views</span>
    </div>
    ${post.image ? `<img class="blog-post-img" src="${escBlogAttr(post.image)}" alt="${escBlogAttr(post.title)}" onerror="this.style.display='none'">` : ''}
    <div class="blog-post-content">${blogRenderContent(post.content)}</div>
    ${(post.tags && post.tags.length) ? `<div class="blog-post-tags">${post.tags.map(t => `<span class="blog-tag">${escBlogHtml(t)}</span>`).join('')}</div>` : ''}
  `;
}

function closeBlogPost() {
  _blogCurrentSlug = null;
  showBlogList();
  const path = '/blog';
  if (window.location.pathname !== path) {
    history.pushState({ page: 'blog' }, '', path);
  }
  document.title = 'Blog - AlexCyberX';
  // Refresh grid in case something changed
  if (_blogPublicLoaded) renderBlogGrid();
}

function showBlogList() {
  const list = document.getElementById('blogListView');
  const detail = document.getElementById('blogDetailView');
  if (list) list.style.display = '';
  if (detail) detail.style.display = 'none';
}

function showBlogDetail() {
  const list = document.getElementById('blogListView');
  const detail = document.getElementById('blogDetailView');
  if (list) list.style.display = 'none';
  if (detail) detail.style.display = '';
}

/* ── Helpers ── */
function capitalizeBlog(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function blogFormatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function blogExcerpt(post) {
  if (post.meta_desc) return post.meta_desc;
  const plain = (post.content || '').replace(/[#*_`>-]/g, '').replace(/\s+/g, ' ').trim();
  return plain.slice(0, 140) + (plain.length > 140 ? '…' : '');
}

function escBlogHtml(str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function escBlogAttr(str) {
  return escBlogHtml(str).replace(/"/g, '&quot;');
}

// Very small Markdown-ish renderer — headings, paragraphs, bold/italic,
// inline code, fenced code blocks, and simple bullet lists. Input is
// escaped first so no raw HTML from the admin editor ever executes.
function blogRenderContent(raw) {
  if (!raw) return '<p style="color:var(--text-dim);">This article has no content yet.</p>';

  const escaped = escBlogHtml(raw);
  const lines = escaped.split(/\r?\n/);
  let html = '';
  let inList = false;
  let inCode = false;

  for (let line of lines) {
    if (line.trim().startsWith('```')) {
      html += inCode ? '</pre>' : '<pre>';
      inCode = !inCode;
      continue;
    }
    if (inCode) { html += line + '\n'; continue; }

    const isBullet = /^\s*[-*]\s+/.test(line);
    if (isBullet && !inList) { html += '<ul>'; inList = true; }
    if (!isBullet && inList) { html += '</ul>'; inList = false; }

    if (isBullet) {
      html += `<li>${inlineBlogMd(line.replace(/^\s*[-*]\s+/, ''))}</li>`;
      continue;
    }

    if (/^###\s+/.test(line)) { html += `<h3>${inlineBlogMd(line.replace(/^###\s+/, ''))}</h3>`; continue; }
    if (/^##\s+/.test(line))  { html += `<h2>${inlineBlogMd(line.replace(/^##\s+/, ''))}</h2>`; continue; }
    if (/^#\s+/.test(line))   { html += `<h2>${inlineBlogMd(line.replace(/^#\s+/, ''))}</h2>`; continue; }

    if (line.trim() === '') { continue; }
    html += `<p>${inlineBlogMd(line)}</p>`;
  }
  if (inList) html += '</ul>';
  if (inCode) html += '</pre>';
  return html;
}

function inlineBlogMd(text) {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

// Handle browser Back/Forward for blog sub-paths (main router already
// calls showPage('blog') on popstate; this re-syncs list vs detail).
window.addEventListener('popstate', function () {
  if (currentPage !== 'blog') return;
  const path = window.location.pathname.replace(/\/$/, '');
  if (path.startsWith('/blog/')) {
    const slug = path.slice('/blog/'.length);
    if (slug) { openBlogPostBySlug(slug); return; }
  }
  closeBlogPost();
});
