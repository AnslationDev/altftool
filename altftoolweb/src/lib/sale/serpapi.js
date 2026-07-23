import { requireServerEnv } from "@altftool/core/env";
import { SERVER_ENV } from "@altftool/core/services";
import { fetchWithRetry } from "./httpClient.js";
import { toSaleApiError } from "./errors.js";
import { getOrSetSaleCache, buildCacheKey } from "./cache.js";

const SERPAPI_ENDPOINT = "https://serpapi.com/search";
const PROVIDER = "serpapi";

function parsePrice(price) {
  if (price === null || price === undefined) return null;
  if (typeof price === "number") return Math.round(price);
  const cleaned = String(price).replace(/[^0-9.]/g, "");
  return cleaned ? Math.round(parseFloat(cleaned)) : null;
}

/** Parse a "46% OFF" / "46%" style tag/extension into a plain percentage number. */
function parseDiscountTag(raw) {
  const tag = raw.tag || raw.extensions?.find((ext) => /%/.test(ext)) || "";
  const match = String(tag).match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? Math.round(parseFloat(match[1])) : null;
}

/**
 * @param {any} raw one `shopping_results` entry
 * @returns {import("./types.js").ShoppingResult}
 */
function normalizeSerpApiItem(raw, index) {
  const price = parsePrice(raw.extracted_price ?? raw.price);
  const originalPrice =
    parsePrice(raw.extracted_old_price ?? raw.old_price ?? raw.extracted_original_price ?? raw.original_price) ??
    price;
  const percentOff =
    originalPrice && price && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : parseDiscountTag(raw);

  return {
    id: `serpapi-${raw.product_id || raw.position || index}`,
    title: raw.title || "Deal",
    price,
    originalPrice,
    discount: percentOff,
    seller: raw.source || raw.store || "Online store",
    image: raw.thumbnail || "",
    rating: typeof raw.rating === "number" ? raw.rating : null,
    reviews: typeof raw.reviews === "number" ? raw.reviews : null,
    shoppingSource: PROVIDER,
    delivery: raw.delivery || null,
    productUrl: raw.product_link || raw.link || "#",
  };
}

/**
 * Search Google Shopping results via SerpAPI.
 *
 * @param {{ query: string, location?: string, page?: number }} params
 * @returns {Promise<{ items: import("./types.js").ShoppingResult[], page: number, hasNextPage: boolean }>}
 */
export async function searchSerpApiShopping({ query, location = "", page = 1 }) {
  const searchQuery = String(query || "deals").trim() || "deals";
  const pageNumber = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const cacheKey = buildCacheKey("serpapi:shopping", { q: searchQuery, location, page: pageNumber });

  return getOrSetSaleCache(cacheKey, async () => {
    const apiKey = requireServerEnv(SERVER_ENV.serpApi);

    const upstream = new URL(SERPAPI_ENDPOINT);
    upstream.searchParams.set("engine", "google_shopping");
    upstream.searchParams.set("q", searchQuery);
    upstream.searchParams.set("api_key", apiKey);
    upstream.searchParams.set("num", "20");
    upstream.searchParams.set("hl", "en");
    upstream.searchParams.set("gl", "in");
    if (location) upstream.searchParams.set("location", location);
    if (pageNumber > 1) upstream.searchParams.set("start", String((pageNumber - 1) * 20));

    let data;
    try {
      data = await fetchWithRetry(upstream, { provider: PROVIDER, timeoutMs: 12000, retries: 2 });
    } catch (error) {
      throw toSaleApiError(error, { provider: PROVIDER });
    }

    const rawResults = data.shopping_results || [];
    const normalized = rawResults.map((raw, index) => normalizeSerpApiItem(raw, index));

    return {
      items: normalized,
      page: pageNumber,
      hasNextPage: Boolean(data.serpapi_pagination?.next),
    };
  });
}
