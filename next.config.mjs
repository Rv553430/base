/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
    minimumCacheTTL: 60,
  },

  // Experimental features for Next.js 14
  experimental: {
    // Optimize package imports for faster builds
    optimizePackageImports: [
      '@rainbow-me/rainbowkit',
      'wagmi',
      'viem',
    ],
  },

  // TypeScript - faster builds
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint - faster builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Compression
  compress: true,

  // Headers for performance and CORS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig
