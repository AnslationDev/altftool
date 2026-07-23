import { NextResponse } from "next/server";
import { enforceRateLimit, searchParam } from "@altftool/core/http";
import { geocodeLocation } from "@/lib/sale/geocoding";
import { serializeSaleError } from "@/lib/sale/errors";

export const runtime = "nodejs";

/**
 * GET /api/sale/geocode?location=Gurugram
 * Converts a location name into latitude/longitude via the free
 * OpenStreetMap Nominatim geocoding service (no API key required).
 */
export async function GET(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 60,
      scope: "sale:geocode",
      windowMs: 60000,
    });
    if (limited) return limited;

    const location = searchParam(req, "location");
    if (!location) {
      return NextResponse.json({ error: "location is required." }, { status: 400 });
    }

    const result = await geocodeLocation(location);
    return NextResponse.json(result);
  } catch (error) {
    const { message, status, code } = serializeSaleError(error);
    return NextResponse.json({ error: message, code }, { status });
  }
}
