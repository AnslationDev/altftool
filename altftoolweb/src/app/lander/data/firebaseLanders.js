// Public read layer for landing pages — Firestore REST (no Admin SDK), mirroring
// the blogs reader. Reads projects/altftool/landers. Server-only; cached via the
// fetch revalidate window + a small in-memory layer so ISR stays cheap.

import { fetchJsonWithRetry } from "@/lib/server/resilientJsonFetch";

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
const MAX_MEMORY_CACHE_ENTRIES = 100;
const FIRESTORE_TIMEOUT_MS = Number(process.env.ALTFT_FIRESTORE_REST_TIMEOUT_MS || 8000);
const FIRESTORE_MAX_ATTEMPTS = Number(
  process.env.ALTFT_FIRESTORE_REST_MAX_ATTEMPTS || 3,
);

const memoryCache = new Map();
const inflightRequests = new Map();

function readCache(key) {
  const cached = memoryCache.get(key);
  if (!cached || cached.expiresAt <= Date.now()) return null;
  return cached.value;
}
function readStaleCache(key) {
  const cached = memoryCache.get(key);
  if (!cached || cached.value === null || cached.value === undefined) return null;
  if (Array.isArray(cached.value) && cached.value.length === 0) return null;
  return cached.value;
}
function writeCache(key, value) {
  const isEmpty = value === null || value === undefined || (Array.isArray(value) && value.length === 0);
  if (!memoryCache.has(key) && memoryCache.size >= MAX_MEMORY_CACHE_ENTRIES) {
    const expiredKey = [...memoryCache.entries()].find(
      ([, entry]) => entry.expiresAt <= Date.now(),
    )?.[0];
    memoryCache.delete(expiredKey || memoryCache.keys().next().value);
  }
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

  const requestKey = `${endpoint}:${JSON.stringify(body)}`;
  const inflight = inflightRequests.get(requestKey);
  if (inflight) return inflight;

  const request = fetchJsonWithRetry(
    `https://firestore.googleapis.com/v1/${FIRESTORE_PARENT}:${endpoint}?key=${FIREBASE_API_KEY}`,
    {
      label: `Firestore ${endpoint}`,
      timeoutMs: FIRESTORE_TIMEOUT_MS,
      maxAttempts: FIRESTORE_MAX_ATTEMPTS,
      baseDelayMs: 120,
      maxDelayMs: 800,
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      next: { revalidate: CACHE_SECONDS },
    },
  ).finally(() => {
    inflightRequests.delete(requestKey);
  });

  inflightRequests.set(requestKey, request);
  return request;
}

const toMs = (v) => (typeof v === "number" ? v : v ? Date.parse(v) || null : null);

// Whether a landing page should be publicly visible right now. Makes the admin
// scheduling window real without a cron: a `scheduled` page goes live once
// publishAt has passed, and any page auto-hides once expireAt has passed.
export function isLanderLive(doc, now = Date.now()) {
  if (!doc) return false;
  const publishAt = toMs(doc.publishAt);
  const expireAt = toMs(doc.expireAt);
  if (expireAt && expireAt <= now) return false;
  if (doc.status === "published") return true;
  if (doc.status === "scheduled") return !!publishAt && publishAt <= now;
  return false;
}

// A live landing page by slug, or null. Matches slugLower (case-insensitive,
// consistent with how the admin stores slugs) then applies the schedule gate.
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
          fieldFilter("status", "IN", { arrayValue: { values: [{ stringValue: "published" }, { stringValue: "scheduled" }] } }),
          fieldFilter("slugLower", "EQUAL", { stringValue: String(slug).toLowerCase() }),
        ]),
        limit: 1,
      },
    });
  } catch {
    return readStaleCache(key);
  }

  const document = rows.find((row) => row.document)?.document;
  const doc = document ? decodeDocument(document) : null;
  return writeCache(key, isLanderLive(doc) ? doc : null);
}

// All published slugs (+ lightweight SEO state) for static params and sitemaps.
export async function fetchAllPublishedLanderSlugs({ max = 500 } = {}) {
  const key = "landerSlugs";
  const cached = readCache(key);
  if (cached) return cached;

  let rows;
  try {
    rows = await firestorePost("runQuery", {
      structuredQuery: {
        select: {
          fields: [
            "slug",
            "updatedAt",
            "status",
            "publishAt",
            "expireAt",
            "seo",
          ].map((fieldPath) => ({ fieldPath })),
        },
        from: [{ collectionId: "landers" }],
        where: fieldFilter("status", "IN", { arrayValue: { values: [{ stringValue: "published" }, { stringValue: "scheduled" }] } }),
        limit: Math.min(max, 500),
      },
    });
  } catch {
    return readStaleCache(key) || [];
  }

  const items = rows
    .filter((row) => row.document)
    .map((row) => decodeDocument(row.document))
    .filter((d) => d.slug && isLanderLive(d))
    .map((d) => ({
      slug: d.slug,
      updatedAt: d.updatedAt || null,
      noIndex: d.seo?.noIndex === true,
    }));

  return writeCache(key, items);
}
