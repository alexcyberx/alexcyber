/* ═══════════════════════════════════════════════════════════
   AlexRecon - shared helpers
   Timeouts, target-type detection, and small utilities used
   across every recon module so each module doesn't reimplement
   its own timeout/fetch wrapper.
═══════════════════════════════════════════════════════════ */

const DEFAULT_TIMEOUT_MS = 8000;

// Wrap any promise with a hard timeout. Used so one slow module
// (a target that never responds, a flaky third-party API) never
// hangs the entire scan - it just reports "unavailable" instead.
function withTimeout(promise, ms = DEFAULT_TIMEOUT_MS, label = 'operation') {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function fetchWithTimeout(url, options = {}, ms = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Detects whether the user's input looks like a domain, a bare IP,
// or should be treated as an org/free-text name (only domain and IP
// are fully supported end-to-end in v1; org name still runs the
// modules that make sense for free text, like GitHub org lookup).
function detectTargetType(input) {
  const trimmed = String(input || '').trim();
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  const domain = /^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(\.[a-zA-Z0-9-]{1,63})+$/;

  if (ipv4.test(trimmed)) return 'ip';
  if (domain.test(trimmed)) return 'domain';
  return 'org';
}

// Strips protocol/path/port from a domain-ish input so modules that
// need a bare hostname (DNS, TLS) get a clean value regardless of
// whether the user pasted a full URL.
function normalizeDomain(input) {
  let val = String(input || '').trim().toLowerCase();
  val = val.replace(/^https?:\/\//, '');
  val = val.split('/')[0];
  val = val.split(':')[0];
  return val;
}

// Runs a set of named async module functions in parallel, catching
// each one individually so a single module failure never takes down
// the rest of the report. Returns { moduleName: { ok, data|error } }.
async function runModulesParallel(moduleMap) {
  const entries = Object.entries(moduleMap);
  const results = await Promise.all(
    entries.map(async ([name, fn]) => {
      try {
        const data = await fn();
        return [name, { ok: true, data }];
      } catch (err) {
        return [name, { ok: false, error: err.message || 'Module failed', data: null }];
      }
    })
  );
  return Object.fromEntries(results);
}


// ── Target safety (SSRF guard) ───────────────────────────────
// Recon modules make server-side requests to whatever the user typed.
// Resolve the domain first and refuse anything that points at a private,
// loopback, link-local (cloud metadata 169.254.x), CGNAT or otherwise
// non-public address. Note: this checks the DNS answer at scan start; it
// does not fully stop DNS rebinding between this check and later requests.
const dns = require('dns').promises;
const net = require('net');

function isPrivateIPv4(ip) {
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = p;
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||   // CGNAT
    (a === 169 && b === 254) ||             // link-local / metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0 && p[2] === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224                                // multicast / reserved
  );
}

function isPrivateIP(ip) {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip);
  if (net.isIPv6(ip)) {
    const v = ip.toLowerCase();
    if (v === '::1' || v === '::') return true;
    if (v.startsWith('fc') || v.startsWith('fd')) return true;          // unique local
    if (v.startsWith('fe8') || v.startsWith('fe9') || v.startsWith('fea') || v.startsWith('feb')) return true; // link-local
    const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);        // IPv4-mapped
    if (mapped) return isPrivateIPv4(mapped[1]);
    return false;
  }
  return true; // not a valid IP -> treat as unsafe
}

async function assertPublicDomain(domain) {
  let addrs;
  try {
    addrs = await dns.lookup(domain, { all: true });
  } catch (e) {
    // Unresolvable domains are harmless to the server; let the modules
    // report "no DNS records" themselves.
    return;
  }
  if (addrs.some((a) => isPrivateIP(a.address))) {
    throw Object.assign(
      new Error('This target resolves to a private or internal address and cannot be scanned.'),
      { statusCode: 400 }
    );
  }
}

module.exports = {
  DEFAULT_TIMEOUT_MS,
  withTimeout,
  fetchWithTimeout,
  detectTargetType,
  normalizeDomain,
  runModulesParallel,
  isPrivateIP,
  assertPublicDomain
};
