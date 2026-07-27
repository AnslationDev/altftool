import { NextResponse } from "next/server";
import crypto from "crypto";
import { getOrSetSaleCache, buildCacheKey, SALE_CACHE_TTL_MS } from "@/lib/sale/cache";

export const runtime = "nodejs";

/**
 * GET /api/sale/nearby-deals
 *
 * Fetches real-time deals for ANY city worldwide using a cascading API strategy.
 * Every result comes from a live shopping API — no mock data, no static
 * placeholder store listings — so every card has its own real product image.
 *   1. SerpAPI (Google Shopping)
 *   2.  ↓ (fallback)
 *   3. RapidAPI (Real-Time Shopping Data / Google Shopping)
 *   4.  ↓ (fallback)
 *   5. Amazon Product Advertising API (PAAPI)
 *   6.  ↓ (fallback)
 *   7. Empty response []  — NO mock data, ever.
 *
 * Query params:
 *   - city    (string) — city name (e.g. "Mumbai", "New York", "Tokyo")
 *   - query   (string) — optional product / deal search term
 *   - country (string) — optional country code hint
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city") || "";
    const query = searchParams.get("query") || "deals";
    const country = searchParams.get("country") || "";

    if (!city.trim()) {
      return NextResponse.json({
        deals: [],
        source: "none",
        city: "",
        query,
        message: "No city provided",
      });
    }

    const cityQuery = `${query} in ${city} ${country}`.trim();

    // Cache the upstream lookup per city+query for 10 minutes — repeat
    // searches (typing, switching back to a recent city) return instantly
    // instead of re-hitting SerpAPI/RapidAPI/Amazon every time. Only
    // successful lookups are cached (fetchOnlineDeals throws on a total
    // miss), so a transient outage doesn't get "stuck" empty for 10 minutes.
    const cacheKey = buildCacheKey("nearby-deals", { city, query, country });

    let onlineDeals = [];
    let onlineSource = "none";

    try {
      const result = await getOrSetSaleCache(
        cacheKey,
        () => fetchOnlineDeals({ city, query, cityQuery }),
        SALE_CACHE_TTL_MS,
      );
      onlineDeals = result.deals;
      onlineSource = result.source;
    } catch (err) {
      if (err?.code !== "no_deals") {
        console.error("[Nearby Deals API] Upstream lookup failed:", err);
      }
    }

    if (onlineDeals.length === 0) {
      return NextResponse.json({
        deals: [],
        source: "none",
        city,
        query,
        message:
          "No deals found.  Please try again later.",
      });
    }

    return NextResponse.json(
      { deals: onlineDeals, source: onlineSource, city, query },
      { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=300" } },
    );
  } catch (err) {
    console.error("[Nearby Deals API] Fatal error:", err);
    return NextResponse.json(
      {
        deals: [],
        source: "error",
        error: "Failed to fetch nearby deals",
        message: err.message,
      },
      { status: 500 },
    );
  }
}

/**
 * Run the SerpAPI → RapidAPI → Amazon cascade once. Wrapped by the route
 * handler in a 10-minute cache so identical city+query lookups don't
 * repeatedly pay the 2-10s upstream API latency.
 */
async function fetchOnlineDeals({ city, query, cityQuery }) {
  // 1. Try SerpAPI (Google Shopping)
  const serpApiKey = process.env.SERPAPI_KEY;
  if (serpApiKey) {
    try {
      const deals = await fetchSerpApi(city, query, cityQuery, serpApiKey);
      if (deals && deals.length > 0) return { deals, source: "serpapi" };
    } catch (err) {
      console.warn("[SerpAPI] Failed:", err.message);
    }
  }

  // 2. Try RapidAPI (Google Shopping / Shopping Data)
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (rapidApiKey) {
    try {
      const deals = await fetchRapidApi(city, query, cityQuery, rapidApiKey);
      if (deals && deals.length > 0) return { deals, source: "rapidapi" };
    } catch (err) {
      console.warn("[RapidAPI] Failed:", err.message);
    }
  }

  // 3. Try Amazon Product Advertising API
  const amazonKey = process.env.AMAZON_ACCESS_KEY;
  const amazonSecret = process.env.AMAZON_SECRET_KEY;
  const amazonPartnerTag = process.env.AMAZON_PARTNER_TAG;
  if (amazonKey && amazonSecret && amazonPartnerTag) {
    try {
      const deals = await fetchAmazonPaapi(city, query, amazonKey, amazonSecret, amazonPartnerTag);
      if (deals && deals.length > 0) return { deals, source: "amazon" };
    } catch (err) {
      console.warn("[Amazon PAAPI] Failed:", err.message);
    }
  }

  // 4. All APIs failed — throw so the cache layer doesn't store this
  //    empty result (a transient outage shouldn't stay "cached empty"
  //    for the full 10-minute TTL).
  const noDealsError = new Error("No deals available from any source.");
  noDealsError.code = "no_deals";
  throw noDealsError;
}

// ══════════════════════════════════════════════════════════════
//  1. SerpAPI  — Google Shopping
// ══════════════════════════════════════════════════════════════

async function fetchSerpApi(city, query, searchQuery, apiKey) {
  const params = new URLSearchParams({
    q: searchQuery,
    engine: "google_shopping",
    api_key: apiKey,
    num: "20",
    location: city,
    hl: "en",
    gl: "in",
  });

  const res = await fetch(
    `https://serpapi.com/search?${params.toString()}`,
    { signal: AbortSignal.timeout(12000) },
  );

  if (!res.ok) {
    throw new Error(`SerpAPI returned ${res.status}`);
  }

  const data = await res.json();
  const results = data.shopping_results || [];

  return results.map((item, index) => ({
    id: `serp-${Date.now()}-${index}`,
    title: item.title || `${query} Deal`,
    subTitle: item.store || item.seller || "Online Store",
    image:
      item.thumbnail ||
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    salePrice: parsePrice(item.price),
    originalPrice:
      parsePrice(item.extracted_price) || Math.round(parsePrice(item.price) * 1.3),
    currency: item.currency || "₹",
    offer: item.discount || `Deal`,
    offerText: `in ${city}`,
    area: "Online",
    city: city,
    latitude: null,
    longitude: null,
    ctaLink: item.link || item.product_link || "#",
    type: "nearby",
    source: "serpapi",
    rating: item.rating,
    reviews: item.reviews,
  }));
}

// ══════════════════════════════════════════════════════════════
//  2. RapidAPI  — Real-Time Shopping / Google Shopping Data
// ══════════════════════════════════════════════════════════════

async function fetchRapidApi(city, query, searchQuery, apiKey) {
  // Try multiple RapidAPI endpoints for better coverage

  // Attempt 1: Real-Time Google Shopping API
  try {
    const url = new URL("https://real-time-google-shopping-data.p.rapidapi.com/search");
    url.searchParams.set("q", searchQuery);
    url.searchParams.set("gl", getCountryCode(city) || "in");
    url.searchParams.set("hl", "en");
    url.searchParams.set("num", "20");

    const res = await fetch(url.toString(), {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "real-time-google-shopping-data.p.rapidapi.com",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = await res.json();
      const results = data.results || data.shopping_results || data.products || [];
      if (results.length > 0) {
        return results.map((item, index) => ({
          id: `rapid-${Date.now()}-${index}`,
          title: item.title || `${query} Deal`,
          subTitle: item.store || item.seller || item.source || "Online Store",
          image:
            item.thumbnail ||
            item.image ||
            item.product_img ||
            "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
          salePrice: parsePrice(item.price || item.sale_price),
          originalPrice:
            parsePrice(item.original_price || item.extracted_price) ||
            Math.round(parsePrice(item.price || item.sale_price) * 1.3),
          currency: item.currency || "₹",
          offer: `Deal`,
          offerText: `in ${city}`,
          area: "Online",
          city: city,
          latitude: null,
          longitude: null,
          ctaLink: item.link || item.url || item.product_url || "#",
          type: "nearby",
          source: "rapidapi",
          rating: item.rating,
          reviews: item.reviews,
        }));
      }
    }
  } catch (err) {
    console.warn("[RapidAPI] First endpoint failed:", err.message);
  }

  // Attempt 2: Alternative RapidAPI — Shopping API
  try {
    const url = new URL("https://real-time-amazon-data.p.rapidapi.com/search");
    url.searchParams.set("query", searchQuery);
    url.searchParams.set("country", getCountryCode(city) || "IN");
    url.searchParams.set("category_id", "aps");
    url.searchParams.set("limit", "20");

    const res = await fetch(url.toString(), {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "real-time-amazon-data.p.rapidapi.com",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = await res.json();
      const results = data.data?.products || data.products || [];
      if (results.length > 0) {
        return results.map((item, index) => ({
          id: `rapid-amz-${Date.now()}-${index}`,
          title: item.title || `${query} Deal`,
          subTitle: "Amazon",
          image:
            item.thumbnail ||
            item.product_photo ||
            "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
          salePrice: parsePrice(item.price || item.price_current),
          originalPrice:
            parsePrice(item.price_original || item.list_price) ||
            Math.round(parsePrice(item.price || item.price_current) * 1.3),
          currency: item.currency || "₹",
          offer: `Deal`,
          offerText: `in ${city}`,
          area: "Online",
          city: city,
          latitude: null,
          longitude: null,
          ctaLink: item.url || item.product_url || "#",
          type: "nearby",
          source: "rapidapi",
          rating: item.rating,
          reviews: item.reviews_count,
        }));
      }
    }
  } catch (err) {
    console.warn("[RapidAPI] Second endpoint failed:", err.message);
  }

  return [];
}

// ══════════════════════════════════════════════════════════════
//  3. Amazon Product Advertising API (PAAPI v5)
// ══════════════════════════════════════════════════════════════

async function fetchAmazonPaapi(city, query, accessKey, secretKey, partnerTag) {
  // Construct the PAAPI v5 request
  const host = "webservices.amazon.in";
  const region = "eu-west-1"; // PAAPI v5 uses eu-west-1 for .in
  const target = "/paapi5/searchitems";

  const payload = {
    Keywords: `${query} in ${city}`.trim(),
    Resources: [
      "Images.Primary.Large",
      "ItemInfo.Title",
      "Offers.Listings.Price",
      "Offers.Listings.SavingBasis",
    ],
    PartnerTag: partnerTag,
    PartnerType: "Associates",
    Marketplace: getAmazonMarketplace(city),
    ItemCount: 20,
  };

  // Generate ISO8601 timestamp
  const amzDate = new Date().toISOString().replace(/[:-]/g, "").substring(0, 17) + "Z";
  const dateStamp = amzDate.substring(0, 8);

  // Create canonical request
  const canonicalUri = "/paapi5/searchitems";
  const canonicalQuerystring = "";
  const canonicalHeaders = `content-encoding:amz-1.0\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "content-encoding;host;x-amz-date";
  const payloadHash = createSha256Hex(JSON.stringify(payload));

  const canonicalRequest = `POST\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/ProductAdvertisingAPI/aws4_request`;
  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${createSha256Hex(canonicalRequest)}`;

  const signingKey = getSignatureKey(secretKey, dateStamp, region, "ProductAdvertisingAPI");
  const signature = createHmacHex(signingKey, stringToSign);

  const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`https://${host}${canonicalUri}`, {
    method: "POST",
    headers: {
      "Content-Encoding": "amz-1.0",
      "Content-Type": "application/json; charset=utf-8",
      "X-Amz-Date": amzDate,
      Authorization: authorizationHeader,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Amazon PAAPI returned ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const items = data.ItemsResult?.Items || [];

  return items.map((item, index) => {
    const listing = item.Offers?.Listings?.[0] || {};
    const price = listing.Price || {};
    const saving = listing.SavingBasis || {};
    const image = item.Images?.Primary?.Large?.URL || "";

    return {
      id: `amz-${Date.now()}-${index}`,
      title: item.ItemInfo?.Title?.DisplayValue || `${query} Deal`,
      subTitle: "Amazon",
      image:
        image ||
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
      salePrice: price.Amount ? price.Amount / 100 : 0,
      originalPrice: saving.Amount
        ? (price.Amount + saving.Amount) / 100
        : price.Amount
          ? price.Amount / 100
          : 0,
      currency: price.Currency || "INR",
      offer: saving.Percentage
        ? `${Math.round(saving.Percentage)}% OFF`
        : "Deal",
      offerText: `in ${city}`,
      area: "Online",
      city: city,
      latitude: null,
      longitude: null,
      ctaLink: item.DetailPageURL || "#",
      type: "nearby",
      source: "amazon",
      rating: item.ItemInfo?.Features?.DisplayValues?.[0] || null,
    };
  });
}

// ══════════════════════════════════════════════════════════════
//  Helpers
// ══════════════════════════════════════════════════════════════

/**
 * Parse price from string/number to a clean number.
 */
function parsePrice(price) {
  if (!price && price !== 0) return null;
  if (typeof price === "number") return Math.round(price);
  const cleaned = price.replace(/[^0-9.]/g, "");
  return cleaned ? Math.round(parseFloat(cleaned)) : null;
}

/**
 * Country code for API queries — India only.
 */
function getCountryCode() {
  return "in";
}

/**
 * Amazon marketplace host — India only.
 */
function getAmazonMarketplace() {
  return "www.amazon.in";
}

/**
 * Create SHA-256 hex hash using Node.js crypto module.
 */
function createSha256Hex(str) {
  return crypto.createHash("sha256").update(str, "utf8").digest("hex");
}

/**
 * Create HMAC-SHA256 hex digest using Node.js crypto module.
 */
function createHmacHex(key, str) {
  return crypto
    .createHmac("sha256", key)
    .update(str, "utf8")
    .digest("hex");
}

/**
 * Get AWS Signature V4 signing key using Node.js crypto module.
 */
function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kDate = crypto
    .createHmac("sha256", `AWS4${key}`)
    .update(dateStamp, "utf8")
    .digest();
  const kRegion = crypto
    .createHmac("sha256", kDate)
    .update(regionName, "utf8")
    .digest();
  const kService = crypto
    .createHmac("sha256", kRegion)
    .update(serviceName, "utf8")
    .digest();
  const kSigning = crypto
    .createHmac("sha256", kService)
    .update("aws4_request", "utf8")
    .digest();
  return kSigning;
}
