/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['yahoo-finance2'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent webpack from bundling yahoo-finance2 test files
      config.externals = [...(config.externals || []), 'yahoo-finance2'];
    }
    return config;
  },
};

export default nextConfig;
