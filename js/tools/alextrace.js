/* AlexTrace (frontend). Moved out of js/page-scripts.js so the Next page
   web/src/app/tools/alextrace can load the same code (components/LegacyTool.tsx).
   Needs escapeHtml(), window._currentUser and the /api auth-header fetch
   wrapper: js/page-scripts.js provides them on the old SPA, the LegacyTool
   bridge on the Next page. */

/* ═══════════════════════════════════════════════════════════
   ALEXTRACE - frontend logic
   Mirrors the AlexUtils tab/panel pattern (at- namespace).
   Two tabs: Lookup (username + email) and Photo Metadata.
═══════════════════════════════════════════════════════════ */
let _atInitialized = false;
let _atSelectedFile = null;

const AT_TABS = [
  { id: 'lookup', label: 'Username & Email' },
  { id: 'breach', label: 'Check a Service' },
  { id: 'password', label: 'Password Strength' },
  { id: 'metadata', label: 'Photo Metadata' }
];

function initAlexTracePage() {
  const tabsEl = document.getElementById('atTabs');
  const panelsEl = document.getElementById('atPanels');
  if (!tabsEl || !panelsEl) return;
  // Built once per page markup (the Next page renders a fresh, empty #atTabs
  // when the visitor comes back to it without a full reload).
  if (_atInitialized && tabsEl.children.length) return;
  _atInitialized = true;
  _atSelectedFile = null;

  tabsEl.innerHTML = AT_TABS.map((t, i) =>
    `<button class="at-tab${i === 0 ? ' active' : ''}" id="at-tab-${t.id}" onclick="atNav('${t.id}')">${escapeHtml(t.label)}</button>`
  ).join('');

  panelsEl.innerHTML = AT_TABS.map((t, i) =>
    `<div class="at-panel${i === 0 ? ' active' : ''}" id="at-${t.id}">${atPanelHtml(t.id)}</div>`
  ).join('');
}

function atNav(id) {
  document.querySelectorAll('.at-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.at-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('at-tab-' + id).classList.add('active');
  document.getElementById('at-' + id).classList.add('active');
}

function atPanelHtml(id) {
  switch (id) {
    case 'lookup': return atLookupPanel();
    case 'breach': return atBreachPanel();
    case 'password': return atPasswordPanel();
    case 'metadata': return atMetadataPanel();
    default: return '';
  }
}

function atRequireLogin() {
  if (window._currentUser) return true;
  if (typeof showAuth === 'function') showAuth('login', 'alextrace');
  return false;
}

/* ── Lookup panel (username + email) ─────────────────────── */
function atLookupPanel() {
  return `
    <div class="at-card">
      <div class="at-card-title">
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" style="stroke:var(--accent)" stroke-width="1.2"/><path d="M13.5 13.5 17.5 17.5" style="stroke:var(--accent)" stroke-width="1.2" stroke-linecap="round"/></svg>
        Check your exposure
      </div>
      <div class="at-card-sub">Enter a username and/or email. AlexTrace checks 25+ platforms and known data breaches.</div>
      <div class="at-input-row">
        <div class="at-field"><label>Username</label><input class="at-input" id="atUsernameInput" placeholder="e.g. alexcyberx" autocomplete="off"></div>
        <div class="at-field"><label>Email (optional)</label><input class="at-input" id="atEmailInput" placeholder="e.g. you@example.com" autocomplete="off"></div>
        <button class="at-btn" id="atLookupBtn" onclick="atRunLookup()">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.4"/><path d="M13.5 13.5 17.5 17.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          Run Check
        </button>
      </div>
      <div class="at-note">Only checks publicly available information. Use this to audit your own exposure, or with explicit permission from the person you're checking.</div>
      <div id="atLookupResult"></div>
    </div>`;
}

async function atRunLookup() {
  if (!atRequireLogin()) return;

  const username = document.getElementById('atUsernameInput').value.trim();
  const email = document.getElementById('atEmailInput').value.trim();
  const resultEl = document.getElementById('atLookupResult');
  const btn = document.getElementById('atLookupBtn');

  if (!username && !email) {
    resultEl.innerHTML = `<div class="at-error-box">Please enter a username or email to check.</div>`;
    return;
  }

  btn.disabled = true;
  const originalHtml = btn.innerHTML;
  btn.innerHTML = 'Checking...';
  resultEl.innerHTML = `<div class="at-loading"><div class="at-spinner"></div>Checking platforms and breach databases, this can take a few seconds...</div>`;

  try {
    const res = await fetch('/api/alextrace/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username || undefined, email: email || undefined, userId: window._currentUser.id })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
    resultEl.innerHTML = atRenderReport(data);
  } catch (e) {
    resultEl.innerHTML = `<div class="at-error-box">${escapeHtml(e.message)}</div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

/* ── Report rendering (shared by lookup + metadata) ──────── */
function atLevelLabel(level) {
  if (level === 'high') return 'High Risk';
  if (level === 'medium') return 'Medium Risk';
  return 'Low Risk';
}

function atScoreRingSvg(score, level) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const offset = c - (clamp01(score / 100) * c);
  return `
    <div class="at-score-ring">
      <svg width="92" height="92" viewBox="0 0 92 92">
        <circle class="at-score-ring-track" cx="46" cy="46" r="${r}"/>
        <circle class="at-score-ring-fill at-stroke-${level}" cx="46" cy="46" r="${r}"
          stroke-dasharray="${c}" stroke-dashoffset="${offset}"/>
      </svg>
      <div class="at-score-num">
        <div class="n">${score}</div>
        <div class="l">/ 100</div>
      </div>
    </div>`;
}

function clamp01(n) { return Math.max(0, Math.min(1, n)); }

function atCategoryCard(label, cat) {
  return `
    <div class="at-category-card at-bg-${cat.level}">
      <div class="head">
        <span class="label">${escapeHtml(label)}</span>
        <span class="badge at-level-${cat.level}" style="background:rgba(var(--fg-rgb),0.06);">${atLevelLabel(cat.level)}</span>
      </div>
      ${cat.notes && cat.notes.length ? `<ul class="notes">${cat.notes.map(n => `<li>${escapeHtml(n)}</li>`).join('')}</ul>` : ''}
    </div>`;
}

function atPlatformSection(title, list, statusClass) {
  if (!list || !list.length) return '';
  return `
    <div class="at-platform-section">
      <h4>${escapeHtml(title)} (${list.length})</h4>
      <div class="at-platform-grid">
        ${list.map(p => {
          const inner = `<span class="dot ${statusClass}"></span>${escapeHtml(p.label)}<span class="cat">${escapeHtml(p.category)}</span>`;
          return p.profileUrl
            ? `<a class="at-platform-chip found" href="${escapeHtml(p.profileUrl)}" target="_blank" rel="noopener noreferrer">${inner}</a>`
            : `<div class="at-platform-chip">${inner}</div>`;
        }).join('')}
      </div>
    </div>`;
}

function atRenderReport(data) {
  const report = data.report;
  const parts = [];

  parts.push(`
    <div class="at-report-header">
      ${atScoreRingSvg(report.overallScore, report.overallLevel)}
      <div class="at-report-summary">
        <h3>Exposure Score: <span class="at-level-${report.overallLevel}">${atLevelLabel(report.overallLevel)}</span></h3>
        <p>${data.disclaimer ? escapeHtml(data.disclaimer) : 'This score reflects how much information about you is publicly discoverable right now.'}</p>
      </div>
      <button class="at-btn-ghost at-no-print" onclick="atExportReport()" style="margin-left:auto;">
        <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M10 13V4M6 8l4-4 4 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.5 13.5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
        Export Report
      </button>
    </div>`);

  parts.push(`<div class="at-category-grid">
    ${data.usernameResult ? atCategoryCard('Social / Platforms', report.categories.social) : ''}
    ${data.emailResult ? atCategoryCard('Breach Exposure', report.categories.breach) : ''}
    ${report.categories.metadata.score > 0 || (report.categories.metadata.notes && report.categories.metadata.notes.length) ? atCategoryCard('Photo Metadata', report.categories.metadata) : ''}
  </div>`);

  if (report.correlation && report.correlation.signals.length) {
    parts.push(`
      <div class="at-card">
        <div class="at-card-title">
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><circle cx="6" cy="6" r="2" style="stroke:var(--accent)" stroke-width="1.2"/><circle cx="14" cy="14" r="2" style="stroke:var(--accent)" stroke-width="1.2"/><path d="M7.5 7.5 12.5 12.5" style="stroke:var(--accent)" stroke-width="1.2"/></svg>
          Identity Correlation
        </div>
        <div class="at-card-sub">How easily these findings link back to one identity (confidence: ${report.correlation.confidence}%)</div>
        ${report.correlation.signals.map(s => `<div class="at-signal"><svg width="13" height="13" viewBox="0 0 20 20" fill="none" style="flex-shrink:0;margin-top:3px;"><circle cx="10" cy="10" r="8" style="stroke:var(--fg-3)" stroke-width="1.2"/></svg>${escapeHtml(s)}</div>`).join('')}
      </div>`);
  }

  if (data.deepCorrelation && data.deepCorrelation.attempted) {
    const dc = data.deepCorrelation;
    parts.push(`
      <div class="at-card">
        <div class="at-card-title">
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M4 10h5M11 10h5M9 5l2 10" style="stroke:var(--accent)" stroke-width="1.2" stroke-linecap="round"/></svg>
          Deep Correlation, pivoting from GitHub
        </div>
        <div class="at-card-sub">What a real investigator would find just by reading the public GitHub profile.</div>
        ${dc.profile && (dc.profile.bio || dc.profile.company || dc.profile.location) ? `
          <div class="at-signal">Public profile reveals: ${[dc.profile.name, dc.profile.company, dc.profile.location].filter(Boolean).map(escapeHtml).join(', ')}${dc.profile.bio ? `, bio: "${escapeHtml(dc.profile.bio)}"` : ''}</div>` : ''}
        ${dc.discovered.length ? `
          <div class="at-platform-section">
            <h4>Discovered via bio/links (${dc.discovered.length})</h4>
            <div class="at-platform-grid">
              ${dc.discovered.map(d => `<a class="at-platform-chip found" href="${escapeHtml(d.profileUrl)}" target="_blank" rel="noopener noreferrer"><span class="dot found"></span>${escapeHtml(d.username)}<span class="cat">${escapeHtml(d.platform)}</span></a>`).join('')}
            </div>
          </div>` : `<div class="at-empty">No additional accounts were discoverable from the public bio.</div>`}
      </div>`);
  }

  if (data.usernameResult) {
    const ur = data.usernameResult;
    parts.push(`
      <div class="at-card">
        <div class="at-card-title">
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="2" style="stroke:var(--accent)" stroke-width="1.2"/></svg>
          Platform Results for "${escapeHtml(ur.username)}"
        </div>
        <div class="at-card-sub">Checked ${ur.checkedPlatforms} platforms across Developer, Social, Gaming, Forums, Creative, and Professional categories.</div>
        ${atPlatformSection('Found', ur.found, 'found')}
        ${ur.variationHits && ur.variationHits.length ? `
          <div class="at-platform-section">
            <h4>Related username variations found (${ur.variationHits.length})</h4>
            <div class="at-platform-grid">
              ${ur.variationHits.map(v => `<a class="at-platform-chip found" href="${escapeHtml(v.profileUrl || '#')}" target="_blank" rel="noopener noreferrer"><span class="dot found"></span>${escapeHtml(v.username)}<span class="cat">${escapeHtml(v.platform)}</span></a>`).join('')}
            </div>
          </div>` : ''}
        ${ur.unknown && ur.unknown.length ? `<div class="at-note">${ur.unknown.length} platform(s) could not be checked right now (rate limits or timeouts) and were left out of the score to avoid a false result.</div>` : ''}
      </div>`);
  }

  if (data.emailResult) {
    const er = data.emailResult;
    parts.push(`
      <div class="at-card">
        <div class="at-card-title">
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="4" width="15" height="12" rx="2" style="stroke:var(--accent)" stroke-width="1.2"/><path d="M3 5.5 10 11l7-5.5" style="stroke:var(--accent)" stroke-width="1.2" stroke-linecap="round"/></svg>
          Email Intelligence
        </div>
        <div class="at-card-sub">${escapeHtml(er.email)}</div>
        <div class="at-signal">${er.gravatar && er.gravatar.registered ? `Public Gravatar profile found${er.gravatar.displayName ? ` for "${escapeHtml(er.gravatar.displayName)}"` : ''}.` : 'No public Gravatar profile found.'}</div>
        ${er.breachSignal && er.breachSignal.checked
          ? (er.breachSignal.matches.length > 0
              ? `<div class="at-signal">This email's domain matches ${er.breachSignal.matches.length} known breached service(s): ${er.breachSignal.matches.map(m => escapeHtml(m.name)).join(', ')}</div>`
              : `<div class="at-signal">This email's domain does not match any known breached service.</div>`)
          : `<div class="at-note">${escapeHtml(er.breachSignal && er.breachSignal.note ? er.breachSignal.note : 'Breach data unavailable right now.')}</div>`}
        ${er.domain && er.domain.mailProvider ? `<div class="at-signal">Email domain uses ${escapeHtml(er.domain.mailProvider)}.</div>` : ''}
        ${er.domain && er.domain.emailSecurity ? `<div class="at-signal">Domain email security: SPF ${er.domain.emailSecurity.hasSpf ? 'present' : 'missing'}, DMARC ${er.domain.emailSecurity.hasDmarc ? 'present' : 'missing'}.</div>` : ''}
      </div>`);
  }

  parts.push(`
    <div class="at-card">
      <div class="at-card-title">
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M10 3 3 17h14L10 3Z" style="stroke:var(--accent)" stroke-width="1.2" stroke-linejoin="round"/><path d="M10 8.5v3.5" style="stroke:var(--accent)" stroke-width="1.2" stroke-linecap="round"/><circle cx="10" cy="14.2" r="0.6" style="fill:var(--accent)"/></svg>
        What to do next
      </div>
      <ul class="at-actions-list">
        ${report.actionItems.map(a => `<li><svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M4 10.5 8 14.5 16 5.5" stroke="#4ade80" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>${escapeHtml(a)}</li>`).join('')}
      </ul>
    </div>`);

  return `<div id="atExportRoot">${parts.join('')}</div>`;
}

// Export = browser print-to-PDF against a dedicated print stylesheet
// (see .at-no-print / at-export-print-title in alextrace.css). This
// needs no server-side PDF library, no extra dependency, and works
// reliably on Render's free tier since it's 100% client-side.
function atExportReport() {
  const root = document.getElementById('atExportRoot');
  if (!root) return;
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to export the report.');
    return;
  }
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>AlexTrace Exposure Report</title>
      <style>
        ${toolThemeVarsCss()}
        body { font-family: 'Inter', Arial, sans-serif; background: #0a0a0c; color: #f4f4f5; padding: 30px; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .meta { color: #8a8a95; font-size: 12px; margin-bottom: 24px; }
        .at-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 16px; margin-bottom: 14px; }
        .at-card-title { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
        .at-card-sub { font-size: 11px; color: #8a8a95; margin-bottom: 10px; }
        .at-signal, .at-note { font-size: 12px; color: #ccc; padding: 4px 0; }
        .at-platform-grid { display: flex; flex-wrap: wrap; gap: 6px; }
        .at-platform-chip { border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 4px 10px; font-size: 11px; color: #ccc; text-decoration: none; }
        .at-actions-list { list-style: none; padding: 0; }
        .at-actions-list li { font-size: 12px; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .at-report-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .at-score-ring, .at-btn-ghost, button { display: none; }
        .at-report-summary h3 { font-size: 16px; margin-bottom: 4px; }
        .at-report-summary p { font-size: 11px; color: #8a8a95; }
        @media print { body { background: #fff; color: #111; } .at-card { border-color: #ccc; background: #fafafa; } .at-signal, .at-note, .at-card-sub { color: #333; } }
      </style>
    </head>
    <body>
      <h1>AlexTrace Exposure Report</h1>
      <div class="meta">Generated ${new Date().toLocaleString()}, alexcyberx.com/tools/alextrace</div>
      ${root.innerHTML}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.onload = () => printWindow.print();
}

/* ── Check a Service panel (free breach list search) ─────── */
function atBreachPanel() {
  return `
    <div class="at-card">
      <div class="at-card-title">
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M10 3 3 17h14L10 3Z" style="stroke:var(--accent)" stroke-width="1.2" stroke-linejoin="round"/><path d="M10 8.5v3.5" style="stroke:var(--accent)" stroke-width="1.2" stroke-linecap="round"/><circle cx="10" cy="14.2" r="0.6" style="fill:var(--accent)"/></svg>
        Was this service ever breached?
      </div>
      <div class="at-card-sub">Type a platform or company name (e.g. "Canva", "LinkedIn") to check known public breaches, when they happened, and what data was exposed.</div>
      <div class="at-input-row">
        <div class="at-field"><label>Service name</label><input class="at-input" id="atBreachInput" placeholder="e.g. Canva" autocomplete="off" onkeydown="if(event.key==='Enter')atRunBreachSearch()"></div>
        <button class="at-btn" id="atBreachBtn" onclick="atRunBreachSearch()">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.4"/><path d="M13.5 13.5 17.5 17.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          Search
        </button>
      </div>
      <div class="at-note">Uses HaveIBeenPwned's public breach directory. This checks whether the service itself was ever breached, not whether your specific account was involved.</div>
      <div id="atBreachResult"></div>
    </div>`;
}

async function atRunBreachSearch() {
  if (!atRequireLogin()) return;

  const query = document.getElementById('atBreachInput').value.trim();
  const resultEl = document.getElementById('atBreachResult');
  const btn = document.getElementById('atBreachBtn');

  if (query.length < 2) {
    resultEl.innerHTML = `<div class="at-error-box">Please enter at least 2 characters to search.</div>`;
    return;
  }

  btn.disabled = true;
  const originalHtml = btn.innerHTML;
  btn.innerHTML = 'Searching...';
  resultEl.innerHTML = `<div class="at-loading"><div class="at-spinner"></div>Searching the breach directory...</div>`;

  try {
    const res = await fetch(`/api/alextrace/breach-search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Search failed. Please try again.');
    resultEl.innerHTML = data.note
      ? `<div class="at-note" style="margin-top:10px;">${escapeHtml(data.note)}</div>`
      : atRenderBreachResults(data.results, query);
  } catch (e) {
    resultEl.innerHTML = `<div class="at-error-box">${escapeHtml(e.message)}</div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

function atRenderBreachResults(results, query) {
  if (!results || !results.length) {
    return `<div class="at-empty" style="margin-top:10px;">No known breaches found matching "${escapeHtml(query)}".</div>`;
  }
  return `<div style="margin-top:14px;display:flex;flex-direction:column;gap:10px;">
    ${results.map(b => `
      <div class="at-card" style="margin-bottom:0;padding:16px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-bottom:6px;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:var(--fg-1);">${escapeHtml(b.title || b.name)}</span>
          ${b.breachDate ? `<span style="font-size:11px;color:var(--fg-3);font-family:'Inter',sans-serif;">${escapeHtml(b.breachDate)}</span>` : ''}
        </div>
        ${b.pwnCount ? `<div class="at-signal" style="padding:4px 0;">${b.pwnCount.toLocaleString()} accounts affected</div>` : ''}
        ${b.dataClasses && b.dataClasses.length ? `<div class="at-signal" style="padding:4px 0;">Exposed data: ${b.dataClasses.map(escapeHtml).join(', ')}</div>` : ''}
      </div>`).join('')}
  </div>`;
}

/* ── Password Strength panel (fully offline) ─────────────── */
function atPasswordPanel() {
  return `
    <div class="at-card">
      <div class="at-card-title">
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><rect x="4.5" y="9" width="11" height="8" rx="1.5" style="stroke:var(--accent)" stroke-width="1.2"/><path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" style="stroke:var(--accent)" stroke-width="1.2"/></svg>
        How strong is this password pattern?
      </div>
      <div class="at-card-sub">Checked entirely on the server in memory and never stored or logged. Still, avoid typing a password you actually use anywhere real, a similar made-up one works just as well to learn from.</div>
      <div class="at-input-row">
        <div class="at-field"><label>Password</label><input class="at-input" type="password" id="atPasswordInput" placeholder="Type a password pattern to test" autocomplete="off" onkeydown="if(event.key==='Enter')atRunPasswordCheck()"></div>
        <button class="at-btn-ghost" type="button" onclick="atTogglePasswordVisibility()" id="atPwToggle">Show</button>
        <button class="at-btn" id="atPasswordBtn" onclick="atRunPasswordCheck()">Check Strength</button>
      </div>
      <div id="atPasswordResult"></div>
    </div>`;
}

function atTogglePasswordVisibility() {
  const input = document.getElementById('atPasswordInput');
  const btn = document.getElementById('atPwToggle');
  const isPw = input.type === 'password';
  input.type = isPw ? 'text' : 'password';
  btn.textContent = isPw ? 'Hide' : 'Show';
}

async function atRunPasswordCheck() {
  if (!atRequireLogin()) return;

  const password = document.getElementById('atPasswordInput').value;
  const resultEl = document.getElementById('atPasswordResult');
  const btn = document.getElementById('atPasswordBtn');

  if (!password) {
    resultEl.innerHTML = `<div class="at-error-box">Please enter a password to analyze.</div>`;
    return;
  }

  btn.disabled = true;
  const originalHtml = btn.innerHTML;
  btn.innerHTML = 'Checking...';
  resultEl.innerHTML = `<div class="at-loading"><div class="at-spinner"></div>Analyzing...</div>`;

  try {
    const res = await fetch('/api/alextrace/password-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, userId: window._currentUser.id })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not analyze this password.');
    resultEl.innerHTML = atRenderPasswordResult(data);
  } catch (e) {
    resultEl.innerHTML = `<div class="at-error-box">${escapeHtml(e.message)}</div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

function atRenderPasswordResult(data) {
  const a = data.analysis;
  const report = data.report;
  return `
    <div style="margin-top:14px;">
      <div class="at-report-header">
        ${atScoreRingSvg(report.overallScore, report.overallLevel)}
        <div class="at-report-summary">
          <h3>Crackability: <span class="at-level-${report.overallLevel}">${atLevelLabel(report.overallLevel)}</span></h3>
          <p>Estimated time to crack offline: <strong style="color:var(--fg-1);">${escapeHtml(a.estimatedCrackTime)}</strong> (${a.length} characters, ${a.effectiveEntropyBits} bits of effective entropy)</p>
        </div>
      </div>
      ${a.patterns.length ? `
        <div class="at-card">
          <div class="at-card-title">Weak patterns detected</div>
          <ul class="at-actions-list">
            ${a.patterns.map(p => `<li><svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M10 3 3 17h14L10 3Z" stroke="#f87171" stroke-width="1.4" stroke-linejoin="round"/></svg>${escapeHtml(p)}</li>`).join('')}
          </ul>
        </div>` : `
        <div class="at-card">
          <div class="at-signal" style="color:#4ade80;"><svg width="14" height="14" viewBox="0 0 20 20" fill="none" style="flex-shrink:0;margin-top:2px;"><path d="M4 10.5 8 14.5 16 5.5" stroke="#4ade80" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>No common weak patterns detected.</div>
        </div>`}
      <div class="at-card">
        <div class="at-card-title">Suggestions</div>
        <ul class="at-actions-list">
          ${a.suggestions.map(s => `<li><svg width="13" height="13" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" style="stroke:var(--fg-3)" stroke-width="1.2"/></svg>${escapeHtml(s)}</li>`).join('')}
        </ul>
      </div>
    </div>`;
}

/* ── Metadata (EXIF) panel ────────────────────────────────── */
function atMetadataPanel() {
  return `
    <div class="at-card">
      <div class="at-card-title">
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="4" width="15" height="12" rx="2" style="stroke:var(--accent)" stroke-width="1.2"/><circle cx="7.5" cy="9" r="1.5" style="stroke:var(--accent)" stroke-width="1.1"/><path d="M4 15l4-4 3 3 2.5-2.5L16 15" style="stroke:var(--accent)" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Check a photo before you post it
      </div>
      <div class="at-card-sub">See what hidden data (GPS location, device, timestamp) is embedded in an image. Nothing is uploaded to storage, it's checked and discarded.</div>
      <div class="at-dropzone" id="atDropzone" onclick="document.getElementById('atFileInput').click()">
        <svg width="30" height="30" viewBox="0 0 20 20" fill="none" style="margin:0 auto;display:block;"><path d="M10 13V4M6 8l4-4 4 4" style="stroke:var(--fg-3)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.5 13.5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2" style="stroke:var(--fg-3)" stroke-width="1.3" stroke-linecap="round"/></svg>
        <p id="atDropzoneText">Click to choose a photo, or drag one here</p>
        <input type="file" id="atFileInput" accept="image/*" style="display:none;" onchange="atOnFileSelected(this.files)">
      </div>
      <div style="margin-top:14px;">
        <button class="at-btn" id="atMetadataBtn" onclick="atRunMetadataCheck()" disabled>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.4"/><path d="M13.5 13.5 17.5 17.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          Check Metadata
        </button>
      </div>
      <div id="atMetadataResult"></div>
    </div>`;
}

function atOnFileSelected(files) {
  if (!files || !files.length) return;
  _atSelectedFile = files[0];
  document.getElementById('atDropzoneText').innerHTML = `Selected: <span class="fname">${escapeHtml(_atSelectedFile.name)}</span>`;
  document.getElementById('atMetadataBtn').disabled = false;
}

// Drag and drop support
document.addEventListener('dragover', (e) => {
  const zone = document.getElementById('atDropzone');
  if (!zone || !zone.contains(e.target) && e.target !== zone) return;
});
// On the Next page this script loads after DOMContentLoaded, so then it runs at once.
function atAttachDropHandlers() {
  if (window._atDropHandlers) return;
  window._atDropHandlers = true;
  document.body.addEventListener('dragover', (e) => {
    const zone = document.getElementById('atDropzone');
    if (zone && (zone === e.target || zone.contains(e.target))) {
      e.preventDefault();
      zone.classList.add('dragover');
    }
  });
  document.body.addEventListener('dragleave', (e) => {
    const zone = document.getElementById('atDropzone');
    if (zone) zone.classList.remove('dragover');
  });
  document.body.addEventListener('drop', (e) => {
    const zone = document.getElementById('atDropzone');
    if (zone && (zone === e.target || zone.contains(e.target))) {
      e.preventDefault();
      zone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length) {
        atOnFileSelected(e.dataTransfer.files);
      }
    }
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', atAttachDropHandlers);
else atAttachDropHandlers();

async function atRunMetadataCheck() {
  if (!atRequireLogin()) return;
  if (!_atSelectedFile) return;

  const resultEl = document.getElementById('atMetadataResult');
  const btn = document.getElementById('atMetadataBtn');

  btn.disabled = true;
  const originalHtml = btn.innerHTML;
  btn.innerHTML = 'Checking...';
  resultEl.innerHTML = `<div class="at-loading"><div class="at-spinner"></div>Reading image metadata...</div>`;

  try {
    const formData = new FormData();
    formData.append('image', _atSelectedFile);

    const res = await fetch(`/api/alextrace/metadata?userId=${encodeURIComponent(window._currentUser.id)}`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not read metadata from this image.');

    resultEl.innerHTML = atRenderMetadataResult(data);
  } catch (e) {
    resultEl.innerHTML = `<div class="at-error-box">${escapeHtml(e.message)}</div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

function atRenderMetadataResult(data) {
  const m = data.metadataResult;
  const report = data.report;

  if (!m.hasMetadata) {
    return `<div class="at-card" style="margin-top:14px;">
      <div class="at-signal" style="color:#4ade80;">
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style="flex-shrink:0;margin-top:2px;"><path d="M4 10.5 8 14.5 16 5.5" stroke="#4ade80" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        ${escapeHtml(m.note || 'No metadata found in this image.')}
      </div>
    </div>`;
  }

  const rows = [];
  if (m.gps) {
    rows.push(`<div class="at-signal" style="color:#f87171;">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style="flex-shrink:0;margin-top:2px;"><path d="M10 18s6-5.5 6-10a6 6 0 0 0-12 0c0 4.5 6 10 6 10Z" stroke="#f87171" stroke-width="1.3"/><circle cx="10" cy="8" r="2" stroke="#f87171" stroke-width="1.1"/></svg>
      GPS location embedded: <a href="${escapeHtml(m.gps.mapsUrl)}" target="_blank" rel="noopener noreferrer" style="color:#f87171;text-decoration:underline;">view on map</a>
    </div>`);
  }
  if (m.device && (m.device.make || m.device.model)) {
    rows.push(`<div class="at-signal">Device: ${escapeHtml([m.device.make, m.device.model].filter(Boolean).join(' '))}</div>`);
  }
  if (m.timestamp) {
    rows.push(`<div class="at-signal">Taken: ${escapeHtml(String(m.timestamp))}</div>`);
  }

  return `
    <div style="margin-top:14px;">
      <div class="at-report-header">
        ${atScoreRingSvg(report.overallScore, report.overallLevel)}
        <div class="at-report-summary">
          <h3>Metadata Risk: <span class="at-level-${report.overallLevel}">${atLevelLabel(report.overallLevel)}</span></h3>
          <p>This is what's hidden inside the image file itself, invisible unless someone checks.</p>
        </div>
      </div>
      <div class="at-card">${rows.join('')}</div>
      <div class="at-card">
        <div class="at-card-title">
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M10 3 3 17h14L10 3Z" style="stroke:var(--accent)" stroke-width="1.2" stroke-linejoin="round"/></svg>
          What to do next
        </div>
        <ul class="at-actions-list">
          ${report.actionItems.map(a => `<li><svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M4 10.5 8 14.5 16 5.5" stroke="#4ade80" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>`;
}
