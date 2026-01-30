import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // reactCompiler: true,
  async rewrites() {
    const apiUrl = process.env.API_URL || 'http://localhost:4000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`, // Proxy to NestJS
      },
    ];
  },
};

export default nextConfig;
