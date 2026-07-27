/**
 * Lateral entry (diploma-to-degree, second-year B.Tech/B.E.) merit maths.
 *
 * Lateral-entry admissions rank candidates in one of the published ways:
 *  1. Entrance-exam merit — the state lateral-entry test rank list
 *     (LEET in Haryana/Punjab, AP & TS ECET, JELET in West Bengal):
 *     merit is the entrance score alone.
 *  2. Qualifying-marks merit — some universities rank directly on the
 *     diploma percentage when no entrance test is held.
 *  3. Combined merit — a weighted formula over both.
 *
 * All reduce to a weighted index on a 100-point scale:
 *   merit = diplomaPercent x (w/100) + entrancePercent x ((100-w)/100)
 *
 * Eligibility floor (AICTE Approval Process Handbook, lateral entry to the
 * second year of degree engineering): a diploma in the appropriate stream
 * with at least 45% marks (40% for reserved categories where the state so
 * provides).
 */

/** AICTE minimum diploma percentage for lateral entry (general category). */
export const AICTE_MIN_DIPLOMA_PERCENT = 45;

/** AICTE minimum for reserved categories where the state provides relaxation. */
export const AICTE_MIN_DIPLOMA_PERCENT_RESERVED = 40;

/** Weight presets for the diploma-marks share of the merit index. */
export const WEIGHT_PRESETS = [
  {
    id: "entrance-only",
    label: "Entrance exam only (LEET, ECET, JELET)",
    diplomaWeight: 0,
  },
  {
    id: "diploma-only",
    label: "Diploma marks only (non-entrance admissions)",
    diplomaWeight: 100,
  },
  {
    id: "even-split",
    label: "50 : 50 mixed formula",
    diplomaWeight: 50,
  },
];

/** Merit index is reported on a 0-100 scale. */
export const MERIT_SCALE = 100;

/** Convert obtained/maximum into a percent with guards; number or { error }. */
export function toPercent(obtained, maximum, label) {
  const got = Number(obtained);
  const max = Number(maximum);
  if (!Number.isFinite(got) || !Number.isFinite(max)) {
    return { error: `Enter ${label} marks and maximum as numbers.` };
  }
  if (max <= 0) return { error: `${label} maximum marks must be greater than zero.` };
  if (got < 0) return { error: `${label} marks cannot be negative.` };
  if (got > max) return { error: `${label} marks cannot exceed the maximum (${max}).` };
  return (got / max) * 100;
}

/**
 * Compute the lateral-entry merit index and AICTE eligibility flag.
 *
 * @param {object} input
 * @param {number} input.diplomaObtained  Diploma aggregate marks obtained.
 * @param {number} input.diplomaMax       Diploma aggregate maximum.
 * @param {number} input.entranceObtained Entrance (LEET/ECET/JELET) score.
 * @param {number} input.entranceMax      Entrance maximum.
 * @param {number} input.diplomaWeight    Weight (0-100) for diploma marks.
 * @param {boolean} [input.isReserved]    True to apply the 40% reserved-category floor.
 * @returns {object} result, or { error }.
 */
export function computeLateralEntryMerit({
  diplomaObtained,
  diplomaMax,
  entranceObtained,
  entranceMax,
  diplomaWeight,
  isReserved = false,
}) {
  const weight = Number(diplomaWeight);
  if (!Number.isFinite(weight) || weight < 0 || weight > 100) {
    return { error: "The diploma weight must be between 0 and 100." };
  }

  const diplomaPercent = toPercent(diplomaObtained, diplomaMax, "Diploma");
  if (typeof diplomaPercent === "object") return diplomaPercent;

  let entrancePercent = 0;
  if (weight < 100) {
    const computed = toPercent(entranceObtained, entranceMax, "Entrance");
    if (typeof computed === "object") return computed;
    entrancePercent = computed;
  } else {
    const computed = toPercent(entranceObtained, entranceMax, "Entrance");
    entrancePercent = typeof computed === "object" ? 0 : computed;
  }

  const diplomaShare = (diplomaPercent * weight) / 100;
  const entranceShare = (entrancePercent * (100 - weight)) / 100;
  const merit = diplomaShare + entranceShare;

  const aicteFloor = isReserved
    ? AICTE_MIN_DIPLOMA_PERCENT_RESERVED
    : AICTE_MIN_DIPLOMA_PERCENT;
  const meetsAicteFloor = diplomaPercent >= aicteFloor;

  const round2 = (v) => Math.round(v * 100) / 100;

  return {
    merit: round2(merit),
    meritScale: MERIT_SCALE,
    diplomaPercent: round2(diplomaPercent),
    entrancePercent: round2(entrancePercent),
    diplomaShare: round2(diplomaShare),
    entranceShare: round2(entranceShare),
    diplomaWeight: weight,
    entranceWeight: 100 - weight,
    aicteFloor,
    meetsAicteFloor,
  };
}
