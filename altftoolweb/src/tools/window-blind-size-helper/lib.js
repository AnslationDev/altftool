/**
 * Window blind measuring helper.
 *
 * Blind makers ask for three widths and three heights because openings are
 * rarely square, and the rule for which of the three to use is the opposite at
 * each end:
 *
 *   INSIDE (recess) MOUNT
 *     order width  = NARROWEST of the three widths, so the blind clears the
 *                    tightest point. The factory then takes its own deduction
 *                    off that figure to leave a running clearance, so you must
 *                    NOT subtract anything yourself.
 *     order height = LONGEST of the three heights, so the blind covers the
 *                    whole opening at its deepest point.
 *
 *   OUTSIDE (face) MOUNT
 *     order width  = WIDEST of the three, plus an overlap on each side
 *     order height = LONGEST of the three, plus clearance above for the
 *                    headrail brackets and a drop below the sill
 *
 * Everything else here — factory deduction, minimum recess depth, bracket
 * spacing, slat and louvre counts — follows the mainstream manufacturer
 * measuring instructions and should be checked against the specific maker's
 * guide before the order is placed.
 */

export const MM_PER_INCH = 25.4;
export const MM_PER_CM = 10;

/**
 * Per-type data.
 *  insideDeductionMm  — total width the factory removes on a recess fit.
 *  minDepthFlushMm    — recess depth for the headrail to sit fully inside.
 *  minDepthPartialMm  — depth for a partial-recess fit with the rail proud.
 *  slatSpacingMm      — vertical pitch of slats (horizontal blinds).
 *  louvreSpacingMm    — horizontal pitch of louvres (vertical blinds).
 *  headrailMm         — depth the stacked headrail occupies at the top.
 *  stackPerMetreMm    — extra stack height per metre of drop when raised.
 */
export const BLIND_TYPES = [
  {
    id: "venetian25",
    label: "Aluminium venetian, 25 mm slats",
    insideDeductionMm: 12.7,
    minDepthFlushMm: 50,
    minDepthPartialMm: 25,
    slatSpacingMm: 22,
    louvreSpacingMm: 0,
    headrailMm: 40,
    stackPerMetreMm: 90,
  },
  {
    id: "venetian50",
    label: "Wood or faux-wood venetian, 50 mm slats",
    insideDeductionMm: 12.7,
    minDepthFlushMm: 65,
    minDepthPartialMm: 32,
    slatSpacingMm: 44,
    louvreSpacingMm: 0,
    headrailMm: 50,
    stackPerMetreMm: 130,
  },
  {
    id: "roller",
    label: "Roller blind",
    insideDeductionMm: 9.5,
    minDepthFlushMm: 45,
    minDepthPartialMm: 25,
    slatSpacingMm: 0,
    louvreSpacingMm: 0,
    headrailMm: 45,
    stackPerMetreMm: 15,
  },
  {
    id: "zebra",
    label: "Zebra / day-night roller",
    insideDeductionMm: 9.5,
    minDepthFlushMm: 55,
    minDepthPartialMm: 30,
    slatSpacingMm: 0,
    louvreSpacingMm: 0,
    headrailMm: 50,
    stackPerMetreMm: 20,
  },
  {
    id: "roman",
    label: "Roman blind",
    insideDeductionMm: 12.7,
    minDepthFlushMm: 60,
    minDepthPartialMm: 40,
    slatSpacingMm: 0,
    louvreSpacingMm: 0,
    headrailMm: 50,
    stackPerMetreMm: 110,
  },
  {
    id: "cellular",
    label: "Cellular / honeycomb",
    insideDeductionMm: 6.4,
    minDepthFlushMm: 45,
    minDepthPartialMm: 25,
    slatSpacingMm: 0,
    louvreSpacingMm: 0,
    headrailMm: 40,
    stackPerMetreMm: 35,
  },
  {
    id: "vertical",
    label: "Vertical, 89 mm louvres",
    insideDeductionMm: 12.7,
    minDepthFlushMm: 90,
    minDepthPartialMm: 50,
    slatSpacingMm: 0,
    louvreSpacingMm: 76,
    headrailMm: 45,
    stackPerMetreMm: 0,
  },
];

/** Standard face-fix overlap: 1.5 in each side, or 3 in for blackout. */
export const OVERLAP_PER_SIDE_MM = 38;
export const BLACKOUT_OVERLAP_PER_SIDE_MM = 75;
/** Clearance above the opening so the brackets have solid wall to fix into. */
export const ABOVE_OPENING_MM = 75;
/** Drop past the sill so light does not spill under the bottom rail. */
export const BELOW_SILL_MM = 50;
/** A headrail needs support at least this often. */
export const MAX_BRACKET_SPAN_MM = 1000;
/** Each vertical louvre takes roughly this much room in the stack. */
export const VERTICAL_STACK_PER_LOUVRE_MM = 12.7;
export const VERTICAL_STACK_BASE_MM = 25;

/** Openings this far out of square should be face-fixed, not recessed. */
export const SQUARE_WARN_MM = 6;
export const SQUARE_FAIL_MM = 12;

export const MAX_DIMENSION_MM = 6000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

/** Convert a length to millimetres. Unit is "mm", "cm" or "in". */
export function toMillimetres(value, unit) {
  if (!isNum(value)) return NaN;
  if (unit === "cm") return value * MM_PER_CM;
  if (unit === "in") return value * MM_PER_INCH;
  return value;
}

/**
 * @param {object} input
 * @param {number[]} input.widths   Three width measurements: top, middle, bottom.
 * @param {number[]} input.heights  Three height measurements: left, centre, right.
 * @param {number} input.depth      Usable recess depth.
 * @param {"mm"|"cm"|"in"} [input.unit]
 * @param {string} [input.blindId]  One of BLIND_TYPES ids.
 * @param {boolean} [input.blackout] Use the wider blackout overlap on face fix.
 * @returns {object} Order sizes and checks, or { error } for invalid input.
 */
export function planBlindSize({
  widths,
  heights,
  depth,
  unit = "mm",
  blindId = "roller",
  blackout = false,
} = {}) {
  if (!Array.isArray(widths) || !Array.isArray(heights)) {
    return { error: "Enter three width and three height measurements." };
  }
  if (widths.length !== 3 || heights.length !== 3) {
    return { error: "Enter three width and three height measurements." };
  }
  if (![...widths, ...heights, depth].every(isNum)) {
    return { error: "Enter a valid number in every measurement field." };
  }

  const blind = BLIND_TYPES.find((item) => item.id === blindId) ?? BLIND_TYPES[2];

  const widthsMm = widths.map((value) => toMillimetres(value, unit));
  const heightsMm = heights.map((value) => toMillimetres(value, unit));
  const depthMm = toMillimetres(depth, unit);

  if (widthsMm.some((value) => value <= 0) || heightsMm.some((value) => value <= 0)) {
    return { error: "Every width and height must be greater than zero." };
  }
  if ([...widthsMm, ...heightsMm].some((value) => value > MAX_DIMENSION_MM)) {
    return { error: `Openings larger than ${MAX_DIMENSION_MM} mm are outside this tool.` };
  }
  if (depthMm < 0) return { error: "Recess depth cannot be negative." };

  const minWidth = Math.min(...widthsMm);
  const maxWidth = Math.max(...widthsMm);
  const minHeight = Math.min(...heightsMm);
  const maxHeight = Math.max(...heightsMm);

  const widthSpread = maxWidth - minWidth;
  const heightSpread = maxHeight - minHeight;
  const worstSpread = Math.max(widthSpread, heightSpread);
  const squareness =
    worstSpread > SQUARE_FAIL_MM ? "out" : worstSpread > SQUARE_WARN_MM ? "marginal" : "square";

  // Inside mount.
  const insideOrderWidthMm = minWidth;
  const insideOrderHeightMm = maxHeight;
  const insideFinishedWidthMm = insideOrderWidthMm - blind.insideDeductionMm;
  const insideGapEachSideMm = blind.insideDeductionMm / 2;
  // The order width is set to the recess's NARROWEST point, so the light gap
  // is smallest there (just the factory deduction). At the recess's WIDEST
  // point the same finished blind leaves a bigger gap - the deduction plus
  // however much wider that point is than the narrowest one. This returns
  // that worst-case gap, which occurs at the widest point, not the tightest.
  const worstLightGapMm = insideGapEachSideMm * 2 + widthSpread;

  const depthVerdict =
    depthMm >= blind.minDepthFlushMm
      ? "flush"
      : depthMm >= blind.minDepthPartialMm
        ? "partial"
        : "insufficient";

  // Outside mount.
  const overlapPerSideMm = blackout ? BLACKOUT_OVERLAP_PER_SIDE_MM : OVERLAP_PER_SIDE_MM;
  const outsideOrderWidthMm = maxWidth + overlapPerSideMm * 2;
  const outsideOrderHeightMm = maxHeight + ABOVE_OPENING_MM + BELOW_SILL_MM;

  // Hardware.
  const insideBrackets = Math.max(2, Math.ceil(insideOrderWidthMm / MAX_BRACKET_SPAN_MM) + 1);
  const outsideBrackets = Math.max(2, Math.ceil(outsideOrderWidthMm / MAX_BRACKET_SPAN_MM) + 1);

  const dropMetres = insideOrderHeightMm / 1000;
  const slatCount =
    blind.slatSpacingMm > 0 ? Math.ceil(insideOrderHeightMm / blind.slatSpacingMm) : 0;
  const louvreCount =
    blind.louvreSpacingMm > 0
      ? Math.max(
          1,
          Math.ceil((insideOrderWidthMm - blind.louvreSpacingMm) / blind.louvreSpacingMm) + 1,
        )
      : 0;

  const stackHeightMm =
    blind.louvreSpacingMm > 0 ? blind.headrailMm : blind.headrailMm + blind.stackPerMetreMm * dropMetres;
  const stackBackMm =
    blind.louvreSpacingMm > 0
      ? louvreCount * VERTICAL_STACK_PER_LOUVRE_MM + VERTICAL_STACK_BASE_MM
      : 0;
  const viewLossPercent = (stackHeightMm / insideOrderHeightMm) * 100;

  return {
    blindLabel: blind.label,
    insideDeductionMm: blind.insideDeductionMm,
    minDepthFlushMm: blind.minDepthFlushMm,
    minDepthPartialMm: blind.minDepthPartialMm,

    minWidthMm: round1(minWidth),
    maxWidthMm: round1(maxWidth),
    minHeightMm: round1(minHeight),
    maxHeightMm: round1(maxHeight),
    widthSpreadMm: round1(widthSpread),
    heightSpreadMm: round1(heightSpread),
    squareness,

    insideOrderWidthMm: round1(insideOrderWidthMm),
    insideOrderHeightMm: round1(insideOrderHeightMm),
    insideFinishedWidthMm: round1(insideFinishedWidthMm),
    // Round to 2dp (not 1dp) so this always reconciles with the 1dp
    // "Factory deduction" figure: every current insideDeductionMm value has
    // at most 1 decimal digit, so half of it always terminates by 2dp
    // (e.g. 9.5 / 2 = 4.75 exactly - rounding that to 1dp as 4.8 would make
    // 2 x 4.8 = 9.6, not 9.5).
    insideGapEachSideMm: round2(insideGapEachSideMm),
    worstLightGapMm: round1(worstLightGapMm),
    insideBrackets,

    depthMm: round1(depthMm),
    depthVerdict,
    depthShortfallMm:
      depthVerdict === "insufficient" ? round1(blind.minDepthPartialMm - depthMm) : 0,

    overlapPerSideMm,
    outsideOrderWidthMm: round1(outsideOrderWidthMm),
    outsideOrderHeightMm: round1(outsideOrderHeightMm),
    aboveOpeningMm: ABOVE_OPENING_MM,
    belowSillMm: BELOW_SILL_MM,
    outsideBrackets,

    slatCount,
    louvreCount,
    stackHeightMm: round1(stackHeightMm),
    stackBackMm: round1(stackBackMm),
    viewLossPercent: round2(viewLossPercent),
  };
}
