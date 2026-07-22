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

  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, max-age=0",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },

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
        source: "/about-us",
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
        source: "/sale-locator",
        destination: "/sale",
        permanent: true,
      },
      {
        source: "/brand-ratings",
        destination: "/brandrating",
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

  webpack(config, { dev, isServer }) {
    if (dev) {
      config.devtool = "cheap-module-source-map";
    }
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /@vladmandic\/face-api/,
        message: /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
      },
      {
        module: /@tensorflow/,
        message: /Critical dependency|Require function/,
      },
    ];

    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      util: false,
      stream: false,
      assert: false,
    };

    // Bundle-dedupe aliases. Each of these libraries was shipping twice in the
    // client bundle because a dependency embeds its own private copy:
    // - onnxruntime-web 1.21's default bundle already contains the WebGPU/jsep
    //   backend; the "/webgpu" subpath is a near-identical compat file, and
    //   @imgly/background-removal dynamically imports both paths (~380 KiB raw
    //   duplicated).
    // - @vladmandic/face-api's default dist embeds tfjs 4.22.0; the nobundle
    //   dist imports @tensorflow/tfjs/dist/index.js — the exact file our direct
    //   @tensorflow/tfjs 4.22.0 imports resolve to — so tfjs ships once
    //   (requires @tensorflow/tfjs-backend-wasm, pinned to the same version).
    // - html2pdf.js's "main" is a UMD bundle with private jspdf + html2canvas +
    //   dompurify copies; its src entry imports jspdf/dist/jspdf.es.min.js and
    //   html2canvas, which dedupe with the app's own direct dependencies.
    config.resolve.alias = {
      ...config.resolve.alias,
      "onnxruntime-web/webgpu$": "onnxruntime-web",
      "@vladmandic/face-api$": "@vladmandic/face-api/dist/face-api.esm-nobundle.js",
      "html2pdf.js$": "html2pdf.js/src/index.js",
    };

    // Many mid-size vendor modules (react-hot-toast, framer-motion internals,
    // recharts pieces, file-saver, lucide icons, ...) were duplicated into
    // dozens of per-tool async chunks (~1.6 MiB raw of repeated code). Split
    // vendor modules shared by 4+ async chunks into reusable chunks. Async-only
    // so initial/page chunks and SSR manifests are untouched.
    if (!dev && !isServer && config.optimization?.splitChunks?.cacheGroups) {
      // face-api (nobundle) + the wasm backend are shared by the ~9 face
      // analysis tools; without a named group they get copied into each tool
      // chunk (face-api is below Next's 160 KB per-module "lib" threshold).
      config.optimization.splitChunks.cacheGroups.faceStack = {
        test: /[\\/]node_modules[\\/](@vladmandic[\\/]face-api|@tensorflow[\\/]tfjs-backend-wasm)[\\/]/,
        name: "face-stack",
        chunks: "async",
        minChunks: 1,
        priority: 35,
        reuseExistingChunk: true,
        enforce: true,
      };
      config.optimization.splitChunks.cacheGroups.sharedAsyncVendors = {
        test: /[\\/]node_modules[\\/]/,
        chunks: "async",
        minChunks: 4,
        minSize: 20000,
        priority: 20,
        reuseExistingChunk: true,
        // enforce only lifts the max-async/initial-request caps here; the
        // explicit minChunks/minSize above still apply (webpack keeps
        // per-cache-group values when set).
        enforce: true,
      };
    }

    // Keep terser single-threaded: parallel workers spike build memory on the
    // 629-tool catalog (from landing-refactor branch).
    if (!dev && config.optimization?.minimizer) {
      for (const minimizer of config.optimization.minimizer) {
        if (minimizer.options && "parallel" in minimizer.options) {
          minimizer.options.parallel = false;
        }
      }
    }

    return config;
  },

  experimental: {
    workerThreads: false,
    cpus: 1,
    webpackBuildWorker: false,
  },
};

export default withSecurityHeaders(nextConfig, "public");
