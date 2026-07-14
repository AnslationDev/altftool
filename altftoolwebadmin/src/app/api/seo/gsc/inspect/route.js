// altftoolwebadmin/src/app/api/seo/gsc/inspect/route.js
//
// URL Inspection: index status, coverage, canonical (user vs Google), last
// crawl, robots, mobile + rich-result verdicts. Read-only, admin, rate-limited.

import { NextResponse } from "next/server";
import { withAdminApi } from "@/lib/security/withAdminApi";
import { isGscReady, gscActiveSiteUrl, gscInspectUrl } from "@/lib/gscClient";
import { normalizeInspection, inspectionUiUrl } from "@/lib/gsc/inspect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler({ request }) {
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
  const raw = await gscInspectUrl(url, property);
  const inspection = normalizeInspection(raw, url);

  return NextResponse.json({
    configured: true,
    property,
    inspection,
    inspectUrl: inspectionUiUrl(property, url),
  });
}

export const POST = withAdminApi(handler, {
  rateLimit: { limit: 30, windowMs: 60_000, scope: "seo-gsc-inspect" },
  // GSC is altftool's single Google connection — lock to altftool SEO access.
  requireProjectModule: { project: "altftool", moduleKey: "seo", action: "read" },
});
