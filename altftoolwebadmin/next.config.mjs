import { withSecurityHeaders } from "@altftool/core/next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: workspaceRoot,
  poweredByHeader: false,
  compress: true,
  transpilePackages: ["@altftool/ui"],
  serverExternalPackages: ["firebase-admin"],
  allowedDevOrigins: ["localhost", "127.0.0.1"],

  async redirects() {
    return [
      {
        source: "/admin/dashboard",
        destination: "/profile",
        permanent: true,
      },
      {
        source: "/altftool/consumerrating/:path*",
        destination: "/altftool/consumer-rating/:path*",
        permanent: true,
      },
      {
        source: "/altftool/salelocator/:path*",
        destination: "/altftool/sale-locator/:path*",
        permanent: true,
      },
      {
        source: "/altftool/trendingVideos/:path*",
        destination: "/altftool/trending-videos/:path*",
        permanent: true,
      },
      {
        source: "/leadtree/creditcard/:path*",
        destination: "/leadtree/credit-cards/:path*",
        permanent: true,
      },
      {
        source: "/leadtree/expertvideos/:path*",
        destination: "/leadtree/expert-videos/:path*",
        permanent: true,
      },
    ];
  },

  turbopack: {
    root: workspaceRoot,
  },

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      }
    ],
  },

  reactStrictMode: true,
};

export default withSecurityHeaders(nextConfig, "admin");
