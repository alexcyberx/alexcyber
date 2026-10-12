/* ═══════════════════════════════════════════════════════════
   AlexRecon - Web Recon, Risk Indicators, Tech Stack (Tier 1/2)
   Pure HTTP fetch + header/HTML inspection. No external API,
   no key needed. CMS/WAF/CDN detection uses a small maintained
   fingerprint ruleset (headers + HTML signatures).
═══════════════════════════════════════════════════════════ */

const { safeFetch } = require('./utils');

const SECURITY_HEADERS = [
  'strict-transport-security',
  'content-security-policy',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy'
];

// Small, maintained fingerprint ruleset. Each entry checks headers
// and/or a body snippet for a signature. Not exhaustive by design -
// this is meant to catch the common cases quickly, not replace
// Wappalyzer-scale detection.
const TECH_SIGNATURES = [
  { name: 'WordPress', type: 'cms', test: ({ body }) => /wp-content|wp-includes/i.test(body) },
  { name: 'Shopify', type: 'cms', test: ({ headers, body }) => /shopify/i.test(headers['x-shopify-stage'] || '') || /cdn\.shopify\.com/i.test(body) },
  { name: 'Wix', type: 'cms', test: ({ body }) => /wix\.com|_wixCIDX/i.test(body) },
  { name: 'Squarespace', type: 'cms', test: ({ body }) => /squarespace/i.test(body) },
  { name: 'Drupal', type: 'cms', test: ({ headers, body }) => /drupal/i.test(headers['x-generator'] || '') || /Drupal\.settings/i.test(body) },
  { name: 'Joomla', type: 'cms', test: ({ body }) => /joomla/i.test(body) },
  { name: 'Next.js', type: 'framework', test: ({ body }) => /__NEXT_DATA__/i.test(body) },
  { name: 'React', type: 'framework', test: ({ body }) => /data-reactroot|react-dom/i.test(body) },
  { name: 'Angular', type: 'framework', test: ({ body }) => /ng-version|ng-app/i.test(body) },
  { name: 'Vue.js', type: 'framework', test: ({ body }) => /data-v-app|__vue__/i.test(body) },
  { name: 'Cloudflare', type: 'cdn_waf', test: ({ headers }) => /cloudflare/i.test(headers['server'] || '') || !!headers['cf-ray'] },
  { name: 'Akamai', type: 'cdn_waf', test: ({ headers }) => /akamai/i.test(headers['server'] || '') || !!headers['x-akamai-transformed'] },
  { name: 'AWS CloudFront', type: 'cdn_waf', test: ({ headers }) => !!headers['x-amz-cf-id'] },
  { name: 'Fastly', type: 'cdn_waf', test: ({ headers }) => !!headers['x-served-by'] && /fastly/i.test(headers['x-served-by']) },
  { name: 'Sucuri WAF', type: 'cdn_waf', test: ({ headers }) => /sucuri/i.test(headers['server'] || headers['x-sucuri-id'] || '') },
  { name: 'Nginx', type: 'server', test: ({ headers }) => /nginx/i.test(headers['server'] || '') },
  { name: 'Apache', type: 'server', test: ({ headers }) => /apache/i.test(headers['server'] || '') },
  { name: 'Express', type: 'server', test: ({ headers }) => /express/i.test(headers['x-powered-by'] || '') },
  { name: 'PHP', type: 'language', test: ({ headers }) => /php/i.test(headers['x-powered-by'] || '') },
  { name: 'Google Analytics', type: 'analytics', test: ({ body }) => /gtag\(|google-analytics\.com|googletagmanager\.com/i.test(body) }
];

const LOGIN_PATHS = ['/admin', '/login', '/wp-admin', '/administrator', '/admin/login', '/user/login', '/cpanel'];

function headersToObject(headers) {
  const out = {};
  for (const [k, v] of headers.entries()) out[k.toLowerCase()] = v;
  return out;
}

async function webRecon(domain) {
  const urls = [`https://${domain}`, `http://${domain}`];
  let result = null;
  let protocolUsed = null;

  for (const base of urls) {
    try {
      // safeFetch validates the IP of the base host AND of every redirect
      // hop (manual follow, capped), so a redirect to an internal address
      // is refused instead of followed.
      const res = await safeFetch(base, { maxRedirects: 5, timeoutMs: 8000 });
      const body = await res.text().catch(() => '');
      const headers = headersToObject(res.headers);
      const titleMatch = body.match(/<title[^>]*>([^<]*)<\/title>/i);

      result = {
        finalUrl: res.finalUrl,
        statusCode: res.status,
        redirectChain: res.redirectChain,
        title: titleMatch ? titleMatch[1].trim().slice(0, 200) : null,
        headers,
        bodySnippet: body.slice(0, 50000) // capped for downstream module reuse, not returned raw to client
      };
      protocolUsed = base.startsWith('https') ? 'https' : 'http';
      break;
    } catch (e) {
      continue;
    }
  }

  if (!result) {
    return {
      reachable: false,
      note: 'Host did not respond over HTTP or HTTPS within the timeout window.'
    };
  }

  const { headers, bodySnippet } = result;
  const detected = TECH_SIGNATURES.filter(sig => {
    try {
      return sig.test({ headers, body: bodySnippet });
    } catch (e) {
      return false;
    }
  }).map(sig => ({ name: sig.name, type: sig.type }));

  // Risk indicators: security headers presence/absence
  const missingHeaders = SECURITY_HEADERS.filter(h => !headers[h]);
  const presentHeaders = SECURITY_HEADERS.filter(h => headers[h]);

  const setCookie = headers['set-cookie'] || '';
  const cookieFlags = {
    hasCookies: !!setCookie,
    secure: /secure/i.test(setCookie),
    httpOnly: /httponly/i.test(setCookie),
    sameSite: /samesite/i.test(setCookie)
  };

  const corsHeader = headers['access-control-allow-origin'];
  const corsRisk = corsHeader === '*' ? 'Wildcard CORS (Access-Control-Allow-Origin: *) - review if this is intentional.' : null;

  return {
    reachable: true,
    protocol: protocolUsed,
    finalUrl: result.finalUrl,
    statusCode: result.statusCode,
    redirectChain: result.redirectChain,
    title: result.title,
    favicon: `${protocolUsed}://${domain}/favicon.ico`,
    techStack: detected,
    riskIndicators: {
      missingSecurityHeaders: missingHeaders,
      presentSecurityHeaders: presentHeaders,
      cookieFlags,
      corsRisk,
      serverHeaderExposed: headers['server'] || null,
      poweredByExposed: headers['x-powered-by'] || null
    },
    _bodySnippet: bodySnippet // internal use only (JS recon module reuses this), stripped before sending to client
  };
}

// Login/admin panel detection - checks a small set of common paths.
// Rate-limited to a handful of requests so it doesn't look like an
// attack against the target.
async function loginPanelDetection(domain, protocol = 'https') {
  const found = [];
  for (const path of LOGIN_PATHS) {
    try {
      // Don't follow redirects: we want the target's own status for the
      // path, and following a 30x could be steered at an internal host.
      const res = await safeFetch(`${protocol}://${domain}${path}`, { method: 'GET', maxRedirects: 0, timeoutMs: 4000 });
      if (res.status === 200 || res.status === 401 || res.status === 403) {
        found.push({ path, status: res.status });
      }
    } catch (e) {
      // ignore individual path failures
    }
  }
  return found;
}

async function robotsAndSitemap(domain, protocol = 'https') {
  const out = { robotsTxt: null, sitemapXml: null };
  try {
    // No redirect follow + pinned public IP, so the body we read is the
    // target's own robots.txt (never an internal URL a 30x pointed at).
    const res = await safeFetch(`${protocol}://${domain}/robots.txt`, { maxRedirects: 0, timeoutMs: 5000, maxBytes: 64 * 1024 });
    if (res.status === 200) {
      const text = await res.text();
      out.robotsTxt = text.slice(0, 5000);
    }
  } catch (e) {}
  try {
    const res = await safeFetch(`${protocol}://${domain}/sitemap.xml`, { method: 'HEAD', maxRedirects: 0, timeoutMs: 5000 });
    if (res.status === 200) {
      out.sitemapXml = { found: true, contentTypeOk: (res.headers.get('content-type') || '').includes('xml') };
    }
  } catch (e) {}
  return out;
}

module.exports = { webRecon, loginPanelDetection, robotsAndSitemap };
