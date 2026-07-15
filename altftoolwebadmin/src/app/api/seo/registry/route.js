// altftoolwebadmin/src/app/api/seo/registry/route.js
// ALTF Engine dashboard data: registry summary (counts by type + aggregate
// health) plus the top pages needing attention.

import { NextResponse } from "next/server";
import { authorizeSeoRequest, seoAccessErrorResponse } from "@/lib/seoAuth";
import { summarizeRegistry } from "@altftool/core/seo";
import { getRegistryEntries } from "@/lib/seoRegistrySource";

export async function GET(request) {
  let projectId;
  try {
    ({ projectId } = await authorizeSeoRequest(request, "read"));
  } catch (error) {
    return seoAccessErrorResponse(error);
  }

  const force = request.nextUrl.searchParams.get("refresh") === "1";
  try {
    const entries = await getRegistryEntries({ force, projectId });
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
