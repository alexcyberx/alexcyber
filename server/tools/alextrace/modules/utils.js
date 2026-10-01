/* ═══════════════════════════════════════════════════════════
   AlexTrace - shared helpers
   Small utilities used across every AlexTrace module. Timeout
   wrapper mirrors AlexRecon's modules/utils.js so behavior is
   consistent across tools, but kept local to this tool rather
   than importing across tool boundaries.
═══════════════════════════════════════════════════════════ */

const DEFAULT_TIMEOUT_MS = 6000;

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

// Username: letters, numbers, dot, underscore, hyphen only.
// Kept intentionally permissive since platforms vary, but blocks
// anything that could be used for injection/path traversal in the
// URLs we build downstream.
function isValidUsername(input) {
  return /^[a-zA-Z0-9._-]{2,39}$/.test(String(input || '').trim());
}

function isValidEmail(input) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(input || '').trim());
}

// Runs a set of named async checks in parallel with a shared cap on
// concurrency-free execution (Promise.all already parallelizes, but
// each individual check is wrapped so one slow/broken platform never
// drags the rest of the report down or throws the whole batch out).
async function runChecksParallel(checkMap) {
  const entries = Object.entries(checkMap);
  const results = await Promise.all(
    entries.map(async ([name, fn]) => {
      try {
        const data = await fn();
        return [name, { ok: true, data }];
      } catch (err) {
        return [name, { ok: false, error: err.message || 'Check failed', data: null }];
      }
    })
  );
  return Object.fromEntries(results);
}

// MD5 is required by Gravatar's API contract (not used for any
// security purpose here, just their lookup key format).
const crypto = require('crypto');
function md5(input) {
  return crypto.createHash('md5').update(String(input || '').trim().toLowerCase()).digest('hex');
}

module.exports = {
  DEFAULT_TIMEOUT_MS,
  withTimeout,
  fetchWithTimeout,
  isValidUsername,
  isValidEmail,
  runChecksParallel,
  md5
};
