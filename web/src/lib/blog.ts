import { serverSupabase } from './supabase';

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  tags: string[] | null;
  content: string | null;
  image: string | null;
  meta_title: string | null;
  meta_desc: string | null;
  views: number | null;
  publish_date: string | null;
};

const POST_COLUMNS =
  'id, title, slug, category, tags, content, image, meta_title, meta_desc, views, publish_date';

// Post images go into <img src> and og:image: only https:// or a same-site path.
const safeImage = (src: string | null) => (src && (/^https:\/\//i.test(src) || /^\/(?!\/)/.test(src)) ? src : null);
const clean = (p: BlogPost): BlogPost => ({ ...p, image: safeImage(p.image) });

export async function getPublishedPosts(): Promise<BlogPost[] | null> {
  const sb = serverSupabase();
  if (!sb) return null;
  // Flip due "scheduled" posts to "published" first (same as the old page; safe no-op).
  await sb.rpc('blog_publish_due_posts').then(() => {}, () => {});
  const { data, error } = await sb
    .from('blog_posts')
    .select(POST_COLUMNS)
    .eq('status', 'published')
    .order('publish_date', { ascending: false });
  if (error) {
    console.error('[blog] list error:', error.message);
    return null;
  }
  return ((data as BlogPost[]) || []).map(clean);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const sb = serverSupabase();
  if (!sb) return null;
  // A scheduled post that is due must open from its own link too, not only after /blog ran this.
  await sb.rpc('blog_publish_due_posts').then(() => {}, () => {});
  const { data, error } = await sb
    .from('blog_posts')
    .select(POST_COLUMNS)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error) {
    console.error('[blog] post error:', error.message);
    return null;
  }
  return data ? clean(data as BlogPost) : null;
}

/* ── Helpers, ported 1:1 from js/blog.js so output matches the old page ── */

// Route params can arrive percent-encoded; a stray '%' must not crash the page.
export function safeDecode(s: string): string {
  try { return decodeURIComponent(s); } catch { return s; }
}

export function capitalize(s: string | null | undefined): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  // Fixed time zone: the server (UTC) and an Indian browser must print the same
  // day, or React sees a mismatch and re-renders the page in the browser.
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' });
}

export function excerpt(post: Pick<BlogPost, 'meta_desc' | 'content'>): string {
  if (post.meta_desc) return post.meta_desc;
  const plain = (post.content || '').replace(/[#*_`>-]/g, '').replace(/\s+/g, ' ').trim();
  return plain.slice(0, 140) + (plain.length > 140 ? '…' : '');
}

// Same escaping as the old escBlogHtml (textContent -> innerHTML): & < > only.
function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inlineMd(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

// Small Markdown-ish renderer: headings, paragraphs, bold/italic, inline code,
// fenced code blocks, bullet lists. Input is escaped first, so raw HTML from
// the admin editor never executes.
export function renderContent(raw: string | null | undefined): string {
  if (!raw) return '<p style="color:var(--text-dim);">This article has no content yet.</p>';

  const lines = escapeHtml(raw).split(/\r?\n/);
  let html = '';
  let inList = false;
  let inCode = false;

  for (const line of lines) {
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
      html += `<li>${inlineMd(line.replace(/^\s*[-*]\s+/, ''))}</li>`;
      continue;
    }

    if (/^###\s+/.test(line)) { html += `<h3>${inlineMd(line.replace(/^###\s+/, ''))}</h3>`; continue; }
    if (/^##\s+/.test(line))  { html += `<h2>${inlineMd(line.replace(/^##\s+/, ''))}</h2>`; continue; }
    if (/^#\s+/.test(line))   { html += `<h2>${inlineMd(line.replace(/^#\s+/, ''))}</h2>`; continue; }

    if (line.trim() === '') continue;
    html += `<p>${inlineMd(line)}</p>`;
  }
  if (inList) html += '</ul>';
  if (inCode) html += '</pre>';
  return html;
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://alexcyberx.com').replace(/\/$/, '');
