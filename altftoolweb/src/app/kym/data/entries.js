/**
 * The /kym catalog, flattened into the 37 routes the section serves.
 *
 * This lived in ../components/KymGenericPage.jsx, which meant every consumer —
 * including src/app/sitemap.js and any check of the section's titles and
 * descriptions — had to parse JSX to read a plain array. Keeping the records
 * in a data module lets entryMeta.test.mjs assert the metadata invariants
 * against the real catalog instead of a re-typed copy of it.
 *
 * KymGenericPage.jsx re-exports all three names, so existing importers are
 * unchanged.
 */
import {
  editorials,
  episodes,
  explainers,
  freshEntries,
  latest,
  spotlightCards,
  topEntries,
  topMemes,
  // Extensions are explicit so plain `node --test` can resolve this module.
} from "./kymData.js";
import { slugifyTitle } from "./slug.js";

// No `meta` field on any of these. Cards used to carry hardcoded strings such
// as "Recently updated", "Trending entry" and "Updated 12 hours ago" that never
// changed, advertising freshness and traction that were never measured.
export const contentGroups = [
  ...spotlightCards,
  ...freshEntries,
  ...explainers.map((item) => ({ ...item, category: "Explainer" })),
  ...episodes.map((item) => ({ ...item, category: "Episode" })),
  ...editorials,
  ...latest,
  ...topEntries.map((item) => ({ ...item, category: "Entry" })),
  ...topMemes.map((item) => ({ ...item, category: "Meme" })),
];

export function getAllKymRoutes() {
  return [...new Set(contentGroups.map((item) => item.href || `/kym/${slugifyTitle(item.title)}`))];
}

export function findKymItem(slug) {
  const path = `/kym/${slug}`;
  return contentGroups.find(
    (item) => item.href === path || slugifyTitle(item.title) === slug,
  );
}
