/**
 * Section 80CCD(1B) — the extra NPS deduction.
 *
 * Rules encoded here come from the Income-tax Act, 1961:
 *
 *  - Section 80CCE caps the AGGREGATE deduction under sections 80C, 80CCC and
 *    80CCD(1) at Rs 1,50,000 for a financial year.
 *  - Section 80CCD(1) allows a deduction for the assessee's OWN contribution to
 *    the National Pension System (Tier-I), limited to 10% of salary (basic pay
 *    plus dearness allowance) for a salaried assessee, and 20% of gross total
 *    income for any other assessee. This deduction sits INSIDE the 80CCE cap.
 *  - Section 80CCD(1B) allows an ADDITIONAL deduction of up to Rs 50,000 for NPS
 *    Tier-I contributions that have not been claimed under 80CCD(1). The proviso
 *    to 80CCE expressly keeps 80CCD(1B) outside the Rs 1,50,000 aggregate limit,
 *    and the 10%/20% ceiling of 80CCD(1) does not apply to it.
 *  - Section 80CCD(2) covers the EMPLOYER's contribution and is a separate
 *    deduction; it is not modelled by this calculator.
 *  - Section 115BAC (the default "new" regime) withdraws Chapter VI-A deductions
 *    other than 80CCD(2), 80CCH and 80JJAA, so 80CCD(1B) is available only to a
 *    taxpayer who opts out of 115BAC into the old regime.
 *  - Health and education cess is 4% of income tax (Finance Act rates).
 */

/** Aggregate ceiling of section 80CCE covering 80C + 80CCC + 80CCD(1). */
export const SECTION_80CCE_LIMIT = 150000;

/** Extra deduction ceiling of section 80CCD(1B). */
export const SECTION_80CCD_1B_LIMIT = 50000;

/** 80CCD(1) ceiling for a salaried assessee: 10% of salary (basic + DA). */
export const SALARIED_80CCD1_RATE = 0.1;

/** 80CCD(1) ceiling for a non-salaried assessee: 20% of gross total income. */
export const SELF_EMPLOYED_80CCD1_RATE = 0.2;

/** Health and education cess levied on the income tax amount. */
export const HEALTH_EDUCATION_CESS_RATE = 0.04;

/** Marginal slab rates available under the old regime (surcharge ignored). */
export const OLD_REGIME_MARGINAL_RATES = [0, 5, 20, 30];

/** Upper sanity bound so absurd amounts cannot produce meaningless output. */
const MAX_AMOUNT = 1e9;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * 80CCD(1) ceiling in rupees for the chosen employment type.
 *
 * @param {"salaried"|"self-employed"} employmentType
 * @param {number} salaryBasicDa annual basic pay + dearness allowance
 * @param {number} grossTotalIncome annual gross total income
 * @returns {number} the rupee ceiling on the 80CCD(1) deduction
 */
export function section80ccd1Ceiling(employmentType, salaryBasicDa, grossTotalIncome) {
  if (employmentType === "self-employed") {
    return Math.max(0, grossTotalIncome) * SELF_EMPLOYED_80CCD1_RATE;
  }
  return Math.max(0, salaryBasicDa) * SALARIED_80CCD1_RATE;
}

/**
 * Split an NPS contribution between 80CCD(1B) and 80CCD(1) and report the extra
 * deduction that 80CCD(1B) actually buys.
 *
 * Allocation order: fill 80CCD(1B) first, then push the balance into 80CCD(1).
 * That order is never worse, because 80CCD(1B) is free of both the Rs 1,50,000
 * aggregate limit and the 10%/20% salary ceiling, while 80CCD(1) is subject to
 * both.
 *
 * @param {object} input
 * @param {"salaried"|"self-employed"} [input.employmentType]
 * @param {number} [input.salaryBasicDa] annual basic + DA (salaried only)
 * @param {number} [input.grossTotalIncome] annual gross total income
 * @param {number} [input.npsContribution] your own NPS Tier-I contribution
 * @param {number} [input.other80C] 80C/80CCC investments other than NPS
 * @param {number} [input.marginalRatePercent] slab rate applied to the saving
 * @param {"old"|"new"} [input.regime]
 * @returns {object} breakdown, or { error } when the input is unusable
 */
export function computeNps80ccd1b({
  employmentType = "salaried",
  salaryBasicDa = 0,
  grossTotalIncome = 0,
  npsContribution = 0,
  other80C = 0,
  marginalRatePercent = 30,
  regime = "old",
} = {}) {
  if (employmentType !== "salaried" && employmentType !== "self-employed") {
    return { error: "Choose whether you are salaried or self-employed." };
  }
  if (regime !== "old" && regime !== "new") {
    return { error: "Choose either the old tax regime or the new tax regime." };
  }
  const amounts = [salaryBasicDa, grossTotalIncome, npsContribution, other80C];
  if (!amounts.every(isNum) || !isNum(marginalRatePercent)) {
    return { error: "Enter a valid number in every field." };
  }
  if (amounts.some((value) => value < 0) || marginalRatePercent < 0) {
    return { error: "Amounts cannot be negative." };
  }
  if (amounts.some((value) => value > MAX_AMOUNT)) {
    return { error: "Enter amounts below Rs 100 crore." };
  }
  if (marginalRatePercent > 45) {
    return { error: "Enter a marginal tax rate of 45% or less." };
  }
  if (employmentType === "salaried" && salaryBasicDa <= 0) {
    return { error: "Enter your annual basic pay plus dearness allowance." };
  }
  if (employmentType === "self-employed" && grossTotalIncome <= 0) {
    return { error: "Enter your annual gross total income." };
  }

  const ceiling80ccd1 = section80ccd1Ceiling(employmentType, salaryBasicDa, grossTotalIncome);
  const available = regime === "old";

  // With 80CCD(1B): fill the extra Rs 50,000 bucket first.
  const claimed1B = available ? Math.min(SECTION_80CCD_1B_LIMIT, npsContribution) : 0;
  // Under section 115BAC no Chapter VI-A deduction of this kind survives, so
  // every claimed figure collapses to zero rather than showing a phantom number.
  const claimed80ccd1 = available
    ? Math.min(npsContribution - claimed1B, ceiling80ccd1)
    : 0;
  const bucket80cce = available
    ? Math.min(other80C + claimed80ccd1, SECTION_80CCE_LIMIT)
    : 0;
  const totalWith = bucket80cce + claimed1B;

  // Without 80CCD(1B): the whole contribution has to squeeze into 80CCD(1).
  const claimed80ccd1Only = Math.min(npsContribution, ceiling80ccd1);
  const totalWithout = available
    ? Math.min(other80C + claimed80ccd1Only, SECTION_80CCE_LIMIT)
    : 0;

  const extraDeduction = Math.max(0, totalWith - totalWithout);
  const rate = marginalRatePercent / 100;
  const taxSaved = extraDeduction * rate;
  const cess = taxSaved * HEALTH_EDUCATION_CESS_RATE;
  const taxSavedWithCess = taxSaved + cess;

  const unusedContribution = available
    ? Math.max(0, npsContribution - claimed1B - claimed80ccd1)
    : npsContribution;
  const unused1BHeadroom = available ? Math.max(0, SECTION_80CCD_1B_LIMIT - claimed1B) : 0;
  const unused80cceHeadroom = Math.max(0, SECTION_80CCE_LIMIT - bucket80cce);

  return {
    regime,
    available,
    employmentType,
    npsContribution,
    other80C,
    ceiling80ccd1,
    ceilingRatePercent:
      employmentType === "self-employed"
        ? SELF_EMPLOYED_80CCD1_RATE * 100
        : SALARIED_80CCD1_RATE * 100,
    ceilingBase: employmentType === "self-employed" ? grossTotalIncome : salaryBasicDa,
    claimed1B,
    claimed80ccd1,
    bucket80cce,
    totalDeduction: totalWith,
    totalWithout1B: totalWithout,
    extraDeduction,
    marginalRatePercent,
    taxSaved,
    cess,
    taxSavedWithCess,
    unusedContribution,
    unused1BHeadroom,
    unused80cceHeadroom,
    /** Extra rupees to invest in NPS to use the full Rs 50,000 of 80CCD(1B). */
    investMoreForFull1B: unused1BHeadroom,
  };
}
