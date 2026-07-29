import { withSecurityHeaders } from "@altftool/core/next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.dirname(fileURLToPath(import.meta.url));

function readBuildCpuCount() {
  const configured = Number.parseInt(process.env.ALTFT_BUILD_CPUS ?? "", 10);

  if (!Number.isFinite(configured)) {
    return 1;
  }

  // Four workers use the Amplify Large instance well without letting the
  // unusually large tool catalog consume every available CPU and memory slot.
  return Math.min(Math.max(configured, 1), 4);
}

const buildCpuCount = readBuildCpuCount();
const isDevelopment = process.env.NODE_ENV === "development";
const parallelMinification =
  process.env.ALTFT_PARALLEL_MINIFY === "true" && buildCpuCount > 1;
const useWebpackBuildWorker =
  process.env.ALTFT_WEBPACK_BUILD_WORKER === "true";
const enableSharedAsyncVendorChunks =
  process.env.ALTFT_ENABLE_SHARED_ASYNC_VENDOR_CHUNKS === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {

  outputFileTracingRoot: workspaceRoot,
  poweredByHeader: false,
  compress: true,
  transpilePackages: ["@altftool/ui"],
  allowedDevOrigins: ["localhost", "127.0.0.1"],

  // The /transform code-generation libraries are heavy, server-only and used
  // by that route alone. Bundling them re-emits the same megabytes into every
  // server chunk that touches the transformer registry; leaving them external
  // keeps one copy in node_modules instead. Measured 2026-07-28: −17.8 MiB of
  // the Amplify artifact. Verified transform-only — nothing outside
  // src/app/transform imports any of these, and _lib has no "use client",
  // so externalising cannot affect a client bundle.
  serverExternalPackages: [
    "@khanacademy/flow-to-ts",
    "typescript",
    "quicktype-core",
    "ts-json-schema-generator",
    "ts-to-zod",
    "json-schema-to-typescript",
    "json-schema-to-zod",
    "json-to-zod",
    "@openapi-contrib/json-schema-to-openapi-schema",
    "to-json-schema",
    "jsonld",
    "mobx-state-tree",
    "node-html-parser",
    "html2pug",
    "xml-js",
    "io-ts",
    "@iarna/toml",
  ],






  async headers() {
    return [
      {
        // Widget iframes are meant to be embedded on third-party sites.
        // The enforced frame-ancestors CSP governs framing in modern browsers
        // (it supersedes X-Frame-Options per CSP2); SAMEORIGIN replaces the
        // site-wide DENY so the /embed hub's same-origin preview also works in
        // legacy XFO-only browsers.
        source: "/embed/widget/:path+",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
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
    return [
      {
        // Keep legacy Business Ops links on a single permanent hop to the
        // canonical Housing Needs tree.
        source: "/business-ops/housingneeds",
        destination: "/bops/housingneeds",
        permanent: true,
      },
      {
        source: "/business-ops/housingneeds/:path*",
        destination: "/bops/housingneeds/:path*",
        permanent: true,
      },
      {
        // Business Ops was renamed to the shorter /bops. Kept AFTER the two
        // housingneeds rules above so those still win (old /business-ops/
        // housingneeds paths go to the root HousingNeeds module, not /bops).
        source: "/business-ops/:path*",
        destination: "/bops/:path*",
        permanent: true,
      },
      // HousingNeeds pages live FLAT under the Business Ops tree:
      // /bops/housingneeds/<page>. 301s so indexed URLs transfer their equity.
      { source: "/housingneeds", destination: "/bops/housingneeds", permanent: true },
      { source: "/housingneeds/roofing", destination: "/bops/housingneeds/roofing", permanent: true },
      { source: "/housingneeds/siding", destination: "/bops/housingneeds/siding", permanent: true },
      { source: "/housingneeds/gutters", destination: "/bops/housingneeds/gutters", permanent: true },
      { source: "/housingneeds/windows", destination: "/bops/housingneeds/windows", permanent: true },
      { source: "/housingneeds/solar", destination: "/bops/housingneeds/solar", permanent: true },
      { source: "/housingneeds/plumbing", destination: "/bops/housingneeds/plumbing", permanent: true },
      { source: "/housingneeds/interiors", destination: "/bops/housingneeds/interiors", permanent: true },
      { source: "/housingneeds/pestcontrol", destination: "/bops/housingneeds/pestcontrol", permanent: true },
      {
        // Deeper root housingneeds paths (main's /housingneeds/<cat>/<page>
        // landers) hop to the bops tree, where the categorised rules below
        // flatten them to /bops/housingneeds/<page>.
        source: "/housingneeds/:category/:path*",
        destination: "/bops/housingneeds/:category/:path*",
        permanent: true,
      },
      // Old categorised bops URLs -> flat. One rule per former
      // <category>/<page> pair; :path* carries nested routes (climatech blog,
      // kairos termites) along.
      { source: "/bops/housingneeds/roofing/roofers/:path*", destination: "/bops/housingneeds/roofers/:path*", permanent: true },
      { source: "/bops/housingneeds/roofing/roofing/:path*", destination: "/bops/housingneeds/roofing/:path*", permanent: true },
      { source: "/bops/housingneeds/siding/siding-pros/:path*", destination: "/bops/housingneeds/siding-pros/:path*", permanent: true },
      { source: "/bops/housingneeds/siding/siding/:path*", destination: "/bops/housingneeds/siding/:path*", permanent: true },
      { source: "/bops/housingneeds/gutters/gutters/:path*", destination: "/bops/housingneeds/gutters/:path*", permanent: true },
      { source: "/bops/housingneeds/windows/window-replacement/:path*", destination: "/bops/housingneeds/window-replacement/:path*", permanent: true },
      { source: "/bops/housingneeds/windows/windows/:path*", destination: "/bops/housingneeds/windows/:path*", permanent: true },
      { source: "/bops/housingneeds/solar/helios-solar/:path*", destination: "/bops/housingneeds/helios-solar/:path*", permanent: true },
      { source: "/bops/housingneeds/solar/solar/:path*", destination: "/bops/housingneeds/solar/:path*", permanent: true },
      { source: "/bops/housingneeds/plumbing/plumber/:path*", destination: "/bops/housingneeds/plumber/:path*", permanent: true },
      { source: "/bops/housingneeds/plumbing/plumbing/:path*", destination: "/bops/housingneeds/plumbing/:path*", permanent: true },
      { source: "/bops/housingneeds/bathroom/bathroom-remodeling/:path*", destination: "/bops/housingneeds/bathroom-remodeling/:path*", permanent: true },
      { source: "/bops/housingneeds/interiors/interiors/:path*", destination: "/bops/housingneeds/interiors/:path*", permanent: true },
      { source: "/bops/housingneeds/hvac/climatech/:path*", destination: "/bops/housingneeds/climatech/:path*", permanent: true },
      { source: "/bops/housingneeds/pest-control/kairos/:path*", destination: "/bops/housingneeds/kairos/:path*", permanent: true },
      { source: "/bops/housingneeds/pest-control/pest-killer/:path*", destination: "/bops/housingneeds/pest-killer/:path*", permanent: true },
      { source: "/bops/housingneeds/pest-control/pestcontrol/:path*", destination: "/bops/housingneeds/pestcontrol/:path*", permanent: true },
      { source: "/bops/housingneeds/pest-control/pest-control/:path*", destination: "/bops/housingneeds/pest-control/:path*", permanent: true },
      // The provider landers moved out of Housing Needs into Housing
      // Services; Housing Needs keeps only the editorial guides.
      { source: "/bops/housingneeds/roofers/:path*", destination: "/bops/housing-services/roofers/:path*", permanent: true },
      { source: "/bops/housingneeds/siding-pros/:path*", destination: "/bops/housing-services/siding-pros/:path*", permanent: true },
      { source: "/bops/housingneeds/window-replacement/:path*", destination: "/bops/housing-services/window-replacement/:path*", permanent: true },
      { source: "/bops/housingneeds/helios-solar/:path*", destination: "/bops/housing-services/helios-solar/:path*", permanent: true },
      { source: "/bops/housingneeds/plumber/:path*", destination: "/bops/housing-services/plumber/:path*", permanent: true },
      { source: "/bops/housingneeds/bathroom-remodeling/:path*", destination: "/bops/housing-services/bathroom-remodeling/:path*", permanent: true },
      { source: "/bops/housingneeds/climatech/:path*", destination: "/bops/housing-services/climatech/:path*", permanent: true },
      { source: "/bops/housingneeds/pest-control/:path*", destination: "/bops/housing-services/pest-control/:path*", permanent: true },
      { source: "/bops/housingneeds/pest-killer/:path*", destination: "/bops/housing-services/pest-killer/:path*", permanent: true },
      { source: "/bops/housingneeds/kairos/:path*", destination: "/bops/housing-services/kairos/:path*", permanent: true },
      { source: "/bops/housingneeds/peakshield-roofing/:path*", destination: "/bops/housing-services/peakshield-roofing/:path*", permanent: true },
      { source: "/bops/housingneeds/cladco-exteriors/:path*", destination: "/bops/housing-services/cladco-exteriors/:path*", permanent: true },
      { source: "/bops/housingneeds/rainright-gutters/:path*", destination: "/bops/housing-services/rainright-gutters/:path*", permanent: true },
      { source: "/bops/housingneeds/clearview-windows/:path*", destination: "/bops/housing-services/clearview-windows/:path*", permanent: true },
      { source: "/bops/housingneeds/sunyield-solar/:path*", destination: "/bops/housing-services/sunyield-solar/:path*", permanent: true },
      { source: "/bops/housingneeds/pipeworks-pro/:path*", destination: "/bops/housing-services/pipeworks-pro/:path*", permanent: true },
      { source: "/bops/housingneeds/aqualux-baths/:path*", destination: "/bops/housing-services/aqualux-baths/:path*", permanent: true },
      { source: "/bops/housingneeds/freshcoat-interiors/:path*", destination: "/bops/housing-services/freshcoat-interiors/:path*", permanent: true },
      { source: "/bops/housingneeds/airflow-masters/:path*", destination: "/bops/housing-services/airflow-masters/:path*", permanent: true },
      { source: "/bops/housingneeds/bugshield-pro/:path*", destination: "/bops/housing-services/bugshield-pro/:path*", permanent: true },
      { source: "/bops/housingneeds/irongate-security/:path*", destination: "/bops/housing-services/irongate-security/:path*", permanent: true },
      { source: "/bops/housingneeds/movemint/:path*", destination: "/bops/housing-services/movemint/:path*", permanent: true },
      { source: "/bops/housingneeds/sentinel-secure/:path*", destination: "/bops/housing-services/sentinel-secure/:path*", permanent: true },
      { source: "/bops/housingneeds/guardnest/:path*", destination: "/bops/housing-services/guardnest/:path*", permanent: true },
      { source: "/bops/housingneeds/swiftshift-movers/:path*", destination: "/bops/housing-services/swiftshift-movers/:path*", permanent: true },
      { source: "/bops/housingneeds/packngo/:path*", destination: "/bops/housing-services/packngo/:path*", permanent: true },
      { source: "/bops/housingneeds/topnotch-roofing/:path*", destination: "/bops/housing-services/topnotch-roofing/:path*", permanent: true },
      { source: "/bops/housingneeds/sidingworks/:path*", destination: "/bops/housing-services/sidingworks/:path*", permanent: true },
      { source: "/bops/housingneeds/gutterflow-pros/:path*", destination: "/bops/housing-services/gutterflow-pros/:path*", permanent: true },
      { source: "/bops/housingneeds/panecraft/:path*", destination: "/bops/housing-services/panecraft/:path*", permanent: true },
      { source: "/bops/housingneeds/ecovolt-solar/:path*", destination: "/bops/housing-services/ecovolt-solar/:path*", permanent: true },
      { source: "/bops/housingneeds/draindoctors/:path*", destination: "/bops/housing-services/draindoctors/:path*", permanent: true },
      { source: "/bops/housingneeds/tiletrend-bath/:path*", destination: "/bops/housing-services/tiletrend-bath/:path*", permanent: true },
      { source: "/bops/housingneeds/roomrevive/:path*", destination: "/bops/housing-services/roomrevive/:path*", permanent: true },
      { source: "/bops/housingneeds/polarflame/:path*", destination: "/bops/housing-services/polarflame/:path*", permanent: true },
      { source: "/bops/housingneeds/greenguard-pest/:path*", destination: "/bops/housing-services/greenguard-pest/:path*", permanent: true },
      { source: "/bops/housingneeds/nightwatch-security/:path*", destination: "/bops/housing-services/nightwatch-security/:path*", permanent: true },
      { source: "/bops/housingneeds/cityhop-movers/:path*", destination: "/bops/housing-services/cityhop-movers/:path*", permanent: true },
      // Former bathroom/hvac dashboard tabs — those categories now live only
      // in Housing Services, so deep-link to their hub sections.
      { source: "/bops/housingneeds/bathroom", destination: "/bops/housing-services#bathroom", permanent: false },
      { source: "/bops/housingneeds/hvac", destination: "/bops/housing-services#hvac", permanent: false },
      {
        source: "/games",
        destination: "/tools/games",
        permanent: true,
      },
      {
        source: "/tripfindbox",
        destination: "/bops/tripfindbox",
        permanent: true,
      },
      {
        source: "/tripfindbox/:path((?!.*\\..*).*)",
        destination: "/bops/tripfindbox/:path*",
        permanent: true,
      },
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
        // Unsplash+ assets are served from a separate host; without this
        // next/image throws "hostname is not configured" at request time.
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        // Business Ops landers (imported from the inventory project) reference
        // Google-hosted avatars/photos via next/image; without this the
        // optimizer throws "hostname is not configured" at request time.
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
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

  webpack(config, { dev, isServer, webpack }) {
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

    // The ~1,450 lazily-loaded tool runtimes are only ever reached from
    // "use client" code behind a `next/dynamic(..., { ssr: false })` boundary
    // (src/app/tools/[category]/[slug]/ToolClient.jsx,
    // src/app/embed/widget/[slug]/EmbedToolClient.jsx) or a mouseenter
    // prefetch (src/app/tools/ToolsClient.jsx). All three reach them through
    // src/app/tools/toolLoaderResolver.js -> the generated
    // src/platform/registry/toolRuntimeMap.js. The server compilation still
    // followed those `import()` edges and emitted ~1,300 SSR chunk twins
    // (~36 MiB of .next/server/chunks) that can never execute, because with
    // `ssr: false` the server renders only the `loading` fallback.
    //
    // Replacing the map with an empty stub in the server compilation only
    // severs that edge. The client compilation keeps the real module, so the
    // browser-side tool chunks in .next/static/chunks are untouched.
    // scripts/assert-no-server-tool-loader.mjs guards the invariant this
    // relies on: no server component or route handler may import the resolver.
    if (isServer) {
      const toolRuntimeMapServerStub = path.join(
        workspaceRoot,
        "src",
        "platform",
        "registry",
        "toolRuntimeMap.server-stub.js"
      );

      // Belt: rewrite the bare specifier before resolution.
      config.resolve.alias["@/platform/registry/toolRuntimeMap$"] =
        toolRuntimeMapServerStub;

      // Braces: if the jsconfig paths plugin wins the resolve race, catch the
      // resolved file instead. Both point at the same stub, so whichever fires
      // first produces the same module.
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /[\\/]platform[\\/]registry[\\/]toolRuntimeMap\.js(\?.*)?$/,
          toolRuntimeMapServerStub
        )
      );
    }

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
      // The all-tools runtime now exposes thousands of async tool chunks. The
      // broad "shared vendor across 4+ async chunks" pass is useful for bundle
      // audit runs, but standard GitHub/Vercel/Amplify/local builders can OOM
      // while analysing that giant graph. Keep the targeted face stack split
      // everywhere and make this expensive global chunk pass explicit opt-in.
      if (enableSharedAsyncVendorChunks) {
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
    }

    // Local and standard-size builders stay single-threaded. Amplify's Large
    // builder can opt into bounded parallelism alongside a larger Node heap.
    if (!dev && config.optimization?.minimizer) {
      for (const minimizer of config.optimization.minimizer) {
        if (minimizer.options && "parallel" in minimizer.options) {
          minimizer.options.parallel = parallelMinification
            ? Math.max(1, buildCpuCount - 1)
            : false;
        }
      }
    }

    // The webpack runtime chunk is loaded on every one of the 390 routes and
    // is ~92% a chunkId -> contenthash table for 4,256 async chunks — one row
    // per tool runtime. Next's default 16-hex digest spends 4 bytes per row on
    // entropy nothing needs: 48 bits still leaves a ~2e-6 chance of a stale
    // truncated hash across 500 deploys, and shortening it takes the runtime
    // chunk from 49.3 to 40.5 KB brotli site-wide. Client production only;
    // server and edge filenames carry no contenthash.
    //
    // This treats the symptom. The 4,256-chunk count is the cause, and it is
    // what actually needs reducing.
    if (!dev && !isServer && config.output) {
      config.output.hashDigestLength = 12;
    }

    return config;
  },

  experimental: {
    ...(!isDevelopment
      ? {
          workerThreads: buildCpuCount > 1,
          cpus: buildCpuCount,
          webpackBuildWorker: useWebpackBuildWorker,
          webpackMemoryOptimizations: true,
        }
      : {}),
  },
};

export default withSecurityHeaders(nextConfig, "public");
