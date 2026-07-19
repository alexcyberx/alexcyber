/* ═══════════════════════════════════════════════════════════
   AlexUtils - IP Lookup & DNS Resolver
   IP geolocation via ipapi.co (free, no key, rate-limited).
   Single-record-type DNS resolution using Node's built-in dns
   module - reuses the same resolver AlexRecon's DNS module uses,
   just returns one record type at a time to match the UI's
   dropdown-driven single-lookup flow.
═══════════════════════════════════════════════════════════ */

const dns = require('dns').promises;
const { fetchWithTimeout, withTimeout } = require('../alexrecon/modules/utils');

async function ipLookup(value) {
  try {
    const res = await fetchWithTimeout(`https://ipapi.co/${encodeURIComponent(value)}/json/`, {}, 6000);
    const data = await res.json();
    if (data.error) {
      return { found: false, note: data.reason || 'Lookup failed.' };
    }
    return {
      found: true,
      ip: data.ip || null,
      hostname: data.hostname || null,
      countryName: data.country_name || null,
      countryCode: data.country_code || null,
      city: data.city || null,
      region: data.region || null,
      org: data.org || null,
      asn: data.asn || null,
      timezone: data.timezone || null,
      version: data.version || 'IPv4'
    };
  } catch (err) {
    return { found: false, note: `Could not reach IP lookup service: ${err.message}` };
  }
}

const RESOLVERS = {
  A: (d) => dns.resolve4(d),
  AAAA: (d) => dns.resolve6(d),
  MX: (d) => dns.resolveMx(d),
  NS: (d) => dns.resolveNs(d),
  TXT: (d) => dns.resolveTxt(d),
  CNAME: (d) => dns.resolveCname(d),
  SOA: (d) => dns.resolveSoa(d)
};

async function dnsResolve(domain, recordType) {
  const resolver = RESOLVERS[recordType];
  if (!resolver) {
    return { found: false, note: `Unsupported record type: ${recordType}` };
  }
  try {
    const result = await withTimeout(resolver(domain), 6000, 'DNS lookup');
    if (!result || (Array.isArray(result) && !result.length)) {
      return { found: false, note: `No ${recordType} records found for ${domain}.` };
    }
    // Normalize the various shapes dns.promises returns into plain strings
    let lines;
    if (recordType === 'MX') {
      lines = result.map(r => `${r.priority} ${r.exchange}`);
    } else if (recordType === 'TXT') {
      lines = result.map(parts => parts.join(''));
    } else if (recordType === 'SOA') {
      lines = [`${result.nsname} ${result.hostmaster} (serial ${result.serial})`];
    } else {
      lines = result;
    }
    return { found: true, records: lines };
  } catch (err) {
    return { found: false, note: `No ${recordType} records found for ${domain} (or lookup failed).` };
  }
}

module.exports = { ipLookup, dnsResolve };
