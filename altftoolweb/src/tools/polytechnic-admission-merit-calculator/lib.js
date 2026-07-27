/**
 * Polytechnic (diploma in engineering) admission merit maths.
 *
 * State polytechnic admissions in India use one of two published models:
 *  1. Qualifying-marks merit — the merit list is the Class 10 percentage
 *     itself (e.g. Maharashtra Poly admissions via DTE, where merit marks =
 *     SSC percentage; Delhi CET-abolished streams also admit on Class 10 %).
 *  2. Entrance-exam merit — the merit list is the entrance percentage/score
 *     (e.g. JEECUP for UP Polytechnic, JEXPO for West Bengal, Bihar DCECE),
 *     with qualifying marks used only as an eligibility floor and tie-breaker.
 *
 * Both are special cases of a weighted merit index on a 100-point scale:
 *   merit = qualifyingPercent x (w/100) + entrancePercent x ((100-w)/100)
 * where w is the weight given to the qualifying (Class 10) marks.
 * The presets below encode the two pure models plus an even split for
 * institutes that publish a mixed formula.
 */

/** Weight presets for the qualifying-marks share of the merit index. */
export const WEIGHT_PRESETS = [
  {
    id: "qualifying-only",
    label: "Class 10 marks only (e.g. Maharashtra Poly / DTE)",
    qualifyingWeight: 100,
  },
  {
    id: "entrance-only",
    label: "Entrance exam only (e.g. JEECUP, JEXPO, DCECE)",
    qualifyingWeight: 0,
  },
  {
    id: "even-split",
    label: "50 : 50 mixed formula",
    qualifyingWeight: 50,
  },
];

/** Merit index is reported on a 0-100 scale. */
export const MERIT_SCALE = 100;

/**
 * Convert obtained/maximum marks into a percentage, with guards.
 * Returns a number 0-100 or an { error }.
 */
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
 * Compute the polytechnic admission merit index.
 *
 * @param {object} input
 * @param {number} input.qualObtained   Class 10 marks obtained.
 * @param {number} input.qualMax        Class 10 maximum marks (e.g. 500 or 600).
 * @param {number} input.entranceObtained  Entrance exam score (ignored at weight 100).
 * @param {number} input.entranceMax       Entrance exam maximum.
 * @param {number} input.qualifyingWeight  Weight (0-100) given to Class 10 marks.
 * @returns {object} result, or { error } for invalid input.
 */
export function computePolytechnicMerit({
  qualObtained,
  qualMax,
  entranceObtained,
  entranceMax,
  qualifyingWeight,
}) {
  const weight = Number(qualifyingWeight);
  if (!Number.isFinite(weight) || weight < 0 || weight > 100) {
    return { error: "The Class 10 weight must be between 0 and 100." };
  }

  const qualPercent = toPercent(qualObtained, qualMax, "Class 10");
  if (typeof qualPercent === "object") return qualPercent;

  let entrancePercent = 0;
  if (weight < 100) {
    const computed = toPercent(entranceObtained, entranceMax, "Entrance");
    if (typeof computed === "object") return computed;
    entrancePercent = computed;
  } else {
    // Entrance is unused at full qualifying weight; still surface it if valid.
    const computed = toPercent(entranceObtained, entranceMax, "Entrance");
    entrancePercent = typeof computed === "object" ? 0 : computed;
  }

  const qualShare = (qualPercent * weight) / 100;
  const entranceShare = (entrancePercent * (100 - weight)) / 100;
  const merit = qualShare + entranceShare;

  const round2 = (v) => Math.round(v * 100) / 100;

  return {
    merit: round2(merit),
    meritScale: MERIT_SCALE,
    qualPercent: round2(qualPercent),
    entrancePercent: round2(entrancePercent),
    qualShare: round2(qualShare),
    entranceShare: round2(entranceShare),
    qualifyingWeight: weight,
    entranceWeight: 100 - weight,
  };
}
