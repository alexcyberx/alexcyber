/* ═══════════════════════════════════════════════════════════
   AlexTrace - Username Enumeration module
   ═══════════════════════════════════════════════════════════
   For each platform, does a lightweight HTTP check (HEAD where
   possible, GET as fallback since several platforms don't support
   HEAD cleanly) and classifies the result as found / not-found /
   unknown. "Unknown" covers timeouts, blocks, and rate limits -
   we never claim a platform is "not found" unless we're reasonably
   confident, since a false negative is worse than an honest
   "couldn't check" in an OSINT-style tool.
═══════════════════════════════════════════════════════════ */

const { fetchWithTimeout, withTimeout, runChecksParallel } = require('./utils');
const { PLATFORMS, generateVariations } = require('./platforms');

const REQUEST_TIMEOUT_MS = 6000;

// A browser-like UA plus standard Accept headers gets past basic
// bot filters on more platforms than a bare "AlexTraceBot" string
// would. Some platforms (Cloudflare-fronted, mainly) still block
// based on IP reputation regardless of headers - those come back
// as 'unknown' rather than a false 'not_found', which is the
// correct, honest behavior for an OSINT-style tool either way.
const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9'
};

async function checkPlatform(platform, username) {
  const target = platform.api ? platform.api(username) : platform.url(username);
  try {
    const res = await withTimeout(
      fetchWithTimeout(target, { method: 'GET', headers: REQUEST_HEADERS }, REQUEST_TIMEOUT_MS),
      REQUEST_TIMEOUT_MS + 500,
      platform.label
    );

    if (res.status === 404 || res.status === 410) {
      return { status: 'not_found' };
    }
    if (res.status === 429) {
      return { status: 'unknown', reason: 'Rate limited by platform' };
    }
    if (res.status >= 500) {
      return { status: 'unknown', reason: 'Platform returned a server error' };
    }
    if (res.status >= 200 && res.status < 400) {
      // Some platforms (Hacker News) always 200 and render a
      // "no such user" message client-side - check body text.
      if (platform.bodyMissing) {
        const text = await res.text().catch(() => '');
        if (text.includes(platform.bodyMissing)) {
          return { status: 'not_found' };
        }
      }
      return { status: 'found', profileUrl: platform.url(username) };
    }
    return { status: 'unknown', reason: `Unexpected status ${res.status}` };
  } catch (err) {
    return { status: 'unknown', reason: err.message || 'Request failed' };
  }
}

async function usernameEnumeration(username, { includeVariations = false } = {}) {
  const checks = {};
  PLATFORMS.forEach(p => {
    checks[p.id] = () => checkPlatform(p, username);
  });

  const rawResults = await runChecksParallel(checks);

  const byPlatform = PLATFORMS.map(p => {
    const result = rawResults[p.id];
    const status = result.ok ? result.data.status : 'unknown';
    return {
      id: p.id,
      label: p.label,
      category: p.category,
      status, // 'found' | 'not_found' | 'unknown'
      profileUrl: status === 'found' ? p.url(username) : null,
      reason: result.ok ? result.data.reason || null : (result.error || null)
    };
  });

  const found = byPlatform.filter(p => p.status === 'found');
  const notFound = byPlatform.filter(p => p.status === 'not_found');
  const unknown = byPlatform.filter(p => p.status === 'unknown');

  let variationHits = [];
  if (includeVariations && found.length > 0) {
    // Only spend the extra requests checking variations if the base
    // username actually hit something - otherwise it's likely not a
    // real handle at all and variation-checking wastes calls for
    // nothing useful.
    const variations = generateVariations(username);
    const variationChecks = {};
    variations.forEach(v => {
      // Only check on the platforms where we already found a hit,
      // since that's where a real person is most likely active and
      // where variation squatting matters most.
      found.slice(0, 5).forEach(p => {
        const platform = PLATFORMS.find(pl => pl.id === p.id);
        if (platform) variationChecks[`${platform.id}__${v}`] = () => checkPlatform(platform, v);
      });
    });
    const variationResults = await runChecksParallel(variationChecks);
    variationHits = Object.entries(variationResults)
      .filter(([, r]) => r.ok && r.data.status === 'found')
      .map(([key]) => {
        const [platformId, ...rest] = key.split('__');
        const variant = rest.join('__');
        const platform = PLATFORMS.find(p => p.id === platformId);
        return { platform: platform ? platform.label : platformId, username: variant, profileUrl: platform ? platform.url(variant) : null };
      });
  }

  return {
    username,
    checkedPlatforms: PLATFORMS.length,
    found,
    notFound,
    unknown,
    variationHits,
    categories: [...new Set(PLATFORMS.map(p => p.category))]
  };
}

module.exports = { usernameEnumeration };
