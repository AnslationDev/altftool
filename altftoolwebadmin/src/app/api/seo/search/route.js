// altftoolwebadmin/src/app/api/seo/search/route.js
// ALTF Engine global search over the page registry.

import { NextResponse } from "next/server";
import { authorizeSeoRequest, seoAccessErrorResponse } from "@/lib/seoAuth";
import { enforceRateLimit } from "@altftool/core/http";
import { searchPages } from "@altftool/core/seo";
import { getRegistryEntries } from "@/lib/seoRegistrySource";

export async function GET(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 60,
    windowMs: 60_000,
    scope: "seo-search",
  });
  if (limited) return limited;

  let projectId;
  try {
    ({ projectId } = await authorizeSeoRequest(request, "read"));
  } catch (error) {
    return seoAccessErrorResponse(error);
  }

  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "all";
  const force = searchParams.get("refresh") === "1";

  try {
    const entries = await getRegistryEntries({ force, projectId });
    const results = searchPages(entries, q, { type, limit: 50 });
    return NextResponse.json({ total: entries.length, count: results.length, results });
  } catch (error) {
    console.error("[seo/search]", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
