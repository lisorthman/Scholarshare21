/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove or correct the experimental.serverActions configuration
  experimental: {
    // For Next.js 13.4+ with App Router (correct format)
    serverActions: {
      allowedOrigins: ['localhost:3000', 'your-production-domain.com'],
    },
    // OR remove entirely if you're not using server actions
  },
  images: {
    domains: ['public.blob.vercel-storage.com'],
  },
};

module.exports = nextConfig;