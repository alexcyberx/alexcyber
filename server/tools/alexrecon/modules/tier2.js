/* ═══════════════════════════════════════════════════════════
   AlexRecon - Tier 2 modules
   URL Discovery (Wayback/CommonCrawl), JS Recon, Cloud bucket
   detection, Directory/backup file checks. Free public APIs,
   paginated/limited to keep responses manageable.
═══════════════════════════════════════════════════════════ */

const { fetchWithTimeout } = require('./utils');

const URL_CAP = 200; // keep response size sane on Render free tier

async function waybackUrls(domain) {
  try {
    const res = await fetchWithTimeout(
      `https://web.archive.org/cdx/search/cdx?url=*.${encodeURIComponent(domain)}/*&output=json&collapse=urlkey&limit=${URL_CAP}`,
      {},
      10000
    );
    if (!res.ok) return { source: 'wayback', available: false, note: `Wayback CDX returned status ${res.status}`, urls: [] };
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length < 2) return { source: 'wayback', available: true, urls: [] };
    const urls = rows.slice(1).map(r => r[2]).filter(Boolean);
    return { source: 'wayback', available: true, count: urls.length, urls, truncated: urls.length >= URL_CAP };
  } catch (err) {
    return { source: 'wayback', available: false, note: `Could not reach Wayback Machine: ${err.message}`, urls: [] };
  }
}

async function commonCrawlUrls(domain) {
  try {
    // Use the latest known-good index; CommonCrawl rotates index names
    // periodically, so failures here are reported gracefully rather
    // than hardcoding a single index name that may go stale.
    const idxRes = await fetchWithTimeout('https://index.commoncrawl.org/collinfo.json', {}, 6000);
    if (!idxRes.ok) return { source: 'commoncrawl', available: false, note: 'Could not fetch CommonCrawl index list.', urls: [] };
    const indexes = await idxRes.json();
    const latest = indexes[0];
    if (!latest || !latest['cdx-api']) return { source: 'commoncrawl', available: false, note: 'No CommonCrawl index available.', urls: [] };

    const res = await fetchWithTimeout(
      `${latest['cdx-api']}?url=*.${encodeURIComponent(domain)}/*&output=json&limit=${URL_CAP}`,
      {},
      10000
    );
    if (!res.ok) return { source: 'commoncrawl', available: false, note: `CommonCrawl returned status ${res.status}`, urls: [] };
    const text = await res.text();
    const urls = text.trim().split('\n').filter(Boolean).map(line => {
      try { return JSON.parse(line).url; } catch (e) { return null; }
    }).filter(Boolean);

    return { source: 'commoncrawl', available: true, count: urls.length, urls, truncated: urls.length >= URL_CAP };
  } catch (err) {
    return { source: 'commoncrawl', available: false, note: `Could not reach CommonCrawl: ${err.message}`, urls: [] };
  }
}

// JS File Collection + secret/endpoint scanning. Uses the homepage
// body already fetched by webRecon (passed in) to find script src
// URLs, then fetches each JS file and runs lightweight regex checks.
// Regex-based secret detection has false positives by nature - this
// is flagged clearly to the user rather than presented as certain.
const SECRET_PATTERNS = [
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g },
  { name: 'Generic API Key', regex: /['"]?api[_-]?key['"]?\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/gi },
  { name: 'Generic Secret', regex: /['"]?secret['"]?\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/gi },
  { name: 'Bearer Token', regex: /Bearer\s+[A-Za-z0-9_\-.]{20,}/g },
  { name: 'Private Key Header', regex: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/g },
  { name: 'Firebase Config', regex: /firebaseio\.com/g },
  { name: 'Source Map Reference', regex: /\/\/#\s*sourceMappingURL=([^\s]+)/g }
];

async function jsRecon(baseUrl, homepageBody, capFiles = 8) {
  const scriptSrcs = new Set();
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = scriptRegex.exec(homepageBody || '')) !== null) {
    try {
      const abs = new URL(match[1], baseUrl).toString();
      if (abs.endsWith('.js')) scriptSrcs.add(abs);
    } catch (e) {}
  }

  const files = Array.from(scriptSrcs).slice(0, capFiles);
  const findings = [];

  for (const fileUrl of files) {
    try {
      const res = await fetchWithTimeout(fileUrl, {}, 6000);
      if (!res.ok) continue;
      const body = await res.text();
      const truncatedBody = body.slice(0, 200000); // cap per-file read

      const hits = [];
      for (const pattern of SECRET_PATTERNS) {
        const found = truncatedBody.match(pattern.regex);
        if (found) hits.push({ type: pattern.name, matchCount: found.length });
      }

      const endpointRegex = /["'](\/api\/[a-zA-Z0-9_\-/]+)["']/g;
      const endpoints = new Set();
      let epMatch;
      while ((epMatch = endpointRegex.exec(truncatedBody)) !== null) {
        endpoints.add(epMatch[1]);
      }

      findings.push({
        file: fileUrl,
        sizeBytes: body.length,
        possibleFindings: hits,
        endpointsFound: Array.from(endpoints).slice(0, 30),
        hasSourceMap: /\/\/#\s*sourceMappingURL=/.test(truncatedBody)
      });
    } catch (e) {
      findings.push({ file: fileUrl, error: 'Could not fetch or analyze this file.' });
    }
  }

  return {
    filesDiscovered: scriptSrcs.size,
    filesAnalyzed: files.length,
    truncated: scriptSrcs.size > capFiles,
    findings,
    disclaimer: 'Secret detection is regex-based and may produce false positives. Manually verify any finding before treating it as a real credential.'
  };
}

// Cloud Discovery - S3/Firebase bucket detection via naming heuristics
// + public accessibility check. AWS/Azure/GCP asset discovery beyond
// bucket-guessing needs provider credentials and is out of scope for v1.
async function cloudDiscovery(domain) {
  const base = domain.split('.')[0];
  const candidates = [base, `${base}-assets`, `${base}-static`, `${base}-backup`, `${base}-dev`, `${base}-prod`, `www-${base}`];
  const results = [];

  for (const name of candidates.slice(0, 6)) {
    try {
      const res = await fetchWithTimeout(`https://${name}.s3.amazonaws.com`, {}, 4000);
      if (res.status !== 404 && res.status !== 0) {
        results.push({ type: 's3', bucket: name, status: res.status, publiclyListable: res.status === 200 });
      }
    } catch (e) {}
  }

  let firebase = null;
  try {
    const res = await fetchWithTimeout(`https://${base}.firebaseio.com/.json`, {}, 4000);
    if (res.status !== 404) {
      firebase = { project: base, status: res.status, note: res.status === 200 ? 'Database may be publicly readable - verify manually.' : 'Exists but not publicly readable.' };
    }
  } catch (e) {}

  return {
    s3Buckets: results,
    firebase,
    disclaimer: 'Bucket names are guessed from common naming conventions and may produce false positives/negatives. This checks accessibility only, not ownership.'
  };
}

// Directory/backup file checks - small wordlist, strictly rate-limited
// so this doesn't resemble an attack against the target.
const COMMON_PATHS = [
  '/.env', '/.git/config', '/backup.zip', '/config.php.bak', '/.DS_Store',
  '/wp-config.php.bak', '/.htaccess', '/db.sql', '/admin/config'
];

async function directoryBackupCheck(domain, protocol = 'https') {
  const found = [];
  for (const path of COMMON_PATHS) {
    try {
      const res = await fetchWithTimeout(`${protocol}://${domain}${path}`, { method: 'GET' }, 4000);
      if (res.status === 200) {
        found.push({ path, status: res.status });
      }
    } catch (e) {}
  }
  return { checked: COMMON_PATHS.length, found };
}

// Email & Employee Intelligence - GitHub org public API only, per
// Alex's decision to avoid LinkedIn scraping (ToS/legal risk).
async function githubOrgIntel(orgOrDomainBase) {
  try {
    const res = await fetchWithTimeout(`https://api.github.com/orgs/${encodeURIComponent(orgOrDomainBase)}`, {
      headers: { 'User-Agent': 'AlexRecon' }
    }, 6000);
    if (!res.ok) return { available: false, note: 'No matching GitHub organization found.' };
    const org = await res.json();

    const membersRes = await fetchWithTimeout(`https://api.github.com/orgs/${encodeURIComponent(orgOrDomainBase)}/members?per_page=30`, {
      headers: { 'User-Agent': 'AlexRecon' }
    }, 6000);
    const members = membersRes.ok ? await membersRes.json() : [];

    const reposRes = await fetchWithTimeout(`https://api.github.com/orgs/${encodeURIComponent(orgOrDomainBase)}/repos?per_page=10&sort=updated`, {
      headers: { 'User-Agent': 'AlexRecon' }
    }, 6000);
    const repos = reposRes.ok ? await reposRes.json() : [];

    return {
      available: true,
      orgName: org.login,
      publicRepos: org.public_repos,
      blog: org.blog || null,
      email: org.email || null,
      publicMembers: members.map(m => m.login).slice(0, 30),
      recentRepos: repos.map(r => ({ name: r.name, url: r.html_url, language: r.language })).slice(0, 10),
      note: 'Limited to publicly indexed GitHub organization data. LinkedIn and other scraping is intentionally not performed.'
    };
  } catch (err) {
    return { available: false, note: `Could not reach GitHub API: ${err.message}` };
  }
}

module.exports = { waybackUrls, commonCrawlUrls, jsRecon, cloudDiscovery, directoryBackupCheck, githubOrgIntel };
