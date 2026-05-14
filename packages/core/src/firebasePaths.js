export const ALTFT_PROJECT_ID = "altftool";

export const ALTFT_PROJECT_ROOT = ["projects", ALTFT_PROJECT_ID];
export const ALTFT_BLOGS_COLLECTION_PATH = [...ALTFT_PROJECT_ROOT, "blogs"];
export const ALTFT_EXTENSIONS_COLLECTION_PATH = [...ALTFT_PROJECT_ROOT, "extensions"];
export const ALTFT_ACADEMY_COLLECTION_PATH = [...ALTFT_PROJECT_ROOT, "academy"];
export const ALTFT_TRENDING_VIDEOS_COLLECTION_PATH = [...ALTFT_PROJECT_ROOT, "trendingvideos"];
export const ALTFT_CONSUMER_RATING_ROOT = [...ALTFT_PROJECT_ROOT, "consumerrating", "data"];
export const ALTFT_BUYSMART_ROOT = [...ALTFT_PROJECT_ROOT, "buySmart"];

export const BUYSMART_DOC_IDS = Object.freeze({
  analytics: "analytics",
  categories: "categories",
  featureBrand: "featurebrand",
  hero: "hero",
  ruleSet: "ruleSet",
  store: "store",
  trending: "trending",
});

export function buySmartDocPath(docId) {
  const normalizedDocId = BUYSMART_DOC_IDS[docId] || docId;
  return [...ALTFT_BUYSMART_ROOT, normalizedDocId];
}

export function altfToolCollectionPath(collectionId) {
  return [...ALTFT_PROJECT_ROOT, collectionId];
}
