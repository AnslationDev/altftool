/**
 * Canonical URL key for an Exclusive Deals brand.
 *
 * The brand routes are keyed by the slugified brand NAME, not by the numeric
 * db.json id. Every internal link already builds URLs that way — see
 * (componnets)/Online.jsx, (componnets)/TopStore.jsx and
 * all-stores/PageView.jsx — and the page content resolves the last path
 * segment by matching slugified names against the Firebase brand feed
 * ([slug]/[id]/(components)/BrandDetail.jsx).
 *
 * The sitemap previously emitted `brand.id`, producing URLs like
 * /exclusivedeals/most-popular/1 that no link points at and that BrandDetail
 * can never resolve — they render a permanent "preparing this route" skeleton,
 * i.e. a soft 404 served with HTTP 200. Verified on production before the fix:
 * /exclusivedeals/most-popular/1 never rendered, /…/samsung rendered offers.
 *
 * This must stay byte-compatible with the inline slugify copies in those
 * components; changing one without the others would break the routes again.
 */
export function brandSlug(value) {
  return value
    ?.toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Find a brand in a db.json category by whatever the URL segment holds.
 * Slug is canonical; the numeric id is still accepted so any link or bookmark
 * created while the sitemap advertised ids keeps resolving instead of 404ing.
 */
export function findBrandByUrlKey(category, urlKey) {
  if (!category?.brands?.length || !urlKey) return undefined;
  const key = String(urlKey);
  const slug = brandSlug(key);
  return category.brands.find(
    (brand) =>
      brandSlug(brand.brandName || brand.name) === slug ||
      String(brand.id) === key,
  );
}
