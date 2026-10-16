/* AlexRecon (frontend). Moved out of js/page-scripts.js so the Next page
   web/src/app/tools/alexrecon can load the same code (components/LegacyTool.tsx).
   Needs escapeHtml(), window._currentUser and the /api auth-header fetch
   wrapper: js/page-scripts.js provides them on the old SPA, the LegacyTool
   bridge on the Next page. */

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
    status.style.color = '#ef4444';
    return;
  }
  if (!window._currentUser) {
    status.textContent = 'Please log in to run a scan.';
    status.style.color = '#ef4444';
    return;
  }

  btn.disabled = true;
  btn.style.opacity = '0.6';
  status.textContent = 'Running recon, this can take up to a minute...';
  status.style.color = 'var(--fg-3)';
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
      status.style.color = '#ef4444';
      return;
    }

    status.textContent = '';
    renderReconReport(data);
    arLoadHistory();
  } catch (e) {
    console.error('AlexRecon error:', e);
    status.textContent = 'Network error. Please try again.';
    status.style.color = '#ef4444';
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
    ? `<p style="font-family:'Inter',sans-serif;font-size:12px;color:var(--fg-4);line-height:1.7;">Unavailable: ${escapeHtml(unavailableNote)}</p>`
    : innerHtml;
  return `
    <details class="ar-section" style="background:rgba(var(--fg-rgb),0.02);border:1px solid rgba(var(--fg-rgb),0.08);border-radius:12px;padding:14px 16px;margin-bottom:10px;">
      <summary style="cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:var(--fg-1);list-style:none;">${escapeHtml(title)}</summary>
      <div style="margin-top:12px;">${body}</div>
    </details>`;
}

function arKeyValueList(pairs) {
  const rows = pairs.filter(([, v]) => v !== null && v !== undefined && v !== '');
  if (!rows.length) return `<p style="font-family:'Inter',sans-serif;font-size:12px;color:var(--fg-4);">No data.</p>`;
  return `<div style="display:flex;flex-direction:column;gap:6px;">${rows.map(([k, v]) => `
    <div style="display:flex;gap:10px;font-family:'Inter',sans-serif;font-size:12px;">
      <span style="color:var(--fg-3);min-width:140px;flex-shrink:0;">${escapeHtml(k)}</span>
      <span style="color:var(--fg-2);word-break:break-all;">${escapeHtml(typeof v === 'object' ? JSON.stringify(v) : String(v))}</span>
    </div>`).join('')}</div>`;
}

function arChipList(items) {
  if (!items || !items.length) return `<p style="font-family:'Inter',sans-serif;font-size:12px;color:var(--fg-4);">None found.</p>`;
  return `<div style="display:flex;flex-wrap:wrap;gap:6px;">${items.map(i => `
    <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--fg-2);background:rgba(var(--fg-rgb),0.04);border:1px solid rgba(var(--fg-rgb),0.08);padding:4px 9px;border-radius:6px;">${escapeHtml(i)}</span>`).join('')}</div>`;
}

function renderReconReport(data) {
  const report = document.getElementById('arReport');
  const exportBar = document.getElementById('arExportBar');
  window._arCurrentReport = data; // used by export functions
  const m = data.modules || {};

  let html = `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:16px;">
      <div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:var(--fg-1);">${escapeHtml(data.target)}</div>
        <div style="font-family:'Inter',sans-serif;font-size:11px;color:var(--fg-3);">Scanned in ${(data.scanDurationMs / 1000).toFixed(1)}s</div>
      </div>
      ${arStatusBadge(data.status)}
    </div>
    <div class="ar-section-grid">`;

  // DNS
  if (m.dns) {
    const d = m.dns.data || {};
    html += arSectionCard(AR_MODULE_LABELS.dns, `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div><div style="font-size:11px;color:var(--fg-3);margin-bottom:6px;">A / AAAA</div>${arChipList([...(d.a || []), ...(d.aaaa || [])])}</div>
        <div><div style="font-size:11px;color:var(--fg-3);margin-bottom:6px;">NS</div>${arChipList(d.ns)}</div>
        <div><div style="font-size:11px;color:var(--fg-3);margin-bottom:6px;">MX</div>${arChipList((d.mx || []).map(x => `${x.exchange} (${x.priority})`))}</div>
        <div><div style="font-size:11px;color:var(--fg-3);margin-bottom:6px;">SPF</div>${arChipList(d.spf)}</div>
        <div><div style="font-size:11px;color:var(--fg-3);margin-bottom:6px;">DMARC</div>${arChipList(d.dmarc)}</div>
        <div><div style="font-size:11px;color:var(--fg-3);margin-bottom:6px;">DKIM selectors found</div>${arChipList((d.dkim || []).map(x => x.selector))}</div>
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
    ]) : `<p style="font-family:'Inter',sans-serif;font-size:12px;color:var(--fg-4);">${escapeHtml(s.note || 'Not available.')}</p>`, m.ssl.ok ? null : m.ssl.error);
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
        <div><div style="font-size:11px;color:var(--fg-3);margin-bottom:6px;">Detected Tech Stack</div>${arChipList((w.techStack || []).map(t => `${t.name} (${t.type})`))}</div>
        <div><div style="font-size:11px;color:#fbbf24;margin-bottom:6px;">Missing Security Headers</div>${arChipList(w.riskIndicators && w.riskIndicators.missingSecurityHeaders)}</div>
        <div><div style="font-size:11px;color:#4ade80;margin-bottom:6px;">Present Security Headers</div>${arChipList(w.riskIndicators && w.riskIndicators.presentSecurityHeaders)}</div>
        ${w.riskIndicators && w.riskIndicators.corsRisk ? `<p style="font-family:'Inter',sans-serif;font-size:12px;color:#fbbf24;">${escapeHtml(w.riskIndicators.corsRisk)}</p>` : ''}
      </div>` : `<p style="font-family:'Inter',sans-serif;font-size:12px;color:var(--fg-4);">${escapeHtml(w.note || 'Host not reachable.')}</p>`, m.webRecon.ok ? null : m.webRecon.error);
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
    html += arSectionCard(AR_MODULE_LABELS.asnCidr, a.available ? arChipList((a.prefixes || []).map(p => `${p.cidr}, AS${p.asn} ${p.asnName || ''}`)) : `<p style="font-family:'Inter',sans-serif;font-size:12px;color:var(--fg-4);">${escapeHtml(a.note || 'Not available.')}</p>`, m.asnCidr.ok ? null : m.asnCidr.error);
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
      <div style="border-left:2px solid rgba(var(--accent-rgb),0.33);padding-left:10px;margin-bottom:10px;">
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--fg-3);word-break:break-all;">${escapeHtml(f.file)}</div>
        ${f.possibleFindings && f.possibleFindings.length ? `<div style="margin-top:4px;">${arChipList(f.possibleFindings.map(pf => `${pf.type} x${pf.matchCount}`))}</div>` : ''}
        ${f.endpointsFound && f.endpointsFound.length ? `<div style="margin-top:4px;">${arChipList(f.endpointsFound)}</div>` : ''}
      </div>`).join('');
    html += arSectionCard(AR_MODULE_LABELS.jsRecon, `
      <div>
        ${arKeyValueList([['Files Discovered', js.filesDiscovered], ['Files Analyzed', js.filesAnalyzed]])}
        <div style="margin-top:10px;">${findingsHtml || '<p style="font-family:\'Inter\',sans-serif;font-size:12px;color:var(--fg-4);">No JS files analyzed.</p>'}</div>
        <p style="font-family:'Inter',sans-serif;font-size:11px;color:var(--fg-4);margin-top:10px;">${escapeHtml(js.disclaimer || '')}</p>
      </div>`, m.jsRecon.ok ? null : m.jsRecon.error);
  }

  // Cloud discovery
  if (m.cloudDiscovery) {
    const cd = m.cloudDiscovery.data || {};
    html += arSectionCard(AR_MODULE_LABELS.cloudDiscovery, `
      <div>
        ${arChipList((cd.s3Buckets || []).map(b => `${b.bucket} (${b.status})`))}
        ${cd.firebase ? `<p style="font-family:'Inter',sans-serif;font-size:12px;color:var(--fg-2);margin-top:8px;">Firebase: ${escapeHtml(cd.firebase.project)}, ${escapeHtml(cd.firebase.note)}</p>` : ''}
        <p style="font-family:'Inter',sans-serif;font-size:11px;color:var(--fg-4);margin-top:8px;">${escapeHtml(cd.disclaimer || '')}</p>
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
        <div style="margin-top:8px;"><div style="font-size:11px;color:var(--fg-3);margin-bottom:6px;">Public Members</div>${arChipList(g.publicMembers)}</div>
      </div>` : `<p style="font-family:'Inter',sans-serif;font-size:12px;color:var(--fg-4);">${escapeHtml(g.note || 'No matching org found.')}</p>`, m.githubOrgIntel.ok ? null : m.githubOrgIntel.error);
  }

  // Common ports
  if (m.commonPortCheck) {
    const p = m.commonPortCheck.data || {};
    html += arSectionCard(AR_MODULE_LABELS.commonPortCheck, `
      <div>
        ${arChipList((p.openPorts || []).map(x => `${x.port}/${x.service}`))}
        <p style="font-family:'Inter',sans-serif;font-size:11px;color:var(--fg-4);margin-top:8px;">${escapeHtml(p.disclaimer || '')}</p>
      </div>`, m.commonPortCheck.ok ? null : m.commonPortCheck.error);
  }

  html += `</div>`; // close .ar-section-grid

  // Coming soon
  if (data.comingSoon && data.comingSoon.length) {
    html += `<div style="margin-top:20px;">
      <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:var(--fg-4);margin-bottom:10px;">COMING SOON</div>
      ${data.comingSoon.map(cs => `
        <div style="opacity:0.5;background:rgba(var(--fg-rgb),0.01);border:1px dashed rgba(var(--fg-rgb),0.1);border-radius:10px;padding:10px 14px;margin-bottom:8px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:var(--fg-3);">${escapeHtml(cs.label)}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:var(--fg-4);">${escapeHtml(cs.reason)}</div>
        </div>`).join('')}
    </div>`;
  }

  html += `<p style="font-family:'Inter',sans-serif;font-size:11px;color:var(--fg-4);line-height:1.6;margin-top:20px;">${escapeHtml(data.disclaimer || '')}</p>`;

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
      historyBox.innerHTML = `<p style="font-family:'Inter',sans-serif;font-size:12px;color:var(--fg-4);">No scan history yet.</p>`;
      return;
    }
    if (!data.scans.length) {
      historyBox.innerHTML = `<p style="font-family:'Inter',sans-serif;font-size:12px;color:var(--fg-4);">No scans yet. Run your first scan above.</p>`;
      return;
    }

    const statusColors = { completed: '#4ade80', partial: '#fbbf24', failed: '#f87171', running: '#8a8a95' };
    historyBox.innerHTML = data.scans.map(s => {
      const c = statusColors[s.status] || '#8a8a95';
      const when = new Date(s.started_at).toLocaleString();
      return `
        <div onclick="arLoadScanFromHistory('${s.id}')" style="cursor:pointer;background:rgba(var(--fg-rgb),0.02);border:1px solid rgba(var(--fg-rgb),0.08);border-radius:10px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--fg-1);">${escapeHtml(s.target)}</div>
            <div style="font-family:'Inter',sans-serif;font-size:11px;color:var(--fg-4);">${escapeHtml(when)}</div>
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
  status.style.color = 'var(--fg-3)';
  try {
    const res = await fetch(`/api/alexrecon/scan/${encodeURIComponent(scanId)}?userId=${encodeURIComponent(window._currentUser.id)}`);
    const data = await res.json();
    if (!res.ok) {
      status.textContent = data.error || 'Could not load this scan.';
      status.style.color = '#ef4444';
      return;
    }
    status.textContent = '';
    renderReconReport(data.result);
    document.getElementById('arReport').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    console.error('AlexRecon load scan error:', e);
    status.textContent = 'Network error loading scan.';
    status.style.color = '#ef4444';
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
  ${toolThemeVarsCss()}
  body { background:#0a0a0c; color:#f4f4f5; font-family:Arial,sans-serif; padding:24px; max-width:900px; margin:0 auto; }
  h1 { color:var(--accent); }
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
  root: 'var(--accent)',   // drawn in the theme accent (arGraphColorFor)
  domain: 'var(--accent)',
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
  if (node.type === 'root' || node.type === 'domain') return toolCssVar('--accent', AR_NODE_COLORS.domain);
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
  // Theme colours, read on every draw so a theme switch shows on the next redraw.
  const fgRgb = toolCssVar('--fg-rgb', '255,255,255');
  ctx.strokeStyle = `rgba(${fgRgb},0.12)`;
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
      ctx.strokeStyle = toolCssVar('--fg-1', '#fff');
      ctx.stroke();
    }
  });

  // Labels (only for larger/root nodes to avoid clutter at default zoom)
  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = toolCssVar('--fg-2', '#ccc');
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
  html += `<div style="color:var(--fg-3);">${escapeHtml(typeLabels[node.type] || node.type)}</div>`;
  if (node.meta && node.meta.prefixes && node.meta.prefixes.length) {
    html += `<div style="margin-top:4px;color:var(--fg-2);">${node.meta.prefixes.slice(0, 3).map(p => escapeHtml(p.cidr + (p.asnName ? ' - ' + p.asnName : ''))).join('<br>')}</div>`;
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
    status.style.color = '#ef4444';
    return;
  }
  if (!window._currentUser) {
    status.textContent = 'Please log in to create a schedule.';
    status.style.color = '#ef4444';
    return;
  }

  status.textContent = 'Creating schedule...';
  status.style.color = 'var(--fg-3)';

  try {
    const res = await fetch('/api/alexrecon/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: window._currentUser.id, target, frequency: freqSelect.value })
    });
    const data = await res.json();
    if (!res.ok) {
      status.textContent = data.error || 'Could not create schedule.';
      status.style.color = '#ef4444';
      return;
    }
    status.textContent = 'Schedule created.';
    status.style.color = '#4ade80';
    input.value = '';
    arLoadSchedules();
  } catch (e) {
    console.error('AlexRecon schedule create error:', e);
    status.textContent = 'Network error. Please try again.';
    status.style.color = '#ef4444';
  }
}

async function arLoadSchedules() {
  const list = document.getElementById('arScheduleList');
  if (!list || !window._currentUser) return;

  try {
    const res = await fetch(`/api/alexrecon/schedules?userId=${encodeURIComponent(window._currentUser.id)}`);
    const data = await res.json();
    if (!res.ok || !data.schedules) {
      list.innerHTML = `<p style="font-family:'Inter',sans-serif;font-size:12px;color:var(--fg-4);">Could not load schedules.</p>`;
      return;
    }
    if (!data.schedules.length) {
      list.innerHTML = `<p style="font-family:'Inter',sans-serif;font-size:12px;color:var(--fg-4);">No scheduled scans yet.</p>`;
      return;
    }

    list.innerHTML = data.schedules.map(s => {
      const lastRun = s.last_run_at ? new Date(s.last_run_at).toLocaleString() : 'Never run yet';
      const activeColor = s.is_active ? '#4ade80' : '#666';
      return `
        <div style="background:rgba(var(--fg-rgb),0.02);border:1px solid rgba(var(--fg-rgb),0.08);border-radius:10px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
          <div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--fg-1);">${escapeHtml(s.target)}</div>
            <div style="font-family:'Inter',sans-serif;font-size:11px;color:var(--fg-4);">${escapeHtml(s.frequency)} - Last run: ${escapeHtml(lastRun)}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:10px;letter-spacing:1px;font-family:'Rajdhani',sans-serif;font-weight:700;color:${activeColor};border:1px solid ${activeColor}55;background:${activeColor}15;padding:3px 10px;border-radius:20px;">${s.is_active ? 'ACTIVE' : 'PAUSED'}</span>
            <button onclick="arToggleSchedule('${s.id}', ${!s.is_active})" style="background:rgba(var(--fg-rgb),0.03);border:1px solid rgba(var(--fg-rgb),0.1);border-radius:6px;padding:5px 10px;font-family:'Inter',sans-serif;font-size:11px;color:var(--fg-2);cursor:pointer;">${s.is_active ? 'Pause' : 'Resume'}</button>
            <button onclick="arDeleteSchedule('${s.id}')" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:6px;padding:5px 10px;font-family:'Inter',sans-serif;font-size:11px;color:#f87171;cursor:pointer;">Delete</button>
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
    if (res.ok) { arLoadSchedules(); return; }
    // e.g. the 3-active-schedules cap, or AlexRecon switched off by the admin
    const data = await res.json().catch(() => ({}));
    const st = document.getElementById('arScheduleStatus');
    const msg = data.error || 'Could not update this schedule.';
    if (st) st.textContent = msg; else alert(msg);
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
