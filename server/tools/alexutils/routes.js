/* ═══════════════════════════════════════════════════════════
   ALEXUTILS - combined cybersecurity utility toolkit
   ═══════════════════════════════════════════════════════════
   Consolidates what used to be the admin-only "Cyber Tools"
   panel into a single tool on the main site. Utilities that
   need a real backend call (SSL check, MAC vendor lookup, CVE
   search, IP/DNS lookup) are served here. The rest (Base64, URL
   encode, hashing, subnet calc, password tools, JWT decode,
   regex tester, JSON formatter, UUID generator) run entirely in
   the browser - pure math/crypto with no need for a round trip.

   All routes require login and respect the admin's enable/disable
   switch for the 'alexutils' tool, same as Mistake
   Analyzer/AlexRecon.
═══════════════════════════════════════════════════════════ */

const express = require('express');
const net = require('net');
const router = express.Router();
const { requireToolLogin, checkToolEnabled, logToolUsage } = require('../../middleware/toolAccess');
// Har endpoint group ka apna bucket (pehle sab + Mistake Analyzer ek hi
// analyzeLimiter share karte the). Keyed by user, so mounted after login.
const {
  utilsSslLimiter, utilsMacLimiter, utilsCveLimiter, utilsIpLimiter, utilsDnsLimiter
} = require('../../middleware/rateLimit');

const { sslCheck } = require('./ssl');
const { macLookup } = require('./mac');
const { cveSearch } = require('./cve');
const { ipLookup, dnsResolve } = require('./ipdns');
const { normalizeHost, isHostname, isInternalName, resolvePublic } = require('./target');
const { withTimeout } = require('../alexrecon/modules/utils');

// All AlexUtils endpoints share the same gate: logged in + tool enabled.
router.use(requireToolLogin, checkToolEnabled('alexutils'));

router.post('/ssl-check', utilsSslLimiter, async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain || typeof domain !== 'string' || !domain.trim()) {
      return res.status(400).json({ error: 'Please enter a domain to check.' });
    }
    const host = normalizeHost(domain);
    if (!net.isIP(host) && !isHostname(host)) {
      return res.status(400).json({ error: 'Please enter a valid domain (e.g. example.com).' });
    }

    // SSRF guard: server ke andar se TLS connect hota hai, to localhost /
    // 10.x / 169.254.169.254 (metadata) / internal names refuse karo. Phir
    // usi checked IP pe connect karte hain (no second DNS lookup).
    let ip;
    try {
      ({ ip } = await withTimeout(resolvePublic(host), 6000, 'DNS lookup'));
    } catch (err) {
      if (err.privateTarget) return res.status(400).json({ error: err.message });
      return res.json({ available: false, note: `Could not resolve ${host}.` });
    }

    const result = await sslCheck(host, ip);
    logToolUsage('alexutils', req.toolUserId);
    res.json(result);
  } catch (err) {
    console.error('[AlexUtils] ssl-check failed:', err.message);
    res.status(500).json({ error: 'Could not check SSL certificate. Please try again.' });
  }
});

router.post('/mac-lookup', utilsMacLimiter, async (req, res) => {
  try {
    const { mac } = req.body;
    if (!mac || typeof mac !== 'string' || !mac.trim()) {
      return res.status(400).json({ error: 'Please enter a MAC address.' });
    }
    const result = await macLookup(mac.trim());
    logToolUsage('alexutils', req.toolUserId);
    res.json(result);
  } catch (err) {
    console.error('[AlexUtils] mac-lookup failed:', err.message);
    res.status(500).json({ error: 'Could not look up MAC address. Please try again.' });
  }
});

router.post('/cve-search', utilsCveLimiter, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Please enter a CVE ID or keyword.' });
    }
    const result = await cveSearch(query);
    logToolUsage('alexutils', req.toolUserId);
    res.json(result);
  } catch (err) {
    console.error('[AlexUtils] cve-search failed:', err.message);
    res.status(500).json({ error: 'Could not search CVEs. Please try again.' });
  }
});

router.post('/ip-lookup', utilsIpLimiter, async (req, res) => {
  try {
    const { value } = req.body;
    if (!value || typeof value !== 'string' || !value.trim()) {
      return res.status(400).json({ error: 'Please enter an IP address or domain.' });
    }
    // Pasted URL -> bare host. Junk like "." / ".." used to become
    // https://ipapi.co/json/ = the SERVER's own location.
    const host = normalizeHost(value);
    // (internal names / private IPs are answered by ipLookup as found:false)
    if (!net.isIP(host) && !isHostname(host)) {
      return res.status(400).json({ error: 'Please enter a valid IP address or domain (e.g. 8.8.8.8 or google.com).' });
    }
    const result = await ipLookup(host);
    logToolUsage('alexutils', req.toolUserId);
    res.json(result);
  } catch (err) {
    console.error('[AlexUtils] ip-lookup failed:', err.message);
    res.status(500).json({ error: 'Could not look up IP. Please try again.' });
  }
});

router.post('/dns-resolve', utilsDnsLimiter, async (req, res) => {
  try {
    const { domain, recordType } = req.body;
    if (!domain || typeof domain !== 'string' || !domain.trim()) {
      return res.status(400).json({ error: 'Please enter a domain.' });
    }
    // Same cleanup as the SSL check, so a pasted https://example.com/ works.
    const host = normalizeHost(domain);
    if (net.isIP(host)) {
      return res.status(400).json({ error: 'Please enter a domain name, not an IP address (use IP Lookup for IPs).' });
    }
    if (!isHostname(host)) {
      return res.status(400).json({ error: 'Please enter a valid domain (e.g. example.com).' });
    }
    // Server ka resolver internal names (*.internal, *.local, ...) jaanta
    // hai, public internet nahi. Woh query nahi karne dete.
    if (isInternalName(host)) {
      return res.status(400).json({ error: 'Internal or local names cannot be looked up.' });
    }
    const result = await dnsResolve(host, String(recordType || 'A').toUpperCase());
    logToolUsage('alexutils', req.toolUserId);
    res.json(result);
  } catch (err) {
    console.error('[AlexUtils] dns-resolve failed:', err.message);
    res.status(500).json({ error: 'Could not resolve DNS records. Please try again.' });
  }
});

module.exports = router;
