/**
 * Bionic reading converter.
 *
 * The technique puts an "artificial fixation point" on the opening letters of each
 * word by emboldening them, leaving the rest at normal weight so the eye is meant to
 * skip ahead. There is no official algorithm, but every open implementation works the
 * same way: bold the first ceil(length * ratio) letters, where the ratio is the
 * fixation strength, and never bold the whole word for words of two letters or more
 * (otherwise the contrast that creates the fixation point disappears).
 *
 * Honest note carried through to the UI: the controlled studies that have looked at
 * this — Hughes et al. (2023) and the 2022 replication by Wallace and colleagues —
 * found no reading-speed or comprehension benefit over plain text. Some readers still
 * report that it helps them stay on the line, which is a preference, not a proven
 * effect.
 *
 * Reading-time figures use 238 words per minute, the mean silent reading rate for
 * adult English non-fiction from Brysbaert's 2019 meta-analysis of 190 studies.
 */

/** Fixation strength: the fraction of each word that gets emboldened. */
export const FIXATION_LEVELS = [
  { level: 1, ratio: 0.3, label: "1 — lightest, about a third of each word" },
  { level: 2, ratio: 0.4, label: "2 — light" },
  { level: 3, ratio: 0.5, label: "3 — standard, first half of each word" },
  { level: 4, ratio: 0.6, label: "4 — heavy" },
  { level: 5, ratio: 0.7, label: "5 — heaviest, most of each word" },
];

/**
 * Opacity applied to the un-emboldened tail. Bionic Reading calls this "saccade";
 * lowering it increases the contrast between the fixation point and the rest.
 */
export const OPACITY_PRESETS = [1, 0.8, 0.6, 0.4];

/** Mean adult silent reading rate for English non-fiction (Brysbaert 2019). */
export const WORDS_PER_MINUTE = 238;

/**
 * Very short function words. Emboldening these adds visual noise without adding a
 * useful fixation point, so they can be left plain.
 */
export const COMMON_WORDS = new Set([
  "a", "an", "and", "as", "at", "be", "but", "by", "for", "from", "he", "her", "his",
  "if", "in", "is", "it", "its", "of", "on", "or", "she", "so", "that", "the", "their",
  "them", "they", "this", "to", "was", "we", "were", "with", "you", "your",
]);

/** Words are runs of letters, marks, apostrophes and hyphens. */
const WORD_PATTERN = /([\p{L}\p{M}][\p{L}\p{M}'’-]*)/gu;

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export function getFixation(level) {
  return FIXATION_LEVELS.find((f) => f.level === level) ?? FIXATION_LEVELS[2];
}

/**
 * How many leading letters of one word to embolden.
 * One-letter words get their single letter; longer words always keep at least one
 * plain letter so the fixation point stays visible.
 */
export function boldLength(word, ratio) {
  const length = word.length;
  if (length === 0) return 0;
  if (length === 1) return 1;
  const raw = Math.ceil(length * ratio);
  return Math.min(Math.max(1, raw), length - 1);
}

/**
 * Convert text.
 *
 * @param {object} input
 * @param {string} input.text
 * @param {number} [input.level] fixation level 1-5
 * @param {boolean} [input.skipCommonWords]
 * @param {number} [input.minWordLength] words shorter than this stay plain
 * @param {number} [input.opacity] opacity of the un-emboldened tail, 0.2 to 1
 */
export function convertToBionic({
  text,
  level = 3,
  skipCommonWords = false,
  minWordLength = 1,
  opacity = 1,
} = {}) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Paste or type some text to convert." };
  }
  if (!FIXATION_LEVELS.some((f) => f.level === level)) {
    return { error: "Fixation level must be a whole number from 1 to 5." };
  }
  if (!Number.isFinite(minWordLength) || minWordLength < 1 || minWordLength > 20) {
    return { error: "Minimum word length must be between 1 and 20 letters." };
  }
  if (!Number.isFinite(opacity) || opacity < 0.2 || opacity > 1) {
    return { error: "Tail opacity must be between 0.2 and 1." };
  }

  const { ratio } = getFixation(level);
  const tailStyle = opacity < 1 ? ` style="opacity:${opacity}"` : "";

  // Split into word and non-word runs once, so counting happens once and every
  // non-word run is escaped as carefully as the words are.
  const tokens = [];
  let cursor = 0;
  for (const match of text.matchAll(WORD_PATTERN)) {
    if (match.index > cursor) tokens.push({ word: false, value: text.slice(cursor, match.index) });
    tokens.push({ word: true, value: match[0] });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) tokens.push({ word: false, value: text.slice(cursor) });

  let wordCount = 0;
  let letterCount = 0;
  let boldedLetters = 0;
  let skippedWords = 0;

  for (const token of tokens) {
    if (!token.word) continue;
    wordCount += 1;
    letterCount += token.value.length;
    const skip =
      token.value.length < minWordLength ||
      (skipCommonWords && COMMON_WORDS.has(token.value.toLowerCase()));
    if (skip) {
      skippedWords += 1;
      token.bold = 0;
    } else {
      token.bold = boldLength(token.value, ratio);
      boldedLetters += token.bold;
    }
  }

  const html = tokens
    .map((token) => {
      if (!token.word) return escapeHtml(token.value);
      if (token.bold === 0) return escapeHtml(token.value);
      const head = escapeHtml(token.value.slice(0, token.bold));
      const tail = escapeHtml(token.value.slice(token.bold));
      return tail ? `<b>${head}</b><span${tailStyle}>${tail}</span>` : `<b>${head}</b>`;
    })
    .join("");

  const markdown = tokens
    .map((token) => {
      if (!token.word || token.bold === 0) return token.value;
      return `**${token.value.slice(0, token.bold)}**${token.value.slice(token.bold)}`;
    })
    .join("");

  const readingMinutes = wordCount / WORDS_PER_MINUTE;

  return {
    html,
    markdown,
    plain: text,
    level,
    ratio,
    wordCount,
    letterCount,
    boldedLetters,
    skippedWords,
    boldedPercent: letterCount > 0 ? (boldedLetters / letterCount) * 100 : 0,
    readingMinutes,
    readingLabel:
      readingMinutes < 1
        ? `${Math.max(1, Math.round(readingMinutes * 60))} sec`
        : `${readingMinutes.toFixed(1)} min`,
    averageWordLength: wordCount > 0 ? letterCount / wordCount : 0,
  };
}

/** Sample paragraph used so the tool shows a real conversion before anything is typed. */
export const SAMPLE_TEXT =
  "Reading is a skill the brain rebuilds every time you learn a new script. The eye does not glide along a line of text; it jumps in small movements called saccades and pauses at fixation points, taking in a handful of letters at a time.";

export default convertToBionic;
