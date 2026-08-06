import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function createNoStoreIncrementalCache() {
  const cacheKey = async (value) =>
    typeof value === "string" ? value : JSON.stringify(value);

  return {
    isOnDemandRevalidate: false,
    generateCacheKey: cacheKey,
    generateSimpleCacheKey: cacheKey,
    async get() {
      return null;
    },
    async set() {},
  };
}

export async function renderCompiledSitemapRoute(
  routePath,
  { loadModule = require, workingDirectory = "", request, routeContext } = {},
) {
  const previousWorkingDirectory = process.cwd();
  const hadIncrementalCache = Object.hasOwn(globalThis, "__incrementalCache");
  const previousIncrementalCache = globalThis.__incrementalCache;
  globalThis.__incrementalCache = createNoStoreIncrementalCache();

  try {
    if (workingDirectory) process.chdir(workingDirectory);
    const route = loadModule(routePath);
    const get = route?.routeModule?.userland?.GET;
    if (typeof get !== "function") {
      throw new Error("Compiled sitemap route does not export a GET handler.");
    }

    const response = await get(request, routeContext);
    if (!response || typeof response.text !== "function") {
      throw new Error(
        "Compiled sitemap GET handler did not return a Response.",
      );
    }
    if (typeof response.ok === "boolean" && !response.ok) {
      throw new Error(
        `Compiled sitemap GET handler returned HTTP ${response.status}.`,
      );
    }

    const xml = await response.text();
    return xml;
  } finally {
    try {
      if (workingDirectory) process.chdir(previousWorkingDirectory);
    } finally {
      if (hadIncrementalCache) {
        globalThis.__incrementalCache = previousIncrementalCache;
      } else {
        delete globalThis.__incrementalCache;
      }
    }
  }
}

export async function readRenderedSitemapXml({
  staticOutputPath,
  dynamicRoutePath,
  dynamicRouteWorkingDirectory = "",
  dynamicRouteRequest,
  dynamicRouteContext,
  readText = (filePath) => readFile(filePath, "utf8"),
  renderDynamicRoute = renderCompiledSitemapRoute,
}) {
  try {
    return await readText(staticOutputPath);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  try {
    return await renderDynamicRoute(dynamicRoutePath, {
      workingDirectory: dynamicRouteWorkingDirectory,
      request: dynamicRouteRequest,
      routeContext: dynamicRouteContext,
    });
  } catch (error) {
    throw new Error(
      "Rendered sitemap output is missing. Run npm run build:web before generating route quality.",
      { cause: error },
    );
  }
}

function decodeXml(value = "") {
  return String(value)
    .replace(/&amp;/gi, "&")
    .replace(/&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

export function extractSitemapLocations(xml = "") {
  return [...String(xml).matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map((match) => decodeXml(match[1]).trim())
    .filter(Boolean);
}

export function extractAdvertisedSitemapUrls(robots = "") {
  return [...String(robots).matchAll(/^\s*Sitemap:\s*(\S+)\s*$/gim)]
    .map((match) => match[1].trim())
    .filter(Boolean);
}

/**
 * Resolve every URL submitted through the sitemap documents advertised by
 * robots.txt. A document may be a regular urlset or a sitemap index; indexes
 * are followed recursively and cycles are ignored.
 */
export async function collectSitemapPaths({
  sitemapUrls,
  readSitemap,
  maxDocuments = 100,
}) {
  const queue = [...new Set((sitemapUrls || []).filter(Boolean))];
  const documents = new Set();
  const paths = new Set();

  while (queue.length) {
    const sitemapUrl = queue.shift();
    if (documents.has(sitemapUrl)) continue;
    if (documents.size >= maxDocuments) {
      throw new Error(
        `Rendered sitemap graph exceeds the ${maxDocuments}-document safety limit.`,
      );
    }

    documents.add(sitemapUrl);
    const xml = await readSitemap(sitemapUrl);
    const locations = extractSitemapLocations(xml);
    const isSitemapIndex = /<sitemapindex\b/i.test(xml);

    if (isSitemapIndex) {
      for (const location of locations) {
        if (!documents.has(location)) queue.push(location);
      }
      continue;
    }

    for (const location of locations) {
      try {
        const url = new URL(location);
        const pathname =
          url.pathname !== "/" ? url.pathname.replace(/\/+$/, "") : "/";
        paths.add(pathname);
      } catch {
        throw new Error(
          `Sitemap contains an invalid absolute URL: ${location}`,
        );
      }
    }
  }

  return { paths, documents };
}
