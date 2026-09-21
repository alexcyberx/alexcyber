/* ═══════════════════════════════════════════════════════════
   AlexRecon - Asset Discovery module (Tier 1/2)
   Subdomain enumeration via crt.sh (Certificate Transparency),
   ASN/CIDR via BGPView, live host detection with concurrency cap.
   Both crt.sh and BGPView are free with no API key.
═══════════════════════════════════════════════════════════ */

const { fetchWithTimeout, withTimeout } = require('./utils');

// crt.sh can be slow/rate-limited - give it more room than most
// modules, but still bounded so it can't hang the whole scan.
async function subdomainEnumeration(domain) {
  try {
    const res = await fetchWithTimeout(
      `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`,
      {},
      12000
    );
    if (!res.ok) {
      return { source: 'crt.sh', available: false, note: `crt.sh returned status ${res.status}`, subdomains: [] };
    }
    const text = await res.text();
    let rows;
    try {
      rows = JSON.parse(text);
    } catch (e) {
      // crt.sh occasionally returns malformed/partial JSON under load
      return { source: 'crt.sh', available: false, note: 'crt.sh response could not be parsed (service may be under load).', subdomains: [] };
    }

    const names = new Set();
    for (const row of rows) {
      if (!row.name_value) continue;
      row.name_value.split('\n').forEach(n => {
        const clean = n.trim().toLowerCase().replace(/^\*\./, '');
        if (clean.endsWith(domain)) names.add(clean);
      });
    }

    return {
      source: 'crt.sh',
      available: true,
      count: names.size,
      subdomains: Array.from(names).sort()
    };
  } catch (err) {
    return { source: 'crt.sh', available: false, note: `Could not reach crt.sh: ${err.message}`, subdomains: [] };
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
      try {
        const res = await fetchWithTimeout(`https://${current}`, { redirect: 'manual', method: 'HEAD' }, 4000);
        results.push({ host: current, alive: true, status: res.status, protocol: 'https' });
      } catch (e) {
        try {
          const res = await fetchWithTimeout(`http://${current}`, { redirect: 'manual', method: 'HEAD' }, 4000);
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
    const res = await fetchWithTimeout(`https://api.bgpview.io/ip/${ip}`, {}, 8000);
    if (!res.ok) {
      return { available: false, note: `BGPView returned status ${res.status}` };
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
    return { available: false, note: `Could not reach BGPView: ${err.message}` };
  }
}

module.exports = { subdomainEnumeration, liveHostDetection, asnCidrDiscovery };
