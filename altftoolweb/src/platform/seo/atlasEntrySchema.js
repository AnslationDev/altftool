/**
 * Describe an Atlas detail route without claiming that AltFTool publishes,
 * sells or reviews the third-party application itself.
 *
 * `pageUrl` is the canonical AltFTool detail URL. A live entry's `url` stays on
 * the nested WebSite because it is the external destination being described.
 * Retired entries deliberately omit that external URL: the catalog does not
 * keep linking to a dead or repurposed host.
 */
export function createAtlasEntryJsonLd({
  entry,
  category,
  pageUrl,
  atlasUrl,
} = {}) {
  if (!entry?.name || !pageUrl || !atlasUrl) return null;

  const liveExternalUrl = entry.status === "live" ? entry.url : null;
  const about = {
    "@type": "WebSite",
    name: entry.name,
    description: entry.tagline,
    ...(category?.name ? { genre: category.name } : {}),
    ...(entry.tags?.length ? { keywords: entry.tags.join(", ") } : {}),
    ...(liveExternalUrl
      ? {
          url: liveExternalUrl,
          // Every live Atlas entry has an open, account or freemium access
          // level. All three provide a usable path without payment.
          isAccessibleForFree: true,
        }
      : {}),
  };

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: entry.name,
    description: entry.tagline,
    inLanguage: "en",
    ...(entry.checked ? { dateModified: entry.checked } : {}),
    isPartOf: {
      "@type": "CollectionPage",
      "@id": `${atlasUrl}#collection`,
    },
    about,
  };
}
