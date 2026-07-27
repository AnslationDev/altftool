/**
 * Balcony makeover: what fits, what it weighs and what it costs.
 *
 * Two calculations matter on a balcony and only one of them is obvious.
 *
 * 1. Budget — area times a rate per square metre for the floor finish, plus a
 *    unit cost for each planter, seat and light.
 *
 * 2. Load — a balcony is a cantilever, and everything you add to it is weight
 *    the slab was not necessarily designed for. IS 875 (Part 2) sets the imposed
 *    load for balconies in residential buildings at 3.0 kN/m^2. Wet soil, a
 *    mortar bed under new tiles and a group of people standing at the rail all
 *    draw on that allowance, so the tool converts everything to kg/m^2, then to
 *    kN/m^2 using g = 9.80665, and reports the share of the allowance used.
 *
 * The load figure is a screening check to show whether a plan is comfortably
 * light or heading towards the limit. It is not a structural design: an existing
 * slab's real capacity depends on its reinforcement and condition, so anything
 * near the allowance needs a structural engineer.
 */

/** IS 875 (Part 2) imposed load for balconies in residential buildings. */
export const BALCONY_IMPOSED_LOAD_KN_M2 = 3.0;

/** Standard gravity, for converting kilograms per square metre to kN/m^2. */
export const STANDARD_GRAVITY = 9.80665;

/** 1 square metre = 10.7639 square feet. */
export const SQFT_PER_M2 = 10.7639104;

/**
 * Floor finishes, with the weight each adds per square metre and an indicative
 * supplied-and-laid rate. Rates move with market and city, so both numbers are
 * editable in the tool; the weights are the physical ones.
 */
export const FLOOR_FINISHES = [
  { id: "wpc-deck", label: "WPC / wood deck tiles", loadKgM2: 12, ratePerM2: 3500 },
  { id: "artificial-grass", label: "Artificial grass", loadKgM2: 3, ratePerM2: 1200 },
  { id: "vitrified", label: "Vitrified tile on a mortar bed", loadKgM2: 50, ratePerM2: 1800 },
  { id: "pebbles", label: "Loose pebbles, 40 mm deep", loadKgM2: 64, ratePerM2: 800 },
  { id: "none", label: "Keep the existing floor", loadKgM2: 0, ratePerM2: 0 },
];

/** Wet potting mix weighs roughly 1,400 kg per cubic metre. */
export const WET_SOIL_DENSITY_KG_M3 = 1400;
/** A pot is filled to about 80% of its internal height. */
export const POT_FILL_FRACTION = 0.8;
/** Allowance for the pot itself and the plant in it. */
export const POT_AND_PLANT_KG = 3;

/** Load allowance per seated person: body plus the chair. */
export const PERSON_KG = 70;
export const SEAT_FURNITURE_KG = 15;

/** An outdoor chair is about 550 mm deep and needs roughly 350 mm to sit down and stand up. */
export const SEAT_DEPTH_MM = 550;
export const LEG_SPACE_MM = 350;
export const SEATING_DEPTH_MM = SEAT_DEPTH_MM + LEG_SPACE_MM;
/** Comfortable width per seat along the balcony. */
export const SEAT_WIDTH_MM = 600;
/** Clear width a person needs to walk past an occupied chair. */
export const WALKWAY_MM = 500;

/**
 * Minimum balcony railing height in the National Building Code of India is
 * 1.0 m for residential buildings up to three storeys and 1.2 m above that.
 */
export const RAILING_HEIGHT_LOW_RISE_MM = 1000;
export const RAILING_HEIGHT_HIGH_RISE_MM = 1200;

const MAX_SIDE_M = 20;

export function finishById(id) {
  return FLOOR_FINISHES.find((finish) => finish.id === id) || null;
}

/** Weight of one filled planter, from its internal diameter and height. */
export function planterWeightKg(diameterMm, heightMm) {
  const radiusM = diameterMm / 2000;
  const heightM = heightMm / 1000;
  const soilVolume = Math.PI * radiusM * radiusM * heightM * POT_FILL_FRACTION;
  return soilVolume * WET_SOIL_DENSITY_KG_M3 + POT_AND_PLANT_KG;
}

/**
 * @returns {{error:string}|object}
 */
export function planBalcony({
  lengthM,
  depthM,
  finishId = "wpc-deck",
  finishRatePerM2 = null,
  planters = 0,
  planterDiameterMm = 300,
  planterHeightMm = 300,
  planterCost = 800,
  seats = 0,
  seatCost = 4000,
  lights = 0,
  lightCost = 900,
  storeys = 3,
}) {
  const finish = finishById(finishId);
  if (!finish) return { error: "Choose a floor finish." };

  const rate = finishRatePerM2 === null ? finish.ratePerM2 : finishRatePerM2;
  const numbers = [
    lengthM,
    depthM,
    rate,
    planters,
    planterDiameterMm,
    planterHeightMm,
    planterCost,
    seats,
    seatCost,
    lights,
    lightCost,
    storeys,
  ];
  if (numbers.some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Enter a valid number in every field." };
  }
  if (lengthM <= 0 || depthM <= 0) {
    return { error: "Balcony length and depth must both be greater than zero." };
  }
  if (lengthM > MAX_SIDE_M || depthM > MAX_SIDE_M) {
    return { error: `Each balcony side must be ${MAX_SIDE_M} m or less.` };
  }
  if (rate < 0 || planterCost < 0 || seatCost < 0 || lightCost < 0) {
    return { error: "Rates and unit costs cannot be negative." };
  }
  if (!Number.isInteger(planters) || planters < 0 || planters > 60) {
    return { error: "Planter count must be a whole number between 0 and 60." };
  }
  if (planterDiameterMm <= 0 || planterHeightMm <= 0) {
    return { error: "Planter diameter and height must be greater than zero." };
  }
  if (planterDiameterMm > 1500 || planterHeightMm > 1500) {
    return { error: "Planter dimensions above 1,500 mm are outside this planner's range." };
  }
  if (!Number.isInteger(seats) || seats < 0 || seats > 20) {
    return { error: "Seat count must be a whole number between 0 and 20." };
  }
  if (!Number.isInteger(lights) || lights < 0 || lights > 40) {
    return { error: "Light count must be a whole number between 0 and 40." };
  }
  if (!Number.isInteger(storeys) || storeys < 1 || storeys > 100) {
    return { error: "Number of storeys must be a whole number between 1 and 100." };
  }

  const areaM2 = lengthM * depthM;
  const areaSqft = areaM2 * SQFT_PER_M2;

  // Weight
  const floorLoadKg = finish.loadKgM2 * areaM2;
  const perPlanterKg = planterWeightKg(planterDiameterMm, planterHeightMm);
  const planterLoadKg = perPlanterKg * planters;
  const seatingLoadKg = seats * (PERSON_KG + SEAT_FURNITURE_KG);
  const totalAddedKg = floorLoadKg + planterLoadKg + seatingLoadKg;
  const addedKgPerM2 = totalAddedKg / areaM2;
  const addedKnPerM2 = (addedKgPerM2 * STANDARD_GRAVITY) / 1000;
  const allowanceUsedPercent = (addedKnPerM2 / BALCONY_IMPOSED_LOAD_KN_M2) * 100;

  // Budget
  const floorCost = rate * areaM2;
  const planterTotal = planters * planterCost;
  const seatingTotal = seats * seatCost;
  const lightingTotal = lights * lightCost;
  const totalCost = floorCost + planterTotal + seatingTotal + lightingTotal;

  // Fit
  const seatsThatFit = Math.max(0, Math.floor((lengthM * 1000) / SEAT_WIDTH_MM));
  const depthAfterSeating = depthM * 1000 - SEATING_DEPTH_MM;
  const seatingFitsDepth = depthAfterSeating >= 0;
  const canWalkPastSeating = depthAfterSeating >= WALKWAY_MM;
  const railingHeightMm =
    storeys > 3 ? RAILING_HEIGHT_HIGH_RISE_MM : RAILING_HEIGHT_LOW_RISE_MM;

  let loadVerdict = "Comfortably light for a balcony slab.";
  if (allowanceUsedPercent >= 100) {
    loadVerdict = "Above the code imposed load allowance — reduce the weight or get a structural engineer to check the slab.";
  } else if (allowanceUsedPercent >= 60) {
    loadVerdict = "Using most of the allowance — have a structural engineer confirm the slab before committing.";
  } else if (allowanceUsedPercent >= 35) {
    loadVerdict = "Moderate. Keep heavy planters near the wall rather than at the outer edge.";
  }

  return {
    areaM2,
    areaSqft,
    floorLoadKg,
    perPlanterKg,
    planterLoadKg,
    seatingLoadKg,
    totalAddedKg,
    addedKgPerM2,
    addedKnPerM2,
    allowanceUsedPercent,
    loadVerdict,
    floorCost,
    planterTotal,
    seatingTotal,
    lightingTotal,
    totalCost,
    costPerSqft: areaSqft > 0 ? totalCost / areaSqft : 0,
    seatsThatFit,
    seatingFitsDepth,
    canWalkPastSeating,
    depthAfterSeating,
    seatingDepthMm: SEATING_DEPTH_MM,
    railingHeightMm,
    finishLabel: finish.label,
    finishLoadKgM2: finish.loadKgM2,
  };
}
