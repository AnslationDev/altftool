// altftoolwebadmin/src/app/api/seo/gsc/sync/route.js
//
// Background sync job (scaffold). A scheduled worker (cron / Cloud Scheduler)
// POSTs here with the shared secret to snapshot daily Search Analytics into
// `gscDailyMetrics` so the SEO Center can show history/trends and fire alerts
// without hitting Google on every page load.
//
// Inert by default: returns { skipped } unless ALTFT_GSC_SYNC_SECRET is set and
// matches the x-sync-secret header (or an active admin triggers it manually).

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { authorizeSeoRequest } from "@/lib/seoAuth";
import { isGscReady, gscActiveSiteUrl, gscSearchAnalytics } from "@/lib/gscClient";
import { markSynced } from "@/lib/gsc/tokenStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function daysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

async function authorize(request) {
  const secret = process.env.ALTFT_GSC_SYNC_SECRET;
  const provided = request.headers.get("x-sync-secret");
  if (secret && provided && provided === secret) return { actor: "cron" };
  // Fall back to an authenticated admin (manual "Sync now"). GSC is altftool's
  // single connection, so require altftool SEO access.
  await authorizeSeoRequest(request, "read", { forceProject: "altftool" });
  return { actor: "admin" };
}

export async function POST(request) {
  let actor;
  try {
    ({ actor } = await authorize(request));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // The cron path can only reach here by matching ALTFT_GSC_SYNC_SECRET, so
  // the secret being unset can only mean an authenticated admin manually
  // triggered "Sync now" (see authorize()) — that documented fallback must
  // still run. Only skip when neither condition holds (no secret configured
  // and no admin actor, which authorize() would have already rejected, but
  // this stays explicit rather than relying on that indirectly).
  if (!process.env.ALTFT_GSC_SYNC_SECRET && actor !== "admin") {
    return NextResponse.json({ ok: true, skipped: true, reason: "Background sync not configured." });
  }
  if (!(await isGscReady())) {
    return NextResponse.json({ ok: true, skipped: true, reason: "No Search Console connection." });
  }

  try {
    const property = await gscActiveSiteUrl();
    const rows = await gscSearchAnalytics(
      { startDate: daysAgo(28), endDate: daysAgo(1), dimensions: ["date"], rowLimit: 31 },
      property,
    );

    const batch = adminDb.batch();
    const col = adminDb.collection("gscDailyMetrics");
    for (const r of rows) {
      const date = Array.isArray(r.keys) ? r.keys[0] : null;
      if (!date) continue;
      const id = `${property}__${date}`.replace(/[^\w-]/g, "_");
      batch.set(
        col.doc(id),
        {
          property,
          date,
          clicks: r.clicks || 0,
          impressions: r.impressions || 0,
          ctr: r.ctr || 0,
          position: r.position || 0,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
    }
    await batch.commit();
    await markSynced().catch(() => {});
    return NextResponse.json({ ok: true, synced: rows.length, property });
  } catch (error) {
    console.error("[gsc/sync]", error);
    return NextResponse.json({ error: error?.message || "Sync failed" }, { status: 500 });
  }
}
