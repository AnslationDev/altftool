// Public endpoint: returns the admin-authored PER-PAGE custom code (head /
// bodyStart / bodyEnd) AND the per-page JSON-LD structured data (schema) for a
// given path. Used by the client PerPageCode injector. Returns {} when the
// engine is off or nothing exists (inert).

import { NextResponse } from "next/server";
import { loadSeoConfig } from "@/platform/seo/seoConfigSource";
import { resolveInjectedCode, resolveExtendedMeta } from "@altftool/core/seo";

// SECURITY / SEO GUARD — admin-authored page code must NEVER be able to
// navigate the browser. robots.txt disallows /api/, so nothing served from
// here is ever seen by a crawler: a redirect injected through this channel
// shows Googlebot a normal page while bouncing real users elsewhere. That
// asymmetry is cloaking under Google Search Essentials (enforced with
// site-wide manual actions) and it also hijacks the visitor's session.
// Custom code exists for analytics/verification/meta tags only, so any script
// element, tag or code block that performs navigation is dropped here before
// the payload is returned; everything else in the payload is left untouched.
const NAVIGATION_PATTERNS = [
  // Assignment to location: `window.location = …`, `location.href = …`,
  // `document.location.hostname = …` (but not `===`, `!==`, `=>`).
  /(?<![\w$\-])(?:(?:window|document|self|top|parent|globalThis)\s*\.\s*)?location\s*(?:\.\s*(?:href|host|hostname|protocol|pathname|search|port)\s*)?=(?![=>])/i,
  // Navigation methods: location.replace( / location.assign( / location.reload(
  /(?<![\w$\-])(?:(?:window|document|self|top|parent|globalThis)\s*\.\s*)?location\s*\.\s*(?:replace|assign|reload)\s*\(/i,
  // Popup / new-window openers: window.open( , top.open( , bare open(
  // (a leading `.` is excluded so XHR `xhr.open(` and friends still pass).
  /(?<![\w$\-.])(?:(?:window|self|top|parent|globalThis)\s*\.\s*)?open\s*\(/i,
  // <meta http-equiv="refresh" content="0;url=…">
  /http-equiv\s*=\s*["']?\s*refresh/i,
];

// Elements that never have a closing tag, so a segment ends at the `>`.
const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

function hasNavigation(chunk) {
  return NAVIGATION_PATTERNS.some((re) => re.test(chunk));
}

/**
 * Split a custom-code blob into top-level segments: one segment per element
 * (a `<script>…</script>` block, a `<meta …>` tag, …) plus the raw text runs
 * between them. Re-joining every segment reproduces the input exactly, so
 * only the offending pieces are lost when we drop a segment.
 */
function segmentMarkup(html) {
  const segments = [];
  const openTag = /<([a-zA-Z][\w:-]*)[^>]*?(\/)?>/g;
  let cursor = 0;
  let match;
  while ((match = openTag.exec(html))) {
    if (match.index > cursor) segments.push(html.slice(cursor, match.index));
    const name = match[1];
    let end = openTag.lastIndex;
    if (!match[2] && !VOID_ELEMENTS.has(name.toLowerCase())) {
      const closeTag = new RegExp(`</${name.replace(/[^\w:-]/g, "")}\\s*>`, "i");
      const closing = closeTag.exec(html.slice(end));
      end = closing ? end + closing.index + closing[0].length : html.length;
    }
    segments.push(html.slice(match.index, end));
    cursor = end;
    openTag.lastIndex = end;
  }
  if (cursor < html.length) segments.push(html.slice(cursor));
  return segments;
}

/** Drop every segment that can navigate the browser; keep the rest verbatim. */
function stripNavigatingCode(html, label) {
  if (typeof html !== "string" || !html.trim() || !hasNavigation(html)) return html;
  const kept = [];
  for (const segment of segmentMarkup(html)) {
    if (hasNavigation(segment)) {
      console.warn(
        `[seo/page-code] stripped navigating admin code from ${label}: ${segment.slice(0, 200).replace(/\s+/g, " ").trim()}`,
      );
      continue;
    }
    kept.push(segment);
  }
  return kept.join("");
}

function sanitizePageCode(page, path) {
  const out = {};
  for (const [key, value] of Object.entries(page || {})) {
    out[key] = typeof value === "string" ? stripNavigatingCode(value, `${path} (${key})`) : value;
  }
  return out;
}

export async function GET(request) {
  const path = request.nextUrl.searchParams.get("path") || "/";
  try {
    const config = await loadSeoConfig();
    const { page } = resolveInjectedCode(config, path);
    // Per-page JSON-LD (admin- or AI-authored `schema`). Resolved here so the
    // structured data the SEO engine/AI produces actually reaches the page —
    // resolveExtendedMeta computed it but nothing was rendering it before.
    const { jsonLd } = resolveExtendedMeta(config, { path });
    return NextResponse.json(
      { ...sanitizePageCode(page, path), jsonLd: Array.isArray(jsonLd) ? jsonLd : [] },
      {
        headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" },
      },
    );
  } catch {
    return NextResponse.json({});
  }
}
