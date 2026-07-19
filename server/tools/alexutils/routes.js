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
   switch for the 'alexutils' tool, same as AlexSync/Mistake
   Analyzer/AlexRecon.
═══════════════════════════════════════════════════════════ */

const express = require('express');
const router = express.Router();
const { requireToolLogin, checkToolEnabled, logToolUsage } = require('../../middleware/toolAccess');
const { analyzeLimiter } = require('../../middleware/rateLimit');

const { sslIntelligence } = require('../alexrecon/modules/ssl');
const { macLookup } = require('./mac');
const { cveSearch } = require('./cve');
const { ipLookup, dnsResolve } = require('./ipdns');

// All AlexUtils endpoints share the same gate: logged in + tool enabled.
router.use(requireToolLogin, checkToolEnabled('alexutils'));

router.post('/ssl-check', analyzeLimiter, async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain || typeof domain !== 'string' || !domain.trim()) {
      return res.status(400).json({ error: 'Please enter a domain to check.' });
    }
    const clean = domain.trim().replace(/^https?:\/\//, '').split('/')[0];
    const result = await sslIntelligence(clean);
    logToolUsage('alexutils', req.toolUserId);
    res.json(result);
  } catch (err) {
    console.error('[AlexUtils] ssl-check failed:', err.message);
    res.status(500).json({ error: 'Could not check SSL certificate. Please try again.' });
  }
});

router.post('/mac-lookup', analyzeLimiter, async (req, res) => {
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

router.post('/cve-search', analyzeLimiter, async (req, res) => {
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

router.post('/ip-lookup', analyzeLimiter, async (req, res) => {
  try {
    const { value } = req.body;
    if (!value || typeof value !== 'string' || !value.trim()) {
      return res.status(400).json({ error: 'Please enter an IP address or domain.' });
    }
    const result = await ipLookup(value.trim());
    logToolUsage('alexutils', req.toolUserId);
    res.json(result);
  } catch (err) {
    console.error('[AlexUtils] ip-lookup failed:', err.message);
    res.status(500).json({ error: 'Could not look up IP. Please try again.' });
  }
});

router.post('/dns-resolve', analyzeLimiter, async (req, res) => {
  try {
    const { domain, recordType } = req.body;
    if (!domain || typeof domain !== 'string' || !domain.trim()) {
      return res.status(400).json({ error: 'Please enter a domain.' });
    }
    const result = await dnsResolve(domain.trim(), (recordType || 'A').toUpperCase());
    logToolUsage('alexutils', req.toolUserId);
    res.json(result);
  } catch (err) {
    console.error('[AlexUtils] dns-resolve failed:', err.message);
    res.status(500).json({ error: 'Could not resolve DNS records. Please try again.' });
  }
});

module.exports = router;
