import { NextResponse } from "next/server";
import { enforceRateLimit, searchParam } from "@altftool/core/http";
import { runLocationSearchFlow } from "@/lib/sale/searchFlow";
import { serializeSaleError } from "@/lib/sale/errors";

export const runtime = "nodejs";

/**
 * GET /api/sale/search?location=Gurugram&query=shoes&page=1
 *
 * Full location search flow:
 *   geocode location → fetch nearby stores → search shopping deals
 *   (SerpAPI + RapidAPI + affiliate providers) → merge → unified JSON.
 */
export async function GET(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 30,
      scope: "sale:search",
      windowMs: 60000,
    });
    if (limited) return limited;

    const location = searchParam(req, "location");
    const query = searchParam(req, "query", "deals");
    const page = Number(searchParam(req, "page", "1")) || 1;
    const radiusParam = searchParam(req, "radius");

    if (!location) {
      return NextResponse.json({ error: "location is required." }, { status: 400 });
    }

    const result = await runLocationSearchFlow({
      location,
      query,
      page,
      radius: radiusParam ? Number(radiusParam) : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    const { message, status, code } = serializeSaleError(error);
    return NextResponse.json({ error: message, code }, { status });
  }
}
