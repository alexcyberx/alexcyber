/* AlexUtils (frontend). Moved out of js/page-scripts.js so the Next page
   web/src/app/tools/alexutils can load the same code (components/LegacyTool.tsx).
   Needs escapeHtml(), window._currentUser and the /api auth-header fetch
   wrapper: js/page-scripts.js provides them on the old SPA, the LegacyTool
   bridge on the Next page. */

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
  const tabsEl = document.getElementById('auTabs');
  const panelsEl = document.getElementById('auPanels');
  if (!tabsEl || !panelsEl) return;
  // Tabs/panels only need to be built once per page markup (the Next page
  // renders a fresh, empty #auTabs when the visitor comes back to it).
  if (_auInitialized && tabsEl.children.length) return;
  _auInitialized = true;

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
      <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:var(--fg-1);margin-bottom:14px;">IP Lookup</div>
      <div class="au-row">
        <div class="au-field"><label>IP Address or Domain</label><input class="au-input" id="auIpInput" placeholder="e.g. 8.8.8.8 or google.com"></div>
        <button class="au-btn" onclick="auIpLookup()">Lookup</button>
      </div>
      <div id="auIpResult" class="au-info-grid"></div>
    </div>
    <div class="au-card">
      <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:var(--fg-1);margin-bottom:14px;">DNS Resolver</div>
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
  resultEl.innerHTML = `<div style="color:var(--fg-3);font-size:12px;">Looking up...</div>`;
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
  resultEl.innerHTML = `<div style="color:var(--fg-3);font-size:12px;">Checking certificate...</div>`;
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
  resultEl.innerHTML = `<div style="color:var(--fg-3);font-size:12px;">Searching NVD...</div>`;
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
          <span style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:var(--fg-1);">${escapeHtml(cve.id)}</span>
          <span style="font-size:10px;letter-spacing:1px;font-weight:700;color:${sevColors[cve.severity]};text-transform:uppercase;">${escapeHtml(cve.severity)}${cve.cvssScore ? ' - ' + cve.cvssScore : ''}</span>
        </div>
        <p style="font-family:'Inter',sans-serif;font-size:12px;color:var(--fg-2);line-height:1.6;margin-bottom:6px;">${escapeHtml(cve.description)}</p>
        <div style="font-family:'Inter',sans-serif;font-size:11px;color:var(--fg-4);">Published: ${escapeHtml(cve.published ? new Date(cve.published).toLocaleDateString() : 'Unknown')}</div>
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
  resultEl.innerHTML = `<div style="color:var(--fg-3);font-size:12px;grid-column:1/-1;">Looking up...</div>`;
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
      <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:var(--fg-1);margin-bottom:14px;">Generate Password</div>
      <div class="au-row">
        <div class="au-field" style="flex:0 0 140px;min-width:120px;"><label>Length</label><input class="au-input" type="number" id="auPwLength" value="16" min="6" max="64"></div>
        <button class="au-btn" onclick="auGenPassword()">Generate</button>
      </div>
      <div class="au-copy-row"><span class="au-label">Password</span><button class="au-copy-btn" onclick="auCopy('auPwOut')">Copy</button></div>
      <div class="au-result empty" id="auPwOut">Click Generate...</div>
    </div>
    <div class="au-card">
      <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:var(--fg-1);margin-bottom:14px;">Check Password Strength</div>
      <div class="au-field" style="margin-bottom:10px;"><label>Password</label><input class="au-input" type="password" id="auPwCheckInput" oninput="auCheckPassword()" placeholder="Type a password to check..."></div>
      <div id="auPwStrengthBar" class="au-strength-bar" style="background:rgba(var(--fg-rgb),0.08);"></div>
      <div id="auPwStrengthLabel" style="font-family:'Inter',sans-serif;font-size:12px;color:var(--fg-3);margin-top:8px;"></div>
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
      <p style="font-family:'Inter',sans-serif;font-size:11px;color:var(--fg-4);margin-top:8px;">This only decodes the token - it does not verify the signature.</p>
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
        <button class="au-btn" style="background:rgba(var(--fg-rgb),0.06);" onclick="auMinifyJSON()">Minify</button>
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
