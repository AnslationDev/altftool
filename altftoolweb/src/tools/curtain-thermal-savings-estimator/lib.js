/**
 * Curtain thermal savings estimator.
 *
 * Heat crossing a window has two parts, and a curtain cuts each of them by a
 * different amount:
 *
 *   solar gain      Q_solar = A x SHGC x I
 *   conducted gain  Q_cond  = A x U x dT
 *
 * where A is glass area in m^2, SHGC the solar heat gain coefficient of the
 * glazing, I the solar irradiance reaching the glass in W/m^2, U the glazing
 * U-value in W/m^2K and dT the indoor-to-outdoor temperature difference.
 *
 * An interior curtain is characterised by its INTERIOR ATTENUATION COEFFICIENT
 * (IAC) — the ASHRAE Fundamentals term for the fraction of solar gain that
 * still gets through with the shade drawn — and by a smaller reduction in the
 * conducted component, because the trapped air layer adds a little resistance.
 *
 *   Q_with_curtain = A x (SHGC x I x IAC + U x (1 - u_reduction) x dT)
 *
 * The saved heat is then divided by the air conditioner's coefficient of
 * performance to get electricity, because an AC moves several units of heat per
 * unit of electricity consumed.
 */

/** 1 ft = 0.3048 m exactly. */
export const METRES_PER_FOOT = 0.3048;

/** One ton of refrigeration = 3,516.85 W of cooling. */
export const WATTS_PER_TON_REFRIGERATION = 3516.85;

/**
 * Glazing properties. SHGC and U-value are the centre-of-glass figures given
 * for these constructions in ASHRAE Fundamentals; a real window with its frame
 * will differ, but these are the standard design values.
 */
export const GLAZING_TYPES = [
  { id: "clear", label: "Single clear 5 mm", shgc: 0.82, uValue: 5.8 },
  { id: "tinted", label: "Single tinted / heat absorbing", shgc: 0.6, uValue: 5.7 },
  { id: "reflective", label: "Single reflective coated", shgc: 0.4, uValue: 5.5 },
  { id: "double", label: "Double glazed, clear, air filled", shgc: 0.7, uValue: 2.7 },
  { id: "lowe", label: "Double glazed low-E", shgc: 0.4, uValue: 1.8 },
];

/**
 * Interior attenuation coefficients for drawn window coverings, in the range
 * ASHRAE publishes for interior shading (roughly 0.25 for a tightly fitted
 * reflective blackout to 0.75 for an open-weave sheer). The U-value reduction
 * is the modest resistance the trapped air layer adds; only a curtain sealed at
 * the top and sides gets near the upper end.
 */
export const CURTAIN_TYPES = [
  { id: "sheer", label: "Sheer net curtain, light colour", iac: 0.75, uReduction: 0.02 },
  { id: "medium", label: "Medium-weight light-coloured drape", iac: 0.55, uReduction: 0.05 },
  { id: "heavy", label: "Heavy closed-weave drape", iac: 0.5, uReduction: 0.08 },
  { id: "blackout", label: "Blackout lined curtain", iac: 0.35, uReduction: 0.1 },
  { id: "thermal", label: "Thermal curtain, sealed at the edges", iac: 0.3, uReduction: 0.25 },
  { id: "reflective", label: "Reflective blackout with a pelmet", iac: 0.25, uReduction: 0.3 },
];

/**
 * Rough average irradiance on the glass over the hours a curtain would be
 * drawn, by orientation, for a low-latitude summer. West-facing glass is the
 * worst case because the afternoon sun is both intense and low in the sky.
 */
export const ORIENTATION_IRRADIANCE = [
  { id: "north", label: "North facing", irradiance: 120 },
  { id: "east", label: "East facing", irradiance: 350 },
  { id: "south", label: "South facing", irradiance: 300 },
  { id: "west", label: "West facing", irradiance: 450 },
  { id: "skylight", label: "Skylight / roof glazing", irradiance: 600 },
];

/**
 * Default coefficient of performance. A 3-star Indian split AC rated around
 * ISEER 3.3 delivers roughly 3.2 units of cooling per unit of electricity at
 * rated conditions.
 */
export const DEFAULT_COP = 3.2;

export const MAX_WINDOW_AREA_SQM = 500;
export const MAX_IRRADIANCE = 1100;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;
const round3 = (value) => Math.round(value * 1000) / 1000;

/** Convert a length to metres. Unit is "m" or "ft". */
export function toMetres(value, unit) {
  if (!isNum(value)) return NaN;
  return unit === "ft" ? value * METRES_PER_FOOT : value;
}

/**
 * Instantaneous heat gain through glazing, in watts.
 * @param {number} areaSqm
 * @param {number} shgc
 * @param {number} irradiance   W/m^2 on the glass.
 * @param {number} uValue       W/m^2K.
 * @param {number} deltaT       Outdoor minus indoor, K.
 * @param {number} iac          1 for bare glass.
 * @param {number} uReduction   0 for bare glass.
 * @returns {number} Watts, or NaN for unusable input.
 */
export function glazingHeatGain(areaSqm, shgc, irradiance, uValue, deltaT, iac, uReduction) {
  const values = [areaSqm, shgc, irradiance, uValue, deltaT, iac, uReduction];
  if (values.some((value) => !isNum(value))) return NaN;
  if (areaSqm <= 0) return NaN;
  const solar = areaSqm * shgc * irradiance * iac;
  const conducted = areaSqm * uValue * (1 - uReduction) * deltaT;
  return solar + conducted;
}

/**
 * @param {object} input
 * @param {number} input.windowWidth      Width of one window, in `unit`.
 * @param {number} input.windowHeight     Height of one window, in `unit`.
 * @param {"m"|"ft"} [input.unit]
 * @param {number} input.windowCount
 * @param {string} [input.glazingId]
 * @param {string} [input.curtainId]
 * @param {number} input.irradiance       W/m^2 on the glass while curtains are shut.
 * @param {number} input.deltaT           Outdoor minus indoor, degrees C.
 * @param {number} input.hoursPerDay      Hours a day the curtain is drawn in sun.
 * @param {number} input.seasonDays       Days a year you run the AC.
 * @param {number} [input.cop]            AC coefficient of performance.
 * @param {number} [input.tariff]         INR per kWh.
 * @param {number} [input.curtainCost]    Total cost of the curtains.
 * @returns {object} Savings, or { error } for invalid input.
 */
export function estimateCurtainSavings({
  windowWidth,
  windowHeight,
  unit = "ft",
  windowCount,
  glazingId = "clear",
  curtainId = "blackout",
  irradiance,
  deltaT,
  hoursPerDay,
  seasonDays,
  cop = DEFAULT_COP,
  tariff = 0,
  curtainCost = 0,
} = {}) {
  const raw = {
    windowWidth,
    windowHeight,
    windowCount,
    irradiance,
    deltaT,
    hoursPerDay,
    seasonDays,
    cop,
    tariff,
    curtainCost,
  };
  if (Object.values(raw).some((value) => !isNum(value))) {
    return { error: "Enter a valid number in every field." };
  }

  const glazing = GLAZING_TYPES.find((item) => item.id === glazingId) ?? GLAZING_TYPES[0];
  const curtain = CURTAIN_TYPES.find((item) => item.id === curtainId) ?? CURTAIN_TYPES[3];

  const widthM = toMetres(windowWidth, unit);
  const heightM = toMetres(windowHeight, unit);
  if (widthM <= 0 || heightM <= 0) {
    return { error: "Window width and height must be greater than zero." };
  }
  if (windowCount < 1) return { error: "There must be at least one window." };
  if (irradiance < 0) return { error: "Solar irradiance cannot be negative." };
  if (irradiance > MAX_IRRADIANCE) {
    return { error: `Irradiance above ${MAX_IRRADIANCE} W/sqm exceeds full sun at ground level.` };
  }
  if (deltaT < 0) return { error: "If it is cooler outside than inside, curtains save no cooling." };
  if (deltaT > 40) return { error: "A temperature difference above 40 degrees is not realistic." };
  if (hoursPerDay <= 0 || hoursPerDay > 24) return { error: "Hours per day must be between 1 and 24." };
  if (seasonDays <= 0 || seasonDays > 365) return { error: "Season length must be between 1 and 365 days." };
  if (cop <= 0 || cop > 10) return { error: "Coefficient of performance must be between 0 and 10." };
  if (tariff < 0) return { error: "Electricity tariff cannot be negative." };
  if (curtainCost < 0) return { error: "Curtain cost cannot be negative." };

  const windows = Math.floor(windowCount);
  const areaPerWindowSqm = widthM * heightM;
  const totalAreaSqm = areaPerWindowSqm * windows;
  if (totalAreaSqm > MAX_WINDOW_AREA_SQM) {
    return { error: `More than ${MAX_WINDOW_AREA_SQM} sqm of glass is a facade study, not a curtain sum.` };
  }

  const bareW = glazingHeatGain(
    totalAreaSqm,
    glazing.shgc,
    irradiance,
    glazing.uValue,
    deltaT,
    1,
    0,
  );
  const curtainedW = glazingHeatGain(
    totalAreaSqm,
    glazing.shgc,
    irradiance,
    glazing.uValue,
    deltaT,
    curtain.iac,
    curtain.uReduction,
  );
  const savedW = bareW - curtainedW;
  const reductionPercent = bareW > 0 ? (savedW / bareW) * 100 : 0;

  const hoursPerYear = hoursPerDay * seasonDays;
  const thermalKwhPerYear = (savedW * hoursPerYear) / 1000;
  const electricalKwhPerYear = thermalKwhPerYear / cop;
  const savingPerYear = electricalKwhPerYear * tariff;
  const savingPerMonth = savingPerYear / 12;

  const tonsOffset = savedW / WATTS_PER_TON_REFRIGERATION;
  const paybackYears = savingPerYear > 0 ? curtainCost / savingPerYear : NaN;

  return {
    glazingLabel: glazing.label,
    shgc: glazing.shgc,
    uValue: glazing.uValue,
    curtainLabel: curtain.label,
    iac: curtain.iac,
    uReductionPercent: round1(curtain.uReduction * 100),

    windows,
    areaPerWindowSqm: round2(areaPerWindowSqm),
    totalAreaSqm: round2(totalAreaSqm),

    bareW: round1(bareW),
    curtainedW: round1(curtainedW),
    savedW: round1(savedW),
    reductionPercent: round1(reductionPercent),
    tonsOffset: round3(tonsOffset),

    hoursPerYear: round1(hoursPerYear),
    thermalKwhPerYear: round1(thermalKwhPerYear),
    electricalKwhPerYear: round1(electricalKwhPerYear),
    savingPerYear: Math.round(savingPerYear),
    savingPerMonth: Math.round(savingPerMonth),

    curtainCost: Math.round(curtainCost),
    paybackYears: Number.isFinite(paybackYears) ? round1(paybackYears) : NaN,
  };
}
