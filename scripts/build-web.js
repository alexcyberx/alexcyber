// Builds the Next.js app (web/) as part of the Express service build.
// Runs from the root package.json "postinstall", so Render's existing build
// command (npm install) builds both apps. Locally a plain `npm install` skips
// it; set BUILD_WEB=1 to run it by hand.
//
// The NEXT_PUBLIC_* values are read at build time. If they are not set as env
// vars, the Supabase URL + anon key are taken from js/config.js (the same
// public values the old SPA uses), so there is one place to change them.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

if (process.env.RENDER !== 'true' && process.env.BUILD_WEB !== '1') process.exit(0);
// The labs server (server/labs-server.js) does not use Next.
if (process.env.SKIP_WEB_BUILD === '1') process.exit(0);

const root = path.join(__dirname, '..');
const web = path.join(root, 'web');
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1' };

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  const cfg = fs.readFileSync(path.join(root, 'js/config.js'), 'utf8');
  const url = cfg.match(/const SUPABASE_URL\s*=\s*'([^']+)'/);
  const anon = cfg.match(/const SUPABASE_ANON\s*=\s*'([^']+)'/);
  if (!env.NEXT_PUBLIC_SUPABASE_URL && url) env.NEXT_PUBLIC_SUPABASE_URL = url[1];
  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY && anon) env.NEXT_PUBLIC_SUPABASE_ANON_KEY = anon[1];
}
if (!env.NEXT_PUBLIC_SITE_URL && env.RENDER_EXTERNAL_URL) env.NEXT_PUBLIC_SITE_URL = env.RENDER_EXTERNAL_URL;

const run = (cmd) => execSync(cmd, { cwd: web, env, stdio: 'inherit' });
console.log('[build-web] building web/ (site url:', env.NEXT_PUBLIC_SITE_URL || 'default', ')');
// --include=dev: the build needs typescript even when NODE_ENV=production.
run('npm ci --include=dev --no-audit --no-fund');
run('npm run build');
