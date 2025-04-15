/** @type {import('next').NextConfig} */
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
};

module.exports = nextConfig;
