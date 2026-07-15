// altftoolwebadmin/src/app/api/seo/gsc/oauth/route.js
//
// Connection management for the OAuth org connection.
//   GET  ?action=connection            -> status (token-free)
//   GET  ?action=properties            -> list verified Search Console properties
//   POST { action: "select-property", siteUrl }   (Super Admin)
//   POST { action: "disconnect" }                 (Super Admin)

import { NextResponse } from "next/server";
import { withAdminApi } from "@/lib/security/withAdminApi";
import { isOAuthConfigured } from "@/lib/gsc/oauthConfig";
import {
  getConnection,
  setActiveProperty,
  setCachedProperties,
  clearConnection,
  getRefreshToken,
  getActiveProperty,
} from "@/lib/gsc/tokenStore";
import { gscListSites } from "@/lib/gscClient";
import { revokeToken } from "@/lib/gsc/oauthClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readHandler({ request }) {
  const action = new URL(request.url).searchParams.get("action") || "connection";

  if (action === "connection") {
    return NextResponse.json({ oauthConfigured: isOAuthConfigured(), connection: await getConnection() });
  }

  if (action === "properties") {
    const sites = await gscListSites();
    const properties = sites.map((s) => ({ siteUrl: s.siteUrl, permissionLevel: s.permissionLevel }));
    await setCachedProperties(properties).catch(() => {});
    return NextResponse.json({ properties, activeProperty: await getActiveProperty() });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

async function writeHandler({ request, audit }) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.action === "select-property") {
    if (!body.siteUrl) return NextResponse.json({ error: "Missing siteUrl" }, { status: 400 });
    await setActiveProperty(body.siteUrl);
    await audit({ action: "seo.gsc.property.select", module: "seo", summary: `Selected property ${body.siteUrl}`, changes: { siteUrl: body.siteUrl } });
    return NextResponse.json({ ok: true, activeProperty: body.siteUrl });
  }

  if (body.action === "disconnect") {
    const refresh = await getRefreshToken().catch(() => null);
    if (refresh) await revokeToken(refresh);
    await clearConnection();
    await audit({ action: "seo.gsc.disconnect", module: "seo", summary: "Disconnected Google Search Console" });
    return NextResponse.json({ ok: true, connection: { connected: false } });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export const GET = withAdminApi(readHandler, {
  rateLimit: { limit: 60, windowMs: 60_000, scope: "seo-gsc-oauth-read" },
  // GSC is altftool's single Google connection — lock to altftool SEO access.
  requireProjectModule: { project: "altftool", moduleKey: "seo", action: "read" },
});

export const POST = withAdminApi(writeHandler, {
  requireSuperAdmin: true,
  rateLimit: { limit: 20, windowMs: 60_000, scope: "seo-gsc-oauth-write" },
  audit: { module: "seo" },
  mutating: true,
});
