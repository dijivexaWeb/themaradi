import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qcxsqirqlepjebkezgud.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-4e99edb14c604383a844cb7f05d69b9b.r2.dev',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
