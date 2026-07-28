/**
 * Name tracing worksheet layout.
 *
 * The maths here is typographic, not arbitrary:
 *
 *  - A worksheet is specified by the x-height a child should write at, in
 *    millimetres. Type is specified by em size, and for a humanist sans face
 *    the x-height is close to 0.52 em, so  fontSize = xHeight / 0.52.
 *    (Every family differs slightly; the printed sheet is the check.)
 *  - Ascenders and descenders are set as multiples of the x-height so the
 *    four-line bands scale with the letter size.
 *  - How many times the name fits across a row is estimated from a per-letter
 *    advance-width table in em units. Proportional faces vary, so this is an
 *    estimate — deliberately conservative, and the preview shows the real fit.
 */

/** ISO 216 and ANSI page sizes in millimetres, portrait. */
export const PAGE_SIZES = {
  a4: { key: "a4", label: "A4 (210 × 297 mm)", width: 210, height: 297 },
  a5: { key: "a5", label: "A5 (148 × 210 mm)", width: 148, height: 210 },
  letter: { key: "letter", label: "US Letter (8.5 × 11 in)", width: 215.9, height: 279.4 },
};

/** x-height as a fraction of the em size for a typical humanist sans face. */
export const X_HEIGHT_RATIO = 0.52;

/** Ascender band height, as a multiple of the x-height. */
export const ASCENDER_RATIO = 0.7;

/** Descender band height, as a multiple of the x-height. */
export const DESCENDER_RATIO = 0.6;

/** Gap left between one traced repetition and the next, as a fraction of the em. */
export const WORD_GAP_EM = 0.6;

/** Gap between rows, as a multiple of the x-height. */
export const ROW_GAP_RATIO = 0.8;

/**
 * Advance widths in em units, grouped by how wide the glyph typically is in a
 * proportional sans face. Used only to estimate how many repetitions fit.
 */
export const ADVANCE_WIDTHS = {
  narrowLower: { chars: "ijlt", width: 0.34 },
  wideLower: { chars: "mw", width: 0.9 },
  normalLower: { chars: "abcdefghknopqrsuvxyz", width: 0.55 },
  narrowUpper: { chars: "IJ", width: 0.4 },
  wideUpper: { chars: "MW", width: 1.0 },
  normalUpper: { chars: "ABCDEFGHKLNOPQRSTUVXYZ", width: 0.72 },
  space: { chars: " ", width: 0.28 },
  punctuation: { chars: "-'", width: 0.32 },
};

/** Longest name the sheet will lay out. */
export const MAX_NAME_LENGTH = 24;

/** Bounds on the x-height a worksheet can ask for. */
export const MIN_X_HEIGHT_MM = 4;
export const MAX_X_HEIGHT_MM = 40;

/** Minimum page margin. */
export const MIN_MARGIN_MM = 5;

/** Tracing styles available for the letters. */
export const TRACE_STYLES = [
  { key: "dotted", label: "Dotted outline", note: "Hollow letters with a dashed edge — the child traces the outline." },
  { key: "outline", label: "Solid outline", note: "Hollow letters with a continuous thin edge." },
  { key: "grey", label: "Grey letters", note: "Filled pale letters written over directly." },
  { key: "guided", label: "First solid, rest dotted", note: "One filled model on each row, then dotted copies to trace." },
];

/** How the name is cased on the sheet. */
export const CASE_STYLES = [
  { key: "title", label: "Title Case (Aarav)" },
  { key: "upper", label: "UPPERCASE (AARAV)" },
  { key: "lower", label: "lowercase (aarav)" },
];

const round2 = (value) => Math.round(value * 100) / 100;

/** Advance width of a single character, in em units. */
export function advanceWidth(character) {
  for (const group of Object.values(ADVANCE_WIDTHS)) {
    if (group.chars.includes(character)) return group.width;
  }
  // Anything unlisted — accented Latin, other scripts — gets the normal width.
  return ADVANCE_WIDTHS.normalLower.width;
}

/** Estimated width of a whole string in em units. */
export function stringWidthEm(text) {
  return [...String(text ?? "")].reduce((sum, character) => sum + advanceWidth(character), 0);
}

/** Keep letters, spaces, hyphens and apostrophes; collapse repeated spaces. */
export function cleanName(value) {
  return String(value ?? "")
    .replace(/[^\p{L}\s'-]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Apply the chosen case style. */
export function applyCase(name, caseKey) {
  if (caseKey === "upper") return name.toUpperCase();
  if (caseKey === "lower") return name.toLowerCase();
  return name
    .split(" ")
    .map((word) => (word.length === 0 ? word : word[0].toUpperCase() + word.slice(1).toLowerCase()))
    .join(" ");
}

/**
 * Lay out the worksheet.
 *
 * @param {{name:string, xHeightMm:number, caseKey?:string, traceKey?:string,
 *          pageKey?:string, marginMm?:number, showRuling?:boolean}} input
 */
export function buildWorksheet({
  name,
  xHeightMm = 12,
  caseKey = "title",
  traceKey = "guided",
  pageKey = "a4",
  marginMm = 15,
  showRuling = true,
} = {}) {
  const cleaned = cleanName(name);
  if (cleaned.length === 0) {
    return { error: "Enter the child's name using letters." };
  }
  if (cleaned.length > MAX_NAME_LENGTH) {
    return { error: `Keep the name to ${MAX_NAME_LENGTH} characters or fewer for a tracing sheet.` };
  }

  const page = PAGE_SIZES[pageKey];
  if (!page) return { error: "Choose one of the listed page sizes." };

  const style = TRACE_STYLES.find((entry) => entry.key === traceKey);
  if (!style) return { error: "Choose one of the listed tracing styles." };

  if (!CASE_STYLES.some((entry) => entry.key === caseKey)) {
    return { error: "Choose one of the listed letter cases." };
  }

  const xHeight = Number(xHeightMm);
  if (!Number.isFinite(xHeight) || xHeight < MIN_X_HEIGHT_MM || xHeight > MAX_X_HEIGHT_MM) {
    return {
      error: `x-height must be between ${MIN_X_HEIGHT_MM} mm and ${MAX_X_HEIGHT_MM} mm.`,
    };
  }

  const margin = Number(marginMm);
  if (!Number.isFinite(margin) || margin < MIN_MARGIN_MM) {
    return { error: `Margin must be at least ${MIN_MARGIN_MM} mm.` };
  }
  if (margin * 2 >= page.width || margin * 2 >= page.height) {
    return { error: "Those margins leave no room on the page — reduce them." };
  }

  const text = applyCase(cleaned, caseKey);
  const fontSizeMm = xHeight / X_HEIGHT_RATIO;
  const ascenderMm = xHeight * ASCENDER_RATIO;
  const descenderMm = xHeight * DESCENDER_RATIO;
  const bandHeightMm = ascenderMm + xHeight + descenderMm;
  const rowGapMm = xHeight * ROW_GAP_RATIO;
  const rowPitchMm = bandHeightMm + rowGapMm;

  const usableWidth = page.width - margin * 2;
  const usableHeight = page.height - margin * 2;

  const nameWidthMm = stringWidthEm(text) * fontSizeMm;
  const wordGapMm = WORD_GAP_EM * fontSizeMm;
  const slotWidthMm = nameWidthMm + wordGapMm;

  if (nameWidthMm > usableWidth) {
    return {
      error: `At a ${round2(xHeight)} mm x-height the name needs about ${round2(nameWidthMm)} mm, more than the ${round2(usableWidth)} mm of writing width. Use a smaller x-height or a wider page.`,
    };
  }

  const rowCount = Math.floor(usableHeight / rowPitchMm);
  if (rowCount < 1) {
    return {
      error: `A ${round2(rowPitchMm)} mm row does not fit in ${round2(usableHeight)} mm of page — reduce the x-height or the margin.`,
    };
  }

  const perRow = Math.max(1, Math.floor(usableWidth / slotWidthMm));

  const rows = [];
  for (let r = 0; r < rowCount; r += 1) {
    const top = margin + r * rowPitchMm;
    const waistY = top + ascenderMm;
    const baselineY = waistY + xHeight;
    const items = [];
    for (let c = 0; c < perRow; c += 1) {
      const solid = style.key === "grey" || (style.key === "guided" && c === 0);
      const dotted = style.key === "dotted" || (style.key === "guided" && c > 0);
      items.push({
        index: c + 1,
        x: round2(margin + c * slotWidthMm),
        solid,
        dotted,
        outline: style.key === "outline",
      });
    }
    rows.push({
      index: r + 1,
      topY: round2(top),
      waistY: round2(waistY),
      baselineY: round2(baselineY),
      bottomY: round2(baselineY + descenderMm),
      items,
    });
  }

  return {
    name: cleaned,
    text,
    caseKey,
    style,
    page,
    showRuling: Boolean(showRuling),
    marginMm: round2(margin),
    contentLeftMm: round2(margin),
    contentRightMm: round2(page.width - margin),
    xHeightMm: round2(xHeight),
    fontSizeMm: round2(fontSizeMm),
    ascenderMm: round2(ascenderMm),
    descenderMm: round2(descenderMm),
    bandHeightMm: round2(bandHeightMm),
    rowGapMm: round2(rowGapMm),
    rowPitchMm: round2(rowPitchMm),
    usableWidthMm: round2(usableWidth),
    usableHeightMm: round2(usableHeight),
    nameWidthMm: round2(nameWidthMm),
    slotWidthMm: round2(slotWidthMm),
    rowCount,
    perRow,
    totalTracings: rowCount * perRow,
    letters: [...text].filter((character) => character.trim().length > 0),
    rows,
  };
}

/**
 * Largest x-height at which the name still fits once across the writing width.
 * Useful for long names — answers "how big can I make this?".
 */
export function maxXHeightForName({ name, pageKey = "a4", marginMm = 15, caseKey = "title" } = {}) {
  const cleaned = cleanName(name);
  if (cleaned.length === 0) return { error: "Enter the child's name using letters." };
  const page = PAGE_SIZES[pageKey];
  if (!page) return { error: "Choose one of the listed page sizes." };
  const margin = Number(marginMm);
  if (!Number.isFinite(margin) || margin < MIN_MARGIN_MM) {
    return { error: `Margin must be at least ${MIN_MARGIN_MM} mm.` };
  }
  const usableWidth = page.width - margin * 2;
  if (usableWidth <= 0) return { error: "Those margins leave no writing width." };

  const widthEm = stringWidthEm(applyCase(cleaned, caseKey));
  if (widthEm <= 0) return { error: "That name has no measurable width." };

  // nameWidth = widthEm * (xHeight / X_HEIGHT_RATIO)  =>  solve for xHeight.
  const xHeight = (usableWidth * X_HEIGHT_RATIO) / widthEm;
  return {
    xHeightMm: round2(Math.min(MAX_X_HEIGHT_MM, xHeight)),
    cappedByLimit: xHeight > MAX_X_HEIGHT_MM,
  };
}
