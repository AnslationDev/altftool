/**
 * Plank hold benchmark
 *
 * There is no statutory or universally agreed normative table for the front
 * plank, so this tool states its rule openly rather than inventing one:
 *
 *  1. Reference hold. Stuart McGill, the spine biomechanist whose torso
 *     endurance tests these benchmarks descend from, treats roughly two minutes
 *     as a reasonable front-plank standard for a healthy adult, and warns that
 *     holds far beyond that stop testing anything useful. 120 seconds is
 *     therefore the reference for adults under 40.
 *  2. Age adjustment. Muscular strength and endurance decline at roughly 1% per
 *     year from about age 40, so the reference is reduced by 1% for each year
 *     over 39. This scaling is this tool's stated convention, not a published
 *     norm.
 *  3. No sex adjustment. In McGill's own trunk endurance data, women match or
 *     exceed men on the flexor and extensor endurance tests, unlike maximal
 *     strength lifts. Applying a female penalty would misrepresent the evidence,
 *     so the target is the same for everyone of the same age.
 *
 * Informational and for training use only. It is not a medical assessment.
 */

/** Reference front-plank hold for a healthy adult under 40, in seconds. */
export const REFERENCE_HOLD_SECONDS = 120;

/** Age from which the reference starts to be reduced. */
export const AGE_DECLINE_START = 40;
/** Proportion the reference falls per year of age from AGE_DECLINE_START. */
export const DECLINE_PER_YEAR = 0.01;
/** Guard so the factor can never reach zero at extreme ages. */
export const MIN_AGE_FACTOR = 0.35;

export const AGE_MIN = 13;
export const AGE_MAX = 100;

/** Sanity limits on a logged hold. */
export const MIN_HOLD_SECONDS = 1;
export const MAX_HOLD_SECONDS = 7200; // two hours; beyond this the entry is a typo

/**
 * Performance bands expressed as a ratio of the age-adjusted target, so the
 * wording stays consistent whatever the target happens to be.
 */
export const PERFORMANCE_BANDS = [
  { min: 0, max: 0.25, label: "Needs work", note: "Build up with shorter, well-braced holds rather than one long sag." },
  { min: 0.25, max: 0.5, label: "Developing", note: "A working base. Add 5-10 seconds a week and keep the ribs down." },
  { min: 0.5, max: 1, label: "Solid", note: "Comfortably functional core endurance for everyday activity." },
  { min: 1, max: 1.5, label: "Strong", note: "At or beyond the reference hold for your age." },
  { min: 1.5, max: Infinity, label: "Exceptional", note: "Well past the reference. Extra time adds little; progress with harder variations instead." },
];

/** The multiplier applied to the reference hold at a given age. */
export function ageFactor(age) {
  const a = Number(age);
  if (!Number.isFinite(a)) return null;
  if (a < AGE_DECLINE_START) return 1;
  const factor = 1 - DECLINE_PER_YEAR * (a - (AGE_DECLINE_START - 1));
  return Math.max(MIN_AGE_FACTOR, factor);
}

/** The age-adjusted target hold, in whole seconds. */
export function targetSecondsForAge(age) {
  const factor = ageFactor(age);
  if (factor === null) return null;
  return Math.round(REFERENCE_HOLD_SECONDS * factor);
}

export function bandForRatio(ratio) {
  return (
    PERFORMANCE_BANDS.find((band) => ratio >= band.min && ratio < band.max) ||
    PERFORMANCE_BANDS[PERFORMANCE_BANDS.length - 1]
  );
}

/** Format a whole number of seconds as m:ss. */
export function formatSeconds(seconds) {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * Compare a plank hold against the age-adjusted target.
 *
 * @param {object} input
 * @param {number} input.seconds How long the plank was held, in seconds.
 * @param {number} input.age     Age in years.
 * @param {"male"|"female"|"unspecified"} [input.sex] Recorded for the summary only.
 * @returns {object} Result object, or { error } when it cannot be compared.
 */
export function computePlankBenchmark({ seconds, age, sex = "unspecified" } = {}) {
  const held = Number(seconds);
  const a = Number(age);

  if (!Number.isFinite(held) || held < MIN_HOLD_SECONDS) {
    return { error: `Enter a hold of at least ${MIN_HOLD_SECONDS} second, or start the timer.` };
  }
  if (held > MAX_HOLD_SECONDS) {
    return { error: `A hold over ${MAX_HOLD_SECONDS / 60} minutes is almost certainly a typo.` };
  }
  if (!Number.isFinite(a) || a < AGE_MIN || a > AGE_MAX) {
    return { error: `Enter an age between ${AGE_MIN} and ${AGE_MAX}.` };
  }

  const target = targetSecondsForAge(a);
  const ratio = held / target;
  const band = bandForRatio(ratio);

  // Seconds needed to reach the next band up, or null when already at the top.
  const nextBand = PERFORMANCE_BANDS[PERFORMANCE_BANDS.indexOf(band) + 1] || null;
  const secondsToNextBand = nextBand ? Math.max(1, Math.ceil(nextBand.min * target - held)) : null;

  return {
    heldSeconds: Math.round(held),
    heldLabel: formatSeconds(held),
    targetSeconds: target,
    targetLabel: formatSeconds(target),
    referenceSeconds: REFERENCE_HOLD_SECONDS,
    ageFactor: ageFactor(a),
    ratio,
    percentOfTarget: ratio * 100,
    band: band.label,
    bandNote: band.note,
    nextBand: nextBand ? nextBand.label : null,
    secondsToNextBand,
    differenceSeconds: Math.round(held - target),
    age: a,
    sex,
  };
}
