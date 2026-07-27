/**
 * Dyslexia Friendly Text Preview — pure evaluation module.
 * No React, no DOM, no clock reads.
 */

/**
 * WCAG 2.2 success criterion 1.4.12 Text Spacing (Level AA). The criterion
 * requires content to stay readable when a reader applies these values; using
 * them as authored defaults is the simplest way to satisfy it.
 */
export const WCAG_TEXT_SPACING = {
  lineHeight: 1.5, // times the font size
  paragraphSpacing: 2, // times the font size
  letterSpacing: 0.12, // em
  wordSpacing: 0.16, // em
};

/**
 * British Dyslexia Association Style Guide recommendations.
 * Body copy of 12-14 pt, 1.5 line spacing, left aligned, 60-70 characters per
 * line, bold rather than italics for emphasis, and no blocks of capitals.
 */
export const BDA_GUIDE = {
  minFontPt: 12,
  maxFontPt: 14,
  minMeasureChars: 60,
  maxMeasureChars: 70,
};

/** CSS reference pixel is 1/96 in and a point is 1/72 in, so 1 pt = 4/3 px. */
export const PX_PER_PT = 96 / 72;

export const MIN_FONT_PX = BDA_GUIDE.minFontPt * PX_PER_PT; // 16 px
export const MAX_COMFORT_FONT_PX = 32;

/**
 * Mean advance width of a lowercase Latin glyph as a fraction of the font size,
 * used to estimate characters per line without measuring in the DOM.
 */
export const AVG_GLYPH_EM = 0.5;

/**
 * Typefaces the BDA Style Guide names as easier to read. All are sans-serif
 * with clearly differentiated letterforms.
 */
export const RECOMMENDED_FACES = [
  { id: "system", label: "System sans-serif", stack: "system-ui, sans-serif" },
  { id: "verdana", label: "Verdana", stack: "Verdana, Geneva, sans-serif" },
  { id: "tahoma", label: "Tahoma", stack: "Tahoma, Geneva, sans-serif" },
  { id: "trebuchet", label: "Trebuchet MS", stack: "'Trebuchet MS', Tahoma, sans-serif" },
  { id: "arial", label: "Arial", stack: "Arial, Helvetica, sans-serif" },
  { id: "century-gothic", label: "Century Gothic", stack: "'Century Gothic', 'URW Gothic', sans-serif" },
  { id: "georgia", label: "Georgia (serif, for comparison)", stack: "Georgia, 'Times New Roman', serif" },
];

export const ALIGNMENTS = [
  { id: "left", label: "Left aligned" },
  { id: "justify", label: "Justified" },
  { id: "center", label: "Centred" },
];

export function ptToPx(pt) {
  const value = Number(pt);
  if (!Number.isFinite(value)) return null;
  return value * PX_PER_PT;
}

export function pxToPt(px) {
  const value = Number(px);
  if (!Number.isFinite(value)) return null;
  return value / PX_PER_PT;
}

/**
 * Characters that fit on one line at this font size and column width.
 * An estimate, not a measurement, so the result is stable across machines.
 */
export function estimateMeasure(columnWidthPx, fontSizePx, letterSpacingEm) {
  const width = Number(columnWidthPx);
  const size = Number(fontSizePx);
  const tracking = Number(letterSpacingEm) || 0;
  if (!Number.isFinite(width) || width <= 0) return null;
  if (!Number.isFinite(size) || size <= 0) return null;
  const advance = size * (AVG_GLYPH_EM + Math.max(0, tracking));
  if (advance <= 0) return null;
  return Math.floor(width / advance);
}

/**
 * Count vowel groups, drop a silent trailing "e" or "-ed", never return less
 * than one. The "-ed" ending is only silent when it does not follow t or d —
 * "walked" is one syllable but "wanted" and "complicated" keep theirs — so the
 * pattern excludes those two letters.
 */
export function countSyllables(word) {
  const clean = String(word ?? "").toLowerCase().replace(/[^a-z]/g, "");
  if (clean.length === 0) return 0;
  if (clean.length <= 3) return 1;
  const groups = clean
    .replace(/(?:[^laeiouy]es|[^tdlaeiouy]ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "")
    .match(/[aeiouy]{1,2}/g);
  return groups ? groups.length : 1;
}

/**
 * Flesch Reading Ease and Flesch-Kincaid Grade Level.
 *   FRE  = 206.835 - 1.015 x (words / sentences) - 84.6 x (syllables / words)
 *   FKGL = 0.39 x (words / sentences) + 11.8 x (syllables / words) - 15.59
 * Syllables are counted with the standard vowel-group heuristic, so treat both
 * numbers as approximate.
 */
export function readability(text) {
  const source = String(text ?? "").trim();
  if (source.length === 0) {
    return { error: "Paste some text to measure how hard it is to read." };
  }

  const words = source.split(/\s+/).filter((token) => /[A-Za-z0-9]/.test(token));
  if (words.length === 0) {
    return { error: "That text has no readable words in it." };
  }

  const sentenceParts = source
    .split(/[.!?]+(?:\s|$)/)
    .map((part) => part.trim())
    .filter(Boolean);
  const sentences = Math.max(1, sentenceParts.length);

  const syllables = words.reduce((total, word) => total + countSyllables(word), 0);
  const wordsPerSentence = words.length / sentences;
  const syllablesPerWord = syllables / words.length;

  const fleschReadingEase = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  const fleschKincaidGrade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;

  const longWords = words.filter((word) => countSyllables(word) >= 3).length;

  let band = "Very difficult";
  if (fleschReadingEase >= 90) band = "Very easy";
  else if (fleschReadingEase >= 80) band = "Easy";
  else if (fleschReadingEase >= 70) band = "Fairly easy";
  else if (fleschReadingEase >= 60) band = "Plain English";
  else if (fleschReadingEase >= 50) band = "Fairly difficult";
  else if (fleschReadingEase >= 30) band = "Difficult";

  return {
    words: words.length,
    sentences,
    syllables,
    wordsPerSentence,
    syllablesPerWord,
    longWords,
    longWordPct: (longWords / words.length) * 100,
    fleschReadingEase,
    fleschKincaidGrade,
    band,
  };
}

/**
 * Check a set of typographic settings against WCAG 1.4.12 and the BDA guide.
 * Returns one entry per rule plus a share of rules met.
 */
export function evaluateSettings(input) {
  const {
    fontSizePx,
    lineHeight,
    letterSpacingEm,
    wordSpacingEm,
    paragraphSpacingEm,
    columnWidthPx,
    align = "left",
    allCaps = false,
    italic = false,
  } = input || {};

  const numbers = {
    fontSizePx: Number(fontSizePx),
    lineHeight: Number(lineHeight),
    letterSpacingEm: Number(letterSpacingEm),
    wordSpacingEm: Number(wordSpacingEm),
    paragraphSpacingEm: Number(paragraphSpacingEm),
    columnWidthPx: Number(columnWidthPx),
  };

  if (Object.values(numbers).some((value) => !Number.isFinite(value))) {
    return { error: "Every typography value has to be a number." };
  }
  if (numbers.fontSizePx <= 0) return { error: "Font size must be greater than zero." };
  if (numbers.columnWidthPx <= 0) return { error: "Column width must be greater than zero." };
  if (numbers.lineHeight <= 0) return { error: "Line height must be greater than zero." };
  if (numbers.letterSpacingEm < -0.2 || numbers.wordSpacingEm < -0.2) {
    return { error: "Negative tracking below -0.2 em collides letterforms." };
  }
  if (numbers.paragraphSpacingEm < 0) return { error: "Paragraph spacing cannot be negative." };

  const measure = estimateMeasure(numbers.columnWidthPx, numbers.fontSizePx, numbers.letterSpacingEm);
  const fontPt = pxToPt(numbers.fontSizePx);

  const rules = [
    {
      id: "lineHeight",
      source: "WCAG 1.4.12",
      label: `Line height at least ${WCAG_TEXT_SPACING.lineHeight}× the font size`,
      pass: numbers.lineHeight >= WCAG_TEXT_SPACING.lineHeight,
      actual: `${numbers.lineHeight.toFixed(2)}×`,
    },
    {
      id: "letterSpacing",
      source: "WCAG 1.4.12",
      label: `Letter spacing at least ${WCAG_TEXT_SPACING.letterSpacing} em`,
      pass: numbers.letterSpacingEm >= WCAG_TEXT_SPACING.letterSpacing,
      actual: `${numbers.letterSpacingEm.toFixed(3)} em`,
    },
    {
      id: "wordSpacing",
      source: "WCAG 1.4.12",
      label: `Word spacing at least ${WCAG_TEXT_SPACING.wordSpacing} em`,
      pass: numbers.wordSpacingEm >= WCAG_TEXT_SPACING.wordSpacing,
      actual: `${numbers.wordSpacingEm.toFixed(3)} em`,
    },
    {
      id: "paragraphSpacing",
      source: "WCAG 1.4.12",
      label: `Space after a paragraph at least ${WCAG_TEXT_SPACING.paragraphSpacing}× the font size`,
      pass: numbers.paragraphSpacingEm >= WCAG_TEXT_SPACING.paragraphSpacing,
      actual: `${numbers.paragraphSpacingEm.toFixed(2)}×`,
    },
    {
      id: "fontSize",
      source: "BDA style guide",
      label: `Body text ${BDA_GUIDE.minFontPt}–${BDA_GUIDE.maxFontPt} pt or larger`,
      pass: numbers.fontSizePx >= MIN_FONT_PX,
      actual: `${numbers.fontSizePx.toFixed(0)} px (${fontPt === null ? "?" : fontPt.toFixed(1)} pt)`,
    },
    {
      id: "measure",
      source: "BDA style guide",
      label: `${BDA_GUIDE.minMeasureChars}–${BDA_GUIDE.maxMeasureChars} characters per line`,
      pass:
        measure !== null &&
        measure >= BDA_GUIDE.minMeasureChars &&
        measure <= BDA_GUIDE.maxMeasureChars,
      actual: measure === null ? "unknown" : `about ${measure} characters`,
    },
    {
      id: "align",
      source: "BDA style guide",
      label: "Left aligned, never justified",
      pass: align === "left",
      actual: align === "justify" ? "justified" : align,
    },
    {
      id: "allCaps",
      source: "BDA style guide",
      label: "No blocks of capital letters",
      pass: !allCaps,
      actual: allCaps ? "all capitals" : "sentence case",
    },
    {
      id: "italic",
      source: "BDA style guide",
      label: "Bold for emphasis rather than italics",
      pass: !italic,
      actual: italic ? "italic" : "upright",
    },
  ];

  const passed = rules.filter((rule) => rule.pass).length;

  return {
    rules,
    passed,
    total: rules.length,
    scorePct: (passed / rules.length) * 100,
    measure,
    fontPt,
    wcagPassed: rules.filter((rule) => rule.source === "WCAG 1.4.12" && rule.pass).length,
    wcagTotal: rules.filter((rule) => rule.source === "WCAG 1.4.12").length,
    // Resolved CSS values so the preview holds no arithmetic of its own.
    css: {
      fontSize: `${numbers.fontSizePx}px`,
      lineHeight: String(numbers.lineHeight),
      letterSpacing: `${numbers.letterSpacingEm}em`,
      wordSpacing: `${numbers.wordSpacingEm}em`,
      paragraphSpacing: `${numbers.paragraphSpacingEm}em`,
      maxWidth: `${numbers.columnWidthPx}px`,
      textAlign: align,
      textTransform: allCaps ? "uppercase" : "none",
      fontStyle: italic ? "italic" : "normal",
    },
  };
}

/** The same settings written out as a CSS rule the reader can paste. */
export function toCssBlock(evaluation, fontStack) {
  if (!evaluation || evaluation.error) return "";
  const { css } = evaluation;
  return [
    "p {",
    `  font-family: ${fontStack};`,
    `  font-size: ${css.fontSize};`,
    `  line-height: ${css.lineHeight};`,
    `  letter-spacing: ${css.letterSpacing};`,
    `  word-spacing: ${css.wordSpacing};`,
    `  margin-block-end: ${css.paragraphSpacing};`,
    `  max-width: ${css.maxWidth};`,
    `  text-align: ${css.textAlign};`,
    `  text-transform: ${css.textTransform};`,
    `  font-style: ${css.fontStyle};`,
    "}",
  ].join("\n");
}
