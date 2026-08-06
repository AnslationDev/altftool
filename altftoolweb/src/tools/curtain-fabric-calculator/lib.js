/**
 * Curtain fabric calculator.
 *
 * A curtain maker works in "widths" — whole drops cut off the roll and joined
 * side by side. The take-off is therefore two independent sums.
 *
 * ACROSS: how many drops are needed
 *   gathered width = (track width + returns + centre overlap) x fullness ratio
 *   drops          = ceil((gathered width + side turnings) / usable fabric width)
 *
 * DOWN: how long each drop is cut
 *   cut length = finished drop + heading allowance + hem allowance
 * and, when the fabric carries a pattern, that cut length is rounded UP to a
 * whole number of pattern repeats so the design lines up across every drop.
 *
 * Total fabric = drops x cut length, which is why a 5 cm change in the drop can
 * add a whole extra repeat to five separate widths.
 */

export const CM_PER_INCH = 2.54;

/**
 * Fullness is the ratio of flat fabric to finished track width. These are the
 * ranges soft-furnishing workrooms quote for each heading; the value listed is
 * the usual specification, and going below it makes the gathers look thin.
 */
export const HEADING_TYPES = [
  { id: "rodPocket", label: "Rod pocket / slot top", fullness: 2.0, headingAllowanceCm: 15 },
  { id: "tabTop", label: "Tab top", fullness: 1.75, headingAllowanceCm: 5 },
  { id: "eyelet", label: "Eyelet", fullness: 2.0, headingAllowanceCm: 12 },
  { id: "pencil", label: "Pencil pleat tape", fullness: 2.5, headingAllowanceCm: 8 },
  { id: "pinch", label: "Pinch / triple pleat", fullness: 2.5, headingAllowanceCm: 20 },
  { id: "goblet", label: "Goblet pleat", fullness: 2.5, headingAllowanceCm: 20 },
  { id: "wave", label: "Wave / ripplefold", fullness: 2.2, headingAllowanceCm: 8 },
];

/** Roll widths commonly sold for curtaining, in centimetres. */
export const FABRIC_WIDTHS = [
  { label: "137 cm (54 in) — standard curtaining", cm: 137 },
  { label: "140 cm", cm: 140 },
  { label: "150 cm", cm: 150 },
  { label: "280 cm — extra wide / sheer", cm: 280 },
  { label: "300 cm — wide sheer", cm: 300 },
];

/** A double 10 cm hem uses 20 cm of fabric; a weighted long curtain uses more. */
export const HEM_ALLOWANCES = [
  { id: "standard", label: "Standard double 10 cm hem", cm: 20 },
  { id: "deep", label: "Deep weighted hem", cm: 30 },
  { id: "short", label: "Short single hem (cafe / kitchen)", cm: 10 },
];

/** Each side turning is a double fold, so it eats this much flat fabric. */
export const SIDE_TURNING_CM = 7.5;
/** Selvedge trimmed off each edge before joining widths. */
export const SELVEDGE_TRIM_CM = 2;
/** A track return is the wrap-around at the wall end. */
export const DEFAULT_RETURN_CM = 8;
/** A pair of curtains crosses over at the centre by this much. */
export const DEFAULT_OVERLAP_CM = 10;
/** Curtain hooks sit roughly this far apart along the tape. */
export const HOOK_SPACING_CM = 8;
/** Lining is cut shorter than the face fabric and needs no deep heading. */
export const LINING_HEADING_CM = 5;
export const LINING_HEM_CM = 10;

export const MAX_TRACK_CM = 2000;
export const MAX_DROP_CM = 600;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

/** Convert a length to centimetres. Unit is "cm" or "in". */
export function toCentimetres(value, unit) {
  if (!isNum(value)) return NaN;
  return unit === "in" ? value * CM_PER_INCH : value;
}

/**
 * Round a cut length up to a whole number of pattern repeats.
 * @returns {number} The cut length actually needed, in the same unit.
 */
export function roundToRepeat(cutLengthCm, repeatCm) {
  if (!isNum(cutLengthCm) || cutLengthCm <= 0) return NaN;
  if (!isNum(repeatCm) || repeatCm <= 0) return cutLengthCm;
  return Math.ceil(cutLengthCm / repeatCm) * repeatCm;
}

/**
 * @param {object} input
 * @param {number} input.trackWidth        Width of the track or pole.
 * @param {number} input.finishedDrop      Finished length of the curtain.
 * @param {"cm"|"in"} [input.unit]
 * @param {string} [input.headingId]       One of HEADING_TYPES ids.
 * @param {number} [input.fullnessOverride] Use instead of the heading default.
 * @param {boolean} [input.isPair]         Two curtains meeting in the middle.
 * @param {number} [input.fabricWidthCm]   Roll width.
 * @param {number} [input.patternRepeatCm] 0 for a plain fabric.
 * @param {number} [input.hemAllowanceCm]
 * @param {number} [input.returnCm]
 * @param {number} [input.overlapCm]
 * @param {boolean} [input.lined]
 * @param {number} [input.fabricPricePerMetre]
 * @param {number} [input.liningPricePerMetre]
 * @returns {object} Cutting plan, or { error } for invalid input.
 */
export function calculateCurtainFabric({
  trackWidth,
  finishedDrop,
  unit = "cm",
  headingId = "pencil",
  fullnessOverride,
  isPair = true,
  fabricWidthCm = 137,
  patternRepeatCm = 0,
  hemAllowanceCm = 20,
  returnCm = DEFAULT_RETURN_CM,
  overlapCm = DEFAULT_OVERLAP_CM,
  lined = true,
  fabricPricePerMetre = 0,
  liningPricePerMetre = 0,
} = {}) {
  const raw = {
    trackWidth,
    finishedDrop,
    fabricWidthCm,
    patternRepeatCm,
    hemAllowanceCm,
    returnCm,
    overlapCm,
    fabricPricePerMetre,
    liningPricePerMetre,
  };
  if (Object.values(raw).some((value) => !isNum(value))) {
    return { error: "Enter a valid number in every field." };
  }

  const heading = HEADING_TYPES.find((item) => item.id === headingId) ?? HEADING_TYPES[3];
  const hasFullnessOverride = fullnessOverride !== undefined && fullnessOverride !== null;
  if (hasFullnessOverride && !isNum(fullnessOverride)) {
    return { error: "Enter a valid custom fullness ratio." };
  }
  const fullness = hasFullnessOverride ? fullnessOverride : heading.fullness;
  if (fullness < 1 || fullness > 4) {
    return { error: "Fullness must be between 1 and 4 times the track width." };
  }

  const trackCm = toCentimetres(trackWidth, unit);
  const dropCm = toCentimetres(finishedDrop, unit);
  if (trackCm <= 0 || dropCm <= 0) {
    return { error: "Track width and finished drop must be greater than zero." };
  }
  if (trackCm > MAX_TRACK_CM) return { error: `Track widths above ${MAX_TRACK_CM} cm are out of range.` };
  if (dropCm > MAX_DROP_CM) return { error: `Drops above ${MAX_DROP_CM} cm are out of range.` };
  if (fabricWidthCm <= SELVEDGE_TRIM_CM * 2) {
    return { error: "Fabric width must be wider than the selvedge trimmed from each edge." };
  }
  if (patternRepeatCm < 0) return { error: "Pattern repeat cannot be negative." };
  if (patternRepeatCm > MAX_DROP_CM) return { error: "That pattern repeat is longer than a full drop." };
  if (hemAllowanceCm < 0 || returnCm < 0 || overlapCm < 0) {
    return { error: "Hem, return and overlap allowances cannot be negative." };
  }
  if (fabricPricePerMetre < 0 || liningPricePerMetre < 0) {
    return { error: "Prices cannot be negative." };
  }

  const panels = isPair ? 2 : 1;
  const usableWidthCm = fabricWidthCm - SELVEDGE_TRIM_CM * 2;

  // Across the window.
  const returnsCm = returnCm * panels;
  const overlapTotalCm = isPair ? overlapCm : 0;
  const baseWidthCm = trackCm + returnsCm + overlapTotalCm;
  const gatheredWidthCm = baseWidthCm * fullness;
  const sideTurningsCm = panels * 2 * SIDE_TURNING_CM;
  const widthToCutCm = gatheredWidthCm + sideTurningsCm;
  const drops = Math.ceil(widthToCutCm / usableWidthCm);
  const dropsPerPanel = drops / panels;
  const suppliedFlatWidthCm = drops * usableWidthCm;
  const actualFullness = (suppliedFlatWidthCm - sideTurningsCm) / baseWidthCm;

  // Down the window.
  const rawCutLengthCm = dropCm + heading.headingAllowanceCm + hemAllowanceCm;
  const cutLengthCm = roundToRepeat(rawCutLengthCm, patternRepeatCm);
  const repeatWastePerDropCm = cutLengthCm - rawCutLengthCm;

  const totalFabricCm = drops * cutLengthCm;
  const totalFabricM = totalFabricCm / 100;

  // Lining, cut on the same number of widths.
  const liningCutLengthCm = lined ? dropCm + LINING_HEADING_CM + LINING_HEM_CM : 0;
  const totalLiningM = lined ? (drops * liningCutLengthCm) / 100 : 0;

  // Trimmings. Tape is sewn across the joined, post-selvedge flat width, the
  // same usableWidthCm used for the across-the-window take-off above - not
  // the raw roll width, which would overstate the tape needed.
  const tapeMetres = (drops * usableWidthCm) / 100;
  const hooks = Math.ceil(trackCm / HOOK_SPACING_CM) + 2 * panels;

  const fabricCost = totalFabricM * fabricPricePerMetre;
  const liningCost = totalLiningM * liningPricePerMetre;
  // Round each displayed line item once, then sum the rounded values so the
  // "Total" row always reconciles with "Fabric cost" + "Lining cost" as
  // shown on screen, instead of independently rounding the unrounded total.
  const fabricCostRounded = Math.round(fabricCost);
  const liningCostRounded = Math.round(liningCost);
  const totalCost = fabricCostRounded + liningCostRounded;

  return {
    headingLabel: heading.label,
    fullness: round2(fullness),
    panels,
    unitUsed: unit,

    trackCm: round1(trackCm),
    dropCm: round1(dropCm),
    returnsCm: round1(returnsCm),
    overlapTotalCm: round1(overlapTotalCm),
    baseWidthCm: round1(baseWidthCm),
    gatheredWidthCm: round1(gatheredWidthCm),
    sideTurningsCm: round1(sideTurningsCm),
    widthToCutCm: round1(widthToCutCm),
    usableWidthCm: round1(usableWidthCm),

    drops,
    dropsPerPanel: round2(dropsPerPanel),
    halfWidthNeeded: !Number.isInteger(dropsPerPanel),
    suppliedFlatWidthCm: round1(suppliedFlatWidthCm),
    actualFullness: round2(actualFullness),

    headingAllowanceCm: heading.headingAllowanceCm,
    hemAllowanceCm: round1(hemAllowanceCm),
    rawCutLengthCm: round1(rawCutLengthCm),
    cutLengthCm: round1(cutLengthCm),
    patternRepeatCm: round1(patternRepeatCm),
    repeatWastePerDropCm: round1(repeatWastePerDropCm),
    repeatWasteTotalM: round2((repeatWastePerDropCm * drops) / 100),

    totalFabricM: round2(totalFabricM),
    lined,
    liningCutLengthCm: round1(liningCutLengthCm),
    totalLiningM: round2(totalLiningM),
    tapeMetres: round2(tapeMetres),
    hooks,

    fabricCost: fabricCostRounded,
    liningCost: liningCostRounded,
    totalCost,
  };
}
