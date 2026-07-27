// altftoolwebadmin/src/app/api/seo/gsc/route.js
//
// ALTF Engine — Google Search Console proxy.
// GET  ?action=status|sitemaps|analytics
// POST { action: "inspect", url } | { action: "submit-sitemap", feedpath }

import { NextResponse } from "next/server";
import { authorizeSeoRequest, seoAccessErrorResponse } from "@/lib/seoAuth";
import { enforceRateLimit } from "@altftool/core/http";
import {
  isGscConfigured,
  gscSiteUrl,
  gscListSites,
  gscInspectUrl,
  gscSearchAnalytics,
  gscListSitemaps,
  gscSubmitSitemap,
} from "@/lib/gscClient";
import { propertyOrigin, isFeedpathInProperty } from "@/app/api/seo/gsc/sitemaps/route";

// GSC is altftool's single Google connection — every call is authorized against
// the altftool SEO module so no other project's admin can reach altftool's
// Search Console data by hitting this API directly.
const GSC_PROJECT = { forceProject: "altftool" };

// Map Google API errors into a friendly hint.
function gscErrorResponse(error) {
  if (error?.code === "GSC_NOT_CONFIGURED") {
    return NextResponse.json({ configured: false, error: error.message }, { status: 200 });
  }
  const status = error?.response?.status || error?.status || 500;
  let hint = error?.response?.data?.error?.message || error?.message || "Search Console request failed.";
  if (status === 403) {
    hint =
      "Access denied by Search Console. Add the service-account email as an OWNER of the property, and enable the Google Search Console API in Google Cloud.";
  } else if (status === 404) {
    hint = "Property not found. Check GSC_SITE_URL (e.g. 'sc-domain:altftool.com') matches a verified property.";
  }
  console.error("[seo/gsc]", status, error?.response?.data || error?.message);
  return NextResponse.json({ error: hint, status }, { status: status >= 400 && status < 600 ? status : 500 });
}

function daysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export async function GET(request) {
  const limited = enforceRateLimit(NextResponse, request, { limit: 40, windowMs: 60_000, scope: "seo-gsc" });
  if (limited) return limited;
  try {
    await authorizeSeoRequest(request, "read", GSC_PROJECT);
  } catch (error) {
    return seoAccessErrorResponse(error);
  }

  const action = request.nextUrl.searchParams.get("action") || "status";
  try {
    if (!isGscConfigured()) {
      return NextResponse.json({ configured: false, siteUrl: gscSiteUrl() });
    }

    if (action === "status") {
      const sites = await gscListSites();
      const site = gscSiteUrl();
      const matched = sites.find((s) => s.siteUrl === site);
      return NextResponse.json({
        configured: true,
        connected: true,
        siteUrl: site,
        permissionLevel: matched?.permissionLevel || null,
        sites: sites.map((s) => ({ siteUrl: s.siteUrl, permissionLevel: s.permissionLevel })),
      });
    }

    if (action === "sitemaps") {
      const sitemaps = await gscListSitemaps();
      return NextResponse.json({ configured: true, siteUrl: gscSiteUrl(), sitemaps });
    }

    if (action === "analytics") {
      const dimension = request.nextUrl.searchParams.get("dimension") || "query";
      const rows = await gscSearchAnalytics({
        startDate: daysAgo(28),
        endDate: daysAgo(1),
        dimensions: [dimension],
        rowLimit: 25,
      });
      const totals = rows.reduce(
        (acc, r) => ({ clicks: acc.clicks + (r.clicks || 0), impressions: acc.impressions + (r.impressions || 0) }),
        { clicks: 0, impressions: 0 },
      );
      return NextResponse.json({ configured: true, siteUrl: gscSiteUrl(), dimension, totals, rows });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return gscErrorResponse(error);
  }
}

export async function POST(request) {
  const limited = enforceRateLimit(NextResponse, request, { limit: 30, windowMs: 60_000, scope: "seo-gsc-write" });
  if (limited) return limited;
  try {
    await authorizeSeoRequest(request, "read", GSC_PROJECT);
  } catch (error) {
    return seoAccessErrorResponse(error);
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    if (body.action === "inspect") {
      if (!body.url || typeof body.url !== "string") {
        return NextResponse.json({ error: "Missing 'url' to inspect." }, { status: 400 });
      }
      const result = await gscInspectUrl(body.url);
      return NextResponse.json({ configured: true, url: body.url, result });
    }

    if (body.action === "submit-sitemap") {
      // Submitting a sitemap mutates the production property, so — unlike
      // inspect above — it needs `write`, not the blanket `read` check the
      // top of this handler applies to every action. A client-supplied
      // feedpath must also be validated against the verified property,
      // otherwise the request body decides which host we hand to Google.
      try {
        await authorizeSeoRequest(request, "write", GSC_PROJECT);
      } catch (error) {
        return seoAccessErrorResponse(error);
      }
      const property = gscSiteUrl();
      const feedpath = String(body.feedpath || `${propertyOrigin(property)}/sitemap.xml`);
      if (!isFeedpathInProperty(feedpath, property)) {
        return NextResponse.json({ error: "feedpath must be an http(s) URL inside the verified property" }, { status: 400 });
      }
      await gscSubmitSitemap(feedpath);
      return NextResponse.json({ ok: true, feedpath });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return gscErrorResponse(error);
  }
}
