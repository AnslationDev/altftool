/**
 * Wildfire smoke respirator selection.
 *
 * Rule and data sources:
 *  - OSHA Assigned Protection Factors, 29 CFR 1910.134 Table 1: filtering
 *    facepiece and elastomeric half-mask respirators APF 10, full-facepiece
 *    air-purifying respirators APF 50, loose-fitting powered air-purifying
 *    respirators APF 25. An APF of 10 means the wearer's exposure is reduced
 *    to one tenth of the ambient concentration.
 *  - CDC and US EPA wildfire smoke guidance: cloth face coverings and surgical
 *    masks do not protect against the fine particles in wildfire smoke, and
 *    respirators with exhalation valves are not recommended where the valve
 *    would defeat source control.
 *  - WHO 2021 global air quality guidelines, 24-hour mean PM2.5: guideline
 *    15 ug/m3, Interim Target 1 75 ug/m3. US EPA 24-hour PM2.5 NAAQS 35 ug/m3.
 *  - US EPA AQI breakpoints for 24-hour PM2.5 as revised in 2024, used to let
 *    people type in the AQI their app shows.
 *  - US EPA Exposure Factors Handbook short-term adult inhalation rates.
 *  - Indoor infiltration factors for PM2.5 in the ranges reported for homes
 *    with windows open, windows closed, and with a portable HEPA air cleaner.
 */

export const MASKS = [
  {
    id: "none",
    label: "No mask",
    apf: 1,
    respirator: false,
    note: "Full ambient exposure.",
  },
  {
    id: "cloth",
    label: "Cloth face covering",
    apf: 1,
    respirator: false,
    note: "CDC and EPA both state that cloth masks do not protect against wildfire smoke — the weave is far too open for particles under 2.5 micrometres and it leaks around the edges.",
  },
  {
    id: "surgical",
    label: "Surgical or procedure mask",
    apf: 1,
    respirator: false,
    note: "Designed to stop droplets leaving the wearer, not to seal to the face. It has no assigned protection factor for particulates and should not be counted on in smoke.",
  },
  {
    id: "n95",
    label: "NIOSH N95, fit-checked, no valve",
    apf: 10,
    respirator: true,
    note: "The standard recommendation for wildfire smoke. Choose a headband model without an exhalation valve, and check the seal by cupping your hands over it and exhaling.",
  },
  {
    id: "kn95",
    label: "KN95 or FFP2, no fit test",
    apf: 10,
    respirator: true,
    note: "The filter media meets the 94-95% class, so it earns the filtering-facepiece APF of 10 — but only with a good seal. Counterfeits are common and earloop designs seal poorly, so do a seal check every time.",
  },
  {
    id: "p100-half",
    label: "Elastomeric half-mask with P100 filters",
    apf: 10,
    respirator: true,
    note: "Same assigned protection factor as an N95 but reusable, with a far more reliable seal and filters rated to 99.97%.",
  },
  {
    id: "papr-hood",
    label: "Loose-fitting PAPR with hood",
    apf: 25,
    respirator: true,
    note: "Blown filtered air means no breathing resistance, which matters for people with lung disease, and no fit test is needed for the loose-fitting type.",
  },
  {
    id: "p100-full",
    label: "Full-facepiece respirator with P100 filters",
    apf: 50,
    respirator: true,
    note: "The highest protection in this list and it also shields the eyes, which smoke irritates. Overkill for a short errand.",
  },
];

/** WHO and EPA 24-hour PM2.5 reference levels, ug/m3. */
export const EXPOSURE_TARGETS = [
  { id: "who-aqg", label: "WHO 24-hour guideline", value: 15 },
  { id: "us-naaqs", label: "US EPA 24-hour standard", value: 35 },
  { id: "who-it1", label: "WHO Interim Target 1", value: 75 },
];

/** Indoor-to-outdoor PM2.5 ratio for the hours you are not outside. */
export const INDOOR_SETTINGS = [
  { id: "open", label: "Windows open, no filtration", factor: 0.8 },
  { id: "closed", label: "Windows and doors closed", factor: 0.5 },
  { id: "hepa", label: "Closed up, plus a portable HEPA cleaner", factor: 0.2 },
  { id: "clean-room", label: "One sealed clean room with HEPA", factor: 0.1 },
];

/** Short-term adult inhalation rates, m3 per minute (EPA Exposure Factors Handbook). */
export const EXERTION_LEVELS = [
  { id: "rest", label: "Standing or sitting outside", m3PerMin: 0.0042 },
  { id: "light", label: "Walking or light chores", m3PerMin: 0.012 },
  { id: "moderate", label: "Yard work, cycling, steady jog", m3PerMin: 0.024 },
  { id: "heavy", label: "Heavy labour or hard training", m3PerMin: 0.049 },
];

/** US EPA 24-hour PM2.5 AQI breakpoints, 2024 revision. */
export const US_AQI_BREAKPOINTS = [
  { aqiLow: 0, aqiHigh: 50, cLow: 0, cHigh: 9, label: "Good" },
  { aqiLow: 51, aqiHigh: 100, cLow: 9.1, cHigh: 35.4, label: "Moderate" },
  { aqiLow: 101, aqiHigh: 150, cLow: 35.5, cHigh: 55.4, label: "Unhealthy for Sensitive Groups" },
  { aqiLow: 151, aqiHigh: 200, cLow: 55.5, cHigh: 125.4, label: "Unhealthy" },
  { aqiLow: 201, aqiHigh: 300, cLow: 125.5, cHigh: 225.4, label: "Very Unhealthy" },
  { aqiLow: 301, aqiHigh: 500, cLow: 225.5, cHigh: 325.4, label: "Hazardous" },
];

export const MINUTES_PER_DAY = 1440;

const round = (value, dp = 1) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

/** Convert a US EPA AQI value into a PM2.5 concentration in ug/m3. */
export function aqiToPm25(aqi) {
  const value = Number(aqi);
  if (!Number.isFinite(value) || value < 0 || value > 500) return null;
  const band =
    US_AQI_BREAKPOINTS.find((item) => value >= item.aqiLow && value <= item.aqiHigh) ||
    US_AQI_BREAKPOINTS[US_AQI_BREAKPOINTS.length - 1];
  const span = band.aqiHigh - band.aqiLow;
  if (span <= 0) return band.cLow;
  return band.cLow + ((value - band.aqiLow) / span) * (band.cHigh - band.cLow);
}

/** Lowest-protection mask on the list that brings ambient PM2.5 under the target. */
export function recommendMask(pm25, targetValue) {
  const ambient = Number(pm25);
  const target = Number(targetValue);
  if (!Number.isFinite(ambient) || !Number.isFinite(target) || target <= 0) return null;
  const ordered = [...MASKS].sort((a, b) => a.apf - b.apf);
  return ordered.find((mask) => ambient / mask.apf <= target) || null;
}

/**
 * Full assessment for one planned trip outdoors in smoke.
 *
 * @param {object} input
 * @param {number} input.pm25       ambient PM2.5 in ug/m3
 * @param {string} input.maskId
 * @param {number} input.minutes    planned minutes outdoors
 * @param {string} input.exertion   an EXERTION_LEVELS id
 * @param {string} input.targetId   an EXPOSURE_TARGETS id
 * @param {string} input.indoorId   an INDOOR_SETTINGS id
 * @returns {object} result, or { error }
 */
export function assessSmokeExposure({
  pm25,
  maskId = "n95",
  minutes,
  exertion = "light",
  targetId = "us-naaqs",
  indoorId = "closed",
} = {}) {
  const ambient = Number(pm25);
  const mins = Number(minutes);

  if (!Number.isFinite(ambient)) return { error: "Enter the PM2.5 concentration as a number." };
  if (ambient < 0) return { error: "PM2.5 cannot be negative." };
  if (ambient > 2000) {
    return { error: "Enter a PM2.5 value under 2000 µg/m³ — above that you should not be outside at all." };
  }
  if (!Number.isFinite(mins)) return { error: "Enter the planned time outdoors in minutes." };
  if (mins <= 0) return { error: "Time outdoors must be more than zero minutes." };
  if (mins > MINUTES_PER_DAY) return { error: "Enter a time outdoors of 1440 minutes (24 hours) or less." };

  const mask = MASKS.find((item) => item.id === maskId) || MASKS[0];
  const exertionDef = EXERTION_LEVELS.find((item) => item.id === exertion) || EXERTION_LEVELS[1];
  const target = EXPOSURE_TARGETS.find((item) => item.id === targetId) || EXPOSURE_TARGETS[1];
  const indoor = INDOOR_SETTINGS.find((item) => item.id === indoorId) || INDOOR_SETTINGS[1];

  const effective = ambient / mask.apf;
  const indoorConcentration = ambient * indoor.factor;

  const inhaledUgMasked = effective * exertionDef.m3PerMin * mins;
  const inhaledUgUnmasked = ambient * exertionDef.m3PerMin * mins;
  const savedUg = inhaledUgUnmasked - inhaledUgMasked;
  const savedPct = inhaledUgUnmasked > 0 ? (savedUg / inhaledUgUnmasked) * 100 : 0;

  // 24-hour average if you spend `minutes` outdoors at `effective` and the rest
  // indoors at `indoorConcentration`.
  const dayAverage =
    (effective * mins + indoorConcentration * (MINUTES_PER_DAY - mins)) / MINUTES_PER_DAY;

  // Minutes outdoors before the 24-hour average passes the chosen target.
  let maxMinutes;
  let maxMinutesNote;
  if (indoorConcentration >= target.value) {
    maxMinutes = 0;
    maxMinutesNote = `Indoor air at ${round(indoorConcentration)} µg/m³ is already at or above the ${target.value} µg/m³ target, so no outdoor time keeps the daily average under it — improve the indoor air first.`;
  } else if (effective <= target.value) {
    maxMinutes = MINUTES_PER_DAY;
    maxMinutesNote = `With this mask your effective exposure of ${round(effective)} µg/m³ is already under the ${target.value} µg/m³ target, so time outdoors is not the limiting factor.`;
  } else {
    const raw =
      (MINUTES_PER_DAY * (target.value - indoorConcentration)) / (effective - indoorConcentration);
    maxMinutes = Math.max(0, Math.floor(raw));
    maxMinutesNote = `Beyond about ${maxMinutes} minutes outdoors your 24-hour average passes the ${target.value} µg/m³ target.`;
  }

  const recommended = recommendMask(ambient, target.value);

  const warnings = [];
  if (!mask.respirator && ambient > 35) {
    warnings.push(
      `${mask.label} gives no measurable protection from smoke particles — at ${round(ambient)} µg/m³ you are breathing the full ambient concentration.`,
    );
  }
  if (mask.respirator && exertionDef.id === "heavy") {
    warnings.push(
      "Breathing resistance through a respirator rises sharply with heavy exertion, and a sweaty face breaks the seal. Drop the intensity or move the session indoors.",
    );
  }
  if (recommended === null) {
    warnings.push(
      `No mask on this list brings ${round(ambient)} µg/m³ below the ${target.value} µg/m³ target. Stay indoors with filtration.`,
    );
  }
  if (ambient >= 250) {
    warnings.push(
      "At this concentration even short errands are worth postponing, especially for children, older adults and anyone with asthma, COPD or heart disease.",
    );
  }
  if (mins > 240 && mask.respirator) {
    warnings.push(
      "Disposable respirators lose their seal as they get damp and misshapen; swap for a fresh one after a few hours of use.",
    );
  }

  const maskTable = MASKS.map((item) => ({
    id: item.id,
    label: item.label,
    apf: item.apf,
    respirator: item.respirator,
    effective: round(ambient / item.apf),
  }));

  return {
    ambient: round(ambient),
    maskTable,
    maskLabel: mask.label,
    maskApf: mask.apf,
    maskIsRespirator: mask.respirator,
    maskNote: mask.note,
    effective: round(effective),
    reductionPct: round((1 - 1 / mask.apf) * 100),
    exertionLabel: exertionDef.label,
    minutes: Math.round(mins),
    inhaledUgMasked: round(inhaledUgMasked, 2),
    inhaledUgUnmasked: round(inhaledUgUnmasked, 2),
    savedUg: round(savedUg, 2),
    savedPct: round(savedPct),
    indoorLabel: indoor.label,
    indoorConcentration: round(indoorConcentration),
    dayAverage: round(dayAverage),
    targetLabel: target.label,
    targetValue: target.value,
    meetsTarget: dayAverage <= target.value,
    maxMinutes,
    maxMinutesNote,
    recommendedMaskLabel: recommended ? recommended.label : null,
    recommendedMaskApf: recommended ? recommended.apf : null,
    warnings,
  };
}
