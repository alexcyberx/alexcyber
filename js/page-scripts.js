/* ═══════════════════════════════════════════
   COURSE CLICK - Auth gate
   Language already selected → saved in localStorage
   If logged in → go to learn page directly
   If not logged in → show login/signup modal, redirect after
═══════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   CONTACT FORM - Client-side validation
═══════════════════════════════════════════ */
async function handleContactSubmit() {
  const name  = (document.getElementById('contactName')?.value  || '').trim();
  const email = (document.getElementById('contactEmail')?.value || '').trim();
  const msg   = (document.getElementById('contactMsg')?.value   || '').trim();
  const hp    =  document.getElementById('contactHP')?.value    || '';
  const status = document.getElementById('contactMsg_status');

  function setStatus(txt, ok) {
    if (!status) return;
    status.style.color = ok ? '#4ade80' : '#e06060';
    status.textContent = txt;
  }

  // Pulls the message from DICT (respects selected language), falling
  // back to a hardcoded string if the key is somehow missing.
  function t(key, fallback) {
    if (typeof getDictText === 'function') {
      const v = getDictText(key);
      if (v) return v;
    }
    return fallback;
  }

  // Honeypot check - bot detected
  if (hp) { setStatus('', true); return; }

  // Validation
  if (!name)  { setStatus(t('form.status.nameRequired', 'Apna naam daalo.'), false); return; }
  if (name.length > 60) { setStatus(t('form.status.nameTooLong', 'Naam bahut lamba hai.'), false); return; }
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setStatus(t('form.status.emailInvalid', 'Valid email daalo.'), false); return; }
  if (!msg || msg.length < 10) { setStatus(t('form.status.msgTooShort', 'Message kam se kam 10 characters ka hona chahiye.'), false); return; }
  if (msg.length > 1000) { setStatus(t('form.status.msgTooLong', 'Message 1000 characters se zyada nahi ho sakta.'), false); return; }

  // XSS check - no HTML tags
  if (/<[^>]*>/.test(name + msg)) { setStatus(t('form.status.noHtml', 'Special characters are not allowed.'), false); return; }

  // Save to Supabase
  const btn = document.querySelector('.btn-send');
  if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; }

  if (_supabase) {
    const { error } = await _supabase.rpc('submit_contact_message', {
      p_name:    name,
      p_email:   email,
      p_message: msg
    });
    if (error) {
      setStatus(t('form.status.sendError', 'Message could not be sent. Please try again.'), false);
      if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
      return;
    }
  } else {
    // FIX: Supabase client ready nahi tha (page load timing issue), pehle
    // yeh silently skip ho jaata tha aur seedha "success" dikha deta tha,
    // jabki message kahin save hi nahi hota tha. Ab user ko sach batao.
    setStatus(t('form.status.sendErrorRetry', 'Message could not be sent. Please try again in a moment.'), false);
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
    return;
  }

  setStatus(t('form.status.success', 'Message mil gaya! Jaldi reply karenge.'), true);
  document.getElementById('contactName').value  = '';
  document.getElementById('contactEmail').value = '';
  document.getElementById('contactMsg').value   = '';
  if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
  setTimeout(() => setStatus('', true), 4000);
}
function handleCourseClick() {
  if (!window._currentUser) {
    showAuth('login', 'learn');
    return;
  }
  showPage('learn');
}
function handleCourse2Click() {
  if (!window._currentUser) {
    showAuth('login', 'learn2');
    return;
  }
  showPage('learn2');
}
// Generic version used by dynamically-rendered course cards (js/courses.js),
// works for any course's page_key, not just the original two hardcoded ones.
function handleCourseClickFor(pageKey) {
  if (!window._currentUser) {
    showAuth('login', pageKey);
    return;
  }
  showPage(pageKey);
}
function handleAlexSyncClick() {
  if (!window._currentUser) {
    showAuth('login', 'alexsync');
    return;
  }
  showPage('alexsync');
}

/* ═══════════════════════════
   ALEXSYNC TOOL PAGE
═══════════════════════════ */

// App options start with just YouTube as a safe fallback. If the
// user's Windows background app has run at least once, we replace
// this with the actual detected-installed-apps list fetched from
// Supabase (see asFetchDetectedApps()), so the dropdown only shows
// apps that are genuinely on their PC, not a generic guess.
let AS_APP_OPTIONS = [
  { value: 'youtube', label: 'YouTube' },
];

const AS_GENRE_OPTIONS = [
  { value: 'bollywood',     label: 'Hindi Bollywood' },
  { value: 'lofi',          label: 'Lo-fi' },
  { value: 'instrumental',  label: 'Instrumental' },
  { value: 'punjabi',       label: 'Punjabi' },
  { value: 'english_pop',   label: 'English Pop' },
  { value: 'classical',     label: 'Classical' },
  { value: 'edm',           label: 'EDM' },
  { value: 'rock',          label: 'Rock' },
  { value: 'jazz',          label: 'Jazz' },
  { value: 'kpop',          label: 'K-pop' },
  { value: 'devotional',    label: 'Devotional / Bhajan' },
  { value: 'rap_hiphop',    label: 'Rap / Hip-Hop' },
  { value: 'ghazal',        label: 'Ghazal' },
  { value: 'ambient',       label: 'Ambient / White Noise' },
  { value: 'romantic',      label: 'Romantic' },
];

// State for the two dropdowns whose value isn't just "whatever's
// selected in a list", the genre can be free-typed text too.
let asSelectedGenreValue = 'bollywood';
let asSelectedGenreLabel = 'Hindi Bollywood';
let asSelectedGenreIsCustom = false;

function asToggleDropdown(id) {
  const el = document.getElementById(id);
  const isOpen = el.classList.contains('open');
  // Close any other open dropdown first so only one is open at a time.
  document.querySelectorAll('.as-dropdown.open').forEach(d => d.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
}

// Close dropdowns when clicking outside them.
document.addEventListener('click', function (e) {
  document.querySelectorAll('.as-dropdown').forEach(d => {
    if (!d.contains(e.target)) d.classList.remove('open');
  });
});

function asBuildSimpleDropdown(panelId, valueSpanId, options, selectedValue, onSelect) {
  const panel = document.getElementById(panelId);
  panel.innerHTML = '';
  options.forEach(opt => {
    const div = document.createElement('div');
    div.className = 'as-dropdown-option' + (opt.value === selectedValue ? ' selected' : '');
    div.textContent = opt.label;
    div.onclick = function (e) {
      e.stopPropagation();
      document.getElementById(valueSpanId).textContent = opt.label;
      document.getElementById(panelId).closest('.as-dropdown').classList.remove('open');
      onSelect(opt.value, opt.label);
    };
    panel.appendChild(div);
  });
}

function asBuildHourMinutePanels() {
  const hours = [];
  for (let h = 1; h <= 12; h++) hours.push({ value: String(h), label: String(h) });
  const minutes = [];
  for (let m = 0; m < 60; m += 5) minutes.push({ value: String(m).padStart(2, '0'), label: String(m).padStart(2, '0') });
  const ampm = [{ value: 'AM', label: 'AM' }, { value: 'PM', label: 'PM' }];

  asBuildSimpleDropdown('asHourPanel', 'asHourValue', hours, document.getElementById('asHourValue').textContent, () => {});
  asBuildSimpleDropdown('asMinutePanel', 'asMinuteValue', minutes, document.getElementById('asMinuteValue').textContent, () => {});
  asBuildSimpleDropdown('asAmPmPanel', 'asAmPmValue', ampm, document.getElementById('asAmPmValue').textContent, () => {});
}

function asBuildAppDropdown() {
  asBuildSimpleDropdown('asAppPanel', 'asAppValue', AS_APP_OPTIONS, asGetAppValue(), () => {});
}

function asGetAppValue() {
  const label = document.getElementById('asAppValue').textContent;
  const match = AS_APP_OPTIONS.find(o => o.label === label);
  return match ? match.value : 'youtube';
}

function asBuildGenreDropdown() {
  const panel = document.getElementById('asGenrePanel');
  const customRow = panel.querySelector('.as-dropdown-custom-row');
  panel.innerHTML = '';

  AS_GENRE_OPTIONS.forEach(opt => {
    const div = document.createElement('div');
    div.className = 'as-dropdown-option' + (!asSelectedGenreIsCustom && opt.value === asSelectedGenreValue ? ' selected' : '');
    div.textContent = opt.label;
    div.onclick = function (e) {
      e.stopPropagation();
      asSelectedGenreValue = opt.value;
      asSelectedGenreLabel = opt.label;
      asSelectedGenreIsCustom = false;
      document.getElementById('asGenreValue').textContent = opt.label;
      document.getElementById('asGenreDropdown').classList.remove('open');
      document.getElementById('asGenreCustomInput').value = '';
    };
    panel.appendChild(div);
  });

  panel.appendChild(customRow); // keep the custom text input at the bottom, after the list
}

function asSelectCustomGenre(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  asSelectedGenreValue = trimmed.toLowerCase().replace(/\s+/g, '_');
  asSelectedGenreLabel = trimmed;
  asSelectedGenreIsCustom = true;
  document.getElementById('asGenreValue').textContent = trimmed;
}

function asSetHourMinuteAmPm(hour24, minute) {
  let h = hour24 % 12;
  if (h === 0) h = 12;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  document.getElementById('asHourValue').textContent = String(h);
  document.getElementById('asMinuteValue').textContent = String(minute).padStart(2, '0');
  document.getElementById('asAmPmValue').textContent = ampm;
}

function asGetWakeTime24h() {
  let h = parseInt(document.getElementById('asHourValue').textContent, 10);
  const m = parseInt(document.getElementById('asMinuteValue').textContent, 10);
  const ampm = document.getElementById('asAmPmValue').textContent;
  if (ampm === 'AM') { if (h === 12) h = 0; } else { if (h !== 12) h += 12; }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

async function initAlexSyncPage() {
  // Show/hide the shutdown-specific setup note based on selected PC state
  const radios = document.querySelectorAll('input[name="asPcState"]');
  radios.forEach(r => {
    r.addEventListener('change', () => {
      const note = document.getElementById('asShutdownNote');
      if (note) note.style.display = (r.value === 'shutdown' && r.checked) ? 'block' : 'none';
    });
  });

  asBuildHourMinutePanels();
  asBuildAppDropdown();
  asBuildGenreDropdown();

  await asRefreshAccessCard();
  await asFetchDetectedApps();
  await asLoadSavedSchedule();
}

// Fetches the list of apps the user's Windows background app detected
// as installed (see get_alexsync_schedule's detected_apps column,
// populated by windows-app/app_detect.py). Falls back to just YouTube
// if the background app hasn't synced yet, or the fetch fails.
async function asFetchDetectedApps() {
  const sb = window._supabase;
  if (!sb) return;
  try {
    const { data, error } = await sb.rpc('get_alexsync_schedule');
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (row && Array.isArray(row.detected_apps) && row.detected_apps.length > 0) {
      AS_APP_OPTIONS = row.detected_apps;
    }
  } catch (e) {
    console.error('AlexSync: could not fetch detected apps, using default', e);
  }
  asBuildAppDropdown();
}

// Checks the current user's paid_until status via RPC and updates the
// access card + Save button state accordingly.
async function asRefreshAccessCard() {
  const sb = window._supabase;
  const statusText = document.getElementById('asAccessStatusText');
  const payBtn = document.getElementById('asPayBtn');
  const saveBtn = document.getElementById('asSaveBtn');
  if (!sb) return;

  try {
    const { data, error } = await sb.rpc('get_alexsync_access');
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    const hasAccess = row && row.has_access;
    const paidUntil = row && row.paid_until ? new Date(row.paid_until) : null;

    if (hasAccess && paidUntil) {
      statusText.textContent = 'Active until ' + paidUntil.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + '.';
      payBtn.textContent = 'Renew';
      if (saveBtn) saveBtn.disabled = false;
    } else {
      statusText.textContent = 'One time payment. No auto-debit, renew manually anytime.';
      payBtn.textContent = 'Unlock AlexSync';
      if (saveBtn) saveBtn.disabled = true;
    }
  } catch (e) {
    console.error('AlexSync: could not load access status', e);
    statusText.textContent = 'Could not check access status right now.';
  }
}

// Pre-fills the schedule form if the user already has a saved schedule.
async function asLoadSavedSchedule() {
  const sb = window._supabase;
  if (!sb) return;
  try {
    const { data, error } = await sb.rpc('get_alexsync_schedule');
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return; // no saved schedule yet, leave form defaults as-is

    if (row.wake_time) {
      const [h, m] = row.wake_time.split(':').map(Number);
      asSetHourMinuteAmPm(h, m);
    }

    if (row.platform) {
      const appMatch = AS_APP_OPTIONS.find(o => o.value === row.platform);
      document.getElementById('asAppValue').textContent = appMatch ? appMatch.label : 'YouTube';
    }

    if (row.genre) {
      const genreMatch = AS_GENRE_OPTIONS.find(o => o.value === row.genre);
      if (genreMatch) {
        asSelectedGenreValue = genreMatch.value;
        asSelectedGenreLabel = genreMatch.label;
        asSelectedGenreIsCustom = false;
        document.getElementById('asGenreValue').textContent = genreMatch.label;
      } else {
        // saved genre isn't in the built-in list, it was a custom typed genre
        asSelectedGenreValue = row.genre;
        asSelectedGenreLabel = row.genre;
        asSelectedGenreIsCustom = true;
        document.getElementById('asGenreValue').textContent = row.genre;
      }
    }

    const pcRadio = document.querySelector(`input[name="asPcState"][value="${row.pc_state || 'sleep'}"]`);
    if (pcRadio) { pcRadio.checked = true; pcRadio.dispatchEvent(new Event('change')); }

    document.querySelectorAll('.as-day-pill input').forEach(el => {
      el.checked = (row.days_of_week || []).includes(parseInt(el.value, 10));
    });

    // rebuild dropdown panels now that selections changed, so the
    // "selected" highlight in each panel is accurate next time it opens
    asBuildAppDropdown();
    asBuildGenreDropdown();
  } catch (e) {
    console.error('AlexSync: could not load saved schedule', e);
  }
}

function handleAlexSyncDownload() {
  window.location.href = 'https://github.com/alexcyberx/alexcyber/releases/download/AlexSync/AlexSync.exe';
}

// ── Cyber Mistake Analyzer ──────────────────────────────────
async function handleAnalyzeCommand() {
  const input = document.getElementById('cmaInput');
  const btn = document.getElementById('cmaAnalyzeBtn');
  const status = document.getElementById('cmaStatus');
  const resultBox = document.getElementById('cmaResult');

  const command = input.value.trim();
  if (!command) {
    status.textContent = 'Please enter a command first.';
    status.style.color = '#dc1414';
    return;
  }
  if (!window._currentUser) {
    status.textContent = 'Please log in to use the analyzer.';
    status.style.color = '#dc1414';
    return;
  }

  btn.disabled = true;
  btn.style.opacity = '0.6';
  status.textContent = 'Analyzing...';
  status.style.color = '#8a8a95';
  resultBox.style.display = 'none';

  try {
    const res = await fetch('/api/tools/analyze-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, userId: window._currentUser.id })
    });
    const data = await res.json();

    if (!res.ok) {
      status.textContent = data.error || 'Something went wrong. Please try again.';
      status.style.color = '#dc1414';
      return;
    }

    status.textContent = '';
    renderAnalyzerResult(data);
  } catch (e) {
    console.error('Cyber Mistake Analyzer error:', e);
    status.textContent = 'Network error. Please try again.';
    status.style.color = '#dc1414';
  } finally {
    btn.disabled = false;
    btn.style.opacity = '1';
  }
}

function renderAnalyzerResult(data) {
  const resultBox = document.getElementById('cmaResult');

  if (data.tool === 'unrecognized') {
    resultBox.innerHTML = `
      <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px;">
        <p style="font-family:'Inter',sans-serif;font-size:13px;color:#f4f4f5;line-height:1.7;">${escapeHtml(data.whatItDoes || "Couldn't recognize this as a security/networking command.")}</p>
      </div>`;
    resultBox.style.display = 'block';
    return;
  }

  const riskColors = { low: '#4ade80', medium: '#fbbf24', high: '#f87171' };
  const riskColor = riskColors[data.riskLevel] || '#8a8a95';

  const listHtml = (items, color) =>
    (items && items.length)
      ? `<ul style="margin:0;padding-left:18px;">${items.map(i => `<li style="font-family:'Inter',sans-serif;font-size:13px;color:#ccc;line-height:1.8;">${escapeHtml(i)}</li>`).join('')}</ul>`
      : `<p style="font-family:'Inter',sans-serif;font-size:12px;color:#555;">None noted.</p>`;

  resultBox.innerHTML = `
    <div class="cma-box" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:18px;">

      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;">${escapeHtml(data.tool || 'Command')}</div>
        <span style="font-size:10px;letter-spacing:1px;font-family:'Rajdhani',sans-serif;font-weight:700;color:${riskColor};border:1px solid ${riskColor}55;background:${riskColor}15;padding:3px 10px;border-radius:20px;">${escapeHtml((data.riskLevel || 'low').toUpperCase())} RISK</span>
      </div>

      <div>
        <p style="font-family:'Inter',sans-serif;font-size:13px;color:#ccc;line-height:1.7;">${escapeHtml(data.whatItDoes || '')}</p>
      </div>

      <div>
        <div style="font-family:'Inter',sans-serif;font-size:11px;color:#4ade80;letter-spacing:0.5px;margin-bottom:8px;">✓ WHAT YOU DID RIGHT</div>
        ${listHtml(data.didRight, '#4ade80')}
      </div>

      <div>
        <div style="font-family:'Inter',sans-serif;font-size:11px;color:#dc1414;letter-spacing:0.5px;margin-bottom:8px;">✕ WHAT TO FIX</div>
        ${listHtml(data.didWrong, '#dc1414')}
      </div>

      <div>
        <div style="font-family:'Inter',sans-serif;font-size:11px;color:#8a8a95;letter-spacing:0.5px;margin-bottom:8px;">BETTER COMMAND</div>
        <div style="background:#0a0a0c;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;font-family:'JetBrains Mono',monospace;font-size:13px;color:#f4f4f5;overflow-x:auto;white-space:pre;">${escapeHtml(data.betterCommand || '')}</div>
        ${data.betterCommandWhy ? `<p style="font-family:'Inter',sans-serif;font-size:12px;color:#666;margin-top:8px;line-height:1.6;">${escapeHtml(data.betterCommandWhy)}</p>` : ''}
      </div>

      <div>
        <div style="font-family:'Inter',sans-serif;font-size:11px;color:#8a8a95;letter-spacing:0.5px;margin-bottom:8px;">WHEN TO USE THIS</div>
        <p style="font-family:'Inter',sans-serif;font-size:13px;color:#ccc;line-height:1.7;">${escapeHtml(data.whenToUse || '')}</p>
      </div>

    </div>`;
  resultBox.style.display = 'block';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

/* ═══════════════════════════════════════════
   TOOLS PAGE - enabled/disabled state
   Reads public tool_settings rows (RLS allows anonymous select)
   so a disabled tool shows as locked even to logged-out visitors,
   instead of only failing once they click into it.
═══════════════════════════════════════════ */
async function initToolsPage() {
  if (!window._supabase) return;
  try {
    const { data, error } = await window._supabase
      .from('tool_settings')
      .select('tool_key, is_enabled, disabled_message');
    if (error || !data) return;

    data.forEach(row => {
      const card = document.querySelector(`.tut-card[data-tool-key="${row.tool_key}"]`);
      if (!card) return;
      if (!row.is_enabled) {
        card.style.opacity = '0.45';
        card.style.cursor = 'not-allowed';
        card.setAttribute('data-tool-disabled', 'true');
        card.setAttribute('data-tool-disabled-message', row.disabled_message || 'This tool is temporarily unavailable.');
        // Replace the click handler with a message instead of navigating,
        // without needing to know or preserve the original onclick logic.
        card.onclick = (e) => {
          e.stopPropagation();
          alert(card.getAttribute('data-tool-disabled-message'));
        };
        const badge = card.querySelector('.card-tag');
        if (badge && !badge.dataset.origText) {
          badge.dataset.origText = badge.textContent;
          badge.textContent = 'Unavailable';
          badge.style.color = '#8a8a95';
        }
      } else if (card.getAttribute('data-tool-disabled') === 'true') {
        // Was disabled, now re-enabled (e.g. admin flipped it back on
        // without a full page reload) - restore normal appearance.
        card.style.opacity = '';
        card.style.cursor = 'pointer';
        card.removeAttribute('data-tool-disabled');
        card.onclick = null; // page reload needed to restore original handler; acceptable for this edge case
      }
    });
  } catch (e) {
    console.error('[Tools] could not load tool settings:', e);
  }
}

/* ═══════════════════════════════════════════
   ALEXRECON TOOL
═══════════════════════════════════════════ */
async function initAlexReconPage() {
  await arLoadHistory();
  await arLoadSchedules();
}

async function handleRunRecon() {
  const input = document.getElementById('arInput');
  const btn = document.getElementById('arRunBtn');
  const status = document.getElementById('arStatus');
  const report = document.getElementById('arReport');

  const target = input.value.trim();
  if (!target) {
    status.textContent = 'Please enter a domain to scan.';
    status.style.color = '#dc1414';
    return;
  }
  if (!window._currentUser) {
    status.textContent = 'Please log in to run a scan.';
    status.style.color = '#dc1414';
    return;
  }

  btn.disabled = true;
  btn.style.opacity = '0.6';
  status.textContent = 'Running recon, this can take up to a minute...';
  status.style.color = '#8a8a95';
  report.style.display = 'none';

  try {
    const res = await fetch('/api/alexrecon/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, userId: window._currentUser.id })
    });
    const data = await res.json();

    if (!res.ok) {
      status.textContent = data.error || 'Something went wrong. Please try again.';
      status.style.color = '#dc1414';
      return;
    }

    status.textContent = '';
    renderReconReport(data);
    arLoadHistory();
  } catch (e) {
    console.error('AlexRecon error:', e);
    status.textContent = 'Network error. Please try again.';
    status.style.color = '#dc1414';
  } finally {
    btn.disabled = false;
    btn.style.opacity = '1';
  }
}

// Human-readable labels + order for each module key returned by the backend.
const AR_MODULE_LABELS = {
  dns: 'DNS Intelligence',
  wildcardDetection: 'Wildcard Detection',
  axfrCheck: 'AXFR Zone Transfer Check',
  ssl: 'SSL Intelligence',
  webRecon: 'Web Recon',
  robotsAndSitemap: 'robots.txt / sitemap.xml',
  loginPanelDetection: 'Login/Admin Panel Detection',
  subdomains: 'Subdomain Enumeration',
  liveHosts: 'Live Host Detection',
  asnCidr: 'ASN + CIDR Discovery',
  waybackUrls: 'Wayback URLs',
  commonCrawlUrls: 'CommonCrawl URLs',
  jsRecon: 'JavaScript Recon',
  cloudDiscovery: 'Cloud Discovery',
  directoryBackupCheck: 'Directory / Backup Files',
  githubOrgIntel: 'GitHub Org Intelligence',
  commonPortCheck: 'Common Port Check (best-effort)'
};

function arStatusBadge(status) {
  const colors = { completed: '#4ade80', partial: '#fbbf24', failed: '#f87171' };
  const c = colors[status] || '#8a8a95';
  return `<span style="font-size:10px;letter-spacing:1px;font-family:'Rajdhani',sans-serif;font-weight:700;color:${c};border:1px solid ${c}55;background:${c}15;padding:3px 10px;border-radius:20px;">${escapeHtml((status || '').toUpperCase())}</span>`;
}

function arSectionCard(title, innerHtml, unavailableNote) {
  const body = unavailableNote
    ? `<p style="font-family:'Inter',sans-serif;font-size:12px;color:#666;line-height:1.7;">Unavailable: ${escapeHtml(unavailableNote)}</p>`
    : innerHtml;
  return `
    <details class="ar-section" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px 16px;margin-bottom:10px;">
      <summary style="cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;list-style:none;">${escapeHtml(title)}</summary>
      <div style="margin-top:12px;">${body}</div>
    </details>`;
}

function arKeyValueList(pairs) {
  const rows = pairs.filter(([, v]) => v !== null && v !== undefined && v !== '');
  if (!rows.length) return `<p style="font-family:'Inter',sans-serif;font-size:12px;color:#555;">No data.</p>`;
  return `<div style="display:flex;flex-direction:column;gap:6px;">${rows.map(([k, v]) => `
    <div style="display:flex;gap:10px;font-family:'Inter',sans-serif;font-size:12px;">
      <span style="color:#8a8a95;min-width:140px;flex-shrink:0;">${escapeHtml(k)}</span>
      <span style="color:#ccc;word-break:break-all;">${escapeHtml(typeof v === 'object' ? JSON.stringify(v) : String(v))}</span>
    </div>`).join('')}</div>`;
}

function arChipList(items) {
  if (!items || !items.length) return `<p style="font-family:'Inter',sans-serif;font-size:12px;color:#555;">None found.</p>`;
  return `<div style="display:flex;flex-wrap:wrap;gap:6px;">${items.map(i => `
    <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#ccc;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);padding:4px 9px;border-radius:6px;">${escapeHtml(i)}</span>`).join('')}</div>`;
}

function renderReconReport(data) {
  const report = document.getElementById('arReport');
  const exportBar = document.getElementById('arExportBar');
  window._arCurrentReport = data; // used by export functions
  const m = data.modules || {};

  let html = `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:16px;">
      <div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;">${escapeHtml(data.target)}</div>
        <div style="font-family:'Inter',sans-serif;font-size:11px;color:#8a8a95;">Scanned in ${(data.scanDurationMs / 1000).toFixed(1)}s</div>
      </div>
      ${arStatusBadge(data.status)}
    </div>
    <div class="ar-section-grid">`;

  // DNS
  if (m.dns) {
    const d = m.dns.data || {};
    html += arSectionCard(AR_MODULE_LABELS.dns, `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div><div style="font-size:11px;color:#8a8a95;margin-bottom:6px;">A / AAAA</div>${arChipList([...(d.a || []), ...(d.aaaa || [])])}</div>
        <div><div style="font-size:11px;color:#8a8a95;margin-bottom:6px;">NS</div>${arChipList(d.ns)}</div>
        <div><div style="font-size:11px;color:#8a8a95;margin-bottom:6px;">MX</div>${arChipList((d.mx || []).map(x => `${x.exchange} (${x.priority})`))}</div>
        <div><div style="font-size:11px;color:#8a8a95;margin-bottom:6px;">SPF</div>${arChipList(d.spf)}</div>
        <div><div style="font-size:11px;color:#8a8a95;margin-bottom:6px;">DMARC</div>${arChipList(d.dmarc)}</div>
        <div><div style="font-size:11px;color:#8a8a95;margin-bottom:6px;">DKIM selectors found</div>${arChipList((d.dkim || []).map(x => x.selector))}</div>
      </div>`, m.dns.ok ? null : m.dns.error);
  }

  // SSL
  if (m.ssl) {
    const s = m.ssl.data || {};
    html += arSectionCard(AR_MODULE_LABELS.ssl, s.available ? arKeyValueList([
      ['Issuer', s.issuer && s.issuer.O],
      ['Valid From', s.validFrom],
      ['Valid To', s.validTo],
      ['Days Until Expiry', s.daysUntilExpiry],
      ['TLS Version', s.tlsVersion],
      ['Cipher Suite', s.cipherSuite],
      ['SAN Names', (s.sanNames || []).join(', ')]
    ]) : `<p style="font-family:'Inter',sans-serif;font-size:12px;color:#666;">${escapeHtml(s.note || 'Not available.')}</p>`, m.ssl.ok ? null : m.ssl.error);
  }

  // Web Recon
  if (m.webRecon) {
    const w = m.webRecon.data || {};
    html += arSectionCard(AR_MODULE_LABELS.webRecon, w.reachable ? `
      <div style="display:flex;flex-direction:column;gap:14px;">
        ${arKeyValueList([
          ['Final URL', w.finalUrl],
          ['Status Code', w.statusCode],
          ['Title', w.title],
          ['Server', w.riskIndicators && w.riskIndicators.serverHeaderExposed],
          ['X-Powered-By', w.riskIndicators && w.riskIndicators.poweredByExposed]
        ])}
        <div><div style="font-size:11px;color:#8a8a95;margin-bottom:6px;">Detected Tech Stack</div>${arChipList((w.techStack || []).map(t => `${t.name} (${t.type})`))}</div>
        <div><div style="font-size:11px;color:#fbbf24;margin-bottom:6px;">Missing Security Headers</div>${arChipList(w.riskIndicators && w.riskIndicators.missingSecurityHeaders)}</div>
        <div><div style="font-size:11px;color:#4ade80;margin-bottom:6px;">Present Security Headers</div>${arChipList(w.riskIndicators && w.riskIndicators.presentSecurityHeaders)}</div>
        ${w.riskIndicators && w.riskIndicators.corsRisk ? `<p style="font-family:'Inter',sans-serif;font-size:12px;color:#fbbf24;">${escapeHtml(w.riskIndicators.corsRisk)}</p>` : ''}
      </div>` : `<p style="font-family:'Inter',sans-serif;font-size:12px;color:#666;">${escapeHtml(w.note || 'Host not reachable.')}</p>`, m.webRecon.ok ? null : m.webRecon.error);
  }

  // Login/Admin panel detection
  if (m.loginPanelDetection) {
    const found = m.loginPanelDetection.data || [];
    html += arSectionCard(AR_MODULE_LABELS.loginPanelDetection, arChipList(found.map(f => `${f.path} (${f.status})`)), m.loginPanelDetection.ok ? null : m.loginPanelDetection.error);
  }

  // robots.txt / sitemap.xml
  if (m.robotsAndSitemap) {
    const r = m.robotsAndSitemap.data || {};
    html += arSectionCard(AR_MODULE_LABELS.robotsAndSitemap, arKeyValueList([
      ['robots.txt', r.robotsTxt ? 'Found' : 'Not found'],
      ['sitemap.xml', r.sitemapXml ? 'Found' : 'Not found']
    ]), m.robotsAndSitemap.ok ? null : m.robotsAndSitemap.error);
  }

  // Subdomains
  if (m.subdomains) {
    const sd = m.subdomains.data || {};
    html += arSectionCard(`${AR_MODULE_LABELS.subdomains} (${sd.count || 0})`, arChipList(sd.subdomains), m.subdomains.ok ? null : m.subdomains.error);
  }

  // Live hosts
  if (m.liveHosts) {
    const lh = m.liveHosts.data || {};
    html += arSectionCard(AR_MODULE_LABELS.liveHosts, `
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${arKeyValueList([['Checked', lh.checked], ['Skipped (cap reached)', lh.skipped], ['Dead', lh.dead]])}
        ${arChipList((lh.live || []).map(h => `${h.host} (${h.protocol}, ${h.status})`))}
      </div>`, m.liveHosts.ok ? null : m.liveHosts.error);
  }

  // ASN/CIDR
  if (m.asnCidr) {
    const a = m.asnCidr.data || {};
    html += arSectionCard(AR_MODULE_LABELS.asnCidr, a.available ? arChipList((a.prefixes || []).map(p => `${p.cidr}, AS${p.asn} ${p.asnName || ''}`)) : `<p style="font-family:'Inter',sans-serif;font-size:12px;color:#666;">${escapeHtml(a.note || 'Not available.')}</p>`, m.asnCidr.ok ? null : m.asnCidr.error);
  }

  // URL discovery
  if (m.waybackUrls) {
    const wu = m.waybackUrls.data || {};
    html += arSectionCard(`${AR_MODULE_LABELS.waybackUrls} (${wu.count || 0}${wu.truncated ? '+' : ''})`, arChipList((wu.urls || []).slice(0, 40)), m.waybackUrls.ok ? null : m.waybackUrls.error);
  }
  if (m.commonCrawlUrls) {
    const cc = m.commonCrawlUrls.data || {};
    html += arSectionCard(`${AR_MODULE_LABELS.commonCrawlUrls} (${cc.count || 0}${cc.truncated ? '+' : ''})`, arChipList((cc.urls || []).slice(0, 40)), m.commonCrawlUrls.ok ? null : m.commonCrawlUrls.error);
  }

  // JS recon
  if (m.jsRecon) {
    const js = m.jsRecon.data || {};
    const findingsHtml = (js.findings || []).map(f => `
      <div style="border-left:2px solid #dc141455;padding-left:10px;margin-bottom:10px;">
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#8a8a95;word-break:break-all;">${escapeHtml(f.file)}</div>
        ${f.possibleFindings && f.possibleFindings.length ? `<div style="margin-top:4px;">${arChipList(f.possibleFindings.map(pf => `${pf.type} x${pf.matchCount}`))}</div>` : ''}
        ${f.endpointsFound && f.endpointsFound.length ? `<div style="margin-top:4px;">${arChipList(f.endpointsFound)}</div>` : ''}
      </div>`).join('');
    html += arSectionCard(AR_MODULE_LABELS.jsRecon, `
      <div>
        ${arKeyValueList([['Files Discovered', js.filesDiscovered], ['Files Analyzed', js.filesAnalyzed]])}
        <div style="margin-top:10px;">${findingsHtml || '<p style="font-family:\'Inter\',sans-serif;font-size:12px;color:#555;">No JS files analyzed.</p>'}</div>
        <p style="font-family:'Inter',sans-serif;font-size:11px;color:#555;margin-top:10px;">${escapeHtml(js.disclaimer || '')}</p>
      </div>`, m.jsRecon.ok ? null : m.jsRecon.error);
  }

  // Cloud discovery
  if (m.cloudDiscovery) {
    const cd = m.cloudDiscovery.data || {};
    html += arSectionCard(AR_MODULE_LABELS.cloudDiscovery, `
      <div>
        ${arChipList((cd.s3Buckets || []).map(b => `${b.bucket} (${b.status})`))}
        ${cd.firebase ? `<p style="font-family:'Inter',sans-serif;font-size:12px;color:#ccc;margin-top:8px;">Firebase: ${escapeHtml(cd.firebase.project)}, ${escapeHtml(cd.firebase.note)}</p>` : ''}
        <p style="font-family:'Inter',sans-serif;font-size:11px;color:#555;margin-top:8px;">${escapeHtml(cd.disclaimer || '')}</p>
      </div>`, m.cloudDiscovery.ok ? null : m.cloudDiscovery.error);
  }

  // Directory/backup
  if (m.directoryBackupCheck) {
    const db = m.directoryBackupCheck.data || {};
    html += arSectionCard(AR_MODULE_LABELS.directoryBackupCheck, arChipList((db.found || []).map(f => `${f.path} (${f.status})`)), m.directoryBackupCheck.ok ? null : m.directoryBackupCheck.error);
  }

  // GitHub org intel
  if (m.githubOrgIntel) {
    const g = m.githubOrgIntel.data || {};
    html += arSectionCard(AR_MODULE_LABELS.githubOrgIntel, g.available ? `
      <div>
        ${arKeyValueList([['Org', g.orgName], ['Public Repos', g.publicRepos], ['Blog', g.blog], ['Email', g.email]])}
        <div style="margin-top:8px;"><div style="font-size:11px;color:#8a8a95;margin-bottom:6px;">Public Members</div>${arChipList(g.publicMembers)}</div>
      </div>` : `<p style="font-family:'Inter',sans-serif;font-size:12px;color:#666;">${escapeHtml(g.note || 'No matching org found.')}</p>`, m.githubOrgIntel.ok ? null : m.githubOrgIntel.error);
  }

  // Common ports
  if (m.commonPortCheck) {
    const p = m.commonPortCheck.data || {};
    html += arSectionCard(AR_MODULE_LABELS.commonPortCheck, `
      <div>
        ${arChipList((p.openPorts || []).map(x => `${x.port}/${x.service}`))}
        <p style="font-family:'Inter',sans-serif;font-size:11px;color:#555;margin-top:8px;">${escapeHtml(p.disclaimer || '')}</p>
      </div>`, m.commonPortCheck.ok ? null : m.commonPortCheck.error);
  }

  html += `</div>`; // close .ar-section-grid

  // Coming soon
  if (data.comingSoon && data.comingSoon.length) {
    html += `<div style="margin-top:20px;">
      <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#555;margin-bottom:10px;">COMING SOON</div>
      ${data.comingSoon.map(cs => `
        <div style="opacity:0.5;background:rgba(255,255,255,0.01);border:1px dashed rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;margin-bottom:8px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#8a8a95;">${escapeHtml(cs.label)}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#555;">${escapeHtml(cs.reason)}</div>
        </div>`).join('')}
    </div>`;
  }

  html += `<p style="font-family:'Inter',sans-serif;font-size:11px;color:#555;line-height:1.6;margin-top:20px;">${escapeHtml(data.disclaimer || '')}</p>`;

  report.innerHTML = html;
  report.style.display = 'block';
  if (exportBar) exportBar.style.display = 'flex';

  if (typeof arBuildGraph === 'function') arBuildGraph(data);
}

async function arLoadHistory() {
  const historyBox = document.getElementById('arHistory');
  if (!historyBox || !window._currentUser) return;

  try {
    const res = await fetch(`/api/alexrecon/history?userId=${encodeURIComponent(window._currentUser.id)}`);
    const data = await res.json();
    if (!res.ok || !data.scans) {
      historyBox.innerHTML = `<p style="font-family:'Inter',sans-serif;font-size:12px;color:#555;">No scan history yet.</p>`;
      return;
    }
    if (!data.scans.length) {
      historyBox.innerHTML = `<p style="font-family:'Inter',sans-serif;font-size:12px;color:#555;">No scans yet. Run your first scan above.</p>`;
      return;
    }

    const statusColors = { completed: '#4ade80', partial: '#fbbf24', failed: '#f87171', running: '#8a8a95' };
    historyBox.innerHTML = data.scans.map(s => {
      const c = statusColors[s.status] || '#8a8a95';
      const when = new Date(s.started_at).toLocaleString();
      return `
        <div onclick="arLoadScanFromHistory('${s.id}')" style="cursor:pointer;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#f4f4f5;">${escapeHtml(s.target)}</div>
            <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;">${escapeHtml(when)}</div>
          </div>
          <span style="font-size:10px;letter-spacing:1px;font-family:'Rajdhani',sans-serif;font-weight:700;color:${c};border:1px solid ${c}55;background:${c}15;padding:3px 10px;border-radius:20px;">${escapeHtml((s.status || '').toUpperCase())}</span>
        </div>`;
    }).join('');
  } catch (e) {
    console.error('AlexRecon history error:', e);
  }
}

async function arLoadScanFromHistory(scanId) {
  if (!window._currentUser) return;
  const status = document.getElementById('arStatus');
  status.textContent = 'Loading saved scan...';
  status.style.color = '#8a8a95';
  try {
    const res = await fetch(`/api/alexrecon/scan/${encodeURIComponent(scanId)}?userId=${encodeURIComponent(window._currentUser.id)}`);
    const data = await res.json();
    if (!res.ok) {
      status.textContent = data.error || 'Could not load this scan.';
      status.style.color = '#dc1414';
      return;
    }
    status.textContent = '';
    renderReconReport(data.result);
    document.getElementById('arReport').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    console.error('AlexRecon load scan error:', e);
    status.textContent = 'Network error loading scan.';
    status.style.color = '#dc1414';
  }
}

/* ═══════════════════════════════════════════
   ALEXRECON EXPORT (PDF / JSON / CSV / HTML)
   All client-side, no extra backend calls needed -
   the full report is already in window._arCurrentReport.
═══════════════════════════════════════════ */

function arDownloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function arSafeFilename(target) {
  return String(target || 'alexrecon-scan').replace(/[^a-z0-9.-]/gi, '_');
}

function arExportReport(format) {
  const data = window._arCurrentReport;
  if (!data) return;

  if (format === 'json') return arExportJson(data);
  if (format === 'csv') return arExportCsv(data);
  if (format === 'html') return arExportHtml(data);
  if (format === 'pdf') return arExportPdf(data);
}

function arExportJson(data) {
  const filename = `alexrecon-${arSafeFilename(data.target)}-${Date.now()}.json`;
  arDownloadBlob(JSON.stringify(data, null, 2), filename, 'application/json');
}

// Flattens the module data into simple rows (module, key, value) so
// it opens cleanly in Excel/Sheets. Arrays/objects inside a module
// are stringified so every finding still ends up in the sheet.
function arExportCsv(data) {
  const rows = [['Module', 'Status', 'Key', 'Value']];
  const m = data.modules || {};

  for (const [moduleKey, result] of Object.entries(m)) {
    const label = AR_MODULE_LABELS[moduleKey] || moduleKey;
    const status = result.ok ? 'ok' : 'unavailable';
    if (!result.ok) {
      rows.push([label, status, 'error', result.error || '']);
      continue;
    }
    const flat = arFlattenForCsv(result.data);
    if (!flat.length) {
      rows.push([label, status, '', '']);
    } else {
      flat.forEach(([k, v]) => rows.push([label, status, k, v]));
    }
  }

  const csvEscape = (val) => {
    const str = val === null || val === undefined ? '' : String(val);
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };

  const csv = rows.map(row => row.map(csvEscape).join(',')).join('\n');
  const filename = `alexrecon-${arSafeFilename(data.target)}-${Date.now()}.csv`;
  arDownloadBlob(csv, filename, 'text/csv');
}

function arFlattenForCsv(obj, prefix = '') {
  const out = [];
  if (obj === null || obj === undefined) return out;
  if (Array.isArray(obj)) {
    if (obj.length && typeof obj[0] !== 'object') {
      out.push([prefix || 'value', obj.join('; ')]);
    } else {
      obj.forEach((item, i) => out.push(...arFlattenForCsv(item, `${prefix}[${i}]`)));
    }
    return out;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v !== null && typeof v === 'object') {
        out.push(...arFlattenForCsv(v, key));
      } else {
        out.push([key, v]);
      }
    }
    return out;
  }
  out.push([prefix || 'value', obj]);
  return out;
}

function arExportHtml(data) {
  const reportEl = document.getElementById('arReport');
  const bodyHtml = reportEl ? reportEl.innerHTML : '';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>AlexRecon Report - ${escapeHtml(data.target)}</title>
<style>
  body { background:#0a0a0c; color:#f4f4f5; font-family:Arial,sans-serif; padding:24px; max-width:900px; margin:0 auto; }
  h1 { color:#dc1414; }
  details { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px 16px; margin-bottom:10px; }
  summary { cursor:pointer; font-weight:700; }
</style>
</head>
<body>
  <h1>AlexRecon Report</h1>
  <p>Target: ${escapeHtml(data.target)} | Status: ${escapeHtml(data.status)} | Generated: ${escapeHtml(new Date().toLocaleString())}</p>
  ${bodyHtml}
</body>
</html>`;
  const filename = `alexrecon-${arSafeFilename(data.target)}-${Date.now()}.html`;
  arDownloadBlob(html, filename, 'text/html');
}

function arExportPdf(data) {
  if (typeof window.jspdf === 'undefined') {
    alert('PDF export is still loading. Please try again in a moment.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 50;

  function addLine(text, size = 10, color = [30, 30, 30], bold = false) {
    if (y > 780) { doc.addPage(); y = 50; }
    doc.setFontSize(size);
    doc.setFont(undefined, bold ? 'bold' : 'normal');
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    lines.forEach(line => {
      if (y > 780) { doc.addPage(); y = 50; }
      doc.text(line, margin, y);
      y += size * 1.4;
    });
  }

  addLine('AlexRecon Report', 18, [220, 20, 20], true);
  addLine(`Target: ${data.target}`, 11, [60, 60, 60]);
  addLine(`Status: ${data.status}`, 11, [60, 60, 60]);
  addLine(`Generated: ${new Date().toLocaleString()}`, 11, [60, 60, 60]);
  y += 10;

  const m = data.modules || {};
  for (const [moduleKey, result] of Object.entries(m)) {
    const label = AR_MODULE_LABELS[moduleKey] || moduleKey;
    y += 6;
    addLine(label, 13, [20, 20, 20], true);
    if (!result.ok) {
      addLine(`Unavailable: ${result.error || 'unknown error'}`, 10, [150, 60, 60]);
      continue;
    }
    const flat = arFlattenForCsv(result.data);
    if (!flat.length) {
      addLine('No data.', 10, [120, 120, 120]);
    } else {
      flat.slice(0, 60).forEach(([k, v]) => {
        const valStr = v === null || v === undefined ? '' : String(v);
        addLine(`${k}: ${valStr}`.slice(0, 300), 9, [80, 80, 80]);
      });
      if (flat.length > 60) addLine(`... and ${flat.length - 60} more entries (see JSON export for full data).`, 9, [150, 150, 150]);
    }
  }

  if (data.disclaimer) {
    y += 10;
    addLine(data.disclaimer, 9, [150, 150, 150]);
  }

  doc.save(`alexrecon-${arSafeFilename(data.target)}-${Date.now()}.pdf`);
}

/* ═══════════════════════════════════════════
   ALEXRECON ATTACK SURFACE GRAPH
   Pure Canvas force-directed graph, no external
   library. Hierarchy per the PRD:
   Company -> Domain -> Subdomain -> IP -> Ports/Services
            -> Tech -> Risk Score
═══════════════════════════════════════════ */

let _arGraph = null; // { nodes, links, canvas, ctx, transform, animId }

const AR_NODE_COLORS = {
  root: '#dc1414',
  domain: '#dc1414',
  subdomain: '#f472b6',
  ip: '#60a5fa',
  port: '#fbbf24',
  tech: '#a78bfa',
  risk_low: '#4ade80',
  risk_medium: '#fbbf24',
  risk_high: '#f87171'
};

// Builds a nodes/links model from the scan report, following the
// Company -> Domain -> Subdomain -> IP -> Ports -> Services -> Tech
// -> Risk Score hierarchy from the PRD. Any module that failed or
// returned nothing simply contributes no nodes for that branch,
// rather than breaking the whole graph.
function arBuildGraphModel(data) {
  const nodes = [];
  const links = [];
  const seen = new Set();

  function addNode(id, label, type, meta) {
    if (seen.has(id)) return id;
    seen.add(id);
    nodes.push({ id, label, type, meta: meta || {} });
    return id;
  }
  function addLink(a, b) {
    links.push({ source: a, target: b });
  }

  const m = data.modules || {};
  const rootId = addNode('root:' + data.target, data.target, 'domain', { root: true });

  // Risk score node, derived from missing security headers + open ports +
  // exposed panels, so the graph headline visual carries a signal even
  // before a full scoring engine exists.
  let riskPoints = 0;
  const webData = m.webRecon && m.webRecon.ok ? m.webRecon.data : null;
  if (webData && webData.riskIndicators) {
    riskPoints += (webData.riskIndicators.missingSecurityHeaders || []).length;
  }
  const portsData = m.commonPortCheck && m.commonPortCheck.ok ? m.commonPortCheck.data : null;
  if (portsData) riskPoints += (portsData.openPorts || []).length;
  const loginData = m.loginPanelDetection && m.loginPanelDetection.ok ? m.loginPanelDetection.data : null;
  if (loginData) riskPoints += loginData.length;

  const riskLevel = riskPoints >= 8 ? 'high' : riskPoints >= 3 ? 'medium' : 'low';
  const riskId = addNode('risk:' + data.target, `Risk: ${riskLevel.toUpperCase()} (${riskPoints})`, 'risk_' + riskLevel, { score: riskPoints });
  addLink(rootId, riskId);

  // Subdomains
  const subData = m.subdomains && m.subdomains.ok ? m.subdomains.data : null;
  const subList = (subData && subData.subdomains) ? subData.subdomains.slice(0, 25) : [];
  subList.forEach(sd => {
    const sid = addNode('sub:' + sd, sd, 'subdomain');
    addLink(rootId, sid);
  });
  if (subData && subData.subdomains && subData.subdomains.length > 25) {
    const moreId = addNode('sub:more', `+${subData.subdomains.length - 25} more`, 'subdomain', { truncated: true });
    addLink(rootId, moreId);
  }

  // IPs (from DNS A records, linked to root; ASN/CIDR info attached as meta)
  const dnsData = m.dns && m.dns.ok ? m.dns.data : null;
  const ips = (dnsData && dnsData.a) ? dnsData.a : [];
  const asnData = m.asnCidr && m.asnCidr.ok ? m.asnCidr.data : null;
  ips.forEach(ip => {
    const ipId = addNode('ip:' + ip, ip, 'ip', {
      prefixes: asnData && asnData.ip === ip ? asnData.prefixes : null
    });
    addLink(rootId, ipId);

    // Ports/services hang off the primary IP
    if (portsData && portsData.openPorts) {
      portsData.openPorts.forEach(p => {
        const portId = addNode(`port:${ip}:${p.port}`, `${p.port} (${p.service})`, 'port');
        addLink(ipId, portId);
      });
    }
  });

  // Tech stack, linked to root
  if (webData && webData.techStack) {
    webData.techStack.forEach(t => {
      const techId = addNode('tech:' + t.name, t.name, 'tech', { techType: t.type });
      addLink(rootId, techId);
    });
  }

  return { nodes, links };
}

function arGraphColorFor(node) {
  return AR_NODE_COLORS[node.type] || '#8a8a95';
}

function arGraphRadiusFor(node) {
  if (node.meta && node.meta.root) return 10;
  if (node.type && node.type.startsWith('risk_')) return 9;
  if (node.type === 'domain') return 9;
  return 6;
}

// Lightweight force simulation: spring links + node repulsion + centering.
// Runs a fixed number of ticks up front (cheap for the node counts this
// graph produces, at most ~60), then keeps redrawing on drag/zoom/pan
// without recomputing physics every frame.
function arRunForceSimulation(nodes, links, width, height, iterations = 300) {
  const idToNode = {};
  nodes.forEach((n, i) => {
    const angle = (i / nodes.length) * Math.PI * 2;
    n.x = width / 2 + Math.cos(angle) * 120;
    n.y = height / 2 + Math.sin(angle) * 120;
    n.vx = 0;
    n.vy = 0;
    idToNode[n.id] = n;
  });

  const linkPairs = links.map(l => [idToNode[l.source], idToNode[l.target]]).filter(([a, b]) => a && b);

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between all node pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        let dx = a.x - b.x, dy = a.y - b.y;
        let distSq = dx * dx + dy * dy || 0.01;
        const dist = Math.sqrt(distSq);
        const force = 900 / distSq;
        dx /= dist; dy /= dist;
        a.vx += dx * force; a.vy += dy * force;
        b.vx -= dx * force; b.vy -= dy * force;
      }
    }
    // Spring attraction along links
    linkPairs.forEach(([a, b]) => {
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const targetDist = 70;
      const force = (dist - targetDist) * 0.02;
      const fx = (dx / dist) * force, fy = (dy / dist) * force;
      a.vx += fx; a.vy += fy;
      b.vx -= fx; b.vy -= fy;
    });
    // Centering + integrate + damping
    nodes.forEach(n => {
      n.vx += (width / 2 - n.x) * 0.001;
      n.vy += (height / 2 - n.y) * 0.001;
      n.vx *= 0.85; n.vy *= 0.85;
      n.x += n.vx; n.y += n.vy;
    });
  }
}

function arBuildGraph(data) {
  const section = document.getElementById('arGraphSection');
  const canvas = document.getElementById('arGraphCanvas');
  if (!section || !canvas) return;

  const { nodes, links } = arBuildGraphModel(data);
  if (!nodes.length) { section.style.display = 'none'; return; }

  section.style.display = 'block';

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || 600;
  const height = 420;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  arRunForceSimulation(nodes, links, width, height);

  _arGraph = {
    nodes, links, canvas, ctx, width, height,
    transform: { x: 0, y: 0, scale: 1 },
    dragNode: null,
    isPanning: false,
    lastPointer: null
  };

  arGraphDraw();
  arGraphAttachInteraction();
}

function arGraphDraw() {
  if (!_arGraph) return;
  const { ctx, nodes, links, width, height, transform } = _arGraph;

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(transform.x, transform.y);
  ctx.scale(transform.scale, transform.scale);

  const idToNode = {};
  nodes.forEach(n => idToNode[n.id] = n);

  // Links
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  links.forEach(l => {
    const a = idToNode[l.source], b = idToNode[l.target];
    if (!a || !b) return;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  });

  // Nodes
  nodes.forEach(n => {
    const r = arGraphRadiusFor(n);
    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.fillStyle = arGraphColorFor(n);
    ctx.fill();
    if (n.meta && n.meta.root) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fff';
      ctx.stroke();
    }
  });

  // Labels (only for larger/root nodes to avoid clutter at default zoom)
  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = '#ccc';
  nodes.forEach(n => {
    if (n.meta && n.meta.root || n.type === 'risk_low' || n.type === 'risk_medium' || n.type === 'risk_high') {
      ctx.fillText(n.label, n.x + 12, n.y + 4);
    }
  });

  ctx.restore();
}

function arGraphNodeAt(px, py) {
  if (!_arGraph) return null;
  const { nodes, transform } = _arGraph;
  const x = (px - transform.x) / transform.scale;
  const y = (py - transform.y) / transform.scale;
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i];
    const r = arGraphRadiusFor(n) + 4;
    const dx = n.x - x, dy = n.y - y;
    if (dx * dx + dy * dy <= r * r) return n;
  }
  return null;
}

function arGraphAttachInteraction() {
  const { canvas } = _arGraph;
  const tooltip = document.getElementById('arGraphTooltip');

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  }

  canvas.onmousedown = canvas.ontouchstart = (e) => {
    const pos = getPos(e);
    const node = arGraphNodeAt(pos.x, pos.y);
    if (node) {
      _arGraph.dragNode = node;
    } else {
      _arGraph.isPanning = true;
      canvas.style.cursor = 'grabbing';
    }
    _arGraph.lastPointer = pos;
  };

  canvas.onmousemove = canvas.ontouchmove = (e) => {
    const pos = getPos(e);
    if (_arGraph.dragNode) {
      const t = _arGraph.transform;
      _arGraph.dragNode.x = (pos.x - t.x) / t.scale;
      _arGraph.dragNode.y = (pos.y - t.y) / t.scale;
      arGraphDraw();
    } else if (_arGraph.isPanning && _arGraph.lastPointer) {
      const dx = pos.x - _arGraph.lastPointer.x;
      const dy = pos.y - _arGraph.lastPointer.y;
      _arGraph.transform.x += dx;
      _arGraph.transform.y += dy;
      _arGraph.lastPointer = pos;
      arGraphDraw();
    } else {
      const node = arGraphNodeAt(pos.x, pos.y);
      if (node && tooltip) {
        tooltip.style.display = 'block';
        tooltip.style.left = (pos.x + 14) + 'px';
        tooltip.style.top = (pos.y + 14) + 'px';
        tooltip.innerHTML = arGraphTooltipHtml(node);
        canvas.style.cursor = 'pointer';
      } else {
        if (tooltip) tooltip.style.display = 'none';
        canvas.style.cursor = 'grab';
      }
    }
  };

  function endDrag() {
    _arGraph.dragNode = null;
    _arGraph.isPanning = false;
    canvas.style.cursor = 'grab';
  }
  canvas.onmouseup = canvas.onmouseleave = canvas.ontouchend = endDrag;

  canvas.onwheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.1 : 0.9;
    arGraphZoom(delta);
  };
}

function arGraphTooltipHtml(node) {
  const typeLabels = {
    domain: 'Domain', subdomain: 'Subdomain', ip: 'IP Address', port: 'Port/Service',
    tech: 'Technology', risk_low: 'Risk Score', risk_medium: 'Risk Score', risk_high: 'Risk Score'
  };
  let html = `<div style="font-weight:700;margin-bottom:4px;">${escapeHtml(node.label)}</div>`;
  html += `<div style="color:#8a8a95;">${escapeHtml(typeLabels[node.type] || node.type)}</div>`;
  if (node.meta && node.meta.prefixes && node.meta.prefixes.length) {
    html += `<div style="margin-top:4px;color:#ccc;">${node.meta.prefixes.slice(0, 3).map(p => escapeHtml(p.cidr + (p.asnName ? ' - ' + p.asnName : ''))).join('<br>')}</div>`;
  }
  return html;
}

function arGraphZoom(factor) {
  if (!_arGraph) return;
  _arGraph.transform.scale = Math.max(0.3, Math.min(3, _arGraph.transform.scale * factor));
  arGraphDraw();
}

function arGraphReset() {
  if (!_arGraph) return;
  _arGraph.transform = { x: 0, y: 0, scale: 1 };
  arGraphDraw();
}

/* ═══════════════════════════════════════════
   ALEXRECON SCHEDULED SCANS
═══════════════════════════════════════════ */

async function handleCreateSchedule() {
  const input = document.getElementById('arScheduleInput');
  const freqSelect = document.getElementById('arScheduleFrequency');
  const status = document.getElementById('arScheduleStatus');

  const target = input.value.trim();
  if (!target) {
    status.textContent = 'Please enter a domain to schedule.';
    status.style.color = '#dc1414';
    return;
  }
  if (!window._currentUser) {
    status.textContent = 'Please log in to create a schedule.';
    status.style.color = '#dc1414';
    return;
  }

  status.textContent = 'Creating schedule...';
  status.style.color = '#8a8a95';

  try {
    const res = await fetch('/api/alexrecon/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: window._currentUser.id, target, frequency: freqSelect.value })
    });
    const data = await res.json();
    if (!res.ok) {
      status.textContent = data.error || 'Could not create schedule.';
      status.style.color = '#dc1414';
      return;
    }
    status.textContent = 'Schedule created.';
    status.style.color = '#4ade80';
    input.value = '';
    arLoadSchedules();
  } catch (e) {
    console.error('AlexRecon schedule create error:', e);
    status.textContent = 'Network error. Please try again.';
    status.style.color = '#dc1414';
  }
}

async function arLoadSchedules() {
  const list = document.getElementById('arScheduleList');
  if (!list || !window._currentUser) return;

  try {
    const res = await fetch(`/api/alexrecon/schedules?userId=${encodeURIComponent(window._currentUser.id)}`);
    const data = await res.json();
    if (!res.ok || !data.schedules) {
      list.innerHTML = `<p style="font-family:'Inter',sans-serif;font-size:12px;color:#555;">Could not load schedules.</p>`;
      return;
    }
    if (!data.schedules.length) {
      list.innerHTML = `<p style="font-family:'Inter',sans-serif;font-size:12px;color:#555;">No scheduled scans yet.</p>`;
      return;
    }

    list.innerHTML = data.schedules.map(s => {
      const lastRun = s.last_run_at ? new Date(s.last_run_at).toLocaleString() : 'Never run yet';
      const activeColor = s.is_active ? '#4ade80' : '#666';
      return `
        <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
          <div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#f4f4f5;">${escapeHtml(s.target)}</div>
            <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;">${escapeHtml(s.frequency)} - Last run: ${escapeHtml(lastRun)}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:10px;letter-spacing:1px;font-family:'Rajdhani',sans-serif;font-weight:700;color:${activeColor};border:1px solid ${activeColor}55;background:${activeColor}15;padding:3px 10px;border-radius:20px;">${s.is_active ? 'ACTIVE' : 'PAUSED'}</span>
            <button onclick="arToggleSchedule('${s.id}', ${!s.is_active})" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:5px 10px;font-family:'Inter',sans-serif;font-size:11px;color:#ccc;cursor:pointer;">${s.is_active ? 'Pause' : 'Resume'}</button>
            <button onclick="arDeleteSchedule('${s.id}')" style="background:rgba(220,20,20,0.08);border:1px solid rgba(220,20,20,0.3);border-radius:6px;padding:5px 10px;font-family:'Inter',sans-serif;font-size:11px;color:#f87171;cursor:pointer;">Delete</button>
          </div>
        </div>`;
    }).join('');
  } catch (e) {
    console.error('AlexRecon schedules load error:', e);
  }
}

async function arToggleSchedule(id, newActiveState) {
  if (!window._currentUser) return;
  try {
    const res = await fetch(`/api/alexrecon/schedules/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: window._currentUser.id, is_active: newActiveState })
    });
    if (res.ok) arLoadSchedules();
  } catch (e) {
    console.error('AlexRecon schedule toggle error:', e);
  }
}

async function arDeleteSchedule(id) {
  if (!window._currentUser) return;
  if (!confirm('Delete this scheduled scan?')) return;
  try {
    const res = await fetch(`/api/alexrecon/schedules/${encodeURIComponent(id)}?userId=${encodeURIComponent(window._currentUser.id)}`, {
      method: 'DELETE'
    });
    if (res.ok) arLoadSchedules();
  } catch (e) {
    console.error('AlexRecon schedule delete error:', e);
  }
}

/* ═══════════════════════════════════════════
   ALEXUTILS - combined toolkit
   Tools that need a real backend call (SSL check, MAC lookup,
   CVE search, IP/DNS lookup) fetch /api/alexutils/*. Everything
   else (hashing, Base64, URL encode, subnet calc, password
   tools, JWT decode, regex tester, JSON formatter, UUID gen)
   runs entirely client-side - pure math/crypto, no round trip
   needed.
═══════════════════════════════════════════ */

const AU_TABS = [
  { id: 'ipdns', label: 'IP / DNS' },
  { id: 'ssl', label: 'SSL Checker' },
  { id: 'hash', label: 'Hash Generator' },
  { id: 'base64', label: 'Base64' },
  { id: 'urlencode', label: 'URL Encode' },
  { id: 'subnet', label: 'Subnet Calc' },
  { id: 'cve', label: 'CVE Search' },
  { id: 'mac', label: 'MAC Lookup' },
  { id: 'password', label: 'Password Tools' },
  { id: 'jwt', label: 'JWT Decoder' },
  { id: 'regex', label: 'Regex Tester' },
  { id: 'json', label: 'JSON Formatter' },
  { id: 'uuid', label: 'UUID Gen' }
];

let _auInitialized = false;

function initAlexUtilsPage() {
  if (_auInitialized) return; // tabs/panels only need to be built once
  _auInitialized = true;

  const tabsEl = document.getElementById('auTabs');
  const panelsEl = document.getElementById('auPanels');
  if (!tabsEl || !panelsEl) return;

  tabsEl.innerHTML = AU_TABS.map((t, i) =>
    `<button class="au-tab${i === 0 ? ' active' : ''}" id="au-tab-${t.id}" onclick="auNav('${t.id}')">${escapeHtml(t.label)}</button>`
  ).join('');

  panelsEl.innerHTML = AU_TABS.map((t, i) =>
    `<div class="au-panel${i === 0 ? ' active' : ''}" id="au-${t.id}">${auPanelHtml(t.id)}</div>`
  ).join('');
}

function auNav(id) {
  document.querySelectorAll('.au-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.au-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('au-tab-' + id).classList.add('active');
  document.getElementById('au-' + id).classList.add('active');
}

function auCopy(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  const text = el.textContent;
  if (!text) return;
  navigator.clipboard.writeText(text).catch(() => {});
}

function auRequireLogin() {
  if (window._currentUser) return true;
  if (typeof showAuth === 'function') showAuth('login', 'alexutils');
  return false;
}

async function auApiCall(endpoint, body) {
  if (!auRequireLogin()) throw new Error('Please log in to use this tool.');
  const res = await fetch(`/api/alexutils/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, userId: window._currentUser.id })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

function auPanelHtml(id) {
  switch (id) {
    case 'ipdns': return auIpDnsPanel();
    case 'ssl': return auSslPanel();
    case 'hash': return auHashPanel();
    case 'base64': return auBase64Panel();
    case 'urlencode': return auUrlEncodePanel();
    case 'subnet': return auSubnetPanel();
    case 'cve': return auCvePanel();
    case 'mac': return auMacPanel();
    case 'password': return auPasswordPanel();
    case 'jwt': return auJwtPanel();
    case 'regex': return auRegexPanel();
    case 'json': return auJsonPanel();
    case 'uuid': return auUuidPanel();
    default: return '';
  }
}

/* -- IP / DNS -- */
function auIpDnsPanel() {
  return `
    <div class="au-card">
      <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:14px;">IP Lookup</div>
      <div class="au-row">
        <div class="au-field"><label>IP Address or Domain</label><input class="au-input" id="auIpInput" placeholder="e.g. 8.8.8.8 or google.com"></div>
        <button class="au-btn" onclick="auIpLookup()">Lookup</button>
      </div>
      <div id="auIpResult" class="au-info-grid"></div>
    </div>
    <div class="au-card">
      <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:14px;">DNS Resolver</div>
      <div class="au-row">
        <div class="au-field"><label>Domain</label><input class="au-input" id="auDnsInput" placeholder="e.g. example.com"></div>
        <div class="au-field" style="flex:0 0 120px;min-width:100px;">
          <label>Record Type</label>
          <select class="au-input" id="auDnsType" style="font-family:'Inter',sans-serif;">
            <option>A</option><option>AAAA</option><option>MX</option><option>NS</option><option>TXT</option><option>CNAME</option><option>SOA</option>
          </select>
        </div>
        <button class="au-btn" onclick="auDnsResolve()">Resolve</button>
      </div>
      <div class="au-copy-row"><span class="au-label">Result</span><button class="au-copy-btn" onclick="auCopy('auDnsResult')">Copy</button></div>
      <div id="auDnsResult" class="au-result empty">Enter a domain and click Resolve...</div>
    </div>`;
}

async function auIpLookup() {
  const input = document.getElementById('auIpInput').value.trim();
  const resultEl = document.getElementById('auIpResult');
  if (!input) return;
  resultEl.innerHTML = `<div style="color:#8a8a95;font-size:12px;">Looking up...</div>`;
  try {
    const data = await auApiCall('ip-lookup', { value: input });
    if (!data.found) {
      resultEl.innerHTML = `<div style="color:#f87171;font-size:12px;">${escapeHtml(data.note || 'Not found.')}</div>`;
      return;
    }
    const rows = [
      ['IP', data.ip], ['Hostname', data.hostname], ['Country', data.countryName],
      ['City', data.city], ['Region', data.region], ['Org', data.org],
      ['ASN', data.asn], ['Timezone', data.timezone]
    ].filter(([, v]) => v);
    resultEl.innerHTML = rows.map(([k, v]) => `
      <div class="au-info-item"><div class="au-info-key">${escapeHtml(k)}</div><div class="au-info-val">${escapeHtml(v)}</div></div>`).join('');
  } catch (e) {
    resultEl.innerHTML = `<div style="color:#f87171;font-size:12px;">${escapeHtml(e.message)}</div>`;
  }
}

async function auDnsResolve() {
  const domain = document.getElementById('auDnsInput').value.trim();
  const type = document.getElementById('auDnsType').value;
  const resultEl = document.getElementById('auDnsResult');
  if (!domain) return;
  resultEl.textContent = 'Resolving...';
  resultEl.className = 'au-result';
  try {
    const data = await auApiCall('dns-resolve', { domain, recordType: type });
    if (!data.found) {
      resultEl.textContent = data.note || 'No records found.';
      resultEl.className = 'au-result error';
      return;
    }
    resultEl.textContent = data.records.join('\n');
    resultEl.className = 'au-result success';
  } catch (e) {
    resultEl.textContent = e.message;
    resultEl.className = 'au-result error';
  }
}

/* -- SSL Checker -- */
function auSslPanel() {
  return `
    <div class="au-card">
      <div class="au-row">
        <div class="au-field"><label>Domain</label><input class="au-input" id="auSslInput" placeholder="e.g. example.com"></div>
        <button class="au-btn" onclick="auSslCheck()">Check Certificate</button>
      </div>
      <div id="auSslResult"></div>
    </div>`;
}

async function auSslCheck() {
  const domain = document.getElementById('auSslInput').value.trim();
  const resultEl = document.getElementById('auSslResult');
  if (!domain) return;
  resultEl.innerHTML = `<div style="color:#8a8a95;font-size:12px;">Checking certificate...</div>`;
  try {
    const data = await auApiCall('ssl-check', { domain });
    if (!data.available) {
      resultEl.innerHTML = `<div style="color:#f87171;font-size:12px;">${escapeHtml(data.note || 'Could not retrieve certificate.')}</div>`;
      return;
    }
    const rows = [
      ['Issuer', data.issuer && data.issuer.O], ['Valid From', data.validFrom], ['Valid To', data.validTo],
      ['Days Until Expiry', data.daysUntilExpiry], ['Expired', data.expired ? 'Yes' : 'No'],
      ['TLS Version', data.tlsVersion], ['Cipher Suite', data.cipherSuite],
      ['SAN Names', (data.sanNames || []).join(', ')]
    ].filter(([, v]) => v !== null && v !== undefined && v !== '');
    resultEl.innerHTML = `<div class="au-info-grid">${rows.map(([k, v]) => `
      <div class="au-info-item"><div class="au-info-key">${escapeHtml(k)}</div><div class="au-info-val">${escapeHtml(v)}</div></div>`).join('')}</div>`;
  } catch (e) {
    resultEl.innerHTML = `<div style="color:#f87171;font-size:12px;">${escapeHtml(e.message)}</div>`;
  }
}

/* -- Hash Generator (client-side, Web Crypto API) -- */
function auHashPanel() {
  return `
    <div class="au-card">
      <div class="au-field" style="margin-bottom:14px;"><label>Input Text</label><textarea class="au-textarea" id="auHashInput" oninput="auHashAll()" placeholder="Type or paste text..."></textarea></div>
      <div id="auHashResults"></div>
    </div>`;
}

async function auHashAll() {
  const input = document.getElementById('auHashInput').value;
  const resultsEl = document.getElementById('auHashResults');
  if (!input) { resultsEl.innerHTML = ''; return; }

  const enc = new TextEncoder().encode(input);
  const algos = [['SHA-1', 'SHA-1'], ['SHA-256', 'SHA-256'], ['SHA-384', 'SHA-384'], ['SHA-512', 'SHA-512']];
  const rows = [];
  for (const [label, algo] of algos) {
    const buf = await crypto.subtle.digest(algo, enc);
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    rows.push([label, hex]);
  }
  rows.unshift(['MD5', auMD5(input)]); // Web Crypto has no MD5, use the small local implementation below

  resultsEl.innerHTML = rows.map(([label, hex], i) => `
    <div style="margin-bottom:12px;">
      <div class="au-copy-row"><span class="au-label">${escapeHtml(label)}</span><button class="au-copy-btn" onclick="auCopy('auHashOut${i}')">Copy</button></div>
      <div class="au-result success" id="auHashOut${i}">${escapeHtml(hex)}</div>
    </div>`).join('');
}

// Small dependency-free MD5 implementation (MD5 isn't available via
// Web Crypto since it's cryptographically broken for security use,
// but it's still commonly needed for checksums/legacy comparisons).
function auMD5(str) {
  function rotl(n, s) { return (n << s) | (n >>> (32 - s)); }
  function toHex(n) {
    let s = '';
    for (let i = 0; i < 4; i++) s += ((n >> (i * 8)) & 0xff).toString(16).padStart(2, '0');
    return s;
  }
  const K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32));
  const S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];

  const bytes = new TextEncoder().encode(str);
  const bitLen = bytes.length * 8;
  const withOne = new Uint8Array(((bytes.length + 8) >> 6) * 64 + 64);
  withOne.set(bytes);
  withOne[bytes.length] = 0x80;
  const view = new DataView(withOne.buffer);
  view.setUint32(withOne.length - 8, bitLen >>> 0, true);
  view.setUint32(withOne.length - 4, Math.floor(bitLen / 2 ** 32), true);

  let [a0, b0, c0, d0] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];

  for (let chunk = 0; chunk < withOne.length; chunk += 64) {
    const M = [];
    for (let i = 0; i < 16; i++) M.push(view.getUint32(chunk + i * 4, true));
    let [A, B, C, D] = [a0, b0, c0, d0];
    for (let i = 0; i < 64; i++) {
      let F, g;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }
      F = (F + A + K[i] + M[g]) >>> 0;
      A = D; D = C; C = B;
      B = (B + rotl(F, S[i])) >>> 0;
    }
    a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
  }
  return [a0, b0, c0, d0].map(toHex).join('');
}

/* -- Base64 -- */
function auBase64Panel() {
  return `
    <div class="au-card">
      <div class="au-grid-2">
        <div>
          <div class="au-field" style="margin-bottom:10px;"><label>Encode</label><textarea class="au-textarea" id="auB64EncIn" oninput="auB64Encode()" placeholder="Plain text..."></textarea></div>
          <div class="au-copy-row"><span class="au-label">Base64</span><button class="au-copy-btn" onclick="auCopy('auB64EncOut')">Copy</button></div>
          <div class="au-result empty" id="auB64EncOut">Output appears here...</div>
        </div>
        <div>
          <div class="au-field" style="margin-bottom:10px;"><label>Decode</label><textarea class="au-textarea" id="auB64DecIn" oninput="auB64Decode()" placeholder="Base64 text..."></textarea></div>
          <div class="au-copy-row"><span class="au-label">Plain Text</span><button class="au-copy-btn" onclick="auCopy('auB64DecOut')">Copy</button></div>
          <div class="au-result empty" id="auB64DecOut">Output appears here...</div>
        </div>
      </div>
    </div>`;
}
function auB64Encode() {
  const out = document.getElementById('auB64EncOut');
  const val = document.getElementById('auB64EncIn').value;
  if (!val) { out.textContent = 'Output appears here...'; out.className = 'au-result empty'; return; }
  try {
    out.textContent = btoa(unescape(encodeURIComponent(val)));
    out.className = 'au-result success';
  } catch (e) {
    out.textContent = 'Could not encode this input.';
    out.className = 'au-result error';
  }
}
function auB64Decode() {
  const out = document.getElementById('auB64DecOut');
  const val = document.getElementById('auB64DecIn').value;
  if (!val) { out.textContent = 'Output appears here...'; out.className = 'au-result empty'; return; }
  try {
    out.textContent = decodeURIComponent(escape(atob(val)));
    out.className = 'au-result success';
  } catch (e) {
    out.textContent = 'Invalid Base64 input.';
    out.className = 'au-result error';
  }
}

/* -- URL Encode -- */
function auUrlEncodePanel() {
  return `
    <div class="au-card">
      <div class="au-grid-2">
        <div>
          <div class="au-field" style="margin-bottom:10px;"><label>Encode</label><textarea class="au-textarea" id="auUrlEncIn" oninput="auUrlEncode()" placeholder="Plain text or URL..."></textarea></div>
          <div class="au-copy-row"><span class="au-label">Encoded</span><button class="au-copy-btn" onclick="auCopy('auUrlEncOut')">Copy</button></div>
          <div class="au-result empty" id="auUrlEncOut">Output appears here...</div>
        </div>
        <div>
          <div class="au-field" style="margin-bottom:10px;"><label>Decode</label><textarea class="au-textarea" id="auUrlDecIn" oninput="auUrlDecode()" placeholder="URL-encoded text..."></textarea></div>
          <div class="au-copy-row"><span class="au-label">Decoded</span><button class="au-copy-btn" onclick="auCopy('auUrlDecOut')">Copy</button></div>
          <div class="au-result empty" id="auUrlDecOut">Output appears here...</div>
        </div>
      </div>
    </div>`;
}
function auUrlEncode() {
  const out = document.getElementById('auUrlEncOut');
  const val = document.getElementById('auUrlEncIn').value;
  out.textContent = val ? encodeURIComponent(val) : 'Output appears here...';
  out.className = val ? 'au-result success' : 'au-result empty';
}
function auUrlDecode() {
  const out = document.getElementById('auUrlDecOut');
  const val = document.getElementById('auUrlDecIn').value;
  if (!val) { out.textContent = 'Output appears here...'; out.className = 'au-result empty'; return; }
  try {
    out.textContent = decodeURIComponent(val);
    out.className = 'au-result success';
  } catch (e) {
    out.textContent = 'Invalid encoded input.';
    out.className = 'au-result error';
  }
}

/* -- Subnet Calculator -- */
function auSubnetPanel() {
  return `
    <div class="au-card">
      <div class="au-row">
        <div class="au-field"><label>IP Address / CIDR</label><input class="au-input" id="auSubnetInput" placeholder="e.g. 192.168.1.0/24" oninput="auSubnetCalc()"></div>
      </div>
      <div id="auSubnetResult" class="au-info-grid"></div>
    </div>`;
}
function auSubnetCalc() {
  const input = document.getElementById('auSubnetInput').value.trim();
  const resultEl = document.getElementById('auSubnetResult');
  const match = input.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
  if (!match) { resultEl.innerHTML = ''; return; }

  const octets = match.slice(1, 5).map(Number);
  const prefix = parseInt(match[5], 10);
  if (octets.some(o => o > 255) || prefix > 32) {
    resultEl.innerHTML = `<div style="color:#f87171;font-size:12px;grid-column:1/-1;">Invalid IP or prefix.</div>`;
    return;
  }

  const ipInt = octets.reduce((acc, o) => (acc << 8) + o, 0) >>> 0;
  const maskInt = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;
  const totalHosts = Math.pow(2, 32 - prefix);
  const usableHosts = prefix >= 31 ? totalHosts : Math.max(0, totalHosts - 2);

  const toIp = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');

  const rows = [
    ['Network Address', toIp(networkInt)],
    ['Broadcast Address', toIp(broadcastInt)],
    ['Subnet Mask', toIp(maskInt)],
    ['Wildcard Mask', toIp(~maskInt >>> 0)],
    ['Total Hosts', totalHosts.toLocaleString()],
    ['Usable Hosts', usableHosts.toLocaleString()],
    ['First Usable', prefix >= 31 ? toIp(networkInt) : toIp(networkInt + 1)],
    ['Last Usable', prefix >= 31 ? toIp(broadcastInt) : toIp(broadcastInt - 1)]
  ];
  resultEl.innerHTML = rows.map(([k, v]) => `
    <div class="au-info-item"><div class="au-info-key">${escapeHtml(k)}</div><div class="au-info-val">${escapeHtml(v)}</div></div>`).join('');
}

/* -- CVE Search -- */
function auCvePanel() {
  return `
    <div class="au-card">
      <div class="au-row">
        <div class="au-field"><label>CVE ID or Keyword</label><input class="au-input" id="auCveInput" placeholder="e.g. CVE-2024-1234 or log4j"></div>
        <button class="au-btn" onclick="auCveSearch()">Search</button>
      </div>
      <div id="auCveResult"></div>
    </div>`;
}
async function auCveSearch() {
  const query = document.getElementById('auCveInput').value.trim();
  const resultEl = document.getElementById('auCveResult');
  if (!query) return;
  resultEl.innerHTML = `<div style="color:#8a8a95;font-size:12px;">Searching NVD...</div>`;
  try {
    const data = await auApiCall('cve-search', { query });
    if (!data.found) {
      resultEl.innerHTML = `<div style="color:#f87171;font-size:12px;">${escapeHtml(data.note || 'No results found.')}</div>`;
      return;
    }
    const sevColors = { critical: '#f87171', high: '#fb923c', medium: '#fbbf24', low: '#4ade80', unknown: '#8a8a95', none: '#8a8a95' };
    resultEl.innerHTML = data.results.map(cve => `
      <div style="border-left:2px solid ${sevColors[cve.severity] || '#8a8a95'};padding-left:12px;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;">
          <span style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:#f4f4f5;">${escapeHtml(cve.id)}</span>
          <span style="font-size:10px;letter-spacing:1px;font-weight:700;color:${sevColors[cve.severity]};text-transform:uppercase;">${escapeHtml(cve.severity)}${cve.cvssScore ? ' - ' + cve.cvssScore : ''}</span>
        </div>
        <p style="font-family:'Inter',sans-serif;font-size:12px;color:#ccc;line-height:1.6;margin-bottom:6px;">${escapeHtml(cve.description)}</p>
        <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;">Published: ${escapeHtml(cve.published ? new Date(cve.published).toLocaleDateString() : 'Unknown')}</div>
      </div>`).join('');
  } catch (e) {
    resultEl.innerHTML = `<div style="color:#f87171;font-size:12px;">${escapeHtml(e.message)}</div>`;
  }
}

/* -- MAC Lookup -- */
function auMacPanel() {
  return `
    <div class="au-card">
      <div class="au-row">
        <div class="au-field"><label>MAC Address</label><input class="au-input" id="auMacInput" placeholder="e.g. 00:1A:2B:3C:4D:5E"></div>
        <button class="au-btn" onclick="auMacLookup()">Lookup</button>
      </div>
      <div id="auMacResult" class="au-info-grid"></div>
    </div>`;
}
async function auMacLookup() {
  const mac = document.getElementById('auMacInput').value.trim();
  const resultEl = document.getElementById('auMacResult');
  if (!mac) return;
  resultEl.innerHTML = `<div style="color:#8a8a95;font-size:12px;grid-column:1/-1;">Looking up...</div>`;
  try {
    const data = await auApiCall('mac-lookup', { mac });
    if (!data.valid) {
      resultEl.innerHTML = `<div style="color:#f87171;font-size:12px;grid-column:1/-1;">${escapeHtml(data.note || 'Invalid MAC address.')}</div>`;
      return;
    }
    const rows = [
      ['MAC Address', data.macAddress], ['OUI Prefix', data.ouiPrefix],
      ['Vendor', data.vendor], ['Address Type', data.addressType]
    ];
    resultEl.innerHTML = rows.map(([k, v]) => `
      <div class="au-info-item"><div class="au-info-key">${escapeHtml(k)}</div><div class="au-info-val">${escapeHtml(v)}</div></div>`).join('');
  } catch (e) {
    resultEl.innerHTML = `<div style="color:#f87171;font-size:12px;grid-column:1/-1;">${escapeHtml(e.message)}</div>`;
  }
}

/* -- Password Tools (client-side) -- */
function auPasswordPanel() {
  return `
    <div class="au-card">
      <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:14px;">Generate Password</div>
      <div class="au-row">
        <div class="au-field" style="flex:0 0 140px;min-width:120px;"><label>Length</label><input class="au-input" type="number" id="auPwLength" value="16" min="6" max="64"></div>
        <button class="au-btn" onclick="auGenPassword()">Generate</button>
      </div>
      <div class="au-copy-row"><span class="au-label">Password</span><button class="au-copy-btn" onclick="auCopy('auPwOut')">Copy</button></div>
      <div class="au-result empty" id="auPwOut">Click Generate...</div>
    </div>
    <div class="au-card">
      <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:14px;">Check Password Strength</div>
      <div class="au-field" style="margin-bottom:10px;"><label>Password</label><input class="au-input" type="password" id="auPwCheckInput" oninput="auCheckPassword()" placeholder="Type a password to check..."></div>
      <div id="auPwStrengthBar" class="au-strength-bar" style="background:rgba(255,255,255,0.08);"></div>
      <div id="auPwStrengthLabel" style="font-family:'Inter',sans-serif;font-size:12px;color:#8a8a95;margin-top:8px;"></div>
    </div>`;
}
function auGenPassword() {
  const len = Math.max(6, Math.min(64, parseInt(document.getElementById('auPwLength').value, 10) || 16));
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}';
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  const pw = Array.from(arr, n => chars[n % chars.length]).join('');
  const out = document.getElementById('auPwOut');
  out.textContent = pw;
  out.className = 'au-result success';
}
function auCheckPassword() {
  const pw = document.getElementById('auPwCheckInput').value;
  const bar = document.getElementById('auPwStrengthBar');
  const label = document.getElementById('auPwStrengthLabel');
  if (!pw) { bar.style.width = '0%'; label.textContent = ''; return; }

  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { pct: 20, color: '#f87171', text: 'Very weak' },
    { pct: 40, color: '#fb923c', text: 'Weak' },
    { pct: 60, color: '#fbbf24', text: 'Fair' },
    { pct: 80, color: '#4ade80', text: 'Strong' },
    { pct: 100, color: '#22c55e', text: 'Very strong' }
  ];
  const level = levels[Math.min(score, 4)];
  bar.style.width = level.pct + '%';
  bar.style.background = level.color;
  label.textContent = level.text;
  label.style.color = level.color;
}

/* -- JWT Decoder (client-side, decode only - no signature verification) -- */
function auJwtPanel() {
  return `
    <div class="au-card">
      <div class="au-field" style="margin-bottom:14px;"><label>JWT Token</label><textarea class="au-textarea" id="auJwtInput" oninput="auDecodeJWT()" placeholder="Paste a JWT (header.payload.signature)..."></textarea></div>
      <div id="auJwtResult"></div>
      <p style="font-family:'Inter',sans-serif;font-size:11px;color:#555;margin-top:8px;">This only decodes the token - it does not verify the signature.</p>
    </div>`;
}
function auDecodeJWT() {
  const token = document.getElementById('auJwtInput').value.trim();
  const resultEl = document.getElementById('auJwtResult');
  if (!token) { resultEl.innerHTML = ''; return; }
  const parts = token.split('.');
  if (parts.length < 2) {
    resultEl.innerHTML = `<div style="color:#f87171;font-size:12px;">Not a valid JWT format.</div>`;
    return;
  }
  try {
    const decode = (part) => JSON.stringify(JSON.parse(decodeURIComponent(escape(atob(part.replace(/-/g, '+').replace(/_/g, '/'))))), null, 2);
    const header = decode(parts[0]);
    const payload = decode(parts[1]);
    resultEl.innerHTML = `
      <div style="margin-bottom:12px;"><div class="au-label" style="margin-bottom:6px;">Header</div><div class="au-result success">${escapeHtml(header)}</div></div>
      <div><div class="au-label" style="margin-bottom:6px;">Payload</div><div class="au-result success">${escapeHtml(payload)}</div></div>`;
  } catch (e) {
    resultEl.innerHTML = `<div style="color:#f87171;font-size:12px;">Could not decode this token.</div>`;
  }
}

/* -- Regex Tester -- */
function auRegexPanel() {
  return `
    <div class="au-card">
      <div class="au-row">
        <div class="au-field"><label>Pattern</label><input class="au-input" id="auRegexPattern" oninput="auRegexTest()" placeholder="e.g. \\d{3}-\\d{4}"></div>
        <div class="au-field" style="flex:0 0 100px;min-width:80px;"><label>Flags</label><input class="au-input" id="auRegexFlags" oninput="auRegexTest()" placeholder="gi" value="g"></div>
      </div>
      <div class="au-field" style="margin-bottom:14px;"><label>Test String</label><textarea class="au-textarea" id="auRegexTestStr" oninput="auRegexTest()" placeholder="Text to test against..."></textarea></div>
      <div id="auRegexResult" class="au-result empty">Matches will appear here...</div>
    </div>`;
}
function auRegexTest() {
  const pattern = document.getElementById('auRegexPattern').value;
  const flags = document.getElementById('auRegexFlags').value;
  const testStr = document.getElementById('auRegexTestStr').value;
  const resultEl = document.getElementById('auRegexResult');
  if (!pattern || !testStr) { resultEl.textContent = 'Matches will appear here...'; resultEl.className = 'au-result empty'; return; }
  try {
    const re = new RegExp(pattern, flags);
    const matches = [...testStr.matchAll(re)];
    if (!matches.length) {
      resultEl.textContent = 'No matches found.';
      resultEl.className = 'au-result';
      return;
    }
    resultEl.textContent = matches.map((m, i) => `Match ${i + 1}: "${m[0]}" at index ${m.index}`).join('\n');
    resultEl.className = 'au-result success';
  } catch (e) {
    resultEl.textContent = 'Invalid regex: ' + e.message;
    resultEl.className = 'au-result error';
  }
}

/* -- JSON Formatter -- */
function auJsonPanel() {
  return `
    <div class="au-card">
      <div class="au-field" style="margin-bottom:14px;"><label>JSON Input</label><textarea class="au-textarea" id="auJsonInput" placeholder='{"key": "value"}' style="min-height:140px;"></textarea></div>
      <div class="au-row" style="margin-bottom:0;">
        <button class="au-btn" onclick="auFormatJSON()">Format</button>
        <button class="au-btn" style="background:rgba(255,255,255,0.06);" onclick="auMinifyJSON()">Minify</button>
      </div>
      <div class="au-copy-row"><span class="au-label">Output</span><button class="au-copy-btn" onclick="auCopy('auJsonOutput')">Copy</button></div>
      <div class="au-result empty" id="auJsonOutput">Output appears here...</div>
    </div>`;
}
function auFormatJSON() {
  const input = document.getElementById('auJsonInput').value;
  const out = document.getElementById('auJsonOutput');
  try {
    out.textContent = JSON.stringify(JSON.parse(input), null, 2);
    out.className = 'au-result success';
  } catch (e) {
    out.textContent = 'Invalid JSON: ' + e.message;
    out.className = 'au-result error';
  }
}
function auMinifyJSON() {
  const input = document.getElementById('auJsonInput').value;
  const out = document.getElementById('auJsonOutput');
  try {
    out.textContent = JSON.stringify(JSON.parse(input));
    out.className = 'au-result success';
  } catch (e) {
    out.textContent = 'Invalid JSON: ' + e.message;
    out.className = 'au-result error';
  }
}

/* -- UUID Generator -- */
function auUuidPanel() {
  return `
    <div class="au-card">
      <div class="au-row">
        <div class="au-field" style="flex:0 0 140px;min-width:120px;"><label>Count</label><input class="au-input" type="number" id="auUuidCount" value="1" min="1" max="50"></div>
        <button class="au-btn" onclick="auGenUUID()">Generate</button>
      </div>
      <div class="au-copy-row"><span class="au-label">Output</span><button class="au-copy-btn" onclick="auCopy('auUuidOutput')">Copy</button></div>
      <div class="au-result empty" id="auUuidOutput">Click Generate...</div>
    </div>`;
}
function auGenUUID() {
  const count = Math.max(1, Math.min(50, parseInt(document.getElementById('auUuidCount').value, 10) || 1));
  const uuids = Array.from({ length: count }, () => crypto.randomUUID());
  const out = document.getElementById('auUuidOutput');
  out.textContent = uuids.join('\n');
  out.className = 'au-result success';
}

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
  if (_atInitialized) return;
  _atInitialized = true;

  const tabsEl = document.getElementById('atTabs');
  const panelsEl = document.getElementById('atPanels');
  if (!tabsEl || !panelsEl) return;

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
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="#dc1414" stroke-width="1.2"/><path d="M13.5 13.5 17.5 17.5" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/></svg>
        Check your exposure
      </div>
      <div class="at-card-sub">Enter a username and/or email. AlexTrace checks 25+ platforms and known data breaches.</div>
      <div class="at-input-row">
        <div class="at-field"><label>Username</label><input class="at-input" id="atUsernameInput" placeholder="e.g. alexcyberx" autocomplete="off"></div>
        <div class="at-field"><label>Email (optional)</label><input class="at-input" id="atEmailInput" placeholder="e.g. you@example.com" autocomplete="off"></div>
        <button class="at-btn" id="atLookupBtn" onclick="atRunLookup()">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="#fff" stroke-width="1.4"/><path d="M13.5 13.5 17.5 17.5" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></svg>
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
        <span class="badge at-level-${cat.level}" style="background:rgba(255,255,255,0.06);">${atLevelLabel(cat.level)}</span>
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
        <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M10 13V4M6 8l4-4 4 4" stroke="#ccc" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.5 13.5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2" stroke="#ccc" stroke-width="1.3" stroke-linecap="round"/></svg>
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
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><circle cx="6" cy="6" r="2" stroke="#dc1414" stroke-width="1.2"/><circle cx="14" cy="14" r="2" stroke="#dc1414" stroke-width="1.2"/><path d="M7.5 7.5 12.5 12.5" stroke="#dc1414" stroke-width="1.2"/></svg>
          Identity Correlation
        </div>
        <div class="at-card-sub">How easily these findings link back to one identity (confidence: ${report.correlation.confidence}%)</div>
        ${report.correlation.signals.map(s => `<div class="at-signal"><svg width="13" height="13" viewBox="0 0 20 20" fill="none" style="flex-shrink:0;margin-top:3px;"><circle cx="10" cy="10" r="8" stroke="#8a8a95" stroke-width="1.2"/></svg>${escapeHtml(s)}</div>`).join('')}
      </div>`);
  }

  if (data.deepCorrelation && data.deepCorrelation.attempted) {
    const dc = data.deepCorrelation;
    parts.push(`
      <div class="at-card">
        <div class="at-card-title">
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M4 10h5M11 10h5M9 5l2 10" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/></svg>
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
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="2" stroke="#dc1414" stroke-width="1.2"/></svg>
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
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="4" width="15" height="12" rx="2" stroke="#dc1414" stroke-width="1.2"/><path d="M3 5.5 10 11l7-5.5" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/></svg>
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
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M10 3 3 17h14L10 3Z" stroke="#dc1414" stroke-width="1.2" stroke-linejoin="round"/><path d="M10 8.5v3.5" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/><circle cx="10" cy="14.2" r="0.6" fill="#dc1414"/></svg>
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
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M10 3 3 17h14L10 3Z" stroke="#dc1414" stroke-width="1.2" stroke-linejoin="round"/><path d="M10 8.5v3.5" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/><circle cx="10" cy="14.2" r="0.6" fill="#dc1414"/></svg>
        Was this service ever breached?
      </div>
      <div class="at-card-sub">Type a platform or company name (e.g. "Canva", "LinkedIn") to check known public breaches, when they happened, and what data was exposed.</div>
      <div class="at-input-row">
        <div class="at-field"><label>Service name</label><input class="at-input" id="atBreachInput" placeholder="e.g. Canva" autocomplete="off" onkeydown="if(event.key==='Enter')atRunBreachSearch()"></div>
        <button class="at-btn" id="atBreachBtn" onclick="atRunBreachSearch()">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="#fff" stroke-width="1.4"/><path d="M13.5 13.5 17.5 17.5" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></svg>
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
          <span style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;">${escapeHtml(b.title || b.name)}</span>
          ${b.breachDate ? `<span style="font-size:11px;color:#8a8a95;font-family:'Inter',sans-serif;">${escapeHtml(b.breachDate)}</span>` : ''}
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
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><rect x="4.5" y="9" width="11" height="8" rx="1.5" stroke="#dc1414" stroke-width="1.2"/><path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" stroke="#dc1414" stroke-width="1.2"/></svg>
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
          <p>Estimated time to crack offline: <strong style="color:#f4f4f5;">${escapeHtml(a.estimatedCrackTime)}</strong> (${a.length} characters, ${a.effectiveEntropyBits} bits of effective entropy)</p>
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
          ${a.suggestions.map(s => `<li><svg width="13" height="13" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#8a8a95" stroke-width="1.2"/></svg>${escapeHtml(s)}</li>`).join('')}
        </ul>
      </div>
    </div>`;
}

/* ── Metadata (EXIF) panel ────────────────────────────────── */
function atMetadataPanel() {
  return `
    <div class="at-card">
      <div class="at-card-title">
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="4" width="15" height="12" rx="2" stroke="#dc1414" stroke-width="1.2"/><circle cx="7.5" cy="9" r="1.5" stroke="#dc1414" stroke-width="1.1"/><path d="M4 15l4-4 3 3 2.5-2.5L16 15" stroke="#dc1414" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Check a photo before you post it
      </div>
      <div class="at-card-sub">See what hidden data (GPS location, device, timestamp) is embedded in an image. Nothing is uploaded to storage, it's checked and discarded.</div>
      <div class="at-dropzone" id="atDropzone" onclick="document.getElementById('atFileInput').click()">
        <svg width="30" height="30" viewBox="0 0 20 20" fill="none" style="margin:0 auto;display:block;"><path d="M10 13V4M6 8l4-4 4 4" stroke="#8a8a95" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.5 13.5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2" stroke="#8a8a95" stroke-width="1.3" stroke-linecap="round"/></svg>
        <p id="atDropzoneText">Click to choose a photo, or drag one here</p>
        <input type="file" id="atFileInput" accept="image/*" style="display:none;" onchange="atOnFileSelected(this.files)">
      </div>
      <div style="margin-top:14px;">
        <button class="at-btn" id="atMetadataBtn" onclick="atRunMetadataCheck()" disabled>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="#fff" stroke-width="1.4"/><path d="M13.5 13.5 17.5 17.5" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></svg>
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
document.addEventListener('DOMContentLoaded', () => {
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
});

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
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M10 3 3 17h14L10 3Z" stroke="#dc1414" stroke-width="1.2" stroke-linejoin="round"/></svg>
          What to do next
        </div>
        <ul class="at-actions-list">
          ${report.actionItems.map(a => `<li><svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M4 10.5 8 14.5 16 5.5" stroke="#4ade80" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>`;
}


async function handleAlexSyncPayment() {
  const payBtn = document.getElementById('asPayBtn');
  const statusText = document.getElementById('asAccessStatusText');

  if (!window._currentUser) {
    showAuth('login', 'alexsync');
    return;
  }
  if (typeof Cashfree === 'undefined') {
    statusText.textContent = 'Payment could not load. Please check your connection and try again.';
    return;
  }

  payBtn.disabled = true;
  const originalLabel = payBtn.textContent;
  payBtn.textContent = 'Loading...';

  try {
    // FIX: create-order previously trusted whatever userId was in the
    // request body with no way to check it was really this browser's
    // logged-in user. Sending the Supabase access token lets the server
    // verify the real account (see resolveVerifiedUserId in
    // server/payments/alexsync/routes.js) instead of just taking our word
    // for window._currentUser.id.
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session?.access_token) {
      statusText.textContent = 'Your session has expired. Please log in again.';
      payBtn.disabled = false;
      payBtn.textContent = originalLabel;
      return;
    }

    const orderRes = await fetch('/api/alexsync/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        userId: window._currentUser.id,
        email: window._currentUser.email || undefined
      })
    });
    if (!orderRes.ok) throw new Error('Order creation failed');
    const order = await orderRes.json();

    // window._cashfreeMode is set in config.js, "sandbox" while testing,
    // "production" once live keys are in use.
    const cashfree = Cashfree({ mode: window._cashfreeMode || 'production' });

    // Redirect checkout: the browser navigates away to Cashfree's hosted
    // page and comes back to our return_url (configured server-side in
    // create-order) once the payment finishes. Nothing more happens in
    // this function, confirmation is handled by asCheckPendingRedirect()
    // on page load, see below.
    await cashfree.checkout({
      paymentSessionId: order.paymentSessionId,
      redirectTarget: '_self'
    });
  } catch (e) {
    console.error('AlexSync: payment init failed', e);
    statusText.textContent = 'Could not start payment. Please try again.';
    payBtn.disabled = false;
    payBtn.textContent = originalLabel;
  }
}

// Called once on page load. If the user just came back from Cashfree's
// hosted checkout, the return_url will have ?alexsync_order_id=... in
// it (see order_meta.return_url in create-order). Ask our backend to
// confirm the real status with Cashfree's API (server-to-server) rather
// than trusting anything from the URL itself.
async function asCheckPendingRedirect() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('alexsync_order_id');
  if (!orderId) return;

  // Clean the URL so a page refresh doesn't re-trigger this
  params.delete('alexsync_order_id');
  const cleanUrl = window.location.pathname + (params.toString() ? `?${params}` : '') + window.location.hash;
  window.history.replaceState({}, '', cleanUrl);

  const statusText = document.getElementById('asAccessStatusText');
  if (statusText) statusText.textContent = 'Confirming your payment...';

  try {
    const userId = window._currentUser ? window._currentUser.id : '';
    const res = await fetch(`/api/alexsync/confirm-order?orderId=${encodeURIComponent(orderId)}&userId=${encodeURIComponent(userId)}`);
    const result = await res.json();
    if (result.status === 'success') {
      asPollForAccess();
    } else if (result.status === 'failed') {
      if (statusText) statusText.textContent = 'Payment failed. Please try again.';
    } else {
      // still pending on Cashfree's side, poll a few times
      asPollForAccess();
    }
  } catch (e) {
    console.error('AlexSync: confirm-order call failed', e);
    if (statusText) statusText.textContent = 'Could not confirm payment. Please refresh in a minute.';
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', asCheckPendingRedirect);
} else {
  asCheckPendingRedirect();
}

// Webhooks can take a few seconds to arrive. Poll get_alexsync_access a
// handful of times so the access card updates itself once confirmed,
// instead of leaving the user staring at a stale "no access" state.
async function asPollForAccess(attempt) {
  attempt = attempt || 0;
  await asRefreshAccessCard();
  const sb = window._supabase;
  if (!sb) return;
  const { data } = await sb.rpc('get_alexsync_access');
  const row = Array.isArray(data) ? data[0] : data;
  if (row && row.has_access) {
    const payBtn = document.getElementById('asPayBtn');
    if (payBtn) payBtn.disabled = false;
    return;
  }
  if (attempt < 8) { // ~24s max wait (8 * 3s)
    setTimeout(() => asPollForAccess(attempt + 1), 3000);
  } else {
    const statusText = document.getElementById('asAccessStatusText');
    if (statusText) statusText.textContent = 'Payment is taking longer than expected to confirm. Please refresh in a minute.';
  }
}

async function handleAlexSyncSave() {
  const sb = window._supabase;
  const msgEl = document.getElementById('asSaveMsg');
  const time = asGetWakeTime24h();
  const days = Array.from(document.querySelectorAll('.as-day-pill input:checked')).map(el => parseInt(el.value, 10));
  const platform = asGetAppValue();
  const genre = asSelectedGenreValue;
  const pcState = document.querySelector('input[name="asPcState"]:checked').value;

  if (days.length === 0) { msgEl.textContent = 'Please select at least one day.'; return; }
  if (!sb) { msgEl.textContent = 'Could not connect. Please try again.'; return; }

  const saveBtn = document.getElementById('asSaveBtn');
  if (saveBtn) { saveBtn.disabled = true; }
  msgEl.textContent = 'Saving...';

  try {
    const { error } = await sb.rpc('save_alexsync_schedule', {
      p_wake_time: time + ':00',
      p_days_of_week: days,
      p_platform: platform,
      p_genre: genre,
      p_pc_state: pcState,
      p_mac_address: null // Phase 2: collect this when pc_state === 'shutdown'
    });
    if (error) throw error;
    msgEl.textContent = 'Schedule saved.';
  } catch (e) {
    console.error('AlexSync: save failed', e);
    msgEl.textContent = e.message && e.message.includes('access has expired')
      ? 'Your AlexSync access has expired. Please renew to save changes.'
      : 'Could not save your schedule. Please try again.';
  } finally {
    if (saveBtn) { saveBtn.disabled = false; }
    setTimeout(() => { msgEl.textContent = ''; }, 4000);
  }
}



/* ═══════════════════════════════════════════
   SAFE SHIMS for lazy-loaded chapter functions
   Sidebar onclicks fire before chapters.js / chapters2.js are loaded.
   These shims queue calls and replay them once scripts are ready.
═══════════════════════════════════════════ */
(function() {
  // ── loadChapter shim (Network Forensics - chapters.js) ──
  var _q1 = null;
  window.loadChapter = function(index) {
    if (window.loadChapter._real) {
      window.loadChapter._real(index);
    } else {
      _q1 = index;
      // Chapter content used to live inline inside chapters.js; it's now split
      // into small per-chapter files (js/chapter-content/forensics-NN.js) that
      // each just set a window.chapterContentNN string. Load all of them plus
      // chapters.js itself before running the real function, so those globals
      // already exist when it reads them.
      var _forensicsChapterIndices = [0,1,2,3,4,5,6,7,8,9,10,12,13,14,15,16,17,18,19,20,21,22,23,24];
      var _forensicsContentUrls = _forensicsChapterIndices.map(function(n) {
        return '/js/chapter-content/forensics-' + String(n).padStart(2, '0') + '.js';
      });
      Promise.all(_forensicsContentUrls.concat(['/js/chapters.js']).map(loadScriptOnce)).then(function() {
        if (window.loadChapter._real && _q1 !== null) {
          window.loadChapter._real(_q1);
          _q1 = null;
        }
      });
    }
  };
  window.loadChapter._real = null; // set by chapters.js after load

  // ── loadCyberChapter shim (Cyber Attacks - chapters2.js) ──
  var _q2 = null;
  window.loadCyberChapter = function(index) {
    if (window.loadCyberChapter._real) {
      window.loadCyberChapter._real(index);
    } else {
      _q2 = index;
      loadScriptOnce('/js/chapters2.js').then(function() {
        if (window.loadCyberChapter._real && _q2 !== null) {
          window.loadCyberChapter._real(_q2);
          _q2 = null;
        }
      });
    }
  };
  window.loadCyberChapter._real = null; // set by chapters2.js after load

  // ── loadEthicalChapter shim (Ethical Hacking - chapters3.js) ──
  var _q3 = null;
  window.loadEthicalChapter = function(index) {
    if (window.loadEthicalChapter._real) {
      window.loadEthicalChapter._real(index);
    } else {
      _q3 = index;
      loadScriptOnce('/js/chapters3.js').then(function() {
        if (window.loadEthicalChapter._real && _q3 !== null) {
          window.loadEthicalChapter._real(_q3);
          _q3 = null;
        }
      });
    }
  };
  window.loadEthicalChapter._real = null; // set by chapters3.js after load
})();
