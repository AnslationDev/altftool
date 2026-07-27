/**
 * Bag dimensions: inches <-> centimetres, plus a fit check against an allowance.
 *
 * The inch has been exactly 2.54 cm since the 1959 international yard and pound
 * agreement, so every conversion here is exact rather than approximate.
 *
 * Airlines state a cabin allowance either as three dimensions (55 x 40 x 20 cm) or as
 * a LINEAR total — the sum of length + width + height. The familiar checked-bag figure
 * is 62 linear inches, which is 157.48 cm and is usually published rounded to 158 cm.
 *
 * The fit test sorts the bag's three dimensions and the allowance's three dimensions
 * from largest to smallest and compares them pairwise. That is the correct test for
 * whether a rectangular box fits a rectangular gauge in ANY orientation: a box fits if
 * and only if its sorted dimensions are each no larger than the sorted allowance.
 * Airlines measure the bag as it is, including wheels, handles and side pockets.
 */

/** Exact by definition (1959 international yard and pound agreement). */
export const CM_PER_INCH = 2.54;

/** Checked-bag linear allowance used by most carriers: 62 in = 157.48 cm (published as 158 cm). */
export const CHECKED_LINEAR_INCHES = 62;
export const CHECKED_LINEAR_CM = CHECKED_LINEAR_INCHES * CM_PER_INCH; // 157.48
export const CHECKED_LINEAR_PUBLISHED_CM = 158;

/** No airline gauge is anywhere near this; catches a metres-entered-as-cm typo. */
export const MAX_DIMENSION_CM = 500;

/**
 * Allowances travellers meet most often. Each is stored in the unit the airline
 * publishes it in, so nothing is double-rounded. These are typical published figures,
 * not a guarantee — always check the carrier you are flying.
 */
export const COMMON_ALLOWANCES = [
  { key: "iata", name: "IATA cabin guideline", unit: "cm", dims: [55, 35, 20] },
  { key: "eu-cabin", name: "Typical European cabin bag", unit: "cm", dims: [55, 40, 20] },
  { key: "us-cabin", name: "Typical US carrier cabin bag", unit: "in", dims: [22, 14, 9] },
  { key: "underseat", name: "Typical personal item / under-seat", unit: "cm", dims: [40, 30, 15] },
  { key: "indigo", name: "Typical Indian carrier cabin bag", unit: "cm", dims: [55, 35, 25] },
  { key: "checked", name: "Checked bag (62 linear inches)", unit: "cm", dims: [77, 52, 28] },
];

const toCm = (value, unit) => (unit === "in" ? value * CM_PER_INCH : value);
const toInches = (value, unit) => (unit === "in" ? value : value / CM_PER_INCH);

/** One allowance row expressed in both units, for a side-by-side reference table. */
export function allowanceInBothUnits(entry) {
  const dims = (entry?.dims ?? []).map((value) => Number(value));
  const unit = entry?.unit === "in" ? "in" : "cm";
  return {
    cm: dims.map((value) => toCm(value, unit)),
    inches: dims.map((value) => toInches(value, unit)),
  };
}

/** Convert a single length in either direction. */
export function convertLength({ value, from = "in" }) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return { error: "Enter the measurement as a number." };
  if (amount < 0) return { error: "A measurement cannot be negative." };
  return { inches: toInches(amount, from), cm: toCm(amount, from), from };
}

/**
 * Convert all three bag dimensions and derive the linear total and volume.
 *
 * @returns {{error:string}|object}
 */
export function convertBagDimensions({ length, width, height, unit = "in" }) {
  const raw = [Number(length), Number(width), Number(height)];
  if (raw.some((value) => !Number.isFinite(value))) {
    return { error: "Enter length, width and height as numbers." };
  }
  if (raw.some((value) => value <= 0)) {
    return { error: "Every dimension must be greater than zero." };
  }

  const cm = raw.map((value) => toCm(value, unit));
  if (cm.some((value) => value > MAX_DIMENSION_CM)) {
    return { error: `A side over ${MAX_DIMENSION_CM} cm is not a bag — check the unit you picked.` };
  }

  const inches = raw.map((value) => toInches(value, unit));
  const linearCm = cm.reduce((sum, value) => sum + value, 0);
  const volumeCm3 = cm[0] * cm[1] * cm[2];

  return {
    unit,
    cm,
    inches,
    linearCm,
    linearInches: inches.reduce((sum, value) => sum + value, 0),
    volumeLitres: volumeCm3 / 1000,
    volumeCubicInches: inches[0] * inches[1] * inches[2],
  };
}

/**
 * Does the bag fit the allowance in some orientation?
 *
 * @param {object} input
 * @param {object} input.bag        { length, width, height, unit }
 * @param {object} input.allowance  { dims:[a,b,c], unit }
 * @returns {{error:string}|object}
 */
export function checkBagFit({ bag, allowance }) {
  const bagConverted = convertBagDimensions(bag);
  if (bagConverted.error) return { error: bagConverted.error };

  const allowanceDims = (allowance?.dims ?? []).map((value) => Number(value));
  if (allowanceDims.length !== 3 || allowanceDims.some((value) => !Number.isFinite(value) || value <= 0)) {
    return { error: "The allowance needs three positive dimensions." };
  }
  const allowanceCm = allowanceDims.map((value) => toCm(value, allowance.unit ?? "cm"));

  const sortedBag = [...bagConverted.cm].sort((a, b) => b - a);
  const sortedAllowance = [...allowanceCm].sort((a, b) => b - a);

  const overhangCm = sortedBag.map((value, index) => value - sortedAllowance[index]);
  const fits = overhangCm.every((value) => value <= 0);
  const worstOverhangCm = Math.max(...overhangCm);

  const allowanceLinearCm = allowanceCm.reduce((sum, value) => sum + value, 0);

  return {
    fits,
    sortedBagCm: sortedBag,
    sortedAllowanceCm: sortedAllowance,
    overhangCm,
    worstOverhangCm,
    worstOverhangInches: worstOverhangCm / CM_PER_INCH,
    bagLinearCm: bagConverted.linearCm,
    allowanceLinearCm,
    /** Separate test for carriers that only publish a linear total. */
    withinCheckedLinear: bagConverted.linearCm <= CHECKED_LINEAR_PUBLISHED_CM,
    checkedLinearHeadroomCm: CHECKED_LINEAR_PUBLISHED_CM - bagConverted.linearCm,
    ...bagConverted,
  };
}
