/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false,
    serverActions: {
      allowedOrigins: ['localhost:3000', 'your-production-domain.com'],
    },
  },
  images: {
    domains: ['public.blob.vercel-storage.com'],
  },
};

module.exports = nextConfig;
