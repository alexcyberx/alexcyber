'use client';

// Blog: posts (stats, search, filters, paged table; publish, edit, delete),
// the post editor with a preview that renders like the public post page, and
// the category list the editor picks from (blog_categories).

import { createElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SectionProps } from '../AdminApp';
import { adminSupabase, logAdminEvent } from '../sb';
import { Card, Empty, Modal, Pager, Stat, dateTime, likeText, num, timeAgo, useToast } from '../ui';
import { SITE_URL, capitalize, excerpt, formatDate } from '@/lib/blog';

type Status = 'draft' | 'published' | 'scheduled';
type Row = {
  id: number; title: string; slug: string; category: string | null; status: Status;
  publish_date: string | null; views: number | null; updated_at: string | null; created_at: string | null;
};
type Full = Row & { tags: string[] | null; content: string | null; image: string | null; meta_title: string | null; meta_desc: string | null; author: string | null };
type Mini = Pick<Row, 'id' | 'status' | 'views' | 'category' | 'publish_date'>;
type Cat = { id: number; name: string; created_at: string | null };
// updated_at is not "last edited": blog_increment_views also bumps it (the
// updated_at trigger runs on every UPDATE), so a page view counts as an update.
type Sort = 'created_at' | 'publish_date' | 'views' | 'updated_at';

const COLS = 'id, title, slug, category, status, publish_date, views, updated_at, created_at';
const FULL = 'id, title, slug, category, status, publish_date, views, updated_at, created_at, tags, content, image, meta_title, meta_desc, author';
const PER_PAGE = 25;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Category names: letters (any script, with the vowel signs Hindi and other
// Indian scripts need: \p{M}), numbers, spaces and a few joiners.
const CAT_RE = /^[\p{L}\p{N}][\p{L}\p{M}\p{N} &+./-]*$/u;
// An update or delete that RLS refuses returns no row and no error.
const noRow = (what: 'post' | 'category') => `Nothing was changed: the ${what} is gone or this session has no write access. Sign in again.`;
// The new-post notification (acx_announce) is sent once per link: publishing
// again at the same /blog/<slug> does not notify again.
const NOTIFY = 'If this link was never live before, every user gets a notification.';
const STATUS_LABEL: Record<Status, string> = { draft: 'Draft', published: 'Published', scheduled: 'Scheduled' };

const ci = (s: string | null | undefined) => (s || '').trim().toLowerCase();
const pickRow = (p: Row): Row => ({ id: p.id, title: p.title, slug: p.slug, category: p.category, status: p.status, publish_date: p.publish_date, views: p.views, updated_at: p.updated_at, created_at: p.created_at });
const pickMini = (p: Row): Mini => ({ id: p.id, status: p.status, views: p.views, category: p.category, publish_date: p.publish_date });
const postPath = (slug: string) => '/blog/' + encodeURIComponent(slug);

/** First spelling of each value, compared without case. */
function uniqCi(list: string[]): string[] {
  const seen = new Set<string>();
  return list.filter((c) => { const k = ci(c); if (!k || seen.has(k)) return false; seen.add(k); return true; });
}

/** Every post's status, views and category (stats, category counts), 1000 rows per request. */
async function fetchMini(sb: SupabaseClient): Promise<Mini[] | null> {
  const out: Mini[] = [];
  for (let from = 0; from < 20000; from += 1000) {
    const { data, error } = await sb.from('blog_posts').select('id, status, views, category, publish_date').order('id').range(from, from + 999);
    if (error) return null;
    out.push(...((data || []) as Mini[]));
    if (!data || data.length < 1000) break;
  }
  return out;
}

export default function Blog(_: SectionProps) {
  const sb = adminSupabase()!;
  const toast = useToast();
  const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState('');
  const [mini, setMini] = useState<Mini[] | null>(null);
  const [miniFailed, setMiniFailed] = useState(false);
  const [cats, setCats] = useState<Cat[] | null>(null);
  const [catErr, setCatErr] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const seq = useRef(0);
  const [me, setMe] = useState('');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'' | Status>('');
  const [cat, setCat] = useState('');
  const [sort, setSort] = useState<Sort>('created_at');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<{ id: number | null } | null>(null);

  // Scheduled posts that are due flip to published first (same safe RPC the
  // public blog calls), so the list and the stats are true.
  useEffect(() => { sb.rpc('blog_publish_due_posts').then(() => setReady(true), () => setReady(true)); }, [sb]);

  // The admin's name, the default author of a new post.
  useEffect(() => {
    (async () => {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) return;
      const { data } = await sb.from('profiles').select('full_name, username').eq('id', session.user.id).maybeSingle();
      setMe(((data?.full_name as string) || (data?.username as string) || '').slice(0, 60));
    })();
  }, [sb]);

  useEffect(() => { const t = setTimeout(() => { setQuery(q); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);

  const loadMini = useCallback(async () => {
    const list = await fetchMini(sb);
    if (!list) toast('Could not load the post counts.', 'error');
    // On a failed load keep the old counts (or none), never a row of zeros.
    setMiniFailed(!list);
    setMini((m) => list || m || []);
    return list;
  }, [sb, toast]);

  const loadCats = useCallback(async () => {
    const { data, error } = await sb.from('blog_categories').select('id, name, created_at').order('name');
    if (error) toast('Could not load categories: ' + error.message, 'error');
    // On a failed load the editor offers the categories posts use; the card says it failed.
    setCatErr(error ? error.message : '');
    setCats(error ? [] : (data as Cat[]));
  }, [sb, toast]);

  useEffect(() => { if (ready) { loadMini(); loadCats(); } }, [ready, loadMini, loadCats]);

  // What the editor offers: the category table; when it is empty, the
  // categories posts already use (the form never invents values).
  const catNames = useMemo(() => {
    const fromTable = (cats || []).map((c) => c.name);
    return fromTable.length ? fromTable : uniqCi((mini || []).map((m) => m.category || ''));
  }, [cats, mini]);
  const filterCats = useMemo(() => uniqCi([...catNames, ...(mini || []).map((m) => m.category || '')]), [catNames, mini]);

  // The category filter matches without case ("tutorial" and "Tutorial" are
  // the same category to a reader), using the spellings posts really have.
  // A string key, so the list reloads only when the spellings change.
  const catKey = useMemo(() => {
    if (!cat) return '';
    const spellings = new Set([cat, ...(mini || []).map((m) => m.category || '').filter((c) => ci(c) === ci(cat))]);
    return JSON.stringify([...spellings].sort());
  }, [cat, mini]);

  const load = useCallback(async () => {
    // Only the newest request may fill the table (fast typing or paging can
    // make an older, slower answer arrive last).
    const my = ++seq.current;
    let r = sb.from('blog_posts').select(COLS, { count: 'exact' });
    const s = likeText(query);
    if (s) r = r.or(`title.ilike.%${s}%,slug.ilike.%${s}%`);
    if (status) r = r.eq('status', status);
    if (catKey) r = r.in('category', JSON.parse(catKey) as string[]);
    const from = (page - 1) * PER_PAGE;
    const { data, error, count } = await r.order(sort, { ascending: false, nullsFirst: false }).order('id', { ascending: false }).range(from, from + PER_PAGE - 1);
    if (my !== seq.current) return;
    if (error) { setErr(error.message); setRows([]); setTotal(0); return; }
    setErr('');
    setRows(data as Row[]);
    setTotal(count || 0);
  }, [sb, query, status, catKey, sort, page]);
  useEffect(() => { if (ready) load(); }, [ready, load]);

  const stats = useMemo(() => {
    if (!mini) return null;
    const count = (s: Status) => mini.filter((p) => p.status === s).length;
    const next = mini.filter((p) => p.status === 'scheduled' && p.publish_date).map((p) => p.publish_date as string).sort()[0];
    return { total: mini.length, published: count('published'), drafts: count('draft'), scheduled: count('scheduled'), views: mini.reduce((a, p) => a + (p.views || 0), 0), next };
  }, [mini]);

  const saved = useCallback((p: Row, isNew: boolean) => {
    const row = pickRow(p);
    if (isNew) {
      setRows((l) => [row, ...(l || [])]);
      setTotal((t) => t + 1);
      setMini((m) => [...(m || []), pickMini(row)]);
    } else {
      setRows((l) => (l || []).map((r) => (r.id === row.id ? row : r)));
      setMini((m) => (m || []).map((x) => (x.id === row.id ? pickMini(row) : x)));
    }
  }, []);

  async function setLive(r: Row, live: boolean) {
    if (busyId != null) return;
    if (live && !confirm(`Publish "${r.title}" now? It shows on the blog. ${NOTIFY}`)) return;
    if (!live && !confirm(`Unpublish "${r.title}"? It leaves the blog and its link stops working until you publish it again.`)) return;
    // Publishing keeps a past date (a post that was live before keeps its
    // date); an empty or future date becomes now.
    const keep = r.publish_date && new Date(r.publish_date).getTime() <= Date.now();
    const values = live ? { status: 'published', publish_date: keep ? r.publish_date : new Date().toISOString() } : { status: 'draft' };
    setBusyId(r.id);
    const { data, error } = await sb.from('blog_posts').update(values).eq('id', r.id).select(COLS);
    setBusyId(null);
    if (error) return toast((live ? 'Could not publish: ' : 'Could not unpublish: ') + error.message, 'error');
    const row = (data as Row[] | null)?.[0];
    if (!row) return toast(noRow('post'), 'error');
    saved(row, false);
    logAdminEvent(live ? 'admin_blog_published' : 'admin_blog_unpublished', `"${r.title}" (${r.id}) ${live ? 'published' : 'moved to drafts'}`);
    toast(live ? 'Published' : 'Moved to drafts');
  }

  async function remove(r: Row) {
    if (busyId != null) return;
    if (!confirm(`Delete "${r.title}" for good?${r.status === 'published' ? ' It leaves the blog and its link stops working.' : ''} This cannot be undone.`)) return;
    setBusyId(r.id);
    const { data, error } = await sb.from('blog_posts').delete().eq('id', r.id).select('id');
    setBusyId(null);
    if (error) return toast('Could not delete: ' + error.message, 'error');
    if (!data?.length) return toast(noRow('post'), 'error');
    setRows((l) => (l || []).filter((x) => x.id !== r.id));
    setTotal((t) => Math.max(0, t - 1));
    setMini((m) => (m || []).filter((x) => x.id !== r.id));
    // The last row of a later page: show the page before it instead of an empty one.
    if (rows?.length === 1 && page > 1) setPage(page - 1);
    logAdminEvent('admin_blog_deleted', `"${r.title}" (${r.id}, /blog/${r.slug}) deleted`);
    toast('Post deleted');
  }

  const filtered = !!(query || status || cat);
  const shown = (n: number) => (!stats ? '...' : miniFailed ? '-' : num(n));
  return (
    <div className="adm-stack">
      <div className="adm-stats" id="admBlogStats">
        <Stat label="Posts" value={shown(stats?.total || 0)} />
        <Stat label="Published" value={shown(stats?.published || 0)} />
        <Stat label="Drafts" value={shown(stats?.drafts || 0)} />
        <Stat label="Scheduled" value={shown(stats?.scheduled || 0)} sub={stats?.next && !miniFailed ? 'Next ' + dateTime(stats.next) : undefined} />
        <Stat label="Total views" value={shown(stats?.views || 0)} />
      </div>
      <Card title="Posts" actions={<>
        <input className="adm-input" placeholder="Search title or slug" aria-label="Search posts" value={q} onChange={(e) => setQ(e.target.value)} id="admBlogSearch" />
        <select className="adm-input adm-select" value={status} onChange={(e) => { setStatus(e.target.value as '' | Status); setPage(1); }} aria-label="Status" id="admBlogStatusFilter">
          <option value="">Any status</option><option value="published">Published</option><option value="draft">Drafts</option><option value="scheduled">Scheduled</option>
        </select>
        <select className="adm-input adm-select" value={cat} onChange={(e) => { setCat(e.target.value); setPage(1); }} aria-label="Category" id="admBlogCatFilter">
          <option value="">All categories</option>
          {filterCats.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="adm-input adm-select" value={sort} onChange={(e) => { setSort(e.target.value as Sort); setPage(1); }} aria-label="Sort" id="admBlogSort">
          <option value="created_at">Newest first</option><option value="publish_date">Newest publish date</option><option value="views">Most views</option><option value="updated_at">Last updated</option>
        </select>
        <button className="adm-btn primary" onClick={() => setEditing({ id: null })} disabled={!cats || !mini} id="admBlogNew">New post</button>
      </>}>
        {rows == null ? <Empty>Loading...</Empty> : err ? <Empty>Could not load posts: {err}</Empty> : !rows.length ? <Empty>{filtered ? 'No posts match.' : 'No posts yet. Write the first one with New post.'}</Empty> : (
          <div className="adm-table-wrap">
            <table className="adm-table" id="admBlogPosts">
              <thead><tr><th>Post</th><th>Category</th><th>Status</th><th>Publish date</th><th>Views</th><th title="Last change to the row. A page view also counts.">Updated</th><th>Actions</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="static" data-id={r.id}>
                    <td className="adm-wrap"><div className="adm-strong">{r.title}</div><div className="adm-dim">/blog/{r.slug}</div></td>
                    <td>{r.category || <span className="adm-dim">None</span>}</td>
                    <td><StatusPill s={r.status} /></td>
                    <td className="adm-dim adm-nowrap">{r.publish_date ? dateTime(r.publish_date) : 'Not set'}</td>
                    <td className="adm-num">{num(r.views || 0)}</td>
                    <td className="adm-dim adm-nowrap" title={dateTime(r.updated_at)}>{timeAgo(r.updated_at)}</td>
                    <td>
                      <div className="adm-blog-actions">
                        {r.status === 'published'
                          ? <button className="adm-btn" disabled={busyId === r.id} onClick={() => setLive(r, false)} id={'admBlogUnpub-' + r.id}>Unpublish</button>
                          : <button className="adm-btn" disabled={busyId === r.id} onClick={() => setLive(r, true)} id={'admBlogPub-' + r.id}>{r.status === 'scheduled' ? 'Publish now' : 'Publish'}</button>}
                        <button className="adm-btn" disabled={busyId === r.id || !cats || !mini} onClick={() => setEditing({ id: r.id })} id={'admBlogEdit-' + r.id}>Edit</button>
                        {r.status === 'published' && <a className="adm-btn ghost" href={postPath(r.slug)} target="_blank" rel="noopener noreferrer" id={'admBlogView-' + r.id}>View on site</a>}
                        <button className="adm-btn danger" disabled={busyId === r.id} onClick={() => remove(r)} id={'admBlogDel-' + r.id}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={page} pages={Math.max(1, Math.ceil(total / PER_PAGE))} total={total} onPage={setPage} />
      </Card>
      <Categories cats={cats} loadErr={catErr} mini={mini} countsOk={!miniFailed} setCats={setCats} reloadMini={loadMini} />
      {editing && <Editor id={editing.id} catNames={catNames} me={me} onSaved={saved} onClose={() => setEditing(null)} />}
    </div>
  );
}

function StatusPill({ s }: { s: Status }) {
  if (s === 'published') return <span className="adm-pill accent">published</span>;
  if (s === 'scheduled') return <span className="adm-pill adm-sched">scheduled</span>;
  return <span className="adm-pill">draft</span>;
}

/* ---------- Categories ---------- */

function Categories({ cats, loadErr, mini, countsOk, setCats, reloadMini }: {
  cats: Cat[] | null; loadErr: string; mini: Mini[] | null; countsOk: boolean; setCats: React.Dispatch<React.SetStateAction<Cat[] | null>>; reloadMini: () => Promise<Mini[] | null>;
}) {
  const sb = adminSupabase()!;
  const toast = useToast();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  // Posts per category, matched without case (the editor saves the list's spelling).
  const used = useMemo(() => {
    const m = new Map<string, number>();
    (mini || []).forEach((p) => { const k = ci(p.category); if (k) m.set(k, (m.get(k) || 0) + 1); });
    return m;
  }, [mini]);
  // Values posts use that the list does not have (old posts, or the old form's lowercase values).
  const unlisted = useMemo(() => {
    const listed = new Set((cats || []).map((c) => ci(c.name)));
    return uniqCi((mini || []).map((p) => p.category || '')).filter((c) => !listed.has(ci(c)));
  }, [cats, mini]);
  // The blog filters on the exact value, so "tutorial" and "Tutorial" show as
  // two "Tutorial" buttons. Saving such a post in the editor fixes its spelling.
  const mixed = useMemo(() => {
    const m = new Map<string, Set<string>>();
    (mini || []).forEach((p) => { const k = ci(p.category); if (k) m.set(k, (m.get(k) || new Set()).add((p.category || '').trim())); });
    return [...m.values()].filter((s) => s.size > 1).map((s) => [...s].join(' / '));
  }, [mini]);

  async function add(raw: string) {
    if (busy) return;
    const v = raw.trim().replace(/\s+/g, ' ');
    if (!v) return toast('Type a category name.', 'error');
    if (v.length > 40) return toast('Keep the name to 40 characters or less.', 'error');
    if (!CAT_RE.test(v)) return toast('Use letters, numbers, spaces and - & + . / only.', 'error');
    const twin = (cats || []).find((c) => ci(c.name) === ci(v));
    if (twin) return toast(`"${twin.name}" is already in the list.`, 'error');
    setBusy(true);
    const { data, error } = await sb.from('blog_categories').insert({ name: v }).select('id, name, created_at');
    setBusy(false);
    if (error) return toast('Could not add: ' + (error.code === '23505' ? 'that name is already in the list.' : error.message), 'error');
    const row = (data as Cat[] | null)?.[0];
    if (!row) return toast(noRow('category'), 'error');
    setCats((l) => [...(l || []), row].sort((a, b) => a.name.localeCompare(b.name)));
    if (raw === name) setName('');
    logAdminEvent('admin_blog_category_added', `blog category "${v}" added`);
    toast(`Category "${v}" added`);
  }

  async function remove(c: Cat) {
    if (busy) return;
    setBusy(true);
    // Count again from the DB: another admin may have used it since this page loaded.
    const fresh = await reloadMini();
    const n = fresh ? fresh.filter((p) => ci(p.category) === ci(c.name)).length : 0;
    if (!fresh || n || !confirm(`Delete the category "${c.name}"? No post uses it.`)) {
      setBusy(false);
      if (n) toast(`"${c.name}" is used by ${n} post${n === 1 ? '' : 's'}. Move ${n === 1 ? 'it' : 'them'} to another category first.`, 'error');
      return;
    }
    const { data, error } = await sb.from('blog_categories').delete().eq('id', c.id).select('id');
    setBusy(false);
    if (error) return toast('Could not delete: ' + error.message, 'error');
    if (!data?.length) return toast(noRow('category'), 'error');
    setCats((l) => (l || []).filter((x) => x.id !== c.id));
    logAdminEvent('admin_blog_category_deleted', `blog category "${c.name}" deleted`);
    toast('Category deleted');
  }

  return (
    <Card title="Categories" actions={
      <form className="adm-blog-inline" onSubmit={(e) => { e.preventDefault(); add(name); }}>
        <input className="adm-input" placeholder="New category" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} id="admBlogCatName" />
        <button className="adm-btn" disabled={busy || !name.trim()} id="admBlogCatAdd">Add</button>
      </form>
    }>
      <p className="adm-help">Posts pick their category from this list. The blog shows one filter button for each category that has published posts.</p>
      {countsOk && mixed.length > 0 && <p className="adm-error" id="admBlogCatMixed">Posts spell these categories in different ways, so the blog shows them as separate filters: {mixed.join(', ')}. Make sure the list has the spelling you want, then open those posts and save them.</p>}
      {loadErr ? <Empty>Could not load categories: {loadErr}</Empty> : cats == null ? <Empty>Loading...</Empty> : !cats.length ? <Empty>No categories yet. The editor offers the ones posts already use.</Empty> : (
        <ul className="adm-list" id="admBlogCats">
          {cats.map((c) => {
            const n = used.get(ci(c.name)) || 0;
            return (
              <li key={c.id}>
                <span className="adm-list-main">{c.name}</span>
                <span className="adm-dim adm-nowrap">{!countsOk ? '-' : n === 1 ? '1 post' : num(n) + ' posts'}</span>
                <button className="adm-btn ghost" disabled={busy} onClick={() => remove(c)} id={'admBlogCatDel-' + c.id}>Delete</button>
              </li>
            );
          })}
        </ul>
      )}
      {/* Without the list every value would look unlisted. */}
      {cats != null && !loadErr && unlisted.length > 0 && (
        <section className="adm-blog-unlisted">
          <h4 className="adm-h4">Used by posts but not in the list</h4>
          <ul className="adm-list" id="admBlogCatsUnlisted">
            {unlisted.map((c, i) => {
              const n = used.get(ci(c)) || 0;
              return (
                <li key={c}>
                  <span className="adm-list-main">{c}</span>
                  <span className="adm-dim adm-nowrap">{!countsOk ? '-' : n === 1 ? '1 post' : num(n) + ' posts'}</span>
                  <button className="adm-btn ghost" disabled={busy} onClick={() => add(c)} id={'admBlogCatAddUsed-' + i}>Add to list</button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </Card>
  );
}

/* ---------- Editor ---------- */

type Form = {
  title: string; slug: string; category: string; status: Status; date: string; tags: string;
  image: string; content: string; meta_title: string; meta_desc: string; author: string;
};

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120).replace(/-+$/, '');
}

/** Comma separated, trimmed, without a leading #, lowercase (like the existing
 * posts), no repeats: the post page lists each tag once. */
function parseTags(s: string): string[] {
  return uniqCi(s.split(',').map((t) => t.trim().replace(/^#+/, '').replace(/\s+/g, ' ').toLowerCase()));
}

/** An image src from the form or the DB: https, or a path on this site.
 * Literal "https://" like the site's safeImage (lib/blog.ts): the URL parser
 * alone also takes "https:/x", which the site would not show. */
function safeSrc(u: string | null | undefined): string | null {
  const v = (u || '').trim();
  if (!v || /[\s\\]/.test(v)) return null;
  if (/^\/(?!\/)/.test(v)) return v;
  if (!/^https:\/\/[^/]/i.test(v)) return null;
  try { return new URL(v).protocol === 'https:' ? v : null; } catch { return null; }
}

// <input type="datetime-local"> holds local time without a zone.
function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function fromLocalInput(v: string): Date | null {
  const d = new Date(v);
  return v && !isNaN(d.getTime()) ? d : null;
}

function formOf(p: Full, names: string[]): Form {
  return {
    title: p.title || '', slug: p.slug || '',
    // An old lowercase value becomes the list's spelling, so one category never shows as two filters.
    category: names.find((c) => ci(c) === ci(p.category)) || p.category || '',
    status: p.status, date: toLocalInput(p.publish_date), tags: (p.tags || []).join(', '), image: p.image || '',
    content: p.content || '', meta_title: p.meta_title || '', meta_desc: p.meta_desc || '', author: p.author || '',
  };
}

function Editor({ id, catNames, me, onSaved, onClose }: {
  id: number | null; catNames: string[]; me: string; onSaved: (p: Row, isNew: boolean) => void; onClose: () => void;
}) {
  const sb = adminSupabase()!;
  const toast = useToast();
  const blank = (): Form => ({
    title: '', slug: '', category: catNames.find((c) => ci(c) === 'tutorial') || catNames[0] || '', status: 'draft', date: '',
    tags: '', image: '', content: '', meta_title: '', meta_desc: '', author: me,
  });
  const [cur, setCur] = useState<Full | null>(null); // the saved version (null = new post)
  const [f, setF] = useState<Form | null>(id == null ? blank : null);
  const [base, setBase] = useState<Form | null>(f);
  const [slugTouched, setSlugTouched] = useState(id != null);
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [loadErr, setLoadErr] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (id == null) return;
    sb.from('blog_posts').select(FULL).eq('id', id).maybeSingle().then(({ data, error }) => {
      if (error || !data) { setLoadErr(error?.message || 'Post not found.'); return; }
      const p = data as unknown as Full;
      const form = formOf(p, catNames);
      setCur(p); setF(form); setBase(form);
    });
    // catNames only seeds the form once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sb, id]);

  // The admin's name may arrive after a new post was opened.
  useEffect(() => {
    if (!me || cur) return;
    setF((x) => (x && !x.author ? { ...x, author: me } : x));
    setBase((x) => (x && !x.author ? { ...x, author: me } : x));
  }, [me, cur]);

  const dirty = !!f && !!base && JSON.stringify(f) !== JSON.stringify(base);
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const close = () => { if (dirty && !confirm('Close without saving? Your changes are lost.')) return; onClose(); };
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => (x ? { ...x, [k]: v } : x));

  if (!f) return <Modal title="Edit post" onClose={onClose} wide>{loadErr ? <Empty>Could not open the post: {loadErr}</Empty> : <Empty>Loading...</Empty>}</Modal>;

  const tags = parseTags(f.tags);
  const slugErr = f.slug && !SLUG_RE.test(f.slug) ? 'Only a-z, 0-9 and single dashes between words.' : '';
  const imgErr = f.image.trim() && !safeSrc(f.image) ? 'Must start with https:// (or / for a file on this site).' : '';
  const tagErr = tags.length > 10 ? 'At most 10 tags.' : tags.some((t) => t.length > 30) ? 'Each tag 30 characters or less.' : '';
  const words = f.content.trim() ? f.content.trim().split(/\s+/).length : 0;
  const options = f.category && !catNames.some((c) => ci(c) === ci(f.category)) ? [...catNames, f.category] : catNames;

  async function save() {
    if (busy || !f) return;
    setErr('');
    const isNew = !cur;
    const title = f.title.trim().replace(/\s+/g, ' ');
    const slug = f.slug.trim();
    const fail = (m: string) => { setErr(m); setTab('write'); };
    if (!title) return fail('Write a title.');
    if (!slug) return fail('Write a slug (the post link), e.g. wireshark-dns-basics.');
    if (slug.length > 120 || !SLUG_RE.test(slug)) return fail('Slug: only a-z, 0-9 and single dashes between words, 120 characters at most.');
    if (!f.category) return fail('Pick a category (add one under Categories first).');
    if (tagErr) return fail('Tags: ' + tagErr);
    if (imgErr) return fail('Image URL: ' + imgErr);

    // undefined = leave the stored date as it is.
    let publish_date: string | null | undefined = isNew ? null : undefined;
    const picked = fromLocalInput(f.date);
    const sameDate = !!cur && f.date === base?.date && !!cur.publish_date;
    if (f.status === 'scheduled') {
      if (!picked) return fail('Pick the date and time the post goes live.');
      if (picked.getTime() <= Date.now()) return fail('The go-live time must be in the future (or choose Published).');
      publish_date = sameDate ? cur!.publish_date : picked.toISOString();
    } else if (f.status === 'published') {
      if (picked && picked.getTime() > Date.now() + 60e3) return fail('A published post cannot have a future date. Choose Scheduled for that.');
      publish_date = sameDate ? cur!.publish_date : picked ? picked.toISOString() : new Date().toISOString();
    }

    const sent = f; // what is saved; typing during the save is kept (see below)
    setBusy(true);
    // Slugs are unique: say which post has it instead of showing a DB error.
    // Checked before the confirms, so a refused slug never asks first.
    let dup = sb.from('blog_posts').select('id, title').eq('slug', slug).limit(1);
    if (cur) dup = dup.neq('id', cur.id);
    const d = await dup;
    if (d.data?.length) { setBusy(false); return fail(`Another post already uses this slug: "${(d.data[0] as { title: string }).title}". Pick another one.`); }

    const wasLive = cur?.status === 'published';
    const asks = [
      f.status === 'published' && !wasLive && `Publish now? It shows on the blog. ${NOTIFY}`,
      wasLive && f.status !== 'published' && 'Take this post off the blog? Its link stops working until you publish it again.',
      wasLive && slug !== cur?.slug && `Change the link from /blog/${cur?.slug} to /blog/${slug}? Old links to this post, and its notification, stop working.`,
    ];
    if (asks.some((m) => m && !confirm(m))) { setBusy(false); return; }

    const row: Record<string, unknown> = {
      title, slug, category: f.category, status: f.status, tags, image: f.image.trim() || null, content: f.content,
      meta_title: f.meta_title.trim() || null, meta_desc: f.meta_desc.trim() || null, author: f.author.trim() || null,
    };
    if (publish_date !== undefined) row.publish_date = publish_date;
    // An update lands only while the status is still the one this form opened
    // with: a scheduled post can go live by itself (blog_publish_due_posts, and
    // its notification goes out) while the editor is open.
    const write = (guard: boolean) => {
      if (!cur) return sb.from('blog_posts').insert(row).select(FULL);
      let u = sb.from('blog_posts').update(row).eq('id', cur.id);
      if (guard) u = u.eq('status', cur.status);
      return u.select(FULL);
    };
    let res = await write(true);
    if (cur && !res.error && !res.data?.length) {
      const now = await sb.from('blog_posts').select('status').eq('id', cur.id).maybeSingle();
      const st = (now.data as { status: Status } | null)?.status;
      if (st && st !== cur.status) {
        const why = st === 'published' && cur.status === 'scheduled' ? ' (it went live at its time)' : '';
        if (!confirm(`While you were editing, this post changed from ${cur.status} to ${st}${why}. Save your version anyway? Its status becomes ${f.status}.`)) {
          setBusy(false);
          setErr(`Not saved: the post is ${st} now. Save again to overwrite it, or close and open it again.`);
          return;
        }
        res = await write(false);
      }
    }
    setBusy(false);
    if (res.error) {
      const m = res.error.code === '23505' ? 'That slug is already used by another post.' : res.error.message;
      setErr('Could not save: ' + m);
      return toast('Could not save: ' + m, 'error');
    }
    const p = (res.data as unknown as Full[] | null)?.[0];
    if (!p) { setErr(noRow('post')); return toast(noRow('post'), 'error'); }
    const form = formOf(p, catNames);
    setCur(p); setBase(form); setSlugTouched(true);
    // The saved version replaces the form only if nothing was typed meanwhile;
    // otherwise those edits stay (and show as unsaved).
    setF((x) => (x === sent ? form : x));
    onSaved(p, isNew);
    const what = isNew ? `created as ${p.status}` : cur!.status !== p.status ? `saved, ${cur!.status} to ${p.status}` : 'edited';
    logAdminEvent(isNew ? 'admin_blog_created' : 'admin_blog_updated', `"${p.title}" (${p.id}, /blog/${p.slug}) ${what}`);
    toast(isNew ? 'Post created' : 'Saved');
  }

  const src = safeSrc(f.image);
  return (
    <Modal title={cur ? 'Edit post' : 'New post'} onClose={close} wide>
      <form className="adm-form adm-blog-editor" id="admBlogEditor" noValidate
        onSubmit={(e) => { e.preventDefault(); save(); }}
        onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); } }}>
        <label className="adm-field"><span>Title</span>
          <input maxLength={150} value={f.title} autoFocus={!cur} id="admBlogTitle"
            onChange={(e) => { const v = e.target.value; setF((x) => (x ? { ...x, title: v, slug: slugTouched ? x.slug : slugify(v) } : x)); }} />
        </label>
        <label className="adm-field"><span>Slug (the post link)</span>
          <input maxLength={120} value={f.slug} id="admBlogSlug" spellCheck={false}
            onChange={(e) => { setSlugTouched(true); set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-')); }} />
          {slugErr ? <span className="adm-error" id="admBlogSlugErr">{slugErr}</span> : <span className="adm-help">{f.slug ? `Link: /blog/${f.slug}` : 'Made from the title until you edit it.'}</span>}
        </label>
        <div className="adm-blog-row">
          <label className="adm-field"><span>Category</span>
            <select value={f.category} onChange={(e) => set('category', e.target.value)} id="admBlogCategory">
              {/* An empty value needs its own option, or the first category looks picked while none is. */}
              {(!options.length || !f.category) && <option value="">{options.length ? 'Pick a category' : 'No categories yet'}</option>}
              {options.map((c) => <option key={c} value={c}>{catNames.includes(c) ? c : c + ' (not in the list)'}</option>)}
            </select>
          </label>
          <label className="adm-field"><span>Status</span>
            <select value={f.status} id="admBlogStatus" onChange={(e) => {
              const s = e.target.value as Status;
              // A future go-live time cannot stay on a published post: clear it (empty = now).
              setF((x) => {
                if (!x) return x;
                const d = fromLocalInput(x.date);
                return { ...x, status: s, date: s === 'published' && d && d.getTime() > Date.now() ? '' : x.date };
              });
            }}>
              {(Object.keys(STATUS_LABEL) as Status[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </label>
          {f.status !== 'draft' && (
            <label className="adm-field"><span>{f.status === 'scheduled' ? 'Goes live at' : 'Publish date (empty = now)'}</span>
              <input type="datetime-local" value={f.date} onChange={(e) => set('date', e.target.value)} id="admBlogDate" />
            </label>
          )}
        </div>
        <p className="adm-help" id="admBlogStatusHelp">
          {f.status === 'draft' ? 'Only admins see drafts.'
            : f.status === 'published' ? 'Live on the blog. Edits show on the site within about 5 minutes.'
              : 'It goes live at the first blog visit after this time (up to 5 minutes later) or when this Blog page is opened. ' + NOTIFY}
        </p>
        <label className="adm-field"><span>Tags (comma separated)</span>
          <input maxLength={400} value={f.tags} onChange={(e) => set('tags', e.target.value)} placeholder="wireshark, dns, forensics" id="admBlogTags" />
          {tagErr ? <span className="adm-error">{tagErr}</span> : <span className="adm-help">Saved in lowercase, each tag once. Up to 10.</span>}
        </label>
        <label className="adm-field"><span>Cover image URL (optional)</span>
          <input maxLength={500} value={f.image} onChange={(e) => set('image', e.target.value)} placeholder="https://..." id="admBlogImage" spellCheck={false} />
          {imgErr && <span className="adm-error">{imgErr}</span>}
        </label>
        {src && <Thumb key={src} src={src} />}

        <div className="adm-blog-tabs">
          <div className="adm-seg" role="group" aria-label="Content view">
            <button type="button" className={tab === 'write' ? 'on' : ''} onClick={() => setTab('write')} id="admBlogTabWrite">Write</button>
            <button type="button" className={tab === 'preview' ? 'on' : ''} onClick={() => setTab('preview')} id="admBlogTabPreview">Preview</button>
          </div>
          <span className="adm-dim">{num(words)} words</span>
        </div>
        {tab === 'write' ? (
          <label className="adm-field"><span>Content</span>
            <textarea className="adm-blog-content" maxLength={200000} value={f.content} onChange={(e) => set('content', e.target.value)} id="admBlogContent" spellCheck />
            <span className="adm-help">Every line is its own paragraph. # or ## big heading, ### small heading, **bold**, *italic*, `code`, a line with ``` opens and closes a code block, - or * at the start makes a list item. Links and HTML show as plain text.</span>
          </label>
        ) : <PostPreview f={f} tags={tags} views={cur?.views || 0} />}

        <div className="adm-grid-2 top">
          <label className="adm-field">
            <span className="adm-blog-top"><span>Meta title (optional)</span><Count n={f.meta_title.trim().length} max={60} id="admBlogMetaTitleCount" /></span>
            <input maxLength={200} value={f.meta_title} onChange={(e) => set('meta_title', e.target.value)} id="admBlogMetaTitle" />
            <span className="adm-help">Search and browser tab title, followed by &quot; - AlexCyberX Blog&quot;. Empty = the post title.</span>
          </label>
          <label className="adm-field"><span>Author</span>
            <input maxLength={60} value={f.author} onChange={(e) => set('author', e.target.value)} id="admBlogAuthor" />
            <span className="adm-help">Kept with the post. The post page does not show it yet.</span>
          </label>
        </div>
        <label className="adm-field">
          <span className="adm-blog-top"><span>Meta description (optional)</span><Count n={f.meta_desc.trim().length} max={160} id="admBlogMetaDescCount" /></span>
          <textarea rows={2} maxLength={400} value={f.meta_desc} onChange={(e) => set('meta_desc', e.target.value)} id="admBlogMetaDesc" />
          <span className="adm-help">Shown in search results, on the blog card and in the new-post notification. Empty: search and the card use the start of the article, and the notification has no text.</span>
        </label>
        <div className="adm-blog-serp" id="admBlogSerp" aria-label="How it looks in search">
          <span className="adm-blog-serp-url">{SITE_URL.replace(/^https?:\/\//, '')}/blog/{f.slug || 'slug'}</span>
          <span className="adm-blog-serp-title">{(f.meta_title.trim() || f.title.trim() || 'Untitled') + ' - AlexCyberX Blog'}</span>
          <span className="adm-blog-serp-desc">{excerpt({ meta_desc: f.meta_desc.trim() || null, content: f.content })}</span>
        </div>

        {err && <p className="adm-error" id="admBlogErr">{err}</p>}
        <div className="adm-actions">
          <button className="adm-btn primary" disabled={busy} id="admBlogSave">{busy ? 'Saving...' : 'Save'}</button>
          <button type="button" className="adm-btn ghost" onClick={close} id="admBlogClose">Close</button>
          {cur?.status === 'published' && <a className="adm-btn ghost" href={postPath(cur.slug)} target="_blank" rel="noopener noreferrer" id="admBlogEditorView">View on site</a>}
          <span className="adm-dim adm-blog-save-note">{dirty ? 'Unsaved changes' : cur ? 'All changes saved' : ''}</span>
        </div>
      </form>
    </Modal>
  );
}

function Count({ n, max, id }: { n: number; max: number; id: string }) {
  return <span className={'adm-blog-count' + (n > max ? ' over' : '')} id={id} title={n > max ? 'Search engines cut it after about ' + max : undefined}>{n} / {max}</span>;
}

function Thumb({ src }: { src: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) return <p className="adm-error" id="admBlogImgPreview">This image could not be loaded. The post shows no image if the link is broken.</p>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="adm-blog-thumb" src={src} alt="Cover preview" onError={() => setBroken(true)} id="admBlogImgPreview" />;
}

/* ---------- Preview ---------- */

/** The post the way /blog/<slug> lays it out (category, title, date, views,
 * cover, content, tags), from the form as it is now. */
function PostPreview({ f, tags, views }: { f: Form; tags: string[]; views: number }) {
  const src = safeSrc(f.image);
  const when = fromLocalInput(f.date);
  return (
    <article className="adm-blog-preview" id="admBlogPreview">
      <div className="adm-bp-cat">{capitalize(f.category)}</div>
      <h1 className="adm-bp-title">{f.title || 'Untitled'}</h1>
      <div className="adm-bp-meta">
        <span>{formatDate((when || new Date()).toISOString())}</span>
        <span>{views.toLocaleString('en-US')} views</span>
      </div>
      {src && <PreviewImg key={src} src={src} alt={f.title} />}
      <div className="adm-bp-content">{previewContent(f.content)}</div>
      {tags.length > 0 && <div className="adm-bp-tags">{tags.map((t) => <span key={t} className="adm-bp-tag">{t}</span>)}</div>}
    </article>
  );
}

// Hidden when broken, like BlogImage on the site.
function PreviewImg({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = useState(false);
  // eslint-disable-next-line @next/next/no-img-element
  return broken ? null : <img className="adm-bp-img" src={src} alt={alt} onError={() => setBroken(true)} />;
}

type Tag = 'code' | 'strong' | 'em';
const MARKS: Record<string, { tag: Tag; open: boolean }> = {
  '\u0001': { tag: 'code', open: true }, '\u0002': { tag: 'code', open: false },
  '\u0003': { tag: 'strong', open: true }, '\u0004': { tag: 'strong', open: false },
  '\u0005': { tag: 'em', open: true }, '\u0006': { tag: 'em', open: false },
};

/** inlineMd() from lib/blog.ts as React elements: the same three regex passes,
 * but they write marker characters instead of tags, then the markers become
 * elements. A tag closed out of order also closes the ones opened inside it
 * and reopens them after, which is what the browser does with the HTML string. */
function inline(text: string): React.ReactNode[] {
  const s = text.replace(/[\u0001-\u0006]/g, '')
    .replace(/`([^`]+)`/g, '\u0001$1\u0002')
    .replace(/\*\*([^*]+)\*\*/g, '\u0003$1\u0004')
    .replace(/\*([^*]+)\*/g, '\u0005$1\u0006');
  type Node = { tag: Tag | null; kids: React.ReactNode[] };
  const stack: Node[] = [{ tag: null, kids: [] }];
  let key = 0;
  let buf = '';
  const push = (n: React.ReactNode) => {
    const kids = stack[stack.length - 1].kids;
    if (typeof n === 'string' && typeof kids[kids.length - 1] === 'string') kids[kids.length - 1] += n;
    else kids.push(n);
  };
  const flush = () => { if (buf) { push(buf); buf = ''; } };
  const pop = () => { const n = stack.pop()!; if (n.kids.length) push(createElement(n.tag as Tag, { key: key++ }, ...n.kids)); };
  for (const ch of s) {
    const m = MARKS[ch];
    if (!m) { buf += ch; continue; }
    flush();
    if (m.open) { stack.push({ tag: m.tag, kids: [] }); continue; }
    const at = stack.map((n) => n.tag).lastIndexOf(m.tag);
    if (at < 1) continue;
    const reopen = stack.slice(at + 1).map((n) => n.tag as Tag);
    while (stack.length > at) pop();
    reopen.forEach((t) => stack.push({ tag: t, kids: [] }));
  }
  flush();
  while (stack.length > 1) pop();
  return stack[0].kids;
}

/** renderContent() from lib/blog.ts, line for line, as React elements (no
 * HTML string, so no innerHTML in the panel). Keep the two in step. */
function previewContent(raw: string | null | undefined): React.ReactNode {
  if (!raw) return <p className="adm-dim">This article has no content yet.</p>;
  const out: React.ReactNode[] = [];
  let list: React.ReactNode[] | null = null; // open <ul>: a code block opened now lands inside it, as in the HTML string
  let code: string | null = null;
  let k = 0;
  // The browser drops one newline right after <pre>.
  const pre = (t: string) => <pre key={k++}>{t.startsWith('\n') ? t.slice(1) : t}</pre>;
  for (const line of raw.split(/\r?\n/)) {
    if (line.trim().startsWith('```')) {
      if (code === null) code = '';
      else { (list || out).push(pre(code)); code = null; }
      continue;
    }
    if (code !== null) { code += line + '\n'; continue; }
    if (/^\s*[-*]\s+/.test(line)) {
      (list ||= []).push(<li key={k++}>{inline(line.replace(/^\s*[-*]\s+/, ''))}</li>);
      continue;
    }
    if (list) { out.push(<ul key={k++}>{list}</ul>); list = null; }
    if (/^###\s+/.test(line)) { out.push(<h3 key={k++}>{inline(line.replace(/^###\s+/, ''))}</h3>); continue; }
    if (/^##\s+/.test(line)) { out.push(<h2 key={k++}>{inline(line.replace(/^##\s+/, ''))}</h2>); continue; }
    if (/^#\s+/.test(line)) { out.push(<h2 key={k++}>{inline(line.replace(/^#\s+/, ''))}</h2>); continue; }
    if (line.trim() === '') continue;
    out.push(<p key={k++}>{inline(line)}</p>);
  }
  if (code !== null) (list || out).push(pre(code));
  if (list) out.push(<ul key={k++}>{list}</ul>);
  return out;
}
