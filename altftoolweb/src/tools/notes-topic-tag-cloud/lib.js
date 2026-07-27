/**
 * Topic tag cloud for study notes.
 *
 * Method: classic term-frequency keyword extraction — tokenise, drop English
 * stopwords and short tokens, count occurrences, then bucket each surviving
 * term into one of five size tiers by linear scaling between the minimum and
 * maximum counts (the standard tag-cloud weighting described by
 * linear normalisation: tier = 1 + round((count - min) / (max - min) * (TIERS - 1))).
 */

/** Number of visual size tiers in the cloud. Five is the conventional tag-cloud depth. */
export const TIER_COUNT = 5;

/** Sensible bounds for the controls. */
export const DEFAULT_MAX_TAGS = 40;
export const MAX_TAGS_LIMIT = 100;
export const DEFAULT_MIN_WORD_LENGTH = 3;
export const DEFAULT_MIN_COUNT = 1;

/**
 * Standard English stopword list (function words that carry no topic signal),
 * based on the common Snowball/NLTK core set, trimmed to words that actually
 * occur in study notes.
 */
export const STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "also", "am", "an", "and",
  "any", "are", "as", "at", "be", "because", "been", "before", "being", "below",
  "between", "both", "but", "by", "can", "cannot", "could", "did", "do", "does",
  "doing", "down", "during", "each", "etc", "few", "for", "from", "further", "had",
  "has", "have", "having", "he", "her", "here", "hers", "him", "his", "how", "i",
  "if", "in", "into", "is", "it", "its", "itself", "just", "like", "made", "make",
  "many", "may", "me", "more", "most", "much", "must", "my", "no", "nor", "not",
  "now", "of", "off", "on", "once", "one", "only", "or", "other", "our", "out",
  "over", "own", "per", "same", "she", "should", "so", "some", "such", "than",
  "that", "the", "their", "them", "then", "there", "these", "they", "this", "those",
  "through", "to", "too", "under", "until", "up", "upon", "us", "used", "using",
  "very", "was", "we", "were", "what", "when", "where", "which", "while", "who",
  "whom", "why", "will", "with", "would", "you", "your", "also", "e", "g", "ie", "eg",
]);

/** Lowercase, strip everything except letters, digits and hyphens, split on whitespace. */
export function tokenize(text) {
  if (typeof text !== "string") return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9À-ɏऀ-ॿ-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => token.replace(/^-+|-+$/g, ""))
    .filter(Boolean);
}

/**
 * Analyse notes into a weighted topic list.
 * @param {object} input
 * @param {string} input.text            The raw notes text.
 * @param {number} [input.maxTags]       Maximum tags to return (1..MAX_TAGS_LIMIT).
 * @param {number} [input.minWordLength] Ignore tokens shorter than this (>=1).
 * @param {number} [input.minCount]      Ignore terms occurring fewer times than this (>=1).
 * @returns {object} { tags, totalWords, uniqueTerms, dominant, thin } or { error }
 */
export function analyzeTopics({
  text,
  maxTags = DEFAULT_MAX_TAGS,
  minWordLength = DEFAULT_MIN_WORD_LENGTH,
  minCount = DEFAULT_MIN_COUNT,
}) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Paste some notes first — the cloud needs text to analyse." };
  }
  const limit = Number(maxTags);
  const minLen = Number(minWordLength);
  const floor = Number(minCount);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_TAGS_LIMIT) {
    return { error: `Max tags must be a whole number between 1 and ${MAX_TAGS_LIMIT}.` };
  }
  if (!Number.isInteger(minLen) || minLen < 1) {
    return { error: "Minimum word length must be a whole number of at least 1." };
  }
  if (!Number.isInteger(floor) || floor < 1) {
    return { error: "Minimum count must be a whole number of at least 1." };
  }

  const tokens = tokenize(text);
  const totalWords = tokens.length;

  const counts = new Map();
  for (const token of tokens) {
    if (token.length < minLen) continue;
    if (STOPWORDS.has(token)) continue;
    if (/^\d+$/.test(token)) continue; // bare numbers are page refs, not topics
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  const sorted = [...counts.entries()]
    .filter(([, count]) => count >= floor)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);

  if (sorted.length === 0) {
    return { error: "No topic words survived the filters — lower the minimum count or word length." };
  }

  const maxCount = sorted[0][1];
  const minSeen = sorted[sorted.length - 1][1];
  const span = maxCount - minSeen;

  const tags = sorted.map(([term, count]) => ({
    term,
    count,
    share: totalWords > 0 ? count / totalWords : 0,
    // Linear tag-cloud scaling into TIER_COUNT buckets; all-equal counts sit mid-tier.
    tier:
      span === 0
        ? Math.ceil(TIER_COUNT / 2)
        : 1 + Math.round(((count - minSeen) / span) * (TIER_COUNT - 1)),
  }));

  // Dominant = top tier occupants; thin = terms at the minimum observed count.
  const topTier = Math.max(...tags.map((tag) => tag.tier));
  const dominant = tags.filter((tag) => tag.tier === topTier).map((tag) => tag.term);
  const thin = tags.filter((tag) => tag.count === minSeen).map((tag) => tag.term);

  return {
    tags,
    totalWords,
    uniqueTerms: counts.size,
    shownTerms: tags.length,
    dominant,
    thin,
  };
}
