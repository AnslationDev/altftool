// altftoolwebadmin/src/lib/seoRegistrySource.js
//
// Fetches the public web app's page inventory and caches it in-memory (TTL) for
// the SEO registry, search, and dashboard. Server-only (uses the shared secret).

const TTL_MS = Number(process.env.ALTFT_REGISTRY_TTL_MS || 120_000);
let cache = { at: 0, entries: [] };

function inventoryUrl() {
  return (
    process.env.ALTFT_WEB_INVENTORY_URL ||
    (process.env.ALTFT_WEB_REVALIDATE_URL || "").replace(/\/api\/revalidate\/?$/, "/api/pages/inventory")
  );
}

/**
 * @param {{ force?: boolean }} [opts]
 * @returns {Promise<object[]>} normalized PageIndexEntry records
 */
export async function getRegistryEntries({ force = false } = {}) {
  if (!force && cache.at + TTL_MS > Date.now() && cache.entries.length) return cache.entries;

  const url = inventoryUrl();
  const secret = process.env.ALTFT_REVALIDATE_SECRET;
  if (!url || !secret) return cache.entries;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(url, {
      headers: { "x-inventory-secret": secret },
      cache: "no-store",
      signal: controller.signal,
    });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (Array.isArray(data?.entries)) cache = { at: Date.now(), entries: data.entries };
    }
  } catch {
    // keep stale cache on failure
  } finally {
    clearTimeout(timeout);
  }
  return cache.entries;
}
