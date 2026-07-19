/* ═══════════════════════════════════════════════════════════
   AlexRecon - SSL Intelligence module (Tier 1)
   Uses Node's built-in tls module to grab the live certificate.
   No external API, no key needed.
═══════════════════════════════════════════════════════════ */

const tls = require('tls');
const { withTimeout } = require('./utils');

function connectTls(host, port = 443, timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      { host, port, servername: host, timeout: timeoutMs, rejectUnauthorized: false },
      () => {
        const cert = socket.getPeerCertificate(true);
        const protocol = socket.getProtocol();
        const cipher = socket.getCipher();
        socket.end();
        resolve({ cert, protocol, cipher });
      }
    );
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('TLS connection timed out'));
    });
    socket.on('error', (err) => {
      reject(err);
    });
  });
}

function extractSANs(cert) {
  if (!cert || !cert.subjectaltname) return [];
  return cert.subjectaltname
    .split(',')
    .map(s => s.trim().replace(/^DNS:/, ''))
    .filter(s => s.startsWith('DNS:') === false ? true : true);
}

async function sslIntelligence(domain) {
  try {
    const { cert, protocol, cipher } = await withTimeout(connectTls(domain), 7000, 'TLS handshake');

    if (!cert || Object.keys(cert).length === 0) {
      return { available: false, note: 'No certificate returned (host may not serve HTTPS on port 443).' };
    }

    const now = new Date();
    const validTo = cert.valid_to ? new Date(cert.valid_to) : null;
    const daysUntilExpiry = validTo ? Math.ceil((validTo - now) / (1000 * 60 * 60 * 24)) : null;

    return {
      available: true,
      subject: cert.subject || null,
      issuer: cert.issuer || null,
      validFrom: cert.valid_from || null,
      validTo: cert.valid_to || null,
      daysUntilExpiry,
      expired: daysUntilExpiry !== null && daysUntilExpiry < 0,
      sanNames: extractSANs(cert),
      serialNumber: cert.serialNumber || null,
      fingerprint: cert.fingerprint || null,
      fingerprint256: cert.fingerprint256 || null,
      tlsVersion: protocol,
      cipherSuite: cipher ? cipher.name : null,
      // Certificate Transparency logs - a full CT log search needs a
      // dedicated API (crt.sh doubles as both cert-transparency lookup
      // and subdomain source; reused in the subdomains module so we
      // don't hit it twice per scan).
      ctLogsNote: 'See Subdomain Enumeration section for Certificate Transparency (crt.sh) results.'
    };
  } catch (err) {
    return { available: false, note: `Could not establish TLS connection: ${err.message}` };
  }
}

module.exports = { sslIntelligence };
