/**
 * Insured Declared Value (IDV) for an Indian motor policy.
 *
 * IDV is fixed by GR.8 of the India Motor Tariff: it is the manufacturer's
 * listed selling price of the vehicle (ex-showroom, of that make/model/type) at
 * the start of the policy period, less depreciation from the table below.
 * Registration charges, road tax and the insurance premium are NOT included.
 *
 * Accessories fitted after purchase that are not included in the listed price
 * are valued separately, using the same depreciation percentages.
 *
 * For vehicles more than five years old, and for obsolete models, the tariff
 * does not fix a percentage - IDV is mutually agreed between insurer and
 * insured based on the condition of the vehicle.
 */

/**
 * GR.8 schedule of depreciation for fixing the IDV of the vehicle.
 * `maxMonths` is inclusive: the tariff wording is "exceeding X but not
 * exceeding Y".
 */
export const IDV_DEPRECIATION_SLABS = [
  { maxMonths: 6, rate: 0.05, label: "Not exceeding 6 months" },
  { maxMonths: 12, rate: 0.15, label: "Exceeding 6 months but not exceeding 1 year" },
  { maxMonths: 24, rate: 0.2, label: "Exceeding 1 year but not exceeding 2 years" },
  { maxMonths: 36, rate: 0.3, label: "Exceeding 2 years but not exceeding 3 years" },
  { maxMonths: 48, rate: 0.4, label: "Exceeding 3 years but not exceeding 4 years" },
  { maxMonths: 60, rate: 0.5, label: "Exceeding 4 years but not exceeding 5 years" },
];

export const TARIFF_MAX_MONTHS = 60;

/**
 * Beyond five years the tariff leaves IDV to agreement. Insurers in practice
 * keep stepping the depreciation down; these figures are the usual market
 * starting point for negotiation, not a tariff rule.
 */
export const AGREED_START_RATE = 0.55;
export const AGREED_STEP_PER_YEAR = 0.05;
export const AGREED_MAX_RATE = 0.8;

const round = (value, dp) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

/** Whole months from one ISO date to another; negative if the order is reversed. */
export function monthsBetween(fromIso, toIso) {
  const from = new Date(`${fromIso}T00:00:00Z`);
  const to = new Date(`${toIso}T00:00:00Z`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;

  let months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth());
  if (to.getUTCDate() < from.getUTCDate()) months -= 1;
  return months;
}

/** Tariff depreciation rate for an age in whole months. */
export function depreciationForMonths(ageMonths) {
  const slab = IDV_DEPRECIATION_SLABS.find((item) => ageMonths <= item.maxMonths);
  if (slab) return { rate: slab.rate, label: slab.label, mutuallyAgreed: false };

  const extraYears = Math.ceil((ageMonths - TARIFF_MAX_MONTHS) / 12);
  const indicative = Math.min(
    AGREED_MAX_RATE,
    AGREED_START_RATE + (extraYears - 1) * AGREED_STEP_PER_YEAR,
  );
  return {
    rate: indicative,
    label: "Over 5 years — IDV mutually agreed with the insurer",
    mutuallyAgreed: true,
  };
}

export function ageLabel(ageMonths) {
  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;
  if (years === 0) return `${months} month${months === 1 ? "" : "s"}`;
  if (months === 0) return `${years} year${years === 1 ? "" : "s"}`;
  return `${years} year${years === 1 ? "" : "s"} ${months} month${months === 1 ? "" : "s"}`;
}

/**
 * @param {object} input
 * @param {number} input.exShowroomPrice      manufacturer's listed selling price
 * @param {number} input.accessoriesValue     listed price of extra fitted accessories
 * @param {string} input.registrationDate     ISO date the vehicle was first registered
 * @param {string} input.valuationDate        ISO date the policy period starts
 * @param {number} input.odRatePct            own-damage premium rate from your quote, in %
 * @param {number|null} input.agreedDepreciationPct override for vehicles over five years
 */
export function computeIdv({
  exShowroomPrice,
  accessoriesValue = 0,
  registrationDate,
  valuationDate,
  odRatePct = 0,
  agreedDepreciationPct = null,
}) {
  const price = Number(exShowroomPrice);
  const accessories = Number(accessoriesValue);
  const odRate = Number(odRatePct);

  if (![price, accessories, odRate].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for price, accessories and the own-damage rate." };
  }
  if (price <= 0) return { error: "Ex-showroom price must be greater than zero." };
  if (price > 500000000) return { error: "Ex-showroom price above ₹50 crore is out of range." };
  if (accessories < 0) return { error: "Accessories value cannot be negative." };
  if (odRate < 0 || odRate > 25) {
    return { error: "The own-damage rate should be between 0% and 25% of IDV." };
  }

  const ageMonths = monthsBetween(registrationDate, valuationDate);
  if (ageMonths === null) {
    return { error: "Enter both the registration date and the policy start date." };
  }
  if (ageMonths < 0) {
    return { error: "The policy start date cannot be before the registration date." };
  }
  if (ageMonths > 600) {
    return { error: "Vehicle ages above 50 years are outside this calculator's range." };
  }

  const slab = depreciationForMonths(ageMonths);

  let rate = slab.rate;
  let overridden = false;
  if (slab.mutuallyAgreed && agreedDepreciationPct !== null && agreedDepreciationPct !== "") {
    const custom = Number(agreedDepreciationPct);
    if (!Number.isFinite(custom) || custom < 0 || custom > 95) {
      return { error: "The agreed depreciation should be between 0% and 95%." };
    }
    rate = custom / 100;
    overridden = true;
  }

  // Round the two independent leaf figures first, then derive totalIdv and
  // depreciationAmount FROM those already-rounded values instead of rounding
  // each raw float separately. Otherwise vehicleIdv + accessoriesIdv can be
  // ₹1 off from totalIdv (and listedValue - depreciationAmount off from
  // totalIdv), since Math.round() on independent floats doesn't guarantee
  // the rounded parts still sum to the rounded whole.
  const vehicleIdv = round(price * (1 - rate), 0);
  const accessoriesIdv = round(accessories * (1 - rate), 0);
  const totalIdv = vehicleIdv + accessoriesIdv;
  const listedValue = round(price + accessories, 0);
  const depreciationAmount = listedValue - totalIdv;
  const odPremium = (totalIdv * odRate) / 100;

  return {
    ageMonths,
    ageText: ageLabel(ageMonths),
    slabLabel: slab.label,
    mutuallyAgreed: slab.mutuallyAgreed,
    overridden,
    depreciationRate: round(rate * 100, 2),
    vehicleIdv,
    accessoriesIdv,
    totalIdv,
    depreciationAmount,
    listedValue,
    odPremium: round(odPremium, 0),
    odRatePct: round(odRate, 2),
  };
}
