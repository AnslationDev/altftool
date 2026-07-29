// oEmbed provider endpoint — https://oembed.com/#section2
//
// WordPress, Ghost, Discourse and friends turn a pasted URL into a live embed
// only when the pasted page advertises an oEmbed endpoint. This is that
// endpoint; the advertisement lives in src/app/embed/widget/[slug]/page.jsx.
//
// SECURITY — the `url` parameter is never echoed anywhere. It is resolved to a
// slug that must exist in the embeddable registry, and every field of the
// response (including `html`) is rebuilt from that slug plus our own base URL.
// Reflecting a caller-supplied URL into `html` would be a stored-XSS vector on
// every site that consumes us.

import { NextResponse } from "next/server";
import { jsonResponse } from "@altftool/core/http";
import { PRODUCTION_SITE_URL } from "@/platform/seo/siteUrl";
import {
  getEmbedToolName,
  resolveEmbeddableSlugFromUrl,
} from "@/app/embed/embedRegistry";
import {
  EMBED_DEFAULT_HEIGHT,
  EMBED_DEFAULT_WIDTH,
  buildOEmbedHtml,
} from "@/app/embed/embedSnippet";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CACHE = { sMaxage: 3600, staleWhileRevalidate: 86400 };

/**
 * oEmbed is fetched server-side by most platforms, but some resolve it from
 * the browser. This is a public, read-only, unauthenticated discovery
 * document, so it is open to any origin.
 *
 * The site-wide `Cross-Origin-Resource-Policy: same-site` from next.config
 * still applies and cannot be relaxed from inside a route handler — that is
 * fine: CORP governs no-cors subresource loads, while a cross-origin
 * `fetch()` of this JSON is governed by the header below.
 */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

/**
 * Base URL every emitted link is built from.
 *
 * Deliberately NOT derived from the request in production: `request.url` is
 * built from the Host header, so trusting it would let a spoofed Host place a
 * third-party origin inside the iframe markup we hand to publishers. Local
 * dev is the one exception, so the endpoint is testable end to end.
 */
function emitBaseUrl(request) {
  if (process.env.NODE_ENV === "production") return PRODUCTION_SITE_URL;
  try {
    const url = new URL(request.url);
    if (LOCAL_HOSTS.has(url.hostname)) return url.origin;
  } catch {
    // Fall through to the canonical host.
  }
  return PRODUCTION_SITE_URL;
}

/** Hosts a `url=` parameter may point at, beyond the canonical production ones. */
function extraResolvableHosts(request) {
  if (process.env.NODE_ENV === "production") return [];
  try {
    const url = new URL(request.url);
    return LOCAL_HOSTS.has(url.hostname) ? [url.hostname] : [];
  } catch {
    return [];
  }
}

/**
 * Consumers send `maxwidth`/`maxheight` as an upper bound, so we shrink to fit
 * and never grow past the widget's natural box. Values that are not positive
 * integers are ignored rather than fatal — a malformed hint from a consumer
 * should still return an embed.
 */
function clampDimension(raw, natural) {
  if (raw === null || raw === undefined || raw === "") return natural;
  const value = Number.parseInt(String(raw), 10);
  if (!Number.isFinite(value) || value <= 0) return natural;
  return Math.min(natural, value);
}

function fail(message, status) {
  return jsonResponse(NextResponse, { error: message }, { status, headers: CORS_HEADERS });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const format = (searchParams.get("format") || "json").trim().toLowerCase();
  if (format !== "json") {
    // The spec reserves 501 for a format the provider does not implement.
    return fail("Only the json oEmbed format is supported.", 501);
  }

  const target = searchParams.get("url");
  if (!target || !target.trim()) {
    return fail("A url parameter is required.", 400);
  }

  const slug = resolveEmbeddableSlugFromUrl(target, {
    extraHosts: extraResolvableHosts(request),
  });
  if (!slug) {
    // Foreign host, unknown path, or a tool that is not embeddable.
    return fail("No AltFTool widget is available for that URL.", 404);
  }

  const baseUrl = emitBaseUrl(request);
  const name = getEmbedToolName(slug);
  const width = clampDimension(searchParams.get("maxwidth"), EMBED_DEFAULT_WIDTH);
  const height = clampDimension(searchParams.get("maxheight"), EMBED_DEFAULT_HEIGHT);

  return jsonResponse(
    NextResponse,
    {
      version: "1.0",
      type: "rich",
      provider_name: "AltFTool",
      provider_url: baseUrl,
      // Matches the widget document's own <title>.
      title: `${name} — AltFTool widget`,
      // AltFTool builds and hosts the widget; the tool page is where it lives.
      author_name: "AltFTool",
      author_url: `${baseUrl}/tools/all/${slug}`,
      html: buildOEmbedHtml(baseUrl, slug, { name, width, height }),
      width,
      height,
      cache_age: 86400,
      // No thumbnail_url: there is no per-widget screenshot in this repo, and
      // the generic site OG image does not depict the widget. Inventing one
      // would be a fabricated field — omit it instead.
    },
    { headers: CORS_HEADERS, cache: CACHE },
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
