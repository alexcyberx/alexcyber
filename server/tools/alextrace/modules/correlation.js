/* ═══════════════════════════════════════════════════════════
   AlexTrace - Deep Correlation module
   ═══════════════════════════════════════════════════════════
   Goes one level deeper than a flat platform scan: when we find a
   GitHub profile, GitHub's public API (unauthenticated, 60 req/hr
   rate limit, no key needed) returns their bio, blog URL, and
   twitter_username field directly. We extract any handles/URLs
   referenced there and check those too, then report the chain -
   "found via GitHub bio" - the way a human OSINT investigator
   would pull one thread to find the next.

   Kept to GitHub only for now since it's the one major platform
   with a genuinely free, structured, unauthenticated profile API.
   Most others either require auth or don't expose bio fields
   without a logged-in session.
═══════════════════════════════════════════════════════════ */

const { fetchWithTimeout, withTimeout, isValidUsername } = require('./utils');
const { PLATFORMS } = require('./platforms');

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/vnd.github+json'
};

async function fetchGithubProfile(username) {
  try {
    const res = await withTimeout(
      fetchWithTimeout(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers: REQUEST_HEADERS }, 6000),
      6500,
      'GitHub profile'
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Pulls candidate handles out of free-text bio/blog fields. Looks
// for @handles and bare URLs to known social platforms so we can
// follow the thread without guessing wildly.
function extractHandlesFromProfile(profile) {
  const candidates = [];

  if (profile.twitter_username && isValidUsername(profile.twitter_username)) {
    candidates.push({ platformId: 'x', username: profile.twitter_username, via: 'GitHub profile field' });
  }

  const text = [profile.bio, profile.blog, profile.company].filter(Boolean).join(' ');

  // @handle mentions in bio text
  const atMentions = text.match(/@([a-zA-Z0-9._-]{2,39})/g) || [];
  atMentions.forEach(m => {
    const handle = m.slice(1);
    if (isValidUsername(handle)) candidates.push({ platformId: null, username: handle, via: 'GitHub bio mention' });
  });

  // Direct links to known platforms in bio/blog (e.g. instagram.com/name)
  PLATFORMS.forEach(p => {
    const domainGuess = safeHostname(p.url('x')); // 'x' is a placeholder to get the domain shape
    if (!domainGuess) return;
    const re = new RegExp(`${escapeRegex(domainGuess)}/(@)?([a-zA-Z0-9._-]{2,39})`, 'i');
    const match = text.match(re);
    if (match && isValidUsername(match[2])) {
      candidates.push({ platformId: p.id, username: match[2], via: 'Link in GitHub bio/blog' });
    }
  });

  // De-duplicate by platformId+username
  const seen = new Set();
  return candidates.filter(c => {
    const key = `${c.platformId || '?'}::${c.username.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function safeHostname(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return null; }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function checkCandidateHandle(candidate) {
  const platform = candidate.platformId ? PLATFORMS.find(p => p.id === candidate.platformId) : null;
  const targets = platform ? [platform] : PLATFORMS.filter(p => ['x', 'instagram', 'reddit', 'youtube', 'twitch'].includes(p.id));

  for (const p of targets) {
    try {
      const target = p.api ? p.api(candidate.username) : p.url(candidate.username);
      const res = await withTimeout(
        fetchWithTimeout(target, { headers: REQUEST_HEADERS }, 5000),
        5500,
        p.label
      );
      if (res.status >= 200 && res.status < 400) {
        return { platform: p.label, username: candidate.username, profileUrl: p.url(candidate.username), via: candidate.via };
      }
    } catch {
      // try next candidate platform silently
    }
  }
  return null;
}

// Main entry: given a GitHub username that was already confirmed
// to exist, pulls the profile, extracts referenced handles, and
// checks a bounded number of them (keeps this fast and polite to
// third-party rate limits).
async function deepCorrelate(githubUsername) {
  const profile = await fetchGithubProfile(githubUsername);
  if (!profile) return { attempted: false, profile: null, discovered: [] };

  const candidates = extractHandlesFromProfile(profile).slice(0, 6); // bounded
  const results = await Promise.all(candidates.map(checkCandidateHandle));
  const discovered = results.filter(Boolean);

  return {
    attempted: true,
    profile: {
      name: profile.name || null,
      bio: profile.bio || null,
      company: profile.company || null,
      location: profile.location || null,
      blog: profile.blog || null,
      publicRepos: profile.public_repos ?? null,
      followers: profile.followers ?? null,
      createdAt: profile.created_at || null
    },
    discovered
  };
}

module.exports = { deepCorrelate };
