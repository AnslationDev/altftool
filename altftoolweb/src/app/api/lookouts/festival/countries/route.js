import { NextResponse } from "next/server";
import { enforceRateLimit, jsonResponse } from "@altftool/core/http";
import { fetchCountryInfo } from "@/app/lookouts/festival/lib/upstream";

export async function GET(req) {
  const limited = enforceRateLimit(NextResponse, req, {
    limit: 60,
    scope: "lookouts:festival:countries",
    windowMs: 60000,
  });
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const codes = (searchParams.get("codes") || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  if (!codes.length || !codes.every((c) => /^[a-zA-Z]{2}$/.test(c))) {
    return NextResponse.json({ error: "codes must be a comma-separated list of two-letter ISO codes." }, { status: 400 });
  }

  const countries = await fetchCountryInfo(codes);

  return jsonResponse(
    NextResponse,
    { countries },
    { cache: { sMaxage: 604800, staleWhileRevalidate: 1209600 } },
  );
}
