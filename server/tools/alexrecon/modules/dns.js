/* ═══════════════════════════════════════════════════════════
   AlexRecon - DNS Intelligence module (Tier 1)
   Uses Node's built-in dns.promises - free, no external API,
   no rate limit beyond the resolver's own.
═══════════════════════════════════════════════════════════ */

const dns = require('dns').promises;
const { withTimeout } = require('./utils');

async function safeResolve(fn, fallback = []) {
  try {
    return await withTimeout(fn(), 5000, 'DNS lookup');
  } catch (e) {
    return fallback;
  }
}

async function dnsIntelligence(domain) {
  const [a, aaaa, mx, txt, ns, soa, cname] = await Promise.all([
    safeResolve(() => dns.resolve4(domain)),
    safeResolve(() => dns.resolve6(domain)),
    safeResolve(() => dns.resolveMx(domain)),
    safeResolve(() => dns.resolveTxt(domain)),
    safeResolve(() => dns.resolveNs(domain)),
    safeResolve(() => dns.resolveSoa(domain), null),
    safeResolve(() => dns.resolveCname(domain))
  ]);

  const txtFlat = txt.map(parts => parts.join(''));
  const spf = txtFlat.filter(t => t.toLowerCase().startsWith('v=spf1'));
  const dmarcTxt = await safeResolve(() => dns.resolveTxt(`_dmarc.${domain}`));
  const dmarc = dmarcTxt.map(parts => parts.join('')).filter(t => t.toLowerCase().startsWith('v=dmarc1'));

  // DKIM has no fixed record name - check the most common selectors.
  // A miss here doesn't mean DKIM is absent, just that the common
  // selectors weren't used; label this clearly for the user.
  const commonSelectors = ['default', 'google', 'selector1', 'selector2', 'mail', 'k1'];
  const dkimChecks = await Promise.all(
    commonSelectors.map(async sel => {
      const rec = await safeResolve(() => dns.resolveTxt(`${sel}._domainkey.${domain}`));
      return rec.length ? { selector: sel, record: rec.map(p => p.join('')).join('') } : null;
    })
  );
  const dkim = dkimChecks.filter(Boolean);

  // Reverse PTR for each resolved A record
  const ptrRecords = await Promise.all(
    a.map(async ip => {
      const ptr = await safeResolve(() => dns.reverse(ip));
      return { ip, hostnames: ptr };
    })
  );

  return {
    a,
    aaaa,
    mx: mx.map(m => ({ exchange: m.exchange, priority: m.priority })),
    txt: txtFlat,
    spf,
    dmarc,
    dkim,
    ns,
    soa,
    cname,
    ptr: ptrRecords
  };
}

// AXFR zone transfer check - almost always fails against a properly
// configured server, but cheap to include with a clear disclaimer.
// Node has no native AXFR support without a third-party DNS library,
// so v1 reports this as "not testable from this environment" rather
// than silently omitting it or adding a heavy new dependency.
async function axfrCheck(domain) {
  return {
    tested: false,
    note: 'AXFR zone transfer testing requires a raw DNS query library not available in this environment. Authorized testers should use `dig axfr @nameserver domain` directly.'
  };
}

// Wildcard DNS detection - resolve a random, near-certainly-unused
// subdomain. If it resolves, the domain likely has a wildcard record,
// which affects how subdomain enumeration results should be trusted.
async function wildcardCheck(domain) {
  const probe = `alexrecon-wildcard-check-${Date.now()}.${domain}`;
  const a = await safeResolve(() => dns.resolve4(probe));
  return {
    hasWildcard: a.length > 0,
    resolvedTo: a
  };
}

module.exports = { dnsIntelligence, axfrCheck, wildcardCheck };
