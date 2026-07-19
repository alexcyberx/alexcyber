/* ═══════════════════════════════════════════════════════════
   AlexUtils - CVE Search
   Uses the NIST NVD REST API (free, no key required for
   low-volume use - a key raises the rate limit but isn't
   required for the classroom-scale usage this tool expects).
   Docs: https://nvd.nist.gov/developers/vulnerabilities
═══════════════════════════════════════════════════════════ */

const { fetchWithTimeout } = require('../alexrecon/modules/utils');

const NVD_BASE = 'https://services.nvd.nist.gov/rest/json/cves/2.0';

function severityFromScore(score) {
  if (score === null || score === undefined) return 'unknown';
  if (score >= 9.0) return 'critical';
  if (score >= 7.0) return 'high';
  if (score >= 4.0) return 'medium';
  if (score > 0) return 'low';
  return 'none';
}

function extractMetrics(cveItem) {
  const metrics = cveItem.metrics || {};
  // Prefer the newest CVSS version available
  const v31 = metrics.cvssMetricV31?.[0]?.cvssData;
  const v30 = metrics.cvssMetricV30?.[0]?.cvssData;
  const v2 = metrics.cvssMetricV2?.[0]?.cvssData;
  const data = v31 || v30 || v2;
  if (!data) return { score: null, vector: null, severity: 'unknown' };
  return {
    score: data.baseScore ?? null,
    vector: data.vectorString || null,
    severity: severityFromScore(data.baseScore)
  };
}

async function cveSearch(query) {
  const trimmed = query.trim();
  if (!trimmed) return { found: false, note: 'Enter a CVE ID or keyword.' };

  const isCveId = /^CVE-\d{4}-\d{4,}$/i.test(trimmed);
  const params = isCveId
    ? `cveId=${encodeURIComponent(trimmed.toUpperCase())}`
    : `keywordSearch=${encodeURIComponent(trimmed)}&resultsPerPage=5`;

  try {
    const res = await fetchWithTimeout(`${NVD_BASE}?${params}`, {}, 10000);
    if (!res.ok) {
      if (res.status === 404) return { found: false, note: `No CVE found for "${trimmed}".` };
      return { found: false, note: `NVD API returned status ${res.status}. It may be rate-limiting - try again in a moment.` };
    }
    const json = await res.json();
    const items = json.vulnerabilities || [];
    if (!items.length) return { found: false, note: `No CVE found for "${trimmed}".` };

    const results = items.map(({ cve }) => {
      const description = (cve.descriptions || []).find(d => d.lang === 'en')?.value || 'No description available.';
      const metrics = extractMetrics(cve);
      const affected = (cve.configurations || [])
        .flatMap(c => c.nodes || [])
        .flatMap(n => n.cpeMatch || [])
        .map(m => m.criteria)
        .slice(0, 5);

      return {
        id: cve.id,
        description,
        published: cve.published || null,
        lastModified: cve.lastModified || null,
        cvssScore: metrics.score,
        cvssVector: metrics.vector,
        severity: metrics.severity,
        affectedProducts: affected,
        references: (cve.references || []).slice(0, 5).map(r => r.url)
      };
    });

    return { found: true, results, source: 'NVD (National Vulnerability Database)' };
  } catch (err) {
    return { found: false, note: `Could not reach NVD: ${err.message}` };
  }
}

module.exports = { cveSearch };
