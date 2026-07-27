/**
 * Punctuation and structure "tell" counter for prose drafts.
 *
 * Everything here is a plain count or ratio over the text you paste. The flag
 * thresholds are this tool's own editorial defaults, chosen so that an ordinary
 * hand-typed draft clears them — they are not measured corpus frequencies, and
 * a high count is a prompt to re-read a passage, never proof of anything.
 */

/** Characters counted. U+2014 EM DASH, U+2013 EN DASH, U+2026 HORIZONTAL ELLIPSIS. */
export const EM_DASH = "—";
export const EN_DASH = "–";
export const ELLIPSIS = "…";

/** Flag thresholds, expressed per 1,000 words. Tool defaults, editable below. */
export const EM_DASH_FLAG_PER_1000 = 3;
export const SEMICOLON_FLAG_PER_1000 = 4;
export const CONNECTIVE_FLAG_PER_1000 = 6;
export const TRIAD_FLAG_PER_1000 = 4;

/** Sentence-length coefficient of variation below this reads as machine-even. */
export const UNIFORM_SENTENCE_CV = 0.4;
/** Paragraph word-count coefficient of variation below this reads as templated. */
export const UNIFORM_PARAGRAPH_CV = 0.25;

/** Sentence-initial connectives that stack up in generated prose. */
export const FORMAL_CONNECTIVES = [
  "moreover",
  "furthermore",
  "additionally",
  "consequently",
  "notably",
  "importantly",
  "ultimately",
  "indeed",
  "nevertheless",
  "nonetheless",
  "therefore",
  "thus",
  "hence",
  "in essence",
  "in conclusion",
  "that said",
  "crucially",
];

export function countWords(text) {
  const matches = String(text).match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
  return matches ? matches.length : 0;
}

export function splitSentences(text) {
  return String(text)
    .split(/\n+|(?<=[.!?…])["'”’)\]]*\s+/u)
    .map((part) => part.trim())
    .filter((part) => part !== "");
}

export function splitParagraphs(text) {
  return String(text)
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter((part) => part !== "");
}

/** Coefficient of variation (sd / mean); null when it is not meaningful. */
export function coefficientOfVariation(values) {
  if (!Array.isArray(values) || values.length < 3) return null;
  const mean = values.reduce((sum, n) => sum + n, 0) / values.length;
  if (!(mean > 0)) return null;
  const variance =
    values.reduce((sum, n) => sum + (n - mean) * (n - mean), 0) / values.length;
  return Math.sqrt(variance) / mean;
}

/** Returns up to `limit` context snippets around each match of `regex`. */
export function collectSnippets(text, regex, limit = 5, radius = 40) {
  const out = [];
  const source = String(text);
  for (const match of source.matchAll(regex)) {
    if (out.length >= limit) break;
    const start = Math.max(0, match.index - radius);
    const end = Math.min(source.length, match.index + match[0].length + radius);
    const prefix = start > 0 ? "…" : "";
    const suffix = end < source.length ? "…" : "";
    out.push(`${prefix}${source.slice(start, end).replace(/\s+/g, " ").trim()}${suffix}`);
  }
  return out;
}

/**
 * Counts punctuation and structure tells in a draft.
 *
 * @param {string} text
 * @param {{emDashFlagPer1000?: number}} options
 */
export function checkTells(text, options = {}) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Paste a draft to check." };
  }
  const emFlag = Number(options.emDashFlagPer1000 ?? EM_DASH_FLAG_PER_1000);
  if (!Number.isFinite(emFlag) || emFlag < 0) {
    return { error: "The em dash flag threshold must be zero or a positive number." };
  }

  const words = countWords(text);
  if (words < 20) {
    return { error: "Paste at least 20 words — rates per 1,000 words are meaningless below that." };
  }

  const per1000 = (count) => (count / words) * 1000;

  const emDashCount = (text.match(/—/gu) || []).length;
  const enDashCount = (text.match(/–/gu) || []).length;
  const spacedEnDash = (text.match(/\s–\s/gu) || []).length;
  const hyphenAsDash = (text.match(/\s-{1,2}\s/gu) || []).length;
  const ellipsisCount = (text.match(/…/gu) || []).length;
  const smartQuoteCount = (text.match(/[“”‘’]/gu) || []).length;
  const straightQuoteCount = (text.match(/["']/gu) || []).length;
  const semicolonCount = (text.match(/;/gu) || []).length;
  const colonListCount = (text.match(/:\s*(?:\n|[\p{Lu}\p{Ll}][^.!?\n]*,)/gu) || []).length;
  const nonBreakingSpaces = (text.match(/ /gu) || []).length;

  const sentences = splitSentences(text);
  const paragraphs = splitParagraphs(text);
  const sentenceWordCounts = sentences.map(countWords).filter((n) => n > 0);
  const paragraphWordCounts = paragraphs.map(countWords).filter((n) => n > 0);
  const sentenceCv = coefficientOfVariation(sentenceWordCounts);
  const paragraphCv = coefficientOfVariation(paragraphWordCounts);

  const triadSentences = sentences.filter(
    (sentence) => (sentence.match(/,/gu) || []).length >= 2 && /,\s*(?:and|or)\s/iu.test(sentence),
  );

  const connectiveRe = new RegExp(
    `(?:^|[.!?…]\\s+|\\n\\s*)(${FORMAL_CONNECTIVES.join("|")})\\b`,
    "giu",
  );
  const connectiveMatches = [...text.matchAll(connectiveRe)];
  const connectiveList = [
    ...new Set(connectiveMatches.map((match) => match[1].toLowerCase())),
  ];

  const notOnlyCount = (text.match(/\bnot only\b[^.!?\n]{0,80}\bbut(?:\s+also)?\b/giu) || []).length;
  const notJustCount = (text.match(/\bnot just\b[^.!?\n]{0,80}\b(?:but|it['’]s|it is)\b/giu) || [])
    .length;

  const tells = [
    {
      id: "em-dash",
      label: "Em dash (—)",
      count: emDashCount,
      rate: per1000(emDashCount),
      flagged: per1000(emDashCount) > emFlag,
      weight: 20,
      fix: "Swap most of them for a comma, a full stop or a pair of brackets. Keep one where the interruption really is an aside.",
      snippets: collectSnippets(text, /—/gu),
    },
    {
      id: "spaced-en-dash",
      label: "Spaced en dash ( – ) used as an em dash",
      count: spacedEnDash,
      rate: per1000(spacedEnDash),
      flagged: spacedEnDash > 0 && emDashCount > 0,
      weight: 6,
      fix: "Pick one convention. Mixing spaced en dashes and em dashes in the same piece is a copy-paste giveaway.",
      snippets: collectSnippets(text, /\s–\s/gu),
    },
    {
      id: "smart-quotes",
      label: "Curly quotes and apostrophes",
      count: smartQuoteCount,
      rate: per1000(smartQuoteCount),
      flagged: smartQuoteCount > 0 && straightQuoteCount > 0,
      weight: 8,
      fix: "Curly and straight quotes mixed in one draft means text came from two sources. Normalise to one style before publishing.",
      snippets: collectSnippets(text, /[“”‘’]/gu, 3),
    },
    {
      id: "ellipsis-char",
      label: "Ellipsis character (…)",
      count: ellipsisCount,
      rate: per1000(ellipsisCount),
      flagged: ellipsisCount > 0,
      weight: 4,
      fix: "Most keyboards produce three full stops, not the single … glyph. Replace it or accept it as a house style.",
      snippets: collectSnippets(text, /…/gu, 3),
    },
    {
      id: "semicolons",
      label: "Semicolons",
      count: semicolonCount,
      rate: per1000(semicolonCount),
      flagged: per1000(semicolonCount) > SEMICOLON_FLAG_PER_1000,
      weight: 10,
      fix: `More than ${SEMICOLON_FLAG_PER_1000} per 1,000 words is heavy for web prose. Split the clauses into two sentences.`,
      snippets: collectSnippets(text, /;/gu, 3),
    },
    {
      id: "connectives",
      label: "Sentence-initial connectives",
      count: connectiveMatches.length,
      rate: per1000(connectiveMatches.length),
      flagged: per1000(connectiveMatches.length) > CONNECTIVE_FLAG_PER_1000,
      weight: 14,
      fix: "Moreover, Furthermore and Ultimately can nearly always be deleted without losing meaning.",
      snippets: connectiveList.slice(0, 6),
    },
    {
      id: "triads",
      label: "Rule-of-three lists (A, B, and C)",
      count: triadSentences.length,
      rate: per1000(triadSentences.length),
      flagged: per1000(triadSentences.length) > TRIAD_FLAG_PER_1000,
      weight: 14,
      fix: "Break the pattern: cut one item, or turn one triad into a single concrete example.",
      snippets: triadSentences.slice(0, 3),
    },
    {
      id: "contrast-frames",
      label: '"Not only... but also" / "not just... but"',
      count: notOnlyCount + notJustCount,
      rate: per1000(notOnlyCount + notJustCount),
      flagged: notOnlyCount + notJustCount > 0,
      weight: 10,
      fix: "State the second half directly. The negation adds a beat without adding information.",
      snippets: collectSnippets(text, /\bnot (?:only|just)\b/giu, 3),
    },
    {
      id: "sentence-rhythm",
      label: "Sentence-length variation",
      count: sentences.length,
      rate: sentenceCv === null ? 0 : sentenceCv,
      flagged: sentenceCv !== null && sentenceCv < UNIFORM_SENTENCE_CV,
      weight: 8,
      fix: `Variation below ${UNIFORM_SENTENCE_CV} means every sentence is about the same length. Add a short one. Then a long one that earns its length.`,
      snippets: [],
    },
    {
      id: "paragraph-rhythm",
      label: "Paragraph-length variation",
      count: paragraphs.length,
      rate: paragraphCv === null ? 0 : paragraphCv,
      flagged: paragraphCv !== null && paragraphCv < UNIFORM_PARAGRAPH_CV,
      weight: 6,
      fix: "Evenly sized paragraphs read as a template. Let one run long and one be a single line.",
      snippets: [],
    },
  ];

  const weightHit = tells.reduce((sum, tell) => sum + (tell.flagged ? tell.weight : 0), 0);
  const weightTotal = tells.reduce((sum, tell) => sum + tell.weight, 0);
  const score = Math.round((weightHit / weightTotal) * 100);

  let band = "Reads hand-written";
  if (score >= 60) band = "Heavy tells";
  else if (score >= 35) band = "Several tells";
  else if (score >= 15) band = "A few tells";

  return {
    words,
    characters: Array.from(text).length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    emDashCount,
    emDashPer1000: per1000(emDashCount),
    enDashCount,
    hyphenAsDash,
    ellipsisCount,
    smartQuoteCount,
    straightQuoteCount,
    semicolonCount,
    colonListCount,
    nonBreakingSpaces,
    sentenceCv,
    paragraphCv,
    averageSentenceWords:
      sentenceWordCounts.length > 0
        ? sentenceWordCounts.reduce((sum, n) => sum + n, 0) / sentenceWordCounts.length
        : 0,
    tells,
    flaggedTells: tells.filter((tell) => tell.flagged),
    score,
    band,
    emDashFlagPer1000: emFlag,
  };
}

/** Replaces em dashes with a chosen substitute, for a quick "de-tell" pass. */
export function replaceEmDashes(text, replacement = ", ") {
  if (typeof text !== "string") return "";
  return text.replace(/\s*—\s*/gu, replacement);
}
