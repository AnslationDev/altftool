const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";
const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36";
const PROJECT_ID = "altftool";
const CACHE_SECONDS = 300;
const FIRESTORE_TIMEOUT_MS = Number(process.env.ALTFT_FIRESTORE_REST_TIMEOUT_MS || 3500);

const DYNAMIC_ROUTE_URL =
  `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}` +
  `/databases/(default)/documents/projects/${PROJECT_ID}/navigation/dynamic?key=${FIREBASE_API_KEY}`;

let memoryCache = null;

function firestoreValueToJs(value) {
  if (!value) return undefined;
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return Boolean(value.booleanValue);
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) {
    return (value.arrayValue.values || []).map(firestoreValueToJs);
  }
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields || {}).map(([key, nestedValue]) => [
        key,
        firestoreValueToJs(nestedValue),
      ]),
    );
  }
  return undefined;
}

function decodeDocument(document) {
  return Object.fromEntries(
    Object.entries(document.fields || {}).map(([key, value]) => [
      key,
      firestoreValueToJs(value),
    ]),
  );
}

function readCache() {
  if (!memoryCache || memoryCache.expiresAt <= Date.now()) {
    memoryCache = null;
    return null;
  }
  return memoryCache.value;
}

function writeCache(value) {
  memoryCache = {
    value,
    expiresAt: Date.now() + CACHE_SECONDS * 1000,
  };
  return value;
}

export async function fetchDynamicRouteConfig() {
  const cached = readCache();
  if (cached) return cached;
  if (!FIREBASE_API_KEY || !FIREBASE_PROJECT_ID) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FIRESTORE_TIMEOUT_MS);

  try {
    const response = await fetch(DYNAMIC_ROUTE_URL, {
      next: { revalidate: CACHE_SECONDS },
      signal: controller.signal,
    });

    if (response.status === 404) return writeCache(null);
    if (!response.ok) {
      throw new Error(`Firestore dynamic route read failed: ${response.status}`);
    }

    const document = await response.json();
    return writeCache(decodeDocument(document));
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`Firestore dynamic route read timed out after ${FIRESTORE_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function isDynamicRouteActiveForSlug(config, slug) {
  return Boolean(config?.enabled && config?.slug && config.slug === slug);
}
