import { NextResponse } from "next/server";
import { enforceRateLimit, searchParam } from "@altftool/core/http";
import { fetchNearbyStores, PLACE_TYPES } from "@/lib/sale/places";
import { serializeSaleError, friendlyMessageFor } from "@/lib/sale/errors";

export const runtime = "nodejs";

/**
 * GET /api/sale/places?lat=&lng=&radius=&types=shopping_mall,supermarket
 * Fetches nearby businesses via the free OpenStreetMap Overpass API
 * (no API key required).
 */
export async function GET(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 60,
      scope: "sale:places",
      windowMs: 60000,
    });
    if (limited) return limited;

    const latitude = Number(searchParam(req, "lat"));
    const longitude = Number(searchParam(req, "lng"));
    const radius = searchParam(req, "radius");
    const typesParam = searchParam(req, "types");

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json({ error: "lat and lng are required." }, { status: 400 });
    }

    const types = typesParam
      ? typesParam.split(",").map((type) => type.trim()).filter(Boolean)
      : PLACE_TYPES;

    const stores = await fetchNearbyStores({
      latitude,
      longitude,
      radius: radius ? Number(radius) : undefined,
      types,
    });

    return NextResponse.json({ stores, count: stores.length });
  } catch (error) {
    const { message, status, code } = serializeSaleError(error);
    console.error("[sale/places] upstream failure:", message);
    return NextResponse.json({ error: friendlyMessageFor(code), code }, { status });
  }
}
