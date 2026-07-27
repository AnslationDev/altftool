/**
 * Insured Declared Value (IDV) for a private motor own-damage policy in India.
 *
 * Rules encoded here come from the India Motor Tariff, which still governs how
 * IDV and claim depreciation are fixed even after the own-damage rate was
 * de-tariffed:
 *  - IDV is the manufacturer's listed selling price of the vehicle for the make
 *    and model, LESS depreciation for age, and it is the sum insured for the
 *    own-damage section. Registration charges, road tax and the insurance
 *    premium itself are excluded from the listed price.
 *  - Accessories fitted to the vehicle but not included in the listed price are
 *    valued separately, and the same depreciation is applied to them.
 *  - Depreciation on the listed price for fixing IDV:
 *      not exceeding 6 months .......... 5%
 *      over 6 months to 1 year ......... 15%
 *      over 1 year to 2 years .......... 20%
 *      over 2 years to 3 years ......... 30%
 *      over 3 years to 4 years ......... 40%
 *      over 4 years to 5 years ......... 50%
 *      over 5 years .................... mutually agreed between insurer and
 *                                        insured, based on the vehicle's
 *                                        condition and a survey.
 *  - IDV is treated as the market value for a total loss, constructive total
 *    loss or theft claim.
 *  - Where the IDV declared is lower than the value fixed under these rules, a
 *    partial-loss claim is settled proportionately (the condition of average).
 *  - Depreciation on REPLACED PARTS in a partial-loss claim is separate from IDV
 *    depreciation and is fixed by the tariff at 50% for rubber, nylon, plastic
 *    parts, tyres, tubes, batteries and airbags, 30% for fibre glass components,
 *    nil for glass, and a rate rising with vehicle age for all other parts.
 */

/** IDV depreciation slabs. `maxMonths` is the upper bound of each band. */
export const IDV_DEPRECIATION_SLABS = [
  { maxMonths: 6, rate: 5, label: "Not exceeding 6 months" },
  { maxMonths: 12, rate: 15, label: "Over 6 months to 1 year" },
  { maxMonths: 24, rate: 20, label: "Over 1 year to 2 years" },
  { maxMonths: 36, rate: 30, label: "Over 2 years to 3 years" },
  { maxMonths: 48, rate: 40, label: "Over 3 years to 4 years" },
  { maxMonths: 60, rate: 50, label: "Over 4 years to 5 years" },
];

/** Beyond five years the tariff leaves IDV to be mutually agreed. */
export const MUTUALLY_AGREED_AFTER_MONTHS = 60;

/**
 * Indicative continuation used only to give a starting figure for a vehicle over
 * five years old. This is a common market practice, NOT a tariff rule — the
 * actual IDV must be agreed with the insurer after inspection.
 */
export const INDICATIVE_EXTRA_DEPRECIATION_PER_YEAR = 10;
export const INDICATIVE_MAX_DEPRECIATION = 90;

/** Tariff depreciation on replaced parts in a partial-loss claim (%). */
export const PARTS_DEPRECIATION = {
  rubberPlasticTyresBatteries: 50,
  fibreGlass: 30,
  glass: 0,
};

/** Depreciation on all other replaced parts, by vehicle age. */
export const OTHER_PARTS_DEPRECIATION = [
  { maxMonths: 6, rate: 0, label: "Not exceeding 6 months" },
  { maxMonths: 12, rate: 5, label: "Over 6 months to 1 year" },
  { maxMonths: 24, rate: 10, label: "Over 1 year to 2 years" },
  { maxMonths: 36, rate: 15, label: "Over 2 years to 3 years" },
  { maxMonths: 48, rate: 25, label: "Over 3 years to 4 years" },
  { maxMonths: 60, rate: 35, label: "Over 4 years to 5 years" },
  { maxMonths: 120, rate: 40, label: "Over 5 years to 10 years" },
  { maxMonths: Infinity, rate: 50, label: "Over 10 years" },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * IDV depreciation rate for a vehicle of a given age.
 *
 * @param {number} ageMonths completed age in months
 * @returns {{ rate: number, band: string, requiresAgreement: boolean, indicative: boolean }}
 */
export function idvDepreciationForAge(ageMonths) {
  if (!isNum(ageMonths) || ageMonths < 0) {
    return { rate: 0, band: "", requiresAgreement: false, indicative: false };
  }
  const slab = IDV_DEPRECIATION_SLABS.find((item) => ageMonths <= item.maxMonths);
  if (slab) {
    return { rate: slab.rate, band: slab.label, requiresAgreement: false, indicative: false };
  }
  const extraYears = Math.ceil((ageMonths - MUTUALLY_AGREED_AFTER_MONTHS) / 12);
  const rate = Math.min(
    INDICATIVE_MAX_DEPRECIATION,
    50 + extraYears * INDICATIVE_EXTRA_DEPRECIATION_PER_YEAR,
  );
  return {
    rate,
    band: "Over 5 years — mutually agreed with the insurer",
    requiresAgreement: true,
    indicative: true,
  };
}

/** Depreciation applied to replaced parts other than rubber, plastic and glass. */
export function partsDepreciationForAge(ageMonths) {
  if (!isNum(ageMonths) || ageMonths < 0) return { rate: 0, band: "" };
  const slab = OTHER_PARTS_DEPRECIATION.find((item) => ageMonths <= item.maxMonths);
  return { rate: slab.rate, band: slab.label };
}

/**
 * Full IDV calculation.
 *
 * @param {object} input
 * @param {number} input.exShowroomPrice manufacturer's listed selling price
 * @param {number} input.ageMonths completed age of the vehicle in months
 * @param {number} [input.accessoriesValue] listed price of accessories not in the
 *   vehicle's own listed price
 * @param {number} [input.declaredIdv] IDV you plan to declare, 0 to skip the check
 * @param {number} [input.claimAmount] a partial-loss claim to test under-insurance
 * @param {number} [input.odPremiumRate] own-damage premium rate as a % of IDV
 * @returns {object} result, or { error }
 */
export function computeIdv({
  exShowroomPrice,
  ageMonths,
  accessoriesValue = 0,
  declaredIdv = 0,
  claimAmount = 0,
  odPremiumRate = 0,
} = {}) {
  if (!isNum(exShowroomPrice) || exShowroomPrice <= 0) {
    return { error: "Enter the ex-showroom listed price, greater than zero." };
  }
  if (exShowroomPrice > 1e9) {
    return { error: "Enter an ex-showroom price below ₹100 crore." };
  }
  if (!isNum(ageMonths) || ageMonths < 0) {
    return { error: "Enter the vehicle's age in completed months." };
  }
  if (ageMonths > 600) {
    return { error: "Enter an age of 600 months (50 years) or less." };
  }
  if (!isNum(accessoriesValue) || accessoriesValue < 0) {
    return { error: "The value of accessories cannot be negative." };
  }
  if (!isNum(declaredIdv) || declaredIdv < 0) {
    return { error: "The IDV you declare cannot be negative." };
  }
  if (!isNum(claimAmount) || claimAmount < 0) {
    return { error: "A claim amount cannot be negative." };
  }
  if (!isNum(odPremiumRate) || odPremiumRate < 0 || odPremiumRate > 20) {
    return { error: "Enter an own-damage premium rate between 0% and 20% of IDV." };
  }

  const age = Math.round(ageMonths);
  const { rate, band, requiresAgreement, indicative } = idvDepreciationForAge(age);

  const vehicleIdv = exShowroomPrice * (1 - rate / 100);
  const accessoriesIdv = accessoriesValue * (1 - rate / 100);
  const totalIdv = vehicleIdv + accessoriesIdv;
  const depreciationAmount = exShowroomPrice + accessoriesValue - totalIdv;

  const declared = declaredIdv > 0 ? declaredIdv : totalIdv;
  const underInsured = declared < totalIdv;
  const shortfallRatio = totalIdv > 0 ? declared / totalIdv : 1;
  const claimPayable = underInsured ? claimAmount * shortfallRatio : claimAmount;
  const claimShortfall = claimAmount - claimPayable;

  const odPremiumAtCorrect = (totalIdv * odPremiumRate) / 100;
  const odPremiumAtDeclared = (declared * odPremiumRate) / 100;
  const premiumSaved = odPremiumAtCorrect - odPremiumAtDeclared;

  const parts = partsDepreciationForAge(age);

  return {
    exShowroomPrice,
    ageMonths: age,
    ageYears: age / 12,
    depreciationRate: rate,
    depreciationBand: band,
    requiresAgreement,
    indicative,
    accessoriesValue,
    vehicleIdv,
    accessoriesIdv,
    totalIdv,
    depreciationAmount,
    declaredIdv: declared,
    usingOwnDeclaration: declaredIdv > 0,
    underInsured,
    underInsuredBy: underInsured ? totalIdv - declared : 0,
    settlementRatio: shortfallRatio * 100,
    claimAmount,
    claimPayable,
    claimShortfall,
    totalLossPayout: declared,
    odPremiumRate,
    odPremiumAtCorrect,
    odPremiumAtDeclared,
    premiumSaved,
    partsDepreciationRate: parts.rate,
    partsDepreciationBand: parts.band,
    rubberPlasticRate: PARTS_DEPRECIATION.rubberPlasticTyresBatteries,
    fibreGlassRate: PARTS_DEPRECIATION.fibreGlass,
    glassRate: PARTS_DEPRECIATION.glass,
  };
}
