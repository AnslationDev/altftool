/**
 * LED wattage replacement.
 *
 * Bulbs are equivalent when their LIGHT OUTPUT matches, not their wattage, so the
 * conversion runs in two steps:
 *   1. old wattage -> lumens   (anchor table for incandescent, efficacy for halogen and CFL)
 *   2. lumens -> LED wattage   (lumens / LED efficacy in lm/W)
 */

/**
 * Incandescent watt-to-lumen anchors. These are the equivalence values published in the
 * US FTC Lighting Facts / ENERGY STAR replacement guidance, which the whole industry
 * prints on packaging. Efficacy is NOT constant across the range - a 100 W filament is
 * meaningfully more efficient than a 40 W one - so the table is interpolated, not scaled.
 */
export const INCANDESCENT_ANCHORS = [
  [25, 250],
  [40, 450],
  [60, 800],
  [75, 1100],
  [100, 1600],
  [150, 2600],
  [200, 3300],
];

/** Mains-voltage halogen, roughly 30% more efficient than a plain filament lamp. */
export const HALOGEN_EFFICACY = 16.5;

/** Compact fluorescent, the 13-15 W lamps that were sold as "60 W equivalent" (800 lm). */
export const CFL_EFFICACY = 60;

/** Linear fluorescent tube (T8 with electronic ballast). */
export const FLUORESCENT_TUBE_EFFICACY = 75;

export const SOURCE_TYPES = [
  { id: "incandescent", label: "Incandescent (filament bulb)", mode: "table" },
  { id: "halogen", label: "Halogen", mode: "efficacy", efficacy: HALOGEN_EFFICACY },
  { id: "cfl", label: "CFL (compact fluorescent)", mode: "efficacy", efficacy: CFL_EFFICACY },
  {
    id: "tube",
    label: "Fluorescent tube (T8)",
    mode: "efficacy",
    efficacy: FLUORESCENT_TUBE_EFFICACY,
  },
];

/** LED efficacy bands seen on retail packaging today, in lumens per watt. */
export const LED_EFFICACY_PRESETS = [
  { id: "budget", label: "Budget LED (80 lm/W)", value: 80 },
  { id: "standard", label: "Standard retail LED (100 lm/W)", value: 100 },
  { id: "efficient", label: "High-efficiency LED (130 lm/W)", value: 130 },
  { id: "premium", label: "Top-tier LED (160 lm/W)", value: 160 },
];

export const DEFAULT_LED_EFFICACY = 100;

/** Common filament wattages people are replacing, used to build the reference chart. */
export const CHART_WATTAGES = [25, 40, 60, 75, 100, 150, 200];

export const DAYS_PER_YEAR = 365.25;

const MAX_WATTS = 1000;
const MAX_HOURS = 24;
const MAX_TARIFF = 100;

/**
 * Lumens produced by an incandescent lamp of the given wattage.
 * Inside the anchor range this interpolates linearly between neighbouring anchors;
 * outside it, it extends the slope of the nearest end segment.
 * @param {number} watts
 * @returns {number} lumens
 */
export function incandescentLumens(watts) {
  if (!Number.isFinite(watts) || watts <= 0) return 0;
  const points = INCANDESCENT_ANCHORS;

  if (watts <= points[0][0]) {
    // Extend the first segment's slope down towards the origin.
    const [w1, l1] = points[0];
    const [w2, l2] = points[1];
    const slope = (l2 - l1) / (w2 - w1);
    return Math.max(0, l1 - (w1 - watts) * slope);
  }
  const last = points.length - 1;
  if (watts >= points[last][0]) {
    const [w1, l1] = points[last - 1];
    const [w2, l2] = points[last];
    const slope = (l2 - l1) / (w2 - w1);
    return l2 + (watts - w2) * slope;
  }
  for (let i = 0; i < last; i += 1) {
    const [w1, l1] = points[i];
    const [w2, l2] = points[i + 1];
    if (watts >= w1 && watts <= w2) {
      return l1 + ((watts - w1) / (w2 - w1)) * (l2 - l1);
    }
  }
  return 0;
}

/**
 * Lumens from any supported old source.
 * @returns {number} lumens, or 0 for invalid input
 */
export function sourceLumens(sourceId, watts) {
  const source = SOURCE_TYPES.find((entry) => entry.id === sourceId);
  if (!source || !Number.isFinite(watts) || watts <= 0) return 0;
  if (source.mode === "table") return incandescentLumens(watts);
  return watts * source.efficacy;
}

/**
 * @param {object} input
 * @param {string} input.sourceId     Key from SOURCE_TYPES.
 * @param {number} input.oldWatts     Wattage of the lamp being replaced.
 * @param {number} input.ledEfficacy  Lumens per watt of the LED you will buy.
 * @param {number} input.bulbCount    How many lamps you are swapping.
 * @param {number} input.hoursPerDay  Hours lit per day.
 * @param {number} input.tariff       Cost per kWh.
 * @returns {object} result or { error }
 */
export function convertToLed({
  sourceId,
  oldWatts,
  ledEfficacy = DEFAULT_LED_EFFICACY,
  bulbCount = 1,
  hoursPerDay = 5,
  tariff = 0,
}) {
  const source = SOURCE_TYPES.find((entry) => entry.id === sourceId);
  if (!source) return { error: "Choose the type of bulb you are replacing." };

  const values = [oldWatts, ledEfficacy, bulbCount, hoursPerDay, tariff];
  if (values.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: "Enter a valid number in every field." };
  }
  if (!(oldWatts > 0)) return { error: "Old bulb wattage must be greater than 0 W." };
  if (oldWatts > MAX_WATTS) return { error: `Wattage above ${MAX_WATTS} W is not a household lamp.` };
  if (!(ledEfficacy >= 40) || ledEfficacy > 250) {
    return { error: "LED efficacy should be between 40 and 250 lumens per watt." };
  }
  if (!(bulbCount >= 1) || !Number.isInteger(bulbCount) || bulbCount > 500) {
    return { error: "Number of bulbs must be a whole number from 1 to 500." };
  }
  if (!(hoursPerDay >= 0) || hoursPerDay > MAX_HOURS) {
    return { error: `Hours per day must be between 0 and ${MAX_HOURS}.` };
  }
  if (!(tariff >= 0) || tariff > MAX_TARIFF) {
    return { error: `Tariff must be between 0 and ${MAX_TARIFF} per kWh.` };
  }

  const lumens = sourceLumens(sourceId, oldWatts);
  if (!(lumens > 0)) return { error: "Could not work out the light output for that lamp." };

  const ledWatts = lumens / ledEfficacy;
  const oldEfficacy = lumens / oldWatts;
  const wattsSavedEach = oldWatts - ledWatts;
  const savingPct = (wattsSavedEach / oldWatts) * 100;

  const yearlyOldKwh = (oldWatts * bulbCount * hoursPerDay * DAYS_PER_YEAR) / 1000;
  const yearlyLedKwh = (ledWatts * bulbCount * hoursPerDay * DAYS_PER_YEAR) / 1000;
  const yearlyKwhSaved = yearlyOldKwh - yearlyLedKwh;

  return {
    lumens,
    ledWatts,
    oldEfficacy,
    ledEfficacy,
    wattsSavedEach,
    wattsSavedTotal: wattsSavedEach * bulbCount,
    savingPct,
    yearlyOldKwh,
    yearlyLedKwh,
    yearlyKwhSaved,
    yearlyCostOld: yearlyOldKwh * tariff,
    yearlyCostLed: yearlyLedKwh * tariff,
    yearlyCostSaved: yearlyKwhSaved * tariff,
    sourceLabel: source.label,
  };
}

/**
 * The classic replacement chart: filament wattage, its light output, and the LED
 * wattage that matches it at the chosen efficacy.
 * @param {number} ledEfficacy
 * @returns {Array<{oldWatts:number, lumens:number, ledWatts:number, savingPct:number}>}
 */
export function buildChart(ledEfficacy = DEFAULT_LED_EFFICACY) {
  const efficacy = Number.isFinite(ledEfficacy) && ledEfficacy > 0 ? ledEfficacy : DEFAULT_LED_EFFICACY;
  return CHART_WATTAGES.map((oldWatts) => {
    const lumens = incandescentLumens(oldWatts);
    const ledWatts = lumens / efficacy;
    return {
      oldWatts,
      lumens,
      ledWatts,
      savingPct: ((oldWatts - ledWatts) / oldWatts) * 100,
    };
  });
}
