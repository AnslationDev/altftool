/**
 * Alloy vs steel wheel comparison.
 *
 * Physics and rules used:
 *  - A wheel is rotating unsprung mass. During acceleration its rotational
 *    inertia acts like extra mass, so the effective mass of a wheel-and-tyre
 *    assembly is m x (1 + I / (m r^2)). For a road wheel with a tyre the mass
 *    sits close to the rim, giving a radius-of-gyration ratio of about 0.6.
 *  - Fuel economy versus vehicle mass: the widely used US EPA / NHTSA
 *    mass-reduction rule of thumb is that a 10% cut in vehicle mass improves
 *    fuel economy by roughly 6-7%, i.e. a sensitivity of about 0.66.
 *  - Payback is simply the price premium divided by the annual fuel saving; it
 *    ignores resale value, kerb-rash repair cost and corrosion.
 */

/** I / (m r^2) for a typical wheel-and-tyre assembly (mass concentrated at the rim). */
export const ROTATIONAL_INERTIA_FACTOR = 0.6;
/** Fuel-economy gain per unit of mass reduction (EPA/NHTSA: ~6.6% per 10% mass cut). */
export const FUEL_ECONOMY_SENSITIVITY = 0.66;
/** Wheel counts a road car can be specified with (4 road wheels, or 5 with a matching spare). */
export const WHEEL_COUNTS = [4, 5];
/** Sanity ceiling for one passenger-car wheel in kilograms. */
export const MAX_WHEEL_WEIGHT_KG = 40;
/** Sanity ceiling for kerb weight of a passenger vehicle in kilograms. */
export const MAX_KERB_WEIGHT_KG = 5000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round = (value, places = 2) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/**
 * Compare a steel wheel set against an alloy wheel set.
 * Every input is a plain number so the function stays pure.
 */
export function compareWheels({
  kerbWeightKg = 1100,
  wheelCount = 4,
  steelWeightKg = 8.5,
  alloyWeightKg = 7,
  steelPrice = 2500,
  alloyPrice = 6000,
  annualKm = 12000,
  mileageKmPerL = 18,
  fuelPricePerL = 100,
} = {}) {
  const numbers = [
    kerbWeightKg,
    wheelCount,
    steelWeightKg,
    alloyWeightKg,
    steelPrice,
    alloyPrice,
    annualKm,
    mileageKmPerL,
    fuelPricePerL,
  ];
  if (!numbers.every(isNum)) return { error: "Enter valid numbers in every field." };

  const count = Math.round(wheelCount);
  if (!WHEEL_COUNTS.includes(count)) {
    return { error: "Wheel count must be 4 road wheels, or 5 with a matching spare." };
  }
  if (kerbWeightKg <= 0 || kerbWeightKg > MAX_KERB_WEIGHT_KG) {
    return { error: `Kerb weight should be between 1 and ${MAX_KERB_WEIGHT_KG} kg.` };
  }
  if (steelWeightKg <= 0 || alloyWeightKg <= 0) {
    return { error: "Wheel weights must be greater than zero." };
  }
  if (steelWeightKg > MAX_WHEEL_WEIGHT_KG || alloyWeightKg > MAX_WHEEL_WEIGHT_KG) {
    return { error: `A passenger-car wheel weighs well under ${MAX_WHEEL_WEIGHT_KG} kg.` };
  }
  if (steelPrice < 0 || alloyPrice < 0 || fuelPricePerL < 0) {
    return { error: "Prices cannot be negative." };
  }
  if (annualKm < 0) return { error: "Annual running cannot be negative." };
  if (mileageKmPerL <= 0) return { error: "Fuel efficiency must be greater than zero km per litre." };

  const steelSetWeight = steelWeightKg * count;
  const alloySetWeight = alloyWeightKg * count;
  const weightSavedKg = steelSetWeight - alloySetWeight;

  // Rotating mass counts more than dead weight when the car accelerates.
  const effectiveSavedKg = weightSavedKg * (1 + ROTATIONAL_INERTIA_FACTOR);
  const massReductionPct = (effectiveSavedKg / kerbWeightKg) * 100;
  const economyGainPct = massReductionPct * FUEL_ECONOMY_SENSITIVITY;

  const newMileage = mileageKmPerL * (1 + economyGainPct / 100);
  const litresBefore = annualKm / mileageKmPerL;
  const litresAfter = newMileage > 0 ? annualKm / newMileage : litresBefore;
  const litresSaved = litresBefore - litresAfter;
  const annualFuelSaving = litresSaved * fuelPricePerL;

  const steelSetPrice = steelPrice * count;
  const alloySetPrice = alloyPrice * count;
  const pricePremium = alloySetPrice - steelSetPrice;

  let paybackYears = null;
  let paybackNote = "";
  if (pricePremium <= 0) {
    paybackYears = 0;
    paybackNote = "The alloy set costs the same or less, so there is nothing to pay back.";
  } else if (annualFuelSaving < 0) {
    paybackNote =
      "This alloy set is heavier than the steel set, so it costs more to buy and slightly more to run.";
  } else if (annualFuelSaving <= 0.01) {
    paybackNote = "The fuel saving is too small to ever repay the price premium.";
  } else {
    paybackYears = pricePremium / annualFuelSaving;
    if (paybackYears > 200) {
      paybackNote = "The payback runs past the life of the car, so buy alloys for looks, not economy.";
    }
  }

  return {
    wheelCount: count,
    steelSetWeight: round(steelSetWeight),
    alloySetWeight: round(alloySetWeight),
    weightSavedKg: round(weightSavedKg),
    effectiveSavedKg: round(effectiveSavedKg),
    massReductionPct: round(massReductionPct, 3),
    economyGainPct: round(economyGainPct, 3),
    mileageBefore: round(mileageKmPerL, 2),
    mileageAfter: round(newMileage, 2),
    litresBefore: round(litresBefore, 1),
    litresAfter: round(litresAfter, 1),
    litresSaved: round(litresSaved, 2),
    annualFuelSaving: Math.round(annualFuelSaving),
    steelSetPrice: Math.round(steelSetPrice),
    alloySetPrice: Math.round(alloySetPrice),
    pricePremium: Math.round(pricePremium),
    paybackYears: paybackYears === null ? null : round(paybackYears, 1),
    paybackNote,
    lighterSet: weightSavedKg > 0 ? "alloy" : weightSavedKg < 0 ? "steel" : "equal",
  };
}
