// altftoolwebadmin/src/app/api/seo/registry/route.js
// ALTF Engine dashboard data: registry summary (counts by type + aggregate
// health) plus the top pages needing attention.

import { NextResponse } from "next/server";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";
import { summarizeRegistry } from "@altftool/core/seo";
import { getRegistryEntries } from "@/lib/seoRegistrySource";

function authErrorResponse(error) {
  const message = String(error?.message || "Unauthorized");
  const status = /forbidden|inactive/i.test(message) ? 403 : 401;
  return NextResponse.json({ error: status === 403 ? "Forbidden" : "Unauthorized" }, { status });
}

export async function GET(request) {
  try {
    await verifyActiveAdmin(request);
  } catch (error) {
    return authErrorResponse(error);
  }

  const force = request.nextUrl.searchParams.get("refresh") === "1";
  try {
    const entries = await getRegistryEntries({ force });
    const summary = summarizeRegistry(entries);

    // Top "needs attention": indexable pages missing title/description.
    const attention = entries
      .filter((e) => e.indexState !== "noindex" && (e.health?.missingTitle || e.health?.missingDescription))
      .slice(0, 50)
      .map((e) => ({ path: e.path, pageType: e.pageType, title: e.title, health: e.health }));

    return NextResponse.json({ summary, attention });
  } catch (error) {
    console.error("[seo/registry]", error);
    return NextResponse.json({ error: "Failed to load registry" }, { status: 500 });
  }
}
