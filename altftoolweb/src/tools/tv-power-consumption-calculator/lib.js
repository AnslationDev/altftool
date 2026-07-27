/**
 * TV power consumption and running-cost model.
 *
 * Physics
 *  Energy (kWh) = Power (W) x Time (h) / 1000            [definition of the kilowatt-hour]
 *  Cost         = Energy (kWh) x Tariff (currency/kWh)
 *
 * Screen area
 *  A 16:9 panel with diagonal d has width 16k and height 9k where
 *  (16k)^2 + (9k)^2 = d^2, so k^2 = d^2 / (16^2 + 9^2) = d^2 / 337.
 *  Area = 16k * 9k = 144 * d^2 / 337 = 0.42730 * d^2 square inches.
 *
 * Power draw
 *  Flat-panel TV power scales with panel area, because the backlight (LCD)
 *  or the emissive layer (OLED) is what dominates consumption. Modelling it
 *  as (area x power density) reproduces the published "typical on-mode power"
 *  figures used on EU/BEE energy labels far better than a flat per-model
 *  guess: e.g. a 55 in edge-lit LED TV is ~1293 sq in, and 1293 x 0.070 is
 *  about 90 W, which is the usual measured SDR figure for that class.
 *  Densities below are calibrated against typical labelled on-mode power for
 *  each panel technology; a user who knows their own label figure should
 *  enter it directly with the "known wattage" override.
 */

/** 16:9 area coefficient: 144 / (16^2 + 9^2). */
export const AREA_COEFF_16_9 = 144 / 337;

/** Days used for monthly and yearly roll-ups (365 / 12 keeps the two consistent). */
export const DAYS_PER_YEAR = 365;
export const DAYS_PER_MONTH = 365 / 12;

/**
 * Grid emission factor for India, CEA CO2 Baseline Database (combined margin,
 * ~0.71 kg CO2 per kWh in recent editions). Used only for the CO2 line.
 */
export const GRID_CO2_KG_PER_KWH = 0.71;

/** Typical on-mode power density in watts per square inch of screen. */
export const PANEL_TYPES = [
  { id: "led", label: "LED / LCD (edge-lit)", density: 0.07 },
  { id: "qled", label: "QLED / full-array LED (Mini-LED)", density: 0.085 },
  { id: "oled", label: "OLED", density: 0.095 },
  { id: "plasma", label: "Plasma (legacy)", density: 0.19 },
];

/** Picture-mode multipliers applied to on-mode power. */
export const PICTURE_MODES = [
  { id: "eco", label: "Eco / power saving", factor: 0.75 },
  { id: "standard", label: "Standard (SDR)", factor: 1 },
  { id: "vivid", label: "Vivid / HDR peak brightness", factor: 1.35 },
];

/**
 * Default standby draw. EU Ecodesign Regulation 1275/2008 (as amended) caps
 * off/standby mode at 0.5 W for most consumer electronics; networked standby
 * on a smart TV is allowed up to 2 W, so 0.5 W is a conservative default.
 */
export const DEFAULT_STANDBY_W = 0.5;

/** Diagonal limits accepted by the model, in inches. */
export const MIN_DIAGONAL_IN = 10;
export const MAX_DIAGONAL_IN = 120;

const num = (value) => {
  if (value === "" || value === null || value === undefined) return Number.NaN;
  const n = Number(value);
  return Number.isFinite(n) ? n : Number.NaN;
};

/** Screen area in square inches for a 16:9 panel of the given diagonal. */
export function screenAreaSqIn(diagonalInches) {
  const d = num(diagonalInches);
  if (!(d > 0)) return Number.NaN;
  return AREA_COEFF_16_9 * d * d;
}

/**
 * Estimate TV electricity use and cost.
 *
 * @param {object} input
 * @param {number} input.diagonalInches Screen diagonal in inches.
 * @param {string} input.panelId        One of PANEL_TYPES ids.
 * @param {string} input.modeId         One of PICTURE_MODES ids.
 * @param {number} input.hoursPerDay    Hours the TV is switched on, 0-24.
 * @param {number} input.tariff         Electricity price per kWh.
 * @param {number} [input.standbyWatts] Standby draw in watts (default 0.5).
 * @param {number|null} [input.knownWatts] Label on-mode power, overrides the model.
 * @returns {object} result or { error }
 */
export function computeTvUsage({
  diagonalInches,
  panelId = "led",
  modeId = "standard",
  hoursPerDay,
  tariff,
  standbyWatts = DEFAULT_STANDBY_W,
  knownWatts = null,
}) {
  const panel = PANEL_TYPES.find((p) => p.id === panelId);
  const mode = PICTURE_MODES.find((m) => m.id === modeId);
  if (!panel) return { error: "Choose a panel type." };
  if (!mode) return { error: "Choose a picture mode." };

  const d = num(diagonalInches);
  const hours = num(hoursPerDay);
  const rate = num(tariff);
  const standby = num(standbyWatts);
  const known = knownWatts === null || knownWatts === "" ? null : num(knownWatts);

  if (Number.isNaN(d) || Number.isNaN(hours) || Number.isNaN(rate) || Number.isNaN(standby)) {
    return { error: "Enter a number in every field." };
  }
  if (known !== null && Number.isNaN(known)) {
    return { error: "Known wattage must be a number, or leave it blank." };
  }
  if (d < MIN_DIAGONAL_IN || d > MAX_DIAGONAL_IN) {
    return { error: `Screen size should be between ${MIN_DIAGONAL_IN} and ${MAX_DIAGONAL_IN} inches.` };
  }
  if (hours < 0 || hours > 24) return { error: "Viewing hours must be between 0 and 24 per day." };
  if (rate <= 0) return { error: "Electricity tariff must be greater than zero." };
  if (standby < 0 || standby > 50) return { error: "Standby draw should be between 0 and 50 watts." };
  if (known !== null && (known <= 0 || known > 2000)) {
    return { error: "Known wattage should be between 1 and 2000 watts." };
  }

  const areaSqIn = AREA_COEFF_16_9 * d * d;
  const modelledWatts = areaSqIn * panel.density;
  const baseWatts = known !== null ? known : modelledWatts;
  const onWatts = baseWatts * mode.factor;

  const standbyHours = 24 - hours;
  const onKwhPerDay = (onWatts * hours) / 1000;
  const standbyKwhPerDay = (standby * standbyHours) / 1000;
  const kwhPerDay = onKwhPerDay + standbyKwhPerDay;

  const kwhPerMonth = kwhPerDay * DAYS_PER_MONTH;
  const kwhPerYear = kwhPerDay * DAYS_PER_YEAR;

  return {
    panel,
    mode,
    areaSqIn,
    modelledWatts,
    onWatts,
    standbyWatts: standby,
    usedKnownWatts: known !== null,
    onKwhPerDay,
    standbyKwhPerDay,
    kwhPerDay,
    kwhPerMonth,
    kwhPerYear,
    costPerDay: kwhPerDay * rate,
    costPerMonth: kwhPerMonth * rate,
    costPerYear: kwhPerYear * rate,
    costPerViewingHour: hours > 0 ? (onWatts / 1000) * rate : 0,
    standbyCostPerYear: standbyKwhPerDay * DAYS_PER_YEAR * rate,
    standbyShareOfDay: kwhPerDay > 0 ? (standbyKwhPerDay / kwhPerDay) * 100 : 0,
    co2KgPerYear: kwhPerYear * GRID_CO2_KG_PER_KWH,
  };
}
