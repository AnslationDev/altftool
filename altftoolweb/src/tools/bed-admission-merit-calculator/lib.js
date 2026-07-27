/**
 * B.Ed admission merit maths.
 *
 * B.Ed admissions in India rank candidates in one of three published ways:
 *  1. Entrance-exam merit — the state entrance rank list (UP B.Ed JEE,
 *     Bihar B.Ed CET, MAH B.Ed CET): merit is the entrance score alone,
 *     with graduation marks only as an eligibility floor.
 *  2. Qualifying-marks merit — universities without an entrance test rank
 *     on the graduation (bachelor's degree) percentage.
 *  3. Combined merit — some universities publish a weighted formula over
 *     both (e.g. entrance 70 : graduation 30).
 *
 * All three reduce to a weighted index on a 100-point scale:
 *   merit = graduationPercent x (w/100) + entrancePercent x ((100-w)/100)
 *
 * NCTE eligibility floor (NCTE Regulations, 2014, Appendix 4): at least 50%
 * marks in the bachelor's/master's degree (55% in engineering/technology
 * degrees with specialisation in science and mathematics); relaxation for
 * reserved categories is per state/university rules.
 */

/** NCTE minimum graduation percentage for B.Ed eligibility (general). */
export const NCTE_MIN_GRADUATION_PERCENT = 50;

/** NCTE minimum for B.E./B.Tech (science/maths specialisation) candidates. */
export const NCTE_MIN_ENGINEERING_PERCENT = 55;

/** Weight presets for the graduation-marks share of the merit index. */
export const WEIGHT_PRESETS = [
  {
    id: "entrance-only",
    label: "Entrance exam only (UP B.Ed JEE, Bihar CET-B.Ed, MAH B.Ed CET)",
    graduationWeight: 0,
  },
  {
    id: "graduation-only",
    label: "Graduation marks only (non-entrance universities)",
    graduationWeight: 100,
  },
  {
    id: "combined-30-70",
    label: "Combined 30 : 70 (graduation : entrance)",
    graduationWeight: 30,
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
 * Compute the B.Ed admission merit index and NCTE eligibility flag.
 *
 * @param {object} input
 * @param {number} input.gradObtained     Graduation marks obtained (or percentage if max is 100).
 * @param {number} input.gradMax          Graduation maximum marks.
 * @param {number} input.entranceObtained Entrance score.
 * @param {number} input.entranceMax      Entrance maximum.
 * @param {number} input.graduationWeight Weight (0-100) for graduation marks.
 * @param {boolean} [input.isEngineering] True for B.E./B.Tech candidates (55% NCTE floor).
 * @returns {object} result, or { error }.
 */
export function computeBedMerit({
  gradObtained,
  gradMax,
  entranceObtained,
  entranceMax,
  graduationWeight,
  isEngineering = false,
}) {
  const weight = Number(graduationWeight);
  if (!Number.isFinite(weight) || weight < 0 || weight > 100) {
    return { error: "The graduation weight must be between 0 and 100." };
  }

  const gradPercent = toPercent(gradObtained, gradMax, "Graduation");
  if (typeof gradPercent === "object") return gradPercent;

  let entrancePercent = 0;
  if (weight < 100) {
    const computed = toPercent(entranceObtained, entranceMax, "Entrance");
    if (typeof computed === "object") return computed;
    entrancePercent = computed;
  } else {
    const computed = toPercent(entranceObtained, entranceMax, "Entrance");
    entrancePercent = typeof computed === "object" ? 0 : computed;
  }

  const gradShare = (gradPercent * weight) / 100;
  const entranceShare = (entrancePercent * (100 - weight)) / 100;
  const merit = gradShare + entranceShare;

  const ncteFloor = isEngineering ? NCTE_MIN_ENGINEERING_PERCENT : NCTE_MIN_GRADUATION_PERCENT;
  const meetsNcteFloor = gradPercent >= ncteFloor;

  const round2 = (v) => Math.round(v * 100) / 100;

  return {
    merit: round2(merit),
    meritScale: MERIT_SCALE,
    gradPercent: round2(gradPercent),
    entrancePercent: round2(entrancePercent),
    gradShare: round2(gradShare),
    entranceShare: round2(entranceShare),
    graduationWeight: weight,
    entranceWeight: 100 - weight,
    ncteFloor,
    meetsNcteFloor,
  };
}
