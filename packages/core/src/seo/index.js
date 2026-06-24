// @altftool/core/seo — public surface for the ALTF Engine SEO config layer.
export {
  resolveSeo,
  applyResolvedSeo,
  resolveCrawl,
  resolveSitemap,
  resolveRedirect,
  resolveContent,
  globToRegExp,
} from "./resolver.js";

export { analyzeSeoHealth } from "./health.js";

export {
  buildRecommendationPrompt,
  parseRecommendation,
  heuristicRecommendation,
  normalizeSuggestion,
} from "./recommendations.js";

export {
  normalizeSearchText,
  buildPageIndexEntry,
  computePageHealth,
  searchPages,
  summarizeRegistry,
  PAGE_HEALTH_FLAGS,
} from "./registry.js";

export {
  validateSeoConfig,
  normalizeSeoEntry,
  emptySeoConfig,
  SEO_RUNTIME_DOC_PATH,
  SEO_RUNTIME_COLLECTION,
  SEO_RUNTIME_DOC_ID,
  PAGE_TYPES,
  CHANGE_FREQS,
} from "./schemas.js";
