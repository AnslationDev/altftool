/**
 * Tamil Nadu HSC (+2) cutoff arithmetic.
 *
 * Tamil Nadu does not admit on the raw +2 total. It builds a "cutoff mark"
 * out of 200 in which the stream subject carries full weight and the two
 * supporting science subjects carry half weight each:
 *
 *   Engineering (TNEA)          cutoff = Maths   + (Physics + Chemistry) / 2
 *   Medical / agriculture group cutoff = Biology + (Physics + Chemistry) / 2
 *
 * Both are out of 200 because the full-weight subject contributes at most 100
 * and the two half-weight subjects contribute at most 50 each.
 *
 * The same rule was historically written as Maths/2 + Physics/4 + Chemistry/4
 * for the years when each HSC subject was marked out of 200. That is the
 * identical formula: normalise every subject to 100 first, then apply the
 * full/half weighting. This module normalises, so a 100-mark marksheet and a
 * 200-mark marksheet both produce the correct cutoff.
 *
 * Scope note: MBBS and BDS seats in Tamil Nadu have been allotted on NEET
 * since 2017, so the "medical" cutoff here is the +2 cutoff still used by the
 * agriculture, veterinary, fisheries, allied-health and B.Sc. streams and as a
 * reference figure. It is not a NEET score.
 */

/** A cutoff is out of 200: one full-weight subject plus two half-weight subjects. */
export const CUTOFF_MAX = 200;

/** Weight applied to the stream subject (Maths for engineering, Biology for medical). */
export const MAIN_SUBJECT_WEIGHT = 1;

/** Weight applied to Physics and to Chemistry. */
export const SUPPORT_SUBJECT_WEIGHT = 0.5;

/** Marksheet scales Tamil Nadu has used for a single theory subject. */
export const SUBJECT_SCALES = [
  { value: 100, label: "Out of 100 (current marksheet)" },
  { value: 200, label: "Out of 200 (older marksheet)" },
];

/**
 * The two cutoff streams.
 * `mainSubject` is the subject that carries full weight.
 */
export const CUTOFF_STREAMS = [
  {
    value: "engineering",
    label: "Engineering (TNEA)",
    mainSubject: "Mathematics",
    note: "Used by Anna University TNEA counselling for B.E. and B.Tech seats.",
  },
  {
    value: "medical",
    label: "Medical / agriculture group",
    mainSubject: "Biology",
    note: "Used by the agriculture, veterinary, fisheries and allied-health streams. MBBS and BDS run on NEET.",
  },
];

/**
 * The 7.5% horizontal reservation for government school students, introduced
 * by the Tamil Nadu Act of 2020 for professional courses.
 */
export const GOVT_SCHOOL_QUOTA_PERCENT = 7.5;

/** Round without floating point noise leaking into the display. */
function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Convert a raw subject mark to the 0 - 100 scale the cutoff formula expects.
 * @param {number} mark raw mark from the marksheet
 * @param {number} scale maximum mark for that subject (100 or 200)
 * @returns {number|null} normalised mark, or null when the input is unusable
 */
export function normaliseMark(mark, scale) {
  const value = Number(mark);
  const max = Number(scale);
  if (!Number.isFinite(value) || !Number.isFinite(max)) return null;
  if (max <= 0) return null;
  if (value < 0 || value > max) return null;
  return (value / max) * 100;
}

/**
 * Cutoff mark out of 200 from three HSC subject marks.
 *
 * @param {object} input
 * @param {number|string} input.mainMark Maths (engineering) or Biology (medical)
 * @param {number|string} input.physics
 * @param {number|string} input.chemistry
 * @param {number} [input.scale=100] maximum mark per subject on the marksheet
 * @param {string} [input.stream="engineering"] "engineering" or "medical"
 * @returns {object} cutoff breakdown, or { error } when the marks are unusable
 */
export function computeCutoff({ mainMark, physics, chemistry, scale = 100, stream = "engineering" }) {
  const streamRecord = CUTOFF_STREAMS.find((item) => item.value === stream);
  if (!streamRecord) {
    return { error: "Choose either the engineering stream or the medical / agriculture stream." };
  }

  const max = Number(scale);
  if (!Number.isFinite(max) || max <= 0) {
    return { error: "The maximum mark per subject must be a positive number, normally 100 or 200." };
  }

  const fields = [
    [streamRecord.mainSubject, mainMark],
    ["Physics", physics],
    ["Chemistry", chemistry],
  ];

  const normalised = {};
  for (const [label, raw] of fields) {
    if (raw === "" || raw === null || raw === undefined) {
      return { error: `Enter your ${label} mark.` };
    }
    const value = Number(raw);
    if (!Number.isFinite(value)) {
      return { error: `${label} must be a number.` };
    }
    if (value < 0) {
      return { error: `${label} cannot be negative.` };
    }
    if (value > max) {
      return { error: `${label} is ${value}, above the maximum of ${max} for this marksheet.` };
    }
    normalised[label] = normaliseMark(value, max);
  }

  const mainNorm = normalised[streamRecord.mainSubject];
  const physicsNorm = normalised.Physics;
  const chemistryNorm = normalised.Chemistry;

  const mainContribution = mainNorm * MAIN_SUBJECT_WEIGHT;
  const physicsContribution = physicsNorm * SUPPORT_SUBJECT_WEIGHT;
  const chemistryContribution = chemistryNorm * SUPPORT_SUBJECT_WEIGHT;
  const cutoff = mainContribution + physicsContribution + chemistryContribution;

  return {
    stream: streamRecord.value,
    streamLabel: streamRecord.label,
    mainSubject: streamRecord.mainSubject,
    cutoff: round(cutoff, 2),
    cutoffMax: CUTOFF_MAX,
    percentage: round((cutoff / CUTOFF_MAX) * 100, 2),
    mainContribution: round(mainContribution, 2),
    physicsContribution: round(physicsContribution, 2),
    chemistryContribution: round(chemistryContribution, 2),
    supportContribution: round(physicsContribution + chemistryContribution, 2),
    normalisedMain: round(mainNorm, 2),
    normalisedPhysics: round(physicsNorm, 2),
    normalisedChemistry: round(chemistryNorm, 2),
    threeSubjectAverage: round((mainNorm + physicsNorm + chemistryNorm) / 3, 2),
    scale: max,
    formula: `${streamRecord.mainSubject} + (Physics + Chemistry) ÷ 2`,
  };
}

/**
 * The stream-subject mark still needed to land on a target cutoff, given the
 * Physics and Chemistry marks that are already fixed.
 *
 * @param {object} input
 * @param {number|string} input.targetCutoff wanted cutoff out of 200
 * @param {number|string} input.physics
 * @param {number|string} input.chemistry
 * @param {number} [input.scale=100]
 * @returns {object} { requiredNormalised, requiredRaw, achievable } or { error }
 */
export function requiredMainMark({ targetCutoff, physics, chemistry, scale = 100 }) {
  const target = Number(targetCutoff);
  const max = Number(scale);
  if (!Number.isFinite(target)) {
    return { error: "Enter the cutoff you are aiming for, as a number out of 200." };
  }
  if (target < 0 || target > CUTOFF_MAX) {
    return { error: `A cutoff can only be between 0 and ${CUTOFF_MAX}.` };
  }
  if (!Number.isFinite(max) || max <= 0) {
    return { error: "The maximum mark per subject must be a positive number." };
  }

  const physicsNorm = normaliseMark(physics, max);
  const chemistryNorm = normaliseMark(chemistry, max);
  if (physicsNorm === null || chemistryNorm === null) {
    return { error: `Physics and Chemistry must each be between 0 and ${max}.` };
  }

  const alreadyHeld = (physicsNorm + chemistryNorm) * SUPPORT_SUBJECT_WEIGHT;
  const requiredNormalised = target - alreadyHeld;

  if (requiredNormalised <= 0) {
    return {
      alreadyHeld: round(alreadyHeld, 2),
      requiredNormalised: 0,
      requiredRaw: 0,
      achievable: true,
      alreadyReached: true,
    };
  }

  return {
    alreadyHeld: round(alreadyHeld, 2),
    requiredNormalised: round(requiredNormalised, 2),
    requiredRaw: round((requiredNormalised / 100) * max, 2),
    achievable: requiredNormalised <= 100,
    alreadyReached: false,
  };
}
