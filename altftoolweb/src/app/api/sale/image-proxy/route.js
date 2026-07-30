import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import dns from "node:dns/promises";
import net from "node:net";
import http from "node:http";
import https from "node:https";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB — plenty for a product thumbnail
const FETCH_TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 5;

/**
 * GET /api/sale/image-proxy?url=<encoded image URL>
 *
 * Re-serves an external product-image URL (from SerpAPI/RapidAPI/Amazon
 * shopping results) from our own origin so the browser's <canvas>
 * white-background-removal step (SmartProductImage) can read its pixel
 * data. Most of these hosts (e.g. Google's gstatic CDN) don't send CORS
 * headers, so the browser can't do that directly cross-origin — loading
 * them with crossOrigin="anonymous" against a server with no CORS header
 * actually fails outright, rather than just tainting the canvas.
 *
 * Only ever proxies bytes whose Content-Type is image/*, and blocks
 * requests that resolve to private/loopback/link-local addresses so this
 * can't become an SSRF vector against internal services. The DNS lookup
 * that clears a host is pinned straight into the outbound connection (see
 * fetchPinned/requestPinned below) instead of trusting a second, independent
 * resolution at connect time — otherwise a DNS-rebinding host could answer
 * the guard's lookup with a public IP and the real connection with a
 * private one.
 */
export async function GET(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 120,
    scope: "sale:image-proxy",
    windowMs: 60000,
  });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url");

  if (!target) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let targetUrl;
  try {
    targetUrl = new URL(target);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
    return NextResponse.json({ error: "Unsupported protocol" }, { status: 400 });
  }

  try {
    const upstream = await fetchPinned(targetUrl);

    if (upstream.statusCode < 200 || upstream.statusCode >= 300) {
      upstream.resume();
      return NextResponse.json({ error: `Upstream returned ${upstream.statusCode}` }, { status: 502 });
    }

    const contentType = upstream.headers["content-type"] || "";
    if (!contentType.startsWith("image/")) {
      upstream.resume();
      return NextResponse.json({ error: "Not an image" }, { status: 415 });
    }

    const contentLength = Number(upstream.headers["content-length"] || 0);
    if (contentLength > MAX_BYTES) {
      upstream.resume();
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }

    const buffer = await bufferResponse(upstream);
    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (err) {
    if (err.code === "BLOCKED_HOST") {
      return NextResponse.json({ error: "Blocked host" }, { status: 400 });
    }
    if (err.code === "DNS_FAILED") {
      return NextResponse.json({ error: "Could not resolve host" }, { status: 400 });
    }
    if (err.code === "BAD_PROTOCOL") {
      return NextResponse.json({ error: "Unsupported protocol" }, { status: 400 });
    }
    if (err.code === "TOO_MANY_REDIRECTS") {
      return NextResponse.json({ error: "Too many redirects" }, { status: 502 });
    }
    return NextResponse.json({ error: "Fetch failed", message: err.message }, { status: 502 });
  }
}

/** Resolves + validates each hop's host, then connects to that exact address — see requestPinned. */
async function fetchPinned(initialUrl) {
  // One deadline for the whole redirect chain, not a fresh FETCH_TIMEOUT_MS
  // per hop — otherwise MAX_REDIRECTS hops could each get their own full
  // timeout, letting a single client-facing request take up to
  // (MAX_REDIRECTS + 1) * FETCH_TIMEOUT_MS instead of a hard FETCH_TIMEOUT_MS cap.
  const deadline = Date.now() + FETCH_TIMEOUT_MS;
  let currentUrl = initialUrl;
  for (let redirect = 0; ; redirect += 1) {
    if (redirect > MAX_REDIRECTS) {
      throw Object.assign(new Error("Too many redirects"), { code: "TOO_MANY_REDIRECTS" });
    }

    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      throw Object.assign(new Error("Timed out"), { code: "TIMEOUT" });
    }

    let address, family;
    try {
      ({ address, family } = await dns.lookup(currentUrl.hostname));
    } catch {
      throw Object.assign(new Error("Could not resolve host"), { code: "DNS_FAILED" });
    }
    if (isPrivateAddress(address)) {
      throw Object.assign(new Error("Blocked host"), { code: "BLOCKED_HOST" });
    }

    const response = await requestPinned(currentUrl, address, family, remainingMs);
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      const nextUrl = new URL(response.headers.location, currentUrl);
      response.resume();
      if (nextUrl.protocol !== "http:" && nextUrl.protocol !== "https:") {
        throw Object.assign(new Error("Unsupported protocol"), { code: "BAD_PROTOCOL" });
      }
      currentUrl = nextUrl;
      continue;
    }
    return response;
  }
}

/** Issues the actual request with DNS resolution pinned to the address the SSRF guard already validated. */
function requestPinned(targetUrl, address, family, timeoutMs) {
  const client = targetUrl.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.request(
      targetUrl,
      {
        method: "GET",
        headers: { Accept: "image/*", "Accept-Encoding": "identity" },
        signal: AbortSignal.timeout(timeoutMs),
        lookup: (_hostname, options, callback) =>
          options.all ? callback(null, [{ address, family }]) : callback(null, address, family),
      },
      resolve,
    );
    req.on("error", reject);
    req.end();
  });
}

function bufferResponse(response) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    response.on("data", (chunk) => chunks.push(chunk));
    response.on("end", () => resolve(Buffer.concat(chunks)));
    response.on("error", reject);
  });
}

/** Basic SSRF guard — private/loopback/link-local ranges only, not a full policy. */
function isPrivateAddress(address) {
  if (net.isIPv4(address)) {
    const parts = address.split(".").map(Number);
    if (parts[0] === 10) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 0) return true;
    return false;
  }
  const lower = address.toLowerCase();
  // IPv4-mapped IPv6 literals (::ffff:127.0.0.1) embed a real IPv4 address
  // that the dotted-quad check above never sees — unwrap and re-check it,
  // otherwise a DNS answer using this form sails past the guard.
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) return isPrivateAddress(mapped[1]);
  return (
    lower === "::1" ||
    lower.startsWith("fc") ||
    lower.startsWith("fd") ||
    lower.startsWith("fe80") ||
    lower.startsWith("64:ff9b::") // NAT64 well-known prefix, also embeds IPv4
  );
}
