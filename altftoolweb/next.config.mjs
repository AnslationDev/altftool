import { withSecurityHeaders } from "@altftool/core/next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { toolMetaMap } from "./src/platform/registry/toolMetaMap.js";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Import the generated map directly instead of regex-extracting + JSON.parsing
// its source text. The old approach crashed the entire dev server / build with
// "Unexpected end of JSON input" whenever toolMetaMap.js was read mid-generation
// (it's an auto-generated file) or contained any non-JSON value. Importing the
// object is correct, faster, and can't be tripped by a partial write.
function readToolSlugs() {
  try {
    return Object.keys(toolMetaMap ?? {});
  } catch {
    return [];
  }
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

  webpack(config, { dev }) {
    if (dev) {
      config.devtool = "cheap-module-source-map";
    }
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
