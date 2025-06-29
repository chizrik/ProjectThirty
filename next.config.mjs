/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Increase timeouts and optimize chunk loading
  webpack: (config, { isServer }) => {
    // Increase watch options timeouts
    config.watchOptions = {
      ...config.watchOptions,
      poll: 1000,
      aggregateTimeout: 300,
    };
    
    // Enable top-level await
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    
    // Optimize chunk loading for client-side bundles
    if (!isServer) {
      // Increase timeout for chunk loading
      config.output.chunkLoadTimeout = 60000; // 60 seconds
      
      // Optimize chunk sizes
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for third-party modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
            },
            // Common chunk for code shared between pages
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }
    
    return config;
  },
  // Increase serverless function timeout
  serverRuntimeConfig: {
    maxDuration: 60, // 60 seconds
  },
}

export default nextConfig
