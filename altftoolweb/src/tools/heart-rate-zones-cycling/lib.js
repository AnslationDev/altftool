/**
 * Cycling-specific heart rate zones, with power pairing.
 *
 * Heart rate zones follow Joe Friel's bike zones, which are percentages of
 * lactate threshold heart rate (LTHR) measured on the bike — not of maximum
 * heart rate. Bike LTHR normally sits a few beats below run LTHR.
 *
 * Power zones follow the Coggan/Allen system, expressed as percentages of
 * functional threshold power (FTP), so each heart rate band can be paired with
 * the watts you should see next to it.
 */

/** Age-predicted maximum heart rate formulas. */
export const MAX_HR_FORMULAS = [
  {
    id: "tanaka",
    label: "Tanaka",
    expression: "208 − 0.7 × age",
    // Tanaka, Monahan & Seals (2001), meta-analysis of 351 studies.
    compute: (age) => 208 - 0.7 * age,
  },
  {
    id: "fox",
    label: "Fox",
    expression: "220 − age",
    // Fox, Naughton & Haskell (1971).
    compute: (age) => 220 - age,
  },
  {
    id: "gulati",
    label: "Gulati (women)",
    expression: "206 − 0.88 × age",
    // Gulati et al. (2010), derived from 5,437 women.
    compute: (age) => 206 - 0.88 * age,
  },
];

/**
 * Cycling maximum heart rate typically measures 5–10 bpm below running maximum
 * for the same athlete, because less muscle mass is active and you are seated.
 * The default sits in the middle of that published range.
 */
export const DEFAULT_CYCLING_HR_OFFSET = 8;
export const CYCLING_HR_OFFSET_MAX = 15;

/**
 * When bike LTHR has not been tested, it is commonly approximated at about 85%
 * of maximum heart rate. A 20-minute or 30-minute time trial is far better.
 */
export const LTHR_FRACTION_OF_MAX = 0.85;

/** Friel bike heart rate zones as a fraction of bike LTHR. */
export const FRIEL_BIKE_ZONES = [
  {
    id: "1",
    name: "Zone 1",
    title: "Recovery",
    low: 0.65,
    high: 0.81,
    openLow: true,
    purpose: "Spinning to move blood, nothing more. Between intervals and the day after a hard ride.",
    power: "Coggan Zone 1 — active recovery",
  },
  {
    id: "2",
    name: "Zone 2",
    title: "Aerobic endurance",
    low: 0.81,
    high: 0.89,
    purpose: "The bulk of base miles. Long steady rides that build aerobic machinery.",
    power: "Coggan Zone 2 — endurance",
  },
  {
    id: "3",
    name: "Zone 3",
    title: "Tempo",
    low: 0.9,
    high: 0.93,
    purpose: "Sustained pressure on the pedals. Sweet-spot and long climbs live around here.",
    power: "Coggan Zone 3 — tempo",
  },
  {
    id: "4",
    name: "Zone 4",
    title: "Sub-threshold",
    low: 0.94,
    high: 0.99,
    purpose: "Just under threshold. 2 × 20 minute efforts to lift your sustainable power.",
    power: "Coggan Zone 4 — lactate threshold",
  },
  {
    id: "5a",
    name: "Zone 5a",
    title: "Super-threshold",
    low: 1.0,
    high: 1.02,
    purpose: "At and marginally over threshold. Short, controlled over-unders.",
    power: "Top of Coggan Zone 4 into Zone 5",
  },
  {
    id: "5b",
    name: "Zone 5b",
    title: "Aerobic capacity",
    low: 1.03,
    high: 1.06,
    purpose: "VO2 max work — 3 to 5 minute intervals with long recoveries.",
    power: "Coggan Zone 5 — VO2 max",
  },
  {
    id: "5c",
    name: "Zone 5c",
    title: "Anaerobic capacity",
    low: 1.07,
    high: 1.1,
    openHigh: true,
    purpose: "30 second to 2 minute efforts. Heart rate lags here, so trust power or feel.",
    power: "Coggan Zone 6 — anaerobic capacity",
  },
];

/** Coggan power zones as a fraction of FTP. */
export const COGGAN_POWER_ZONES = [
  { id: 1, name: "Zone 1", title: "Active recovery", low: 0, high: 0.55 },
  { id: 2, name: "Zone 2", title: "Endurance", low: 0.56, high: 0.75 },
  { id: 3, name: "Zone 3", title: "Tempo", low: 0.76, high: 0.9 },
  { id: 4, name: "Zone 4", title: "Lactate threshold", low: 0.91, high: 1.05 },
  { id: 5, name: "Zone 5", title: "VO2 max", low: 1.06, high: 1.2 },
  { id: 6, name: "Zone 6", title: "Anaerobic capacity", low: 1.21, high: 1.5 },
  { id: 7, name: "Zone 7", title: "Neuromuscular power", low: 1.51, high: 2.0, openHigh: true },
];

export const AGE_MIN = 10;
export const AGE_MAX = 100;
export const MAX_HR_MIN = 100;
export const MAX_HR_MAX = 230;
export const LTHR_MIN = 90;
export const LTHR_MAX = 210;
export const FTP_MIN = 40;
export const FTP_MAX = 600;

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Age-predicted maximum heart rate. */
export function estimateMaxHr(age, formulaId = "tanaka") {
  const formula = MAX_HR_FORMULAS.find((entry) => entry.id === formulaId);
  if (!formula || !isNumber(age) || age < AGE_MIN || age > AGE_MAX) return NaN;
  return formula.compute(age);
}

/**
 * @param {object} input
 * @param {number} [input.age]
 * @param {string} [input.formulaId]
 * @param {number} [input.maxHrOverride] measured running/general maximum heart rate
 * @param {number} [input.cyclingOffset] beats to subtract for cycling
 * @param {number} [input.lthr] measured bike lactate threshold heart rate
 * @param {number} [input.ftp] functional threshold power in watts
 * @returns {object} result or { error }
 */
export function computeCyclingZones({
  age,
  formulaId = "tanaka",
  maxHrOverride,
  cyclingOffset = DEFAULT_CYCLING_HR_OFFSET,
  lthr,
  ftp,
} = {}) {
  const offset = isNumber(cyclingOffset) ? cyclingOffset : DEFAULT_CYCLING_HR_OFFSET;
  if (offset < 0 || offset > CYCLING_HR_OFFSET_MAX) {
    return {
      error: `The cycling offset should be between 0 and ${CYCLING_HR_OFFSET_MAX} bpm — published values are 5 to 10 beats below running maximum.`,
    };
  }

  const measuredLthr = isNumber(lthr) && lthr > 0;
  if (measuredLthr && (lthr < LTHR_MIN || lthr > LTHR_MAX)) {
    return { error: `Bike threshold heart rate should be between ${LTHR_MIN} and ${LTHR_MAX} bpm.` };
  }

  const useOverride = isNumber(maxHrOverride) && maxHrOverride > 0;
  if (useOverride && (maxHrOverride < MAX_HR_MIN || maxHrOverride > MAX_HR_MAX)) {
    return {
      error: `A measured maximum heart rate should be between ${MAX_HR_MIN} and ${MAX_HR_MAX} bpm.`,
    };
  }

  let maxHr = NaN;
  let bikeMaxHr = NaN;
  if (useOverride) {
    maxHr = maxHrOverride;
    bikeMaxHr = maxHr - offset;
  } else if (isNumber(age) && age >= AGE_MIN && age <= AGE_MAX) {
    maxHr = estimateMaxHr(age, formulaId);
    bikeMaxHr = maxHr - offset;
  } else if (!measuredLthr) {
    return {
      error: `Enter an age between ${AGE_MIN} and ${AGE_MAX}, a measured maximum heart rate, or your bike threshold heart rate.`,
    };
  }

  const thresholdHr = measuredLthr ? lthr : bikeMaxHr * LTHR_FRACTION_OF_MAX;
  if (!isNumber(thresholdHr) || thresholdHr <= 0) {
    return { error: "Could not work out a bike threshold heart rate from that input." };
  }

  const hasFtp = isNumber(ftp) && ftp > 0;
  if (hasFtp && (ftp < FTP_MIN || ftp > FTP_MAX)) {
    return { error: `FTP should be between ${FTP_MIN} and ${FTP_MAX} watts.` };
  }

  const zones = FRIEL_BIKE_ZONES.map((zone) => ({
    ...zone,
    lowBpm: Math.round(thresholdHr * zone.low),
    highBpm: Math.round(thresholdHr * zone.high),
  }));

  const powerZones = COGGAN_POWER_ZONES.map((zone) => ({
    ...zone,
    lowWatts: hasFtp ? Math.round(ftp * zone.low) : NaN,
    highWatts: hasFtp ? Math.round(ftp * zone.high) : NaN,
  }));

  const formula = MAX_HR_FORMULAS.find((entry) => entry.id === formulaId);

  return {
    thresholdHr,
    thresholdHrRounded: Math.round(thresholdHr),
    measuredLthr,
    maxHr: isNumber(maxHr) ? maxHr : NaN,
    maxHrRounded: isNumber(maxHr) ? Math.round(maxHr) : NaN,
    bikeMaxHr: isNumber(bikeMaxHr) ? bikeMaxHr : NaN,
    bikeMaxHrRounded: isNumber(bikeMaxHr) ? Math.round(bikeMaxHr) : NaN,
    cyclingOffset: offset,
    formulaLabel: useOverride ? "Measured in a test" : formula ? formula.label : "",
    formulaExpression: useOverride ? "" : formula ? formula.expression : "",
    hasFtp,
    ftp: hasFtp ? ftp : NaN,
    zones,
    powerZones,
  };
}
