// altftoolwebadmin/src/app/api/seo/gsc/sitemaps/route.js
//
// Sitemap management: list submitted sitemaps + (re)submit one. Submitting a
// sitemap is the legitimate, reliable way to nudge Google to re-crawl updated
// content (used on publish to avoid repeating manual work).

import { NextResponse } from "next/server";
import { withAdminApi } from "@/lib/security/withAdminApi";
import { isGscReady, gscActiveSiteUrl, gscListSitemaps, gscSubmitSitemap } from "@/lib/gscClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Resolve a property ("sc-domain:altftool.com" | "https://altftool.com/") to an origin. */
export function propertyOrigin(property = "") {
  if (property.startsWith("sc-domain:")) return `https://${property.replace(/^sc-domain:/, "")}`;
  return property.replace(/\/$/, "");
}

/**
 * A submitted feed must belong to the verified GSC property — otherwise the
 * request body decides which host we hand to Google. Domain properties
 * ("sc-domain:") cover their subdomains; URL properties are matched on
 * origin + path prefix.
 */
export function isFeedpathInProperty(feedpath = "", property = "") {
  let url;
  try {
    url = new URL(String(feedpath));
  } catch {
    return false;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;

  if (property.startsWith("sc-domain:")) {
    const domain = property.replace(/^sc-domain:/, "").replace(/\/$/, "").toLowerCase();
    const host = url.hostname.toLowerCase();
    return Boolean(domain) && (host === domain || host.endsWith(`.${domain}`));
  }

  try {
    const propUrl = new URL(propertyOrigin(property));
    if (url.origin !== propUrl.origin) return false;
    // Match on whole path segments: a property of ".../blog" must not accept
    // ".../blogsitemap.xml" (a bare startsWith would).
    const propPath = propUrl.pathname || "/";
    return url.pathname === propPath || url.pathname.startsWith(`${propPath.replace(/\/$/, "")}/`);
  } catch {
    return false;
  }
}

async function readHandler() {
  if (!(await isGscReady())) return NextResponse.json({ configured: false });
  const property = await gscActiveSiteUrl();
  const sitemaps = await gscListSitemaps(property);
  return NextResponse.json({
    configured: true,
    property,
    defaultFeed: `${propertyOrigin(property)}/sitemap.xml`,
    sitemaps: sitemaps.map((s) => ({
      path: s.path,
      lastSubmitted: s.lastSubmitted || null,
      lastDownloaded: s.lastDownloaded || null,
      isPending: s.isPending || false,
      errors: Number(s.errors || 0),
      warnings: Number(s.warnings || 0),
      contents: s.contents || [],
    })),
  });
}

async function writeHandler({ request, audit }) {
  if (!(await isGscReady())) return NextResponse.json({ configured: false }, { status: 400 });
  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const property = await gscActiveSiteUrl();
  const feedpath = String(body?.feedpath || `${propertyOrigin(property)}/sitemap.xml`);
  if (!isFeedpathInProperty(feedpath, property)) {
    return NextResponse.json({ error: "feedpath must be an http(s) URL inside the verified property" }, { status: 400 });
  }
  await gscSubmitSitemap(feedpath, property);
  await audit({ action: "seo.gsc.sitemap.submit", module: "seo", summary: `Submitted sitemap ${feedpath}`, changes: { feedpath } });
  return NextResponse.json({ ok: true, feedpath });
}

export const GET = withAdminApi(readHandler, {
  rateLimit: { limit: 40, windowMs: 60_000, scope: "seo-gsc-sitemaps-read" },
  // GSC is altftool's single Google connection — lock to altftool SEO access.
  requireProjectModule: { project: "altftool", moduleKey: "seo", action: "read" },
});

export const POST = withAdminApi(writeHandler, {
  rateLimit: { limit: 20, windowMs: 60_000, scope: "seo-gsc-sitemaps-write" },
  // GSC is altftool's single Google connection — lock to altftool SEO access.
  // Submitting a sitemap mutates the production property, so it needs `write`:
  // a read-only SEO admin must not be able to push feeds to Google.
  requireProjectModule: { project: "altftool", moduleKey: "seo", action: "write" },
  audit: { module: "seo" },
  mutating: true,
});
