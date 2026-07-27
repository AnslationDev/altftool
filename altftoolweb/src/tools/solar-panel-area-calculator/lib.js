/**
 * Roof area and panel count for a target solar array.
 *
 * Module efficiency is the defining relationship: a panel's rated watts are
 * measured under Standard Test Conditions, which fix irradiance at 1000 W/m2.
 * So efficiency = rated watts / (module area x 1000). Roof area then follows
 * from the module area multiplied by a mounting factor that accounts for row
 * spacing, walkways and edge setbacks.
 */

/** Standard Test Conditions irradiance, W/m2 (IEC 61215: 1000 W/m2, 25 C, AM1.5). */
export const STC_IRRADIANCE_W_PER_SQM = 1000;

/** International foot conversions (1959 international yard and pound agreement). */
export const SQFT_TO_SQM = 0.09290304;
export const SQM_TO_SQFT = 1 / SQFT_TO_SQM;

/** Mean days per year in the Gregorian calendar. */
export const DAYS_PER_YEAR = 365.25;

/**
 * Best commercial silicon modules are around 23-24.5% efficient in 2026.
 * Anything above that is a data-entry mistake; above 33% breaks the
 * Shockley-Queisser limit for a single-junction cell.
 */
export const HIGH_EFFICIENCY_WARN_PCT = 24.5;
export const IMPOSSIBLE_EFFICIENCY_PCT = 33;

/**
 * Mounting layout -> roof area per unit of module area.
 * Flush mounting on a pitched roof only loses edge setbacks and a service gap.
 * Tilted rows on a flat roof must be spaced so they do not shade each other,
 * which is the standard ground-coverage-ratio penalty.
 */
export const MOUNTING_TYPES = {
  flushPitched: {
    id: "flushPitched",
    label: "Flush on a pitched roof",
    hint: "Panels lie along the slope",
    areaFactor: 1.15,
  },
  flatTilted: {
    id: "flatTilted",
    label: "Tilted rows on a flat roof",
    hint: "Rows spaced to avoid self-shading",
    areaFactor: 2.2,
  },
  elevatedFlat: {
    id: "elevatedFlat",
    label: "Elevated frame over a flat roof",
    hint: "Low-tilt canopy, terrace still usable",
    areaFactor: 1.35,
  },
  groundMount: {
    id: "groundMount",
    label: "Ground mount",
    hint: "Open land with access paths",
    areaFactor: 2.6,
  },
};

/**
 * Performance ratio bundles every loss between the panel nameplate and the
 * meter: heat derating, soiling, wiring, inverter conversion and downtime.
 * Well-built rooftop systems land near 0.75-0.80.
 */
export const DEFAULT_PERFORMANCE_RATIO = 0.78;

/** Typical peak sun hours per day across most of India (annual average). */
export const DEFAULT_PEAK_SUN_HOURS = 5.0;

/**
 * @param {object} input
 * @param {number} input.targetKw        wanted DC capacity, kW
 * @param {number} input.panelWatt       panel rating, Wp
 * @param {number} input.panelLengthMm   module long side, mm
 * @param {number} input.panelWidthMm    module short side, mm
 * @param {string} input.mounting        key of MOUNTING_TYPES
 * @param {number} input.peakSunHours    peak sun hours per day at the site
 * @param {number} input.performanceRatio 0-1 system performance ratio
 * @param {number} input.availableArea   roof area you actually have (0 = skip the fit check)
 * @param {"sqft"|"sqm"} input.areaUnit
 */
export function computeSolarArea({
  targetKw,
  panelWatt,
  panelLengthMm,
  panelWidthMm,
  mounting = "flushPitched",
  peakSunHours = DEFAULT_PEAK_SUN_HOURS,
  performanceRatio = DEFAULT_PERFORMANCE_RATIO,
  availableArea = 0,
  areaUnit = "sqft",
} = {}) {
  const numbers = {
    targetKw,
    panelWatt,
    panelLengthMm,
    panelWidthMm,
    peakSunHours,
    performanceRatio,
    availableArea,
  };
  for (const [key, value] of Object.entries(numbers)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return { error: `Enter a valid number for ${key}.` };
    }
  }

  const mount = MOUNTING_TYPES[mounting];
  if (!mount) return { error: "Choose how the panels will be mounted." };

  if (!(targetKw > 0)) return { error: "Target capacity must be greater than zero." };
  if (targetKw > 1000) return { error: "This calculator covers rooftop systems up to 1000 kW." };
  if (!(panelWatt > 0)) return { error: "Panel wattage must be greater than zero." };
  if (!(panelLengthMm > 0) || !(panelWidthMm > 0)) {
    return { error: "Panel length and width must both be greater than zero." };
  }
  if (peakSunHours <= 0 || peakSunHours > 12) {
    return { error: "Peak sun hours per day should be between 0 and 12." };
  }
  if (performanceRatio <= 0 || performanceRatio > 1) {
    return { error: "Performance ratio must be between 0 and 1 (0.78 is typical)." };
  }
  if (availableArea < 0) return { error: "Available roof area cannot be negative." };

  const panelAreaSqm = (panelLengthMm / 1000) * (panelWidthMm / 1000);
  const efficiencyPct = (panelWatt / (panelAreaSqm * STC_IRRADIANCE_W_PER_SQM)) * 100;

  if (efficiencyPct >= IMPOSSIBLE_EFFICIENCY_PCT) {
    return {
      error: `Those numbers imply ${efficiencyPct.toFixed(1)}% module efficiency, which no silicon panel reaches — check the wattage and the dimensions (most are given in millimetres).`,
    };
  }

  const panelCount = Math.ceil((targetKw * 1000) / panelWatt);
  const installedKw = (panelCount * panelWatt) / 1000;
  const moduleAreaSqm = panelCount * panelAreaSqm;
  const roofAreaSqm = moduleAreaSqm * mount.areaFactor;
  const areaPerKwSqm = roofAreaSqm / installedKw;

  const dailyKwh = installedKw * peakSunHours * performanceRatio;
  const monthlyKwh = (dailyKwh * DAYS_PER_YEAR) / 12;
  const annualKwh = dailyKwh * DAYS_PER_YEAR;
  const specificYield = annualKwh / installedKw; // kWh per kWp per year

  const availableSqm = areaUnit === "sqm" ? availableArea : availableArea * SQFT_TO_SQM;
  const areaPerPanelSqm = panelAreaSqm * mount.areaFactor;
  let fit = null;
  if (availableSqm > 0) {
    const panelsThatFit = Math.floor(availableSqm / areaPerPanelSqm);
    const maxKw = (panelsThatFit * panelWatt) / 1000;
    fit = {
      availableSqm,
      fits: availableSqm >= roofAreaSqm,
      shortfallSqm: Math.max(0, roofAreaSqm - availableSqm),
      spareSqm: Math.max(0, availableSqm - roofAreaSqm),
      panelsThatFit,
      maxKw,
      maxDailyKwh: maxKw * peakSunHours * performanceRatio,
    };
  }

  return {
    panelAreaSqm,
    efficiencyPct,
    efficiencyWarning:
      efficiencyPct > HIGH_EFFICIENCY_WARN_PCT
        ? `${efficiencyPct.toFixed(1)}% is above today's best mass-market modules — double-check the panel spec sheet.`
        : null,
    panelCount,
    installedKw,
    moduleAreaSqm,
    moduleAreaSqft: moduleAreaSqm * SQM_TO_SQFT,
    roofAreaSqm,
    roofAreaSqft: roofAreaSqm * SQM_TO_SQFT,
    areaPerKwSqm,
    areaPerKwSqft: areaPerKwSqm * SQM_TO_SQFT,
    mountingLabel: mount.label,
    areaFactor: mount.areaFactor,
    dailyKwh,
    monthlyKwh,
    annualKwh,
    specificYield,
    fit,
  };
}
