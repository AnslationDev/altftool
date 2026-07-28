/**
 * Broad-edge calligraphy guide-sheet geometry.
 *
 * Two real things drive every number here:
 *
 * 1. Calligraphic hands are ruled in NIB WIDTHS, not millimetres. The scribe
 *    steps the nib corner-to-corner up the page to make a "ladder", and the
 *    x-height is a fixed count of those steps. Those counts are the traditional
 *    teaching proportions for each hand and are listed per hand below.
 *
 * 2. The width of a stroke made by a broad-edge nib is pure trigonometry. If
 *    the nib edge is w wide and held at angle A above the horizontal, then a
 *    straight downstroke leaves a stem of w x cos(A) and a straight sideways
 *    stroke leaves a bar of w x sin(A). At A = 0 degrees the stem is the full
 *    nib width and the bar vanishes; at 45 degrees both are w / sqrt(2).
 *    This gives a measurable self-check: rule a stem and see whether it really
 *    measures the predicted width.
 *
 * Page sizes are the ISO 216 and ANSI standards, in millimetres.
 */

/** ISO 216 and ANSI page sizes in millimetres, portrait. */
export const PAGE_SIZES = {
  a4: { key: "a4", label: "A4 (210 × 297 mm)", width: 210, height: 297 },
  a5: { key: "a5", label: "A5 (148 × 210 mm)", width: 148, height: 210 },
  letter: { key: "letter", label: "US Letter (8.5 × 11 in)", width: 215.9, height: 279.4 },
  legal: { key: "legal", label: "US Legal (8.5 × 14 in)", width: 215.9, height: 355.6 },
};

/**
 * Traditional proportions for the common broad-edge hands.
 * `xHeight`, `ascender` and `descender` are counts of nib widths; `ascender`
 * and `descender` are measured beyond the x-height band.
 * `penAngle` is degrees above the horizontal writing line.
 * `slant` is the forward slope of the letters from vertical, in degrees.
 */
export const HANDS = [
  {
    key: "foundational",
    name: "Foundational",
    penAngle: 30,
    xHeight: 4,
    ascender: 3,
    descender: 3,
    slant: 0,
    note: "Johnston's teaching hand, based on the 10th-century English Carolingian minuscule.",
  },
  {
    key: "italic",
    name: "Italic (Chancery)",
    penAngle: 45,
    xHeight: 5,
    ascender: 3,
    descender: 3,
    slant: 7,
    note: "Renaissance chancery cursive; letters are compressed and slope forward 5–10°.",
  },
  {
    key: "blackletter",
    name: "Blackletter (Textura)",
    penAngle: 40,
    xHeight: 5,
    ascender: 2,
    descender: 2,
    slant: 0,
    note: "Dense Gothic bookhand — short ascenders, tight counters, uniform stems.",
  },
  {
    key: "uncial",
    name: "Uncial",
    penAngle: 20,
    xHeight: 4,
    ascender: 1,
    descender: 1,
    slant: 0,
    note: "Rounded majuscule hand; the shallow pen angle gives heavy verticals.",
  },
  {
    key: "carolingian",
    name: "Carolingian",
    penAngle: 30,
    xHeight: 4,
    ascender: 3,
    descender: 3,
    slant: 0,
    note: "The clear Frankish minuscule that Foundational was reconstructed from.",
  },
  {
    key: "romancaps",
    name: "Roman capitals",
    penAngle: 30,
    xHeight: 7,
    ascender: 0,
    descender: 0,
    slant: 0,
    note: "Capitals only, so the whole letter sits in one band about seven nib widths tall.",
  },
];

/** Default extra space between line sets, in nib widths. */
export const DEFAULT_GAP_NIB_WIDTHS = 2;

/** Spacing between pen-angle hatch marks, in nib widths. */
export const ANGLE_MARK_SPACING_NIB_WIDTHS = 8;

/** Length of each pen-angle hatch mark, in nib widths. */
export const ANGLE_MARK_LENGTH_NIB_WIDTHS = 4;

/** Sensible input bounds. */
export const MIN_NIB_WIDTH_MM = 0.3;
export const MAX_NIB_WIDTH_MM = 15;
export const MIN_MARGIN_MM = 5;
export const MAX_PEN_ANGLE_DEG = 90;

const DEG_TO_RAD = Math.PI / 180;

const round2 = (value) => Math.round(value * 100) / 100;

/** Look up a hand by key; returns null when unknown. */
export function findHand(key) {
  return HANDS.find((hand) => hand.key === key) ?? null;
}

/**
 * Stroke widths a broad-edge nib produces at a given pen angle.
 * stem = w cos(A) for a vertical pull, bar = w sin(A) for a horizontal pull.
 */
export function strokeWidths({ nibWidthMm, penAngleDeg } = {}) {
  const w = Number(nibWidthMm);
  const a = Number(penAngleDeg);
  if (!Number.isFinite(w) || w <= 0) {
    return { error: "Nib width must be greater than zero." };
  }
  if (!Number.isFinite(a) || a < 0 || a > MAX_PEN_ANGLE_DEG) {
    return { error: `Pen angle must be between 0° and ${MAX_PEN_ANGLE_DEG}°.` };
  }
  const radians = a * DEG_TO_RAD;
  const stem = round2(w * Math.cos(radians));
  const bar = round2(w * Math.sin(radians));
  // Thick-to-thin ratio. At 0° and 90° one stroke has no width at all, so the
  // ratio is undefined rather than infinite — report null and say so in the UI.
  const contrast =
    stem > 0 && bar > 0 ? round2(Math.max(stem, bar) / Math.min(stem, bar)) : null;
  return { stem, bar, contrast };
}

/**
 * Build the full guide sheet.
 *
 * @param {{handKey:string, nibWidthMm:number, pageKey:string, marginMm:number,
 *          gapNibWidths?:number, penAngleOverride?:number|null}} input
 */
export function buildGrid({
  handKey,
  nibWidthMm,
  pageKey = "a4",
  marginMm = 15,
  gapNibWidths = DEFAULT_GAP_NIB_WIDTHS,
  penAngleOverride = null,
} = {}) {
  const hand = findHand(handKey);
  if (!hand) return { error: "Choose one of the listed calligraphic hands." };

  const page = PAGE_SIZES[pageKey];
  if (!page) return { error: "Choose one of the listed page sizes." };

  const nib = Number(nibWidthMm);
  if (!Number.isFinite(nib) || nib < MIN_NIB_WIDTH_MM || nib > MAX_NIB_WIDTH_MM) {
    return {
      error: `Nib width must be between ${MIN_NIB_WIDTH_MM} mm and ${MAX_NIB_WIDTH_MM} mm.`,
    };
  }

  const margin = Number(marginMm);
  if (!Number.isFinite(margin) || margin < MIN_MARGIN_MM) {
    return { error: `Margin must be at least ${MIN_MARGIN_MM} mm.` };
  }
  if (margin * 2 >= page.height || margin * 2 >= page.width) {
    return { error: "Those margins leave no room on the page — reduce them." };
  }

  const gap = Number(gapNibWidths);
  if (!Number.isFinite(gap) || gap < 0 || gap > 12) {
    return { error: "Extra gap between line sets must be between 0 and 12 nib widths." };
  }

  const angle =
    penAngleOverride === null || penAngleOverride === "" ? hand.penAngle : Number(penAngleOverride);
  if (!Number.isFinite(angle) || angle < 0 || angle > MAX_PEN_ANGLE_DEG) {
    return { error: `Pen angle must be between 0° and ${MAX_PEN_ANGLE_DEG}°.` };
  }

  const xHeight = nib * hand.xHeight;
  const ascender = nib * hand.ascender;
  const descender = nib * hand.descender;
  const lineSetHeight = ascender + xHeight + descender;
  const rowPitch = lineSetHeight + nib * gap;

  const usableWidth = page.width - margin * 2;
  const usableHeight = page.height - margin * 2;

  if (rowPitch <= 0) {
    return { error: "That combination produces no line height — increase the nib width." };
  }
  const rowCount = Math.floor(usableHeight / rowPitch);
  if (rowCount < 1) {
    return {
      error: `A ${round2(lineSetHeight)} mm line set does not fit in ${round2(usableHeight)} mm of page — use a narrower nib or a bigger page.`,
    };
  }

  const rows = [];
  for (let i = 0; i < rowCount; i += 1) {
    const top = margin + i * rowPitch;
    rows.push({
      index: i + 1,
      ascenderY: round2(top),
      waistY: round2(top + ascender),
      baselineY: round2(top + ascender + xHeight),
      descenderY: round2(top + lineSetHeight),
    });
  }

  const markSpacing = nib * ANGLE_MARK_SPACING_NIB_WIDTHS;
  const markLength = nib * ANGLE_MARK_LENGTH_NIB_WIDTHS;
  const markCount = markSpacing > 0 ? Math.floor(usableWidth / markSpacing) : 0;
  const angleMarksX = [];
  for (let i = 0; i < markCount; i += 1) {
    angleMarksX.push(round2(margin + markSpacing * (i + 0.5)));
  }

  // A hatch mark is drawn at the pen angle, rising to the right.
  const radians = angle * DEG_TO_RAD;
  const markDx = round2((markLength * Math.cos(radians)) / 2);
  const markDy = round2((markLength * Math.sin(radians)) / 2);

  // Slant guides lean forward from vertical by hand.slant degrees.
  const slantRadians = hand.slant * DEG_TO_RAD;
  const slantOffset = round2(lineSetHeight * Math.tan(slantRadians));

  // Resolve every hatch and slant guide into a finished line segment so the
  // drawing layer only has to place coordinates it is handed.
  for (const row of rows) {
    row.marks = angleMarksX.map((x) => ({
      x,
      x1: round2(x - markDx),
      y1: round2(row.baselineY + markDy),
      x2: round2(x + markDx),
      y2: round2(row.baselineY - markDy),
    }));
    row.slants =
      hand.slant > 0
        ? angleMarksX.map((x) => ({
            x,
            x1: x,
            y1: row.descenderY,
            x2: round2(x + slantOffset),
            y2: row.ascenderY,
          }))
        : [];
  }

  return {
    hand,
    page,
    nibWidthMm: nib,
    marginMm: margin,
    contentLeftMm: round2(margin),
    contentRightMm: round2(page.width - margin),
    gapNibWidths: gap,
    penAngleDeg: angle,
    usingCustomAngle: angle !== hand.penAngle,
    xHeightMm: round2(xHeight),
    ascenderMm: round2(ascender),
    descenderMm: round2(descender),
    lineSetHeightMm: round2(lineSetHeight),
    rowPitchMm: round2(rowPitch),
    usableWidthMm: round2(usableWidth),
    usableHeightMm: round2(usableHeight),
    rowCount,
    rows,
    angleMarksX,
    markDx,
    markDy,
    markLengthMm: round2(markLength),
    slantDeg: hand.slant,
    slantOffsetMm: slantOffset,
    strokes: strokeWidths({ nibWidthMm: nib, penAngleDeg: angle }),
  };
}

/**
 * Rungs of a nib-width ladder: the stepped square stack a scribe rules to check
 * the x-height. Returns cumulative heights in millimetres.
 */
export function nibLadder(nibWidthMm, steps) {
  const nib = Number(nibWidthMm);
  const count = Number(steps);
  if (!Number.isFinite(nib) || nib <= 0) return { error: "Nib width must be greater than zero." };
  if (!Number.isInteger(count) || count < 1 || count > 20) {
    return { error: "A ladder needs between 1 and 20 steps." };
  }
  return {
    steps: Array.from({ length: count }, (unused, i) => ({
      step: i + 1,
      heightMm: round2(nib * (i + 1)),
    })),
    totalMm: round2(nib * count),
  };
}
