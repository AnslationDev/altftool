import dns from "node:dns/promises";
import net from "node:net";
import { NextResponse } from "next/server";
import { enforceRateLimit, jsonResponse, routeError } from "@altftool/core/http";
import { verifyAdminRequest } from "@/lib/blogsAdminAuth";
import { hasModuleAccess } from "@/lib/permissionUtils";

export const runtime = "nodejs";

const MAX_URLS = 20;
const CHECK_TIMEOUT_MS = 7000;
const MAX_REDIRECTS = 5;
const BLOCKED_HOSTS = new Set([
  "0.0.0.0",
  "127.0.0.1",
  "localhost",
  "metadata.google.internal",
  "::",
  "::1",
]);

function jsonAuthError(message = "Unauthorized", status = 401) {
  return NextResponse.json({ error: message }, { status });
}

function normalizeInputUrl(value = "") {
  const raw = String(value || "").trim();
  const url = new URL(raw);

  if (!["http:", "https:"].includes(url.protocol)) {
    const error = new Error("Only http(s) links can be checked.");
    error.status = 400;
    throw error;
  }

  url.hash = "";
  return url;
}

function isPrivateIp(address = "") {
  const normalized = address.toLowerCase();
  const version = net.isIP(normalized);
  if (!version) return false;

  if (version === 6) {
    if (normalized === "::1" || normalized === "::") return true;
    if (normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:")) return true;
    if (normalized.startsWith("::ffff:")) return isPrivateIp(normalized.replace("::ffff:", ""));
    return false;
  }

  const parts = normalized.split(".").map((item) => Number(item));
  const [first, second] = parts;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 100 && second >= 64 && second <= 127)
  );
}

async function assertPublicDestination(url) {
  const host = url.hostname.toLowerCase();

  if (
    BLOCKED_HOSTS.has(host) ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    (net.isIP(host) && isPrivateIp(host))
  ) {
    const error = new Error("Private or local destinations are blocked.");
    error.status = 400;
    throw error;
  }

  const addresses = await dns.lookup(host, { all: true, verbatim: true });
  if (addresses.some((item) => isPrivateIp(item.address))) {
    const error = new Error("Private network destinations are blocked.");
    error.status = 400;
    throw error;
  }
}

async function fetchOnce(url, method) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error("Request timed out.")), CHECK_TIMEOUT_MS);
  const headers = {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "User-Agent": "AltFTool Admin Link Checker (+https://altftool.com)",
  };
  if (method === "GET") headers.Range = "bytes=0-0";

  try {
    return await fetch(url, {
      headers,
      method,
      redirect: "manual",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

// Redirects are followed manually (never fetch's redirect:"follow") so each
// hop's destination is re-validated against assertPublicDestination() before
// it is requested. Without this, a URL whose initial hostname resolves
// publicly could 3xx to an internal/private address (e.g. the cloud metadata
// endpoint) and the server would blindly follow it — the SSRF class
// assertPublicDestination() exists to prevent, bypassed via one redirect hop.
async function fetchWithTimeout(url, method = "HEAD") {
  let currentUrl = url;

  for (let hop = 0; ; hop += 1) {
    const response = await fetchOnce(currentUrl, method);
    const isRedirect = response.status >= 300 && response.status < 400;
    const location = isRedirect ? response.headers.get("location") : null;

    if (!location) return response;

    if (hop >= MAX_REDIRECTS) {
      const error = new Error("Too many redirects.");
      error.status = 400;
      throw error;
    }

    const nextUrl = new URL(location, currentUrl);
    if (!["http:", "https:"].includes(nextUrl.protocol)) {
      const error = new Error("Only http(s) redirect targets are allowed.");
      error.status = 400;
      throw error;
    }
    nextUrl.hash = "";
    await assertPublicDestination(nextUrl);
    currentUrl = nextUrl;
  }
}

function classifyStatus(status = 0) {
  if (status >= 200 && status < 400) return "ok";
  if (status === 401 || status === 403 || status === 429) return "warning";
  if (status >= 400) return "broken";
  return "warning";
}

function reasonForStatus(status = 0, state = "warning") {
  if (state === "ok") return "Reachable";
  if (status === 401 || status === 403) return "Reachable but access is restricted";
  if (status === 429) return "Rate limited by destination";
  if (status >= 500) return "Destination server error";
  if (status >= 400) return "Destination returned an error";
  return "Could not confirm link health";
}

async function probeUrl(input) {
  const startedAt = Date.now();

  try {
    const url = normalizeInputUrl(input);
    await assertPublicDestination(url);

    let response = await fetchWithTimeout(url, "HEAD");
    let method = "HEAD";

    if ([403, 405, 501].includes(response.status)) {
      response = await fetchWithTimeout(url, "GET");
      method = "GET";
    }

    const state = classifyStatus(response.status);

    return {
      checkedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      finalUrl: response.url,
      method,
      reason: reasonForStatus(response.status, state),
      state,
      status: response.status,
      url: input,
    };
  } catch (error) {
    const status = Number(error?.status) || 0;
    const blocked = status === 400;

    return {
      checkedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      finalUrl: "",
      method: "",
      reason: blocked ? error.message : error?.message || "Network check failed",
      state: blocked ? "blocked" : "warning",
      status: null,
      url: String(input || "").trim(),
    };
  }
}

export async function POST(request) {
  try {
    const limited = enforceRateLimit(NextResponse, request, {
      limit: 20,
      scope: "admin:blog-link-check",
      windowMs: 60000,
    });
    if (limited) return limited;

    const { admin } = await verifyAdminRequest(request);
    // Link checking is a read-only diagnostic (no writes), but it makes the
    // server issue outbound requests on the caller's behalf, so gate it on
    // blogs module access rather than "is some active admin" — mirrors
    // blogs/generate/route.js's module-scoped authz (see the comment there
    // for why "any active admin" was judged too broad).
    if (!hasModuleAccess({ adminData: admin, projectId: "altftool", moduleKey: "blogs", action: "read" })) {
      const error = new Error("Forbidden");
      error.status = 403;
      throw error;
    }

    const payload = await request.json().catch(() => ({}));
    const urls = [
      ...new Set(
        (Array.isArray(payload.urls) ? payload.urls : [])
          .map((item) => String(item || "").trim())
          .filter(Boolean),
      ),
    ].slice(0, MAX_URLS);

    if (!urls.length) {
      return NextResponse.json({ error: "At least one URL is required." }, { status: 400 });
    }

    const results = await Promise.all(urls.map((url) => probeUrl(url)));
    const summary = results.reduce(
      (total, item) => {
        total[item.state] = (total[item.state] || 0) + 1;
        total.total += 1;
        return total;
      },
      { blocked: 0, broken: 0, ok: 0, total: 0, warning: 0 },
    );

    return jsonResponse(NextResponse, {
      checkedAt: new Date().toISOString(),
      maxUrls: MAX_URLS,
      results,
      summary,
    });
  } catch (error) {
    if (error?.status === 401) return jsonAuthError("Unauthorized", 401);
    if (error?.status === 403) return jsonAuthError("Forbidden", 403);
    return routeError(NextResponse, error, "Link check failed.");
  }
}
