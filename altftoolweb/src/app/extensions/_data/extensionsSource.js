// Server-side read layer for the extensions catalog — Firestore REST (no Admin
// SDK), mirroring src/app/lander/data/firebaseLanders.js. Reads
// projects/altftool/extensions so /extensions and /extensions/[slug] can render
// a real H1, unique metadata and structured data on the server instead of
// waiting for a client-side Firestore round trip.

import { fetchJsonWithRetry } from "@/lib/server/resilientJsonFetch";
import { normalizeExtension, isDisplayableExtension } from "@altftool/core/firebaseContent";

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
const FIRESTORE_MAX_ATTEMPTS = Number(process.env.ALTFT_FIRESTORE_REST_MAX_ATTEMPTS || 3);

const memoryCache = new Map();
const inflightRequests = new Map();

function readCache(key) {
  const cached = memoryCache.get(key);
  if (!cached || cached.expiresAt <= Date.now()) return undefined;
  return cached.value;
}

function readStaleCache(key) {
  const cached = memoryCache.get(key);
  if (!cached || cached.value === null || cached.value === undefined) return null;
  if (Array.isArray(cached.value) && cached.value.length === 0) return null;
  return cached.value;
}

function writeCache(key, value) {
  const isEmpty =
    value === null || value === undefined || (Array.isArray(value) && value.length === 0);
  if (!memoryCache.has(key) && memoryCache.size >= MAX_MEMORY_CACHE_ENTRIES) {
    const expiredKey = [...memoryCache.entries()].find(
      ([, entry]) => entry.expiresAt <= Date.now(),
    )?.[0];
    memoryCache.delete(expiredKey || memoryCache.keys().next().value);
  }
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + (isEmpty ? NEGATIVE_CACHE_MS : CACHE_MS),
  });
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

async function firestoreGet(pathSuffix, searchParams = "") {
  if (!FIREBASE_API_KEY || !FIREBASE_PROJECT_ID) return null;

  const url = `https://firestore.googleapis.com/v1/${FIRESTORE_PARENT}/${pathSuffix}?key=${FIREBASE_API_KEY}${searchParams}`;
  const inflight = inflightRequests.get(url);
  if (inflight) return inflight;

  const request = fetchJsonWithRetry(url, {
    label: `Firestore extensions ${pathSuffix}`,
    timeoutMs: FIRESTORE_TIMEOUT_MS,
    maxAttempts: FIRESTORE_MAX_ATTEMPTS,
    baseDelayMs: 120,
    maxDelayMs: 800,
    next: { revalidate: CACHE_SECONDS },
  }).finally(() => {
    inflightRequests.delete(url);
  });

  inflightRequests.set(url, request);
  return request;
}

/**
 * One extension document by slug, normalized, or null when the slug is unknown.
 * A 404 from Firestore resolves to null (negatively cached) so an unknown slug
 * produces a real 404 instead of an error page.
 */
export async function fetchExtensionBySlug(slug) {
  const cleanSlug = String(slug || "").trim();
  if (!cleanSlug) return null;

  const key = `extension:${cleanSlug}`;
  const cached = readCache(key);
  if (cached !== undefined) return cached;

  let payload;
  try {
    payload = await firestoreGet(`extensions/${encodeURIComponent(cleanSlug)}`);
  } catch (error) {
    // A 404 is a definitive "no such extension"; anything else is transient and
    // should fall back to the last good value rather than 404 a live page.
    if (error?.status === 404) return writeCache(key, null);
    return readStaleCache(key);
  }

  if (!payload?.fields) return writeCache(key, null);

  const extension = normalizeExtension(decodeDocument(payload), cleanSlug);
  return writeCache(key, isDisplayableExtension(extension) ? extension : null);
}

/**
 * Every displayable extension, normalized and sorted by name. Returns the last
 * good snapshot (or an empty array) when Firestore is unreachable so the
 * listing degrades to the client fetch instead of failing the render.
 */
export async function fetchAllExtensions() {
  const key = "extensions:list";
  const cached = readCache(key);
  if (cached !== undefined) return cached;

  let payload;
  try {
    payload = await firestoreGet("extensions", "&pageSize=300");
  } catch {
    return readStaleCache(key) || [];
  }

  const rows = (payload?.documents || [])
    .map((document) => {
      const decoded = decodeDocument(document);
      return normalizeExtension(decoded, decoded.slug || decoded.id);
    })
    .filter(isDisplayableExtension);

  rows.sort((a, b) => a.name.localeCompare(b.name));
  return writeCache(key, rows);
}

/**
 * The subset of fields the listing grid and its filters actually use. Keeps the
 * server-to-client payload small — the full documents stay on the server.
 */
export function toListingExtension(extension = {}) {
  return {
    slug: extension.slug,
    name: extension.name,
    description: extension.description,
    category: extension.category,
    image: extension.image,
    rating: extension.rating,
  };
}
