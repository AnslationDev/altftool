import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { searchNearbyMalls } from "@/lib/sale/search.service.js";
import { serializeSaleError, SaleApiError, friendlyMessageFor } from "@/lib/sale/errors.js";
import { getOrSetSaleCache, buildCacheKey } from "@/lib/sale/cache.js";

export const runtime = "nodejs";

/**
 * GET /api/search/nearby?latitude=..&longitude=..&radius=..&keyword=..
 *
 * Real-time nearby shopping mall/store search backed entirely by the free
 * OpenStreetMap Overpass API (no mock/hardcoded data, no paid keys).
 *
 * Response: [{ id, name, address, lat, lng, distance, category, website,
 *              phoneNumber, businessStatus, openNow }]
 */
export async function GET(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 60,
    scope: "search:nearby",
    windowMs: 60000,
  });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);

  const latitude = Number(searchParams.get("latitude"));
  const longitude = Number(searchParams.get("longitude"));
  const radiusParam = searchParams.get("radius");
  const radius = Number.isFinite(Number(radiusParam)) && Number(radiusParam) > 0 ? Number(radiusParam) : undefined;
  const keyword = searchParams.get("keyword") || "";

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json(
      { error: { message: "latitude and longitude are required and must be valid numbers.", code: "invalid_request" } },
      { status: 400 },
    );
  }

  try {
    const cacheKey = buildCacheKey("search:nearby", {
      lat: latitude.toFixed(3),
      lng: longitude.toFixed(3),
      radius: radius || "default",
      keyword: keyword.trim().toLowerCase(),
    });

    const results = await getOrSetSaleCache(cacheKey, () =>
      searchNearbyMalls({ latitude, longitude, radius, keyword }),
    );

    return NextResponse.json(results);
  } catch (error) {
    const saleError = error instanceof SaleApiError ? error : new SaleApiError(
      error?.message || "Failed to search nearby places.",
      { status: 502, code: "upstream_error", provider: "openstreetmap", cause: error },
    );

    const serialized = serializeSaleError(saleError);
    return NextResponse.json(
      { error: { ...serialized, message: friendlyMessageFor(serialized.code) } },
      { status: saleError.status || 502 },
    );
  }
}
