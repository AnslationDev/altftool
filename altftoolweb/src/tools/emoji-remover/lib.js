/**
 * Emoji Remover — strip emoji and symbol noise out of text.
 *
 * Emoji are not single characters. A "grapheme" like a flag or a family is a
 * SEQUENCE, and deleting one code point at a time leaves broken residue behind.
 * The rules below follow Unicode TR51 (Unicode Emoji), which defines an
 * emoji presentation sequence as:
 *
 *   keycap:            [#*0-9] U+FE0F U+20E3
 *   flag:              two Regional_Indicator code points
 *   tag sequence:      base pictograph + tag characters U+E0020..U+E007F + U+E007F
 *   modifier sequence: pictograph + Emoji_Modifier (skin tone U+1F3FB..U+1F3FF)
 *   ZWJ sequence:      the above joined by U+200D (zero width joiner)
 *
 * So the matcher below consumes whole sequences, never fragments. It also
 * offers to strip the leftovers people forget about: variation selectors
 * (U+FE0F / U+FE0E) that survive a naive regex, and non-emoji "other symbols"
 * in the Unicode So category such as ★ ☂ ✓, which are what makes pasted text
 * look decorated even after the emoji are gone.
 *
 * (c), (R) and (TM) are Extended_Pictographic but are almost always meant as
 * plain punctuation, so they are kept by default unless they carry an explicit
 * emoji variation selector.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Zero width joiner — glues pictographs into one emoji. */
export const ZWJ = "‍";
/** Emoji presentation selector. U+FE0E is the text-presentation counterpart. */
export const VS16 = "️";
export const VS15 = "︎";
/** Combining enclosing keycap, the ring in 1️⃣. */
export const KEYCAP = "⃣";

/** Code points that read as punctuation far more often than as emoji. */
export const TEXTUAL_PICTOGRAPHS = ["©", "®", "™"];

/** Biggest input the tool will process in one pass, in characters. */
export const MAX_INPUT_LENGTH = 500000;

/** What to leave behind where an emoji was. */
export const REPLACEMENT_MODES = {
  remove: { label: "Delete it", value: "" },
  space: { label: "Replace with a space", value: " " },
  placeholder: { label: "Replace with [emoji]", value: "[emoji]" },
};

/**
 * Fresh matcher for whole emoji sequences. A new RegExp every call, because a
 * /g regex carries lastIndex and would make this module stateful.
 *
 * @returns {RegExp}
 */
export function emojiSequenceRegex() {
  const modifier = "(?:\\p{Emoji_Modifier}|\\uFE0F\\u20E3|\\uFE0F|\\u20E3)";
  const tags = "(?:[\\u{E0020}-\\u{E007E}]+\\u{E007F})?";
  const base = `(?:\\p{Extended_Pictographic}${modifier}?${tags})`;
  const flag = "(?:\\p{Regional_Indicator}\\p{Regional_Indicator})";
  const keycap = "(?:[#*0-9]\\uFE0F?\\u20E3)";
  const unit = `(?:${keycap}|${flag}|${base})`;
  return new RegExp(`${unit}(?:\\u200D${unit})*`, "gu");
}

/** Fresh matcher for non-emoji "other symbol" characters (Unicode category So). */
export function otherSymbolRegex() {
  return /\p{So}/gu;
}

/** Fresh matcher for stray variation selectors. */
export function variationSelectorRegex() {
  return /[︎️]/gu;
}

/** True when the match is a bare (c)/(R)/(TM) with no emoji presentation selector. */
const isTextualOnly = (match) => TEXTUAL_PICTOGRAPHS.includes(match);

/**
 * List every emoji sequence in a string, in order of appearance.
 *
 * @param {string} text
 * @param {{ keepTextualSymbols?: boolean }} [options]
 * @returns {Array<{ emoji: string, index: number, codePoints: string[] }>}
 */
export function findEmoji(text, { keepTextualSymbols = true } = {}) {
  if (typeof text !== "string" || text === "") return [];
  const re = emojiSequenceRegex();
  const found = [];
  let match = re.exec(text);
  while (match !== null) {
    const value = match[0];
    if (!(keepTextualSymbols && isTextualOnly(value))) {
      found.push({
        emoji: value,
        index: match.index,
        codePoints: [...value].map((c) => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`),
      });
    }
    if (re.lastIndex === match.index) re.lastIndex += 1;
    match = re.exec(text);
  }
  return found;
}

/**
 * Remove emoji (and optionally other symbols) from text.
 *
 * @param {string} text
 * @param {object} [options]
 * @param {"remove"|"space"|"placeholder"} [options.mode] what replaces each emoji
 * @param {boolean} [options.stripOtherSymbols] also delete Unicode So characters (★ ☂ ✓)
 * @param {boolean} [options.stripVariationSelectors] delete leftover U+FE0E/U+FE0F
 * @param {boolean} [options.collapseSpaces] squeeze runs of spaces/tabs into one
 * @param {boolean} [options.trimLines] strip leading/trailing whitespace per line
 * @param {boolean} [options.dropEmptyLines] remove lines that end up blank
 * @param {boolean} [options.keepTextualSymbols] keep bare (c), (R) and (TM)
 * @returns {{ output: string, emojiCount: number, uniqueCount: number, uniqueEmoji: string[],
 *   symbolsRemoved: number, charsBefore: number, charsAfter: number, charsRemoved: number,
 *   percentRemoved: number, clean: boolean } | { error: string }}
 */
export function removeEmoji(text, options = {}) {
  const {
    mode = "remove",
    stripOtherSymbols = false,
    stripVariationSelectors = true,
    collapseSpaces = true,
    trimLines = true,
    dropEmptyLines = false,
    keepTextualSymbols = true,
  } = options;

  if (typeof text !== "string") return { error: "Paste some text to clean." };
  if (text.length > MAX_INPUT_LENGTH) {
    return { error: `Keep the text under ${MAX_INPUT_LENGTH.toLocaleString("en-IN")} characters.` };
  }
  const replacementMeta = REPLACEMENT_MODES[mode];
  if (!replacementMeta) return { error: "Choose delete, space or placeholder for the replacement." };
  if (text === "") {
    return {
      output: "",
      emojiCount: 0,
      uniqueCount: 0,
      uniqueEmoji: [],
      symbolsRemoved: 0,
      charsBefore: 0,
      charsAfter: 0,
      charsRemoved: 0,
      percentRemoved: 0,
      clean: true,
    };
  }

  const replacement = replacementMeta.value;
  const charsBefore = text.length;

  const matches = findEmoji(text, { keepTextualSymbols });
  const unique = [...new Set(matches.map((m) => m.emoji))];

  let output = text.replace(emojiSequenceRegex(), (m) =>
    keepTextualSymbols && isTextualOnly(m) ? m : replacement,
  );

  let symbolsRemoved = 0;
  if (stripOtherSymbols) {
    output = output.replace(otherSymbolRegex(), (m) => {
      if (keepTextualSymbols && isTextualOnly(m)) return m;
      symbolsRemoved += 1;
      return replacement;
    });
  }

  if (stripVariationSelectors) {
    output = output.replace(variationSelectorRegex(), "");
  }

  if (collapseSpaces) output = output.replace(/[ \t]{2,}/g, " ");
  if (trimLines) {
    output = output
      .split("\n")
      .map((line) => line.replace(/^[ \t]+|[ \t]+$/g, ""))
      .join("\n");
  }
  if (dropEmptyLines) {
    output = output
      .split("\n")
      .filter((line) => line.trim() !== "")
      .join("\n");
  }

  const charsAfter = output.length;
  const charsRemoved = charsBefore - charsAfter;

  return {
    output,
    emojiCount: matches.length,
    uniqueCount: unique.length,
    uniqueEmoji: unique,
    symbolsRemoved,
    charsBefore,
    charsAfter,
    charsRemoved,
    percentRemoved: charsBefore > 0 ? Math.round((charsRemoved / charsBefore) * 10000) / 100 : 0,
    clean: matches.length === 0 && symbolsRemoved === 0,
  };
}

/**
 * Keep only the emoji from a string — the inverse view, useful for auditing
 * what a caption is actually carrying.
 *
 * @param {string} text
 * @returns {{ emoji: string, count: number } | { error: string }}
 */
export function extractEmoji(text) {
  if (typeof text !== "string") return { error: "Paste some text first." };
  if (text.length > MAX_INPUT_LENGTH) {
    return { error: `Keep the text under ${MAX_INPUT_LENGTH.toLocaleString("en-IN")} characters.` };
  }
  const matches = findEmoji(text);
  return { emoji: matches.map((m) => m.emoji).join(""), count: matches.length };
}
