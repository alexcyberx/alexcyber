// ── NEXT.JS IN THE SAME SERVICE (NEXT_EMBEDDED=1) ───────────────
// Runs `next start` for web/ as a child process on 127.0.0.1, and points the
// proxy (middleware/nextProxy.js) at it. One service instead of two: on the
// Render free plan a separate Next service went to sleep and requests from
// Express never woke it up (every migrated page answered 502). It is also how
// a single paid server will run it.
//
// web/ must be built first (scripts/build-web.js, run by `npm install` on Render).
// Off (default): NEXT_APP_URL decides, as before.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const WEB_DIR = path.join(__dirname, '../web');
const PORT = String(process.env.NEXT_EMBEDDED_PORT || 3101);

let child = null;
let restarts = [];

function startChild() {
  const nextBin = path.join(WEB_DIR, 'node_modules/next/dist/bin/next');
  const env = { ...process.env, NODE_ENV: 'production', PORT, NEXT_TELEMETRY_DISABLED: '1' };
  if (!/max-old-space-size/.test(env.NODE_OPTIONS || '')) {
    env.NODE_OPTIONS = ((env.NODE_OPTIONS || '') + ' --max-old-space-size=256').trim();
  }
  child = spawn(process.execPath, [nextBin, 'start', '-p', PORT, '-H', '127.0.0.1'], { cwd: WEB_DIR, env, stdio: 'inherit' });
  child.on('exit', (code, signal) => {
    child = null;
    console.error('[next] exited', code, signal || '');
    // Restart, but give up if it keeps crashing (5 times in 10 minutes).
    const now = Date.now();
    restarts = restarts.filter((t) => now - t < 10 * 60 * 1000);
    if (restarts.length >= 5) return console.error('[next] crashing repeatedly, not restarting');
    restarts.push(now);
    setTimeout(startChild, 2000);
  });
}

function start() {
  if (process.env.NEXT_EMBEDDED !== '1') return false;
  if (!fs.existsSync(path.join(WEB_DIR, '.next/BUILD_ID'))) {
    console.error('[next] NEXT_EMBEDDED=1 but web/ is not built (run BUILD_WEB=1 npm install); using NEXT_APP_URL');
    return false;
  }
  process.env.NEXT_APP_URL = 'http://127.0.0.1:' + PORT;
  startChild();
  const stop = () => { if (child) child.kill('SIGTERM'); };
  process.on('exit', stop);
  ['SIGTERM', 'SIGINT'].forEach((sig) => process.on(sig, () => { stop(); process.exit(0); }));
  return true;
}

module.exports = { start };
