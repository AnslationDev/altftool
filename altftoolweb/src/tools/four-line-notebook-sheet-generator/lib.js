/**
 * Ruled handwriting sheet geometry.
 *
 * A ruled sheet is described by three band heights measured in millimetres:
 *   ascender band  — from the top line down to the head line
 *   x-height band  — from the head line down to the base line (the middle band)
 *   descender band — from the base line down to the bottom line
 *
 * Which of those bands a ruling actually draws depends on the type:
 *   four line   — top, head, base, bottom  (all three bands)
 *   three line  — top, head, base          (ascender + x-height)
 *   two line    — head, base               (x-height only)
 *   single line — base only                (no bands; rows are just spaced)
 *
 * Row pitch = drawn band height + the gap you set between rows, and the number
 * of rows is the usable page height divided by that pitch, rounded down.
 *
 * The single-line presets use the real, published rulings of commercial paper:
 * US wide rule is 11/32 inch, college rule 9/32 inch and narrow rule 1/4 inch.
 */

/** ISO 216 and ANSI page sizes in millimetres, portrait. */
export const PAGE_SIZES = {
  a4: { key: "a4", label: "A4 (210 × 297 mm)", width: 210, height: 297 },
  a5: { key: "a5", label: "A5 (148 × 210 mm)", width: 148, height: 210 },
  letter: { key: "letter", label: "US Letter (8.5 × 11 in)", width: 215.9, height: 279.4 },
  legal: { key: "legal", label: "US Legal (8.5 × 14 in)", width: 215.9, height: 355.6 },
};

/** US wide rule: 11/32 inch between lines. */
export const US_WIDE_RULE_MM = 8.73;
/** US college rule: 9/32 inch between lines. */
export const US_COLLEGE_RULE_MM = 7.14;
/** US narrow rule: 1/4 inch between lines. */
export const US_NARROW_RULE_MM = 6.35;

/**
 * Ruling types. `bands` lists which bands are drawn, top to bottom.
 * `dashedLines` names the lines drawn as a dashed guide rather than solid.
 */
export const RULING_TYPES = [
  {
    key: "four-line",
    label: "Four line",
    bands: ["ascender", "x", "descender"],
    dashedLines: ["head"],
    note: "The standard Indian four-line copy: capitals and tall letters fill the top band, the middle band is the x-height, tails drop into the bottom band.",
  },
  {
    key: "three-line",
    label: "Three line",
    bands: ["ascender", "x"],
    dashedLines: ["head"],
    note: "Top, dashed middle and base line — common for early print handwriting where descenders are not yet taught.",
  },
  {
    key: "two-line",
    label: "Two line",
    bands: ["x"],
    dashedLines: [],
    note: "Head line and base line only, for pupils who already control letter height.",
  },
  {
    key: "single-line",
    label: "Single line",
    bands: [],
    dashedLines: [],
    note: "One writing line per row, like ordinary ruled notebook paper.",
  },
];

/** Suggested band heights by stage. These are practical suggestions, not an official standard. */
export const SPACING_PRESETS = [
  { key: "nursery", label: "Nursery / LKG (largest)", x: 12, ascender: 8, descender: 8, gap: 10 },
  { key: "ukg", label: "UKG / Class 1", x: 10, ascender: 6, descender: 6, gap: 8 },
  { key: "class23", label: "Class 2–3", x: 8, ascender: 5, descender: 5, gap: 7 },
  { key: "class45", label: "Class 4–5", x: 6, ascender: 4, descender: 4, gap: 6 },
  { key: "cursive", label: "Cursive practice", x: 8, ascender: 6, descender: 6, gap: 8 },
];

/** Input bounds, in millimetres. */
export const MIN_BAND_MM = 1;
export const MAX_BAND_MM = 60;
export const MIN_MARGIN_MM = 5;
export const MAX_GAP_MM = 60;

const round2 = (value) => Math.round(value * 100) / 100;

/** Look up a ruling type by key. */
export function findRuling(key) {
  return RULING_TYPES.find((type) => type.key === key) ?? null;
}

/**
 * Build the ruled sheet.
 *
 * @param {{rulingKey:string, xHeightMm:number, ascenderMm:number,
 *          descenderMm:number, rowGapMm:number, pageKey:string,
 *          marginMm:number, landscape?:boolean}} input
 */
export function buildSheet({
  rulingKey = "four-line",
  xHeightMm = 10,
  ascenderMm = 6,
  descenderMm = 6,
  rowGapMm = 8,
  pageKey = "a4",
  marginMm = 15,
  landscape = false,
} = {}) {
  const ruling = findRuling(rulingKey);
  if (!ruling) return { error: "Choose one of the listed ruling types." };

  const basePage = PAGE_SIZES[pageKey];
  if (!basePage) return { error: "Choose one of the listed page sizes." };

  const page = landscape
    ? { ...basePage, width: basePage.height, height: basePage.width }
    : basePage;

  const values = {
    x: Number(xHeightMm),
    ascender: Number(ascenderMm),
    descender: Number(descenderMm),
  };
  const gap = Number(rowGapMm);
  const margin = Number(marginMm);

  for (const bandKey of ruling.bands) {
    const value = values[bandKey];
    if (!Number.isFinite(value) || value < MIN_BAND_MM || value > MAX_BAND_MM) {
      return {
        error: `Each band this ruling draws must be between ${MIN_BAND_MM} mm and ${MAX_BAND_MM} mm.`,
      };
    }
  }
  if (!Number.isFinite(gap) || gap < 0 || gap > MAX_GAP_MM) {
    return { error: `Gap between rows must be between 0 mm and ${MAX_GAP_MM} mm.` };
  }
  if (!Number.isFinite(margin) || margin < MIN_MARGIN_MM) {
    return { error: `Margin must be at least ${MIN_MARGIN_MM} mm.` };
  }
  if (margin * 2 >= page.height || margin * 2 >= page.width) {
    return { error: "Those margins leave no room on the page — reduce them." };
  }

  const bandHeight = ruling.bands.reduce((sum, bandKey) => sum + values[bandKey], 0);
  const pitch = bandHeight + gap;
  if (!(pitch > 0)) {
    return { error: "Set a gap greater than zero for a single-line sheet." };
  }

  const usableWidth = page.width - margin * 2;
  const usableHeight = page.height - margin * 2;
  const rowCount = Math.floor(usableHeight / pitch);
  if (rowCount < 1) {
    return {
      error: `A ${round2(pitch)} mm row does not fit in ${round2(usableHeight)} mm of page — reduce the band heights, the gap or the margin.`,
    };
  }

  const rows = [];
  for (let i = 0; i < rowCount; i += 1) {
    const top = margin + i * pitch;
    const lines = [];
    if (ruling.bands.length === 0) {
      lines.push({ role: "base", y: round2(top), dashed: false, weight: "strong" });
    } else {
      let cursor = top;
      if (ruling.bands.includes("ascender")) {
        lines.push({ role: "top", y: round2(cursor), dashed: false, weight: "light" });
        cursor += values.ascender;
      }
      lines.push({
        role: "head",
        y: round2(cursor),
        dashed: ruling.dashedLines.includes("head"),
        weight: "medium",
      });
      cursor += values.x;
      lines.push({ role: "base", y: round2(cursor), dashed: false, weight: "strong" });
      if (ruling.bands.includes("descender")) {
        cursor += values.descender;
        lines.push({ role: "bottom", y: round2(cursor), dashed: false, weight: "light" });
      }
    }
    rows.push({ index: i + 1, top: round2(top), lines });
  }

  return {
    ruling,
    page,
    landscape: Boolean(landscape),
    xHeightMm: round2(values.x),
    ascenderMm: round2(values.ascender),
    descenderMm: round2(values.descender),
    rowGapMm: round2(gap),
    marginMm: round2(margin),
    contentLeftMm: round2(margin),
    contentRightMm: round2(page.width - margin),
    bandHeightMm: round2(bandHeight),
    pitchMm: round2(pitch),
    usableWidthMm: round2(usableWidth),
    usableHeightMm: round2(usableHeight),
    rowCount,
    rows,
    linesPerRow: rows[0].lines.length,
    totalLines: rowCount * rows[0].lines.length,
    inkedHeightMm: round2(rowCount * pitch - gap),
  };
}

/** Convert a millimetre value to inches, rounded to three decimals. */
export function mmToInches(mm) {
  const value = Number(mm);
  if (!Number.isFinite(value)) return null;
  return Math.round((value / 25.4) * 1000) / 1000;
}

/**
 * How many rows a given pitch yields on each stocked page size, so a teacher
 * can pick the paper before printing.
 */
export function rowsPerPageTable({ pitchMm, marginMm = 15, landscape = false } = {}) {
  const pitch = Number(pitchMm);
  const margin = Number(marginMm);
  if (!Number.isFinite(pitch) || pitch <= 0) {
    return { error: "Row pitch must be greater than zero." };
  }
  if (!Number.isFinite(margin) || margin < MIN_MARGIN_MM) {
    return { error: `Margin must be at least ${MIN_MARGIN_MM} mm.` };
  }
  const rows = Object.values(PAGE_SIZES)
    .map((page) => {
      const height = landscape ? page.width : page.height;
      const usable = height - margin * 2;
      return { page, usableMm: round2(usable), rows: usable > 0 ? Math.floor(usable / pitch) : 0 };
    })
    .filter((entry) => entry.usableMm > 0);
  if (rows.length === 0) {
    return { error: "Those margins leave no usable height on any page size." };
  }
  return { rows };
}
