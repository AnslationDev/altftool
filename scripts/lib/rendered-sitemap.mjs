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
  { loadModule = require, workingDirectory = "" } = {},
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

    const response = await get();
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
    });
  } catch (error) {
    throw new Error(
      "Rendered sitemap output is missing. Run npm run build:web before generating route quality.",
      { cause: error },
    );
  }
}
