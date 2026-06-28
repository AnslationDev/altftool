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
  await gscSubmitSitemap(feedpath, property);
  await audit({ action: "seo.gsc.sitemap.submit", module: "seo", summary: `Submitted sitemap ${feedpath}`, changes: { feedpath } });
  return NextResponse.json({ ok: true, feedpath });
}

export const GET = withAdminApi(readHandler, {
  rateLimit: { limit: 40, windowMs: 60_000, scope: "seo-gsc-sitemaps-read" },
});

export const POST = withAdminApi(writeHandler, {
  rateLimit: { limit: 20, windowMs: 60_000, scope: "seo-gsc-sitemaps-write" },
  audit: { module: "seo" },
  mutating: true,
});
