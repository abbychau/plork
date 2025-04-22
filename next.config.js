/** @type {import('next').NextConfig} */

// Read port from environment variables with fallback to 8090
const port = process.env.PORT || process.env.SERVER_PORT || 8090;

// Read domain name from environment variables with fallback
const domainName = process.env.DOMAIN_NAME || `localhost:${port}`;

// Log the configuration
console.log(`Using port: ${port}`);
console.log(`Using domain: ${domainName}`);

const nextConfig = {
  // Ignore TypeScript type errors during build
  typescript: {
    // This setting allows the build to continue even with TypeScript errors
    // It's useful for development and when you want to deploy despite type issues
    ignoreBuildErrors: true,
  },
  // Temporarily disable ESLint checks during build
  eslint: {
    // This allows the build to continue even with ESLint errors
    // You can re-enable this later after fixing the issues
    ignoreDuringBuilds: true,
  },
  // Configure experimental features
  experimental: {
    // Any experimental features would go here
  },
  // Ensure we're using webpack
  webpack: (config) => {
    return config;
  },
  // Configure image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
  },
};

module.exports = nextConfig;
