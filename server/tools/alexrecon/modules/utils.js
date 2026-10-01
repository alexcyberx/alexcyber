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

module.exports = {
  DEFAULT_TIMEOUT_MS,
  withTimeout,
  fetchWithTimeout,
  detectTargetType,
  normalizeDomain,
  runModulesParallel
};
