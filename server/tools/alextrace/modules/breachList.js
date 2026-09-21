/* ═══════════════════════════════════════════════════════════
   AlexTrace - Breach Dataset module (free, no API key)
   ═══════════════════════════════════════════════════════════
   HIBP's per-account breach lookup (GET /breachedaccount/{email})
   requires a paid API key. Their full breach LIST endpoint
   (GET /breaches) is public and unauthenticated - it returns
   every known breach with name, date, description, data classes
   leaked, and pwn count, just not tied to a specific email.

   We use that free list two ways:
     1. Domain matching - if the email's own domain is itself a
        breached service (e.g. someone@yahoo.com and Yahoo had a
        breach), we can say so directly.
     2. "Check a service" lookup - the frontend lets the user type
        a service/platform name (e.g. "Canva", "LinkedIn") and we
        match it against the dataset, showing when it was breached
        and what data was exposed. This needs no email at all,
        so it works within the free tier.

   The list is ~800KB and doesn't change often, so we cache it in
   memory for 24 hours rather than fetching on every request.
═══════════════════════════════════════════════════════════ */

const { fetchWithTimeout, withTimeout } = require('./utils');

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
let _cache = { data: null, fetchedAt: 0 };

async function getBreachDataset() {
  const now = Date.now();
  if (_cache.data && (now - _cache.fetchedAt) < CACHE_TTL_MS) {
    return _cache.data;
  }
  try {
    const res = await withTimeout(
      fetchWithTimeout('https://haveibeenpwned.com/api/v3/breaches', { headers: { 'User-Agent': 'AlexTrace-AlexCyberX' } }, 8000),
      8500,
      'HaveIBeenPwned breach list'
    );
    if (!res.ok) throw new Error(`Breach list returned ${res.status}`);
    const data = await res.json();
    _cache = { data, fetchedAt: now };
    return data;
  } catch (err) {
    // Serve stale cache rather than nothing, if we have it
    if (_cache.data) return _cache.data;
    throw err;
  }
}

// Checks whether an email's own domain corresponds to a service
// that has itself been breached (e.g. the mail provider or a
// domain-branded service). This is a best-effort signal, not a
// per-account result - it can't tell us if *this specific* email
// was in that breach, only that the service tied to the domain was.
async function domainBreachSignal(emailDomain) {
  if (!emailDomain) return { checked: false, matches: [] };
  try {
    const breaches = await getBreachDataset();
    const domainLower = emailDomain.toLowerCase();
    const matches = breaches.filter(b => {
      const bDomain = (b.Domain || '').toLowerCase();
      return bDomain && (bDomain === domainLower || domainLower.endsWith('.' + bDomain) || bDomain.endsWith('.' + domainLower));
    }).map(formatBreach);
    return { checked: true, matches };
  } catch (err) {
    return { checked: false, matches: [], note: `Could not check breach list: ${err.message}` };
  }
}

// Free-text search used by the "Check a service" panel - matches
// against breach Name and Title (case-insensitive, partial match).
async function searchBreachesByName(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  const breaches = await getBreachDataset();
  return breaches
    .filter(b => (b.Name || '').toLowerCase().includes(q) || (b.Title || '').toLowerCase().includes(q))
    .slice(0, 15)
    .map(formatBreach);
}

function formatBreach(b) {
  return {
    name: b.Name,
    title: b.Title,
    domain: b.Domain || null,
    breachDate: b.BreachDate || null,
    pwnCount: b.PwnCount || null,
    dataClasses: Array.isArray(b.DataClasses) ? b.DataClasses : [],
    isSensitive: !!b.IsSensitive,
    isVerified: !!b.IsVerified
  };
}

module.exports = { getBreachDataset, domainBreachSignal, searchBreachesByName };
