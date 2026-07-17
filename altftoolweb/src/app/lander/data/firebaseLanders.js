// Public read layer for landing pages — Firestore REST (no Admin SDK), mirroring
// the blogs reader. Reads projects/altftool/landers. Server-only; cached via the
// fetch revalidate window + a small in-memory layer so ISR stays cheap.

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";
const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36";
const PROJECT_ID = "altftool";
const FIRESTORE_PARENT = `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/projects/${PROJECT_ID}`;
const CACHE_SECONDS = 300;
const CACHE_MS = CACHE_SECONDS * 1000;
const NEGATIVE_CACHE_MS = 30 * 1000;
const FIRESTORE_TIMEOUT_MS = Number(process.env.ALTFT_FIRESTORE_REST_TIMEOUT_MS || 8000);

const memoryCache = new Map();

function readCache(key) {
  const cached = memoryCache.get(key);
  if (!cached || cached.expiresAt <= Date.now()) return null;
  return cached.value;
}
function writeCache(key, value) {
  const isEmpty = value === null || value === undefined || (Array.isArray(value) && value.length === 0);
  memoryCache.set(key, { value, expiresAt: Date.now() + (isEmpty ? NEGATIVE_CACHE_MS : CACHE_MS) });
  return value;
}

function firestoreValueToJs(value) {
  if (!value) return undefined;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return Boolean(value.booleanValue);
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(firestoreValueToJs);
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields || {}).map(([k, v]) => [k, firestoreValueToJs(v)]),
    );
  }
  return undefined;
}

function decodeDocument(document) {
  const data = Object.fromEntries(
    Object.entries(document.fields || {}).map(([k, v]) => [k, firestoreValueToJs(v)]),
  );
  return { id: document.name.split("/").pop(), ...data };
}

function fieldFilter(fieldPath, op, value) {
  return { fieldFilter: { field: { fieldPath }, op, value } };
}
function andFilter(filters) {
  const active = filters.filter(Boolean);
  if (active.length === 1) return active[0];
  return { compositeFilter: { op: "AND", filters: active } };
}

async function firestorePost(endpoint, body) {
  if (!FIREBASE_API_KEY || !FIREBASE_PROJECT_ID) return [];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FIRESTORE_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(
      `https://firestore.googleapis.com/v1/${FIRESTORE_PARENT}:${endpoint}?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        next: { revalidate: CACHE_SECONDS },
        signal: controller.signal,
      },
    );
  } catch (error) {
    if (error?.name === "AbortError") throw new Error(`Firestore ${endpoint} timed out after ${FIRESTORE_TIMEOUT_MS}ms`);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) throw new Error(`Firestore ${endpoint} failed: ${response.status}`);
  return response.json();
}

// A published landing page by slug, or null. Matches slugLower so lookups are
// case-insensitive and consistent with how the admin stores slugs.
export async function fetchFirebaseLanderBySlug(slug) {
  if (!slug) return null;
  const key = `lander:${String(slug).toLowerCase()}`;
  const cached = readCache(key);
  if (cached !== null) return cached;

  let rows;
  try {
    rows = await firestorePost("runQuery", {
      structuredQuery: {
        from: [{ collectionId: "landers" }],
        where: andFilter([
          fieldFilter("status", "EQUAL", { stringValue: "published" }),
          fieldFilter("slugLower", "EQUAL", { stringValue: String(slug).toLowerCase() }),
        ]),
        limit: 1,
      },
    });
  } catch {
    return null; // degrade to 404 rather than throwing the whole route
  }

  const document = rows.find((row) => row.document)?.document;
  return writeCache(key, document ? decodeDocument(document) : null);
}

// All published slugs (+ updatedAt) — for generateStaticParams and sitemaps.
export async function fetchAllPublishedLanderSlugs({ max = 500 } = {}) {
  const key = "landerSlugs";
  const cached = readCache(key);
  if (cached) return cached;

  let rows;
  try {
    rows = await firestorePost("runQuery", {
      structuredQuery: {
        select: { fields: [{ fieldPath: "slug" }, { fieldPath: "updatedAt" }] },
        from: [{ collectionId: "landers" }],
        where: fieldFilter("status", "EQUAL", { stringValue: "published" }),
        limit: Math.min(max, 500),
      },
    });
  } catch {
    return [];
  }

  const items = rows
    .filter((row) => row.document)
    .map((row) => decodeDocument(row.document))
    .filter((d) => d.slug)
    .map((d) => ({ slug: d.slug, updatedAt: d.updatedAt || null }));

  return writeCache(key, items);
}
