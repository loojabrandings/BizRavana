import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // Landing site (ported from the 3d-landing page project): the preview
  // webview loads the page via 127.0.0.1, not localhost. Without this, Next
  // blocks dev-only assets (fonts, HMR) from that origin.
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    // Serve images in next-gen formats via next/image (lazy-loaded by default).
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/models/v1/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/screens/v1/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
