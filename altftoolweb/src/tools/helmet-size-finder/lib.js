/**
 * Motorcycle helmet sizing.
 *
 * SIZE comes from one measurement: the circumference of the head at its widest
 * point, about 2.5 cm above the eyebrows and above the ears, with the tape level
 * all the way round. Helmet size letters map to a two-centimetre band of that
 * circumference, and the bands below are the ranges the great majority of full
 * face helmets use. Individual brands shift by up to a centimetre either way,
 * which is what the "runs small / runs large" adjustment models.
 *
 * SHAPE is the other half of fit and the reason a correctly sized helmet can
 * still hurt. It is described by the cephalic index, a standard anthropometric
 * ratio:
 *
 *      cephalic index = (head breadth / head length) x 100
 *
 * measured side to side and front to back. The conventional bands are
 * dolichocephalic up to 75.9 (a long, narrow head — "long oval" in helmet
 * catalogues), mesocephalic 76.0 to 80.9 ("intermediate oval", by far the most
 * common and the default internal shape of most helmets) and brachycephalic 81.0
 * and above ("round oval"). A long-oval head in an intermediate-oval helmet
 * gets forehead and back-of-head pressure points at the right size.
 *
 * As a cross-check, the circumference implied by your length and breadth is
 * estimated with Ramanujan's approximation for the perimeter of an ellipse:
 *
 *      P = pi [ 3(a+b) - sqrt((3a+b)(a+3b)) ],  a and b the semi-axes
 *
 * A large gap between that estimate and your tape measurement usually means the
 * tape was not level.
 */

/** Helmet size letters against head circumference in cm. */
export const HELMET_SIZES = [
  { id: "XXS", label: "XXS", minCm: 51, maxCm: 52 },
  { id: "XS", label: "XS", minCm: 53, maxCm: 54 },
  { id: "S", label: "S", minCm: 55, maxCm: 56 },
  { id: "M", label: "M", minCm: 57, maxCm: 58 },
  { id: "L", label: "L", minCm: 59, maxCm: 60 },
  { id: "XL", label: "XL", minCm: 61, maxCm: 62 },
  { id: "XXL", label: "2XL", minCm: 63, maxCm: 64 },
  { id: "XXXL", label: "3XL", minCm: 65, maxCm: 66 },
];

/** How a brand's sizing differs from the common chart, in size steps. */
export const BRAND_SIZING = [
  { id: "small", label: "Runs small (go up one)", shift: 1 },
  { id: "true", label: "True to the chart", shift: 0 },
  { id: "large", label: "Runs large (go down one)", shift: -1 },
];

/** Cephalic index bands and the helmet-catalogue name for each. */
export const SHAPE_BANDS = [
  { id: "long", maxIndex: 75.9, label: "Long oval", note: "Longer front to back than side to side." },
  { id: "intermediate", maxIndex: 80.9, label: "Intermediate oval", note: "The most common shape and the default internal shape of most helmets." },
  { id: "round", maxIndex: Infinity, label: "Round oval", note: "Nearly as wide as it is long." },
];

/** Within this distance of a band edge, try both sizes before buying. */
export const BORDERLINE_CM = 0.5;

/** Replace a helmet five years from first use, or seven from manufacture. */
export const REPLACE_YEARS_FROM_FIRST_USE = 5;
export const REPLACE_YEARS_FROM_MANUFACTURE = 7;

/** 1 inch = 2.54 cm, exactly. */
export const CM_PER_INCH = 2.54;

const MIN_ADULT_CM = HELMET_SIZES[0].minCm;
const MAX_ADULT_CM = HELMET_SIZES[HELMET_SIZES.length - 1].maxCm;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Ramanujan's ellipse perimeter, given full length and breadth. */
export function ellipsePerimeter(lengthCm, breadthCm) {
  const a = lengthCm / 2;
  const b = breadthCm / 2;
  return Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
}

/** Cephalic index and its shape band. */
export function headShape(lengthCm, breadthCm) {
  if (!isNum(lengthCm) || !isNum(breadthCm) || lengthCm <= 0 || breadthCm <= 0) return null;
  const index = (breadthCm / lengthCm) * 100;
  const band = SHAPE_BANDS.find((entry) => index <= entry.maxIndex);
  return { index, band };
}

/**
 * @param {object} input
 * @param {number} input.circumferenceCm head circumference, cm
 * @param {string} input.brandSizing     one of BRAND_SIZING ids
 * @param {number} [input.headLengthCm]  front-to-back, for shape and cross-check
 * @param {number} [input.headBreadthCm] side-to-side, for shape and cross-check
 */
export function findHelmetSize({
  circumferenceCm,
  brandSizing = "true",
  headLengthCm = 0,
  headBreadthCm = 0,
}) {
  if (!isNum(circumferenceCm))
    return { error: "Enter your head circumference as a number." };
  if (circumferenceCm <= 0) return { error: "Head circumference must be greater than zero." };
  if (!isNum(headLengthCm) || !isNum(headBreadthCm) || headLengthCm < 0 || headBreadthCm < 0)
    return { error: "Head length and breadth must be zero or more." };
  if (circumferenceCm < MIN_ADULT_CM)
    return {
      error: `${circumferenceCm} cm is below the adult range of ${MIN_ADULT_CM}–${MAX_ADULT_CM} cm. Children's helmets are sized separately and must be fitted in person.`,
    };
  if (circumferenceCm > MAX_ADULT_CM)
    return {
      error: `${circumferenceCm} cm is above the ${MAX_ADULT_CM} cm top of the common chart. A few makers go further — ask a dealer to measure you and order in.`,
    };

  const sizing = BRAND_SIZING.find((entry) => entry.id === brandSizing) ?? BRAND_SIZING[1];

  const chartIndex = HELMET_SIZES.findIndex(
    (size) => circumferenceCm >= size.minCm && circumferenceCm <= size.maxCm,
  );
  // Circumferences fall between bands (e.g. 56.4 cm); take the next size up,
  // because a helmet that is slightly loose can be padded and one that is
  // slightly tight cannot be stretched.
  const resolvedIndex =
    chartIndex >= 0
      ? chartIndex
      : HELMET_SIZES.findIndex((size) => circumferenceCm < size.minCm);
  const baseIndex = resolvedIndex >= 0 ? resolvedIndex : HELMET_SIZES.length - 1;
  const baseSize = HELMET_SIZES[baseIndex];

  const adjustedIndex = Math.min(
    HELMET_SIZES.length - 1,
    Math.max(0, baseIndex + sizing.shift),
  );
  const recommended = HELMET_SIZES[adjustedIndex];
  const shiftApplied = adjustedIndex !== baseIndex;

  // Borderline: close to either edge of the chart band you landed in.
  const distanceToLower = circumferenceCm - baseSize.minCm;
  const distanceToUpper = baseSize.maxCm - circumferenceCm;
  let borderline = null;
  if (distanceToUpper <= BORDERLINE_CM && baseIndex < HELMET_SIZES.length - 1) {
    borderline = { direction: "up", size: HELMET_SIZES[baseIndex + 1] };
  } else if (distanceToLower <= BORDERLINE_CM && baseIndex > 0) {
    borderline = { direction: "down", size: HELMET_SIZES[baseIndex - 1] };
  }

  // Where you sit inside the recommended band, clamped because a circumference
  // that fell between two bands sits just below the band it was rounded up into.
  const positionInBandPct = Math.min(
    100,
    Math.max(0, ((circumferenceCm - baseSize.minCm) / (baseSize.maxCm - baseSize.minCm)) * 100),
  );

  const shape = headLengthCm > 0 && headBreadthCm > 0 ? headShape(headLengthCm, headBreadthCm) : null;
  const estimatedCircumference =
    headLengthCm > 0 && headBreadthCm > 0 ? ellipsePerimeter(headLengthCm, headBreadthCm) : null;
  const estimateGap =
    estimatedCircumference === null ? null : estimatedCircumference - circumferenceCm;

  const notes = [];
  notes.push(
    `Measure again before you buy: tape level, about 2.5 cm above the eyebrows, snug but not pulled tight. Two millimetres decides a size at ${circumferenceCm} cm.`,
  );
  if (borderline) {
    notes.push(
      `You are within ${BORDERLINE_CM} cm of the edge of ${baseSize.label}. Try ${baseSize.label} and ${borderline.size.label} back to back — the right one presses evenly all round with no hot spots, and the cheek pads squash your cheeks.`,
    );
  }
  if (shiftApplied) {
    notes.push(
      `The chart puts you in ${baseSize.label}; the "${sizing.label.toLowerCase()}" adjustment moves the recommendation to ${recommended.label} for this brand.`,
    );
  }
  if (shape) {
    notes.push(
      `Cephalic index ${shape.index.toFixed(1)} — ${shape.band.label.toLowerCase()}. ${shape.band.note}`,
    );
  }
  if (estimateGap !== null && Math.abs(estimateGap) > 2) {
    notes.push(
      `Your length and breadth imply a circumference of about ${estimatedCircumference.toFixed(1)} cm, ${Math.abs(estimateGap).toFixed(1)} cm from your tape reading — one of the two measurements is off, so take them both again.`,
    );
  }
  notes.push(
    `A new helmet should feel firm for the first few rides; the comfort liner compresses. If it is loose on day one it will be dangerous in a month.`,
  );

  return {
    circumferenceCm,
    circumferenceMm: circumferenceCm * 10,
    baseSize,
    recommended,
    shiftApplied,
    sizing,
    borderline,
    positionInBandPct,
    shape,
    estimatedCircumference,
    estimateGap,
    chart: HELMET_SIZES,
    notes,
  };
}
