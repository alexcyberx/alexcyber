/* ═══════════════════════════════════════════
   PUBLIC RESOURCES PAGE
   Standalone page — lists active resources from Supabase.
   Downloading works for everyone (public read), no login required.
═══════════════════════════════════════════ */

let _resPublicItems = [];
let _resPublicLoaded = false;
let _resActiveType = '';

const RES_TYPE_ICONS = {
  cheatsheet: '📋', pcap: '📡', pdf: '📄', script: '⚙️', wordlist: '📝', other: '📁'
};
const RES_TYPE_LABELS = {
  cheatsheet: 'Cheatsheet', pcap: 'PCAP', pdf: 'PDF', script: 'Script', wordlist: 'Wordlist', other: 'Other'
};

function initResourcesPage() {
  loadPublicResources();
}

async function loadPublicResources() {
  const grid = document.getElementById('resourcesGrid');
  const sb = window._supabase;

  if (!sb) {
    if (grid) grid.innerHTML = `<div class="blog-empty">Resources are temporarily unavailable. Please check back soon.</div>`;
    return;
  }

  try {
    const { data, error } = await sb
      .from('resources')
      .select('id, name, type, file_path, file_size, chapter_tag, downloads, uploaded_at')
      .eq('status', 'active')
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    _resPublicItems = data || [];
    _resPublicLoaded = true;
    renderResourceFilters();
    renderResourceGrid();
  } catch (e) {
    console.error('[Resources] load error:', e);
    if (grid) grid.innerHTML = `<div class="blog-empty">Could not load resources right now. Please try again later.</div>`;
  }
}

function renderResourceFilters() {
  const wrap = document.getElementById('resourcesFilters');
  if (!wrap) return;
  const types = [...new Set(_resPublicItems.map(r => r.type).filter(Boolean))];
  if (!types.length) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = `
    <button class="blog-filter-btn ${_resActiveType==='' ? 'active':''}" onclick="filterResourcesByType('')">All</button>
    ${types.map(t => `<button class="blog-filter-btn ${_resActiveType===t ? 'active':''}" onclick="filterResourcesByType('${t}')">${RES_TYPE_LABELS[t]||t}</button>`).join('')}
  `;
}

function filterResourcesByType(type) {
  _resActiveType = type;
  renderResourceFilters();
  renderResourceGrid();
}

function renderResourceGrid() {
  const grid = document.getElementById('resourcesGrid');
  if (!grid) return;

  const list = _resActiveType
    ? _resPublicItems.filter(r => r.type === _resActiveType)
    : _resPublicItems;

  if (!list.length) {
    grid.innerHTML = `<div class="blog-empty">
      ${_resPublicLoaded ? 'No resources here yet. Check back soon.' : 'Loading resources…'}
    </div>`;
    return;
  }

  grid.innerHTML = list.map(r => `
    <div class="blog-card" style="cursor:pointer;" onclick="downloadPublicResource('${r.id}', '${escResAttr(r.file_path)}')">
      <div class="blog-card-img-placeholder" style="font-size:32px;">${RES_TYPE_ICONS[r.type]||RES_TYPE_ICONS.other}</div>
      <div class="blog-card-body">
        <div class="blog-card-cat">${RES_TYPE_LABELS[r.type]||r.type}</div>
        <div class="blog-card-title">${escResHtml(r.name)}</div>
        <div class="blog-card-excerpt">${escResHtml(r.chapter_tag || '')}</div>
        <div class="blog-card-meta">
          <span>${resFormatSize(r.file_size)}</span>
          <span>${(r.downloads||0).toLocaleString()} downloads</span>
        </div>
      </div>
    </div>
  `).join('');
}

async function downloadPublicResource(id, filePath) {
  const sb = window._supabase;
  if (!sb || !filePath) return;
  try {
    sb.rpc('increment_resource_downloads', { p_resource_id: id }).then(() => {}, () => {});
    const { data } = sb.storage.from('resources').getPublicUrl(filePath);
    if (data && data.publicUrl) window.open(data.publicUrl, '_blank');
  } catch (e) {
    console.error('[Resources] download error:', e);
  }
}

function resFormatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024*1024) return (bytes/1024).toFixed(0) + ' KB';
  return (bytes/(1024*1024)).toFixed(1) + ' MB';
}

function escResHtml(str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}
function escResAttr(str) { return escResHtml(str).replace(/"/g, '&quot;'); }
