/** @type {import('next').NextConfig} */
const nextConfig = {
  // basePath removed for subdomain usage
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['api.mapbox.com', 'avatars.githubusercontent.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

export default nextConfig
