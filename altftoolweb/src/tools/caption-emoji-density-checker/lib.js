/**
 * Emoji density and screen-reader friendliness checker for social captions.
 *
 * A screen reader announces each emoji by its Unicode name — "fire", "red heart",
 * "thumbs up medium-dark skin tone" — in the position it appears. That makes the
 * measurable properties below the ones that matter: how many there are, whether
 * they sit inside a sentence or after it, and how many are announced in a row.
 *
 * The thresholds are drawn from common accessibility guidance for emoji use:
 * keep the count low, put them at the end rather than inside a sentence, never
 * use one in place of a word, and avoid repeating the same one several times.
 */

/** More than this in one caption becomes a long list of spoken names. */
export const MAX_COMFORTABLE_EMOJI = 5;

/** Three or more announced back to back is where a listener loses the thread. */
export const MAX_RUN_LENGTH = 2;

/** Emoji per 100 words above this reads as decoration rather than punctuation. */
export const MAX_DENSITY_PER_100_WORDS = 10;

/**
 * Density is meaningless on a very short caption — one emoji in six words is
 * already 16 per 100 — so the density rule only applies above this word count.
 */
export const MIN_WORDS_FOR_DENSITY = 20;

/** Repeating the same emoji more than this many times adds nothing but noise. */
export const MAX_REPEATS = 2;

const SKIN_TONE = /[\u{1F3FB}-\u{1F3FF}]/u;
const ZWJ = /‍/;
const VARIATION_SELECTOR = /️/;
const REGIONAL_INDICATOR = /[\u{1F1E6}-\u{1F1FF}]/u;
const PICTOGRAPHIC = /\p{Extended_Pictographic}/u;
const KEYCAP = /⃣/;

/** Fallback matcher used when Intl.Segmenter is unavailable. */
const EMOJI_SEQUENCE =
  /(?:[\u{1F1E6}-\u{1F1FF}]{2})|(?:\p{Extended_Pictographic}(?:️)?(?:[\u{1F3FB}-\u{1F3FF}])?(?:⃣)?(?:‍\p{Extended_Pictographic}(?:️)?(?:[\u{1F3FB}-\u{1F3FF}])?)*)/gu;

function isEmojiGrapheme(grapheme) {
  return (
    PICTOGRAPHIC.test(grapheme) || REGIONAL_INDICATOR.test(grapheme) || KEYCAP.test(grapheme)
  );
}

/**
 * Find every emoji sequence with its position, counted as whole grapheme
 * clusters so a flag or a family sequence is one emoji, not four.
 */
export function findEmoji(text) {
  if (typeof text !== "string" || text === "") return [];
  const found = [];

  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    for (const segment of segmenter.segment(text)) {
      if (isEmojiGrapheme(segment.segment)) {
        found.push({ char: segment.segment, index: segment.index });
      }
    }
  } else {
    EMOJI_SEQUENCE.lastIndex = 0;
    let match = EMOJI_SEQUENCE.exec(text);
    while (match !== null) {
      found.push({ char: match[0], index: match.index });
      match = EMOJI_SEQUENCE.exec(text);
    }
  }

  return found.map((item) => ({
    ...item,
    length: item.char.length,
    skinTone: SKIN_TONE.test(item.char),
    joined: ZWJ.test(item.char),
    variationSelector: VARIATION_SELECTOR.test(item.char),
  }));
}

export function countWords(text) {
  if (typeof text !== "string") return 0;
  const stripped = text.replace(EMOJI_SEQUENCE, " ");
  const clean = stripped.replace(/\s+/g, " ").trim();
  if (!clean) return 0;
  return clean.split(" ").filter((token) => /[A-Za-z0-9]/.test(token)).length;
}

/**
 * Analyse a caption.
 * @param {string} text
 */
export function analyseCaption(text) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Paste a caption to check." };
  }

  const emoji = findEmoji(text);
  const words = countWords(text);
  const characters = [...text].length;

  // Consecutive runs: emoji separated only by spaces count as one run, because a
  // screen reader announces the names one after another with nothing between.
  const runs = [];
  let current = null;
  for (const item of emoji) {
    if (current) {
      const between = text.slice(current.end, item.index);
      if (/^\s*$/.test(between)) {
        current.items.push(item);
        current.end = item.index + item.length;
        continue;
      }
      runs.push(current);
    }
    current = { items: [item], start: item.index, end: item.index + item.length };
  }
  if (current) runs.push(current);

  const longestRun = runs.reduce((max, run) => Math.max(max, run.items.length), 0);

  // An emoji is "mid-sentence" when readable words still follow it before the
  // next sentence break — that is where an announcement interrupts the sentence.
  let midSentence = 0;
  for (const item of emoji) {
    const rest = text.slice(item.index + item.length);
    const untilBreak = rest.split(/[.!?\n]/)[0] || "";
    if (/[A-Za-z0-9]/.test(untilBreak)) midSentence += 1;
  }

  const leading = emoji.length > 0 && /^\s*$/.test(text.slice(0, emoji[0].index));

  const counts = new Map();
  for (const item of emoji) counts.set(item.char, (counts.get(item.char) || 0) + 1);
  const repeated = [...counts.entries()]
    .filter(([, count]) => count > MAX_REPEATS)
    .map(([char, count]) => ({ char, count }))
    .sort((a, b) => b.count - a.count);

  const skinTones = emoji.filter((item) => item.skinTone).length;
  const joined = emoji.filter((item) => item.joined).length;

  const densityPer100Words =
    words > 0 ? Math.round((emoji.length / words) * 100 * 10) / 10 : emoji.length > 0 ? Infinity : 0;
  const densityDisplay = Number.isFinite(densityPer100Words) ? densityPer100Words : null;
  const characterShare =
    characters > 0 ? Math.round((emoji.length / characters) * 1000) / 10 : 0;

  const issues = [];
  if (emoji.length > MAX_COMFORTABLE_EMOJI) {
    issues.push({
      id: "count",
      severity: "warning",
      text: `${emoji.length} emoji — each one is read out by name, so more than about ${MAX_COMFORTABLE_EMOJI} turns the caption into a list.`,
    });
  }
  if (longestRun > MAX_RUN_LENGTH) {
    issues.push({
      id: "run",
      severity: "warning",
      text: `${longestRun} emoji in a row are announced one after another with nothing between them.`,
    });
  }
  if (midSentence > 0) {
    issues.push({
      id: "mid-sentence",
      severity: "warning",
      text: `${midSentence} emoji sit inside a sentence rather than after it, which interrupts the sentence when it is read aloud.`,
    });
  }
  if (leading) {
    issues.push({
      id: "leading",
      severity: "warning",
      text: "The caption opens with an emoji, so the first thing announced — and the first thing shown in a truncated feed preview — is a picture name rather than your point.",
    });
  }
  if (repeated.length > 0) {
    issues.push({
      id: "repeats",
      severity: "warning",
      text: `${repeated[0].char} appears ${repeated[0].count} times; repeats add spoken length without adding meaning.`,
    });
  }
  if (
    densityDisplay !== null &&
    words >= MIN_WORDS_FOR_DENSITY &&
    densityDisplay > MAX_DENSITY_PER_100_WORDS
  ) {
    issues.push({
      id: "density",
      severity: "warning",
      text: `${densityDisplay} emoji per 100 words is above the ${MAX_DENSITY_PER_100_WORDS} that still reads as punctuation.`,
    });
  }
  if (words === 0 && emoji.length > 0) {
    issues.push({
      id: "no-words",
      severity: "blocker",
      text: "The caption is emoji only — with images blocked or a screen reader in use there is no message left.",
    });
  }
  if (skinTones > 0) {
    issues.push({
      id: "skin-tone",
      severity: "note",
      text: `${skinTones} emoji carry a skin-tone modifier, which is announced as part of the name (for example "thumbs up medium-dark skin tone").`,
    });
  }
  if (joined > 0) {
    issues.push({
      id: "joined",
      severity: "note",
      text: `${joined} emoji are joined sequences such as a family or profession, which are announced as several words each.`,
    });
  }

  const blockers = issues.filter((issue) => issue.severity === "blocker").length;
  const warnings = issues.filter((issue) => issue.severity === "warning").length;
  const verdict = blockers > 0 ? "Rework it" : warnings === 0 ? "Reads well" : warnings <= 2 ? "Usable, tighten it" : "Too much";

  return {
    characters,
    words,
    emojiCount: emoji.length,
    uniqueEmoji: counts.size,
    emoji,
    runs: runs.map((run) => ({ length: run.items.length, text: run.items.map((i) => i.char).join("") })),
    longestRun,
    midSentence,
    leading,
    repeated,
    skinTones,
    joined,
    densityPer100Words: densityDisplay,
    characterShare,
    issues,
    blockers,
    warnings,
    verdict,
  };
}

/**
 * Produce a cleaned-up version: emoji removed from inside sentences and the
 * caption's leading emoji dropped, so the words carry the message on their own.
 */
export function stripEmoji(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(EMOJI_SEQUENCE, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +([.,!?;:])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}
