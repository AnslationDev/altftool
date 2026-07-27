/**
 * Spark plug gap conversion and range checking.
 *
 * Gaps are quoted in millimetres in most of the world and in thousandths of an
 * inch ("thou") on American parts, so the conversion is the first job:
 * 1 inch = 25.4 mm exactly, and 1 thou = 0.0254 mm.
 *
 * The typical ranges below are the usual factory settings for each class of
 * engine, not a substitute for the figure on the underbonnet sticker or in the
 * manual. The pattern behind them is electrical: the voltage needed to strike
 * an arc rises with both the gap and the gas pressure in the cylinder, so
 * higher-pressure engines run smaller gaps to stay within what the coil can
 * deliver.
 */

export const MM_PER_INCH = 25.4;
export const MM_PER_THOU = 0.0254;

/** Sanity bounds — no production spark plug is gapped outside this. */
export const MIN_GAP_MM = 0.3;
export const MAX_GAP_MM = 2.5;

/**
 * Common tuner rule of thumb for forced induction: close the gap by about
 * 0.05 mm (0.002 in) for every 0.5 bar of boost, i.e. 0.1 mm per bar.
 */
export const BOOST_GAP_REDUCTION_MM_PER_BAR = 0.1;

/** Never close a gap below this — the spark becomes too weak to light a lean mix. */
export const ABSOLUTE_MIN_GAP_MM = 0.5;

export const APPLICATIONS = [
  {
    id: "modernNA",
    label: "Modern naturally aspirated petrol (coil-on-plug)",
    minMm: 0.9,
    maxMm: 1.1,
    note: "A strong individual coil per cylinder can drive a wide gap, which burns a lean mix better.",
  },
  {
    id: "olderDistributor",
    label: "Older petrol with distributor ignition",
    minMm: 0.7,
    maxMm: 0.9,
    note: "One coil feeding all cylinders through a rotor has less energy per spark.",
  },
  {
    id: "turbo",
    label: "Turbocharged or supercharged petrol",
    minMm: 0.6,
    maxMm: 0.8,
    note: "Higher cylinder pressure raises the voltage needed, so the gap is closed to compensate.",
  },
  {
    id: "cngLpg",
    label: "CNG or LPG converted petrol",
    minMm: 0.6,
    maxMm: 0.7,
    note: "Gaseous fuels need more ignition energy; a tighter gap keeps the spark reliable.",
  },
  {
    id: "motorcycle",
    label: "Four-stroke motorcycle / scooter",
    minMm: 0.6,
    maxMm: 0.7,
    note: "Small combustion chambers and compact magneto ignitions run tight gaps.",
  },
  {
    id: "smallEngine",
    label: "Small engine (generator, mower, pump)",
    minMm: 0.7,
    maxMm: 0.8,
    note: "Check the engine plate; many small engines specify exactly 0.75 mm (0.030 in).",
  },
];

/** Electrode materials, because they decide whether re-gapping is safe at all. */
export const ELECTRODE_TYPES = [
  {
    id: "copper",
    label: "Copper / nickel (standard)",
    regap: "Safe to gap with a feeler or wire gauge; the electrode is thick enough to bend.",
    life: "Typically 20,000 to 30,000 km.",
  },
  {
    id: "platinum",
    label: "Platinum",
    regap: "Adjust only slightly, and never lever against the platinum pad on the centre electrode.",
    life: "Typically 60,000 to 100,000 km.",
  },
  {
    id: "iridium",
    label: "Iridium (fine wire)",
    regap: "Come pre-gapped. Do not re-gap by more than about 0.05 mm — the fine tip snaps easily.",
    life: "Typically 100,000 km or more.",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round = (value, places) => {
  const p = 10 ** places;
  return Math.round(value * p) / p;
};

export function getApplication(id) {
  return APPLICATIONS.find((app) => app.id === id) || null;
}

export function getElectrodeType(id) {
  return ELECTRODE_TYPES.find((type) => type.id === id) || null;
}

/**
 * Convert a gap between millimetres, inches and thousandths of an inch.
 * @param {number} value
 * @param {string} unit "mm" | "in" | "thou"
 */
export function convertGap(value, unit = "mm") {
  if (!["mm", "in", "thou"].includes(unit)) return { error: "Choose mm, inch or thou." };
  if (!isNum(value)) return { error: "Enter the gap as a number." };
  if (value <= 0) return { error: "A spark plug gap must be greater than zero." };

  let mm;
  if (unit === "mm") mm = value;
  else if (unit === "in") mm = value * MM_PER_INCH;
  else mm = value * MM_PER_THOU;

  if (mm < MIN_GAP_MM || mm > MAX_GAP_MM) {
    return {
      error: `Spark plug gaps run from ${MIN_GAP_MM} mm to ${MAX_GAP_MM} mm — check the value and the unit.`,
    };
  }

  return {
    mm: round(mm, 3),
    inch: round(mm / MM_PER_INCH, 4),
    thou: round(mm / MM_PER_THOU, 1),
  };
}

/**
 * Recommend a gap range for an application, closed up for any boost pressure.
 * @param {object} input
 * @param {string} input.application APPLICATIONS[].id
 * @param {number} [input.boostBar]  peak boost pressure in bar gauge, 0 if none
 */
export function recommendGap({ application, boostBar = 0 }) {
  const app = getApplication(application);
  if (!app) return { error: "Choose the engine type you are gapping plugs for." };
  if (!isNum(boostBar)) return { error: "Enter boost pressure as a number, or 0 for none." };
  if (boostBar < 0) return { error: "Boost pressure cannot be negative." };
  if (boostBar > 4) return { error: "Boost above 4 bar is outside anything this rule of thumb covers." };

  const reduction = boostBar * BOOST_GAP_REDUCTION_MM_PER_BAR;
  const minMm = Math.max(ABSOLUTE_MIN_GAP_MM, app.minMm - reduction);
  const maxMm = Math.max(ABSOLUTE_MIN_GAP_MM + 0.05, app.maxMm - reduction);

  return {
    label: app.label,
    note: app.note,
    baseMinMm: app.minMm,
    baseMaxMm: app.maxMm,
    reductionMm: round(reduction, 3),
    minMm: round(minMm, 2),
    maxMm: round(maxMm, 2),
    minThou: round(minMm / MM_PER_THOU, 0),
    maxThou: round(maxMm / MM_PER_THOU, 0),
    midMm: round((minMm + maxMm) / 2, 2),
    boostApplied: boostBar > 0,
  };
}

/**
 * Compare a measured gap against a target range.
 * @param {object} input
 * @param {number} input.measuredMm measured gap in millimetres
 * @param {number} input.targetMinMm
 * @param {number} input.targetMaxMm
 */
export function checkGap({ measuredMm, targetMinMm, targetMaxMm }) {
  if (![measuredMm, targetMinMm, targetMaxMm].every(isNum)) {
    return { error: "Enter the measured gap and both ends of the target range." };
  }
  if (measuredMm <= 0) return { error: "Measured gap must be greater than zero." };
  if (targetMinMm <= 0 || targetMaxMm <= 0) {
    return { error: "Target gap values must be greater than zero." };
  }
  if (targetMinMm > targetMaxMm) {
    return { error: "The minimum of the target range cannot be larger than the maximum." };
  }
  if (measuredMm < MIN_GAP_MM || measuredMm > MAX_GAP_MM) {
    return { error: `A measured gap should be between ${MIN_GAP_MM} mm and ${MAX_GAP_MM} mm.` };
  }

  let verdict = "in-range";
  let adjustmentMm = 0;
  if (measuredMm < targetMinMm) {
    verdict = "too-tight";
    adjustmentMm = targetMinMm - measuredMm;
  } else if (measuredMm > targetMaxMm) {
    verdict = "too-wide";
    adjustmentMm = measuredMm - targetMaxMm;
  }

  const messages = {
    "in-range": "The gap is inside the specified range — refit as it is.",
    "too-tight": "The gap is too tight: the spark is weak and can misfire under load.",
    "too-wide": "The gap is too wide: the coil may not strike the arc at high load, causing misfire.",
  };

  return {
    measuredMm: round(measuredMm, 3),
    measuredThou: round(measuredMm / MM_PER_THOU, 1),
    targetMinMm: round(targetMinMm, 2),
    targetMaxMm: round(targetMaxMm, 2),
    verdict,
    inRange: verdict === "in-range",
    adjustmentMm: round(adjustmentMm, 3),
    adjustmentThou: round(adjustmentMm / MM_PER_THOU, 1),
    message: messages[verdict],
  };
}

/** A quick mm to thou reference ladder for the common gap sizes. */
export function gapConversionTable() {
  const sizes = [0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 1.0, 1.1, 1.2, 1.3];
  return sizes.map((mm) => ({
    mm,
    thou: round(mm / MM_PER_THOU, 0),
    inch: round(mm / MM_PER_INCH, 4),
  }));
}
