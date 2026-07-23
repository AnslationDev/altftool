import { withComputedDistance } from "./normalize.js";

function normalizeTitleKey(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Build a dedupe key for a Deal: prefer an exact URL match, otherwise fall
 * back to a normalized "title + store" fingerprint so the same product
 * listed by two sources doesn't appear twice.
 * @param {import("./types.js").Deal} deal
 */
function dedupeKey(deal) {
  if (deal.url && deal.url !== "#") return `url:${deal.url}`;
  return `fp:${normalizeTitleKey(deal.title)}|${normalizeTitleKey(deal.store)}`;
}

/**
 * Relevance score used to rank merged deals — higher is better.
 * Rewards discounts, ratings, proximity, and live pricing; penalizes
 * missing data so incomplete records sink to the bottom instead of
 * crowding out solid results.
 * @param {import("./types.js").Deal} deal
 */
function relevanceScore(deal) {
  let score = 0;

  if (deal.discount) score += Math.min(50, deal.discount);
  if (deal.rating) score += deal.rating * 6;
  if (deal.price != null) score += 10;
  if (deal.distance != null) score += Math.max(0, 20 - deal.distance);
  if (deal.offerType === "coupon" || deal.offerType === "deal") score += 5;

  return score;
}

/**
 * Merge deals from OpenStreetMap, SerpAPI, RapidAPI, and affiliate providers
 * into one deduplicated, relevance-sorted list.
 *
 * @param {{
 *   places?: import("./types.js").Deal[],
 *   serpApiDeals?: import("./types.js").Deal[],
 *   rapidApiDeals?: import("./types.js").Deal[],
 *   affiliateDeals?: import("./types.js").Deal[],
 *   refCoords?: { lat: number, lng: number } | null,
 * }} sources
 * @returns {import("./types.js").Deal[]}
 */
export function mergeDeals({
  places = [],
  serpApiDeals = [],
  rapidApiDeals = [],
  affiliateDeals = [],
  refCoords = null,
} = {}) {
  const allDeals = [...places, ...serpApiDeals, ...rapidApiDeals, ...affiliateDeals].map((deal) =>
    withComputedDistance(deal, refCoords),
  );

  const dedupedByKey = new Map();

  for (const deal of allDeals) {
    const key = dedupeKey(deal);
    const existing = dedupedByKey.get(key);

    if (!existing || relevanceScore(deal) > relevanceScore(existing)) {
      dedupedByKey.set(key, deal);
    }
  }

  return [...dedupedByKey.values()].sort((a, b) => relevanceScore(b) - relevanceScore(a));
}
