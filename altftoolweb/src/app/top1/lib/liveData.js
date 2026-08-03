import { PRODUCT_REGISTRY } from "../../top10/data/productRegistry.js";
import { buildPick } from "../data/top1Data.js";

/**
 * Top1's live data. No new backend: every call goes to an /api/top10/*
 * endpoint the product's own registry entry already declares, so this
 * file never needs to know which provider sits behind which category.
 *
 * A product whose provider fails resolves to null and is dropped, and
 * the caller keeps showing that category's snapshot card instead.
 */
async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function fetchLeadItems(product) {
  if (!product.categoriesEndpoint || !product.itemsEndpointForCategory) return [];

  const categoryData = await fetchJson(product.categoriesEndpoint);
  const categories =
    categoryData[product.categoriesResponseKey] || categoryData.categories || [];
  const first = categories[0];
  if (!first) return [];

  const itemsData = await fetchJson(product.itemsEndpointForCategory(first.id, 1));
  return itemsData[product.itemsResponseKey] || itemsData.items || [];
}

/** Every category's current lead card, fetched in parallel. */
export async function fetchLeadPicks() {
  const results = await Promise.all(
    PRODUCT_REGISTRY.map(async (product) => {
      try {
        const raw = await fetchLeadItems(product);
        return buildPick(
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
