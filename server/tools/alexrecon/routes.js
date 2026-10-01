/* ═══════════════════════════════════════════════════════════
   ALEXRECON - Attack-surface / asset-discovery tool
   ═══════════════════════════════════════════════════════════
   POST /api/alexrecon/scan
   Body: { target: "example.com", userId: "uuid" (optional) }

   Runs Tier 1 + Tier 2 recon modules in parallel, saves the
   result to Supabase (alexrecon_scans) if a userId is provided,
   and returns the combined report. Any single module failure is
   caught and reported as "unavailable" rather than failing the
   whole scan (graceful partial results per the PRD).

   GET  /api/alexrecon/history?userId=uuid
   GET  /api/alexrecon/scan/:id?userId=uuid
   POST /api/alexrecon/schedules        - create a scheduled scan
   GET  /api/alexrecon/schedules?userId=uuid
   PATCH /api/alexrecon/schedules/:id   - toggle active / update frequency
   DELETE /api/alexrecon/schedules/:id

   Env vars required (set on Render, never commit real values):
     SUPABASE_URL
     SUPABASE_SERVICE_ROLE_KEY - same pattern as AlexSync payments,
                                    needed to write scan history
                                    bypassing RLS from a server route.
═══════════════════════════════════════════════════════════ */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { reconLimiter } = require('../../middleware/rateLimit');

const { detectTargetType, normalizeDomain, runModulesParallel } = require('./modules/utils');
const { dnsIntelligence, axfrCheck, wildcardCheck } = require('./modules/dns');
const { sslIntelligence } = require('./modules/ssl');
const { webRecon, loginPanelDetection, robotsAndSitemap } = require('./modules/webrecon');
const { subdomainEnumeration, liveHostDetection, asnCidrDiscovery } = require('./modules/assets');
const { waybackUrls, commonCrawlUrls, jsRecon, cloudDiscovery, directoryBackupCheck, githubOrgIntel } = require('./modules/tier2');
const { commonPortCheck } = require('./modules/ports');
const { startAlexReconScheduler } = require('./scheduler');
const { checkToolEnabled, logToolUsage } = require('../../middleware/toolAccess');

let supabaseAdmin = null;
function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return null; // history saving is optional - scan still works without it
    }
    supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return supabaseAdmin;
}

// Modules that are planned but not shipped in v1 - surfaced to the
// frontend so it can render them as "coming soon" (grayed out) per
// the PRD's Tier 3 recommendation, instead of silently omitting them.
const COMING_SOON_MODULES = [
  { key: 'visualRecon', label: 'Visual Recon (Screenshots)', reason: 'Requires a headless browser or third-party screenshot API - not yet integrated.' },
  { key: 'osFingerprint', label: 'OS Fingerprinting', reason: 'Requires nmap-style techniques not feasible from a Node HTTP server.' },
  { key: 'geoMap', label: 'Geo Map', reason: 'Requires an IP-geolocation API - not yet integrated.' },
  { key: 'fullPortScan', label: 'Full Port Scan (Shodan/Censys-style)', reason: 'Real port scanning needs a paid API integration - v1 ships a best-effort common-port check instead.' }
];

// Core scan runner, shared by the POST /scan route and the scheduler.
// Returns the full response payload; does not write HTTP itself so
// it can be reused from a non-request context (the cron tick).
async function runAlexReconScan({ target, userId, projectId, triggeredBy }) {
  const startedAt = Date.now();

  if (!target || typeof target !== 'string' || !target.trim()) {
    throw Object.assign(new Error('Please enter a domain, IP, or organization name to scan.'), { statusCode: 400 });
  }
  if (target.length > 253) {
    throw Object.assign(new Error('Target is too long.'), { statusCode: 400 });
  }

  const targetType = detectTargetType(target);
  const domain = targetType === 'domain' ? normalizeDomain(target) : null;

  if (targetType === 'ip') {
    throw Object.assign(new Error('IP-only scanning is not yet supported in v1. Please enter a domain instead.'), { statusCode: 400 });
  }

  let scanRow = null;
  const db = getSupabaseAdmin();
  if (db && userId) {
    const { data, error } = await db
      .from('alexrecon_scans')
      .insert({
        user_id: userId,
        project_id: projectId || null,
        target: targetType === 'domain' ? domain : target,
        target_type: targetType,
        status: 'running'
      })
      .select()
      .single();
    if (!error) scanRow = data;
  }

  let report;

  if (targetType === 'org') {
    // Org/free-text name: only the modules that make sense for
    // non-domain input run (GitHub org lookup). DNS/Web/SSL etc.
    // require a resolvable hostname.
    report = await runModulesParallel({
      githubOrgIntel: () => githubOrgIntel(target.trim())
    });
  } else {
    // Domain flow: run Tier 1 modules first (DNS needed for ASN/CIDR
    // and live-host resolution downstream), then fan out Tier 2.
    const dnsResult = await dnsIntelligence(domain).catch(e => ({ error: e.message }));
    const primaryIp = Array.isArray(dnsResult.a) && dnsResult.a.length ? dnsResult.a[0] : null;

    const webResult = await webRecon(domain).catch(e => ({ reachable: false, note: e.message }));
    const protocolForFollowups = webResult.protocol || 'https';
    const homepageBody = webResult._bodySnippet || '';
    const finalUrl = webResult.finalUrl || `https://${domain}`;

    report = await runModulesParallel({
      dns: async () => dnsResult,
      wildcardDetection: () => wildcardCheck(domain),
      axfrCheck: () => axfrCheck(domain),
      ssl: () => sslIntelligence(domain),
      webRecon: async () => {
        // Strip internal-only field before returning to client
        const { _bodySnippet, ...clean } = webResult;
        return clean;
      },
      robotsAndSitemap: () => robotsAndSitemap(domain, protocolForFollowups),
      loginPanelDetection: () => loginPanelDetection(domain, protocolForFollowups),
      subdomains: () => subdomainEnumeration(domain),
      asnCidr: () => asnCidrDiscovery(primaryIp),
      waybackUrls: () => waybackUrls(domain),
      commonCrawlUrls: () => commonCrawlUrls(domain),
      jsRecon: () => jsRecon(finalUrl, homepageBody),
      cloudDiscovery: () => cloudDiscovery(domain),
      directoryBackupCheck: () => directoryBackupCheck(domain, protocolForFollowups),
      githubOrgIntel: () => githubOrgIntel(domain.split('.')[0]),
      commonPortCheck: () => commonPortCheck(domain)
    });

    // Live host detection depends on subdomain results - run after
    // the main batch so it can use the freshly discovered list.
    const subList = report.subdomains && report.subdomains.ok ? (report.subdomains.data.subdomains || []) : [];
    report.liveHosts = await liveHostDetection(subList)
      .then(data => ({ ok: true, data }))
      .catch(err => ({ ok: false, error: err.message, data: null }));
  }

  const hasFailures = Object.values(report).some(m => m && m.ok === false);
  const finalStatus = hasFailures ? 'partial' : 'completed';

  const responsePayload = {
    target: targetType === 'domain' ? domain : target,
    targetType,
    status: finalStatus,
    scanDurationMs: Date.now() - startedAt,
    triggeredBy: triggeredBy || 'manual',
    modules: report,
    comingSoon: COMING_SOON_MODULES,
    disclaimer: 'AlexRecon performs passive/low-impact reconnaissance for educational purposes. Only scan domains and systems you own or are explicitly authorized to test.'
  };

  if (db && scanRow) {
    await db
      .from('alexrecon_scans')
      .update({
        status: finalStatus,
        result: responsePayload,
        completed_at: new Date().toISOString()
      })
      .eq('id', scanRow.id);
    responsePayload.scanId = scanRow.id;
  }

  return responsePayload;
}

router.post('/scan', reconLimiter, checkToolEnabled('alexrecon'), async (req, res) => {
  try {
    const { target, userId, projectId } = req.body;
    const result = await runAlexReconScan({ target, userId, projectId, triggeredBy: 'manual' });
    logToolUsage('alexrecon', userId);
    res.json(result);
  } catch (err) {
    console.error('[AlexRecon] scan failed:', err.message);
    res.status(err.statusCode || 500).json({ error: err.statusCode ? err.message : 'Something went wrong running the scan. Please try again.' });
  }
});

// ── GET /api/alexrecon/history ───────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required.' });

    const db = getSupabaseAdmin();
    if (!db) return res.status(500).json({ error: 'Scan history is not configured on the server.' });

    const { data, error } = await db
      .from('alexrecon_scans')
      .select('id, target, target_type, status, started_at, completed_at')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ scans: data });
  } catch (err) {
    console.error('[AlexRecon] history fetch failed:', err.message);
    res.status(500).json({ error: 'Could not load scan history.' });
  }
});

// ── GET /api/alexrecon/scan/:id ──────────────────────────────
router.get('/scan/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    const { id } = req.params;
    if (!userId) return res.status(400).json({ error: 'userId is required.' });

    const db = getSupabaseAdmin();
    if (!db) return res.status(500).json({ error: 'Scan history is not configured on the server.' });

    const { data, error } = await db
      .from('alexrecon_scans')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Scan not found.' });
    res.json(data);
  } catch (err) {
    console.error('[AlexRecon] scan fetch failed:', err.message);
    res.status(500).json({ error: 'Could not load scan.' });
  }
});

// ── POST /api/alexrecon/schedules ────────────────────────────
router.post('/schedules', async (req, res) => {
  try {
    const { userId, target, frequency } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required.' });
    if (!target || typeof target !== 'string' || !target.trim()) {
      return res.status(400).json({ error: 'Please enter a domain to schedule.' });
    }
    if (detectTargetType(target) !== 'domain') {
      return res.status(400).json({ error: 'Scheduled scans currently support domains only.' });
    }
    const validFrequencies = ['daily', 'weekly', 'monthly'];
    const freq = validFrequencies.includes(frequency) ? frequency : 'weekly';

    const db = getSupabaseAdmin();
    if (!db) return res.status(500).json({ error: 'Scheduling is not configured on the server.' });

    const { data, error } = await db
      .from('alexrecon_schedules')
      .insert({
        user_id: userId,
        target: normalizeDomain(target),
        target_type: 'domain',
        frequency: freq,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ schedule: data });
  } catch (err) {
    console.error('[AlexRecon] schedule create failed:', err.message);
    res.status(500).json({ error: 'Could not create the schedule.' });
  }
});

// ── GET /api/alexrecon/schedules?userId=uuid ─────────────────
router.get('/schedules', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required.' });

    const db = getSupabaseAdmin();
    if (!db) return res.status(500).json({ error: 'Scheduling is not configured on the server.' });

    const { data, error } = await db
      .from('alexrecon_schedules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ schedules: data });
  } catch (err) {
    console.error('[AlexRecon] schedules fetch failed:', err.message);
    res.status(500).json({ error: 'Could not load schedules.' });
  }
});

// ── PATCH /api/alexrecon/schedules/:id ───────────────────────
// Body: { userId, is_active?, frequency? }
router.patch('/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, is_active, frequency } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required.' });

    const db = getSupabaseAdmin();
    if (!db) return res.status(500).json({ error: 'Scheduling is not configured on the server.' });

    const updates = {};
    if (typeof is_active === 'boolean') updates.is_active = is_active;
    if (['daily', 'weekly', 'monthly'].includes(frequency)) updates.frequency = frequency;
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'No valid fields to update.' });

    const { data, error } = await db
      .from('alexrecon_schedules')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ error: 'Schedule not found.' });
    res.json({ schedule: data });
  } catch (err) {
    console.error('[AlexRecon] schedule update failed:', err.message);
    res.status(500).json({ error: 'Could not update the schedule.' });
  }
});

// ── DELETE /api/alexrecon/schedules/:id?userId=uuid ──────────
router.delete('/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required.' });

    const db = getSupabaseAdmin();
    if (!db) return res.status(500).json({ error: 'Scheduling is not configured on the server.' });

    const { error } = await db
      .from('alexrecon_schedules')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('[AlexRecon] schedule delete failed:', err.message);
    res.status(500).json({ error: 'Could not delete the schedule.' });
  }
});

// Start the in-process scheduler. No-op internally if Supabase env
// vars are not set (getSupabaseAdmin returns null each tick).
startAlexReconScheduler(getSupabaseAdmin, runAlexReconScan);

module.exports = router;
