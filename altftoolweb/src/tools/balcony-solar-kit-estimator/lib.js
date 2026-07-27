/**
 * Plug-in balcony solar kit output, savings and payback.
 *
 * The interesting part of a balcony kit is that the panels usually hang
 * vertically on a railing, which costs a lot of yield — and costs MORE the
 * closer you live to the equator. That is pure geometry, so it is modelled
 * rather than looked up.
 *
 * For a south-facing surface in the northern hemisphere, the solar-noon angle
 * of incidence at equinox is theta = |latitude - tilt|. Optimal tilt therefore
 * equals the latitude (theta = 0). Beam gain scales with cos(theta); diffuse
 * sky light scales with the sky view factor (1 + cos tilt) / 2. Weighting the
 * two by the typical beam/diffuse split of annual irradiance and dividing by
 * the same quantity at optimal tilt gives the yield relative to a well-aimed
 * roof array.
 */

/** Mean days per year in the Gregorian calendar. */
export const DAYS_PER_YEAR = 365.25;

/**
 * Split of annual global irradiance between direct beam and diffuse sky.
 * Roughly 60/40 for the sunnier parts of India and southern Europe; cloudier
 * northern climates sit nearer 50/50, which flatters vertical mounting.
 */
export const BEAM_SHARE = 0.6;
export const DIFFUSE_SHARE = 0.4;

/**
 * Annual beam-yield penalty for pointing away from the equator-facing
 * direction, applied to the beam term only (diffuse sky is near-isotropic).
 */
export const ORIENTATIONS = {
  equatorFacing: { id: "equatorFacing", label: "Facing the equator (south in India)", beamFactor: 1.0 },
  offAxis45: { id: "offAxis45", label: "45° off — south-east or south-west", beamFactor: 0.96 },
  eastWest: { id: "eastWest", label: "Due east or due west", beamFactor: 0.83 },
  offAxis135: { id: "offAxis135", label: "135° off — north-east or north-west", beamFactor: 0.62 },
  poleFacing: { id: "poleFacing", label: "Facing away from the equator (north in India)", beamFactor: 0.5 },
};

/** Common balcony mounting geometries. */
export const MOUNTING_PRESETS = [
  { id: "vertical", label: "Flat against the railing", tiltDeg: 90 },
  { id: "angled45", label: "Angled out on a bracket", tiltDeg: 45 },
  { id: "angled30", label: "Well-angled bracket", tiltDeg: 30 },
  { id: "flat", label: "Laid nearly flat on the floor", tiltDeg: 10 },
];

/**
 * Annual energy clipped when the panels are oversized relative to the
 * micro-inverter, indexed by the effective DC:AC ratio. Interpolated linearly.
 * A little oversizing is free; a lot is not.
 */
export const CLIPPING_CURVE = [
  { ratio: 1.0, lossPct: 0 },
  { ratio: 1.15, lossPct: 0.3 },
  { ratio: 1.3, lossPct: 1.5 },
  { ratio: 1.5, lossPct: 4 },
  { ratio: 1.75, lossPct: 8 },
  { ratio: 2.0, lossPct: 12 },
  { ratio: 2.5, lossPct: 20 },
  { ratio: 3.0, lossPct: 27 },
];

/** Panels lose roughly 0.5% of output a year under standard warranties. */
export const ANNUAL_DEGRADATION = 0.005;

/** Horizon over which the lifetime savings figure is summed. */
export const SAVINGS_HORIZON_YEARS = 10;

const toRad = (deg) => (deg * Math.PI) / 180;

/** Sky view factor of a surface tilted `tiltDeg` from horizontal. */
export function skyViewFactor(tiltDeg) {
  return (1 + Math.cos(toRad(tiltDeg))) / 2;
}

/**
 * Yield of a surface at `tiltDeg` and the given orientation, relative to the
 * same panels at the latitude-optimal tilt facing the equator. Returns 0..~1.
 */
export function relativeYield(latitudeDeg, tiltDeg, beamFactor) {
  const beam = Math.max(0, Math.cos(toRad(Math.abs(latitudeDeg - tiltDeg)))) * beamFactor;
  const diffuse = skyViewFactor(tiltDeg);
  const refDiffuse = skyViewFactor(latitudeDeg);
  const numerator = BEAM_SHARE * beam + DIFFUSE_SHARE * diffuse;
  const denominator = BEAM_SHARE * 1 + DIFFUSE_SHARE * refDiffuse;
  if (!(denominator > 0)) return 0;
  return numerator / denominator;
}

/** Linear interpolation into CLIPPING_CURVE. */
export function clippingLossPct(dcAcRatio) {
  if (dcAcRatio <= CLIPPING_CURVE[0].ratio) return 0;
  const last = CLIPPING_CURVE[CLIPPING_CURVE.length - 1];
  if (dcAcRatio >= last.ratio) return last.lossPct;
  for (let i = 1; i < CLIPPING_CURVE.length; i += 1) {
    const a = CLIPPING_CURVE[i - 1];
    const b = CLIPPING_CURVE[i];
    if (dcAcRatio <= b.ratio) {
      const t = (dcAcRatio - a.ratio) / (b.ratio - a.ratio);
      return a.lossPct + t * (b.lossPct - a.lossPct);
    }
  }
  return last.lossPct;
}

/**
 * Sum of a geometric series: savings in year 1 plus each later year degraded.
 * S x (1 - (1-d)^n) / d
 */
export function degradedTotal(firstYear, years, degradation) {
  if (degradation <= 0) return firstYear * years;
  return (firstYear * (1 - Math.pow(1 - degradation, years))) / degradation;
}

/**
 * @param {object} input
 * @param {number} input.panelCount
 * @param {number} input.panelWatt        panel rating, Wp
 * @param {number} input.inverterWatt     micro-inverter AC limit, W
 * @param {number} input.latitudeDeg      site latitude, degrees (use the absolute value)
 * @param {number} input.tiltDeg          panel tilt from horizontal, degrees
 * @param {string} input.orientation      key of ORIENTATIONS
 * @param {number} input.peakSunHours     peak sun hours per day at optimal tilt
 * @param {number} input.performanceRatio 0-1
 * @param {number} input.shadingLossPct   extra loss from the railing, walls and neighbours
 * @param {number} input.selfConsumedPct  share of output used in the home immediately
 * @param {number} input.tariff           grid tariff per kWh
 * @param {number} input.feedInRate       what an exported unit earns (often 0)
 * @param {number} input.kitCost          installed cost of the kit
 */
export function computeBalconySolar({
  panelCount,
  panelWatt,
  inverterWatt,
  latitudeDeg,
  tiltDeg,
  orientation = "equatorFacing",
  peakSunHours,
  performanceRatio = 0.8,
  shadingLossPct = 0,
  selfConsumedPct = 70,
  tariff = 0,
  feedInRate = 0,
  kitCost = 0,
} = {}) {
  const numbers = {
    panelCount,
    panelWatt,
    inverterWatt,
    latitudeDeg,
    tiltDeg,
    peakSunHours,
    performanceRatio,
    shadingLossPct,
    selfConsumedPct,
    tariff,
    feedInRate,
    kitCost,
  };
  for (const [key, value] of Object.entries(numbers)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return { error: `Enter a valid number for ${key}.` };
    }
  }

  const orient = ORIENTATIONS[orientation];
  if (!orient) return { error: "Choose which way the balcony faces." };

  if (!(panelCount > 0)) return { error: "You need at least one panel." };
  if (panelCount > 12) return { error: "A plug-in balcony kit is not the right product above 12 panels." };
  if (!(panelWatt > 0)) return { error: "Panel wattage must be greater than zero." };
  if (!(inverterWatt > 0)) return { error: "Micro-inverter output must be greater than zero." };
  if (latitudeDeg < 0 || latitudeDeg > 66) {
    return { error: "Enter latitude as a value between 0° and 66° (drop the N or S)." };
  }
  if (tiltDeg < 0 || tiltDeg > 90) return { error: "Tilt must be between 0° (flat) and 90° (vertical)." };
  if (peakSunHours <= 0 || peakSunHours > 12) {
    return { error: "Peak sun hours per day should be between 0 and 12." };
  }
  if (performanceRatio <= 0 || performanceRatio > 1) {
    return { error: "Performance ratio must be between 0 and 1 (0.80 is typical)." };
  }
  if (shadingLossPct < 0 || shadingLossPct >= 100) {
    return { error: "Shading loss must be between 0% and 99%." };
  }
  if (selfConsumedPct < 0 || selfConsumedPct > 100) {
    return { error: "Self-consumed share must be between 0% and 100%." };
  }
  if (tariff < 0 || feedInRate < 0 || kitCost < 0) {
    return { error: "Tariff, feed-in rate and kit cost cannot be negative." };
  }

  const dcWatt = panelCount * panelWatt;
  const dcKw = dcWatt / 1000;

  const orientationFactor = relativeYield(latitudeDeg, tiltDeg, orient.beamFactor);
  const optimalTiltDeg = latitudeDeg;

  // What the same panels would make on a well-aimed roof.
  const referenceAnnualKwh = dcKw * peakSunHours * DAYS_PER_YEAR * performanceRatio;
  const afterOrientationKwh = referenceAnnualKwh * orientationFactor;
  const afterShadingKwh = afterOrientationKwh * (1 - shadingLossPct / 100);

  // Vertical mounting flattens the midday peak, so it clips far less than the
  // raw DC:AC ratio suggests. Scale the ratio by the orientation factor.
  const rawDcAcRatio = dcWatt / inverterWatt;
  const effectiveDcAcRatio = rawDcAcRatio * orientationFactor;
  const clipPct = clippingLossPct(effectiveDcAcRatio);
  const annualKwh = afterShadingKwh * (1 - clipPct / 100);

  const dailyKwh = annualKwh / DAYS_PER_YEAR;
  const monthlyKwh = annualKwh / 12;
  const specificYield = dcKw > 0 ? annualKwh / dcKw : 0;

  const selfKwh = annualKwh * (selfConsumedPct / 100);
  const exportKwh = annualKwh - selfKwh;
  const billSavings = selfKwh * tariff;
  const exportEarnings = exportKwh * feedInRate;
  const annualSavings = billSavings + exportEarnings;
  const monthlySavings = annualSavings / 12;

  const paybackYears = kitCost > 0 && annualSavings > 0 ? kitCost / annualSavings : null;
  const horizonSavings = degradedTotal(annualSavings, SAVINGS_HORIZON_YEARS, ANNUAL_DEGRADATION);
  const netOverHorizon = horizonSavings - kitCost;

  return {
    dcWatt,
    dcKw,
    optimalTiltDeg,
    orientationFactor,
    orientationLabel: orient.label,
    referenceAnnualKwh,
    afterOrientationKwh,
    afterShadingKwh,
    rawDcAcRatio,
    effectiveDcAcRatio,
    clipPct,
    annualKwh,
    dailyKwh,
    monthlyKwh,
    specificYield,
    selfKwh,
    exportKwh,
    billSavings,
    exportEarnings,
    annualSavings,
    monthlySavings,
    paybackYears,
    horizonYears: SAVINGS_HORIZON_YEARS,
    horizonSavings,
    netOverHorizon,
    tiltIsCostly: orientationFactor < 0.7,
    inverterUndersized: rawDcAcRatio > 1.35,
  };
}
