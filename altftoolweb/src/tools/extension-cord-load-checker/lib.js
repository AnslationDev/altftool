/**
 * Extension board / extension cord load check.
 *
 * Current drawn  I = total watts / (supply volts x power factor)
 * Safe limit     = the SMALLER of the board's printed amp rating and the flexible cord's ampacity
 * Continuous     = a load running 3 hours or more should stay at or below 80% of that limit
 *                  (NEC 210.19(A)(1) and 210.20(A); the same de-rating habit is good practice
 *                  on IS 1293 boards, which are type-tested at their rating, not above it)
 * Voltage drop   = 2 x length x current x rho / conductor area   (two-way copper run)
 */

/** Resistivity of annealed copper at 20 C, in ohm x mm^2 / m. */
export const COPPER_RESISTIVITY = 0.0172;

/** NEC 210.19(A)(1): continuous loads (3 h or more) get an 80% ceiling. */
export const CONTINUOUS_LOAD_FACTOR = 0.8;

/** IEC 60364-5-52 / IS 732 guidance: keep final-circuit drop under 3%. */
export const MAX_VOLTAGE_DROP_PCT = 3;

export const SUPPLY_PRESETS = [
  { id: "in-eu", label: "India / EU / UK — 230 V", volts: 230 },
  { id: "us", label: "North America — 120 V", volts: 120 },
  { id: "jp", label: "Japan — 100 V", volts: 100 },
];

/**
 * Cord ampacities.
 * Metric rows: IS 694 / IEC 60227 PVC flexible cable, 2-3 core, unenclosed.
 * AWG rows: NEC Table 400.5(A)(1) column A (three current-carrying conductors),
 * which is the column that applies to a normal 3-wire extension cord.
 */
export const CORD_SIZES = [
  { id: "0.5mm", label: "0.5 mm² flexible", area: 0.5, amps: 3, system: "metric" },
  { id: "0.75mm", label: "0.75 mm² flexible", area: 0.75, amps: 6, system: "metric" },
  { id: "1.0mm", label: "1.0 mm² flexible", area: 1.0, amps: 10, system: "metric" },
  { id: "1.5mm", label: "1.5 mm² flexible", area: 1.5, amps: 16, system: "metric" },
  { id: "2.5mm", label: "2.5 mm² flexible", area: 2.5, amps: 20, system: "metric" },
  { id: "18awg", label: "18 AWG cord", area: 0.823, amps: 7, system: "awg" },
  { id: "16awg", label: "16 AWG cord", area: 1.31, amps: 10, system: "awg" },
  { id: "14awg", label: "14 AWG cord", area: 2.08, amps: 15, system: "awg" },
  { id: "12awg", label: "12 AWG cord", area: 3.31, amps: 20, system: "awg" },
];

/** Common printed ratings on extension boards (IS 1293 in India, BS 1363 in the UK, NEMA in the US). */
export const BOARD_RATINGS = [5, 6, 10, 13, 15, 16, 20];

/**
 * Steady running wattages. Motor and heating appliances also have a start-up surge,
 * flagged separately by `surgeFactor` (multiple of running watts for the first seconds).
 */
export const APPLIANCE_LIBRARY = [
  { id: "led-bulb", label: "LED bulb", watts: 9, surgeFactor: 1 },
  { id: "laptop", label: "Laptop charger", watts: 65, surgeFactor: 1 },
  { id: "phone", label: "Phone charger", watts: 20, surgeFactor: 1 },
  { id: "wifi", label: "Wi-Fi router", watts: 12, surgeFactor: 1 },
  { id: "tv", label: "LED TV 43 in", watts: 100, surgeFactor: 1 },
  { id: "fan", label: "Table fan", watts: 55, surgeFactor: 2 },
  { id: "fridge", label: "Fridge 250 L", watts: 150, surgeFactor: 5 },
  { id: "microwave", label: "Microwave oven", watts: 1200, surgeFactor: 1.2 },
  { id: "kettle", label: "Electric kettle", watts: 1500, surgeFactor: 1 },
  { id: "heater", label: "Room heater", watts: 2000, surgeFactor: 1 },
  { id: "iron", label: "Steam iron", watts: 1200, surgeFactor: 1 },
  { id: "geyser", label: "Water heater / geyser", watts: 2000, surgeFactor: 1 },
  { id: "ac", label: "Air conditioner 1.5 ton", watts: 1500, surgeFactor: 4 },
  { id: "vacuum", label: "Vacuum cleaner", watts: 1000, surgeFactor: 2.5 },
];

export const STATUS = {
  SAFE: "safe",
  CAUTION: "caution",
  OVERLOAD: "overload",
};

const MAX_TOTAL_WATTS = 100000;
const MAX_LENGTH_M = 100;

/**
 * @param {object} input
 * @param {number} input.volts        Supply voltage.
 * @param {number} input.boardAmps    Amp rating printed on the extension board.
 * @param {string} input.cordId       Key from CORD_SIZES.
 * @param {number} input.lengthMeters Cord length in metres.
 * @param {number} input.powerFactor  0.1 to 1. Use 1 for heaters/lights, ~0.8 for motors.
 * @param {Array<{watts:number, qty:number, surgeFactor?:number}>} input.appliances
 * @param {boolean} input.continuous  True if the load runs 3 hours or more.
 * @returns {object} result or { error }
 */
export function checkExtensionLoad({
  volts,
  boardAmps,
  cordId,
  lengthMeters,
  powerFactor = 1,
  appliances = [],
  continuous = true,
}) {
  const cord = CORD_SIZES.find((entry) => entry.id === cordId);
  if (!cord) return { error: "Choose a cord conductor size." };

  const scalars = [volts, boardAmps, lengthMeters, powerFactor];
  if (scalars.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: "Enter a valid number for voltage, board rating, length and power factor." };
  }
  if (!(volts > 0)) return { error: "Supply voltage must be greater than 0 V." };
  if (!(boardAmps > 0)) return { error: "Board rating must be greater than 0 A." };
  if (!(lengthMeters >= 0) || lengthMeters > MAX_LENGTH_M) {
    return { error: `Cord length must be between 0 and ${MAX_LENGTH_M} m.` };
  }
  if (!(powerFactor > 0) || powerFactor > 1) {
    return { error: "Power factor must be between 0.1 and 1." };
  }
  if (!Array.isArray(appliances) || appliances.length === 0) {
    return { error: "Add at least one appliance to the board." };
  }

  let totalWatts = 0;
  let peakWatts = 0;
  for (const item of appliances) {
    const watts = Number(item?.watts);
    const qty = Number(item?.qty ?? 1);
    const surge = Number(item?.surgeFactor ?? 1);
    if (!Number.isFinite(watts) || watts < 0) {
      return { error: "Every appliance needs a watt figure of 0 or more." };
    }
    if (!Number.isFinite(qty) || qty < 0 || !Number.isInteger(qty)) {
      return { error: "Appliance quantity must be a whole number of 0 or more." };
    }
    totalWatts += watts * qty;
    // Worst realistic instant: everything running plus the single largest start-up surge.
    peakWatts = Math.max(peakWatts, watts * (Number.isFinite(surge) && surge >= 1 ? surge : 1) - watts);
  }
  if (totalWatts > MAX_TOTAL_WATTS) {
    return { error: "That total load is far beyond any plug-in extension board." };
  }
  if (totalWatts === 0) {
    return { error: "Total load is 0 W — add an appliance with a wattage." };
  }

  const va = volts * powerFactor;
  const current = totalWatts / va;
  const surgeCurrent = (totalWatts + peakWatts) / va;

  const limitAmps = Math.min(boardAmps, cord.amps);
  const continuousLimitAmps = limitAmps * CONTINUOUS_LOAD_FACTOR;
  const effectiveLimit = continuous ? continuousLimitAmps : limitAmps;

  const utilisationPct = (current / limitAmps) * 100;
  const headroomAmps = effectiveLimit - current;
  const headroomWatts = headroomAmps * va;
  const maxWatts = effectiveLimit * va;

  const dropVolts =
    cord.area > 0 ? (2 * lengthMeters * current * COPPER_RESISTIVITY) / cord.area : 0;
  const dropPct = (dropVolts / volts) * 100;

  const warnings = [];
  let status = STATUS.SAFE;

  if (current > limitAmps) {
    status = STATUS.OVERLOAD;
    warnings.push(
      `Draw of ${current.toFixed(2)} A exceeds the ${limitAmps} A limit set by the ${
        boardAmps <= cord.amps ? "board rating" : "cord size"
      }. Split these appliances across separate wall sockets.`,
    );
  } else if (continuous && current > continuousLimitAmps) {
    status = STATUS.CAUTION;
    warnings.push(
      `Draw of ${current.toFixed(2)} A is under the ${limitAmps} A rating but over the ${continuousLimitAmps.toFixed(
        1,
      )} A continuous-load ceiling (80%). Fine briefly, not for hours.`,
    );
  }

  if (dropPct > MAX_VOLTAGE_DROP_PCT) {
    if (status === STATUS.SAFE) status = STATUS.CAUTION;
    warnings.push(
      `Voltage drop of ${dropPct.toFixed(1)}% over ${lengthMeters} m is above the ${MAX_VOLTAGE_DROP_PCT}% guideline. Use a shorter or thicker cord.`,
    );
  }

  if (surgeCurrent > limitAmps && status !== STATUS.OVERLOAD) {
    if (status === STATUS.SAFE) status = STATUS.CAUTION;
    warnings.push(
      `Start-up surge reaches about ${surgeCurrent.toFixed(1)} A, above the ${limitAmps} A rating — a motor or compressor starting may trip the board.`,
    );
  }

  if (boardAmps > cord.amps) {
    warnings.push(
      `The cord is the weak link: ${cord.label} carries ${cord.amps} A but the board is marked ${boardAmps} A.`,
    );
  }

  return {
    totalWatts,
    current,
    surgeCurrent,
    limitAmps,
    limitedBy: boardAmps <= cord.amps ? "board rating" : "cord ampacity",
    continuousLimitAmps,
    effectiveLimit,
    utilisationPct,
    headroomAmps,
    headroomWatts,
    maxWatts,
    dropVolts,
    dropPct,
    cordLabel: cord.label,
    cordAmps: cord.amps,
    status,
    warnings,
  };
}
