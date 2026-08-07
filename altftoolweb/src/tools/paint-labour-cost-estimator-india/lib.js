/**
 * Painter LABOUR cost estimator for Indian homes.
 *
 * Everything in this module is labour only: the painter's charge for surface
 * preparation and application. Paint, putty, primer and consumables are NOT
 * included, because contractors in India quote "labour rate" and "material
 * rate" separately.
 *
 * The base rates below are the commonly quoted labour-only bands for a
 * Tier-1 Indian city (a painting contractor's per-sqft-of-painted-surface
 * quote for 1 primer + 2 finish coats). They are indicative market bands,
 * not statutory rates. Statutory minimum wages for a skilled painter are set
 * per state by the respective Labour Department and are quoted per day, not
 * per sqft, so they cannot be used directly for a per-sqft estimate.
 */

/** Sanity ceiling so an absurd input cannot produce a meaningless number. */
export const MAX_PAINTABLE_AREA_SQFT = 1_000_000;

/** Sanity ceiling on the wall-area multiplier (see DEFAULT_WALL_AREA_FACTOR). */
export const MAX_WALL_AREA_FACTOR = 8;

/**
 * Rule of thumb used by Indian painting contractors: paintable WALL area of a
 * home is roughly 3 to 3.5 times its carpet area for a standard 10 ft ceiling.
 * Ceiling area is counted separately (see CEILING_AREA_FACTOR).
 */
export const DEFAULT_WALL_AREA_FACTOR = 3.2;

/** A flat ceiling has the same plan area as the floor it covers. */
export const CEILING_AREA_FACTOR = 1;

/**
 * Finish grades. `rate` = INR per sqft of painted surface, labour only,
 * Tier-1 city baseline. `outputSqftPerDay` = surface one painter finishes in
 * an 8-hour day at that grade, used only for the schedule estimate.
 */
export const FINISH_GRADES = {
  distemper: {
    label: "Distemper / whitewash",
    rate: 5,
    outputSqftPerDay: 350,
    note: "Cheapest labour band; chalky finish, not washable.",
  },
  emulsion_repaint: {
    label: "Emulsion repaint (patch, 1 primer + 2 coats)",
    rate: 9,
    outputSqftPerDay: 275,
    note: "Existing painted walls, only patch putty where needed.",
  },
  premium_emulsion: {
    label: "Premium washable emulsion",
    rate: 12,
    outputSqftPerDay: 250,
    note: "Full sanding, 1 primer + 2 coats of a washable emulsion.",
  },
  luxury_emulsion: {
    label: "Luxury / high-sheen emulsion",
    rate: 16,
    outputSqftPerDay: 220,
    note: "Extra sanding passes and tighter finish tolerance.",
  },
  texture: {
    label: "Texture / designer finish",
    rate: 38,
    outputSqftPerDay: 90,
    note: "Trowel, stencil or roller texture; priced per sqft of textured area.",
  },
};

/**
 * City tier multipliers on the Tier-1 baseline rate, reflecting local painter
 * day-wage differences across Indian cities.
 */
export const CITY_TIERS = {
  metro: { label: "Metro (Mumbai, Delhi NCR, Bengaluru)", factor: 1.25 },
  tier1: { label: "Tier 1 city (Pune, Hyderabad, Chennai, Kolkata)", factor: 1 },
  tier2: { label: "Tier 2 city (Indore, Kochi, Lucknow, Nagpur)", factor: 0.85 },
  tier3: { label: "Tier 3 city / small town", factor: 0.72 },
};

/**
 * Wall putty is charged as a separate labour line: two coats plus sanding
 * over the full wall. Tier-1 baseline, INR per sqft, labour only.
 */
export const PUTTY_LABOUR_RATE_PER_SQFT = 8;

/** Putty work roughly halves how much surface a painter closes out per day. */
export const PUTTY_OUTPUT_FACTOR = 0.6;

/**
 * Above this ceiling height a painter needs staging/scaffolding rather than a
 * step ladder, and contractors add a surcharge on the whole labour bill.
 */
export const HEIGHT_SURCHARGE_THRESHOLD_FT = 10;
export const HEIGHT_SURCHARGE_RATE = 0.15;

/**
 * Erecting and striking staging/scaffolding takes a fixed chunk of calendar
 * time that painting output rates don't cover. Added once per job (not per
 * painter) when staging is needed.
 */
export const STAGING_SETUP_DAYS = 1;

/** Typical crew size assumed when the caller does not pass one. */
export const DEFAULT_CREW_SIZE = 2;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Estimate a painter's labour bill.
 *
 * @param {object} input
 * @param {number} input.carpetAreaSqft   Carpet (usable floor) area of the home.
 * @param {number} [input.wallAreaFactor] Wall area multiplier on carpet area.
 * @param {boolean} [input.includeCeiling] Add the ceiling to the painted area.
 * @param {string} [input.finishGrade]    Key of FINISH_GRADES.
 * @param {string} [input.cityTier]       Key of CITY_TIERS.
 * @param {boolean} [input.withPutty]     Full-wall putty applied as a separate line.
 * @param {number} [input.ceilingHeightFt] Floor-to-ceiling height, feet.
 * @param {number} [input.crewSize]       Painters working simultaneously.
 * @returns {object} Breakdown, or { error } for invalid input.
 */
export function estimatePaintLabour({
  carpetAreaSqft,
  wallAreaFactor = DEFAULT_WALL_AREA_FACTOR,
  includeCeiling = true,
  finishGrade = "premium_emulsion",
  cityTier = "tier1",
  withPutty = false,
  ceilingHeightFt = 10,
  crewSize = DEFAULT_CREW_SIZE,
} = {}) {
  if (!isNum(carpetAreaSqft)) return { error: "Enter the carpet area as a number." };
  if (carpetAreaSqft <= 0) return { error: "Carpet area must be greater than zero." };
  if (!isNum(wallAreaFactor) || wallAreaFactor <= 0) {
    return { error: "Wall area factor must be greater than zero." };
  }
  if (wallAreaFactor > MAX_WALL_AREA_FACTOR) {
    return { error: `Wall area factor above ${MAX_WALL_AREA_FACTOR} is not realistic for a home.` };
  }
  if (!isNum(ceilingHeightFt) || ceilingHeightFt <= 0) {
    return { error: "Ceiling height must be greater than zero." };
  }
  if (!isNum(crewSize) || crewSize < 1) {
    return { error: "Crew size must be at least one painter." };
  }

  const grade = FINISH_GRADES[finishGrade];
  if (!grade) return { error: "Choose a valid finish grade." };
  const tier = CITY_TIERS[cityTier];
  if (!tier) return { error: "Choose a valid city tier." };

  const wallArea = carpetAreaSqft * wallAreaFactor;
  const ceilingArea = includeCeiling ? carpetAreaSqft * CEILING_AREA_FACTOR : 0;
  const paintableArea = wallArea + ceilingArea;

  if (paintableArea > MAX_PAINTABLE_AREA_SQFT) {
    return {
      error: `Painted area works out to over ${MAX_PAINTABLE_AREA_SQFT.toLocaleString("en-IN")} sqft — check the carpet area.`,
    };
  }

  const finishRate = round2(grade.rate * tier.factor);
  const puttyRate = withPutty ? round2(PUTTY_LABOUR_RATE_PER_SQFT * tier.factor) : 0;
  const ratePerSqft = round2(finishRate + puttyRate);

  const finishCost = paintableArea * finishRate;
  const puttyCost = paintableArea * puttyRate;
  const subtotal = finishCost + puttyCost;

  const needsStaging = ceilingHeightFt > HEIGHT_SURCHARGE_THRESHOLD_FT;
  const heightSurcharge = needsStaging ? subtotal * HEIGHT_SURCHARGE_RATE : 0;
  const totalLabourCost = subtotal + heightSurcharge;

  const dailyOutput = grade.outputSqftPerDay * (withPutty ? PUTTY_OUTPUT_FACTOR : 1);
  const stagingSetupDays = needsStaging ? STAGING_SETUP_DAYS : 0;
  // Setup is whole-crew work, so it adds `stagingSetupDays` to the calendar
  // schedule regardless of crew size: contribute crewSize worth of
  // painter-days so dividing back by crewSize recovers that same figure.
  const painterDays = paintableArea / dailyOutput + stagingSetupDays * crewSize;
  const calendarDays = painterDays / crewSize;

  return {
    wallArea: round2(wallArea),
    ceilingArea: round2(ceilingArea),
    paintableArea: round2(paintableArea),
    finishRate,
    puttyRate,
    ratePerSqft,
    finishCost: Math.round(finishCost),
    puttyCost: Math.round(puttyCost),
    subtotal: Math.round(subtotal),
    heightSurcharge: Math.round(heightSurcharge),
    needsStaging,
    totalLabourCost: Math.round(totalLabourCost),
    effectiveRatePerSqft: round2(totalLabourCost / paintableArea),
    costPerCarpetSqft: round2(totalLabourCost / carpetAreaSqft),
    painterDays: round2(painterDays),
    calendarDays: round2(calendarDays),
    gradeLabel: grade.label,
    gradeNote: grade.note,
    tierLabel: tier.label,
  };
}
