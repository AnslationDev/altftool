import { PRODUCT_REGISTRY } from "../../top10/data/productRegistry.js";
import { buildCategory } from "../data/top6Data.js";

/**
 * Top6's live data. It adds no backend: every request below goes to an
 * /api/top10/* endpoint the product's own registry entry already
 * declares, so a product that gains or loses a provider needs no change
 * here. Only the items go live — label, tag, description and icon stay
 * with the static shell (a lucide icon cannot travel over JSON).
 *
 * A product whose provider fails simply drops out of the returned list;
 * the caller keeps showing that category's snapshot rows instead.
 */
async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

/** Fetches a product's first real category, then that category's top items. */
async function fetchLatestItems(product) {
  if (!product.categoriesEndpoint || !product.itemsEndpointForCategory) return [];

  const categoryData = await fetchJson(product.categoriesEndpoint);
  const categories =
    categoryData[product.categoriesResponseKey] || categoryData.categories || [];
  const first = categories[0];
  if (!first) return [];

  const itemsData = await fetchJson(product.itemsEndpointForCategory(first.id, 1));
  return itemsData[product.itemsResponseKey] || itemsData.items || [];
}

/** Every product's latest six, fetched in parallel. Failures resolve to null and are dropped. */
export async function fetchLatestCategories() {
  const results = await Promise.all(
    PRODUCT_REGISTRY.map(async (product) => {
      try {
        const raw = await fetchLatestItems(product);
        return buildCategory(
          product,
          raw.map((item) => product.mapItemToCard(item)),
        );
      } catch {
        return null;
      }
    }),
  );

  return results.filter(Boolean);
}
