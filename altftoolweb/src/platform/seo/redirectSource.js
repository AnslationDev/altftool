// altftoolweb/src/platform/seo/redirectSource.js
//
// Middleware-safe loader for ALTF Engine runtime redirects.
//
// proxy.js runs on every request, so this is deliberately lightweight:
//   - plain `fetch` with `cache: "no-store"` (no Next data-cache options, which
//     are not available in the middleware/Edge runtime)
//   - a module-level in-memory TTL cache (per runtime instance)
//   - feature-flag gated: returns [] instantly when the engine is OFF (no fetch,
//     no latency, no behavior change)
//   - never throws; serves stale on failure
//
// It reads the same `projects/altftool/seo/runtime` doc the rest of the engine
// uses, decoding only the `enabled` flag and the `redirects` array.

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";
const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36";
const SEO_DOC_PATH = "projects/altftool/seo/runtime";
const TTL_MS = Number(process.env.ALTFT_REDIRECT_TTL_MS || 60_000);
const TIMEOUT_MS = Number(process.env.ALTFT_REDIRECT_TIMEOUT_MS || 2500);

function engineEnabled() {
  return (
    process.env.ALTFT_SEO_ENGINE_ENABLED === "true" ||
    process.env.NEXT_PUBLIC_SEO_ENGINE_ENABLED === "true"
  );
}

let cache = { at: 0, redirects: [] };

function fsValue(value) {
  if (!value) return undefined;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("booleanValue" in value) return Boolean(value.booleanValue);
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(fsValue);
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields || {}).map(([k, v]) => [k, fsValue(v)]),
    );
  }
  if ("nullValue" in value) return null;
  return undefined;
}

function decode(doc) {
  const fields = doc?.fields;
  if (!fields) return { enabled: false, redirects: [] };
  return {
    enabled: Boolean(fsValue(fields.enabled)),
    redirects: Array.isArray(fsValue(fields.redirects)) ? fsValue(fields.redirects) : [],
  };
}

/**
 * @returns {Promise<Array<{source,destination,type,enabled}>>}
 */
export async function getActiveRedirects() {
  if (!engineEnabled()) return [];
  if (cache.at + TTL_MS > Date.now()) return cache.redirects;

  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${SEO_DOC_PATH}?key=${FIREBASE_API_KEY}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (res.status === 404) {
      cache = { at: Date.now(), redirects: [] };
    } else if (res.ok) {
      const json = await res.json().catch(() => null);
      const { enabled, redirects } = decode(json);
      cache = { at: Date.now(), redirects: enabled ? redirects : [] };
    }
    // on non-ok (non-404) keep stale cache
  } catch {
    // network/timeout: keep stale cache
  } finally {
    clearTimeout(timeout);
  }
  return cache.redirects;
}

export function __resetRedirectCache() {
  cache = { at: 0, redirects: [] };
}
