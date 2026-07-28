/**
 * Number tracing worksheet geometry.
 *
 * Everything here is millimetre arithmetic against a real paper size, so the
 * generated sheet prints at the size a teacher asked for instead of "whatever
 * the browser felt like". No React, no DOM.
 */

/** ISO 216 A4 is defined as 210 x 297 mm. US Letter is 8.5 x 11 in = 215.9 x 279.4 mm. */
export const PAGE_SIZES = {
  a4: { id: "a4", label: "A4 (210 x 297 mm)", widthMm: 210, heightMm: 297 },
  letter: { id: "letter", label: "US Letter (216 x 279 mm)", widthMm: 215.9, heightMm: 279.4 },
};

/** Devanagari digits occupy U+0966 (०) to U+096F (९) in Unicode. */
export const DEVANAGARI_ZERO_CODE_POINT = 0x0966;

/**
 * Advance width of a digit expressed as a fraction of its figure height.
 * Tabular figures in common worksheet faces are about 0.55 em wide with a
 * figure height near 0.70 em, giving 0.55 / 0.70 = 0.79 for Latin. Devanagari
 * digits carry the shirorekha and sit wider, so they need more room per glyph.
 */
export const DIGIT_WIDTH_RATIO = { latin: 0.75, devanagari: 0.85 };

/**
 * Figure height of a digit as a fraction of the font size. Cap/figure height in
 * most text faces sits near 0.70 em, so a digit that must print d mm tall needs
 * a font size of d / 0.70 mm.
 */
export const FIGURE_HEIGHT_EM_RATIO = 0.7;

/** Horizontal gap between two traced glyphs, as a fraction of glyph height. */
export const GLYPH_GAP_RATIO = 0.35;

/** Vertical gap between two tracing rows, as a fraction of glyph height. */
export const ROW_GAP_RATIO = 0.6;

/** Height reserved above each number's rows for its label (digit + word). */
export const LABEL_HEIGHT_MM = 6;

/** Practical bounds. Below 8 mm a 4-year-old cannot stay inside the stroke;
 *  above 45 mm you fit fewer than three digits on an A4 line. */
export const MIN_GLYPH_HEIGHT_MM = 8;
export const MAX_GLYPH_HEIGHT_MM = 45;

export const MIN_MARGIN_MM = 5;
export const MAX_MARGIN_MM = 40;

export const MIN_NUMBER = 0;
export const MAX_NUMBER = 100;

export const MAX_ROWS_PER_NUMBER = 8;

const ENGLISH_ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

const ENGLISH_TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

/** Hindi cardinal numbers. Only the values whose spelling is unambiguous are
 *  listed: 0-20 plus the round tens. Anything else returns "" rather than an
 *  invented word. */
const HINDI_WORDS = {
  0: "शून्य",
  1: "एक",
  2: "दो",
  3: "तीन",
  4: "चार",
  5: "पाँच",
  6: "छह",
  7: "सात",
  8: "आठ",
  9: "नौ",
  10: "दस",
  11: "ग्यारह",
  12: "बारह",
  13: "तेरह",
  14: "चौदह",
  15: "पंद्रह",
  16: "सोलह",
  17: "सत्रह",
  18: "अठारह",
  19: "उन्नीस",
  20: "बीस",
  30: "तीस",
  40: "चालीस",
  50: "पचास",
  60: "साठ",
  70: "सत्तर",
  80: "अस्सी",
  90: "नब्बे",
  100: "सौ",
};

/** English spelling for any whole number from 0 to 100. */
export function englishNumberWord(value) {
  if (!Number.isInteger(value) || value < 0 || value > 100) return "";
  if (value === 100) return "one hundred";
  if (value < 20) return ENGLISH_ONES[value];
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return ones === 0 ? ENGLISH_TENS[tens] : `${ENGLISH_TENS[tens]}-${ENGLISH_ONES[ones]}`;
}

/** Hindi spelling where it is known, otherwise an empty string. */
export function hindiNumberWord(value) {
  if (!Number.isInteger(value)) return "";
  return HINDI_WORDS[value] || "";
}

/** Rewrite an integer's digits into Devanagari numerals. */
export function toDevanagariDigits(value) {
  return String(value).replace(/[0-9]/g, (digit) =>
    String.fromCodePoint(DEVANAGARI_ZERO_CODE_POINT + Number(digit)),
  );
}

/** The glyph string a child traces for one number, in the chosen script. */
export function digitGlyph(value, script) {
  return script === "devanagari" ? toDevanagariDigits(value) : String(value);
}

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Lay out a full tracing worksheet.
 *
 * @returns {object} either { error } or the complete sheet geometry, including
 *   the exact page break positions (groups are never split across a page).
 */
export function buildTracingSheet({
  script = "latin",
  pageSize = "a4",
  from = 1,
  to = 10,
  rowsPerNumber = 2,
  glyphHeightMm = 20,
  marginMm = 15,
} = {}) {
  const page = PAGE_SIZES[pageSize];
  if (!page) return { error: "Choose either A4 or US Letter paper." };
  if (script !== "latin" && script !== "devanagari") {
    return { error: "Choose either Latin (0-9) or Devanagari (०-९) digits." };
  }

  const nums = [from, to, rowsPerNumber, glyphHeightMm, marginMm];
  if (nums.some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }
  if (!Number.isInteger(from) || !Number.isInteger(to)) {
    return { error: "The number range must use whole numbers." };
  }
  if (from < MIN_NUMBER || to > MAX_NUMBER) {
    return { error: `The range must stay between ${MIN_NUMBER} and ${MAX_NUMBER}.` };
  }
  if (to < from) return { error: "The last number must not be smaller than the first." };
  if (!Number.isInteger(rowsPerNumber) || rowsPerNumber < 1 || rowsPerNumber > MAX_ROWS_PER_NUMBER) {
    return { error: `Rows per number must be between 1 and ${MAX_ROWS_PER_NUMBER}.` };
  }
  if (glyphHeightMm < MIN_GLYPH_HEIGHT_MM || glyphHeightMm > MAX_GLYPH_HEIGHT_MM) {
    return {
      error: `Digit height must be between ${MIN_GLYPH_HEIGHT_MM} mm and ${MAX_GLYPH_HEIGHT_MM} mm.`,
    };
  }
  if (marginMm < MIN_MARGIN_MM || marginMm > MAX_MARGIN_MM) {
    return { error: `Page margin must be between ${MIN_MARGIN_MM} mm and ${MAX_MARGIN_MM} mm.` };
  }

  const usableWidthMm = page.widthMm - marginMm * 2;
  const usableHeightMm = page.heightMm - marginMm * 2;
  if (usableWidthMm <= 0 || usableHeightMm <= 0) {
    return { error: "Margins leave no printable area on this paper size." };
  }

  const glyphWidthMm = glyphHeightMm * DIGIT_WIDTH_RATIO[script];
  const glyphGapMm = glyphHeightMm * GLYPH_GAP_RATIO;
  const rowGapMm = glyphHeightMm * ROW_GAP_RATIO;

  // n glyphs need n widths plus (n-1) gaps: n <= (usable + gap) / (width + gap).
  const glyphsPerRow = Math.floor((usableWidthMm + glyphGapMm) / (glyphWidthMm + glyphGapMm));
  if (glyphsPerRow < 1) {
    return { error: "One digit at this height is wider than the printable area. Reduce the digit height or the margin." };
  }

  const groupHeightMm =
    LABEL_HEIGHT_MM + rowsPerNumber * glyphHeightMm + (rowsPerNumber - 1) * rowGapMm;
  if (groupHeightMm > usableHeightMm) {
    return {
      error: "One number's rows are taller than the page. Use fewer rows per number or a smaller digit height.",
    };
  }

  const groups = [];
  for (let value = from; value <= to; value += 1) {
    const glyph = digitGlyph(value, script);
    groups.push({
      value,
      glyph,
      englishWord: englishNumberWord(value),
      hindiWord: hindiNumberWord(value),
      rows: Array.from({ length: rowsPerNumber }, (unusedRow, rowIndex) => ({
        rowIndex,
        cells: Array.from({ length: glyphsPerRow }, (unusedCell, cellIndex) => ({
          cellIndex,
          glyph,
          // The first glyph on the first row is printed solid as the model;
          // everything after it is a faint outline the child traces over.
          solid: rowIndex === 0 && cellIndex === 0,
        })),
      })),
    });
  }

  // Greedy page packing: a number's block never straddles a page break.
  const pages = [];
  let current = [];
  let used = 0;
  for (const group of groups) {
    const needed = current.length === 0 ? groupHeightMm : rowGapMm + groupHeightMm;
    if (used + needed > usableHeightMm && current.length > 0) {
      pages.push(current);
      current = [group];
      used = groupHeightMm;
    } else {
      current.push(group);
      used += needed;
    }
  }
  if (current.length > 0) pages.push(current);

  const groupsPerPage = pages.length > 0 ? pages[0].length : 0;
  const totalRows = groups.length * rowsPerNumber;

  return {
    script,
    from,
    to,
    page: { ...page },
    marginMm,
    usableWidthMm: round2(usableWidthMm),
    usableHeightMm: round2(usableHeightMm),
    glyphHeightMm,
    fontSizeMm: round2(glyphHeightMm / FIGURE_HEIGHT_EM_RATIO),
    glyphWidthMm: round2(glyphWidthMm),
    glyphGapMm: round2(glyphGapMm),
    rowGapMm: round2(rowGapMm),
    labelHeightMm: LABEL_HEIGHT_MM,
    glyphsPerRow,
    rowsPerNumber,
    groupHeightMm: round2(groupHeightMm),
    groupsPerPage,
    numberCount: groups.length,
    totalRows,
    totalGlyphs: totalRows * glyphsPerRow,
    pageCount: pages.length,
    pages,
  };
}
