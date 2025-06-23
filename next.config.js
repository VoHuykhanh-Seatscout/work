/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Recommended to use publicRuntimeConfig for client-side accessible env vars
  publicRuntimeConfig: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  },
  // Use serverRuntimeConfig for server-side only env vars
  serverRuntimeConfig: {
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "lh3.googleusercontent.com", // Google user avatars
      },
      {
        protocol: 'https',
        hostname: "example.com", // Your specific domain
      },
      // Be cautious with wildcard - consider specifying exact domains instead
      {
        protocol: 'https',
        hostname: "**.example.com", // More specific wildcard
      },
    ],
    // Consider adding minimumCacheTTL for optimization
    minimumCacheTTL: 60,
  },
  // Security headers (optional but recommended)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;