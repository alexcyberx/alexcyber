/* ═══════════════════════════════════════════════════════════
   AlexRecon - SSL Intelligence module (Tier 1)
   Uses Node's built-in tls module to grab the live certificate.
   No external API, no key needed.
═══════════════════════════════════════════════════════════ */

const tls = require('tls');
const net = require('net');
const { withTimeout, safeLookup, isPublicIP } = require('./utils');

function connectTls(host, port = 443, timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    // IP-literal hosts skip `lookup` in Node, so refuse a private/internal
    // literal up front (defence in depth; domains still go via safeLookup).
    if (net.isIP(host) && !isPublicIP(host)) {
      return reject(new Error('Host is not a public address.'));
    }
    const socket = tls.connect(
      // servername keeps SNI/cert on the hostname; lookup pins the socket to
      // a validated public IP (and re-resolves, closing the rebind window).
      { host, port, servername: host, timeout: timeoutMs, rejectUnauthorized: false, lookup: safeLookup },
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
