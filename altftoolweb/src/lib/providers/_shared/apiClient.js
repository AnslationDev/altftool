/**
 * Generic external-API client factory for the provider modules in this
 * directory — base URL joining, query params, timeout budget, and retry with
 * backoff on transient failures.
 *
 * Deliberately built on this repo's existing src/lib/server/resilientJsonFetch
 * rather than shipping a second retry/timeout implementation next to it: that
 * helper already does the deadline, the jittered exponential backoff on
 * 408/425/429/5xx, and the JSON decode. This file only adds the parts it
 * doesn't have — URL building and a per-provider default header/cache config.
 *
 * Server-side use only. Never import a provider client from a "use client"
 * component; go through a Next.js API route so provider keys stay server-side.
 */

import { fetchJsonWithRetry } from "@/lib/server/resilientJsonFetch";

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_RETRIES = 2;
// How long Next.js's server-side Data Cache keeps a response before
// re-fetching upstream — shared across every request/user hitting the same
// URL, not just one browser. Without this, every category click round-trips
// to the real provider even though that same category was just fetched
// seconds ago by someone else.
const DEFAULT_REVALIDATE_SECONDS = 3600;

function buildUrl(baseUrl, path, params) {
  // `new URL(path, base)` drops any path segment of `base` when `path` starts
  // with "/" (a leading slash resolves against the origin, not the base's own
  // path) — e.g. new URL("/x", "https://host/v3") becomes "https://host/x",
  // silently losing "/v3". Normalize both sides so joining is always relative,
  // regardless of how the caller wrote them.
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(normalizedPath, normalizedBase);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, value);
    }
  }
  return url;
}

/**
 * @param {{
 *   baseUrl: string,
 *   defaultHeaders?: Record<string,string>,
 *   timeoutMs?: number,
 *   retries?: number,
 *   revalidateSeconds?: number,
 *   label?: string,
 * }} config
 */
export function createApiClient({
  baseUrl,
  defaultHeaders = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
  retries = DEFAULT_RETRIES,
  revalidateSeconds = DEFAULT_REVALIDATE_SECONDS,
  label = "Provider request",
} = {}) {
  function request(path, { method = "GET", params, headers = {}, body } = {}) {
    return fetchJsonWithRetry(buildUrl(baseUrl, path, params), {
      label: `${label} ${method} ${path}`,
      timeoutMs,
      // resilientJsonFetch counts total attempts; `retries` counts retries
      // after the first try, so the first attempt has to be added back.
      maxAttempts: retries + 1,
      method,
      headers: { ...defaultHeaders, ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      // GET-only: caching a POST would be wrong regardless of revalidate.
      ...(method === "GET" && revalidateSeconds
        ? { next: { revalidate: revalidateSeconds } }
        : {}),
    });
  }

  return {
    get: (path, options) => request(path, { ...options, method: "GET" }),
    post: (path, options) => request(path, { ...options, method: "POST" }),
  };
}
