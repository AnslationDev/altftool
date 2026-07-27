/**
 * Heart rate recovery (HRR) after exercise.
 *
 *   HRR1 = peak heart rate − heart rate 1 minute after stopping
 *   HRR2 = peak heart rate − heart rate 2 minutes after stopping
 *
 * The faster the fall, the stronger the parasympathetic (vagal) reactivation.
 *
 * Clinical thresholds below are the ones used in the studies that established HRR
 * as a prognostic marker. They depend on what happens straight after the test:
 *  - Cole CR et al., N Engl J Med 1999;341:1351-1357 — treadmill test with an active
 *    cool-down, HRR1 of 12 bpm or less was an independent predictor of mortality.
 *  - Watanabe J et al., Circulation 2001;104:1911-1916 — test stopped with the patient
 *    moved to the supine position, abnormal HRR1 defined as 18 bpm or less.
 *  - Shetler K et al., J Am Coll Cardiol 2001;38:1980-1987 — HRR2 of 22 bpm or less
 *    in supine recovery predicted increased mortality.
 *
 * The fitness bands are a widely used athletic rule of thumb, not a clinical standard.
 */

export const HR_MIN = 25;
export const HR_MAX = 230;
export const PEAK_HR_MIN = 60;

export const RECOVERY_PROTOCOLS = [
  {
    key: "cooldown",
    label: "Active cool-down (kept walking or spinning)",
    hrr1AbnormalAtOrBelow: 12,
    source: "Cole et al. 1999, NEJM — treadmill test with a walking cool-down.",
  },
  {
    key: "supine",
    label: "Stopped and sat or lay down immediately",
    hrr1AbnormalAtOrBelow: 18,
    source: "Watanabe et al. 2001, Circulation — supine recovery after test termination.",
  },
];

/** Shetler et al. 2001 — two-minute threshold, supine recovery. */
export const HRR2_ABNORMAL_AT_OR_BELOW = 22;

/**
 * Commonly cited athletic interpretation of the one-minute drop.
 * Bands are inclusive lower bounds, checked from the top down.
 */
export const HRR1_FITNESS_BANDS = [
  { min: 50, label: "Excellent", note: "Recovery typical of well-conditioned endurance athletes." },
  { min: 40, label: "Good", note: "Strong parasympathetic rebound; consistent aerobic training shows." },
  { min: 30, label: "Average", note: "A normal drop for a recreationally active adult." },
  { min: 20, label: "Below average", note: "Aerobic base work at easy intensity usually improves this." },
  { min: 12, label: "Poor", note: "Slow recovery — worth building steady aerobic volume." },
  { min: -Infinity, label: "Very poor", note: "A very small drop. Discuss it with a doctor before training hard." },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Compute heart rate recovery figures.
 *
 * @param {object} input
 * @param {number} input.peakHr        Highest heart rate reached, bpm.
 * @param {number} input.hr1min        Heart rate 1 minute after stopping, bpm.
 * @param {number|null} [input.hr2min] Heart rate 2 minutes after stopping, bpm.
 * @param {string} [input.protocol]    "cooldown" or "supine".
 * @param {number|null} [input.restingHr] Resting heart rate, for percent-of-reserve context.
 * @returns {object} recovery figures, or { error }.
 */
export function computeHeartRateRecovery({
  peakHr,
  hr1min,
  hr2min = null,
  protocol = "cooldown",
  restingHr = null,
}) {
  if (!isNum(peakHr)) return { error: "Enter the peak heart rate you reached." };
  if (peakHr < PEAK_HR_MIN || peakHr > HR_MAX) {
    return { error: `Peak heart rate should be between ${PEAK_HR_MIN} and ${HR_MAX} bpm.` };
  }
  if (!isNum(hr1min)) return { error: "Enter your heart rate one minute after stopping." };
  if (hr1min < HR_MIN || hr1min > HR_MAX) {
    return { error: `The one-minute reading should be between ${HR_MIN} and ${HR_MAX} bpm.` };
  }
  if (hr1min > peakHr) {
    return { error: "The one-minute reading cannot be higher than your peak heart rate." };
  }

  const chosen = RECOVERY_PROTOCOLS.find((item) => item.key === protocol) || RECOVERY_PROTOCOLS[0];

  let hasTwoMinute = false;
  if (hr2min !== null && hr2min !== undefined && hr2min !== "") {
    if (!isNum(hr2min)) return { error: "The two-minute reading must be a number." };
    if (hr2min < HR_MIN || hr2min > HR_MAX) {
      return { error: `The two-minute reading should be between ${HR_MIN} and ${HR_MAX} bpm.` };
    }
    if (hr2min > peakHr) {
      return { error: "The two-minute reading cannot be higher than your peak heart rate." };
    }
    hasTwoMinute = true;
  }

  if (restingHr !== null && restingHr !== undefined && restingHr !== "") {
    if (!isNum(restingHr)) return { error: "Resting heart rate must be a number." };
    if (restingHr < HR_MIN || restingHr > 130) {
      return { error: `Resting heart rate should be between ${HR_MIN} and 130 bpm.` };
    }
    if (restingHr >= peakHr) {
      return { error: "Resting heart rate must be lower than your peak heart rate." };
    }
  }

  const hrr1 = peakHr - hr1min;
  const hrr2 = hasTwoMinute ? peakHr - hr2min : null;
  const secondMinuteDrop = hasTwoMinute ? hr1min - hr2min : null;

  const band = HRR1_FITNESS_BANDS.find((item) => hrr1 >= item.min);

  const hasReserve = isNum(restingHr) && peakHr > restingHr;
  const reserve = hasReserve ? peakHr - restingHr : null;

  const notes = [];
  if (hasTwoMinute && hr2min > hr1min) {
    notes.push(
      "Your two-minute reading is higher than the one-minute reading. That usually means the monitor lost contact, or you stood up or moved — retake the measurement.",
    );
  }

  return {
    peakHr,
    hr1min,
    hr2min: hasTwoMinute ? hr2min : null,
    hrr1,
    hrr2,
    secondMinuteDrop,
    percentDrop1: (hrr1 / peakHr) * 100,
    percentDrop2: hasTwoMinute ? (hrr2 / peakHr) * 100 : null,
    reserve,
    reserveRecovered1: hasReserve ? (hrr1 / reserve) * 100 : null,
    reserveRecovered2: hasReserve && hasTwoMinute ? (hrr2 / reserve) * 100 : null,
    protocolKey: chosen.key,
    protocolLabel: chosen.label,
    protocolSource: chosen.source,
    hrr1Threshold: chosen.hrr1AbnormalAtOrBelow,
    hrr1BelowThreshold: hrr1 <= chosen.hrr1AbnormalAtOrBelow,
    hrr2Threshold: HRR2_ABNORMAL_AT_OR_BELOW,
    hrr2BelowThreshold: hasTwoMinute ? hrr2 <= HRR2_ABNORMAL_AT_OR_BELOW : null,
    fitnessBand: band.label,
    fitnessNote: band.note,
    notes,
  };
}
