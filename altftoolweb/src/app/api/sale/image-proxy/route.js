import { NextResponse } from "next/server";
import dns from "node:dns/promises";
import net from "node:net";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB — plenty for a product thumbnail
const FETCH_TIMEOUT_MS = 8000;

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
 * can't become an SSRF vector against internal services.
 */
export async function GET(request) {
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
    const { address } = await dns.lookup(targetUrl.hostname);
    if (isPrivateAddress(address)) {
      return NextResponse.json({ error: "Blocked host" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Could not resolve host" }, { status: 400 });
  }

  try {
    const upstream = await fetch(targetUrl.toString(), {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { Accept: "image/*" },
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: `Upstream returned ${upstream.status}` }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Not an image" }, { status: 415 });
    }

    const contentLength = Number(upstream.headers.get("content-length") || 0);
    if (contentLength > MAX_BYTES) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }

    const buffer = await upstream.arrayBuffer();
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
    return NextResponse.json({ error: "Fetch failed", message: err.message }, { status: 502 });
  }
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
  return lower === "::1" || lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80");
}
