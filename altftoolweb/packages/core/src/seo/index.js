// @altftool/core/seo — public surface for the ALTF Engine SEO config layer.
export {
  resolveSeo,
  applyResolvedSeo,
  resolveCrawl,
  resolveSitemap,
  resolveRedirect,
  resolveContent,
  resolveExtendedMeta,
  resolveInjectedCode,
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
  normalizeOg,
  normalizeTwitter,
  normalizeVerification,
  normalizeHreflang,
  normalizeSchemaList,
  normalizeCodeBlock,
  emptySeoConfig,
  SEO_RUNTIME_DOC_PATH,
  SEO_RUNTIME_COLLECTION,
  SEO_RUNTIME_DOC_ID,
  PAGE_TYPES,
  CHANGE_FREQS,
  TWITTER_CARD_TYPES,
} from "./schemas.js";
