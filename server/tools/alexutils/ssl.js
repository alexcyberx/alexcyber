/* ═══════════════════════════════════════════════════════════
   AlexUtils - SSL Certificate Checker
   Same certificate details AlexRecon's SSL module returns, plus
   the part a user actually wants to know: is this certificate
   TRUSTED? (self-signed, hostname mismatch, untrusted chain,
   expired / not yet valid). Connects to the IP that target.js
   already checked as public, with SNI = the hostname, so a DNS
   answer can't flip to an internal address between check and
   connect.
═══════════════════════════════════════════════════════════ */

const tls = require('tls');
const net = require('net');

const DAY_MS = 24 * 60 * 60 * 1000;

function connectTls(ip, servername, port = 443, timeoutMs = 7000) {
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = (fn, arg) => {
      if (done) return;
      done = true;
      clearTimeout(hardTimer);
      fn(arg);
    };
    // rejectUnauthorized: false so we can still SHOW a bad certificate;
    // trust is reported separately from socket.authorized below.
    const opts = { host: ip, port, timeout: timeoutMs, rejectUnauthorized: false };
    if (servername) opts.servername = servername;
    const socket = tls.connect(opts, () => {
      const cert = socket.getPeerCertificate(true);
      const result = {
        cert,
        protocol: socket.getProtocol(),
        cipher: socket.getCipher(),
        authorized: socket.authorized === true,
        authorizationError: socket.authorizationError
          ? String(socket.authorizationError.code || socket.authorizationError)
          : null
      };
      socket.end();
      finish(resolve, result);
    });
    // Hard cap on the whole handshake (socket timeout alone is an idle timer).
    const hardTimer = setTimeout(() => {
      socket.destroy();
      finish(reject, new Error('TLS handshake timed out'));
    }, timeoutMs);
    socket.on('timeout', () => {
      socket.destroy();
      finish(reject, new Error('TLS connection timed out'));
    });
    socket.on('error', (err) => finish(reject, err));
  });
}

function extractSANs(cert) {
  if (!cert || !cert.subjectaltname) return [];
  return cert.subjectaltname
    .split(',')
    .map(s => s.trim().replace(/^DNS:/, ''));
}

// Node/OpenSSL error codes -> short label for the UI.
function trustIssueFor(code, { hostnameMatch, expired, notYetValid }) {
  switch (code) {
    case 'DEPTH_ZERO_SELF_SIGNED_CERT':
    case 'SELF_SIGNED_CERT_IN_CHAIN':
      return 'self-signed';
    case 'CERT_HAS_EXPIRED':
      return 'expired';
    case 'CERT_NOT_YET_VALID':
      return 'not yet valid';
    case 'ERR_TLS_CERT_ALTNAME_INVALID':
      return 'hostname mismatch';
    case 'CERT_REVOKED':
      return 'revoked';
  }
  if (code) return 'untrusted chain'; // UNABLE_TO_VERIFY_LEAF_SIGNATURE, UNABLE_TO_GET_ISSUER_CERT*, ...
  if (expired) return 'expired';
  if (notYetValid) return 'not yet valid';
  if (!hostnameMatch) return 'hostname mismatch';
  return null;
}

// host = what the user typed (normalised), ip = the public IP target.js checked.
async function sslCheck(host, ip) {
  const isIp = net.isIP(host) !== 0;
  try {
    // SNI must be a hostname, never an IP literal (RFC 6066).
    const { cert, protocol, cipher, authorized, authorizationError } = await connectTls(ip, isIp ? null : host);

    if (!cert || Object.keys(cert).length === 0) {
      return { available: false, note: 'No certificate returned (host may not serve HTTPS on port 443).' };
    }

    const now = Date.now();
    const validFrom = cert.valid_from ? new Date(cert.valid_from) : null;
    const validTo = cert.valid_to ? new Date(cert.valid_to) : null;
    const expired = validTo ? validTo.getTime() < now : false;
    const notYetValid = validFrom ? validFrom.getTime() > now : false;

    // Math.ceil on a cert that expired < 24 h ago gives -0 ("Expired: No",
    // blank days in the UI). An expired cert is always at least -1 day.
    let daysUntilExpiry = validTo ? Math.ceil((validTo.getTime() - now) / DAY_MS) : null;
    if (daysUntilExpiry !== null && expired && daysUntilExpiry > -1) daysUntilExpiry = -1;

    let hostnameMatch = false;
    try {
      hostnameMatch = tls.checkServerIdentity(host, cert) === undefined;
    } catch (e) {
      hostnameMatch = false;
    }

    const trusted = authorized && hostnameMatch && !expired && !notYetValid;

    return {
      available: true,
      subject: cert.subject || null,
      issuer: cert.issuer || null,
      validFrom: cert.valid_from || null,
      validTo: cert.valid_to || null,
      daysUntilExpiry,
      expired,
      sanNames: extractSANs(cert),
      serialNumber: cert.serialNumber || null,
      fingerprint: cert.fingerprint || null,
      fingerprint256: cert.fingerprint256 || null,
      tlsVersion: protocol,
      cipherSuite: cipher ? cipher.name : null,
      ctLogsNote: 'See Subdomain Enumeration section for Certificate Transparency (crt.sh) results.',
      // Trust info (new fields, old ones above unchanged)
      trusted,
      trustIssue: trusted ? null : trustIssueFor(authorizationError, { hostnameMatch, expired, notYetValid }),
      authorizationError,
      hostnameMatch,
      notYetValid,
      ip
    };
  } catch (err) {
    return { available: false, note: `Could not establish TLS connection: ${err.message}` };
  }
}

module.exports = { sslCheck };
