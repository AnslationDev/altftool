// Derives the "static JSON" facets (categories, brands, price ranges,
// discount ranges, filters) from the live enriched product list, each with a
// live count so the filter sidebar can show "(N)" next to every option.

export const PRICE_RANGE_DEFS = [
  { key: "under-1000", label: "Under ₹1,000" },
  { key: "1000-3000", label: "₹1,000 – ₹3,000" },
  { key: "3000-5000", label: "₹3,000 – ₹5,000" },
  { key: "5000-plus", label: "₹5,000+" },
];

export const DISCOUNT_BUCKET_DEFS = [90, 80, 70, 60, 50];

export function buildCategories(products) {
  const counts = new Map();
  for (const p of products) {
    const key = p.category;
    const entry = counts.get(key) || { key, label: p.categoryLabel, count: 0 };
    entry.count += 1;
    counts.set(key, entry);
  }
  return Array.from(counts.values()).sort((a, b) => b.count - a.count);
}

export function buildBrands(products) {
  const counts = new Map();
  for (const p of products) {
    if (!p.brand) continue;
    const entry = counts.get(p.brand) || { key: p.brand, label: p.brand, count: 0 };
    entry.count += 1;
    counts.set(p.brand, entry);
  }
  return Array.from(counts.values()).sort((a, b) => b.count - a.count);
}

export function buildPriceRanges(products) {
  return PRICE_RANGE_DEFS.map((def) => ({
    ...def,
    count: products.filter((p) => p.priceRange === def.key).length,
  }));
}

export function buildDiscountRanges(products) {
  return DISCOUNT_BUCKET_DEFS.map((min) => ({
    key: String(min),
    min,
    label: `${min}% or more`,
    count: products.filter((p) => p.discountPercent >= min).length,
  }));
}
