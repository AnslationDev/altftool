// altftoolwebadmin/src/app/api/seo/gsc/index-request/route.js
//
// "Request indexing" for a URL. Google has NO official API to force-index a
// normal page, so this does the reliable things and is honest about limits:
//   1. Re-submit the sitemap (legitimate re-crawl signal).
//   2. Best-effort Indexing API publish (officially JobPosting/BroadcastEvent
//      only — may be ignored; failure is non-fatal).
//   3. Return a deep link to the GSC "Request indexing" UI for a manual click.

import { NextResponse } from "next/server";
import { withAdminApi } from "@/lib/security/withAdminApi";
import { isGscReady, gscActiveSiteUrl, gscSubmitSitemap, gscRequestIndexing } from "@/lib/gscClient";
import { inspectionUiUrl } from "@/lib/gsc/inspect";
import { propertyOrigin } from "../sitemaps/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler({ request, audit }) {
  if (!(await isGscReady())) {
    return NextResponse.json({ configured: false, error: "No Search Console connection." });
  }
  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const url = String(body?.url || "").trim();
  if (!/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "Provide a full URL (https://…)." }, { status: 400 });
  }

  const property = await gscActiveSiteUrl();
  const result = { url, property, sitemapResubmitted: false, indexingApi: null };

  // 1. Re-submit the sitemap (reliable nudge).
  try {
    await gscSubmitSitemap(`${propertyOrigin(property)}/sitemap.xml`, property);
    result.sitemapResubmitted = true;
  } catch (e) {
    result.sitemapError = e?.message || "sitemap submit failed";
  }

  // 2. Best-effort Indexing API (may be unsupported for this content type).
  try {
    await gscRequestIndexing(url, "URL_UPDATED");
    result.indexingApi = { ok: true };
  } catch (e) {
    result.indexingApi = {
      ok: false,
      reason:
        e?.status === 403
          ? "Indexing API not enabled or scope not granted (reconnect to grant it). Falling back to sitemap + manual."
          : e?.message || "Indexing API call failed",
    };
  }

  // 3. Manual fallback deep link.
  result.inspectUrl = inspectionUiUrl(property, url);

  await audit({ action: "seo.gsc.index.request", module: "seo", summary: `Requested indexing for ${url}`, changes: { url } });
  return NextResponse.json({ ok: true, ...result });
}

export const POST = withAdminApi(handler, {
  rateLimit: { limit: 20, windowMs: 60_000, scope: "seo-gsc-index-request" },
  // GSC is altftool's single Google connection — lock to altftool SEO access.
  // This resubmits the sitemap and calls the Indexing API, so it mutates the
  // production property exactly like POST /api/seo/gsc/sitemaps and needs
  // `write`: a read-only SEO admin must not be able to push to Google.
  requireProjectModule: { project: "altftool", moduleKey: "seo", action: "write" },
  audit: { module: "seo" },
  mutating: true,
});
