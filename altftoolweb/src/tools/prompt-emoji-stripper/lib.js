/**
 * Prompt Emoji Stripper
 *
 * Removes emoji, decorative symbols and invisible characters from a prompt and
 * reports the exact saving.
 *
 * How the classification works:
 *   - Text is split into grapheme clusters with Intl.Segmenter, so a flag, a
 *     skin-tone modifier and a zero-width-joiner family sequence are each
 *     treated as one unit rather than as their component code points.
 *   - A cluster counts as emoji if it contains a code point with the Unicode
 *     Extended_Pictographic property, which is the property UTS #51 (the
 *     Unicode emoji standard) defines for this purpose.
 *   - Invisible characters are the zero-width and formatting code points that
 *     take up tokens while rendering as nothing: zero-width space U+200B,
 *     zero-width non-joiner U+200C, zero-width joiner U+200D, word joiner
 *     U+2060, byte order mark U+FEFF, soft hyphen U+00AD, combining grapheme
 *     joiner U+034F and Mongolian vowel separator U+180E.
 *   - Decorative symbols are the non-pictographic dingbats, arrows, box-drawing,
 *     block, geometric-shape and bullet ranges commonly pasted in as ornament.
 *
 * Saving is reported two ways. UTF-8 byte counts are exact: every emoji outside
 * the Basic Multilingual Plane costs four bytes. The token figure is a RANGE,
 * because tokenisation is model-specific — in common byte-pair vocabularies a
 * single emoji costs anywhere from one to four tokens.
 */

/** Lowest number of tokens a removed emoji cluster typically costs. */
export const TOKENS_PER_EMOJI_LOW = 1;
/** Highest number of tokens a removed emoji cluster typically costs. */
export const TOKENS_PER_EMOJI_HIGH = 4;
/** A decorative symbol usually costs one or two tokens. */
export const TOKENS_PER_SYMBOL_HIGH = 2;

/** Guard against pathological input sizes in the browser. */
export const MAX_INPUT_CHARS = 200000;

/** Unicode Extended_Pictographic, the property UTS #51 uses to define emoji. */
const EXTENDED_PICTOGRAPHIC = /\p{Extended_Pictographic}/u;

/** Regional indicator pairs form flags and carry no pictographic property. */
const REGIONAL_INDICATOR = /[\u{1F1E6}-\u{1F1FF}]/u;

/** Keycap sequences such as digit + U+FE0F + U+20E3. */
const KEYCAP = /⃣/;

/** Emoji modifiers: the five skin-tone code points. */
const EMOJI_MODIFIER = /[\u{1F3FB}-\u{1F3FF}]/u;

/** Zero-width and formatting code points that render as nothing. */
const INVISIBLE = /[​-‍⁠﻿­͏᠎]/;

/** Variation selectors: U+FE0E text presentation, U+FE0F emoji presentation. */
const VARIATION_SELECTOR = /[︀-️]/;

/**
 * Non-pictographic ornament: arrows, box drawing, block elements, geometric
 * shapes, miscellaneous symbols, dingbats and bullet characters.
 */
const DECORATIVE =
  /[•‣⁃⁌⁍◦←-⇿─-╿▀-▟■-◿☀-⛿✀-➿⬀-⯿]/;

export const REMOVAL_GROUPS = [
  {
    id: "emoji",
    label: "Emoji and pictographs",
    hint: "Anything with the Unicode Extended_Pictographic property, plus flags, keycaps and skin-tone sequences.",
  },
  {
    id: "invisible",
    label: "Invisible characters",
    hint: "Zero-width spaces, joiners, soft hyphens and byte order marks that render as nothing but still cost tokens.",
  },
  {
    id: "decorative",
    label: "Decorative symbols",
    hint: "Bullets, arrows, box-drawing, block and geometric shapes used as ornament.",
  },
  {
    id: "variation",
    label: "Variation selectors only",
    hint: "Strips U+FE0E and U+FE0F but keeps the base character, so a symbol survives without its emoji styling.",
  },
];

function utf8Bytes(text) {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(text).length;
  }
  // Fallback: count UTF-8 lengths directly from code points.
  let bytes = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code < 0x80) bytes += 1;
    else if (code < 0x800) bytes += 2;
    else if (code < 0x10000) bytes += 3;
    else bytes += 4;
  }
  return bytes;
}

function graphemes(text) {
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    return [...segmenter.segment(text)].map((entry) => entry.segment);
  }
  // Fallback: code points. Composed emoji sequences are then counted per part.
  return Array.from(text);
}

function countCodePoints(text) {
  return Array.from(text).length;
}

/**
 * Strip emoji and ornament from a prompt.
 *
 * @param {object} input
 * @param {string} input.text
 * @param {boolean} input.removeEmoji
 * @param {boolean} input.removeInvisible
 * @param {boolean} input.removeDecorative
 * @param {boolean} input.removeVariationSelectors strip styling, keep base char
 * @param {boolean} input.collapseWhitespace tidy the gaps left behind
 * @param {string} input.replacement text to substitute for each removed cluster
 * @returns {object|{error:string}}
 */
export function stripPromptEmoji({
  text = "",
  removeEmoji = true,
  removeInvisible = true,
  removeDecorative = true,
  removeVariationSelectors = true,
  collapseWhitespace = true,
  replacement = "",
} = {}) {
  if (typeof text !== "string") return { error: "The input must be text." };
  if (text.length > MAX_INPUT_CHARS) {
    return { error: `Paste under ${MAX_INPUT_CHARS.toLocaleString("en-IN")} characters at a time.` };
  }
  if (text.length === 0) {
    return { error: "Paste a prompt to strip." };
  }
  if (!removeEmoji && !removeInvisible && !removeDecorative && !removeVariationSelectors) {
    return { error: "Nothing is selected for removal, so the prompt would come back unchanged." };
  }
  if (typeof replacement !== "string" || replacement.length > 16) {
    return { error: "The replacement text must be 16 characters or fewer." };
  }

  const clusters = graphemes(text);
  const kept = [];
  const removedSamples = new Map();

  let emojiRemoved = 0;
  let invisibleRemoved = 0;
  let decorativeRemoved = 0;
  let variationStripped = 0;

  for (const cluster of clusters) {
    const isEmoji =
      EXTENDED_PICTOGRAPHIC.test(cluster) ||
      REGIONAL_INDICATOR.test(cluster) ||
      KEYCAP.test(cluster) ||
      EMOJI_MODIFIER.test(cluster);

    if (isEmoji) {
      if (removeEmoji) {
        emojiRemoved += 1;
        removedSamples.set(cluster, (removedSamples.get(cluster) || 0) + 1);
        if (replacement) kept.push(replacement);
        continue;
      }
      // Emoji kept, but its presentation selector may still be stripped.
      if (removeVariationSelectors && VARIATION_SELECTOR.test(cluster)) {
        const stripped = cluster.replace(new RegExp(VARIATION_SELECTOR.source, "g"), "");
        variationStripped += 1;
        kept.push(stripped);
        continue;
      }
      kept.push(cluster);
      continue;
    }

    if (removeDecorative && DECORATIVE.test(cluster)) {
      decorativeRemoved += 1;
      removedSamples.set(cluster, (removedSamples.get(cluster) || 0) + 1);
      if (replacement) kept.push(replacement);
      continue;
    }

    // A cluster made only of invisible code points renders as nothing.
    const withoutInvisible = cluster.replace(new RegExp(INVISIBLE.source, "g"), "");
    if (removeInvisible && withoutInvisible !== cluster) {
      invisibleRemoved += cluster.length - withoutInvisible.length;
      if (withoutInvisible.length === 0) continue;
      kept.push(withoutInvisible);
      continue;
    }

    if (removeVariationSelectors && VARIATION_SELECTOR.test(cluster)) {
      const stripped = cluster.replace(new RegExp(VARIATION_SELECTOR.source, "g"), "");
      variationStripped += 1;
      if (stripped.length === 0) continue;
      kept.push(stripped);
      continue;
    }

    kept.push(cluster);
  }

  let output = kept.join("");
  if (collapseWhitespace) {
    output = output
      .replace(/[ \t]{2,}/g, " ")
      .replace(/ ([,.;:!?)])/g, "$1")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  const charsBefore = text.length;
  const charsAfter = output.length;
  const bytesBefore = utf8Bytes(text);
  const bytesAfter = utf8Bytes(output);
  const bytesSaved = bytesBefore - bytesAfter;

  const symbolsRemoved = emojiRemoved + decorativeRemoved;
  const tokensSavedLow =
    emojiRemoved * TOKENS_PER_EMOJI_LOW + decorativeRemoved + invisibleRemoved;
  const tokensSavedHigh =
    emojiRemoved * TOKENS_PER_EMOJI_HIGH +
    decorativeRemoved * TOKENS_PER_SYMBOL_HIGH +
    invisibleRemoved;

  const warnings = [];
  if (invisibleRemoved > 0) {
    warnings.push(
      `${invisibleRemoved} invisible character${invisibleRemoved === 1 ? "" : "s"} were removed. These render as nothing but still occupy tokens, and they are a common way for text copied from a web page to carry hidden formatting.`,
    );
  }
  if (emojiRemoved > 0 && replacement === "") {
    warnings.push(
      "Emoji were deleted rather than replaced. If any of them carried meaning in your prompt — a status marker or a list bullet — set a replacement string instead.",
    );
  }
  if (typeof Intl === "undefined" || typeof Intl.Segmenter !== "function") {
    warnings.push(
      "This browser has no Intl.Segmenter, so multi-part emoji were counted by code point rather than as single characters.",
    );
  }

  return {
    output,
    emojiRemoved,
    decorativeRemoved,
    invisibleRemoved,
    variationStripped,
    symbolsRemoved,
    charsBefore,
    charsAfter,
    charsSaved: charsBefore - charsAfter,
    codePointsBefore: countCodePoints(text),
    codePointsAfter: countCodePoints(output),
    bytesBefore,
    bytesAfter,
    bytesSaved,
    tokensSavedLow,
    tokensSavedHigh,
    removedSamples: [...removedSamples.entries()]
      .map(([symbol, count]) => ({ symbol, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 40),
    warnings,
  };
}
