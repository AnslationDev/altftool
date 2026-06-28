// altftoolwebadmin/src/app/api/seo/gsc/report/route.js
//
// Live Search Analytics (clicks, impressions, CTR, avg position, top queries /
// pages) for the active property. Admin-read, rate-limited, with a short
// in-memory cache to stay well under Google's quota.

import { NextResponse } from "next/server";
import { withAdminApi } from "@/lib/security/withAdminApi";
import { isGscReady, gscActiveSiteUrl, gscSearchAnalytics } from "@/lib/gscClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 5 * 60_000;
const cache = new Map();

function daysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function summarize(rows) {
  return rows.reduce(
    (acc, r) => {
      acc.clicks += r.clicks || 0;
      acc.impressions += r.impressions || 0;
      return acc;
    },
    { clicks: 0, impressions: 0 },
  );
}

async function handler({ request }) {
  if (!(await isGscReady())) {
    return NextResponse.json({ configured: false, error: "No Search Console connection." });
  }

  const sp = new URL(request.url).searchParams;
  const dimension = ["query", "page", "country", "device", "date"].includes(sp.get("dimension"))
    ? sp.get("dimension")
    : "query";
  const days = Math.min(Math.max(Number(sp.get("days")) || 28, 1), 90);

  const property = await gscActiveSiteUrl();
  const cacheKey = `${property}|${dimension}|${days}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json({ ...hit.data, cached: true });
  }

  const range = { startDate: daysAgo(days), endDate: daysAgo(1) };

  // True site totals (no dimension) + the top breakdown for the chosen dimension.
  const [totalsRows, rows] = await Promise.all([
    gscSearchAnalytics({ ...range, dimensions: [], rowLimit: 1 }, property),
    gscSearchAnalytics({ ...range, dimensions: [dimension], rowLimit: 25 }, property),
  ]);

  const base = totalsRows[0] || summarize(rows);
  const totals = {
    clicks: base.clicks || 0,
    impressions: base.impressions || 0,
    ctr: base.ctr ?? (base.impressions ? base.clicks / base.impressions : 0),
    position: base.position ?? 0,
  };

  const data = {
    configured: true,
    property,
    dimension,
    days,
    range,
    totals,
    rows: rows.map((r) => ({
      key: Array.isArray(r.keys) ? r.keys[0] : "",
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      ctr: r.ctr || 0,
      position: r.position || 0,
    })),
  };

  cache.set(cacheKey, { at: Date.now(), data });
  return NextResponse.json(data);
}

export const GET = withAdminApi(handler, {
  rateLimit: { limit: 60, windowMs: 60_000, scope: "seo-gsc-report" },
});
