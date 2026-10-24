// LAB_ORIGIN: where the labs server runs (docs/LABS.md), e.g.
// https://alexcyber-labs.onrender.com. Empty = labs run on this server.
const { secretFingerprint } = require('./flags');

function labOrigin() {
  const raw = (process.env.LAB_ORIGIN || '').trim();
  if (!raw) return '';
  try {
    const u = new URL(raw);
    if ((u.protocol !== 'https:' && u.protocol !== 'http:') || u.pathname.replace(/\/+$/, '') || u.search || u.hash) throw new Error('not an origin');
    return u.origin;
  } catch (e) {
    console.error('[labs] LAB_ORIGIN is not a plain origin like https://labs.example.com, labs stay on this server:', raw);
    return '';
  }
}

// After start: the labs server must make the same flags (same FLAG_SECRET).
// A free Render service may be asleep, so wait up to 90 s for it.
async function checkLabServer(origin) {
  try {
    const r = await fetch(origin + '/healthz', { signal: AbortSignal.timeout(90000) });
    const d = await r.json();
    if (d.fp === secretFingerprint()) console.log('[labs] labs server', origin, 'uses the same flag secret');
    else console.error('[labs] labs server', origin, 'uses a DIFFERENT flag secret (' + d.secret + '): lab flags will be refused. Set the same FLAG_SECRET on both services.');
  } catch (e) {
    console.error('[labs] could not reach the labs server', origin, e.message);
  }
}

module.exports = { labOrigin, checkLabServer };
