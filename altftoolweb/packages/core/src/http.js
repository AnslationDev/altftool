import { createTtlCache } from "./cache.js";
import { MissingEnvError } from "./env.js";

const fetchResponseCache = createTtlCache({ ttlMs: 30000, maxEntries: 120 });
const rateLimitBuckets = createTtlCache({ ttlMs: 60000, maxEntries: 5000 });

export function jsonError(NextResponse, message, status = 500, extra = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function routeError(NextResponse, error, fallbackMessage = "Request failed.") {
  const status = Number(error?.status) || 500;
  const message =
    error instanceof MissingEnvError
      ? error.message
      : error?.message || fallbackMessage;

  return jsonError(NextResponse, message, status);
}

export function getRequestUrl(req) {
  return new URL(req.url);
}

export function searchParam(req, name, fallback = "") {
  return (getRequestUrl(req).searchParams.get(name) || fallback).trim();
}

export function requireSearchParam(req, name, message = `${name} is required.`) {
  const value = searchParam(req, name);
  if (!value) {
    const error = new Error(message);
    error.status = 400;
    throw error;
  }
  return value;
}

export function requireHttpUrl(value, message = "Please provide a valid http(s) URL.") {
  const url = String(value || "").trim();
  if (!/^https?:\/\//i.test(url)) {
    const error = new Error(message);
    error.status = 400;
    throw error;
  }
  return url;
}

export async function readJson(res) {
  return res.json().catch(() => ({}));
}

function getMethod(options = {}) {
  return String(options.method || "GET").toUpperCase();
}

function toUrlString(upstream) {
  return upstream instanceof URL ? upstream.toString() : String(upstream);
}

function revalidateSeconds(options = {}) {
  const value = Number(options?.next?.revalidate);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function ttlFromFetchOptions(options = {}) {
  return revalidateSeconds(options) * 1000;
}

export function cacheControlHeader(cache = null) {
  if (!cache) return "";

  const sMaxage = Number(cache.sMaxage ?? cache.revalidate ?? cache.maxAge);
  if (!Number.isFinite(sMaxage) || sMaxage <= 0) return "";

  const parts = ["public", `s-maxage=${Math.round(sMaxage)}`];
  const staleWhileRevalidate = Number(cache.staleWhileRevalidate ?? sMaxage * 2);
  if (Number.isFinite(staleWhileRevalidate) && staleWhileRevalidate > 0) {
    parts.push(`stale-while-revalidate=${Math.round(staleWhileRevalidate)}`);
  }

  return parts.join(", ");
}

export function cacheControlFromFetchOptions(options = {}) {
  const sMaxage = revalidateSeconds(options);
  return sMaxage > 0 ? { sMaxage, staleWhileRevalidate: sMaxage * 2 } : null;
}

export function jsonResponse(NextResponse, data, options = {}) {
  const { status = 200, headers = {}, cache = null } = options;
  const responseHeaders = new Headers(headers);
  const cacheHeader = cacheControlHeader(cache);

  if (cacheHeader && status >= 200 && status < 300) {
    responseHeaders.set("Cache-Control", cacheHeader);
  }

  return NextResponse.json(data, { status, headers: responseHeaders });
}

export function getClientAddress(req) {
  const forwardedFor = req.headers.get("x-forwarded-for") || "";
  const realIp = req.headers.get("x-real-ip") || "";
  const cfIp = req.headers.get("cf-connecting-ip") || "";

  return (
    cfIp ||
    realIp ||
    forwardedFor.split(",")[0]?.trim() ||
    "unknown"
  );
}

export function checkRateLimit(req, options = {}) {
  const {
    key = getClientAddress(req),
    limit = 60,
    scope = "global",
    windowMs = 60000,
  } = options;
  const now = Date.now();
  const bucketKey = `rate:${scope}:${key}`;
  let bucket = rateLimitBuckets.get(bucketKey);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
  }

  bucket.count += 1;
  rateLimitBuckets.set(bucketKey, bucket, Math.max(bucket.resetAt - now, 1000));

  const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

  return {
    allowed: bucket.count <= limit,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
    retryAfter,
  };
}

export function rateLimitResponse(NextResponse, result) {
  return NextResponse.json(
    { error: "Too many requests. Please try again shortly." },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(result.retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
      },
    },
  );
}

export function enforceRateLimit(NextResponse, req, options = {}) {
  const result = checkRateLimit(req, options);
  return result.allowed ? null : rateLimitResponse(NextResponse, result);
}

export async function fetchJson(upstream, options = {}) {
  const {
    cacheKey,
    cacheTtlMs,
    timeoutMs = 12000,
    ...fetchOptions
  } = options;
  const method = getMethod(fetchOptions);
  const ttl = Number(cacheTtlMs ?? ttlFromFetchOptions(fetchOptions));
  const url = toUrlString(upstream);
  const key = cacheKey || (method === "GET" && ttl > 0 ? `${method}:${url}` : "");

  async function load() {
    const controller = !fetchOptions.signal && timeoutMs > 0 ? new AbortController() : null;
    const timeout = controller
      ? setTimeout(() => controller.abort(new Error("Request timed out.")), timeoutMs)
      : null;

    try {
      const res = await fetch(upstream, {
        ...fetchOptions,
        signal: controller?.signal || fetchOptions.signal,
      });
      const data = await readJson(res);

      return {
        data,
        ok: res.ok,
        status: res.status,
      };
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  if (!key || ttl <= 0) return load();

  const cached = fetchResponseCache.get(key);
  if (cached !== undefined) return cached;

  const pendingKey = `${key}:pending`;
  const pending = fetchResponseCache.get(pendingKey);
  if (pending !== undefined) return pending;

  const pendingRequest = load().then(
    (result) => {
      fetchResponseCache.delete(pendingKey);
      if (result.ok) fetchResponseCache.set(key, result, ttl);
      return result;
    },
    (error) => {
      fetchResponseCache.delete(pendingKey);
      throw error;
    },
  );

  fetchResponseCache.set(pendingKey, pendingRequest, Math.min(ttl, 30000));
  return pendingRequest;
}

export async function proxyJson(NextResponse, upstream, options = {}) {
  const result = await fetchJson(upstream, options);

  return jsonResponse(NextResponse, result.data, {
    status: result.ok ? 200 : result.status,
    cache: cacheControlFromFetchOptions(options),
  });
}
