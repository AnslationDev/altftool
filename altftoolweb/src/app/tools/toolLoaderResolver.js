import { toolRuntimeMap } from "@/platform/registry/toolRuntimeMap";

const modulePromiseCache = new Map();

function getToolImporter(slug) {
  return toolRuntimeMap[slug] || null;
}

export function prefetchToolModule(slug) {
  const importer = getToolImporter(slug);
  if (!importer) return null;

  if (!modulePromiseCache.has(slug)) {
    modulePromiseCache.set(
      slug,
      importer().catch((error) => {
        modulePromiseCache.delete(slug);
        throw error;
      }),
    );
  }

  return modulePromiseCache.get(slug);
}

export async function loadToolModule(slug) {
  const modulePromise = prefetchToolModule(slug);

  if (!modulePromise) {
    throw new Error(`Tool runtime not found for ${slug}`);
  }

  return modulePromise;
}
