/* ═══════════════════════════════════════════════════════════
   AlexTrace - Email Intelligence module
   ═══════════════════════════════════════════════════════════
   Three independent, privacy-safe checks, all free / no API key:
     1. Gravatar - public API, tells us if a Gravatar profile/image
        is registered for this email (no auth needed - Gravatar's
        own lookup is already public by design).
     2. Domain breach signal - checks whether the email's domain
        itself corresponds to a breached service, using HIBP's free
        public breach list (see breachList.js). This is a domain-level
        signal, not a per-email match (that requires a paid HIBP key).
     3. Domain intel - basic MX presence check via DNS, reusing
        Node's built-in dns module (no external API/key needed).
═══════════════════════════════════════════════════════════ */

const dns = require('dns').promises;
const { fetchWithTimeout, withTimeout, md5 } = require('./utils');
const { domainBreachSignal } = require('./breachList');

async function gravatarCheck(email) {
  const hash = md5(email);
  try {
    const res = await withTimeout(
      fetchWithTimeout(`https://www.gravatar.com/${hash}.json`, { headers: { 'User-Agent': 'AlexTraceBot/1.0' } }, 5000),
      5500,
      'Gravatar'
    );
    if (res.status === 404) {
      return { registered: false };
    }
    if (!res.ok) {
      return { registered: false, note: `Gravatar check returned ${res.status}` };
    }
    const data = await res.json().catch(() => null);
    const entry = data && Array.isArray(data.entry) ? data.entry[0] : null;
    if (!entry) return { registered: false };
    return {
      registered: true,
      displayName: entry.displayName || null,
      profileUrl: entry.profileUrl || `https://gravatar.com/${hash}`,
      thumbnailUrl: entry.thumbnailUrl || null
    };
  } catch (err) {
    return { registered: false, note: `Could not check Gravatar: ${err.message}` };
  }
}

async function domainIntel(email) {
  const domain = String(email).split('@')[1];
  if (!domain) return { domain: null, hasMailServer: false };
  try {
    const [mxRecords, txtRecords, dmarcRecords] = await Promise.all([
      withTimeout(dns.resolveMx(domain), 5000, 'MX lookup'),
      withTimeout(dns.resolveTxt(domain), 5000, 'TXT lookup').catch(() => []),
      withTimeout(dns.resolveTxt(`_dmarc.${domain}`), 5000, 'DMARC lookup').catch(() => [])
    ]);

    const txtFlat = txtRecords.map(parts => parts.join(''));
    const hasSpf = txtFlat.some(t => t.toLowerCase().startsWith('v=spf1'));
    const dmarcFlat = dmarcRecords.map(parts => parts.join(''));
    const hasDmarc = dmarcFlat.some(t => t.toLowerCase().startsWith('v=dmarc1'));

    return {
      domain,
      hasMailServer: Array.isArray(mxRecords) && mxRecords.length > 0,
      mailProvider: guessProvider(mxRecords),
      // Whether this domain has basic email-spoofing protections in
      // place - relevant if this is a company/professional domain,
      // since a missing SPF/DMARC makes phishing-as-this-domain easier.
      emailSecurity: { hasSpf, hasDmarc }
    };
  } catch (err) {
    return { domain, hasMailServer: false, note: 'No MX records found or domain does not resolve.' };
  }
}

function guessProvider(mxRecords) {
  if (!Array.isArray(mxRecords)) return null;
  const hosts = mxRecords.map(r => (r.exchange || '').toLowerCase()).join(' ');
  if (hosts.includes('google') || hosts.includes('gmail')) return 'Google Workspace / Gmail';
  if (hosts.includes('outlook') || hosts.includes('microsoft')) return 'Microsoft 365 / Outlook';
  if (hosts.includes('zoho')) return 'Zoho Mail';
  if (hosts.includes('protonmail') || hosts.includes('proton.me')) return 'Proton Mail';
  return null;
}

async function emailIntelligence(email) {
  const domain = String(email).split('@')[1] || null;
  const [gravatar, breachSignal, domainInfo] = await Promise.all([
    gravatarCheck(email).catch(err => ({ registered: false, note: err.message })),
    domainBreachSignal(domain).catch(err => ({ checked: false, matches: [], note: err.message })),
    domainIntel(email).catch(err => ({ domain: null, hasMailServer: false, note: err.message }))
  ]);
  return { email, gravatar, breachSignal, domain: domainInfo };
}

module.exports = { emailIntelligence, gravatarCheck, domainIntel };
