import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "https://proshop26.onrender.com/api/auth/:path*",
      },
      {
        source: "/api/:path*",
        destination: "https://proshop26.onrender.com/api/:path*",
      },
    ];
  },
  trailingSlash: false,
};

export default nextConfig;
