/**
 * A-Z tracing worksheet layout.
 *
 * Sizing follows the same typographic rule as any handwriting sheet: type is
 * specified by em size, and for a humanist sans face the x-height sits at about
 * 0.52 em, so  fontSize = xHeight / 0.52. Ascender and descender bands are set
 * as multiples of the x-height so the four-line ruling scales with the letters.
 *
 * The letter groupings are the "formation families" used in mainstream
 * handwriting schemes, which teach letters by the movement they share rather
 * than in alphabetical order — the anticlockwise round letters first, then the
 * straight down-and-up letters, then the humped letters, then the zigzags.
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

/** Gap between one glyph slot and the next, as a fraction of the em. */
export const SLOT_GAP_EM = 0.5;

/** Gap between rows, as a multiple of the x-height. */
export const ROW_GAP_RATIO = 0.8;

/** The 26 letters in alphabetical order. */
export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** English vowels. */
export const VOWELS = ["A", "E", "I", "O", "U"];

/**
 * Letter formation families as taught in common handwriting schemes.
 * The order within each family is the order the movement is usually introduced.
 */
export const LETTER_FAMILIES = [
  {
    key: "curves",
    label: "Anticlockwise round letters",
    letters: ["C", "O", "A", "D", "G", "Q"],
    note: "All start with the same anticlockwise curve, so they are taught together first.",
  },
  {
    key: "straight",
    label: "Straight down-and-up letters",
    letters: ["L", "I", "T", "U", "J", "Y"],
    note: "A straight pull down to the line, then a lift or a hook.",
  },
  {
    key: "humps",
    label: "Humped letters",
    letters: ["R", "N", "M", "H", "B", "P", "K"],
    note: "Down, retrace up, then over — the shared arch movement.",
  },
  {
    key: "zigzag",
    label: "Zigzag letters",
    letters: ["V", "W", "X", "Z"],
    note: "Angled strokes with sharp changes of direction.",
  },
  {
    key: "odd",
    label: "Letters on their own",
    letters: ["E", "F", "S"],
    note: "These do not share a family movement and are usually taught individually.",
  },
];

/** Ready-made letter selections. */
export const SELECTIONS = [
  { key: "all", label: "Whole alphabet A–Z" },
  { key: "vowels", label: "Vowels only" },
  { key: "consonants", label: "Consonants only" },
  { key: "first13", label: "First half A–M" },
  { key: "last13", label: "Second half N–Z" },
  ...LETTER_FAMILIES.map((family) => ({ key: family.key, label: family.label })),
];

/** How each row is cased. */
export const CASE_MODES = [
  { key: "upper", label: "Capitals only (A)" },
  { key: "lower", label: "Lower case only (a)" },
  { key: "pair", label: "Pairs on one row (Aa)" },
  { key: "both", label: "Separate rows for A then a" },
];

/** Tracing styles. */
export const TRACE_STYLES = [
  { key: "guided", label: "First solid, rest dotted" },
  { key: "dotted", label: "All dotted" },
  { key: "grey", label: "All grey" },
];

/** Advance widths in em units for the glyphs this sheet prints. */
export const ADVANCE_WIDTHS = {
  narrowLower: { chars: "ijlt", width: 0.34 },
  wideLower: { chars: "mw", width: 0.9 },
  normalLower: { chars: "abcdefghknopqrsuvxyz", width: 0.55 },
  narrowUpper: { chars: "IJ", width: 0.4 },
  wideUpper: { chars: "MW", width: 1.0 },
  normalUpper: { chars: "ABCDEFGHKLNOPQRSTUVXYZ", width: 0.72 },
};

/** Bounds. */
export const MIN_X_HEIGHT_MM = 4;
export const MAX_X_HEIGHT_MM = 40;
export const MIN_MARGIN_MM = 5;
export const MAX_ROWS_PER_LETTER = 6;

const round2 = (value) => Math.round(value * 100) / 100;

/** Advance width of one character in em units. */
export function advanceWidth(character) {
  for (const group of Object.values(ADVANCE_WIDTHS)) {
    if (group.chars.includes(character)) return group.width;
  }
  return ADVANCE_WIDTHS.normalLower.width;
}

/** Estimated width of a string in em units. */
export function stringWidthEm(text) {
  return [...String(text ?? "")].reduce((sum, character) => sum + advanceWidth(character), 0);
}

/** Resolve a selection key to a list of upper-case letters. */
export function lettersForSelection(selectionKey) {
  if (selectionKey === "all") return [...ALPHABET];
  if (selectionKey === "vowels") return [...VOWELS];
  if (selectionKey === "consonants") return ALPHABET.filter((letter) => !VOWELS.includes(letter));
  if (selectionKey === "first13") return ALPHABET.slice(0, 13);
  if (selectionKey === "last13") return ALPHABET.slice(13);
  const family = LETTER_FAMILIES.find((entry) => entry.key === selectionKey);
  return family ? [...family.letters] : [];
}

/** Which family a letter belongs to, or null. */
export function familyOf(letter) {
  const upper = String(letter ?? "").toUpperCase();
  return LETTER_FAMILIES.find((family) => family.letters.includes(upper)) ?? null;
}

/** Expand a letter into the glyph strings each of its rows should show. */
export function glyphsForLetter(letter, caseMode) {
  const upper = letter.toUpperCase();
  const lower = letter.toLowerCase();
  if (caseMode === "upper") return [upper];
  if (caseMode === "lower") return [lower];
  if (caseMode === "pair") return [`${upper}${lower}`];
  if (caseMode === "both") return [upper, lower];
  return [];
}

/**
 * Build the worksheet.
 *
 * @param {{selectionKey?:string, customLetters?:string, caseMode?:string,
 *          traceKey?:string, xHeightMm?:number, rowsPerLetter?:number,
 *          pageKey?:string, marginMm?:number, showRuling?:boolean}} input
 */
export function buildAlphabetSheet({
  selectionKey = "all",
  customLetters = "",
  caseMode = "pair",
  traceKey = "guided",
  xHeightMm = 12,
  rowsPerLetter = 1,
  pageKey = "a4",
  marginMm = 15,
  showRuling = true,
} = {}) {
  const custom = String(customLetters ?? "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .split("");
  const letters = custom.length > 0 ? [...new Set(custom)] : lettersForSelection(selectionKey);

  if (letters.length === 0) {
    return { error: "Pick a letter set, or type the letters you want to practise." };
  }

  if (!CASE_MODES.some((mode) => mode.key === caseMode)) {
    return { error: "Choose one of the listed letter cases." };
  }
  const style = TRACE_STYLES.find((entry) => entry.key === traceKey);
  if (!style) return { error: "Choose one of the listed tracing styles." };

  const page = PAGE_SIZES[pageKey];
  if (!page) return { error: "Choose one of the listed page sizes." };

  const xHeight = Number(xHeightMm);
  if (!Number.isFinite(xHeight) || xHeight < MIN_X_HEIGHT_MM || xHeight > MAX_X_HEIGHT_MM) {
    return { error: `x-height must be between ${MIN_X_HEIGHT_MM} mm and ${MAX_X_HEIGHT_MM} mm.` };
  }

  const perLetter = Number(rowsPerLetter);
  if (!Number.isInteger(perLetter) || perLetter < 1 || perLetter > MAX_ROWS_PER_LETTER) {
    return { error: `Rows per letter must be a whole number from 1 to ${MAX_ROWS_PER_LETTER}.` };
  }

  const margin = Number(marginMm);
  if (!Number.isFinite(margin) || margin < MIN_MARGIN_MM) {
    return { error: `Margin must be at least ${MIN_MARGIN_MM} mm.` };
  }
  if (margin * 2 >= page.width || margin * 2 >= page.height) {
    return { error: "Those margins leave no room on the page — reduce them." };
  }

  const fontSizeMm = xHeight / X_HEIGHT_RATIO;
  const ascenderMm = xHeight * ASCENDER_RATIO;
  const descenderMm = xHeight * DESCENDER_RATIO;
  const bandHeightMm = ascenderMm + xHeight + descenderMm;
  const rowGapMm = xHeight * ROW_GAP_RATIO;
  const rowPitchMm = bandHeightMm + rowGapMm;

  const usableWidth = page.width - margin * 2;
  const usableHeight = page.height - margin * 2;

  const rowsPerPage = Math.floor(usableHeight / rowPitchMm);
  if (rowsPerPage < 1) {
    return {
      error: `A ${round2(rowPitchMm)} mm row does not fit in ${round2(usableHeight)} mm of page — reduce the x-height or the margin.`,
    };
  }

  // Build every row, then chop into pages.
  const flatRows = [];
  for (const letter of letters) {
    const glyphs = glyphsForLetter(letter, caseMode);
    for (const glyph of glyphs) {
      const glyphWidthMm = stringWidthEm(glyph) * fontSizeMm;
      const slotWidthMm = glyphWidthMm + SLOT_GAP_EM * fontSizeMm;
      if (glyphWidthMm > usableWidth) {
        return {
          error: `At a ${round2(xHeight)} mm x-height "${glyph}" needs ${round2(glyphWidthMm)} mm, more than the ${round2(usableWidth)} mm of writing width.`,
        };
      }
      const perRow = Math.max(1, Math.floor(usableWidth / slotWidthMm));
      for (let r = 0; r < perLetter; r += 1) {
        flatRows.push({
          letter,
          glyph,
          glyphWidthMm: round2(glyphWidthMm),
          slotWidthMm: round2(slotWidthMm),
          perRow,
          repeat: r + 1,
          family: familyOf(letter),
        });
      }
    }
  }

  const pageCount = Math.ceil(flatRows.length / rowsPerPage);
  const pages = [];
  for (let p = 0; p < pageCount; p += 1) {
    const slice = flatRows.slice(p * rowsPerPage, (p + 1) * rowsPerPage);
    const rows = slice.map((row, i) => {
      const top = margin + i * rowPitchMm;
      const waistY = top + ascenderMm;
      const baselineY = waistY + xHeight;
      const items = [];
      for (let c = 0; c < row.perRow; c += 1) {
        const solid = style.key === "grey" || (style.key === "guided" && c === 0);
        items.push({
          index: c + 1,
          x: round2(margin + c * row.slotWidthMm),
          solid,
          dotted: !solid,
        });
      }
      return {
        index: i + 1,
        letter: row.letter,
        glyph: row.glyph,
        glyphWidthMm: row.glyphWidthMm,
        family: row.family,
        topY: round2(top),
        waistY: round2(waistY),
        baselineY: round2(baselineY),
        bottomY: round2(baselineY + descenderMm),
        items,
      };
    });
    pages.push({ index: p + 1, rows });
  }

  const totalTracings = flatRows.reduce((sum, row) => sum + row.perRow, 0);

  return {
    letters,
    caseMode,
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
    rowPitchMm: round2(rowPitchMm),
    usableWidthMm: round2(usableWidth),
    usableHeightMm: round2(usableHeight),
    rowsPerPage,
    rowCount: flatRows.length,
    rowsPerLetter: perLetter,
    pageCount,
    pages,
    totalTracings,
    usedCustom: custom.length > 0,
  };
}
