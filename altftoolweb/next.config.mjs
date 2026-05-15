import { withSecurityHeaders } from "@altftool/core/next";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const webRoot = path.dirname(fileURLToPath(import.meta.url));

function readToolSlugs() {
  const source = readFileSync(path.join(webRoot, "src/platform/registry/toolMetaMap.js"), "utf8");
  const match = source.match(/export const toolMetaMap = (\{[\s\S]*\});?\s*$/);

  if (!match) return [];
  return Object.keys(JSON.parse(match[1]));
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: workspaceRoot,
  poweredByHeader: false,
  compress: true,
  transpilePackages: ["@altftool/ui"],
  allowedDevOrigins: ["localhost", "127.0.0.1"],

  async redirects() {
    const toolSlugRedirects = readToolSlugs().map((slug) => ({
      source: `/tools/${slug}`,
      destination: `/tools/all/${slug}`,
      permanent: true,
    }));

    return [
      ...toolSlugRedirects,
      {
        source: "/blog",
        destination: "/blogs",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/policypages/about",
        permanent: true,
      },
      {
        source: "/contact",
        destination: "/policypages/contact",
        permanent: true,
      },
      {
        source: "/privacy",
        destination: "/policypages/privacy",
        permanent: true,
      },
      {
        source: "/terms",
        destination: "/policypages/termsandconditions",
        permanent: true,
      },
      {
        source: "/cookie-policy",
        destination: "/policypages/cookie",
        permanent: true,
      },
      {
        source: "/deals",
        destination: "/exclusivedeals",
        permanent: true,
      },
      {
        source: "/exclusive-deals",
        destination: "/exclusivedeals",
        permanent: true,
      },
      {
        source: "/buy-smart",
        destination: "/buysmart",
        permanent: true,
      },
      {
        source: "/sales",
        destination: "/sale",
        permanent: true,
      },
      {
        source: "/trending-videos",
        destination: "/trendingvids",
        permanent: true,
      },
      {
        source: "/rss",
        destination: "/rss.xml",
        permanent: true,
      },
      {
        source: "/news/topic/:topic",
        destination: "/news/topics/:topic",
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
    qualities: [75, 78, 82],
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
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
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
