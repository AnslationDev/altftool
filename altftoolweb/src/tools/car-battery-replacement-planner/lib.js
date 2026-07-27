/**
 * Starter-battery service-life planning.
 *
 * Base service life figures are the typical in-service life quoted by battery
 * makers for each lead-acid construction, and line up with the warranty
 * structure sold with them (a 36-month flooded battery is normally sold as
 * 24 months free replacement plus 12-24 months pro-rata).
 *
 * The usage multipliers reflect the two things that actually kill starter
 * batteries: heat, which accelerates grid corrosion and water loss, and chronic
 * undercharging, which sulphates the plates. Heat is the dominant term — the
 * widely used rule of thumb is that lead-acid life roughly halves for every
 * 10-15 °C of sustained temperature rise above 25 °C.
 */

/** Typical in-service life, in months, by battery construction. */
export const BATTERY_TYPES = [
  {
    id: "flooded",
    label: "Conventional flooded (topping-up type)",
    months: 36,
    note: "Removable caps, needs distilled water; the cheapest fitment.",
  },
  {
    id: "mf",
    label: "Maintenance-free sealed (MF / SMF calcium)",
    months: 48,
    note: "The standard fitment on most modern petrol and diesel cars.",
  },
  {
    id: "efb",
    label: "EFB (enhanced flooded, entry start-stop)",
    months: 54,
    note: "Fitted to basic start-stop cars; tolerates partial-state-of-charge cycling.",
  },
  {
    id: "agm",
    label: "AGM (absorbent glass mat, start-stop)",
    months: 60,
    note: "Fitted to start-stop cars with regenerative braking; costliest to replace.",
  },
];

/** Multipliers on base life. Below 1 shortens life, above 1 extends it. */
export const USAGE_FACTORS = [
  {
    id: "hotClimate",
    label: "Hot climate — under-bonnet heat most of the year",
    factor: 0.75,
    why: "Heat drives grid corrosion and water loss; it is the single biggest life killer.",
  },
  {
    id: "shortTrips",
    label: "Mostly short trips under 15 minutes",
    factor: 0.8,
    why: "The alternator never fully replaces the charge the starter took out.",
  },
  {
    id: "longIdle",
    label: "Car often parked two weeks or more",
    factor: 0.85,
    why: "Standing at a partial state of charge sulphates the plates.",
  },
  {
    id: "accessories",
    label: "Heavy accessory load (aftermarket audio, lights, dashcam)",
    factor: 0.9,
    why: "Extra parasitic and running draw deepens every discharge cycle.",
  },
  {
    id: "wrongForStartStop",
    label: "Start-stop car running a plain (non-EFB/AGM) battery",
    factor: 0.6,
    why: "A conventional battery is not built for the cycling a start-stop system demands.",
  },
  {
    id: "garaged",
    label: "Garaged, mild climate, driven daily",
    factor: 1.1,
    why: "Cool storage plus a full recharge every day is the easiest life a battery gets.",
  },
];

/**
 * Symptom points. A swollen case is marked critical: a bulging battery is
 * gassing internally and should be replaced immediately regardless of age.
 */
export const WARNING_SIGNS = [
  { id: "jumpStart", label: "Needed a jump start in the last 6 months", points: 4 },
  { id: "slowCrank", label: "Slow, laboured cranking (worst first thing in the morning)", points: 3 },
  { id: "warningLight", label: "Battery or charging warning light appears", points: 3 },
  { id: "dimLights", label: "Headlights dim noticeably at idle", points: 2 },
  { id: "memoryReset", label: "Clock, radio presets or ECU settings reset themselves", points: 2 },
  { id: "topUp", label: "Needs distilled water topping up often", points: 2 },
  { id: "corrosion", label: "White or blue crust on the terminals", points: 1 },
  { id: "swollen", label: "Case looks swollen, bulged or is leaking", points: 5, critical: true },
];

export const MIN_LIFE_FACTOR = 0.5;
export const MAX_LIFE_FACTOR = 1.15;

/** Symptom score at or above this means replace without waiting for the calendar. */
export const REPLACE_NOW_SCORE = 8;
/** Symptom score at or above this means get a load test done now. */
export const LOAD_TEST_SCORE = 4;
/** Longest plausible service history the tool will accept, in months. */
export const MAX_AGE_MONTHS = 360;

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function getBatteryType(id) {
  return BATTERY_TYPES.find((type) => type.id === id) || null;
}

export const VERDICTS = {
  "replace-now": "Replace now",
  "test-now": "Load-test it this week",
  "plan-soon": "Budget for a replacement",
  healthy: "Healthy for now",
};

/**
 * @param {object} input
 * @param {string} input.batteryType one of BATTERY_TYPES[].id
 * @param {number} input.ageMonths   months since the battery was fitted
 * @param {string[]} [input.factors] selected USAGE_FACTORS[].id values
 * @param {string[]} [input.signs]   selected WARNING_SIGNS[].id values
 */
export function planBatteryReplacement({ batteryType, ageMonths, factors = [], signs = [] }) {
  const battery = getBatteryType(batteryType);
  if (!battery) return { error: "Choose the battery type fitted to your car." };

  if (!isNum(ageMonths)) return { error: "Enter the battery age in months as a number." };
  if (ageMonths < 0) return { error: "Battery age cannot be negative." };
  if (ageMonths > MAX_AGE_MONTHS) {
    return { error: `Battery age above ${MAX_AGE_MONTHS} months is not plausible — check the figure.` };
  }

  const list = Array.isArray(factors) ? factors : [];
  const signList = Array.isArray(signs) ? signs : [];

  const appliedFactors = USAGE_FACTORS.filter((factor) => list.includes(factor.id));
  const rawFactor = appliedFactors.reduce((acc, factor) => acc * factor.factor, 1);
  const factor = clamp(rawFactor, MIN_LIFE_FACTOR, MAX_LIFE_FACTOR);
  const factorClamped = rawFactor < MIN_LIFE_FACTOR || rawFactor > MAX_LIFE_FACTOR;

  const expectedMonths = Math.max(6, Math.round(battery.months * factor));
  const monthsRemaining = expectedMonths - ageMonths;
  const percentLifeUsed = (ageMonths / expectedMonths) * 100;

  const appliedSigns = WARNING_SIGNS.filter((sign) => signList.includes(sign.id));
  const riskScore = appliedSigns.reduce((acc, sign) => acc + sign.points, 0);
  const hasCriticalSign = appliedSigns.some((sign) => sign.critical);

  // Each symptom point knocks 5 percentage points off the remaining-life estimate.
  const POINTS_TO_PERCENT = 5;
  const healthPercent = hasCriticalSign
    ? 0
    : clamp(Math.round(100 - percentLifeUsed - riskScore * POINTS_TO_PERCENT), 0, 100);

  let verdict = "healthy";
  if (
    hasCriticalSign ||
    riskScore >= REPLACE_NOW_SCORE ||
    monthsRemaining <= 0 ||
    healthPercent <= 5
  ) {
    verdict = "replace-now";
  } else if (riskScore >= LOAD_TEST_SCORE || monthsRemaining <= 3 || healthPercent <= 25) {
    verdict = "test-now";
  } else if (monthsRemaining <= 6 || percentLifeUsed >= 80 || healthPercent <= 50) {
    verdict = "plan-soon";
  }

  const advice = [];
  if (hasCriticalSign) {
    advice.push("A swollen or leaking case means the battery is gassing — stop using it and replace it.");
  }
  if (verdict === "replace-now" && !hasCriticalSign) {
    advice.push("Fit a new battery before the next cold morning or long trip.");
  }
  if (verdict === "test-now") {
    advice.push("Ask for a free load test or conductance test — most battery dealers do it in five minutes.");
  }
  if (list.includes("shortTrips")) {
    advice.push("Give the car one 30-minute continuous run a week, or use a smart charger monthly.");
  }
  if (list.includes("longIdle")) {
    advice.push("For long parking, disconnect the negative terminal or leave a maintenance charger on.");
  }
  if (list.includes("wrongForStartStop")) {
    advice.push("Replace with the EFB or AGM type the car was designed for — a plain battery will keep failing early.");
  }
  if (signList.includes("corrosion")) {
    advice.push("Clean the terminals with a baking-soda paste, dry, and smear petroleum jelly on the posts.");
  }
  if (advice.length === 0) {
    advice.push("Keep the terminals clean and tight, and re-check the estimate every six months.");
  }

  return {
    batteryLabel: battery.label,
    baseMonths: battery.months,
    factor: Math.round(factor * 1000) / 1000,
    factorClamped,
    expectedMonths,
    ageMonths,
    monthsRemaining: Math.round(monthsRemaining * 10) / 10,
    percentLifeUsed: Math.round(percentLifeUsed * 10) / 10,
    riskScore,
    hasCriticalSign,
    healthPercent,
    verdict,
    verdictLabel: VERDICTS[verdict],
    appliedFactors: appliedFactors.map((f) => ({ label: f.label, factor: f.factor, why: f.why })),
    appliedSigns: appliedSigns.map((s) => ({ label: s.label, points: s.points })),
    advice,
  };
}
