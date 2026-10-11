/* ═══════════════════════════════════════════════════════════
   AlexUtils - target input cleanup + SSRF guard
   Users paste all kinds of things into the domain/IP boxes
   ("https://Example.com/path", "example.com.", "[::1]:443").
   normalizeHost() turns that into a bare host. SSL check and IP
   lookup then go through resolvePublic(), which refuses anything
   that is (or resolves to) a private / loopback / link-local /
   metadata address and returns the IP that was checked, so the
   caller can connect to exactly that IP (no DNS rebinding gap).
═══════════════════════════════════════════════════════════ */

const dns = require('dns').promises;
const net = require('net');
const { domainToASCII } = require('url');
// Reuse AlexRecon's private-range check (read-only import).
const { isPrivateIP } = require('../alexrecon/modules/utils');

// AlexRecon ka isPrivateIP IPv4 ranges acche se cover karta hai, lekin
// kuch IPv6 forms miss karta hai (::ffff:7f00:1 hex-mapped, NAT64, 6to4,
// Teredo, site-local, multicast). Woh yahan extra block karte hain.
const EXTRA_BLOCKED_V6 = new net.BlockList();
[
  ['::', 96],           // IPv4-compatible (deprecated), incl. :: and ::1
  ['::ffff:0:0', 96],   // IPv4-mapped, any spelling
  ['::ffff:0:0:0', 96], // IPv4-translated
  ['64:ff9b::', 96],    // NAT64
  ['64:ff9b:1::', 48],  // NAT64 local-use
  ['100::', 64],        // discard-only
  ['2001::', 23],       // IETF special (Teredo, benchmarking, ORCHID)
  ['2001:db8::', 32],   // documentation
  ['2002::', 16],       // 6to4 (embeds an IPv4)
  ['fc00::', 7],        // unique local
  ['fe80::', 10],       // link-local
  ['fec0::', 10],       // site-local (deprecated)
  ['ff00::', 8]         // multicast
].forEach(([prefix, len]) => EXTRA_BLOCKED_V6.addSubnet(prefix, len, 'ipv6'));

function isPublicAddress(ip) {
  if (!net.isIP(ip)) return false;
  if (isPrivateIP(ip)) return false;
  if (net.isIPv6(ip) && EXTRA_BLOCKED_V6.check(ip, 'ipv6')) return false;
  return true;
}

// Names that only mean something inside a private network. The server's
// resolver may know them, the public internet does not.
const INTERNAL_SUFFIXES = ['localhost', 'local', 'localdomain', 'internal', 'intranet', 'lan', 'home', 'corp', 'home.arpa'];

function isInternalName(host) {
  return INTERNAL_SUFFIXES.some((s) => host === s || host.endsWith('.' + s));
}

// At least two labels, TLD alphabetic (or punycode). Underscore allowed in
// labels for DNS names like _dmarc.example.com.
const HOSTNAME_RE = /^(?=.{1,253}$)(?:(?!-)[a-z0-9_-]{1,63}(?<!-)\.)+(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})$/;

function isHostname(host) {
  return HOSTNAME_RE.test(host);
}

// Strip scheme, userinfo, path/query/fragment, port, [] around IPv6 and
// trailing dots; lowercase; IDN -> punycode. Returns '' for junk.
function normalizeHost(input) {
  let v = String(input || '').trim().toLowerCase();
  v = v.replace(/^[a-z][a-z0-9+.\-]*:\/\//, ''); // http://, https://, ...
  v = v.split(/[/?#]/)[0];                        // path / query / fragment
  if (v.includes('@')) v = v.slice(v.lastIndexOf('@') + 1); // user:pass@
  const bracketed = v.match(/^\[([^\]]+)\](?::\d*)?$/);     // [v6] or [v6]:443
  if (bracketed) {
    v = bracketed[1];
  } else if (!net.isIPv6(v)) {
    v = v.replace(/:\d*$/, '');                   // host:port
  }
  v = v.replace(/\.+$/, '');                      // example.com. -> example.com
  if (/[^\x00-\x7f]/.test(v) && !/\s/.test(v)) v = domainToASCII(v) || v;
  return v;
}

// Resolve a hostname and make sure EVERY answer is public. Returns
// { ip, addresses }. Throws { statusCode: 400 } for private targets and
// { code: 'ENOTFOUND' ... } (from dns) when the name does not resolve.
async function resolvePublic(host) {
  if (net.isIP(host)) {
    if (!isPublicAddress(host)) throw privateTargetError();
    return { ip: host, addresses: [host] };
  }
  if (isInternalName(host)) throw privateTargetError();
  const answers = await dns.lookup(host, { all: true });
  const addresses = (answers || []).map((a) => a.address);
  if (!addresses.length || addresses.some((a) => !isPublicAddress(a))) throw privateTargetError();
  // IPv4 pehle, geolocation / TLS ke liye zyada common
  const ip = addresses.find((a) => net.isIPv4(a)) || addresses[0];
  return { ip, addresses };
}

function privateTargetError() {
  return Object.assign(new Error('This target is a private or internal address and cannot be checked.'), {
    statusCode: 400,
    privateTarget: true
  });
}

module.exports = { normalizeHost, isHostname, isInternalName, isPublicAddress, resolvePublic };
