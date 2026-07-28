/**
 * Tablet-count arithmetic for a target dose.
 *
 * Given a target dose and the strength of the tablets on hand, this works out
 * how many tablets are needed, limited to the pieces the tablet can actually be
 * broken into. It is arithmetic only: whether a particular tablet may be split
 * at all is a property of the product, not of the maths.
 */

/**
 * How finely the tablet can be divided. A single score line gives halves; a
 * cross score gives quarters. Film-coated, modified-release and enteric-coated
 * tablets are normally not divisible at all, which is the "whole" option.
 */
export const SPLIT_OPTIONS = [
  { id: "whole", label: "Not splittable — whole tablets only", fraction: 1 },
  { id: "half", label: "Single score line — halves", fraction: 0.5 },
  { id: "quarter", label: "Cross score — quarters", fraction: 0.25 },
];

/** Floating-point tolerance below which a dose counts as an exact match, in mg. */
export const EXACT_TOLERANCE_MG = 1e-6;

/** Sanity ceilings so a typo does not produce a nonsense answer. */
export const MAX_TABLETS_PER_DOSE = 100;
export const MAX_DOSES_PER_DAY = 24;

const toNumber = (raw) => {
  if (typeof raw === "number") return raw;
  if (raw === null || raw === undefined) return NaN;
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  return Number(text);
};

const isBlank = (raw) =>
  raw === null || raw === undefined || (typeof raw === "string" && raw.trim() === "");

export function getSplitOption(id) {
  return SPLIT_OPTIONS.find((entry) => entry.id === id) || null;
}

/** Vulgar-fraction label for a tablet count, e.g. 1.75 -> "1¾". */
export function formatTabletCount(count) {
  if (!Number.isFinite(count) || count < 0) return "—";
  const whole = Math.floor(count + EXACT_TOLERANCE_MG);
  const remainder = count - whole;
  let fractionLabel = "";
  if (Math.abs(remainder - 0.25) < 0.01) fractionLabel = "¼";
  else if (Math.abs(remainder - 0.5) < 0.01) fractionLabel = "½";
  else if (Math.abs(remainder - 0.75) < 0.01) fractionLabel = "¾";
  else if (remainder > 0.01) return count.toFixed(2);

  if (whole === 0) return fractionLabel || "0";
  return fractionLabel ? `${whole}${fractionLabel}` : String(whole);
}

/** Build one option row from a tablet count. */
function describeOption(tablets, strengthMg, targetMg) {
  const doseMg = tablets * strengthMg;
  const differenceMg = doseMg - targetMg;
  return {
    tablets,
    label: formatTabletCount(tablets),
    doseMg,
    differenceMg,
    percentDifference: targetMg > 0 ? (differenceMg / targetMg) * 100 : 0,
    exact: Math.abs(differenceMg) <= EXACT_TOLERANCE_MG,
  };
}

/**
 * Work out the tablet counts that come closest to a target dose.
 *
 * @param {object} input
 * @param {number|string} input.targetDoseMg Dose the prescription asks for.
 * @param {number|string} input.tabletStrengthMg Strength of one whole tablet.
 * @param {"whole"|"half"|"quarter"} input.splitId How finely it can be divided.
 * @param {number|string} [input.dosesPerDay] Times a day the dose is taken.
 * @param {number|string} [input.packSize] Tablets in the pack, for a days-supply figure.
 * @returns {object} nearest / round-down / round-up options, or { error }
 */
export function calculateTabletSplit({
  targetDoseMg,
  tabletStrengthMg,
  splitId,
  dosesPerDay,
  packSize,
}) {
  const split = getSplitOption(splitId);
  if (!split) return { error: "Choose whether the tablet can be halved, quartered or not split." };

  const target = toNumber(targetDoseMg);
  const strength = toNumber(tabletStrengthMg);

  if (!Number.isFinite(target) || !Number.isFinite(strength)) {
    return { error: "Enter both the target dose and the tablet strength as numbers, in milligrams." };
  }
  if (strength <= 0) return { error: "Tablet strength must be greater than zero milligrams." };
  if (target <= 0) return { error: "The target dose must be greater than zero milligrams." };

  const exactTablets = target / strength;
  if (exactTablets > MAX_TABLETS_PER_DOSE) {
    return {
      error: `That target needs more than ${MAX_TABLETS_PER_DOSE} tablets per dose. Check the strength — it is probably a stronger tablet or the dose is in micrograms.`,
    };
  }

  const step = split.fraction;
  const steps = exactTablets / step;
  const nearestSteps = Math.round(steps);
  const downSteps = Math.floor(steps + EXACT_TOLERANCE_MG);
  const upSteps = Math.ceil(steps - EXACT_TOLERANCE_MG);

  const nearest = describeOption(nearestSteps * step, strength, target);
  const roundDown = describeOption(downSteps * step, strength, target);
  const roundUp = describeOption(upSteps * step, strength, target);

  let frequency = null;
  if (!isBlank(dosesPerDay)) {
    frequency = toNumber(dosesPerDay);
    if (!Number.isFinite(frequency) || frequency <= 0 || !Number.isInteger(frequency)) {
      return { error: "Doses per day must be a whole number of at least 1, or left blank." };
    }
    if (frequency > MAX_DOSES_PER_DAY) {
      return { error: `More than ${MAX_DOSES_PER_DAY} doses a day is not a realistic schedule.` };
    }
  }

  let pack = null;
  if (!isBlank(packSize)) {
    pack = toNumber(packSize);
    if (!Number.isFinite(pack) || pack <= 0) {
      return { error: "Pack size must be a number greater than zero, or left blank." };
    }
  }

  const tabletsPerDay = frequency === null ? null : nearest.tablets * frequency;
  const dailyDoseMg = frequency === null ? null : nearest.doseMg * frequency;
  const daysSupply =
    pack !== null && tabletsPerDay !== null && tabletsPerDay > 0
      ? Math.floor(pack / tabletsPerDay)
      : null;

  return {
    targetMg: target,
    strengthMg: strength,
    split,
    smallestPieceMg: strength * step,
    exactTablets,
    nearest,
    roundDown,
    roundUp,
    exactMatch: nearest.exact,
    /** True when even the smallest allowed piece is bigger than the target dose. */
    targetBelowSmallestPiece: target + EXACT_TOLERANCE_MG < strength * step,
    dosesPerDay: frequency,
    tabletsPerDay,
    tabletsPerDayLabel: tabletsPerDay === null ? null : formatTabletCount(tabletsPerDay),
    dailyDoseMg,
    packSize: pack,
    daysSupply,
  };
}
