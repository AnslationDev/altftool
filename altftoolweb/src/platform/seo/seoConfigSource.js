// altftoolweb/src/platform/seo/seoConfigSource.js
//
// Server-side reader for the ALTF Engine central SEO config.
//
// Mirrors the existing Firestore-over-REST read pattern used by
// `src/app/blogs/data/firebaseBlogs.js` and `src/app/[slug]/page.jsx`:
//   - public REST API + NEXT_PUBLIC_FIREBASE_API_KEY (config docs are public-read)
//   - AbortController timeout, in-memory cache with TTL, ISR `next.revalidate` + tag
//   - never throws: any failure falls back to an EMPTY (inert) config
//
// The whole config lives in a single small document so it can be held in a
// synchronous in-memory snapshot that `createPageMetadata` reads without an
// await. The config is GLOBAL (not per-user), so a shared module-level cache is
// correct and desirable.
//
// FEATURE FLAG: the engine is OFF unless `ALTFT_SEO_ENGINE_ENABLED=true` (or
// `NEXT_PUBLIC_SEO_ENGINE_ENABLED=true`). When OFF, getSeoConfigSnapshot()
// returns null and metadata output is byte-identical to the pre-engine behavior.

import { emptySeoConfig } from "@altftool/core/seo/schemas";

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";
const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36";

const SEO_DOC_PATH = "projects/altftool/seo/runtime";
const CACHE_SECONDS = Number(process.env.ALTFT_SEO_CONFIG_TTL_SECONDS || 300);
// In-memory snapshot lives much shorter than the (globally revalidatable) fetch
// cache, so admin edits reflect within seconds even on warm serverless instances
// that never receive the reset signal. The fetch cache (revalidate=CACHE_SECONDS,
// tag) is invalidated globally on save via /api/revalidate.
const SNAPSHOT_TTL_MS = Number(process.env.ALTFT_SEO_SNAPSHOT_TTL_SECONDS || 20) * 1000;
const TIMEOUT_MS = Number(process.env.ALTFT_FIRESTORE_REST_TIMEOUT_MS || 3500);
const FAILURE_TTL_MS = Number(process.env.ALTFT_SEO_FAILURE_TTL_SECONDS || 15) * 1000;
const PRIME_BUDGET_MS = Math.max(
  0,
  Number(process.env.ALTFT_SEO_PRIME_BUDGET_MS || 350),
);
export const SEO_CONFIG_REVALIDATE_TAG = "seo-config";

function engineEnabled() {
  return (
    process.env.ALTFT_SEO_ENGINE_ENABLED === "true" ||
    process.env.NEXT_PUBLIC_SEO_ENGINE_ENABLED === "true"
  );
}

// ---- Firestore value decoding (same shape as firebaseBlogs.js) -------------
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
      Object.entries(value.mapValue.fields || {}).map(([key, nested]) => [
        key,
        firestoreValueToJs(nested),
      ]),
    );
  }
  return undefined;
}

function decodeDocument(document) {
  if (!document || !document.fields) return null;
  return Object.fromEntries(
    Object.entries(document.fields).map(([key, value]) => [key, firestoreValueToJs(value)]),
  );
}

// ---- Module-level snapshot cache -------------------------------------------
let cachedConfig = null;
let cachedExpiry = 0;
let inflight = null;
let inflightStartedAt = 0;

function freshFromCache() {
  if (cachedConfig && cachedExpiry > Date.now()) return cachedConfig;
  return null;
}

function staleFromCache() {
  return cachedConfig;
}

function isProductionBuild() {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build"
  );
}

async function fetchSeoConfig() {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${SEO_DOC_PATH}?key=${FIREBASE_API_KEY}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      next: { revalidate: CACHE_SECONDS, tags: [SEO_CONFIG_REVALIDATE_TAG] },
      signal: controller.signal,
    });
    // 404 = config doc not created yet -> treat as empty (inert), still "ok".
    if (response.status === 404) return emptySeoConfig();
    if (!response.ok) return null;
    const json = await response.json().catch(() => null);
    const decoded = decodeDocument(json);
    if (!decoded) return emptySeoConfig();
    return { ...emptySeoConfig(), ...decoded };
  } catch {
    return null; // timeout/network -> caller falls back
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Async: load (and cache) the central SEO config. Never throws.
 * Returns the EMPTY config on failure so callers stay inert.
 * @returns {Promise<object>}
 */
export async function loadSeoConfig() {
  if (!engineEnabled()) return emptySeoConfig();

  const cached = freshFromCache();
  if (cached) return cached;

  if (!inflight) {
    inflightStartedAt = Date.now();
    inflight = fetchSeoConfig()
      .then((config) => {
        if (config) {
          cachedConfig = config;
          cachedExpiry = Date.now() + SNAPSHOT_TTL_MS;
        } else {
          cachedConfig = staleFromCache() || emptySeoConfig();
          cachedExpiry = Date.now() + FAILURE_TTL_MS;
        }
        return cachedConfig;
      })
      .finally(() => {
        inflight = null;
        inflightStartedAt = 0;
      });
  }
  return inflight;
}

/**
 * Sync: return the currently-cached config snapshot, or null.
 * Does NOT trigger a fetch (safe to call from synchronous createPageMetadata).
 * Returns null when the engine is disabled, the cache is cold, or the config
 * is explicitly disabled — all of which keep metadata output inert.
 * @returns {object|null}
 */
export function getSeoConfigSnapshot() {
  if (!engineEnabled()) return null;
  const cached = freshFromCache() || staleFromCache();
  if (!cached || cached.enabled === false) return null;
  return cached;
}

/**
 * Warm the snapshot cache for the current render tree. Call from a server
 * layout/page `generateMetadata` before metadata resolution. Never throws.
 */
export async function primeSeoConfig({ waitForFresh = isProductionBuild() } = {}) {
  try {
    if (!engineEnabled() || freshFromCache()) return;

    const pending = loadSeoConfig();
    if (waitForFresh) {
      await pending;
      return;
    }
    if (PRIME_BUDGET_MS === 0) return;

    const elapsedMs = inflightStartedAt
      ? Math.max(0, Date.now() - inflightStartedAt)
      : 0;
    const remainingBudgetMs = Math.max(0, PRIME_BUDGET_MS - elapsedMs);
    if (remainingBudgetMs === 0) return;

    let timeout;
    await Promise.race([
      pending,
      new Promise((resolve) => {
        timeout = setTimeout(resolve, remainingBudgetMs);
      }),
    ]);
    if (timeout) clearTimeout(timeout);
  } catch {
    /* inert on failure */
  }
}

/** Mark the snapshot stale while retaining it until the refreshed config lands. */
export function __expireSeoConfigCache() {
  cachedExpiry = 0;
}

/** Test/diagnostics helper. */
export function __resetSeoConfigCache() {
  cachedConfig = null;
  cachedExpiry = 0;
  inflight = null;
  inflightStartedAt = 0;
}
