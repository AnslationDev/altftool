/**
 * Hashtag Set Organizer — pure logic.
 *
 * Cleans a pasted blob of hashtags into one deduplicated, platform-legal set and
 * reports whether that set fits the platform's published caption and hashtag caps.
 * No React, no DOM, no clock reads.
 */

/**
 * Published platform limits.
 * - Instagram: captions cap at 2,200 characters and a post accepts at most 30
 *   hashtags (Instagram Help Center, "Add hashtags to your post").
 * - TikTok: 2,200-character caption limit introduced September 2022; hashtags
 *   share that same field, so they eat the caption budget.
 * - X (Twitter): 280-character post limit on the free tier; hashtags count as
 *   ordinary characters.
 * - LinkedIn: 3,000-character post limit.
 * - YouTube: description holds 5,000 characters and YouTube ignores ALL hashtags
 *   on a video once more than 15 are used (YouTube Help, "Use hashtags").
 * - Facebook: 63,206-character post limit.
 *
 * `recommended` is a planning band, not a platform rule — it is flagged as advice
 * in the UI, never as a hard limit.
 */
export const PLATFORM_RULES = {
  instagram: {
    label: "Instagram",
    maxChars: 2200,
    maxHashtags: 30,
    recommended: [3, 5],
    overflowNote: "Instagram rejects the post once it passes 30 hashtags.",
  },
  tiktok: {
    label: "TikTok",
    maxChars: 2200,
    maxHashtags: 30,
    recommended: [3, 6],
    overflowNote: "Hashtags share the 2,200-character caption field with your text.",
  },
  x: {
    label: "X (Twitter)",
    maxChars: 280,
    maxHashtags: 280, // no separate cap; the character limit binds first
    recommended: [1, 2],
    overflowNote: "There is no hashtag cap on X — the 280-character post limit binds first.",
  },
  linkedin: {
    label: "LinkedIn",
    maxChars: 3000,
    maxHashtags: 3000,
    recommended: [3, 5],
    overflowNote: "No hashtag cap; the 3,000-character post limit binds first.",
  },
  youtube: {
    label: "YouTube",
    maxChars: 5000,
    maxHashtags: 15,
    recommended: [3, 5],
    overflowNote: "YouTube ignores every hashtag on the video once you use more than 15.",
  },
  facebook: {
    label: "Facebook",
    maxChars: 63206,
    maxHashtags: 63206,
    recommended: [1, 3],
    overflowNote: "No hashtag cap; the 63,206-character post limit binds first.",
  },
};

/** Characters a hashtag may contain: unicode letters, digits and underscore. */
const VALID_TAG_BODY = /^[\p{L}\p{N}_]+$/u;

/** A hashtag made only of digits does not become a link on Instagram or X. */
const ALL_DIGITS = /^\p{N}+$/u;

/** Longest tag this tool will accept; beyond this a tag is almost certainly a paste error. */
export const MAX_TAG_LENGTH = 100;

/** Separators people paste between hashtags: whitespace, commas, semicolons, pipes, slashes. */
const SPLIT_PATTERN = /[\s,;|/\\]+/u;

/**
 * Clean one raw token into a hashtag.
 * @returns {{ raw: string, tag: string|null, valid: boolean, reason: string|null }}
 */
export function normalizeHashtag(raw) {
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") {
    return { raw: trimmed, tag: null, valid: false, reason: "Empty entry" };
  }
  const body = trimmed.replace(/^#+/u, "");
  if (body === "") {
    return { raw: trimmed, tag: null, valid: false, reason: "Just a # with no word after it" };
  }
  if (body.length > MAX_TAG_LENGTH) {
    return {
      raw: trimmed,
      tag: null,
      valid: false,
      reason: `Longer than ${MAX_TAG_LENGTH} characters`,
    };
  }
  if (!VALID_TAG_BODY.test(body)) {
    return {
      raw: trimmed,
      tag: null,
      valid: false,
      reason: "Contains a character that ends a hashtag (space, punctuation or emoji)",
    };
  }
  if (ALL_DIGITS.test(body)) {
    return {
      raw: trimmed,
      tag: null,
      valid: false,
      reason: "Numbers only — this never becomes a clickable hashtag",
    };
  }
  return { raw: trimmed, tag: `#${body}`, valid: true, reason: null };
}

/**
 * Split a pasted blob into normalized hashtags, keeping first-seen order.
 * Duplicate detection is case-insensitive because hashtags are case-insensitive.
 */
export function parseHashtags(input) {
  const tokens = String(input ?? "")
    .split(SPLIT_PATTERN)
    .filter((token) => token.trim() !== "");

  const tags = [];
  const seen = new Map();
  const duplicates = [];
  const invalid = [];

  for (const token of tokens) {
    const result = normalizeHashtag(token);
    if (!result.valid) {
      invalid.push({ raw: result.raw, reason: result.reason });
      continue;
    }
    const key = result.tag.toLowerCase();
    if (seen.has(key)) {
      seen.set(key, seen.get(key) + 1);
      duplicates.push(result.tag);
      continue;
    }
    seen.set(key, 1);
    tags.push(result.tag);
  }

  return { tags, duplicates, invalid, tokenCount: tokens.length };
}

/** Characters a block of hashtags occupies when joined with single spaces. */
export function hashtagBlockLength(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return 0;
  const letters = tags.reduce((total, tag) => total + tag.length, 0);
  return letters + (tags.length - 1); // one space between each pair
}

/** Sort helpers used by the UI. Pure — they never mutate the input array. */
export const SORT_MODES = {
  original: { label: "Paste order", compare: null },
  alpha: { label: "A → Z", compare: (a, b) => a.localeCompare(b, "en") },
  shortest: { label: "Shortest first", compare: (a, b) => a.length - b.length || a.localeCompare(b, "en") },
  longest: { label: "Longest first", compare: (a, b) => b.length - a.length || a.localeCompare(b, "en") },
};

export function sortHashtags(tags, mode) {
  const config = SORT_MODES[mode];
  if (!config || !config.compare) return [...tags];
  return [...tags].sort(config.compare);
}

/**
 * Analyse a pasted hashtag blob against one platform.
 *
 * @param {{ input: string, platform: string, caption?: string, sort?: string }} params
 * @returns {{ error: string }|object}
 */
export function analyzeHashtagSet({ input, platform, caption = "", sort = "original" }) {
  const rules = PLATFORM_RULES[platform];
  if (!rules) {
    return { error: "Pick one of the supported platforms." };
  }

  const parsed = parseHashtags(input);
  if (parsed.tokenCount === 0) {
    return { error: "Paste or type at least one hashtag to organise." };
  }
  if (parsed.tags.length === 0) {
    return { error: "None of those entries can become a hashtag — check the flagged reasons." };
  }

  const ordered = sortHashtags(parsed.tags, sort);
  const captionText = String(caption ?? "");
  const captionChars = captionText.length;

  const hashtagChars = hashtagBlockLength(ordered);
  // A blank line separates caption from hashtag block when both are present.
  const separatorChars = captionChars > 0 ? 2 : 0;
  const totalChars = captionChars + separatorChars + hashtagChars;

  const charsRemaining = rules.maxChars - totalChars;
  const hashtagsRemaining = rules.maxHashtags - ordered.length;

  // How many of the tags actually fit, trimming from the end, if the set overflows.
  let fittingCount = ordered.length;
  if (hashtagsRemaining < 0) fittingCount = rules.maxHashtags;
  while (
    fittingCount > 0 &&
    captionChars + (fittingCount > 0 ? separatorChars : 0) + hashtagBlockLength(ordered.slice(0, fittingCount)) >
      rules.maxChars
  ) {
    fittingCount -= 1;
  }

  const overLimit = ordered.length - fittingCount;
  const [recMin, recMax] = rules.recommended;

  return {
    platform,
    platformLabel: rules.label,
    tags: ordered,
    block: ordered.join(" "),
    count: ordered.length,
    duplicatesRemoved: parsed.duplicates.length,
    duplicates: parsed.duplicates,
    invalid: parsed.invalid,
    hashtagChars,
    captionChars,
    totalChars,
    maxChars: rules.maxChars,
    maxHashtags: rules.maxHashtags,
    charsRemaining,
    hashtagsRemaining,
    fittingCount,
    overLimit,
    fits: overLimit === 0 && charsRemaining >= 0,
    withinRecommended: ordered.length >= recMin && ordered.length <= recMax,
    recommendedMin: recMin,
    recommendedMax: recMax,
    overflowNote: rules.overflowNote,
    averageTagLength: Math.round((hashtagChars / ordered.length) * 10) / 10,
  };
}

/**
 * Split the cleaned set into rotation sets so the same block is not reposted
 * every time. Tags are dealt round-robin so each set gets a mix, not a slice.
 */
export function buildRotationSets(tags, { setCount = 3 } = {}) {
  if (!Array.isArray(tags) || tags.length === 0) {
    return { error: "There are no hashtags to split into sets." };
  }
  const count = Math.floor(Number(setCount));
  if (!Number.isFinite(count) || count < 1) {
    return { error: "Number of rotation sets must be 1 or more." };
  }
  if (count > tags.length) {
    return {
      error: `Only ${tags.length} hashtag${tags.length === 1 ? "" : "s"} available — ask for ${tags.length} set${
        tags.length === 1 ? "" : "s"
      } or fewer.`,
    };
  }

  const sets = Array.from({ length: count }, () => []);
  tags.forEach((tag, index) => {
    sets[index % count].push(tag);
  });

  return {
    sets: sets.map((setTags, index) => ({
      name: `Set ${index + 1}`,
      tags: setTags,
      block: setTags.join(" "),
      count: setTags.length,
      chars: hashtagBlockLength(setTags),
    })),
  };
}

/** Fit check for every supported platform, for the comparison table. */
export function compareAcrossPlatforms(tags, caption = "") {
  if (!Array.isArray(tags) || tags.length === 0) return [];
  const captionChars = String(caption ?? "").length;
  const separatorChars = captionChars > 0 ? 2 : 0;
  const hashtagChars = hashtagBlockLength(tags);
  const totalChars = captionChars + separatorChars + hashtagChars;

  return Object.entries(PLATFORM_RULES).map(([key, rules]) => ({
    key,
    label: rules.label,
    // Platforms without a published hashtag cap store maxHashtags === maxChars.
    hasHashtagCap: rules.maxHashtags !== rules.maxChars,
    maxHashtags: rules.maxHashtags,
    maxChars: rules.maxChars,
    hashtagsOver: Math.max(0, tags.length - rules.maxHashtags),
    charsOver: Math.max(0, totalChars - rules.maxChars),
    fits: tags.length <= rules.maxHashtags && totalChars <= rules.maxChars,
  }));
}
