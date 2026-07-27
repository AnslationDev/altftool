/**
 * Title + thumbnail-text pairing rules for video platforms.
 *
 * Two things are measured here:
 *   1. Title length against the platform field limit and the point at which a
 *      listing truncates it.
 *   2. How much of the thumbnail's wording is already carried by the title -
 *      duplicated words spend the viewer's attention twice on one idea.
 *
 * Pure functions only: no DOM, no React, no Date.now().
 */

/** YouTube's video title field accepts a maximum of 100 characters. */
export const TITLE_MAX_CHARS = 100;

/**
 * Roughly where a title stops being fully visible in a listing. Desktop search
 * results and the suggested-video rail clip long titles with an ellipsis at
 * around 60 characters; mobile home wraps to two lines nearer 70. 60 is the
 * conservative default and is editable.
 */
export const TITLE_TRUNCATION_CHARS = 60;

/** Standard thumbnail upload canvas: 1280 x 720 (16:9), the size YouTube recommends. */
export const THUMBNAIL_CANVAS_WIDTH = 1280;
export const THUMBNAIL_CANVAS_HEIGHT = 720;

/**
 * The smallest place a thumbnail is normally shown on a desktop layout is the
 * search-result row, about 210 CSS pixels wide. Anything that must be read at a
 * glance has to survive that reduction.
 */
export const SMALLEST_DISPLAY_WIDTH = 210;

/**
 * Below roughly 10 CSS pixels, bold display text stops being readable at a
 * glance on a typical screen. Combined with the 210px display width this is
 * where the familiar "make thumbnail text at least 60px" guidance comes from:
 * 10 x 1280 / 210 = 61px on the 1280-wide canvas.
 */
export const MIN_ONSCREEN_TEXT_PX = 10;

/** Thumbnail text works best as a short phrase, not a sentence. */
export const THUMBNAIL_WORD_MAX = 5;

/**
 * Function words are ignored when comparing title and thumbnail, because
 * sharing "the" is not redundancy.
 */
export const STOPWORDS = Object.freeze(
  new Set([
    "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from", "how",
    "i", "in", "into", "is", "it", "its", "my", "of", "on", "or", "our", "so",
    "than", "that", "the", "then", "this", "to", "was", "we", "were", "what",
    "when", "why", "will", "with", "you", "your",
  ]),
);

/**
 * Reduce text to comparable tokens: lowercase, punctuation removed, digits kept
 * (a number like 200 is a real content word), simple plural folded so "tips"
 * and "tip" count as the same idea.
 */
export function normalizeWords(text) {
  if (typeof text !== "string") return [];
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => (word.length > 3 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word));
}

/** Content words only - stopwords stripped, duplicates collapsed, order kept. */
export function contentWords(text) {
  const seen = new Set();
  const out = [];
  for (const word of normalizeWords(text)) {
    if (STOPWORDS.has(word)) continue;
    if (seen.has(word)) continue;
    seen.add(word);
    out.push(word);
  }
  return out;
}

/** Take the first n characters by code point, so emoji are not split. */
export function takeCharacters(text, n) {
  if (typeof text !== "string" || !(n > 0)) return "";
  return Array.from(text).slice(0, Math.floor(n)).join("");
}

/**
 * The on-screen size of thumbnail text once the thumbnail is scaled down to a
 * given display width.
 */
export function onScreenTextSize(fontSizePx, canvasWidth, displayWidth) {
  if (!(canvasWidth > 0)) return 0;
  return (fontSizePx * displayWidth) / canvasWidth;
}

/** The smallest font size on the canvas that still reads at the display width. */
export function minimumCanvasFontSize(canvasWidth, displayWidth) {
  if (!(displayWidth > 0)) return 0;
  return Math.ceil((MIN_ONSCREEN_TEXT_PX * canvasWidth) / displayWidth);
}

/**
 * Compare a video title with the words burned into its thumbnail.
 *
 * @param {object} input
 * @param {string} input.title
 * @param {string} input.thumbnailText
 * @param {number} [input.fontSizePx]      - text height on the thumbnail canvas.
 * @param {number} [input.canvasWidth]     - thumbnail canvas width in pixels.
 * @param {number} [input.truncationChars] - where the listing clips the title.
 * @returns {object} report, or { error } when the input cannot be measured.
 */
export function testTitleAndThumbnail({
  title = "",
  thumbnailText = "",
  fontSizePx = 96,
  canvasWidth = THUMBNAIL_CANVAS_WIDTH,
  truncationChars = TITLE_TRUNCATION_CHARS,
} = {}) {
  if (typeof title !== "string" || typeof thumbnailText !== "string") {
    return { error: "Title and thumbnail text must both be text." };
  }
  if (!title.trim()) {
    return { error: "Enter a video title to measure it against the 100 character limit." };
  }
  const font = Number(fontSizePx);
  const canvas = Number(canvasWidth);
  const cut = Number(truncationChars);
  if (!Number.isFinite(font) || font <= 0) {
    return { error: "Thumbnail font size must be greater than zero." };
  }
  if (!Number.isFinite(canvas) || canvas <= 0) {
    return { error: "Thumbnail canvas width must be greater than zero." };
  }
  if (!Number.isFinite(cut) || cut < 1) {
    return { error: "Truncation length must be at least 1 character." };
  }

  const titleChars = Array.from(title).length;
  const titleRemaining = TITLE_MAX_CHARS - titleChars;
  const titleOverBy = titleRemaining < 0 ? -titleRemaining : 0;
  const titleVisible = takeCharacters(title, cut);
  const titleTruncated = titleChars > cut;

  const titleWords = contentWords(title);
  const thumbWords = contentWords(thumbnailText);
  const thumbWordCountRaw = normalizeWords(thumbnailText).length;

  const titleSet = new Set(titleWords);
  const shared = thumbWords.filter((word) => titleSet.has(word));
  const thumbOnly = thumbWords.filter((word) => !titleSet.has(word));
  const titleOnly = titleWords.filter((word) => !thumbWords.includes(word));

  const redundancyPercent = thumbWords.length > 0 ? (shared.length / thumbWords.length) * 100 : 0;
  const unionSize = new Set([...titleWords, ...thumbWords]).size;
  const combinedIdeas = unionSize;
  const overlapOfCombined = unionSize > 0 ? (shared.length / unionSize) * 100 : 0;

  const onScreenPx = onScreenTextSize(font, canvas, SMALLEST_DISPLAY_WIDTH);
  const minFont = minimumCanvasFontSize(canvas, SMALLEST_DISPLAY_WIDTH);
  const readableSmall = onScreenPx >= MIN_ONSCREEN_TEXT_PX;

  const issues = [];
  if (titleOverBy > 0) {
    issues.push({
      level: "error",
      message: `Title is ${titleOverBy} character${titleOverBy > 1 ? "s" : ""} over the ${TITLE_MAX_CHARS} character field limit and will be rejected.`,
    });
  }
  if (titleTruncated) {
    issues.push({
      level: "warning",
      message: `Title is cut after about ${cut} characters in listings. Everything from "${takeCharacters(title.slice(titleVisible.length).trim(), 24)}" onward may never be read.`,
    });
  }
  if (thumbWordCountRaw === 0) {
    issues.push({
      level: "info",
      message: "No thumbnail text entered. A thumbnail with no words has to carry the whole idea visually.",
    });
  } else if (thumbWordCountRaw > THUMBNAIL_WORD_MAX) {
    issues.push({
      level: "warning",
      message: `${thumbWordCountRaw} words on the thumbnail. Past about ${THUMBNAIL_WORD_MAX} words the text stops being scannable at ${SMALLEST_DISPLAY_WIDTH}px wide.`,
    });
  }
  if (thumbWords.length > 0 && thumbOnly.length === 0) {
    issues.push({
      level: "error",
      message: "Every content word on the thumbnail already appears in the title. The thumbnail is spending its space repeating rather than adding.",
    });
  } else if (redundancyPercent >= 50) {
    issues.push({
      level: "warning",
      message: `${Math.round(redundancyPercent)}% of the thumbnail's words repeat the title (${shared.join(", ")}). Swap one for a detail the title cannot show.`,
    });
  }
  if (!readableSmall) {
    issues.push({
      level: "warning",
      message: `At ${font}px on a ${canvas}px canvas the text renders about ${onScreenPx.toFixed(1)}px wide in a search row. Use at least ${minFont}px on the canvas.`,
    });
  }
  if (titleChars > 0 && titleWords.length === 0) {
    issues.push({
      level: "warning",
      message: "The title is made entirely of function words - there is nothing specific for search to match.",
    });
  }

  const status = issues.some((issue) => issue.level === "error")
    ? "error"
    : issues.some((issue) => issue.level === "warning")
      ? "warning"
      : "ok";

  return {
    titleChars,
    titleRemaining,
    titleOverBy,
    titleLimit: TITLE_MAX_CHARS,
    titleVisible,
    titleTruncated,
    truncationChars: cut,
    titleWords,
    thumbWords,
    thumbWordCountRaw,
    shared,
    thumbOnly,
    titleOnly,
    redundancyPercent,
    overlapOfCombined,
    combinedIdeas,
    onScreenPx,
    minFont,
    readableSmall,
    fontSizePx: font,
    canvasWidth: canvas,
    issues,
    status,
  };
}
