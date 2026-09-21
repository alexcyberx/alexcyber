/* ═══════════════════════════════════════════════════════════
   AlexRecon - Best-effort common-port check (approved v1 scope)
   Small fixed common-port list, strict timeouts, no external
   API. Explicitly labeled best-effort/non-exhaustive - this is
   NOT a substitute for a real port scanner like nmap.
═══════════════════════════════════════════════════════════ */

const net = require('net');

// Deliberately small - a handful of the most common service ports,
// not an exhaustive scan. Keeps scan time reasonable and stays on
// the passive-adjacent side of "authorized testing only."
const COMMON_PORTS = [
  { port: 21, service: 'FTP' },
  { port: 22, service: 'SSH' },
  { port: 25, service: 'SMTP' },
  { port: 53, service: 'DNS' },
  { port: 80, service: 'HTTP' },
  { port: 110, service: 'POP3' },
  { port: 143, service: 'IMAP' },
  { port: 443, service: 'HTTPS' },
  { port: 465, service: 'SMTPS' },
  { port: 587, service: 'SMTP (submission)' },
  { port: 993, service: 'IMAPS' },
  { port: 995, service: 'POP3S' },
  { port: 3306, service: 'MySQL' },
  { port: 3389, service: 'RDP' },
  { port: 5432, service: 'PostgreSQL' },
  { port: 6379, service: 'Redis' },
  { port: 8080, service: 'HTTP-alt' },
  { port: 8443, service: 'HTTPS-alt' },
  { port: 27017, service: 'MongoDB' }
];

function checkPort(host, port, timeoutMs = 2500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;

    const finish = (open) => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve(open);
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));

    socket.connect(port, host);
  });
}

async function commonPortCheck(host, concurrency = 6) {
  const results = [];
  let idx = 0;

  async function worker() {
    while (idx < COMMON_PORTS.length) {
      const { port, service } = COMMON_PORTS[idx++];
      const open = await checkPort(host, port);
      if (open) results.push({ port, service });
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  return {
    scanned: COMMON_PORTS.length,
    openPorts: results.sort((a, b) => a.port - b.port),
    disclaimer: 'Best-effort check against a small common-port list only. Not exhaustive and not a substitute for a real scanner like nmap. For authorized testing only.'
  };
}

module.exports = { commonPortCheck, COMMON_PORTS };
