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

  // Turbopack configuration (Next.js 16 default bundler)
  turbopack: {
    // Resolve aliases for cleaner imports
    resolveAlias: {
      // Add any custom aliases here if needed
      // '@/components': './components',
    },
    // File extension resolution
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    // Module rules for additional file types
    rules: {
      // Example: Support for SVG as React components
      '*.svg': {
        loaders: [],
        as: '*.js',
      },
    },
  },

  // Experimental features (non-turbopack)
  experimental: {
    // Optimize package imports for faster builds
    optimizePackageImports: [
      '@rainbow-me/rainbowkit',
      'wagmi',
      'viem',
    ],
    // Enable filesystem cache for development (Turbopack)
    turbopackFileSystemCacheForDev: true,
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

  // React Compiler (Next.js 16 feature)
  reactCompiler: true,

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
