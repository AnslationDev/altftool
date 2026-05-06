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
  allowedDevOrigins: ["localhost", "127.0.0.1"],

  async redirects() {
    return [
      {
        source: "/blog",
        destination: "/blogs",
        permanent: true,
      },
      {
        source: "/categories/:path*",
        destination: "/tools/all",
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
        hostname: "images.unsplash.com",
      },
        
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: "firebasestorage.googleapis.com",
      },
      
    ],
  },

  reactStrictMode: true,
  reactCompiler: false,

  webpack(config) {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /@vladmandic\/face-api/,
        message: /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
      },
    ];

    return config;
  },

  experimental: {
    workerThreads: false,
    cpus: 2,
  },
};

export default withSecurityHeaders(nextConfig, "public");
