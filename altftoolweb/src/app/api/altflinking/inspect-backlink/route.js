/**
 * API: Backlink Inspector — real server-side check
 * POST /api/altflinking/inspect-backlink { url, targetAnchor }
 *
 * Fetches the target page and checks it actually resolved, then looks for
 * the anchor text and its rel attribute in the returned HTML. Runs
 * server-side because a browser fetch to an arbitrary third-party domain
 * would fail CORS; blocks private/loopback targets to avoid SSRF.
 */

import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import dns from "node:dns/promises";
import net from "node:net";
import http from "node:http";
import https from "node:https";
import { verifyToken, getUserRole, ok, err } from "@/lib/altflinking/authMiddleware";

const FETCH_TIMEOUT_MS = 8000;
const MAX_HTML_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 5;

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
  // the dotted-quad check above never sees — unwrap and re-check it.
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

async function assertPublicUrl(candidate) {
  const url = new URL(candidate);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw Object.assign(new Error("Only http/https URLs are supported"), { code: "BAD_PROTOCOL" });
  }
  const { address, family } = await dns.lookup(url.hostname);
  if (isPrivateAddress(address)) {
    throw Object.assign(new Error("Blocked host"), { code: "BLOCKED_HOST" });
  }
  return { url, address, family };
}

/** Issues the request with DNS pinned to the address the SSRF guard already
 * validated — a second, independent resolution at connect time would let a
 * short-TTL DNS-rebinding host answer the guard with a public IP and the
 * real connection with a private one. */
function requestPinned(targetUrl, address, family, timeoutMs) {
  const client = targetUrl.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.request(
      targetUrl,
      {
        method: "GET",
        headers: { "User-Agent": "AltFTool-LinkInspector/1.0 (+https://altftool.com)" },
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

async function fetchPinnedFollowingRedirects(candidate, timeoutMs) {
  let { url, address, family } = await assertPublicUrl(candidate);
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const response = await requestPinned(url, address, family, timeoutMs);
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      const nextUrl = new URL(response.headers.location, url);
      response.resume();
      ({ url, address, family } = await assertPublicUrl(nextUrl));
      continue;
    }
    return { response, finalUrl: url };
  }
  throw new Error("Too many redirects");
}

export async function POST(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 20,
    scope: "altflinking:inspect-backlink",
    windowMs: 60000,
  });
  if (limited) return limited;

  const { user, error } = await verifyToken(request);
  if (error || !user) return err(error || "Unauthorized", 401);
  // Any authenticated marketplace role may run an inspection.
  await getUserRole(user.uid);

  let body;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body", 400);
  }

  const rawUrl = (body.url || "").toString().trim();
  const targetAnchor = (body.targetAnchor || "").toString().trim();
  if (!rawUrl) return err("url is required", 400);

  const candidate = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  let target;
  try {
    target = new URL(candidate);
  } catch {
    return err("Invalid URL provided. Please include protocol (e.g. https://domain.com/article)", 400);
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return err("Only http/https URLs are supported", 400);
  }

  const startedAt = Date.now();
  let response;
  let finalUrl;
  try {
    ({ response, finalUrl } = await fetchPinnedFollowingRedirects(candidate, FETCH_TIMEOUT_MS));
  } catch (e) {
    return NextResponse.json({
      data: {
        success: false,
        url: target.toString(),
        error:
          e.code === "BLOCKED_HOST" || e.code === "BAD_PROTOCOL"
            ? "Blocked host"
            : e.name === "AbortError"
              ? "Request timed out"
              : "Could not reach the target page",
      },
      success: true,
    });
  }
  target = finalUrl;
  const responseTimeMs = Date.now() - startedAt;

  let html = "";
  try {
    let received = 0;
    // Read only enough of the page to search for the anchor — most
    // publication pages have the article content well within this cap.
    for await (const chunk of response) {
      received += chunk.length;
      html += chunk.toString("utf8");
      if (received >= MAX_HTML_BYTES) {
        response.destroy();
        break;
      }
    }
  } catch {
    // Partial/aborted body — work with whatever was read so far.
  }

  const isLive = response.statusCode >= 200 && response.statusCode < 400;
  const escapedAnchor = targetAnchor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const anchorPattern = escapedAnchor
    ? new RegExp(`<a\\b[^>]*>[^<]*${escapedAnchor}[^<]*</a>`, "i")
    : null;
  const anchorMatch = anchorPattern ? html.match(anchorPattern) : null;
  const targetAnchorFound = Boolean(anchorMatch);
  const anchorTag = anchorMatch ? anchorMatch[0] : "";
  const relMatch = anchorTag.match(/rel=["']([^"']*)["']/i);
  const relValue = relMatch ? relMatch[1].toLowerCase() : "";
  const isDofollow = targetAnchorFound
    ? !relValue.includes("nofollow") && !relValue.includes("sponsored") && !relValue.includes("ugc")
    : null;

  return NextResponse.json({
    data: {
      success: true,
      url: target.toString(),
      domain: target.hostname,
      statusCode: response.statusCode,
      isLive,
      isDofollow,
      targetAnchorFound,
      anchorTextMatched: targetAnchorFound ? targetAnchor : null,
      detectedRel: targetAnchorFound ? (relValue || "follow (no rel attribute)") : null,
      sslValid: target.protocol === "https:",
      responseTimeMs,
      checkedAt: new Date().toISOString(),
      note: targetAnchor
        ? undefined
        : "No anchor text supplied — only page reachability and SSL were checked, not link attributes.",
    },
    success: true,
  });
}
