/**
 * Medication cost per dose, per day and per course.
 *
 * Straight unit-cost arithmetic on the printed pack price (in India the MRP on
 * the strip, which already includes GST):
 *
 *   cost per tablet    = pack price / tablets in the pack
 *   cost per dose      = cost per tablet x tablets per dose
 *   cost per day       = cost per dose x doses per day
 *   tablets for course = tablets per dose x doses per day x days in the course
 *   packs to buy       = ceil(tablets for course / tablets in the pack)
 *   course cost, exact = tablets for course x cost per tablet
 *   course cost, paid  = packs to buy x pack price      (you buy whole packs)
 *   leftover tablets   = packs to buy x tablets in pack - tablets for course
 *
 * Two products are compared on cost per tablet, which is the only fair basis
 * when pack sizes differ:
 *   saving % = (dearer cost per tablet - cheaper cost per tablet) / dearer x 100
 *
 * Month and year projections use 30 and 365 days for a long-term medicine.
 */

/** Days used for the "per month" projection of an ongoing medicine. */
export const DAYS_PER_MONTH = 30;

/** Days used for the "per year" projection of an ongoing medicine. */
export const DAYS_PER_YEAR = 365;

/** Longest course the calculator will accept, in days (about 3 years). */
export const MAX_COURSE_DAYS = 1095;

function validatePack(packPrice, tabletsPerPack, label) {
  if (typeof packPrice !== "number" || !Number.isFinite(packPrice)) {
    return `Enter the ${label} pack price as a number.`;
  }
  if (packPrice < 0) return `The ${label} pack price cannot be negative.`;
  if (typeof tabletsPerPack !== "number" || !Number.isFinite(tabletsPerPack)) {
    return `Enter how many tablets are in the ${label} pack.`;
  }
  if (tabletsPerPack <= 0) return `The ${label} pack must contain at least one tablet.`;
  return null;
}

/**
 * @param {object} input
 * @param {number} input.packPrice       Printed price of one pack (MRP), INR.
 * @param {number} input.tabletsPerPack  Tablets or capsules in that pack.
 * @param {number} input.tabletsPerDose  Tablets taken each time (0.5 for a half).
 * @param {number} input.dosesPerDay     Times a day the medicine is taken.
 * @param {number} input.courseDays      Length of the course in days.
 * @returns {object} costs or { error }
 */
export function computeMedicationCost({
  packPrice,
  tabletsPerPack,
  tabletsPerDose,
  dosesPerDay,
  courseDays,
}) {
  const packError = validatePack(packPrice, tabletsPerPack, "medicine");
  if (packError) return { error: packError };

  if (typeof tabletsPerDose !== "number" || !Number.isFinite(tabletsPerDose)) {
    return { error: "Enter how many tablets you take each time." };
  }
  if (tabletsPerDose <= 0) return { error: "Tablets per dose must be greater than zero." };
  if (typeof dosesPerDay !== "number" || !Number.isFinite(dosesPerDay)) {
    return { error: "Enter how many times a day the medicine is taken." };
  }
  if (dosesPerDay <= 0) return { error: "Doses per day must be greater than zero." };
  if (typeof courseDays !== "number" || !Number.isFinite(courseDays)) {
    return { error: "Enter the length of the course in days." };
  }
  if (courseDays <= 0) return { error: "The course must be at least one day long." };
  if (courseDays > MAX_COURSE_DAYS) {
    return { error: `Enter a course of ${MAX_COURSE_DAYS} days or less.` };
  }

  const costPerTablet = packPrice / tabletsPerPack;
  const costPerDose = costPerTablet * tabletsPerDose;
  const costPerDay = costPerDose * dosesPerDay;
  const tabletsPerDay = tabletsPerDose * dosesPerDay;
  const tabletsForCourse = tabletsPerDay * courseDays;
  const packsNeeded = Math.ceil(tabletsForCourse / tabletsPerPack);
  const courseCostExact = tabletsForCourse * costPerTablet;
  const courseCostPacks = packsNeeded * packPrice;

  return {
    costPerTablet,
    costPerDose,
    costPerDay,
    tabletsPerDay,
    tabletsForCourse,
    packsNeeded,
    courseCostExact,
    courseCostPacks,
    packWastage: courseCostPacks - courseCostExact,
    leftoverTablets: packsNeeded * tabletsPerPack - tabletsForCourse,
    daysPerPack: tabletsPerPack / tabletsPerDay,
    costPerMonth: costPerDay * DAYS_PER_MONTH,
    costPerYear: costPerDay * DAYS_PER_YEAR,
    packPrice,
    tabletsPerPack,
    courseDays,
  };
}

/**
 * Compare two products (usually brand vs generic) on cost per tablet and on
 * what the same course would cost with each.
 *
 * @param {object} input
 * @param {number} input.aPrice     Pack price of option A, INR.
 * @param {number} input.aTablets   Tablets in the option A pack.
 * @param {number} input.bPrice     Pack price of option B, INR.
 * @param {number} input.bTablets   Tablets in the option B pack.
 * @param {number} input.tabletsForCourse Tablets the whole course needs.
 * @returns {object} comparison or { error }
 */
export function comparePacks({ aPrice, aTablets, bPrice, bTablets, tabletsForCourse }) {
  const aError = validatePack(aPrice, aTablets, "first");
  if (aError) return { error: aError };
  const bError = validatePack(bPrice, bTablets, "second");
  if (bError) return { error: bError };
  if (
    typeof tabletsForCourse !== "number" ||
    !Number.isFinite(tabletsForCourse) ||
    tabletsForCourse <= 0
  ) {
    return { error: "The course must need at least one tablet before packs can be compared." };
  }

  const aPerTablet = aPrice / aTablets;
  const bPerTablet = bPrice / bTablets;
  const aCourse = Math.ceil(tabletsForCourse / aTablets) * aPrice;
  const bCourse = Math.ceil(tabletsForCourse / bTablets) * bPrice;
  const dearer = Math.max(aPerTablet, bPerTablet);
  const cheaper = Math.min(aPerTablet, bPerTablet);

  return {
    aPerTablet,
    bPerTablet,
    aCourse,
    bCourse,
    cheaperOption: aPerTablet === bPerTablet ? "same" : aPerTablet < bPerTablet ? "a" : "b",
    savingPerTablet: dearer - cheaper,
    savingPercent: dearer > 0 ? ((dearer - cheaper) / dearer) * 100 : 0,
    savingOnCourse: Math.abs(aCourse - bCourse),
  };
}
