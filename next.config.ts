import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mqkjumltnmkpmkkqdmcn.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Allow any HTTPS image URL (used for admin-pasted featured images)
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
