import { requireServerEnv } from "@altftool/core/env";
import { SERVER_ENV } from "@altftool/core/services";
import { fetchWithRetry } from "./httpClient.js";
import { toSaleApiError } from "./errors.js";
import { getOrSetSaleCache, buildCacheKey } from "./cache.js";

const PROVIDER = "rapidapi";

function parsePrice(price) {
  if (price === null || price === undefined) return null;
  if (typeof price === "number") return Math.round(price);
  const cleaned = String(price).replace(/[^0-9.]/g, "");
  return cleaned ? Math.round(parseFloat(cleaned)) : null;
}

function pick(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

/**
 * Registry of RapidAPI shopping sources. Each entry describes:
 *  - host: the `x-rapidapi-host` for that listing
 *  - buildRequest: turns {query, page, country} into a fetch URL
 *  - extractItems: pulls the raw item array out of that endpoint's response shape
 *  - mapItem: normalizes one raw item into a ShoppingResult
 *
 * Swap `host` / path / field names below to match the exact RapidAPI listing
 * you subscribe to for each retailer — RapidAPI hosts multiple competing
 * listings per store, so this is intentionally a thin, replaceable adapter
 * layer rather than a hardcoded contract.
 */
export const RAPIDAPI_SOURCES = {
  amazon: {
    host: "real-time-amazon-data.p.rapidapi.com",
    buildRequest: ({ query, page, country }) => {
      const url = new URL(`https://real-time-amazon-data.p.rapidapi.com/search`);
      url.searchParams.set("query", query);
      url.searchParams.set("page", String(page));
      url.searchParams.set("country", country || "IN");
      return url;
    },
    extractItems: (data) => data?.data?.products || [],
    mapItem: (raw) => ({
      title: raw.product_title || raw.title,
      price: parsePrice(raw.product_price || raw.price),
      originalPrice: parsePrice(raw.product_original_price || raw.original_price),
      seller: "Amazon",
      image: raw.product_photo || raw.thumbnail,
      rating: raw.product_star_rating ? Number(raw.product_star_rating) : null,
      reviews: raw.product_num_ratings ?? null,
      delivery: raw.delivery || null,
      productUrl: raw.product_url || raw.url,
    }),
  },
  flipkart: {
    host: "flipkart-scraper-api.p.rapidapi.com",
    buildRequest: ({ query, page }) => {
      const url = new URL(`https://flipkart-scraper-api.p.rapidapi.com/search`);
      url.searchParams.set("q", query);
      url.searchParams.set("page", String(page));
      return url;
    },
    extractItems: (data) => data?.results || data?.products || [],
    mapItem: (raw) => ({
      title: raw.title,
      price: parsePrice(raw.price?.current || raw.price),
      originalPrice: parsePrice(raw.price?.original || raw.original_price),
      seller: "Flipkart",
      image: raw.thumbnails?.[0] || raw.image,
      rating: raw.rating?.average ?? null,
      reviews: raw.rating?.count ?? null,
      delivery: null,
      productUrl: raw.url || raw.product_url,
    }),
  },
  myntra: {
    host: "myntra2.p.rapidapi.com",
    buildRequest: ({ query, page }) => {
      const url = new URL(`https://myntra2.p.rapidapi.com/search`);
      url.searchParams.set("query", query);
      url.searchParams.set("page", String(page));
      return url;
    },
    extractItems: (data) => data?.products || [],
    mapItem: (raw) => ({
      title: raw.productName || raw.name,
      price: parsePrice(raw.price?.discounted || raw.price),
      originalPrice: parsePrice(raw.price?.mrp || raw.mrp),
      seller: "Myntra",
      image: raw.image || raw.searchImage,
      rating: raw.rating ?? null,
      reviews: raw.ratingCount ?? null,
      delivery: null,
      productUrl: raw.landingPageUrl || raw.url,
    }),
  },
  ajio: {
    host: "ajio-api.p.rapidapi.com",
    buildRequest: ({ query, page }) => {
      const url = new URL(`https://ajio-api.p.rapidapi.com/search`);
      url.searchParams.set("q", query);
      url.searchParams.set("page", String(page));
      return url;
    },
    extractItems: (data) => data?.products || [],
    mapItem: (raw) => ({
      title: raw.name || raw.title,
      price: parsePrice(raw.price),
      originalPrice: parsePrice(raw.wasPriceData || raw.mrp),
      seller: "Ajio",
      image: raw.image,
      rating: raw.rating ?? null,
      reviews: raw.reviewCount ?? null,
      delivery: null,
      productUrl: raw.url,
    }),
  },
  croma: {
    host: "croma-api.p.rapidapi.com",
    buildRequest: ({ query, page }) => {
      const url = new URL(`https://croma-api.p.rapidapi.com/search`);
      url.searchParams.set("q", query);
      url.searchParams.set("page", String(page));
      return url;
    },
    extractItems: (data) => data?.products || [],
    mapItem: (raw) => ({
      title: raw.name || raw.title,
      price: parsePrice(raw.price),
      originalPrice: parsePrice(raw.mrp),
      seller: "Croma",
      image: raw.image,
      rating: raw.rating ?? null,
      reviews: raw.reviewCount ?? null,
      delivery: null,
      productUrl: raw.url,
    }),
  },
  "reliance-digital": {
    host: "reliance-digital-api.p.rapidapi.com",
    buildRequest: ({ query, page }) => {
      const url = new URL(`https://reliance-digital-api.p.rapidapi.com/search`);
      url.searchParams.set("q", query);
      url.searchParams.set("page", String(page));
      return url;
    },
    extractItems: (data) => data?.products || [],
    mapItem: (raw) => ({
      title: raw.name || raw.title,
      price: parsePrice(raw.price),
      originalPrice: parsePrice(raw.mrp),
      seller: "Reliance Digital",
      image: raw.image,
      rating: raw.rating ?? null,
      reviews: raw.reviewCount ?? null,
      delivery: null,
      productUrl: raw.url,
    }),
  },
  nykaa: {
    host: "nykaa-api.p.rapidapi.com",
    buildRequest: ({ query, page }) => {
      const url = new URL(`https://nykaa-api.p.rapidapi.com/search`);
      url.searchParams.set("q", query);
      url.searchParams.set("page", String(page));
      return url;
    },
    extractItems: (data) => data?.products || [],
    mapItem: (raw) => ({
      title: raw.name || raw.title,
      price: parsePrice(raw.price),
      originalPrice: parsePrice(raw.mrp),
      seller: "Nykaa",
      image: raw.image,
      rating: raw.rating ?? null,
      reviews: raw.reviewCount ?? null,
      delivery: null,
      productUrl: raw.url,
    }),
  },
  meesho: {
    host: "meesho-api.p.rapidapi.com",
    buildRequest: ({ query, page }) => {
      const url = new URL(`https://meesho-api.p.rapidapi.com/search`);
      url.searchParams.set("q", query);
      url.searchParams.set("page", String(page));
      return url;
    },
    extractItems: (data) => data?.products || [],
    mapItem: (raw) => ({
      title: raw.name || raw.title,
      price: parsePrice(raw.price),
      originalPrice: parsePrice(raw.mrp),
      seller: "Meesho",
      image: raw.image,
      rating: raw.rating ?? null,
      reviews: raw.reviewCount ?? null,
      delivery: null,
      productUrl: raw.url,
    }),
  },
  firstcry: {
    host: "firstcry-api.p.rapidapi.com",
    buildRequest: ({ query, page }) => {
      const url = new URL(`https://firstcry-api.p.rapidapi.com/search`);
      url.searchParams.set("q", query);
      url.searchParams.set("page", String(page));
      return url;
    },
    extractItems: (data) => data?.products || [],
    mapItem: (raw) => ({
      title: raw.name || raw.title,
      price: parsePrice(raw.price),
      originalPrice: parsePrice(raw.mrp),
      seller: "FirstCry",
      image: raw.image,
      rating: raw.rating ?? null,
      reviews: raw.reviewCount ?? null,
      delivery: null,
      productUrl: raw.url,
    }),
  },
};

export const RAPIDAPI_SOURCE_KEYS = Object.keys(RAPIDAPI_SOURCES);

/**
 * Query a single RapidAPI shopping source and normalize its results.
 *
 * @param {string} sourceKey one of RAPIDAPI_SOURCE_KEYS
 * @param {{ query: string, page?: number, country?: string }} params
 * @returns {Promise<import("./types.js").ShoppingResult[]>}
 */
export async function searchRapidApiSource(sourceKey, { query, page = 1, country = "IN" }) {
  const source = RAPIDAPI_SOURCES[sourceKey];
  if (!source) {
    throw toSaleApiError(new Error(`Unknown RapidAPI source "${sourceKey}".`), { provider: PROVIDER });
  }

  const searchQuery = String(query || "deals").trim() || "deals";
  const pageNumber = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const cacheKey = buildCacheKey(`rapidapi:${sourceKey}`, { q: searchQuery, page: pageNumber, country });

  return getOrSetSaleCache(cacheKey, async () => {
    const apiKey = requireServerEnv(SERVER_ENV.rapidApi);
    const url = source.buildRequest({ query: searchQuery, page: pageNumber, country });

    let data;
    try {
      data = await fetchWithRetry(url, {
        provider: `${PROVIDER}:${sourceKey}`,
        timeoutMs: 10000,
        retries: 1,
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": source.host,
        },
      });
    } catch (error) {
      throw toSaleApiError(error, { provider: `${PROVIDER}:${sourceKey}` });
    }

    const rawItems = source.extractItems(data) || [];

    return rawItems.map((raw, index) => {
      const mapped = source.mapItem(raw) || {};
      return {
        id: `${sourceKey}-${pick(raw.id, raw.product_id, index)}`,
        title: pick(mapped.title, "Deal"),
        price: mapped.price ?? null,
        originalPrice: mapped.originalPrice ?? mapped.price ?? null,
        discount:
          mapped.originalPrice && mapped.price && mapped.originalPrice > mapped.price
            ? Math.round(((mapped.originalPrice - mapped.price) / mapped.originalPrice) * 100)
            : null,
        seller: pick(mapped.seller, sourceKey),
        image: pick(mapped.image, ""),
        rating: Number.isFinite(Number(mapped.rating)) ? Number(mapped.rating) : null,
        reviews: Number.isFinite(Number(mapped.reviews)) ? Number(mapped.reviews) : null,
        shoppingSource: sourceKey,
        delivery: mapped.delivery || null,
        productUrl: pick(mapped.productUrl, "#"),
      };
    });
  });
}

/**
 * Search one or more RapidAPI shopping sources concurrently.
 * Failures in individual sources are swallowed so one bad/unsubscribed
 * source doesn't break the whole search.
 *
 * @param {{ query: string, page?: number, country?: string, sources?: string[] }} params
 * @returns {Promise<import("./types.js").ShoppingResult[]>}
 */
export async function searchRapidApiShopping({ query, page = 1, country = "IN", sources = RAPIDAPI_SOURCE_KEYS }) {
  const requestedSources = (Array.isArray(sources) && sources.length ? sources : RAPIDAPI_SOURCE_KEYS).filter(
    (sourceKey) => RAPIDAPI_SOURCE_KEYS.includes(sourceKey),
  );

  const settled = await Promise.allSettled(
    requestedSources.map((sourceKey) => searchRapidApiSource(sourceKey, { query, page, country })),
  );

  return settled.filter((result) => result.status === "fulfilled").flatMap((result) => result.value);
}
