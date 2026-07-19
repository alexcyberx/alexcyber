/* ═══════════════════════════════════════════════════════════
   AlexTrace - platform definitions
   ═══════════════════════════════════════════════════════════
   Each entry defines how to check whether a username exists on
   that platform. Most platforms return 404 for a missing user
   and 200 for a real one, so "status" checking works. A few
   (notably ones that always return 200 with a client-rendered
   "not found" page) need a "bodyMissing" string to check against
   the HTML instead - if that string is present, we treat it as
   not-found even though the HTTP status was 200.

   category is used purely for grouping in the UI.
═══════════════════════════════════════════════════════════ */

const PLATFORMS = [
  // ── Developer ──────────────────────────────────────────
  { id: 'github', label: 'GitHub', category: 'Developer', url: u => `https://github.com/${u}`, api: u => `https://api.github.com/users/${u}` },
  { id: 'gitlab', label: 'GitLab', category: 'Developer', url: u => `https://gitlab.com/${u}` },
  { id: 'npm', label: 'npm', category: 'Developer', url: u => `https://www.npmjs.com/~${u}` },
  { id: 'dockerhub', label: 'Docker Hub', category: 'Developer', url: u => `https://hub.docker.com/u/${u}`, api: u => `https://hub.docker.com/v2/users/${u}/` },
  { id: 'devto', label: 'Dev.to', category: 'Developer', url: u => `https://dev.to/${u}` },
  { id: 'replit', label: 'Replit', category: 'Developer', url: u => `https://replit.com/@${u}` },
  { id: 'codepen', label: 'CodePen', category: 'Developer', url: u => `https://codepen.io/${u}` },
  { id: 'stackoverflow', label: 'Stack Overflow', category: 'Developer', url: u => `https://stackoverflow.com/users/${u}` },

  // ── Social ─────────────────────────────────────────────
  { id: 'reddit', label: 'Reddit', category: 'Social', url: u => `https://www.reddit.com/user/${u}`, api: u => `https://www.reddit.com/user/${u}/about.json` },
  { id: 'x', label: 'X (Twitter)', category: 'Social', url: u => `https://x.com/${u}` },
  { id: 'instagram', label: 'Instagram', category: 'Social', url: u => `https://www.instagram.com/${u}/` },
  { id: 'tiktok', label: 'TikTok', category: 'Social', url: u => `https://www.tiktok.com/@${u}` },
  { id: 'pinterest', label: 'Pinterest', category: 'Social', url: u => `https://www.pinterest.com/${u}/` },
  { id: 'tumblr', label: 'Tumblr', category: 'Social', url: u => `https://${u}.tumblr.com` },
  { id: 'threads', label: 'Threads', category: 'Social', url: u => `https://www.threads.net/@${u}` },

  // ── Gaming ─────────────────────────────────────────────
  { id: 'steam', label: 'Steam', category: 'Gaming', url: u => `https://steamcommunity.com/id/${u}` },
  { id: 'twitch', label: 'Twitch', category: 'Gaming', url: u => `https://www.twitch.tv/${u}` },
  { id: 'chesscom', label: 'Chess.com', category: 'Gaming', url: u => `https://www.chess.com/member/${u}` },

  // ── Forums / Q&A ───────────────────────────────────────
  { id: 'hackernews', label: 'Hacker News', category: 'Forums', url: u => `https://news.ycombinator.com/user?id=${u}`, bodyMissing: "No such user." },
  { id: 'medium', label: 'Medium', category: 'Forums', url: u => `https://medium.com/@${u}` },
  { id: 'producthunt', label: 'Product Hunt', category: 'Forums', url: u => `https://www.producthunt.com/@${u}` },

  // ── Creative ───────────────────────────────────────────
  { id: 'behance', label: 'Behance', category: 'Creative', url: u => `https://www.behance.net/${u}` },
  { id: 'dribbble', label: 'Dribbble', category: 'Creative', url: u => `https://dribbble.com/${u}` },
  { id: 'soundcloud', label: 'SoundCloud', category: 'Creative', url: u => `https://soundcloud.com/${u}` },
  { id: 'youtube', label: 'YouTube', category: 'Creative', url: u => `https://www.youtube.com/@${u}` },

  // ── Professional ───────────────────────────────────────
  { id: 'about_me', label: 'about.me', category: 'Professional', url: u => `https://about.me/${u}` },
  { id: 'keybase', label: 'Keybase', category: 'Professional', url: u => `https://keybase.io/${u}`, api: u => `https://keybase.io/_/api/1.0/user/lookup.json?usernames=${u}` }
];

// Simple, deterministic variation generator so results feel like
// what a real investigator would try next, not a random guesser.
function generateVariations(username) {
  const base = String(username || '').trim();
  if (!base) return [];
  const variants = new Set([
    base,
    `${base}_`,
    `_${base}`,
    `${base}1`,
    `${base}01`,
    `${base}official`,
    `real_${base}`,
    `the_${base}`,
    base.replace(/[_.-]/g, '')
  ]);
  variants.delete(base); // caller already checks the base separately
  return Array.from(variants).slice(0, 6); // keep it bounded
}

module.exports = { PLATFORMS, generateVariations };
