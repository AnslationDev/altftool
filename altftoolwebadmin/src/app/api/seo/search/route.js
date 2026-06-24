// altftoolwebadmin/src/app/api/seo/search/route.js
// ALTF Engine global search over the page registry.

import { NextResponse } from "next/server";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";
import { enforceRateLimit } from "@altftool/core/http";
import { searchPages } from "@altftool/core/seo";
import { getRegistryEntries } from "@/lib/seoRegistrySource";

function authErrorResponse(error) {
  const message = String(error?.message || "Unauthorized");
  const status = /forbidden|inactive/i.test(message) ? 403 : 401;
  return NextResponse.json({ error: status === 403 ? "Forbidden" : "Unauthorized" }, { status });
}

export async function GET(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 60,
    windowMs: 60_000,
    scope: "seo-search",
  });
  if (limited) return limited;

  try {
    await verifyActiveAdmin(request);
  } catch (error) {
    return authErrorResponse(error);
  }

  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "all";
  const force = searchParams.get("refresh") === "1";

  try {
    const entries = await getRegistryEntries({ force });
    const results = searchPages(entries, q, { type, limit: 50 });
    return NextResponse.json({ total: entries.length, count: results.length, results });
  } catch (error) {
    console.error("[seo/search]", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
