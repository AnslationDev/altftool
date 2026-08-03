import { NextResponse } from "next/server";
import { enforceTop10RateLimit, top10Choice, top10Page, top10ProviderFailure, top10Text, top10Type } from "@/lib/top10/apiResponse";
import { getCryptoByCategory, getCryptoCategories, searchCrypto } from "@/lib/providers/coincap/crypto";
import { requireProviderKey } from "@/lib/providers/_shared/configuration";

export const runtime = "nodejs";

/**
 * GET /api/crypto?type=categories
 * GET /api/crypto?type=by_category&categoryId=...&page=...
 * GET /api/crypto?type=search&query=...&page=...
 *
 * Thin proxy over CoinCap — the only thing client code should ever call
 * for crypto data, so COINCAP_API_KEY never reaches the browser. Same
 * shape as every other /api/<product> route.
 */
export async function GET(request) {
  const limited = enforceTop10RateLimit(request);
  if (limited) return limited;
  const { searchParams } = new URL(request.url);
  const type = top10Type(searchParams, ["categories", "by_category", "search"], "categories");
  const query = top10Text(searchParams, "query");
  const categoryId = top10Choice(searchParams, "categoryId", getCryptoCategories().map(({ id }) => id));
  const page = top10Page(searchParams);

  try {
    requireProviderKey("COINCAP_API_KEY", "CoinCap");
    if (type === "categories") {
      const categories = getCryptoCategories();
      return NextResponse.json(
        { categories },
        { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } },
      );
    }

    const { crypto, hasMore } =
      type === "search" ? await searchCrypto(query, { page }) : await getCryptoByCategory(categoryId, { page });

    return NextResponse.json(
      { crypto, hasMore, page, type, query, categoryId },
      // Prices move fast — much shorter cache than the other products.
      { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" } },
    );
  } catch (error) {
    return top10ProviderFailure(
      { crypto: [], categories: [], hasMore: false, page, type, query, categoryId },
      error,
    );
  }
}
