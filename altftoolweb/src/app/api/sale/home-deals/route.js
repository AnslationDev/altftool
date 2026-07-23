import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { searchSerpApiShopping } from "@/lib/sale/serpapi";
import { formatINR } from "@/lib/sale/formatCurrency";
import { serializeSaleError } from "@/lib/sale/errors";

export const runtime = "nodejs";

/**
 * GET /api/sale/home-deals
 *
 * Real-time product feeds for the Trending Sales, Flash Sales, and Deal
 * of the Day sections on the /sale landing page — sourced live from
 * SerpAPI (Google Shopping), no mock/static data.
 */
export async function GET(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 30,
      scope: "sale:home-deals",
      windowMs: 60000,
    });
    if (limited) return limited;

    const [trendingResult, flashResult] = await Promise.allSettled([
      searchSerpApiShopping({ query: "trending deals", location: "India" }),
      searchSerpApiShopping({ query: "flash sale", location: "India" }),
    ]);

    const trending = trendingResult.status === "fulfilled" ? trendingResult.value.items : [];
    const flash = flashResult.status === "fulfilled" ? flashResult.value.items : [];

    if (trending.length === 0 && flash.length === 0) {
      const failure = trendingResult.status === "rejected" ? trendingResult.reason : flashResult.reason;
      if (failure) throw failure;
    }

    return NextResponse.json({
      trending: trending.map(toSaleCardShape),
      flash: flash.map(toSaleCardShape),
      dealOfDay: buildDealOfDay([...trending, ...flash]),
    });
  } catch (error) {
    const { message, code } = serializeSaleError(error);

    // The homepage feed is optional enrichment. Keep /sale usable when the
    // provider is not configured, unavailable, or out of quota.
    return NextResponse.json({
      available: false,
      error: message,
      code,
      trending: [],
      flash: [],
      dealOfDay: [],
    });
  }
}

/** Map a normalized ShoppingResult into the shape SaleCard expects. */
function toSaleCardShape(item) {
  const discountAmount = item.originalPrice && item.price && item.originalPrice > item.price
    ? item.originalPrice - item.price
    : null;

  return {
    id: item.id,
    title: item.title,
    image: item.image,
    price: formatINR(item.price),
    oldPrice: item.originalPrice && item.originalPrice !== item.price ? formatINR(item.originalPrice) : "",
    discount: discountAmount ? `Save ${formatINR(discountAmount)}` : item.discount ? `${item.discount}% OFF` : "Deal",
    ctaLink: item.productUrl || "#",
  };
}

/**
 * Build the 5-tile "Deal of the Day" grid (2 top, 3 bottom) from the
 * highest-discount real results across both feeds.
 */
function buildDealOfDay(items) {
  const withDiscount = items
    .filter((item) => item.originalPrice && item.price && item.originalPrice > item.price)
    .sort((a, b) => (b.originalPrice - b.price) / b.originalPrice - (a.originalPrice - a.price) / a.originalPrice)
    .slice(0, 5);

  const layout = [
    { row: "top", size: "wide" },
    { row: "top", size: "normal" },
    { row: "bottom" },
    { row: "bottom" },
    { row: "bottom" },
  ];

  return withDiscount.map((item, index) => ({
    id: item.id,
    title: item.title,
    image: item.image,
    price: formatINR(item.price),
    oldPrice: formatINR(item.originalPrice),
    link: item.productUrl || "#",
    ...layout[index],
  }));
}
