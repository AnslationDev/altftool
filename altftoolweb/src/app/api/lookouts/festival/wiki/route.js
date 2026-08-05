import { NextResponse } from "next/server";
import { enforceRateLimit, jsonResponse } from "@altftool/core/http";
import { fetchWikiSummary } from "@/app/lookouts/festival/lib/upstream";

export async function GET(req) {
  const limited = enforceRateLimit(NextResponse, req, {
    limit: 60,
    scope: "lookouts:festival:wiki",
    windowMs: 60000,
  });
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "").trim();

  if (!title || title.length > 200) {
    return NextResponse.json({ error: "title is required." }, { status: 400 });
  }

  const summary = await fetchWikiSummary(title);

  return jsonResponse(
    NextResponse,
    { summary },
    { cache: { sMaxage: 604800, staleWhileRevalidate: 1209600 } },
  );
}
