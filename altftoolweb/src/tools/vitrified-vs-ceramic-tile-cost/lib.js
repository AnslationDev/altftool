/**
 * Vitrified vs ceramic tile whole-life cost comparison.
 *
 * The headline that dealers quote is the tile price per square foot, but the
 * laid cost also carries labour and bedding material, and the two tile bodies
 * do not last the same number of years. This module compares them on an
 * equivalent-annual-cost basis:
 *
 *   laid cost      = area x (tile + labour + bedding) per sqft
 *   life-cycle cost = laid cost x (horizon / service life)   [prorated]
 *                   + maintenance per sqft-year x area x horizon
 *
 * Prorating the installation to the horizon is the standard way to compare
 * assets with unequal lives; the whole number of re-lays you would physically
 * pay for is reported separately.
 */

export const MAX_AREA_SQFT = 500_000;
export const MAX_HORIZON_YEARS = 100;

/**
 * Technical difference between the two bodies, from the tile classification in
 * IS 15622 / ISO 13006. Water absorption is what actually separates them and
 * drives where each can be used.
 */
export const TILE_FACTS = {
  vitrified: {
    label: "Vitrified",
    absorption: "Under 0.5% water absorption (group BIa) — effectively non-porous",
    body: "Clay, silica, quartz and feldspar fired to vitrification, so the body itself is dense",
    bestFor: "Living areas, high-traffic floors, wet balconies and anywhere stains must not soak in",
  },
  ceramic: {
    label: "Ceramic",
    absorption: "Roughly 3% to 10% water absorption (groups BIIb and BIII) — porous body under the glaze",
    body: "Clay body with a glazed top surface; strength depends on the glaze, not the body",
    bestFor: "Walls, low-traffic rooms and budget floors that are not exposed to standing water",
  },
};

/** Indicative Indian retail defaults, INR per sqft. Editable in the tool. */
export const DEFAULT_VITRIFIED = {
  tilePerSqft: 55,
  labourPerSqft: 25,
  beddingPerSqft: 18,
  lifeYears: 25,
  maintenancePerSqftYear: 2,
};

export const DEFAULT_CERAMIC = {
  tilePerSqft: 35,
  labourPerSqft: 20,
  beddingPerSqft: 12,
  lifeYears: 12,
  maintenancePerSqftYear: 3,
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;

function validateOption(option, name) {
  const { tilePerSqft, labourPerSqft, beddingPerSqft, lifeYears, maintenancePerSqftYear } = option || {};
  const all = [tilePerSqft, labourPerSqft, beddingPerSqft, lifeYears, maintenancePerSqftYear];
  if (all.some((value) => !isNum(value))) return `Enter valid numbers for the ${name} option.`;
  if (tilePerSqft < 0 || labourPerSqft < 0 || beddingPerSqft < 0 || maintenancePerSqftYear < 0) {
    return `${name} costs cannot be negative.`;
  }
  if (lifeYears <= 0) return `${name} service life must be greater than zero years.`;
  if (lifeYears > MAX_HORIZON_YEARS) return `${name} service life above ${MAX_HORIZON_YEARS} years is unrealistic.`;
  return null;
}

function costOneOption(option, areaSqft, horizonYears) {
  const laidPerSqft = option.tilePerSqft + option.labourPerSqft + option.beddingPerSqft;
  const laidCost = laidPerSqft * areaSqft;

  const installCycles = horizonYears / option.lifeYears;
  const proratedInstallCost = laidCost * installCycles;
  const relaysNeeded = Math.max(0, Math.ceil(installCycles) - 1);

  const maintenanceCost = option.maintenancePerSqftYear * areaSqft * horizonYears;
  const lifetimeCost = proratedInstallCost + maintenanceCost;

  return {
    laidPerSqft: round2(laidPerSqft),
    laidCost: Math.round(laidCost),
    lifeYears: option.lifeYears,
    installCycles: round2(installCycles),
    relaysNeeded,
    proratedInstallCost: Math.round(proratedInstallCost),
    maintenanceCost: Math.round(maintenanceCost),
    lifetimeCost: Math.round(lifetimeCost),
    annualCost: Math.round(lifetimeCost / horizonYears),
    costPerSqftPerYear: round2(lifetimeCost / (areaSqft * horizonYears)),
  };
}

/**
 * @param {object} input
 * @param {number} input.areaSqft      Floor area being tiled.
 * @param {number} input.horizonYears  How long you plan to keep the floor.
 * @param {object} [input.vitrified]   Overrides for the vitrified option.
 * @param {object} [input.ceramic]     Overrides for the ceramic option.
 * @returns {object} Both options plus the verdict, or { error }.
 */
export function compareTileCost({
  areaSqft,
  horizonYears,
  vitrified = DEFAULT_VITRIFIED,
  ceramic = DEFAULT_CERAMIC,
} = {}) {
  if (!isNum(areaSqft)) return { error: "Enter the floor area as a number." };
  if (areaSqft <= 0) return { error: "Floor area must be greater than zero." };
  if (areaSqft > MAX_AREA_SQFT) {
    return { error: `Floor area above ${MAX_AREA_SQFT.toLocaleString("en-IN")} sqft is out of range for this tool.` };
  }
  if (!isNum(horizonYears)) return { error: "Enter the planning horizon as a number of years." };
  if (horizonYears <= 0) return { error: "Planning horizon must be at least one year." };
  if (horizonYears > MAX_HORIZON_YEARS) {
    return { error: `Planning horizon above ${MAX_HORIZON_YEARS} years is out of range.` };
  }

  const vitrifiedError = validateOption(vitrified, "Vitrified");
  if (vitrifiedError) return { error: vitrifiedError };
  const ceramicError = validateOption(ceramic, "Ceramic");
  if (ceramicError) return { error: ceramicError };

  const v = costOneOption(vitrified, areaSqft, horizonYears);
  const c = costOneOption(ceramic, areaSqft, horizonYears);

  const upfrontGap = v.laidCost - c.laidCost;
  const lifetimeGap = v.lifetimeCost - c.lifetimeCost;

  let verdict;
  if (lifetimeGap < 0) verdict = "vitrified";
  else if (lifetimeGap > 0) verdict = "ceramic";
  else verdict = "tie";

  /**
   * If vitrified costs more up front but less per year, work out how long you
   * must keep the floor before the cheaper annual cost pays that gap back.
   */
  const annualGap = c.costPerSqftPerYear - v.costPerSqftPerYear;
  const upfrontPerSqftGap = v.laidPerSqft - c.laidPerSqft;
  const breakEvenYears =
    upfrontPerSqftGap > 0 && annualGap > 0 ? round2(upfrontPerSqftGap / annualGap) : null;

  return {
    areaSqft,
    horizonYears,
    vitrified: v,
    ceramic: c,
    upfrontGap: Math.round(upfrontGap),
    lifetimeGap: Math.round(lifetimeGap),
    savings: Math.abs(Math.round(lifetimeGap)),
    verdict,
    breakEvenYears,
  };
}
