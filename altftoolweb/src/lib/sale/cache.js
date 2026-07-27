import { createTtlCache } from "@altftool/core/cache";

/** Default cache lifetime for Sale Locator upstream responses: 10 minutes. */
export const SALE_CACHE_TTL_MS = 10 * 60 * 1000;

const saleCache = createTtlCache({ ttlMs: SALE_CACHE_TTL_MS, maxEntries: 300 });

/**
 * Get-or-set a value in the shared Sale Locator in-memory cache.
 * Concurrent calls for the same key share one in-flight request.
 *
 * @template T
 * @param {string} key
 * @param {() => Promise<T>} loader
 * @param {number} [ttlMs]
 * @returns {Promise<T>}
 */
export function getOrSetSaleCache(key, loader, ttlMs = SALE_CACHE_TTL_MS) {
  return saleCache.getOrSet(key, loader, ttlMs, { returnStaleOnError: true });
}

/**
 * Read a cached value without triggering the loader — undefined if there's
 * no fresh entry. Used where a caller wants to skip work entirely when a
 * fresh cached result already exists (e.g. streaming responses).
 * @param {string} key
 */
export function peekSaleCache(key) {
  return saleCache.get(key);
}

export function clearSaleCache(key) {
  if (key) saleCache.delete(key);
  else saleCache.clear();
}

export function saleCacheStats() {
  return saleCache.stats();
}

/**
 * Build a stable cache key from a namespace + params object.
 * @param {string} namespace
 * @param {Record<string, unknown>} params
 * @returns {string}
 */
export function buildCacheKey(namespace, params = {}) {
  const sortedEntries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${String(value).toLowerCase()}`);

  return `${namespace}:${sortedEntries.join("&")}`;
}
