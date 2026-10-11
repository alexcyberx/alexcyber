/* ═══════════════════════════════════════════════════════════
   AlexRecon - Asset Discovery module (Tier 1/2)
   Subdomain enumeration via crt.sh (Certificate Transparency),
   ASN/CIDR via BGPView, live host detection with concurrency cap.
   Both crt.sh and BGPView are free with no API key.
═══════════════════════════════════════════════════════════ */

const { safeFetch } = require('./utils');

// Accept only real labels under the target: an exact match, or a name
// that ends on a label boundary (".example.com"). crt.sh name_value holds
// every SAN/identity on a matching cert, so without the boundary check
// "myexample.com" or "admin@example.com" would slip through and then get
// probed. Also reject anything that isn't hostname-shaped.
function isValidSubdomain(clean, domain) {
  if (!clean || clean.includes('@') || /\s/.test(clean)) return false;
  if (!/^[a-z0-9.-]+$/.test(clean)) return false;
  return clean === domain || clean.endsWith('.' + domain);
}

// crt.sh can be slow/rate-limited - give it more room than most
// modules, but still bounded so it can't hang the whole scan.
async function subdomainEnumeration(domain) {
  try {
    const res = await safeFetch(
      `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`,
      { timeoutMs: 12000 }
    );
    if (!res.ok) {
      return { source: 'crt.sh', available: false, upstreamError: true, note: `crt.sh returned status ${res.status}`, subdomains: [] };
    }
    const text = await res.text();
    let rows;
    try {
      rows = JSON.parse(text);
    } catch (e) {
      // crt.sh occasionally returns malformed/partial JSON under load
      return { source: 'crt.sh', available: false, upstreamError: true, note: 'crt.sh response could not be parsed (service may be under load).', subdomains: [] };
    }

    const names = new Set();
    for (const row of rows) {
      if (!row.name_value) continue;
      row.name_value.split('\n').forEach(n => {
        const clean = n.trim().toLowerCase().replace(/^\*\./, '');
        if (isValidSubdomain(clean, domain)) names.add(clean);
      });
    }

    return {
      source: 'crt.sh',
      available: true,
      count: names.size,
      subdomains: Array.from(names).sort()
    };
  } catch (err) {
    return { source: 'crt.sh', available: false, upstreamError: true, note: `Could not reach crt.sh: ${err.message}`, subdomains: [] };
  }
}

// Live host detection with a concurrency cap so we don't fire 200
// simultaneous requests at once for domains with huge subdomain counts.
async function liveHostDetection(subdomains, concurrency = 10, capCount = 60) {
  const targets = subdomains.slice(0, capCount); // cap to keep scan time reasonable
  const results = [];
  let idx = 0;

  async function worker() {
    while (idx < targets.length) {
      const current = targets[idx++];
      // Skip anything that isn't a clean hostname before probing it.
      if (!/^[a-z0-9.-]+$/.test(current) || current.includes('..')) {
        results.push({ host: current, alive: false });
        continue;
      }
      try {
        // safeFetch re-resolves and pins each host to a public IP, so a
        // crt.sh name whose A record points at an internal host is refused.
        const res = await safeFetch(`https://${current}`, { method: 'HEAD', maxRedirects: 0, timeoutMs: 4000 });
        results.push({ host: current, alive: true, status: res.status, protocol: 'https' });
      } catch (e) {
        try {
          const res = await safeFetch(`http://${current}`, { method: 'HEAD', maxRedirects: 0, timeoutMs: 4000 });
          results.push({ host: current, alive: true, status: res.status, protocol: 'http' });
        } catch (e2) {
          results.push({ host: current, alive: false });
        }
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, targets.length) }, () => worker());
  await Promise.all(workers);

  return {
    checked: targets.length,
    skipped: Math.max(0, subdomains.length - capCount),
    live: results.filter(r => r.alive),
    dead: results.filter(r => !r.alive).length
  };
}

// ASN + CIDR discovery via BGPView (free, no key). Requires an IP
// resolved from the domain - caller passes the primary A record IP.
async function asnCidrDiscovery(ip) {
  if (!ip) return { available: false, note: 'No IP address available to look up.' };
  try {
    const res = await safeFetch(`https://api.bgpview.io/ip/${encodeURIComponent(ip)}`, { timeoutMs: 8000 });
    if (!res.ok) {
      return { available: false, upstreamError: true, note: `BGPView returned status ${res.status}` };
    }
    const json = await res.json();
    const data = json.data || {};
    const prefixes = data.prefixes || [];

    return {
      available: true,
      ip,
      prefixes: prefixes.map(p => ({
        cidr: p.prefix,
        asn: p.asn ? p.asn.asn : null,
        asnName: p.asn ? p.asn.name : null,
        asnDescription: p.asn ? p.asn.description : null,
        countryCode: p.asn ? p.asn.country_code : null
      }))
    };
  } catch (err) {
    return { available: false, upstreamError: true, note: `Could not reach BGPView: ${err.message}` };
  }
}

module.exports = { subdomainEnumeration, liveHostDetection, asnCidrDiscovery };
