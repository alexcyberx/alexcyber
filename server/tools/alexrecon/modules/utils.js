/* ═══════════════════════════════════════════════════════════
   AlexRecon - shared helpers
   Timeouts, target-type detection, and small utilities used
   across every recon module so each module doesn't reimplement
   its own timeout/fetch wrapper.
═══════════════════════════════════════════════════════════ */

const DEFAULT_TIMEOUT_MS = 8000;
// Hard cap on how many bytes we will read from any single response body.
// Protects the single Express process from a target that streams an
// endless/huge body (OOM) - we stop reading once this is hit.
const MAX_FETCH_BYTES = 2 * 1024 * 1024; // 2 MB

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
// NOTE: call this on an already-normalized value (see normalizeTarget)
// so pasted URLs / ports / trailing dots are not mis-classified as 'org'.
function detectTargetType(input) {
  const trimmed = String(input || '').trim();
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  const domain = /^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(\.[a-zA-Z0-9-]{1,63})+$/;

  if (ipv4.test(trimmed)) return 'ip';
  if (domain.test(trimmed)) return 'domain';
  return 'org';
}

// Strips scheme/userinfo/path/query/fragment/port and a trailing dot
// from a domain-ish input, lowercased. Used BEFORE type detection so a
// pasted "https://example.com/", "www.example.com:443" or "example.com."
// is recognised as the same domain instead of falling through to 'org'.
function normalizeTarget(input) {
  // Way longer than any hostname: junk (and the string work below must not
  // run on a 100 KB field, see stripTrailingDots).
  if (String(input || '').length > 2048) return '';
  let val = String(input || '').trim().toLowerCase();
  val = val.replace(/^[a-z][a-z0-9+.\-]*:\/\//, ''); // strip scheme (http://, https://, ...)
  if (val.includes('@')) val = val.split('@').pop(); // strip user:pass@ userinfo
  val = val.split('/')[0].split('?')[0].split('#')[0]; // strip path/query/fragment
  val = val.replace(/:\d+$/, '');                    // strip trailing :port
  val = stripTrailingDots(val);                      // strip trailing dot(s)
  return val;
}

// Linear: /\.+$/ is quadratic in V8 on a long run of dots followed by any
// other character (99 KB of dots froze the process for ~8 s).
function stripTrailingDots(v) {
  let end = v.length;
  while (end > 0 && v.charCodeAt(end - 1) === 46) end--;
  return end === v.length ? v : v.slice(0, end);
}

// Full hostname normalisation for modules that need a bare hostname
// (DNS, TLS): normalizeTarget + punycode for IDNs (so "exämple.com"
// becomes the ASCII form the resolver and detectTargetType understand).
function normalizeDomain(input) {
  const stripped = normalizeTarget(input);
  // Only attempt punycode on something that still looks host-like and
  // carries non-ASCII; url.domainToASCII returns '' for junk like spaces.
  if (/[^\x00-\x7f]/.test(stripped) && !/\s/.test(stripped)) {
    const puny = require('url').domainToASCII(stripped);
    if (puny) return puny;
  }
  return stripped;
}

// Normalise once, then classify. Shared by POST /scan and POST /schedules
// so both see the same target type and the same cleaned domain.
function classifyTarget(input) {
  const normalized = normalizeDomain(input);
  const targetType = detectTargetType(normalized);
  return {
    targetType,
    domain: targetType === 'domain' ? normalized : null,
    normalized
  };
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
// Every outbound request - the first hop, each HTTP redirect, each
// crt.sh-derived subdomain, each <script src> and each probe - must
// resolve to a PUBLIC address. We re-resolve DNS for every host and pin
// the connection to the checked IP (see safeLookup), so a redirect to
// 169.254.169.254 / 127.0.0.1 / 10.x / a Render private service, or a
// DNS-rebinding flip between check and connect, is refused.
const dns = require('dns').promises;
const dnsCb = require('dns');
const net = require('net');
const http = require('http');
const https = require('https');
const zlib = require('zlib');
const ipaddr = require('ipaddr.js'); // direct dependency in package.json

// Ranges ipaddr.js 1.9.1 still calls 'unicast' but that are not ordinary
// public addresses (benchmarking, documentation, reserved, IPv4-compatible
// / NAT64 / 6to4 / Teredo embeddings, site-local). AlexUtils uses the same check.
// Two lists: in one BlockList the IPv6 rules (::/96, ::ffff:0:0/96) would
// also match every IPv4 address.
const EXTRA_BLOCKED_V4 = new net.BlockList();
[['198.18.0.0', 15], ['192.0.0.0', 24], ['192.0.2.0', 24], ['198.51.100.0', 24], ['203.0.113.0', 24], ['240.0.0.0', 4]]
  .forEach(([p, l]) => EXTRA_BLOCKED_V4.addSubnet(p, l, 'ipv4'));
const EXTRA_BLOCKED_V6 = new net.BlockList();
[['::', 96], ['::ffff:0:0', 96], ['::ffff:0:0:0', 96], ['64:ff9b::', 96], ['64:ff9b:1::', 48], ['100::', 64],
  ['2001::', 23], ['2001:db8::', 32], ['2002::', 16], ['fc00::', 7], ['fe80::', 10], ['fec0::', 10], ['ff00::', 8]]
  .forEach(([p, l]) => EXTRA_BLOCKED_V6.addSubnet(p, l, 'ipv6'));

// HTTP(S) follow-up fetches are only allowed to these ports. The common-port
// TCP check (ports.js) and the TLS handshake (ssl.js) are separate features
// and do not go through this list.
const ALLOWED_HTTP_PORTS = new Set([80, 443, 8080, 8443]);

// An address is only safe if it is ordinary public unicast. ipaddr.js
// classifies everything else - private, loopback, link-local (incl. the
// 169.254.169.254 metadata address), CGNAT, IPv6 ULA/link-local, and
// IPv4-mapped / 6to4 / Teredo embeddings - into its own range, so an
// allowlist on 'unicast' blocks all of them without us enumerating ranges.
function isPublicIP(ip) {
  let addr;
  try {
    addr = ipaddr.parse(String(ip));
  } catch (e) {
    return false; // not a valid IP -> not safe
  }
  if (addr.kind() === 'ipv6') {
    // IPv4-mapped / translated IPv6 is a classic SSRF bypass - refuse it
    // outright rather than trusting the embedded IPv4.
    if (typeof addr.isIPv4MappedAddress === 'function' && addr.isIPv4MappedAddress()) return false;
    return addr.range() === 'unicast' && !EXTRA_BLOCKED_V6.check(addr.toNormalizedString(), 'ipv6');
  }
  return addr.range() === 'unicast' && !EXTRA_BLOCKED_V4.check(addr.toString(), 'ipv4');
}

function isPrivateIP(ip) {
  return !isPublicIP(ip);
}

// Custom DNS lookup for http/https/net/tls: resolves the hostname, keeps
// only public addresses, and hands the socket exactly those IPs. Because
// the socket connects to the IP we validated (not a fresh resolution),
// this also closes the DNS-rebinding window. Signature matches Node's
// `lookup` option (supports both the all:true and single-address forms).
function safeLookup(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  dnsCb.lookup(hostname, { all: true, verbatim: true }, (err, addresses) => {
    if (err) return callback(err);
    const list = Array.isArray(addresses)
      ? addresses
      : [{ address: addresses, family: (options && options.family) || 4 }];
    const safe = list.filter((a) => isPublicIP(a.address));
    if (!safe.length) {
      return callback(Object.assign(
        new Error(`Host "${hostname}" does not resolve to a public address.`),
        { code: 'ESSRFBLOCKED' }
      ));
    }
    if (options && options.all) return callback(null, safe);
    return callback(null, safe[0].address, safe[0].family);
  });
}

// Decompresses a gzip/br/deflate body but never produces more than maxBytes.
// The raw read is already capped, but a target can ignore our
// "Accept-Encoding: identity" and send a tiny zip bomb (657 bytes of brotli
// -> 400 MB), so the DECODED size needs its own cap. Output is streamed and
// we stop at the cap, keeping the prefix (enough for title / JS checks).
// Resolves { buf, truncated }.
function decodeBody(buf, encoding, maxBytes = MAX_FETCH_BYTES) {
  const enc = String(encoding || '').toLowerCase();
  let decoder = null;
  // Lenient finishFlush: a body we cut at the raw cap still decodes up to the cut.
  if (enc.includes('br')) decoder = zlib.createBrotliDecompress({ finishFlush: zlib.constants.BROTLI_OPERATION_FLUSH });
  else if (enc.includes('gzip')) decoder = zlib.createGunzip({ finishFlush: zlib.constants.Z_SYNC_FLUSH });
  else if (enc.includes('deflate')) decoder = zlib.createInflate({ finishFlush: zlib.constants.Z_SYNC_FLUSH });
  if (!decoder || !buf.length) return Promise.resolve({ buf, truncated: false });

  return new Promise((resolve) => {
    const out = [];
    let size = 0;
    let finished = false;
    const finish = (truncated, failed) => {
      if (finished) return;
      finished = true;
      decoder.destroy(); // stop inflating - nothing past the cap is ever produced
      // Mislabelled body (says gzip, isn't): keep the raw bytes, already <= maxBytes.
      if (failed && size === 0) return resolve({ buf, truncated: false });
      resolve({ buf: Buffer.concat(out, size), truncated });
    };
    decoder.on('data', (chunk) => {
      if (finished) return;
      if (size + chunk.length > maxBytes) {
        out.push(chunk.subarray(0, maxBytes - size));
        size = maxBytes;
        return finish(true);
      }
      out.push(chunk);
      size += chunk.length;
    });
    decoder.on('end', () => finish(false));
    decoder.on('error', () => finish(false, true)); // corrupt stream: keep what decoded
    decoder.end(buf);
  });
}

// One validated, size-capped, deadline-bounded request. Does NOT follow
// redirects (safeFetch handles that per-hop so every Location is checked).
function rawRequest(urlStr, opts) {
  const { method = 'GET', headers = {}, timeoutMs = DEFAULT_TIMEOUT_MS, maxBytes = MAX_FETCH_BYTES } = opts || {};
  return new Promise((resolve, reject) => {
    let url;
    try {
      url = new URL(urlStr);
    } catch (e) {
      return reject(Object.assign(new Error('Invalid URL.'), { code: 'EBADURL' }));
    }
    const mod = url.protocol === 'https:' ? https : (url.protocol === 'http:' ? http : null);
    if (!mod) {
      return reject(Object.assign(new Error(`Blocked scheme "${url.protocol}" (only http/https allowed).`), { code: 'EBADSCHEME' }));
    }
    const port = url.port ? Number(url.port) : (url.protocol === 'https:' ? 443 : 80);
    if (!ALLOWED_HTTP_PORTS.has(port)) {
      return reject(Object.assign(new Error(`Blocked port ${port} for HTTP fetch.`), { code: 'EBADPORT' }));
    }
    // Node skips the custom `lookup` when the host is an IP literal, so a
    // redirect/script-src pointing straight at http://169.254.169.254/ or
    // http://10.0.0.5/ would otherwise connect unchecked. Validate it here.
    if (net.isIP(url.hostname) && !isPublicIP(url.hostname)) {
      return reject(Object.assign(new Error(`Host "${url.hostname}" is not a public address.`), { code: 'ESSRFBLOCKED' }));
    }

    let settled = false;
    let finishing = false; // body fully read, decode in progress
    let req;
    const done = (fn, arg) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      try { if (req) req.destroy(); } catch (e) {}
      fn(arg);
    };
    // Hard overall deadline: covers connect + headers + the body read, so a
    // slow-drip body can't keep the request (and the scan) alive forever.
    const deadline = setTimeout(
      () => done(reject, Object.assign(new Error(`Request to ${url.host} timed out after ${timeoutMs}ms`), { code: 'ETIMEDOUT' })),
      timeoutMs
    );

    req = mod.request({
      protocol: url.protocol,
      hostname: url.hostname,
      port,
      path: (url.pathname || '/') + (url.search || ''),
      method,
      headers: { 'User-Agent': 'AlexRecon', 'Accept-Encoding': 'identity', ...headers },
      lookup: safeLookup,
      servername: url.protocol === 'https:' ? url.hostname : undefined
    }, (res) => {
      // HEAD and redirect responses: don't buffer a body.
      const isRedirect = res.statusCode >= 300 && res.statusCode < 400;
      if (method === 'HEAD' || isRedirect) {
        res.resume(); // drain and discard
        res.on('end', () => {});
        return done(resolve, buildResponse(res, Buffer.alloc(0), false));
      }
      const chunks = [];
      let received = 0;
      let truncated = false;
      const clen = Number(res.headers['content-length']);
      if (Number.isFinite(clen) && clen > maxBytes) truncated = true;
      res.on('data', (chunk) => {
        if (settled || finishing) return;
        if (received + chunk.length > maxBytes) {
          chunks.push(chunk.subarray(0, maxBytes - received)); // keep up to the cap
          received = maxBytes;
          truncated = true;
          res.destroy(); // stop reading; we have enough
          return;
        }
        received += chunk.length;
        chunks.push(chunk);
      });
      const finish = () => {
        if (settled || finishing) return;
        finishing = true; // 'end' and 'close' both land here; decode once
        // Decoded size is capped too (zip bombs), see decodeBody.
        decodeBody(Buffer.concat(chunks), res.headers['content-encoding'], maxBytes)
          .then(({ buf, truncated: cut }) => done(resolve, buildResponse(res, buf, truncated || cut)));
      };
      res.on('end', finish);
      res.on('close', finish);
      // Once the body is in hand, a late socket error must not throw it away.
      res.on('error', (e) => { if (!finishing) done(reject, e); });
    });

    req.on('error', (e) => { if (!finishing) done(reject, e); });
    req.end();
  });
}

function buildResponse(res, bodyBuf, truncated) {
  const nodeHeaders = res.headers || {};
  const headers = {
    get(name) {
      const v = nodeHeaders[String(name).toLowerCase()];
      if (v === undefined) return null;
      return Array.isArray(v) ? v.join(', ') : v;
    },
    entries() {
      return Object.entries(nodeHeaders).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : v]);
    },
    raw: nodeHeaders
  };
  const status = res.statusCode;
  let text = null;
  return {
    status,
    ok: status >= 200 && status < 300,
    headers,
    truncated,
    locationHeader: headers.get('location'),
    async text() {
      if (text === null) text = bodyBuf.toString('utf8');
      return text;
    },
    async json() {
      return JSON.parse(bodyBuf.toString('utf8'));
    }
  };
}

// SSRF-safe fetch used by every AlexRecon HTTP module. Validates scheme,
// port and (via safeLookup) the resolved IP of the host AND of every
// redirect hop. maxRedirects defaults to 0 (redirects are surfaced, not
// followed) - pass a small N only where following is actually wanted.
async function safeFetch(urlStr, opts = {}) {
  const {
    method = 'GET',
    headers = {},
    maxRedirects = 0,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxBytes = MAX_FETCH_BYTES
  } = opts;

  const chain = [];
  let current = urlStr;
  const startedAt = Date.now();

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const remaining = timeoutMs - (Date.now() - startedAt);
    if (remaining <= 0) {
      throw Object.assign(new Error('Request timed out following redirects.'), { code: 'ETIMEDOUT' });
    }
    const res = await rawRequest(current, { method, headers, timeoutMs: remaining, maxBytes });
    chain.push({ url: current, status: res.status });

    if (res.status >= 300 && res.status < 400 && res.locationHeader && hop < maxRedirects) {
      let next;
      try {
        next = new URL(res.locationHeader, current).toString();
      } catch (e) {
        res.redirectChain = chain;
        res.finalUrl = current;
        return res; // unparseable Location - stop here
      }
      current = next;
      continue;
    }

    res.redirectChain = chain;
    res.finalUrl = current;
    return res;
  }

  // Ran out of hops - re-issue the last target once so the caller still
  // gets a response object (its status will be the final redirect).
  const res = await rawRequest(current, { method, headers, timeoutMs: Math.max(1, timeoutMs - (Date.now() - startedAt)), maxBytes });
  res.redirectChain = chain;
  res.finalUrl = current;
  return res;
}

// eTLD+1 ("registrable domain") so cloud-bucket and GitHub-org guessing
// use the brand label, not the first DNS label: www.example.com and
// mail.example.com both map to "example", example.co.uk maps to "example".
// Small built-in multi-part suffix list (no public-suffix dependency).
const MULTI_PART_SUFFIXES = new Set([
  'co.uk', 'org.uk', 'me.uk', 'ltd.uk', 'plc.uk', 'net.uk', 'ac.uk', 'gov.uk',
  'co.in', 'net.in', 'org.in', 'firm.in', 'gen.in', 'ind.in',
  'com.au', 'net.au', 'org.au', 'edu.au', 'gov.au', 'id.au',
  'co.nz', 'net.nz', 'org.nz', 'govt.nz',
  'co.za', 'org.za', 'net.za',
  'com.br', 'net.br', 'org.br', 'gov.br',
  'com.sg', 'edu.sg', 'gov.sg',
  'co.jp', 'or.jp', 'ne.jp', 'go.jp', 'ac.jp',
  'com.cn', 'net.cn', 'org.cn', 'gov.cn',
  'com.mx', 'com.tr', 'com.ua', 'com.ar', 'com.pl',
  // Shared-hosting platforms: each user/app gets its own subdomain, so the
  // brand is the label in front of the platform (alex.github.io -> "alex"),
  // not the platform itself - otherwise we'd report GitHub's own org/buckets.
  'github.io', 'gitlab.io', 'vercel.app', 'netlify.app', 'onrender.com',
  'herokuapp.com', 'pages.dev', 'workers.dev', 'web.app', 'firebaseapp.com',
  'appspot.com', 'azurewebsites.net', 'cloudfront.net', 'blogspot.com',
  'wordpress.com', 'wixsite.com', 'glitch.me', 'repl.co', 'fly.dev',
  'railway.app', 'up.railway.app', 'surge.sh'
]);

function registrableDomain(domain) {
  const parts = String(domain || '').split('.').filter(Boolean);
  if (parts.length <= 2) return parts.join('.');
  // Longest known suffix wins (x.up.railway.app -> x, not "up").
  for (const n of [3, 2]) {
    if (parts.length > n && MULTI_PART_SUFFIXES.has(parts.slice(-n).join('.'))) {
      return parts.slice(-(n + 1)).join('.');
    }
  }
  return parts.slice(-2).join('.');
}

function registrableLabel(domain) {
  const reg = registrableDomain(domain);
  return reg.split('.')[0] || '';
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
  if (!addrs.length || addrs.some((a) => isPrivateIP(a.address))) {
    throw Object.assign(
      new Error('This target resolves to a private or internal address and cannot be scanned.'),
      { statusCode: 400 }
    );
  }
}

module.exports = {
  DEFAULT_TIMEOUT_MS,
  MAX_FETCH_BYTES,
  withTimeout,
  fetchWithTimeout,
  safeFetch,
  safeLookup,
  detectTargetType,
  normalizeTarget,
  normalizeDomain,
  classifyTarget,
  runModulesParallel,
  isPrivateIP,
  isPublicIP,
  registrableDomain,
  registrableLabel,
  assertPublicDomain
};
