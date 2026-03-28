import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "utfs.io" },
    ],
  },
  typescript: {
    // Allow build even with type issues for initial scaffolding
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
