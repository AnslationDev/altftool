import { NextResponse } from "next/server";
import { enforceRateLimit, jsonResponse } from "@altftool/core/http";
import { fetchPublicHolidays } from "@/app/lookouts/festival/lib/upstream";

export async function GET(req) {
  const limited = enforceRateLimit(NextResponse, req, {
    limit: 60,
    scope: "lookouts:festival:holidays",
    windowMs: 60000,
  });
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const country = (searchParams.get("country") || "").trim();
  const year = Number(searchParams.get("year"));

  if (!/^[a-zA-Z]{2}$/.test(country)) {
    return NextResponse.json({ error: "country must be a two-letter ISO code." }, { status: 400 });
  }
  if (!Number.isFinite(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ error: "year must be a valid four-digit year." }, { status: 400 });
  }

  const holidays = await fetchPublicHolidays(country, year);

  return jsonResponse(
    NextResponse,
    { country: country.toUpperCase(), year, holidays },
    { cache: { sMaxage: 86400, staleWhileRevalidate: 604800 } },
  );
}
