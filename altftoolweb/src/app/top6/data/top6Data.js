/**
 * Top6's categories, derived from the same PRODUCT_REGISTRY that powers
 * /top10. Nothing is invented here and nothing mock is imported: every
 * row starts life as one of a product's `fallbackItems`, which are real
 * snapshots of what that provider's API returned, run through that
 * product's own `mapItemToCard`.
 *
 * The snapshots are what the server renders, so /top6 ships its full
 * content in the HTML even when every client fetch fails; lib/latestData
 * swaps in live rows through this same `buildCategory` once they land.
 *
 * Two rules, both about never publishing something we cannot show:
 *  - items with no image are dropped before the slice to six, so an
 *    image-less row never displaces a photographed one (Foursquare
 *    places in particular frequently has no photo);
 *  - a category that cannot fill six photographed rows is dropped
 *    outright rather than shipped short.
 *
 * Order inside a category is the provider's own ordering. Nothing on
 * this site scores these and nothing collects a visitor vote, so the
 * numbers are positions in the provider's list, not a verdict.
 */
import { PRODUCT_REGISTRY } from "../../top10/data/productRegistry.js";
import { UNIVERSES, UNIVERSE_PRODUCT_KEYS } from "../../top10/data/top10Data.js";

export const ITEMS_PER_CATEGORY = 6;

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

/**
 * Shapes one product's raw provider cards into the six-row Top6 shape.
 * Returns null when the product cannot fill all six with photographed
 * items — the caller drops it rather than rendering a short list.
 */
export function buildCategory(product, cards = []) {
  const items = cards
    .filter((item) => item && item.image && item.title)
    .slice(0, ITEMS_PER_CATEGORY)
    .map((item, index) => ({
      rank: index + 1,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      image: item.image,
      rating: item.rating,
      url: item.url,
    }));

  if (items.length < ITEMS_PER_CATEGORY) return null;

  return {
    id: product.key,
    label: product.title,
    tag: UNIVERSE_TITLE_BY_KEY[product.key] || "Discover",
    description: product.previewHeadline,
    icon: product.icon,
    sectionId: product.sectionId,
    items,
  };
}

/** The server-rendered categories: provider snapshots, six photographed rows each. */
export const CATEGORIES = PRODUCT_REGISTRY.map((product) =>
  buildCategory(
    product,
    (product.fallbackItems || []).map((item) => product.mapItemToCard(item)),
  ),
).filter(Boolean);
