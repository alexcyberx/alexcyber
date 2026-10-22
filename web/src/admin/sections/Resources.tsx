'use client';

// Resources: the files on /resources (table `resources` + the public Storage
// bucket "resources"). Stats, filters, table (open, edit, hide/show, delete),
// upload with a progress bar, replace a file, CSV of the current filter.
// The old panel defined renderResources twice, so its list never loaded.

import { useEffect, useMemo, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SectionProps } from '../AdminApp';
import { adminSupabase, adminToken, logAdminEvent } from '../sb';
import { Card, Empty, Modal, Pager, Stat, dateTime, downloadCsv, num, useToast } from '../ui';
import { RES_TYPE_LABELS, formatSize } from '@/lib/resources';

type Row = {
  id: string; name: string; type: string; file_path: string; file_size: number | null;
  chapter_tag: string | null; downloads: number | null; status: string | null; uploaded_at: string | null;
};
type Sort = 'new' | 'downloads' | 'name';

const COLS = 'id, name, type, file_path, file_size, chapter_tag, downloads, status, uploaded_at';
const BUCKET = 'resources';
const PER_PAGE = 25;
// The site's own type list (/resources labels and filters by these).
const TYPES = Object.keys(RES_TYPE_LABELS);
// An update or delete that RLS refuses returns no row and no error.
const NO_ROW = 'Nothing was changed: the resource is gone or this session has no write access. Sign in again.';
// The bucket has no size limit of its own (file_size_limit null, checked
// 2026-10-21) and the browser cannot read bucket settings (no policy on
// storage.buckets), so the project's per-file limit applies: 50 MB on the
// current plan. Checked here so a big file fails at once, not after a long upload.
const MAX_BYTES = 50 * 1024 * 1024;

// Accepted extensions: the type each one preselects and the content type it
// is stored with. The bucket is public and serves a file with its stored
// type, so code and text are stored as plain text (a browser never runs or
// renders them) and HTML, SVG and executables are not accepted at all.
const TEXT = 'text/plain';
const BIN = 'application/octet-stream';
const EXT_GROUPS: [type: string, mime: string, exts: string[]][] = [
  ['pdf', 'application/pdf', ['pdf']],
  ['cheatsheet', TEXT, ['md']],
  ['pcap', BIN, ['pcap', 'pcapng', 'cap']],
  ['wordlist', TEXT, ['txt', 'lst', 'dic']],
  ['script', TEXT, ['py', 'sh', 'ps1', 'rb', 'pl', 'js', 'ts', 'go', 'c', 'cpp', 'h', 'rs', 'php', 'lua', 'sql', 'ipynb', 'yar', 'rules']],
  ['other', TEXT, ['csv', 'json', 'yaml', 'yml', 'log', 'conf', 'ini']],
  ['other', BIN, ['zip', '7z', 'gz', 'tgz', 'tar', 'rar', 'evtx', 'docx', 'pptx', 'xlsx']],
  ['other', 'image/png', ['png']],
  ['other', 'image/jpeg', ['jpg', 'jpeg']],
  ['other', 'image/webp', ['webp']],
];
const EXT: Record<string, { type: string; mime: string }> = Object.fromEntries(
  EXT_GROUPS.flatMap(([type, mime, exts]) => exts.map((e) => [e, { type, mime }])),
);
const ACCEPT = Object.keys(EXT).map((e) => '.' + e).join(',');
// Paths this panel (and the old one) writes: plain segments, no "..".
const PATH_RE = /^[A-Za-z0-9][\w .()+-]*(\/[A-Za-z0-9][\w .()+-]*)*$/;
const STOPPED = 'stopped';

const typeLabel = (t: string) => RES_TYPE_LABELS[t] || t;
const fileLabel = (path: string) => path.split('/').pop() || path;
const extOf = (name: string) => { const i = name.lastIndexOf('.'); return i > 0 ? name.slice(i + 1).toLowerCase() : ''; };
const clean = (s: string, max: number) => s.replace(/\s+/g, ' ').trim().slice(0, max);
const isActive = (r: Row) => r.status === 'active'; // RLS shows users only 'active' rows

/** Public link to a stored file. The base is the configured Supabase URL; the
 * DB only gives the path, which must look like one this panel writes. */
function fileUrl(path: string): string | null {
  if (!PATH_RE.test(path) || path.includes('..')) return null;
  const url = adminSupabase()?.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  if (!url) return null;
  try {
    const u = new URL(url);
    // https in production; the local test stack runs on http://localhost.
    return u.protocol === 'https:' || u.hostname === 'localhost' || u.hostname === '127.0.0.1' ? url : null;
  } catch { return null; }
}

/** The file's name in Storage: ASCII letters, digits, "_" and "-", then its
 * extension, at most ~75 characters. The only part of the path the admin controls. */
function safeName(name: string, ext: string): string {
  const base = name.slice(0, name.length - ext.length - 1).normalize('NFKD').replace(/\p{M}/gu, '')
    .replace(/[^A-Za-z0-9_-]+/g, '_').replace(/^[_-]+|[_-]+$/g, '').slice(0, 70);
  return (base || 'file') + '.' + ext;
}

/** A new folder per upload, so two files with the same name never clash and
 * the download still has a readable name. */
function newPath(name: string, ext: string): string {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
  return `${id}/${safeName(name, ext)}`;
}

/** Name suggested from the file name: "wireshark_cheatsheet-v2.pdf" gives "wireshark cheatsheet v2". */
const niceName = (file: string) => clean(file.replace(/\.[^.]*$/, '').replace(/[_-]+/g, ' '), 120);

function checkFile(f: File): string {
  const ext = extOf(f.name);
  if (!EXT[ext]) return ext ? `Files ending in .${ext} are not accepted.` : 'The file needs an extension, like .pdf.';
  if (!f.size) return 'The file is empty.';
  if (f.size > MAX_BYTES) return `The file is ${formatSize(f.size)}. The limit is ${MAX_BYTES / 1048576} MB.`;
  return '';
}

/** Upload with progress (supabase-js has no progress events). Same endpoint
 * and headers as supabase-js; x-upsert false, so an existing path is never
 * overwritten. Resolves to an error message, or null when stored. */
function putFile(path: string, file: File, mime: string, token: string, onProgress: (pct: number) => void, ref: React.MutableRefObject<XMLHttpRequest | null>): Promise<string | null> {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    ref.current = xhr;
    const done = (err: string | null) => { ref.current = null; resolve(err); };
    xhr.open('POST', `${base}/storage/v1/object/${BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`);
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.setRequestHeader('apikey', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.setRequestHeader('cache-control', 'max-age=3600');
    xhr.setRequestHeader('Content-Type', mime);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return done(null);
      let msg = '';
      try { const j = JSON.parse(xhr.responseText); msg = j.message || j.error || ''; } catch { /* not JSON */ }
      done(msg || `Storage answered ${xhr.status}.`);
    };
    xhr.onerror = () => done('Network error. Try again.');
    xhr.onabort = () => done(STOPPED);
    xhr.send(file);
  });
}

/** Removes files and returns how many really went: without a Storage read
 * policy for admins, Storage removes nothing and still reports no error. */
async function removeFiles(sb: SupabaseClient, paths: string[]): Promise<number> {
  try {
    const { data, error } = await sb.storage.from(BUCKET).remove(paths);
    return error ? 0 : (data || []).length;
  } catch { return 0; }
}

export default function Resources({ site }: SectionProps) {
  const sb = adminSupabase()!;
  const toast = useToast();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState<'' | 'active' | 'hidden'>('');
  const [sort, setSort] = useState<Sort>('new');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<{ row: Row | null } | null>(null);
  // Rows with a write in flight (a set, so one finishing never re-enables another).
  const [busyIds, setBusyIds] = useState<ReadonlySet<string>>(() => new Set());
  const setBusy = (id: string, on: boolean) => setBusyIds((s) => {
    const n = new Set(s);
    if (on) n.add(id); else n.delete(id);
    return n;
  });

  // Every row (the stats and the shared-file check need all of them), in
  // pages of 1000: PostgREST returns at most 1000 rows per request.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const all: Row[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await sb.from('resources').select(COLS).order('uploaded_at', { ascending: false }).order('id').range(from, from + 999);
        if (cancelled) return;
        if (error) { setErr(error.message); setRows([]); return; }
        all.push(...((data || []) as Row[]));
        if (!data || data.length < 1000) break;
      }
      setErr('');
      setRows(all);
    })().catch(() => { if (!cancelled) { setErr('Network error.'); setRows([]); } });
    return () => { cancelled = true; };
  }, [sb]);

  const stats = useMemo(() => {
    if (!rows) return null;
    const active = rows.filter(isActive).length;
    const top = rows.reduce<Row | null>((b, r) => ((r.downloads || 0) > (b?.downloads || 0) ? r : b), null);
    return { total: rows.length, active, hidden: rows.length - active, downloads: rows.reduce((a, r) => a + (r.downloads || 0), 0), top };
  }, [rows]);

  // The site's types first, then any other value rows really have.
  const typeOptions = useMemo(() => [...new Set([...TYPES, ...(rows || []).map((r) => r.type).filter(Boolean)])], [rows]);

  // Chapter tag suggestions: tags already in use, then course and chapter titles.
  const tags = useMemo(() => [...new Set([
    ...(rows || []).map((r) => (r.chapter_tag || '').trim()),
    ...site.courses.flatMap((c) => [c.title, ...c.chapters.map((ch) => ch.title)]),
  ].filter(Boolean))].slice(0, 500), [rows, site]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const out = (rows || []).filter((r) =>
      (!s || r.name.toLowerCase().includes(s) || (r.chapter_tag || '').toLowerCase().includes(s))
      && (!type || r.type === type)
      && (!status || (status === 'active') === isActive(r)));
    if (sort === 'downloads') out.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    else if (sort === 'name') out.sort((a, b) => a.name.localeCompare(b.name));
    else out.sort((a, b) => (b.uploaded_at || '').localeCompare(a.uploaded_at || ''));
    return out;
  }, [rows, q, type, status, sort]);

  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);

  const saved = (row: Row, isNew: boolean) => setRows((l) => (isNew ? [row, ...(l || [])] : (l || []).map((x) => (x.id === row.id ? row : x))));
  // A file is removed only when no other row still links to it.
  const pathUsed = (path: string, id: string) => (rows || []).some((x) => x.id !== id && x.file_path === path);

  async function toggle(r: Row) {
    const next = isActive(r) ? 'hidden' : 'active';
    setBusy(r.id, true);
    const { data, error } = await sb.from('resources').update({ status: next }).eq('id', r.id).select(COLS);
    setBusy(r.id, false);
    if (error) return toast('Could not change visibility: ' + error.message, 'error');
    const row = (data as Row[] | null)?.[0];
    if (!row) return toast(NO_ROW, 'error');
    saved(row, false);
    logAdminEvent('admin_resource_updated', `"${r.name}" (${r.id}): ${next === 'active' ? 'shown on /resources' : 'hidden from /resources'}`);
    toast(next === 'active' ? `"${r.name}" is shown on /resources` : `"${r.name}" is hidden from /resources`);
  }

  async function remove(r: Row) {
    if (!confirm(`Delete "${r.name}" for good? The row and its file are removed and the download link stops working. This cannot be undone.`)) return;
    setBusy(r.id, true);
    const { data, error } = await sb.from('resources').delete().eq('id', r.id).select('id');
    if (error || !data?.length) { setBusy(r.id, false); return toast(error ? 'Could not delete: ' + error.message : NO_ROW, 'error'); }
    // The file goes after the row, so the site never links a missing file.
    const shared = pathUsed(r.file_path, r.id);
    const removed = shared ? 0 : await removeFiles(sb, [r.file_path]);
    setBusy(r.id, false);
    setRows((l) => (l || []).filter((x) => x.id !== r.id));
    logAdminEvent('admin_resource_deleted', `"${r.name}" (${r.id}, ${r.file_path}) deleted${shared ? ', file kept (another row uses it)' : removed ? ', file removed' : ', file left in Storage'}`);
    if (shared || removed) toast('Resource deleted');
    else toast(`Resource deleted, but its file could not be removed from Storage (${r.file_path}).`, 'info');
  }

  function exportCsv() {
    downloadCsv(`alexcyberx-resources-${new Date().toISOString().slice(0, 10)}.csv`, [
      ['Name', 'Type', 'Chapter tag', 'Size (bytes)', 'Downloads', 'Uploaded', 'Status', 'File'],
      ...list.map((r) => [r.name, r.type, r.chapter_tag, r.file_size || 0, r.downloads || 0, r.uploaded_at, r.status || 'hidden', fileUrl(r.file_path) || r.file_path]),
    ]);
    logAdminEvent('admin_export', `resources CSV (${list.length} rows)`);
    toast(`Exported ${list.length} resources`);
  }

  const filtered = !!(q.trim() || type || status);
  return (
    <div className="adm-stack">
      <div className="adm-stats" id="admResStats">
        <Stat label="Resources" value={stats ? num(stats.total) : '...'} />
        <Stat label="Active" value={stats ? num(stats.active) : '...'} sub={stats ? 'Shown on /resources' : undefined} />
        <Stat label="Hidden" value={stats ? num(stats.hidden) : '...'} />
        <Stat label="Total downloads" value={stats ? num(stats.downloads) : '...'} sub={stats ? 'Once per user per file' : undefined} />
        <div className="adm-res-top" title={stats?.top?.name || undefined} id="admResTop">
          <Stat label="Most downloaded" value={stats ? stats.top?.name || '-' : '...'} sub={stats ? (stats.top ? num(stats.top.downloads || 0) + ' downloads' : 'No downloads yet') : undefined} />
        </div>
      </div>
      <Card title="Resource library" actions={<>
        <input className="adm-input" placeholder="Search name or chapter tag" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} id="admResSearch" />
        <select className="adm-input adm-select" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} aria-label="Type" id="admResType">
          <option value="">All types</option>
          {typeOptions.map((t) => <option key={t} value={t}>{typeLabel(t)}</option>)}
        </select>
        <select className="adm-input adm-select" value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1); }} aria-label="Status" id="admResStatus">
          <option value="">Any status</option><option value="active">Active</option><option value="hidden">Hidden</option>
        </select>
        <select className="adm-input adm-select" value={sort} onChange={(e) => { setSort(e.target.value as Sort); setPage(1); }} aria-label="Sort" id="admResSort">
          <option value="new">Newest first</option><option value="downloads">Most downloads</option><option value="name">Name A to Z</option>
        </select>
        <button className="adm-btn" onClick={exportCsv} disabled={!list.length} id="admResExport">Export CSV</button>
        <button className="adm-btn primary" onClick={() => setForm({ row: null })} disabled={rows == null || !!err} id="admResUpload">Upload</button>
      </>}>
        {rows == null ? <Empty>Loading...</Empty> : err ? <Empty>Could not load resources: {err}</Empty> : !list.length ? <Empty>{filtered ? 'No resources match.' : 'No resources yet. Add the first file with Upload.'}</Empty> : (
          <div className="adm-table-wrap">
            <table className="adm-table" id="admResTable">
              <thead><tr><th>Name</th><th>Type</th><th>Chapter tag</th><th>Size</th><th>Downloads</th><th>Uploaded</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {shown.map((r) => {
                  const url = fileUrl(r.file_path);
                  const busy = busyIds.has(r.id);
                  return (
                    <tr key={r.id} className="static" data-id={r.id}>
                      <td className="adm-wrap"><div className="adm-strong">{r.name}</div><div className="adm-dim">{fileLabel(r.file_path)}</div></td>
                      <td><span className="adm-pill">{typeLabel(r.type)}</span></td>
                      <td className="adm-wrap">{r.chapter_tag || <span className="adm-dim">None</span>}</td>
                      <td className="adm-num">{formatSize(r.file_size)}</td>
                      <td className="adm-num">{num(r.downloads || 0)}</td>
                      <td className="adm-dim adm-nowrap" title={dateTime(r.uploaded_at)}>{r.uploaded_at ? new Date(r.uploaded_at).toLocaleDateString('en-IN') : '-'}</td>
                      <td>{isActive(r) ? <span className="adm-pill accent">active</span> : <span className="adm-pill">{r.status || 'hidden'}</span>}</td>
                      <td>
                        <div className="adm-res-actions">
                          {url
                            ? <a className="adm-btn ghost" href={url} target="_blank" rel="noopener noreferrer" id={'admResOpen-' + r.id}>Open file</a>
                            : <span className="adm-dim" title={'Stored path: ' + r.file_path}>No link</span>}
                          <button className="adm-btn" onClick={() => setForm({ row: r })} disabled={busy} id={'admResEdit-' + r.id}>Edit</button>
                          <button className="adm-btn" onClick={() => toggle(r)} disabled={busy} id={'admResToggle-' + r.id}>{isActive(r) ? 'Hide' : 'Show'}</button>
                          <button className="adm-btn danger" onClick={() => remove(r)} disabled={busy} id={'admResDel-' + r.id}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={cur} pages={pages} total={list.length} onPage={setPage} />
      </Card>
      {form && <ResForm row={form.row} tags={tags} pathUsed={pathUsed} onSaved={saved} onClose={() => setForm(null)} />}
    </div>
  );
}

/* ---------- Upload / edit ---------- */

function ResForm({ row, tags, pathUsed, onSaved, onClose }: {
  row: Row | null; tags: string[]; pathUsed: (path: string, id: string) => boolean;
  onSaved: (r: Row, isNew: boolean) => void; onClose: () => void;
}) {
  const sb = adminSupabase()!;
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState(row?.name || '');
  const [type, setType] = useState(row?.type || 'cheatsheet');
  const [tag, setTag] = useState(row?.chapter_tag || '');
  const startStatus = row && !isActive(row) ? 'hidden' : 'active';
  const [status, setStatus] = useState(startStatus);
  const [err, setErr] = useState('');
  const [phase, setPhase] = useState<'' | 'upload' | 'save'>('');
  const [pct, setPct] = useState(0);
  const xhr = useRef<XMLHttpRequest | null>(null);
  // Set at once on submit: `phase` only changes after the token await, so a
  // double click could otherwise start two uploads and insert two rows.
  const running = useRef(false);
  const busy = phase !== '';
  // Keep a row's own type selectable even if the site does not list it.
  const types = row && !TYPES.includes(row.type) ? [...TYPES, row.type] : TYPES;
  const fileErr = file ? checkFile(file) : '';
  const curUrl = row ? fileUrl(row.file_path) : null;

  function pick(f: File | null) {
    setFile(f);
    setErr('');
    if (!f) return;
    const ext = extOf(f.name);
    // New upload: the type follows the file. A replacement keeps the row's type.
    if (!row && EXT[ext]) setType(EXT[ext].type);
    if (!name.trim()) setName(niceName(f.name));
  }

  // While uploading, closing means stopping; while saving the row, wait.
  const close = () => {
    if (phase === 'upload') { if (confirm('Stop the upload? Nothing is saved.')) xhr.current?.abort(); return; }
    if (phase === '') onClose();
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || running.current) return;
    const n = clean(name, 120);
    const t = clean(tag, 80);
    if (!n) return setErr('Give the resource a name.');
    if (!types.includes(type)) return setErr('Pick a type.');
    if (!row && !file) return setErr('Choose a file to upload.');
    if (file && fileErr) return setErr(fileErr);

    const values: Partial<Row> = {};
    const changes: string[] = [];
    if (!row) Object.assign(values, { name: n, type, chapter_tag: t, status });
    else {
      // Only fields the admin touched are written, so an old value that is
      // longer than today's limits (or an odd status) is never cut or reset.
      if (name !== row.name && n !== row.name) { values.name = n; changes.push('renamed'); }
      if (type !== row.type) { values.type = type; changes.push('type ' + type); }
      if (tag !== (row.chapter_tag || '') && t !== (row.chapter_tag || '')) { values.chapter_tag = t; changes.push('chapter tag'); }
      if (status !== startStatus) { values.status = status; changes.push(status === 'active' ? 'shown' : 'hidden'); }
      if (file) changes.push('file replaced');
      if (!changes.length) { onClose(); return; }
      if (file && !confirm(`Replace the file of "${row.name}"? The old file is deleted once the new one is saved.`)) return;
    }
    setErr('');
    running.current = true;
    try { await save(values, changes, n); } finally { running.current = false; }
  }

  // Upload (if a file was picked), then the row, then the old file.
  async function save(values: Partial<Row>, changes: string[], n: string) {
    let path = '';
    if (file) {
      const token = await adminToken();
      if (!token) return setErr('Please sign in again.');
      const ext = extOf(file.name);
      path = newPath(file.name, ext);
      setPct(0);
      setPhase('upload');
      const upErr = await putFile(path, file, EXT[ext].mime, token, setPct, xhr);
      if (upErr) {
        setPhase('');
        // A stopped upload may still have reached Storage.
        if (upErr === STOPPED) { removeFiles(sb, [path]); return setErr('Upload stopped. Nothing was saved.'); }
        toast('Upload failed: ' + upErr, 'error');
        return setErr('Upload failed: ' + upErr);
      }
      values.file_path = path;
      values.file_size = file.size;
    }

    setPhase('save');
    const res = row
      ? await sb.from('resources').update(values).eq('id', row.id).select(COLS)
      : await sb.from('resources').insert(values).select(COLS);
    const out = (res.data as Row[] | null)?.[0];
    if (res.error || !out) {
      // No orphans: the new file goes again when its row could not be saved.
      const cleaned = !path || (await removeFiles(sb, [path])) > 0;
      setPhase('');
      const msg = (res.error ? 'Could not save: ' + res.error.message : NO_ROW) + (cleaned ? '' : ` The uploaded file is still in Storage (${path}).`);
      toast(msg, 'error');
      return setErr(msg);
    }

    // The old file goes only now that the row points at the new one.
    let left = false;
    if (row && path && row.file_path !== path && !pathUsed(row.file_path, row.id)) left = !(await removeFiles(sb, [row.file_path]));
    setPhase('');
    onSaved(out, !row);
    if (!row) logAdminEvent('admin_resource_uploaded', `"${n}" (${out.id}) uploaded: ${typeLabel(type)}, ${formatSize(file!.size)}, ${status}`);
    else logAdminEvent('admin_resource_updated', `"${n}" (${row.id}): ${changes.join(', ')}${left ? `, old file left in Storage (${row.file_path})` : ''}`);
    if (left) toast('Saved, but the old file could not be removed from Storage.', 'info');
    else toast(row ? 'Resource saved' : 'Resource uploaded');
    onClose();
  }

  return (
    <Modal title={row ? 'Edit resource' : 'Upload resource'} onClose={close}>
      <form className="adm-form" onSubmit={submit} id="admResForm">
        <label className="adm-field"><span>{row ? 'Replace file (optional)' : 'File'}</span>
          <input type="file" className="adm-res-file" accept={ACCEPT} disabled={busy} onChange={(e) => pick(e.target.files?.[0] || null)} id="admResFile" />
        </label>
        {file
          ? <p className={fileErr ? 'adm-error' : 'adm-help'} id="admResFileInfo">{fileErr || `${file.name}, ${formatSize(file.size)}`}</p>
          : row && <p className="adm-help" id="admResFileInfo">Now: {fileLabel(row.file_path)}, {formatSize(row.file_size)}{curUrl && <>{' '}<a className="adm-link" href={curUrl} target="_blank" rel="noopener noreferrer">Open</a></>}</p>}
        <p className="adm-help">Up to {MAX_BYTES / 1048576} MB. Allowed: {Object.keys(EXT).join(', ')}.</p>
        <label className="adm-field"><span>Name</span>
          <input required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} disabled={busy} placeholder="e.g. Wireshark cheatsheet" id="admResName" />
        </label>
        <div className="adm-grid-2">
          <label className="adm-field"><span>Type</span>
            <select value={type} onChange={(e) => setType(e.target.value)} disabled={busy} id="admResFormType">
              {types.map((t) => <option key={t} value={t}>{typeLabel(t)}</option>)}
            </select>
          </label>
          <label className="adm-field"><span>Visibility</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={busy} id="admResVisibility">
              <option value="active">Active (shown on /resources)</option><option value="hidden">Hidden</option>
            </select>
          </label>
        </div>
        {/* The bucket is public: hiding removes the card, not the file. */}
        {status === 'hidden' && <p className="adm-help" id="admResHiddenNote">Hidden takes the card off /resources. The file stays public: anyone who already has its link can still open it.</p>}
        <label className="adm-field"><span>Chapter tag (optional, shown on the card)</span>
          <input maxLength={80} value={tag} onChange={(e) => setTag(e.target.value)} disabled={busy} list="admResTags" placeholder="e.g. Network basics" id="admResTag" />
        </label>
        <datalist id="admResTags">{tags.map((t) => <option key={t} value={t} />)}</datalist>
        {phase === 'upload' && (
          <div className="adm-progress" id="admResProgress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
            <div className="adm-progress-top"><span>Uploading...</span><span className="adm-dim">{pct}%</span></div>
            <div className="adm-bar"><span style={{ width: `${pct}%` }} /></div>
          </div>
        )}
        {err && <p className="adm-error" id="admResErr">{err}</p>}
        <div className="adm-actions">
          <button className="adm-btn primary" disabled={busy || !!fileErr || (!row && !file)} id="admResSave">
            {phase === 'upload' ? 'Uploading...' : phase === 'save' ? 'Saving...' : row ? 'Save' : 'Upload'}
          </button>
          <button type="button" className="adm-btn ghost" onClick={close} disabled={phase === 'save'} id="admResCancel">{phase === 'upload' ? 'Stop upload' : 'Cancel'}</button>
        </div>
      </form>
    </Modal>
  );
}
