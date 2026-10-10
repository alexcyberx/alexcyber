// The Express app (server/index.js) stays the public entry point and proxies
// /blog/* here. basePath keeps every Next route and asset (/blog/_next/...)
// under /blog, so Express only has to forward one prefix.
//
// In dev you can open http://localhost:3001/blog directly: the shared CSS
// and JS (/css, /js) still live in the Express app, so they are rewritten
// to it below.
const EXPRESS_ORIGIN = process.env.EXPRESS_ORIGIN || 'http://localhost:3000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/blog',
  poweredByHeader: false,
  async rewrites() {
    return {
      fallback: [
        { source: '/css/:path*', destination: `${EXPRESS_ORIGIN}/css/:path*`, basePath: false },
        { source: '/js/:path*', destination: `${EXPRESS_ORIGIN}/js/:path*`, basePath: false },
      ],
    };
  },
};

export default nextConfig;
