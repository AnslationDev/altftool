/**
 * Top1 shows exactly one entry per category: the first item that
 * category's data source lists.
 *
 * Same registry, same mappers, same snapshots as /top10 and /top6 — the
 * only thing this file adds is the slice to one. A product whose
 * snapshot has no photographed item is dropped rather than rendered as
 * an empty card, which is why Places (Foursquare regularly returns no
 * photo) and Cryptocurrency (no snapshot at all) do not appear.
 *
 * "First" is the provider's own ordering. Nothing here scores or ranks
 * anything, so no card claims to be the best of its category.
 */
import { PRODUCT_REGISTRY } from "../../top10/data/productRegistry.js";
import { UNIVERSES, UNIVERSE_PRODUCT_KEYS } from "../../top10/data/top10Data.js";

const UNIVERSE_TITLE_BY_KEY = Object.entries(UNIVERSE_PRODUCT_KEYS).reduce(
  (map, [universeId, keys]) => {
    const universe = UNIVERSES.find((entry) => entry.id === universeId);
    keys.forEach((key) => {
      map[key] = universe?.title || "Discover";
    });
    return map;
  },
  {},
);

/** Shapes a product plus its lead card into one Top1 pick, or null when there is none. */
export function buildPick(product, cards = []) {
  const lead = cards.find((item) => item && item.image && item.title);
  if (!lead) return null;

  return {
    key: product.key,
    label: product.title,
    tag: UNIVERSE_TITLE_BY_KEY[product.key] || "Discover",
    icon: product.icon,
    sectionId: product.sectionId,
    item: {
      title: lead.title,
      subtitle: lead.subtitle,
      description: lead.description,
      image: lead.image,
      rating: lead.rating,
      url: lead.url,
    },
  };
}

/** The server-rendered picks: provider snapshots, one card each. */
export const TOP_PICKS = PRODUCT_REGISTRY.map((product) =>
  buildPick(
    product,
    (product.fallbackItems || []).map((item) => product.mapItemToCard(item)),
  ),
).filter(Boolean);
