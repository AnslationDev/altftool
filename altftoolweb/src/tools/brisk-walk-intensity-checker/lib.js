/**
 * Brisk-walk intensity check.
 *
 * Four independent field measures of exercise intensity are compared:
 * walking cadence, heart rate, the talk test and Borg RPE. Each is scored
 * light / moderate / vigorous against published thresholds, and the overall
 * verdict is the median so one odd reading cannot swing the answer.
 */

/** Level codes used throughout. */
export const LIGHT = 0;
export const MODERATE = 1;
export const VIGOROUS = 2;
export const LEVEL_NAMES = ["Light", "Moderate", "Vigorous"];

/**
 * Cadence thresholds for adults, Tudor-Locke et al. (2018): 100 steps/min
 * approximates 3 METs (moderate) and 130 steps/min approximates 6 METs.
 */
export const CADENCE_MODERATE = 100;
export const CADENCE_VIGOROUS = 130;

/**
 * Tanaka, Monahan & Seals (2001): HRmax = 208 - 0.7 x age.
 * More accurate across adult ages than the older 220 - age rule.
 */
export const HRMAX_INTERCEPT = 208;
export const HRMAX_SLOPE = 0.7;

/** ACSM / CDC percent-of-HRmax bands. */
export const HRMAX_MODERATE = [0.64, 0.76];
export const HRMAX_VIGOROUS = [0.77, 0.93];

/** ACSM heart-rate-reserve (Karvonen) bands, used when a resting HR is supplied. */
export const HRR_MODERATE = [0.4, 0.59];
export const HRR_VIGOROUS = [0.6, 0.89];

/** Borg 6-20 RPE scale: 12-14 is moderate, 15-17 vigorous (CDC guidance). */
export const RPE_MODERATE = 12;
export const RPE_VIGOROUS = 15;
export const RPE_MIN = 6;
export const RPE_MAX = 20;

/** Talk-test answers and the intensity each one indicates. */
export const TALK_TEST_OPTIONS = [
  { value: "can-sing", label: "I could sing a line of a song", level: LIGHT },
  { value: "can-talk", label: "I can hold a conversation but not sing", level: MODERATE },
  { value: "few-words", label: "I can only manage a few words before a breath", level: VIGOROUS },
  { value: "skip", label: "Not sure / skip", level: null },
];

export const MIN_AGE = 10;
export const MAX_AGE = 100;
export const MAX_HEART_RATE = 240;
export const MAX_CADENCE = 250;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Estimated maximum heart rate for an age, in beats per minute. */
export function maxHeartRate(age) {
  return HRMAX_INTERCEPT - HRMAX_SLOPE * age;
}

/**
 * Target heart-rate windows. Uses heart-rate reserve when a valid resting HR
 * is given (more individual), otherwise plain percent of HRmax.
 */
export function heartRateZones({ age, restingHeartRate = 0 } = {}) {
  const hrMax = maxHeartRate(age);
  const useReserve = restingHeartRate > 0 && restingHeartRate < hrMax;
  if (useReserve) {
    const reserve = hrMax - restingHeartRate;
    return {
      method: "Heart-rate reserve (Karvonen)",
      hrMax,
      moderate: HRR_MODERATE.map((p) => restingHeartRate + p * reserve),
      vigorous: HRR_VIGOROUS.map((p) => restingHeartRate + p * reserve),
    };
  }
  return {
    method: "Percent of maximum heart rate",
    hrMax,
    moderate: HRMAX_MODERATE.map((p) => p * hrMax),
    vigorous: HRMAX_VIGOROUS.map((p) => p * hrMax),
  };
}

function levelFromZones(hr, zones) {
  if (hr >= zones.vigorous[0]) return VIGOROUS;
  if (hr >= zones.moderate[0]) return MODERATE;
  return LIGHT;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  // Even count: take the lower of the two middles so the verdict stays conservative.
  return sorted.length % 2 === 1 ? sorted[mid] : sorted[mid - 1];
}

/**
 * @param {object} input
 * @param {number} input.age              years, required for heart-rate targets
 * @param {number} input.cadence          steps per minute (0 = not measured)
 * @param {number} input.heartRate        working heart rate in bpm (0 = not measured)
 * @param {number} input.restingHeartRate resting heart rate in bpm (0 = unknown)
 * @param {string} input.talkTest         one of TALK_TEST_OPTIONS values
 * @param {number} input.rpe              Borg 6-20 rating (0 = not given)
 */
export function assessBriskWalk({
  age,
  cadence = 0,
  heartRate = 0,
  restingHeartRate = 0,
  talkTest = "skip",
  rpe = 0,
} = {}) {
  if (![age, cadence, heartRate, restingHeartRate, rpe].every(isNum)) {
    return { error: "Enter a number in every numeric field." };
  }
  if (age < MIN_AGE || age > MAX_AGE) {
    return { error: `Age should be between ${MIN_AGE} and ${MAX_AGE} years.` };
  }
  if (cadence < 0 || heartRate < 0 || restingHeartRate < 0 || rpe < 0) {
    return { error: "Values cannot be negative." };
  }
  if (cadence > MAX_CADENCE) {
    return { error: `A sustained cadence above ${MAX_CADENCE} steps per minute is running, not walking.` };
  }
  if (heartRate > MAX_HEART_RATE || restingHeartRate > MAX_HEART_RATE) {
    return { error: `Heart rate should be below ${MAX_HEART_RATE} bpm — check the reading.` };
  }
  if (rpe > 0 && (rpe < RPE_MIN || rpe > RPE_MAX)) {
    return { error: `The Borg scale runs from ${RPE_MIN} to ${RPE_MAX}.` };
  }

  const zones = heartRateZones({ age, restingHeartRate });

  const signals = [];
  if (cadence > 0) {
    const level =
      cadence >= CADENCE_VIGOROUS ? VIGOROUS : cadence >= CADENCE_MODERATE ? MODERATE : LIGHT;
    signals.push({
      key: "cadence",
      name: "Cadence",
      reading: `${Math.round(cadence)} steps/min`,
      level,
      target: `${CADENCE_MODERATE}+ for moderate, ${CADENCE_VIGOROUS}+ for vigorous`,
    });
  }
  if (heartRate > 0) {
    signals.push({
      key: "heartRate",
      name: "Heart rate",
      reading: `${Math.round(heartRate)} bpm`,
      level: levelFromZones(heartRate, zones),
      target: `${Math.round(zones.moderate[0])}-${Math.round(zones.moderate[1])} moderate, ${Math.round(zones.vigorous[0])}-${Math.round(zones.vigorous[1])} vigorous`,
    });
  }
  const talkOption = TALK_TEST_OPTIONS.find((option) => option.value === talkTest);
  if (talkOption && talkOption.level !== null) {
    signals.push({
      key: "talk",
      name: "Talk test",
      reading: talkOption.label,
      level: talkOption.level,
      target: "Talking but not singing = moderate",
    });
  }
  if (rpe > 0) {
    const level = rpe >= RPE_VIGOROUS ? VIGOROUS : rpe >= RPE_MODERATE ? MODERATE : LIGHT;
    signals.push({
      key: "rpe",
      name: "Perceived exertion",
      reading: `Borg ${Math.round(rpe)}`,
      level,
      target: `${RPE_MODERATE}-14 moderate, ${RPE_VIGOROUS}-17 vigorous`,
    });
  }

  if (signals.length === 0) {
    return { error: "Give at least one reading: cadence, heart rate, the talk test or an RPE score." };
  }

  const overall = median(signals.map((signal) => signal.level));
  const isBrisk = overall >= MODERATE;

  const cadenceGap =
    cadence > 0 && cadence < CADENCE_MODERATE ? CADENCE_MODERATE - cadence : 0;
  const heartRateGap =
    heartRate > 0 && heartRate < zones.moderate[0] ? zones.moderate[0] - heartRate : 0;

  const advice = isBrisk
    ? overall === VIGOROUS
      ? "This is vigorous intensity: each minute counts as two moderate minutes toward the weekly 150-minute target."
      : "This counts as brisk, moderate-intensity walking — the intensity the 150-minutes-a-week guideline is written around."
    : "Not yet brisk. Lengthen your arm swing, shorten your stride slightly and pick the feet up faster rather than reaching further.";

  return {
    signals,
    signalCount: signals.length,
    overall,
    overallLabel: LEVEL_NAMES[overall],
    isBrisk,
    advice,
    zones,
    hrMax: zones.hrMax,
    zoneMethod: zones.method,
    cadenceGap,
    heartRateGap,
  };
}
