'use client';

// /resources: filters + grid of #resourcesPage in index.html (css/ctf-room.css).
// Logic from js/resources.js, with these changes:
// - Logged out: the login modal opens here and comes back to /resources. RLS only
//   shows rows to logged-in users, so nothing can be server-rendered.
// - Loaded once per login (the SPA re-fetched every time the page was shown).
// - A card is a real link to the file, so the new tab opens on the click itself
//   and popup blockers never stop it (middle-click works too).

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { browserSupabase, supabaseConfigured } from '@/lib/supabase';
import { formatSize, resIcon, resLabel, type Resource } from '@/lib/resources';

const COLS = 'id, name, type, file_path, file_size, chapter_tag, downloads, uploaded_at';

// Public bucket URL (string building, no request). Rows only exist in the browser.
function fileUrl(path: string | null): string {
  const sb = path ? browserSupabase() : null;
  return sb && path ? sb.storage.from('resources').getPublicUrl(path).data.publicUrl : '';
}

export default function ResourcesView() {
  const { user, ready, openAuth } = useAuth();
  const [items, setItems] = useState<Resource[] | null>(null); // null = not loaded yet
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState('');

  // Logged out: login modal, then back here.
  useEffect(() => { if (ready && !user) openAuth('login', '/resources'); }, [ready, user, openAuth]);

  const uid = user?.id;
  useEffect(() => {
    const sb = browserSupabase();
    if (!uid || !sb) return;
    let cancelled = false;
    sb.from('resources').select(COLS).eq('status', 'active').order('uploaded_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) { console.error('[Resources] load error:', error.message); setFailed(true); return; }
        setFailed(false);
        setItems((data as Resource[]) || []);
      }, () => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [uid]);

  // Counter only (fire and forget); the link itself opens the file.
  const bump = (id: string) => {
    browserSupabase()?.rpc('increment_resource_downloads', { p_resource_id: id }).then(() => {}, () => {});
    setItems((list) => list && list.map((r) => (r.id === id ? { ...r, downloads: (r.downloads || 0) + 1 } : r)));
  };

  const all = items || [];
  const types = [...new Set(all.map((r) => r.type).filter((t): t is string => Boolean(t)))];
  const list = active ? all.filter((r) => r.type === active) : all;

  let empty: React.ReactNode = null;
  if (!supabaseConfigured()) empty = 'Resources are temporarily unavailable. Please check back soon.';
  else if (failed) empty = 'Could not load resources right now. Please try again later.';
  else if (ready && !user) {
    empty = (
      <>
        Please{' '}
        <a href="/?auth=login&next=/resources" style={{ color: 'var(--red)', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); openAuth('login', '/resources'); }}>log in</a>
        {' '}to see the resource library.
      </>
    );
  } else if (!list.length) empty = items ? 'No resources here yet. Check back soon.' : 'Loading resources…';

  return (
    <>
      <div className="blog-filters" id="resourcesFilters">
        {!failed && types.length > 0 && (
          <>
            <button className={'blog-filter-btn' + (active === '' ? ' active' : '')} onClick={() => setActive('')}>All</button>
            {types.map((t) => (
              <button key={t} className={'blog-filter-btn' + (active === t ? ' active' : '')} onClick={() => setActive(t)}>{resLabel(t)}</button>
            ))}
          </>
        )}
      </div>

      <div className="blog-grid" id="resourcesGrid">
        {empty ? (
          <div className="blog-empty">{empty}</div>
        ) : list.map((r) => {
          const body = (
            <>
              <div className="blog-card-img-placeholder" style={{ fontSize: 32 }}>{resIcon(r.type)}</div>
              <div className="blog-card-body">
                <div className="blog-card-cat">{resLabel(r.type)}</div>
                <div className="blog-card-title">{r.name}</div>
                <div className="blog-card-excerpt">{r.chapter_tag || ''}</div>
                <div className="blog-card-meta">
                  <span>{formatSize(r.file_size)}</span>
                  <span>{(r.downloads || 0).toLocaleString()} downloads</span>
                </div>
              </div>
            </>
          );
          const url = fileUrl(r.file_path);
          return url ? (
            <a key={r.id} className="blog-card" style={{ cursor: 'pointer' }} href={url} target="_blank" rel="noopener noreferrer"
              onClick={() => bump(r.id)} onAuxClick={(e) => { if (e.button === 1) bump(r.id); }}>
              {body}
            </a>
          ) : (
            <div key={r.id} className="blog-card" style={{ cursor: 'pointer' }}>{body}</div>
          );
        })}
      </div>
    </>
  );
}
