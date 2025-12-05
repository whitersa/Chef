import type { NextConfig } from 'next';
import { API_URL } from '@chefos/utils';

const nextConfig: NextConfig = {
  /* config options here */
  // reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`, // Proxy to NestJS
      },
    ];
  },
};

export default nextConfig;
