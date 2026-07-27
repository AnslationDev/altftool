/**
 * Prompt whitespace normalizer.
 *
 * Pure text transforms only — no React, no DOM, no clock access.
 * Patterns are built with `new RegExp` from escaped source strings so every
 * invisible code point stays readable (and pasteable) in this file.
 */

/**
 * Zero-width / invisible formatting characters that survive a copy-paste out of
 * Word, Notion, Slack or a PDF and silently inflate a prompt's token count.
 * U+200B ZERO WIDTH SPACE, U+200C ZERO WIDTH NON-JOINER,
 * U+200D ZERO WIDTH JOINER, U+2060 WORD JOINER,
 * U+180E MONGOLIAN VOWEL SEPARATOR, U+FEFF ZERO WIDTH NO-BREAK SPACE (BOM).
 */
export const ZERO_WIDTH_SOURCE = "[\\u200B\\u200C\\u200D\\u2060\\u180E\\uFEFF]";

/**
 * Unicode space separators that look identical to U+0020 SPACE but are distinct
 * code points: U+00A0 NO-BREAK SPACE, U+1680 OGHAM SPACE MARK,
 * U+2000-U+200A (EN QUAD .. HAIR SPACE), U+202F NARROW NO-BREAK SPACE,
 * U+205F MEDIUM MATHEMATICAL SPACE, U+3000 IDEOGRAPHIC SPACE.
 */
export const UNICODE_SPACE_SOURCE = "[\\u00A0\\u1680\\u2000-\\u200A\\u202F\\u205F\\u3000]";

/**
 * Line terminators other than U+000A LINE FEED: CRLF and lone CR
 * (Windows / classic Mac), U+000B LINE TABULATION, U+000C FORM FEED,
 * U+0085 NEXT LINE, U+2028 LINE SEPARATOR, U+2029 PARAGRAPH SEPARATOR.
 */
export const LINE_BREAK_SOURCE = "\\r\\n|\\r|\\u000B|\\u000C|\\u0085|\\u2028|\\u2029";

const zeroWidthRe = () => new RegExp(ZERO_WIDTH_SOURCE, "g");
const unicodeSpaceRe = () => new RegExp(UNICODE_SPACE_SOURCE, "g");
const lineBreakRe = () => new RegExp(LINE_BREAK_SOURCE, "g");

/** Guard so a pasted book cannot lock the browser tab. */
export const MAX_INPUT_CHARS = 200000;

/** Blank-line ceiling the UI is allowed to request (0 = no blank lines kept). */
export const MAX_BLANK_LINES_LIMIT = 5;

/** Tab width range accepted when tabs are expanded to spaces. */
export const MIN_TAB_SIZE = 1;
export const MAX_TAB_SIZE = 8;

/**
 * Rough tokens-per-character ratio for English prose. Common tokenizer guidance
 * puts one token at roughly four characters of English text; it is an
 * approximation, not the exact BPE count for any specific model.
 */
export const CHARS_PER_TOKEN = 4;

export const DEFAULT_OPTIONS = {
  normalizeNewlines: true,
  stripZeroWidth: true,
  normalizeUnicodeSpaces: true,
  tabMode: "space", // "space" | "expand" | "keep"
  tabSize: 4,
  collapseSpaces: true,
  trimLineEnds: true,
  trimIndent: false,
  maxBlankLines: 1,
  trimDocument: true,
};

const countMatches = (text, pattern) => {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
};

const countLines = (text) => (text.length === 0 ? 0 : text.split("\n").length);

const countWords = (text) => {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
};

/** Approximate token count. Never negative, always an integer. */
export function estimateTokens(text) {
  if (typeof text !== "string" || text.length === 0) return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Normalize the whitespace of a pasted prompt.
 *
 * @param {string} input raw pasted text
 * @param {object} [options] see DEFAULT_OPTIONS
 * @returns {{text: string, stats: object, found: object}|{error: string}}
 */
export function normalizeWhitespace(input, options = {}) {
  if (typeof input !== "string" || input.length === 0) {
    return { error: "Nothing to clean — paste some text first." };
  }
  if (input.length > MAX_INPUT_CHARS) {
    return {
      error: `Text is ${input.length.toLocaleString("en-US")} characters. Trim it to ${MAX_INPUT_CHARS.toLocaleString("en-US")} characters or fewer.`,
    };
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };

  const tabSize = Number(opts.tabSize);
  const safeTabSize = Number.isFinite(tabSize)
    ? Math.min(MAX_TAB_SIZE, Math.max(MIN_TAB_SIZE, Math.round(tabSize)))
    : DEFAULT_OPTIONS.tabSize;

  const rawBlank = Number(opts.maxBlankLines);
  const safeBlankLines = Number.isFinite(rawBlank)
    ? Math.min(MAX_BLANK_LINES_LIMIT, Math.max(0, Math.round(rawBlank)))
    : DEFAULT_OPTIONS.maxBlankLines;

  // What the original text actually contained — reported even when the matching
  // clean-up switch is off, so the user can see why a prompt is bloated.
  const found = {
    zeroWidth: countMatches(input, zeroWidthRe()),
    unicodeSpaces: countMatches(input, unicodeSpaceRe()),
    windowsBreaks: countMatches(input, /\r\n/g),
    tabs: countMatches(input, /\t/g),
    doubleSpaces: countMatches(input, / {2,}/g),
    trailingSpaces: countMatches(input, /[ \t]+$/gm),
  };

  let text = input;

  if (opts.normalizeNewlines) {
    text = text.replace(lineBreakRe(), "\n");
  }
  if (opts.stripZeroWidth) {
    text = text.replace(zeroWidthRe(), "");
  }
  if (opts.normalizeUnicodeSpaces) {
    text = text.replace(unicodeSpaceRe(), " ");
  }

  if (opts.tabMode === "expand") {
    text = text.replace(/\t/g, " ".repeat(safeTabSize));
  } else if (opts.tabMode === "space") {
    text = text.replace(/\t+/g, " ");
  }

  if (opts.collapseSpaces) {
    text = text.replace(/ {2,}/g, " ");
  }
  if (opts.trimLineEnds) {
    text = text.replace(/[ \t]+$/gm, "");
  }
  if (opts.trimIndent) {
    text = text.replace(/^[ \t]+/gm, "");
  }

  // Collapse runs of blank lines. n blank lines between two paragraphs means
  // n + 1 consecutive newline characters.
  const allowedNewlineRun = safeBlankLines + 1;
  const blankRun = new RegExp(`\\n{${allowedNewlineRun + 1},}`, "g");
  text = text.replace(blankRun, "\n".repeat(allowedNewlineRun));

  if (opts.trimDocument) {
    text = text.trim();
  }

  const charsBefore = input.length;
  const charsAfter = text.length;
  const tokensBefore = estimateTokens(input);
  const tokensAfter = estimateTokens(text);

  return {
    text,
    found,
    stats: {
      charsBefore,
      charsAfter,
      charsRemoved: charsBefore - charsAfter,
      reductionPercent: charsBefore > 0 ? ((charsBefore - charsAfter) / charsBefore) * 100 : 0,
      linesBefore: countLines(input),
      linesAfter: countLines(text),
      wordsBefore: countWords(input),
      wordsAfter: countWords(text),
      tokensBefore,
      tokensAfter,
      tokensSaved: tokensBefore - tokensAfter,
      changed: text !== input,
    },
  };
}

/**
 * Render invisible characters as visible glyphs so a user can see what was
 * hiding in a paste. Pure formatting helper, no state.
 */
export function revealInvisibles(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(zeroWidthRe(), "␣") // OPEN BOX marks a zero-width character
    .replace(unicodeSpaceRe(), "·") // MIDDLE DOT marks an exotic space
    .replace(/\t/g, "→   ")
    .replace(/ /g, "·");
}
