/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export only for production builds (API routes need server in dev)
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  trailingSlash: true,
  
  // Image optimization settings
  images: {
    unoptimized: true, // Required for static export
  },
  
  // Webpack configuration for Three.js optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Three.js optimization - handle large dependencies
    config.externals = config.externals || [];
    
    // Optimize Three.js imports and reduce bundle size
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: [
        'raw-loader',
        'glslify-loader'
      ]
    });
    
    // Handle Three.js modules properly
    config.resolve.alias = {
      ...config.resolve.alias,
      'three/examples/jsm': 'three/examples/jsm',
      'three': 'three'
    };
    
    // Optimize for production builds
    if (!dev && !isServer) {
      // Split Three.js into separate chunks for better caching
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          three: {
            name: 'three',
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }
    
    // Performance optimizations for Three.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    
    return config;
  },
  
  // Performance and build optimizations
  experimental: {
    // Enable modern JavaScript features
    esmExternals: true,
  },
  
  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Static generation settings
  generateEtags: false,
  poweredByHeader: false,
  
  // Asset optimization
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  
  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    // Fast refresh for better development experience
    reactStrictMode: true,
  }),
};

export default nextConfig;