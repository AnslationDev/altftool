import { toolRuntimeMap } from "@/platform/registry/toolRuntimeMap";

const modulePromiseCache = new Map();

function getToolImporter(slug) {
  return toolRuntimeMap[slug] || null;
}

export function prefetchToolModule(slug) {
  const importer = getToolImporter(slug);
  if (!importer) return null;

  if (!modulePromiseCache.has(slug)) {
    const promise = importer().catch((error) => {
      modulePromiseCache.delete(slug);
      throw error;
    });

    // Handle background speculative prefetch rejections silently to avoid unhandledRejection logs
    promise.catch(() => {});

    modulePromiseCache.set(slug, promise);
  }

  return modulePromiseCache.get(slug);
}

export async function loadToolModule(slug) {
  const importer = getToolImporter(slug);
  if (!importer) {
    throw new Error(`Tool runtime not found for ${slug}`);
  }

  let cachedPromise = modulePromiseCache.get(slug);
  if (!cachedPromise) {
    cachedPromise = prefetchToolModule(slug);
  }

  try {
    return await cachedPromise;
  } catch (error) {
    modulePromiseCache.delete(slug);
    // Auto-retry fresh import if prefetch failed due to transient dev server/network error
    const freshPromise = importer();
    modulePromiseCache.set(slug, freshPromise);
    try {
      return await freshPromise;
    } catch (retryError) {
      modulePromiseCache.delete(slug);
      throw retryError;
    }
  }
}
