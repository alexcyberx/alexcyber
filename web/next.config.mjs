// The Express app (server/index.js) stays the public entry point and proxies
// the migrated paths (server/middleware/nextProxy.js, NEXT_PATHS) plus the
// /_next assets here. Everything else is still the old SPA.
//
// In dev you can open http://localhost:3001/blog directly: the shared CSS
// and JS (/css, /js) still live in the Express app, so they are rewritten
// to it below.
const EXPRESS_ORIGIN = process.env.EXPRESS_ORIGIN || 'http://localhost:3000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    // Admin panel: never in search results.
    return [{ source: '/panel-1b47c1ab561e', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  },
  async rewrites() {
    return {
      fallback: [
        { source: '/css/:path*', destination: `${EXPRESS_ORIGIN}/css/:path*` },
        { source: '/js/:path*', destination: `${EXPRESS_ORIGIN}/js/:path*` },
      ],
    };
  },
};

export default nextConfig;
