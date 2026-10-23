'use client';

// Settings: the two site switches (maintenance overlay, sign-up form), site
// details, the About text in every language of the picker (with a Google
// Translate helper for the empty ones) and the signed-in admin's password.
// site_settings and about_bio are each one JSON value that the save RPCs
// replace whole, so every save reads the stored value first, changes only its
// own keys and keeps every key it does not know.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { SectionProps } from '../AdminApp';
import { adminSupabase, logAdminEvent } from '../sb';
import { Card, Empty, dateTime, timeAgo, useToast } from '../ui';

type Obj = Record<string, unknown>;
type Sb = NonNullable<ReturnType<typeof adminSupabase>>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const TAG_RE = /<[^>]*>/;

/** False once the component is gone: async work then stops touching state. */
function useAlive() {
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  return alive;
}

/** Browser "leave page?" prompt while a card has unsaved edits. */
function useLeaveWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);
}

/** One write at a time per card: both switches and the form save the same
 * JSON value, so two saves running together could undo each other. */
function useLock() {
  const alive = useAlive();
  const lock = useRef(false);
  const [busy, setBusy] = useState('');
  const run = useCallback(async (key: string, fn: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(key);
    try { await fn(); } finally {
      lock.current = false;
      if (alive.current) setBusy('');
    }
  }, [alive]);
  return { busy, run, alive };
}

/** When a platform_settings row was last saved (everyone may read the table). */
async function savedAt(sb: Sb, key: string): Promise<string | null> {
  const { data } = await sb.from('platform_settings').select('updated_at').eq('key', key).maybeSingle();
  return (data?.updated_at as string | undefined) || null;
}

/** Accessible on/off switch, same look as the Courses switches. */
function OnOff({ value, onChange, id, label, onText, offText, disabled, danger }: {
  value: boolean; onChange: (v: boolean) => void; id: string; label: string; onText: string; offText: string; disabled?: boolean; danger?: boolean;
}) {
  return (
    <button type="button" role="switch" aria-checked={value} aria-label={label} id={id} disabled={disabled}
      className={'adm-crs-switch' + (value ? ' on' : '') + (danger ? ' adm-set-danger' : '')} onClick={() => onChange(!value)}>
      <span className="adm-crs-track" aria-hidden="true"><span className="adm-crs-knob" /></span>
      <span>{value ? onText : offText}</span>
    </button>
  );
}

export default function Settings(_: SectionProps) {
  return (
    <div className="adm-stack">
      <SiteSettings />
      <AboutText />
      <Account />
    </div>
  );
}

/* ---------------- Site settings ---------------- */

const TEXT_KEYS = ['site_name', 'tagline', 'instagram_link', 'github_link', 'linkedin_link'] as const;
type TextKey = (typeof TEXT_KEYS)[number];
type Draft = Record<TextKey, string>;
const LABEL: Record<TextKey, string> = {
  site_name: 'Site name', tagline: 'Tagline', instagram_link: 'Instagram link', github_link: 'GitHub link', linkedin_link: 'LinkedIn link',
};
const SOCIAL: { key: TextKey; label: string; domain: string; id: string; example: string }[] = [
  { key: 'instagram_link', label: 'Instagram', domain: 'instagram.com', id: 'admSetInstagram', example: 'https://instagram.com/alex.cyberx' },
  { key: 'github_link', label: 'GitHub', domain: 'github.com', id: 'admSetGithub', example: 'https://github.com/alexcyberx' },
  { key: 'linkedin_link', label: 'LinkedIn', domain: 'linkedin.com', id: 'admSetLinkedin', example: 'https://linkedin.com/in/alexcyberx' },
];
const EDITED = new Set<string>([...TEXT_KEYS, 'maintenance_mode', 'user_registration']);
// Still stored, read nowhere (owner decision: no toggle for it any more).
const RETIRED: Record<string, string> = { force_https: 'read nowhere, its toggle was removed' };

const draftOf = (s: Obj): Draft => Object.fromEntries(TEXT_KEYS.map((k) => [k, str(s[k])])) as Draft;
const trimmed = (d: Draft): Draft => Object.fromEntries(TEXT_KEYS.map((k) => [k, d[k].trim()])) as Draft;

/** '' when fine. Empty is allowed (clears the link). */
function checkLink(v: string, domain: string, label: string): string {
  if (!v) return '';
  if (v.length > 200) return `${label} link is too long (200 characters at most).`;
  let u: URL;
  try { u = new URL(v); } catch { return `${label} link is not a valid address. Example: https://${domain}/...`; }
  if (u.protocol !== 'https:' || !/^https:\/\//i.test(v)) return `${label} link must start with https://`;
  if (u.username || u.password) return `${label} link must not contain a user name or password.`;
  const h = u.hostname.toLowerCase();
  if (h !== domain && !h.endsWith('.' + domain)) return `${label} link must be an address on ${domain}.`;
  return '';
}

function checkDraft(d: Draft): string {
  if (!d.site_name) return 'Site name is required.';
  // The old pages put the site name into the maintenance screen as HTML.
  if (/[<>]/.test(d.site_name) || /[<>]/.test(d.tagline)) return 'Site name and tagline cannot contain < or >.';
  for (const s of SOCIAL) {
    const bad = checkLink(d[s.key], s.domain, s.label);
    if (bad) return bad;
  }
  return '';
}

type Saved = { value: Obj } | { error: string } | null;
/** Read the stored settings, apply `patch`, save the whole object, read it
 * back. null = the admin cancelled at `proceed`. */
async function patchSettings(sb: Sb, patch: Obj, proceed?: (cur: Obj) => boolean): Promise<Saved> {
  const cur = await sb.rpc('get_site_settings');
  if (cur.error) return { error: 'could not read the current settings (' + cur.error.message + ')' };
  if (!isObj(cur.data)) return { error: 'the stored settings are not a JSON object, so nothing was saved' };
  if (proceed && !proceed(cur.data)) return null;
  const { error } = await sb.rpc('save_site_settings', { p_settings: { ...cur.data, ...patch } });
  if (error) return { error: error.message };
  // The RPC returns nothing: reading the value back is the proof it was stored.
  const back = await sb.rpc('get_site_settings');
  if (back.error || !isObj(back.data)) return { error: 'reading the value back failed, so the save is not confirmed. Reload the page to check' };
  const stored = back.data;
  const wrong = Object.keys(patch).filter((k) => JSON.stringify(stored[k]) !== JSON.stringify(patch[k]));
  if (wrong.length) return { error: 'the database still shows the old value (' + wrong.join(', ') + '). Reload the page' };
  return { value: stored };
}

function SiteSettings() {
  const sb = adminSupabase()!;
  const toast = useToast();
  const { busy, run, alive } = useLock();
  const [settings, setSettings] = useState<Obj | null>(null);
  const [loadErr, setLoadErr] = useState('');
  const [draft, setDraft] = useState<Draft>(() => draftOf({}));
  const [err, setErr] = useState('');
  const [savedTime, setSavedTime] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [s, t] = await Promise.all([sb.rpc('get_site_settings'), savedAt(sb, 'site_settings').catch(() => null)]);
    if (!alive.current) return;
    if (s.error) { setLoadErr(s.error.message); return; }
    if (!isObj(s.data)) { setLoadErr('the stored value is not a JSON object. Saving here would replace it, so fix it in the database first'); return; }
    setLoadErr('');
    setSettings(s.data);
    setDraft(draftOf(s.data));
    setSavedTime(t);
  }, [sb, alive]);
  useEffect(() => { load(); }, [load]);

  const changed = settings ? TEXT_KEYS.filter((k) => draft[k].trim() !== str(settings[k]).trim()) : [];
  const dirty = changed.length > 0;
  useLeaveWarning(dirty);

  const maint = !!settings?.maintenance_mode; // the site treats any truthy value as on
  const reg = settings ? settings.user_registration !== false : true; // the site blocks only on false
  const others = settings ? Object.keys(settings).filter((k) => !EDITED.has(k)).sort() : [];

  function done(r: Saved, ok: () => void) {
    if (!r) return false;
    if ('error' in r) { toast('Could not save: ' + r.error, 'error'); return false; }
    if (alive.current) {
      const prev = settings;
      const next = r.value;
      setSettings(next);
      // The read-back can carry text changed elsewhere. Fields the admin has
      // not touched follow it; otherwise the old text would show as an unsaved
      // edit and a later Save would quietly put it back.
      setDraft((d) => Object.fromEntries(TEXT_KEYS.map((k) => [k, prev && d[k].trim() !== str(prev[k]).trim() ? d[k] : str(next[k])])) as Draft);
      setSavedTime(new Date().toISOString());
    }
    ok();
    return true;
  }

  function setMaintenance(v: boolean) {
    const msg = v
      ? 'Turn ON maintenance mode?\n\nEvery site page then shows a full-screen "under maintenance" message to visitors. It is an overlay drawn by the page: the database, the tools API and this panel keep working, and an admin signed in on the site still sees the site. Pages that are already open change on their next load.'
      : 'Turn OFF maintenance mode?\n\nThe site opens for everyone again on their next page load.';
    if (!confirm(msg)) return;
    run('maint', async () => {
      // The old pages put the stored name into the maintenance screen as HTML
      // (js/config.js), so a name with < or > must not go live there.
      const r = await patchSettings(sb, { maintenance_mode: v }, (cur) => {
        if (!v || !/[<>]/.test(str(cur.site_name))) return true;
        toast('Not turned on: the stored site name contains < or >. Fix the site name first.', 'error');
        return false;
      });
      done(r, () => {
        logAdminEvent('admin_maintenance_updated', v ? 'maintenance mode turned ON' : 'maintenance mode turned OFF');
        toast(v ? 'Maintenance mode is ON' : 'Maintenance mode is OFF');
      });
    });
  }

  function setRegistration(v: boolean) {
    if (!v && !confirm('Close the sign-up form?\n\nThe email sign-up form will say that new sign-ups are disabled. This only hides the form: Supabase still accepts sign-ups, so Google sign-in and direct calls to the Supabase sign-up API still create accounts, and invites still work. To really stop sign-ups, switch them off in the Supabase Auth settings.')) return;
    run('reg', async () => {
      const r = await patchSettings(sb, { user_registration: v });
      done(r, () => {
        logAdminEvent('admin_registration_updated', v ? 'sign-up form opened' : 'sign-up form closed');
        toast(v ? 'The sign-up form is open' : 'The sign-up form is closed');
      });
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!settings || busy) return;
    const d = trimmed(draft);
    const bad = checkDraft(d);
    setErr(bad);
    if (bad) return;
    if (!changed.length) { toast('Nothing changed', 'info'); return; }
    const keys = [...changed];
    const base = settings;
    const patch: Obj = Object.fromEntries(keys.map((k) => [k, d[k]]));
    await run('form', async () => {
      const r = await patchSettings(sb, patch, (cur) => {
        const moved = keys.filter((k) => str(cur[k]).trim() !== str(base[k]).trim());
        return !moved.length || confirm(`${moved.map((k) => LABEL[k]).join(', ')} changed somewhere else after this page loaded (another tab or admin). Save your version over it?`);
      });
      if (r && 'error' in r && alive.current) setErr('Could not save: ' + r.error);
      done(r, () => {
        if (alive.current && r && 'value' in r) setDraft(draftOf(r.value));
        logAdminEvent('admin_settings_updated', 'site settings: ' + keys.map((k) => `${k} = "${d[k].slice(0, 80)}"`).join(', '));
        toast('Settings saved');
      });
    });
  }

  function undo() {
    if (!settings || !confirm('Discard your unsaved changes to the site details?')) return;
    setDraft(draftOf(settings));
    setErr('');
  }

  const saved = savedTime ? <span className="adm-dim" title={dateTime(savedTime)}>Last saved {timeAgo(savedTime)}</span> : null;
  const loading = !settings && !loadErr;
  const set = (k: TextKey) => (e: React.ChangeEvent<HTMLInputElement>) => setDraft((d) => ({ ...d, [k]: e.target.value }));

  // One error card (one #admSetLoadErr), not the same message in both cards.
  if (loadErr) {
    return (
      <Card title="Site settings">
        <div className="adm-stack" id="admSetLoadErr">
          <p className="adm-error">Could not load the site settings: {loadErr}</p>
          <div><button className="adm-btn" onClick={() => load()}>Try again</button></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="adm-grid-2 top">
      <Card title="Site status" actions={saved}>
        {loading ? <Empty>Loading...</Empty> : (
          <div className="adm-set-rows">
            <div className="adm-set-row" id="admSetMaintRow">
              <div className="adm-set-info">
                <div className="adm-strong">Maintenance mode {maint && <span className="adm-pill danger" id="admSetMaintOn">ON</span>}</div>
                <p className="adm-help">
                  Shows a full-screen &quot;under maintenance&quot; message on every site page. It is an overlay drawn by the page, not a lock:
                  the database, the tools API and this panel keep working, and an admin signed in on the site still sees the site.
                </p>
              </div>
              <OnOff value={maint} onChange={setMaintenance} disabled={!!busy} id="admSetMaint" label="Maintenance mode" onText="On" offText="Off" danger />
            </div>
            <div className="adm-set-row" id="admSetRegRow">
              <div className="adm-set-info">
                <div className="adm-strong">Sign-up form {!reg && <span className="adm-pill danger" id="admSetRegClosed">closed</span>}</div>
                <p className="adm-help">
                  Closed: the email sign-up form says new sign-ups are disabled. This only hides the form. Supabase still accepts sign-ups
                  (Google sign-in, direct calls to its sign-up API) and invites still work. To really stop sign-ups, switch them off in the Supabase Auth settings.
                </p>
              </div>
              <OnOff value={reg} onChange={setRegistration} disabled={!!busy} id="admSetReg" label="Sign-up form open" onText="Open" offText="Closed" />
            </div>
          </div>
        )}
      </Card>

      <Card title="Site details">
        {loading ? <Empty>Loading...</Empty> : (
          <form className="adm-form" onSubmit={save} noValidate>
            <label className="adm-field">
              <span>Site name</span>
              <input value={draft.site_name} onChange={set('site_name')} maxLength={60} disabled={!!busy} id="admSetName" />
            </label>
            <p className="adm-help">Used as the title of the maintenance screen (&quot;{draft.site_name.trim() || 'This site'} is under maintenance&quot;). The browser tab, header and search titles use the name written in the code.</p>

            <div className="adm-set-callout" id="admSetUnusedNote">
              <div className="adm-strong">Saved, but not shown on the site yet</div>
              <p className="adm-help">The site does not read the fields below: the footer social links and the search data use links written in the code. Changing them here changes nothing on the site today.</p>
            </div>
            <label className="adm-field">
              <span>Tagline</span>
              <input value={draft.tagline} onChange={set('tagline')} maxLength={120} disabled={!!busy} id="admSetTagline" />
            </label>
            {SOCIAL.map((s) => {
              const v = draft[s.key].trim();
              const ok = !!v && !checkLink(v, s.domain, s.label);
              return (
                <div key={s.key} className="adm-field">
                  <span className="adm-set-label">
                    <label htmlFor={s.id}>{s.label} link</label>
                    {ok && <a className="adm-link" href={v} target="_blank" rel="noopener noreferrer" id={s.id + 'Open'}>Open</a>}
                  </span>
                  <input type="url" inputMode="url" value={draft[s.key]} onChange={set(s.key)} maxLength={200} placeholder={s.example} disabled={!!busy} id={s.id} />
                </div>
              );
            })}

            {others.length > 0 && (
              <p className="adm-dim" id="admSetOtherKeys">
                Also stored and kept as they are: {others.map((k) => (RETIRED[k] ? `${k} (${RETIRED[k]})` : k)).join(', ')}.
              </p>
            )}
            {err && <p className="adm-error" id="admSetErr">{err}</p>}
            <div className="adm-actions adm-set-actions">
              <button className="adm-btn primary" disabled={!!busy || !dirty} id="admSetSave">{busy === 'form' ? 'Saving...' : 'Save'}</button>
              <button type="button" className="adm-btn ghost" disabled={!!busy || !dirty} onClick={undo} id="admSetUndo">Undo changes</button>
              {dirty && <span className="adm-dim" id="admSetDirty">Unsaved changes</span>}
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

/* ---------------- About text ---------------- */

// The languages of the site's language picker (js/i18n.js LANGUAGES, lib/ui-text.ts).
const LANGS = [
  { code: 'hl', name: 'Hinglish', tag: 'hi-Latn' },
  { code: 'hi', name: 'Hindi', tag: 'hi' },
  { code: 'en', name: 'English', tag: 'en' },
  { code: 'pa', name: 'Punjabi', tag: 'pa' },
  { code: 'ta', name: 'Tamil', tag: 'ta' },
  { code: 'te', name: 'Telugu', tag: 'te' },
  { code: 'bn', name: 'Bengali', tag: 'bn' },
  { code: 'mr', name: 'Marathi', tag: 'mr' },
] as const;
type Lang = (typeof LANGS)[number]['code'];
type Texts = Record<Lang, string>;
const KNOWN_LANGS = new Set<string>(LANGS.map((l) => l.code));
const langName = (c: Lang) => LANGS.find((l) => l.code === c)?.name || c;
// Stored shape (old panel): { p1: { en, hl, hi, ... }, p2: {...}, p3: {...} }.
const P_KEY = /^p(\d+)$/;
const MAX_PARAS = 6;
const MAX_PARA = 2000; // translations run longer than English (Tamil about 1.3x)

/** Paragraphs of one box: split on empty lines, inner line breaks become spaces. */
function paras(text: string): string[] {
  return text.replace(/\r\n?/g, '\n').split(/\n\s*\n/).map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
}
const pKeys = (bio: Obj) => Object.keys(bio).filter((k) => P_KEY.test(k)).sort((a, b) => +a.slice(1) - +b.slice(1));

function textsOf(bio: Obj): Texts {
  const keys = pKeys(bio);
  return Object.fromEntries(LANGS.map((l) => [
    l.code,
    keys.map((k) => (isObj(bio[k]) ? str((bio[k] as Obj)[l.code]).trim() : '')).filter(Boolean).join('\n\n'),
  ])) as Texts;
}
const emptyTexts = (): Texts => Object.fromEntries(LANGS.map((l) => [l.code, ''])) as Texts;
const norm = (t: Texts) => LANGS.map((l) => paras(t[l.code]).join('\n\n')).join('\u0000');

/** New stored value: our languages from the boxes, everything else (other
 * top-level keys, languages this page does not know) kept from `base`. */
function buildBio(base: Obj, texts: Texts): Obj {
  const out: Obj = {};
  for (const [k, v] of Object.entries(base)) {
    if (!P_KEY.test(k) || !isObj(v)) { out[k] = v; continue; }
    const rest = Object.fromEntries(Object.entries(v).filter(([l]) => !KNOWN_LANGS.has(l)));
    if (Object.keys(rest).length) out[k] = rest;
  }
  for (const l of LANGS) {
    paras(texts[l.code]).forEach((p, i) => {
      const k = 'p' + (i + 1);
      out[k] = { ...(isObj(out[k]) ? (out[k] as Obj) : {}), [l.code]: p };
    });
  }
  return out;
}

function checkTexts(t: Texts): string {
  if (LANGS.every((l) => !paras(t[l.code]).length)) return 'Write the text in at least one language.';
  for (const l of LANGS) {
    const ps = paras(t[l.code]);
    if (ps.length > MAX_PARAS) return `${l.name} has ${ps.length} paragraphs (${MAX_PARAS} at most).`;
    const long = ps.findIndex((p) => p.length > MAX_PARA);
    if (long >= 0) return `${l.name} paragraph ${long + 1} is too long (${MAX_PARA} characters at most).`;
    if (ps.some((p) => TAG_RE.test(p))) return `${l.name} contains HTML tags. Write plain text.`;
  }
  return '';
}

// Words the translator must not touch: links, emails, handles, the brand.
const KEEP_RE = /https?:\/\/\S+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|@[A-Za-z0-9_](?:[A-Za-z0-9_.]*[A-Za-z0-9_])?|\bAlexCyberX\b|\bCTFs?\b/g;

/** One paragraph through the free Google endpoint (same one as the old panel
 * and the site's chapter translation; allowed by the CSP connect-src). */
async function translateText(text: string, from: 'en' | 'hl', to: Lang, signal: AbortSignal): Promise<string> {
  const kept: string[] = [];
  const guarded = text.replace(KEEP_RE, (m) => { kept.push(m); return `zzzterm${kept.length - 1}zzz`; });
  // Hinglish goes in as 'hi' (like the site does): 'auto' often misdetects it.
  const sl = from === 'hl' ? 'hi' : 'en';
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(guarded)}`;
  const c = new AbortController();
  const stop = () => c.abort();
  signal.addEventListener('abort', stop);
  const timer = setTimeout(stop, 15000);
  try {
    // no-referrer: the admin URL is not sent to Google.
    const res = await fetch(url, { signal: c.signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data: unknown = await res.json();
    if (!Array.isArray(data) || !Array.isArray(data[0])) throw new Error('unexpected reply');
    const out = (data[0] as unknown[]).map((ch) => (Array.isArray(ch) && typeof ch[0] === 'string' ? ch[0] : '')).join('').trim();
    if (!out) throw new Error('empty reply');
    const seen = new Set<number>();
    const back = out.replace(/zzz\s*term\s*(\d+)\s*zzz/gi, (m, i) => { if (kept[+i] == null) return m; seen.add(+i); return kept[+i]; });
    // A placeholder Google changed or dropped would leave junk (or lose a link) in the box.
    if (seen.size !== kept.length || (/zzz/i.test(back) && !/zzz/i.test(text))) throw new Error('a link or name came back damaged');
    // Not cut to MAX_PARA: a too long result is reported on Save, never shortened silently.
    return back.slice(0, MAX_PARA * 4);
  } catch (e) {
    if (c.signal.aborted && !signal.aborted) throw new Error('timed out');
    throw e;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', stop);
  }
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function AboutText() {
  const sb = adminSupabase()!;
  const toast = useToast();
  const { busy, run, alive } = useLock();
  const [loaded, setLoaded] = useState<Texts | null>(null);
  const [loadErr, setLoadErr] = useState('');
  const [texts, setTexts] = useState<Texts>(emptyTexts);
  const [err, setErr] = useState('');
  const [savedTime, setSavedTime] = useState<string | null>(null);
  const [src, setSrc] = useState<'en' | 'hl'>('en');
  const [overwrite, setOverwrite] = useState(false);
  const [tr, setTr] = useState<{ done: number; total: number; now: string } | null>(null);
  const trCtrl = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    const [b, t] = await Promise.all([sb.rpc('get_about_bio'), savedAt(sb, 'about_bio').catch(() => null)]);
    if (!alive.current) return;
    if (b.error) { setLoadErr(b.error.message); return; }
    if (b.data != null && !isObj(b.data)) { setLoadErr('the stored value is not a JSON object. Saving here would replace it, so fix it in the database first'); return; }
    const x = textsOf(isObj(b.data) ? b.data : {});
    setLoadErr('');
    setLoaded(x);
    setTexts(x);
    setSavedTime(t);
    setSrc(x.en.trim() || !x.hl.trim() ? 'en' : 'hl');
  }, [sb, alive]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => () => trCtrl.current?.abort(), []);

  const dirty = !!loaded && norm(texts) !== norm(loaded);
  useLeaveWarning(dirty);

  const counts = LANGS.map((l) => ({ l, n: paras(texts[l.code]).length }));
  const filled = counts.filter((c) => c.n > 0);
  const mismatch = new Set(filled.map((c) => c.n)).size > 1;
  const empty = filled.length ? counts.filter((c) => !c.n) : [];
  // Hinglish is never machine made: it is a romanised style, not a Google language.
  const targets = useMemo(
    () => LANGS.filter((l) => l.code !== src && l.code !== 'hl' && (overwrite || !texts[l.code].trim())),
    [src, overwrite, texts],
  );
  const srcEmpty = !paras(texts[src]).length;

  async function translate() {
    if (tr || busy || trCtrl.current) return; // the ref is set before the first await: guards a double click
    const source = paras(texts[src]);
    if (!source.length) return toast(`Write the ${langName(src)} text first.`, 'error');
    if (source.length > MAX_PARAS) return toast(`${langName(src)} has ${source.length} paragraphs (${MAX_PARAS} at most).`, 'error');
    const long = source.findIndex((p) => p.length > MAX_PARA);
    if (long >= 0) return toast(`${langName(src)} paragraph ${long + 1} is too long (${MAX_PARA} characters at most).`, 'error');
    if (!targets.length) return toast('Every language already has text. Tick "Replace text that is already there" to translate again.', 'info');
    const replacing = targets.filter((l) => texts[l.code].trim());
    if (replacing.length && !confirm(`Replace the text already written in ${replacing.map((l) => l.name).join(', ')}?\n\nThe boxes get a new machine translation of the ${langName(src)} text. Nothing is saved until you press Save.`)) return;
    const list = [...targets];
    const replace = overwrite;
    const from = src;
    const ctrl = new AbortController();
    trCtrl.current = ctrl;
    const total = list.length * source.length;
    let doneCount = 0;
    const ok: string[] = [];
    const failed: string[] = [];
    setTr({ done: 0, total, now: '' });
    for (const l of list) {
      if (ctrl.signal.aborted) break;
      const out: string[] = [];
      try {
        for (let i = 0; i < source.length; i++) {
          if (ctrl.signal.aborted) break;
          if (alive.current) setTr({ done: doneCount, total, now: `${l.name}, paragraph ${i + 1} of ${source.length}` });
          out.push(await translateText(source[i], from, l.code, ctrl.signal));
          doneCount++;
        }
      } catch (e) {
        if (ctrl.signal.aborted) break;
        failed.push(`${l.name} (${e instanceof Error ? e.message : 'failed'})`);
        doneCount += source.length - out.length;
        continue;
      }
      if (out.length !== source.length) break; // stopped halfway: leave this box as it was
      const text = out.join('\n\n');
      ok.push(l.name);
      // A box the admin typed into meanwhile is kept unless "replace" was ticked.
      if (alive.current) setTexts((t) => (replace || !t[l.code].trim() ? { ...t, [l.code]: text } : t));
    }
    const stopped = ctrl.signal.aborted;
    if (trCtrl.current === ctrl) trCtrl.current = null;
    if (!alive.current) return;
    setTr(null);
    if (stopped) toast(`Translation stopped. ${plural(ok.length, 'language', 'languages')} filled.`, 'info');
    else if (failed.length) toast(`Translated ${ok.length}, failed ${failed.length}: ${failed.join(', ')}`, 'error');
    else toast(`Translated ${plural(ok.length, 'language', 'languages')}. Check the text, then press Save.`);
  }

  async function save() {
    if (!loaded || busy || tr) return;
    const bad = checkTexts(texts);
    setErr(bad);
    if (bad) return;
    const base = loaded;
    const mine = texts;
    // An emptied box deletes that language from the stored value.
    const cleared = LANGS.filter((l) => base[l.code].trim() && !paras(mine[l.code]).length);
    if (cleared.length && !confirm(`Delete the stored ${cleared.map((l) => l.name).join(', ')} text?\n\nThe ${cleared.length === 1 ? 'box is' : 'boxes are'} empty, so saving removes that language from the About text.`)) return;
    await run('save', async () => {
      const cur = await sb.rpc('get_about_bio');
      if (cur.error) { toast('Could not read the stored text: ' + cur.error.message, 'error'); return; }
      if (cur.data != null && !isObj(cur.data)) { toast('The stored About text is not a JSON object, so nothing was saved.', 'error'); return; }
      const stored = isObj(cur.data) ? cur.data : {};
      if (norm(textsOf(stored)) !== norm(base) && !confirm('The About text was changed somewhere else after this page loaded (another tab or admin). Save your version over it?')) return;
      const next = buildBio(stored, mine);
      const { error } = await sb.rpc('save_about_bio', { p_bio: next });
      if (error) { if (alive.current) setErr('Could not save: ' + error.message); toast('Could not save: ' + error.message, 'error'); return; }
      // The RPC returns nothing: reading the value back is the proof it was stored.
      const back = await sb.rpc('get_about_bio');
      if (back.error || !isObj(back.data)) {
        toast('Reading the text back failed, so the save is not confirmed. Reload the page to check.', 'error');
        return;
      }
      if (norm(textsOf(back.data)) !== norm(textsOf(next))) {
        toast('Not saved: the database still shows different text. Reload the page.', 'error');
        return;
      }
      const now = textsOf(back.data);
      if (alive.current) { setLoaded(now); setTexts(now); setSavedTime(new Date().toISOString()); setErr(''); }
      const langs = LANGS.filter((l) => now[l.code]).map((l) => l.code);
      const n = Math.max(0, ...LANGS.map((l) => paras(now[l.code]).length));
      logAdminEvent('admin_about_updated', `About text saved: ${langs.join(', ')} (${plural(n, 'paragraph', 'paragraphs')})`);
      toast('About text saved');
    });
  }

  function undo() {
    if (!loaded || !confirm('Discard your unsaved changes to the About text?')) return;
    setTexts(loaded);
    setErr('');
  }

  const locked = !!busy || !!tr;
  return (
    <Card title="About text" actions={savedTime ? <span className="adm-dim" title={dateTime(savedTime)}>Last saved {timeAgo(savedTime)}</span> : null}>
      {!loaded && !loadErr ? <Empty>Loading...</Empty> : loadErr ? (
        <div className="adm-stack" id="admSetBioLoadErr">
          <p className="adm-error">Could not load the About text: {loadErr}</p>
          <div><button className="adm-btn" onClick={() => load()}>Try again</button></div>
        </div>
      ) : (
        <div className="adm-stack adm-set-bio-wrap">
          <div className="adm-set-callout" id="admSetBioNote">
            <div className="adm-strong">Not on the site yet</div>
            <p className="adm-help">
              The home page &quot;Who is AlexCyberX&quot; section shows one paragraph written in the code (index.html, with its translations in js/i18n.js).
              This text is kept in the database for when the home page reads it, so saving here does not change the site today.
            </p>
          </div>
          <p className="adm-help">
            One box per language of the site&apos;s language picker. Separate paragraphs with an empty line. Paragraph 1 of every language
            belongs in the same place, so keep the same number of paragraphs in each.
          </p>

          <div className="adm-inline-form adm-set-tr" id="admSetTr">
            <div className="adm-set-tr-row">
              <label className="adm-field">
                <span>Translate from</span>
                <select className="adm-input adm-select" value={src} onChange={(e) => setSrc(e.target.value as 'en' | 'hl')} disabled={locked} id="admSetTrSource">
                  <option value="en">English</option>
                  <option value="hl">Hinglish</option>
                </select>
              </label>
              <label className="adm-set-check">
                <input type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} disabled={locked} id="admSetTrOverwrite" />
                Replace text that is already there
              </label>
              {tr ? (
                <button type="button" className="adm-btn" onClick={() => trCtrl.current?.abort()} id="admSetTrStop">Stop</button>
              ) : (
                <button type="button" className="adm-btn" onClick={translate} disabled={locked || srcEmpty || !targets.length} id="admSetTrBtn">
                  {srcEmpty ? `Write ${langName(src)} first` : !targets.length ? 'Nothing to translate' : overwrite ? `Translate ${plural(targets.length, 'language', 'languages')}` : `Translate ${plural(targets.length, 'empty language', 'empty languages')}`}
                </button>
              )}
            </div>
            <p className="adm-help">Free Google Translate, one paragraph at a time. Hinglish is never machine translated: write it by hand. The boxes are filled for you to check; nothing is saved until you press Save.</p>
            {tr && (
              <div className="adm-progress" id="admSetTrStatus" aria-live="polite">
                <div className="adm-progress-top"><span>Translating {tr.now}</span><span className="adm-num">{tr.done} of {tr.total}</span></div>
                <div className="adm-bar"><span style={{ width: `${tr.total ? Math.round((tr.done / tr.total) * 100) : 0}%` }} /></div>
              </div>
            )}
          </div>

          <div className="adm-set-bio">
            {counts.map(({ l, n }) => (
              <label key={l.code} className="adm-field">
                <span className="adm-set-label">
                  <span>{l.name} <code>{l.code}</code></span>
                  <span className={n ? 'adm-dim' : 'adm-dim adm-set-warn'} id={'admSetBioCount-' + l.code}>{n ? plural(n, 'paragraph', 'paragraphs') : 'empty'}</span>
                </span>
                <textarea
                  id={'admSetBio-' + l.code} lang={l.tag} rows={6} maxLength={MAX_PARAS * (MAX_PARA + 2)}
                  value={texts[l.code]} readOnly={locked}
                  onChange={(e) => { const v = e.target.value; setTexts((t) => ({ ...t, [l.code]: v })); }}
                />
              </label>
            ))}
          </div>

          {(mismatch || empty.length > 0) && (
            <div className="adm-set-warn-box" id="admSetBioWarn">
              {mismatch && <p className="adm-set-warn">Paragraph counts differ: {filled.map((c) => `${c.l.name} ${c.n}`).join(', ')}.</p>}
              {empty.length > 0 && <p className="adm-set-warn">Empty: {empty.map((c) => c.l.name).join(', ')}.</p>}
            </div>
          )}
          {err && <p className="adm-error" id="admSetBioErr">{err}</p>}
          <div className="adm-actions adm-set-actions">
            <button type="button" className="adm-btn primary" onClick={save} disabled={locked || !dirty} id="admSetBioSave">{busy === 'save' ? 'Saving...' : 'Save'}</button>
            <button type="button" className="adm-btn ghost" onClick={undo} disabled={locked || !dirty} id="admSetBioUndo">Undo changes</button>
            {dirty && <span className="adm-dim" id="admSetBioDirty">Unsaved changes</span>}
          </div>
        </div>
      )}
    </Card>
  );
}

/* ---------------- Your account ---------------- */

const COMMON = ['password', 'passw0rd', 'admin', 'alexcyber', 'qwerty', 'letmein', 'welcome', 'iloveyou', 'abc123', '123456', 'india'];
const STRENGTH = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
const MIN_SCORE = 2; // an admin account opens the whole platform

/** Rough strength score 0..4 with one tip. Supabase checks again on save. */
function strength(pw: string, email: string): { score: number; label: string; tip: string } {
  if (!pw) return { score: 0, label: '', tip: '' };
  if (pw.length < 8) return { score: 0, label: 'Too short', tip: 'Use at least 8 characters.' };
  const low = pw.toLowerCase();
  let score = pw.length >= 16 ? 3 : pw.length >= 12 ? 2 : 1;
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  if (kinds >= 3) score++;
  if (kinds === 1 && pw.length < 16) score--;
  let tip = '';
  const name = (email.split('@')[0] || '').toLowerCase();
  if (COMMON.some((w) => low.includes(w)) || (name.length >= 3 && low.includes(name))) { score -= 2; tip = 'Avoid common words and your email name.'; }
  if (/(.)\1\1/.test(pw)) { score--; tip = tip || 'Avoid the same character three times in a row.'; }
  if (/0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|qwer|asdf/.test(low)) { score--; tip = tip || 'Avoid runs like 1234 or abcd.'; }
  score = Math.max(0, Math.min(4, score));
  if (!tip && score < 3) tip = 'Longer is stronger: 12 or more characters, or mix in capitals, numbers and symbols.';
  return { score, label: STRENGTH[score], tip };
}

function pwError(e: { message: string; code?: string }): string {
  switch (e.code) {
    case 'same_password': return 'That is your current password. Pick a new one.';
    case 'weak_password': return 'Supabase says this password is too weak: ' + e.message;
    case 'reauthentication_needed':
    case 'reauthentication_not_valid':
      return 'Supabase wants a fresh sign-in before a password change. Sign out, sign in again, and change it right away.';
    case 'insufficient_aal': return 'This session is no longer two-step verified. Sign out and sign in again.';
    default: return e.message;
  }
}

function Account() {
  const sb = adminSupabase()!;
  const toast = useToast();
  const alive = useAlive();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);

  useEffect(() => {
    (async () => {
      // getUser asks the server (fresh email and factors); the stored session is the fallback.
      const { data, error } = await sb.auth.getUser();
      let u: User | null = !error && data.user ? data.user : null;
      if (!u) u = (await sb.auth.getSession()).data.session?.user || null;
      if (alive.current) setUser(u);
    })().catch(() => { if (alive.current) setUser(null); });
  }, [sb, alive]);

  const email = user?.email || '';
  const s = strength(pw, email);
  const twoStep = !!user?.factors?.some((f) => f.factor_type === 'totp' && f.status === 'verified');
  useLeaveWarning(!!pw || !!pw2);

  async function change(e: React.FormEvent) {
    e.preventDefault();
    if (lock.current) return;
    let bad = '';
    if (pw.length < 8) bad = 'The password must be at least 8 characters.';
    else if (new TextEncoder().encode(pw).length > 72) bad = 'The password is too long (72 characters at most).';
    else if (s.score < MIN_SCORE) bad = 'Too weak for an admin account. ' + (s.tip || 'Use 12 or more characters.');
    else if (pw !== pw2) bad = 'The two passwords do not match.';
    setErr(bad);
    if (bad) return;
    lock.current = true;
    setBusy(true);
    try {
      // updateUser only: signInWithPassword (to check the old password) would
      // replace this two-step (aal2) session with a one-step one.
      const { data, error } = await sb.auth.updateUser({ password: pw });
      if (error || !data?.user) {
        const msg = error ? pwError(error) : 'Supabase did not confirm the change. Try again.';
        if (alive.current) setErr(msg);
        toast('Could not change the password: ' + msg, 'error');
        return;
      }
      // Always, not optional: whoever had the old password must lose their
      // sessions. Supabase may already do this on a password change; this
      // call makes sure. It keeps this panel's own session.
      const { error: e2 } = await sb.auth.signOut({ scope: 'others' });
      if (alive.current) { setPw(''); setPw2(''); setShow(false); setErr(''); }
      logAdminEvent('admin_password_changed', `${data.user.email || email} changed the admin password` + (e2 ? ' (signing out the other sessions failed)' : ', other sessions signed out'));
      if (e2) toast('Password changed, but signing out the other sessions failed: ' + e2.message, 'error');
      else toast('Password changed. Other sessions are signed out.');
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }

  return (
    <Card title="Your account">
      {user === undefined ? <Empty>Loading...</Empty> : !user ? <Empty>Could not read the signed-in account. Sign out and sign in again.</Empty> : (
        <div className="adm-set-account">
          <dl className="adm-set-facts">
            <div><dt>Signed in as</dt><dd className="adm-strong adm-wrap" id="admSetEmail">{email || 'No email'}</dd></div>
            <div><dt>Two-step login</dt><dd id="admSetTwoStep">{twoStep ? 'On (authenticator app)' : 'On for this session'}</dd></div>
            <div><dt>Last sign-in</dt><dd>{dateTime(user.last_sign_in_at)}</dd></div>
          </dl>
          <form className="adm-form adm-set-narrow" onSubmit={change} noValidate>
            <h4 className="adm-h4">Change password</h4>
            <p className="adm-help">This is the password of {email || 'this account'} for the whole site, not only this panel. Your two-step code stays the same.</p>
            {/* For password managers: which account this new password belongs to. */}
            <input type="email" autoComplete="username" value={email} readOnly hidden />
            <label className="adm-field">
              <span>New password</span>
              <input type={show ? 'text' : 'password'} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} maxLength={72} disabled={busy} id="admSetPw" />
            </label>
            {pw && (
              <div className="adm-set-strength" aria-live="polite">
                <div className={'adm-bar adm-set-meter s' + s.score}><span style={{ width: `${(s.score + 1) * 20}%` }} /></div>
                <div className="adm-dim" id="admSetPwStrength">Strength: <span className="adm-strong">{s.label}</span>{s.tip ? '. ' + s.tip : ''}</div>
              </div>
            )}
            <label className="adm-field">
              <span>Confirm new password</span>
              <input type={show ? 'text' : 'password'} autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} maxLength={72} disabled={busy} id="admSetPw2" />
            </label>
            {pw2 && pw2.length >= pw.length && pw !== pw2 && <p className="adm-error" id="admSetPwMismatch">The two passwords do not match.</p>}
            <label className="adm-set-check">
              <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} id="admSetPwShow" />
              Show passwords
            </label>
            <p className="adm-help" id="admSetPwOthersNote">Changing it signs this account out everywhere else (the site and other devices). This panel stays signed in.</p>
            {err && <p className="adm-error" id="admSetPwErr">{err}</p>}
            <div className="adm-actions">
              <button className="adm-btn primary" disabled={busy || !pw || !pw2} id="admSetPwSave">{busy ? 'Changing...' : 'Change password'}</button>
            </div>
          </form>
        </div>
      )}
    </Card>
  );
}
