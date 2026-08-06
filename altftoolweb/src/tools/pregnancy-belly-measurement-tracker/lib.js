/**
 * Pregnancy belly measurement maths.
 *
 * Two long-standing bedside rules are implemented:
 *
 * McDonald's rule — between roughly 24 and 36 weeks, the fundal height in
 * centimetres (pubic symphysis to the top of the uterus) is approximately equal
 * to the gestational age in weeks. A difference of up to about 2 cm is normal
 * measurement variation; obstetric practice investigates a discrepancy of more
 * than 3 cm with an ultrasound.
 *
 * Johnson's formula — a rough bedside estimate of fetal weight:
 *   weight (g) = (fundal height cm - n) x 155
 * with n = 12 when the presenting part is at or above the ischial spines and
 * n = 11 once it has descended below them. One centimetre is subtracted from
 * the fundal height when maternal weight is over about 91 kg.
 *
 * Nothing here reads the system clock.
 */

/** Weeks over which McDonald's rule is considered reliable. */
export const MCDONALD_MIN_WEEK = 24;
export const MCDONALD_MAX_WEEK = 36;

/** Normal measurement variation around the expected fundal height, in cm. */
export const NORMAL_TOLERANCE_CM = 2;
/** Discrepancy at which obstetric practice usually orders a growth scan, in cm. */
export const REVIEW_TOLERANCE_CM = 3;

/** Johnson's formula constants. */
export const JOHNSON_MULTIPLIER = 155;
export const JOHNSON_N_ABOVE_SPINES = 12;
export const JOHNSON_N_BELOW_SPINES = 11;
/** Maternal weight above which Johnson's rule subtracts 1 cm from the measurement. */
export const JOHNSON_WEIGHT_ADJUST_KG = 91;
export const JOHNSON_WEIGHT_ADJUST_CM = 1;

/** Accepted input ranges. */
export const MIN_WEEK = 16;
export const MAX_WEEK = 44;
export const MIN_FUNDAL_CM = 5;
export const MAX_FUNDAL_CM = 60;
export const MIN_CIRCUMFERENCE_CM = 40;
export const MAX_CIRCUMFERENCE_CM = 200;

/** Expected fundal height in cm for a gestational week under McDonald's rule. */
export function expectedFundalHeight(week) {
  const w = Number(week);
  if (!Number.isFinite(w)) return null;
  return w;
}

/**
 * Compare one fundal height measurement with McDonald's rule.
 * @returns {object} { expected, difference, band, message } or { error }
 */
export function assessFundalHeight({ week, fundalHeightCm } = {}) {
  const w = Number(week);
  const fh = Number(fundalHeightCm);
  if (!Number.isFinite(w) || w < MIN_WEEK || w > MAX_WEEK) {
    return { error: `Gestational week should be between ${MIN_WEEK} and ${MAX_WEEK}.` };
  }
  if (!Number.isFinite(fh) || fh < MIN_FUNDAL_CM || fh > MAX_FUNDAL_CM) {
    return { error: `Fundal height should be between ${MIN_FUNDAL_CM} and ${MAX_FUNDAL_CM} cm.` };
  }

  const expected = expectedFundalHeight(w);
  const difference = fh - expected;
  const magnitude = Math.abs(difference);
  const reliable = w >= MCDONALD_MIN_WEEK && w <= MCDONALD_MAX_WEEK;

  let band = "normal";
  let message = `Within ${NORMAL_TOLERANCE_CM} cm of the ${expected} cm expected at ${w} weeks.`;
  if (magnitude > REVIEW_TOLERANCE_CM) {
    band = "review";
    message = `${magnitude.toFixed(1)} cm ${difference > 0 ? "above" : "below"} the ${expected} cm expected — more than ${REVIEW_TOLERANCE_CM} cm is usually checked with a scan.`;
  } else if (magnitude > NORMAL_TOLERANCE_CM) {
    band = "watch";
    message = `${magnitude.toFixed(1)} cm ${difference > 0 ? "above" : "below"} expected — still common, but worth mentioning at your next visit.`;
  }

  if (!reliable) {
    band = "outside-window";
    message = `McDonald's rule is only reliable between ${MCDONALD_MIN_WEEK} and ${MCDONALD_MAX_WEEK} weeks, so the ${expected} cm comparison is indicative only.`;
  }

  return { week: w, fundalHeightCm: fh, expected, difference, magnitude, band, reliable, message };
}

/**
 * Johnson's formula estimate of fetal weight in grams.
 * @returns {object} { grams, n, adjustedFundalHeight } or { error }
 */
export function johnsonEstimatedWeight({
  fundalHeightCm,
  belowSpines = false,
  maternalWeightKg = null,
} = {}) {
  const fh = Number(fundalHeightCm);
  if (!Number.isFinite(fh) || fh < MIN_FUNDAL_CM || fh > MAX_FUNDAL_CM) {
    return { error: `Fundal height should be between ${MIN_FUNDAL_CM} and ${MAX_FUNDAL_CM} cm.` };
  }

  let adjusted = fh;
  let weightAdjusted = false;
  const maternal = Number(maternalWeightKg);
  if (Number.isFinite(maternal) && maternal > JOHNSON_WEIGHT_ADJUST_KG) {
    adjusted -= JOHNSON_WEIGHT_ADJUST_CM;
    weightAdjusted = true;
  }

  const n = belowSpines ? JOHNSON_N_BELOW_SPINES : JOHNSON_N_ABOVE_SPINES;
  const grams = (adjusted - n) * JOHNSON_MULTIPLIER;
  if (!(grams > 0)) {
    return {
      error: "The fundal height is too small for a Johnson's formula estimate at this stage.",
    };
  }

  return { grams, n, adjustedFundalHeight: adjusted, weightAdjusted };
}

/** Validate a single log entry. Returns { error } or the cleaned entry. */
export function normaliseEntry(entry = {}) {
  const week = Number(entry.week);
  const fundalHeightCm = Number(entry.fundalHeightCm);
  const hasCircumference =
    entry.circumferenceCm !== "" && entry.circumferenceCm !== null && entry.circumferenceCm !== undefined;
  const circumferenceCm = hasCircumference ? Number(entry.circumferenceCm) : null;

  if (!Number.isFinite(week) || week < MIN_WEEK || week > MAX_WEEK) {
    return { error: `Gestational week should be between ${MIN_WEEK} and ${MAX_WEEK}.` };
  }
  if (!Number.isFinite(fundalHeightCm) || fundalHeightCm < MIN_FUNDAL_CM || fundalHeightCm > MAX_FUNDAL_CM) {
    return { error: `Fundal height should be between ${MIN_FUNDAL_CM} and ${MAX_FUNDAL_CM} cm.` };
  }
  if (
    circumferenceCm !== null &&
    (!Number.isFinite(circumferenceCm) ||
      circumferenceCm < MIN_CIRCUMFERENCE_CM ||
      circumferenceCm > MAX_CIRCUMFERENCE_CM)
  ) {
    return {
      error: `Belly circumference should be between ${MIN_CIRCUMFERENCE_CM} and ${MAX_CIRCUMFERENCE_CM} cm.`,
    };
  }

  return { id: entry.id, week, fundalHeightCm, circumferenceCm };
}

/**
 * Analyse a whole log of measurements.
 *
 * @param {Array} entries Each { id, week, fundalHeightCm, circumferenceCm }
 * @returns {object} { rows, latest, growth, flagged, count }
 */
export function analyseLog(entries = []) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { rows: [], latest: null, growth: null, flagged: 0, count: 0 };
  }

  const cleaned = [];
  for (const entry of entries) {
    const normalised = normaliseEntry(entry);
    if (normalised.error) continue;
    cleaned.push(normalised);
  }
  if (cleaned.length === 0) {
    return { rows: [], latest: null, growth: null, flagged: 0, count: 0 };
  }

  cleaned.sort((a, b) => a.week - b.week);

  const rows = cleaned.map((entry, index) => {
    const assessment = assessFundalHeight({
      week: entry.week,
      fundalHeightCm: entry.fundalHeightCm,
    });
    const previous = index > 0 ? cleaned[index - 1] : null;
    const weekGap = previous ? entry.week - previous.week : null;
    const fundalDelta = previous ? entry.fundalHeightCm - previous.fundalHeightCm : null;
    const circumferenceDelta =
      previous && previous.circumferenceCm !== null && entry.circumferenceCm !== null
        ? entry.circumferenceCm - previous.circumferenceCm
        : null;

    return {
      ...entry,
      expected: assessment.expected ?? null,
      difference: assessment.difference ?? null,
      band: assessment.band ?? "unknown",
      message: assessment.message ?? "",
      weekGap,
      fundalDelta,
      fundalPerWeek: weekGap && weekGap > 0 ? fundalDelta / weekGap : null,
      circumferenceDelta,
      circumferencePerWeek: weekGap && weekGap > 0 && circumferenceDelta !== null ? circumferenceDelta / weekGap : null,
    };
  });

  const first = cleaned[0];
  const last = cleaned[cleaned.length - 1];
  const spanWeeks = last.week - first.week;
  const growth =
    spanWeeks > 0
      ? {
          spanWeeks,
          fundalTotal: last.fundalHeightCm - first.fundalHeightCm,
          fundalPerWeek: (last.fundalHeightCm - first.fundalHeightCm) / spanWeeks,
          circumferenceTotal:
            first.circumferenceCm !== null && last.circumferenceCm !== null
              ? last.circumferenceCm - first.circumferenceCm
              : null,
          circumferencePerWeek:
            first.circumferenceCm !== null && last.circumferenceCm !== null
              ? (last.circumferenceCm - first.circumferenceCm) / spanWeeks
              : null,
        }
      : null;

  const flagged = rows.filter((row) => row.band === "review").length;

  return {
    rows,
    latest: rows[rows.length - 1],
    growth,
    flagged,
    count: rows.length,
  };
}
