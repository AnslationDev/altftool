export const CURATED_RELATED_TOOL_SLUGS = Object.freeze({
  "tracking-link-decoder": ["utm-link-builder"],
  "url-tracking-parameter-stripper": ["utm-link-builder"],
  "utm-link-builder": [
    "tracking-link-decoder",
    "url-tracking-parameter-stripper",
  ],
});

export function mergeCuratedRelatedTools(
  slug,
  scoredRelatedTools,
  limit = 6,
  getName = (relatedSlug) => relatedSlug,
) {
  const normalizedLimit = Math.max(0, Math.floor(Number(limit) || 0));
  const curated = (CURATED_RELATED_TOOL_SLUGS[slug] || []).map(
    (relatedSlug) => ({
      slug: relatedSlug,
      name: getName(relatedSlug),
    }),
  );
  const seen = new Set([slug]);

  return [...curated, ...scoredRelatedTools]
    .filter((item) => {
      if (!item?.slug || seen.has(item.slug)) return false;
      seen.add(item.slug);
      return true;
    })
    .slice(0, normalizedLimit);
}
