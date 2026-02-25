/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Tell Next.js not to bundle yahoo-finance2 — leave it as a native
    // Node.js require so the Deno-compiled ESM package loads correctly.
    serverComponentsExternalPackages: ['yahoo-finance2'],
  },
};

export default nextConfig;
