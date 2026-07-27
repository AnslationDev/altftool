/**
 * Debt-to-income ratio checker for Indian retail borrowers.
 *
 * Two ratios are computed because Indian lenders and the international rule of
 * thumb use different denominators:
 *
 *  - FOIR (fixed obligation to income ratio) = total monthly debt payments
 *    divided by NET take-home income. This is what Indian banks and NBFCs
 *    underwrite to. It is credit policy set by each lender's board, not a
 *    statutory limit; caps of roughly 40% to 55% are the norm, rising with
 *    income because higher earners have more residual income left over.
 *
 *  - The 28/36 rule uses GROSS income: housing payments should not exceed 28%
 *    of gross monthly income and total debt payments should not exceed 36%.
 *    It comes from US mortgage underwriting convention and is quoted worldwide
 *    as a conservative benchmark.
 *
 * The zone bands below are a plain-language reading of where common lender FOIR
 * caps sit; they are guidance, not regulation.
 */

/** Housing payment ceiling of the 28/36 rule, as a % of gross income. */
export const FRONT_END_BENCHMARK_PERCENT = 28;

/** Total debt payment ceiling of the 28/36 rule, as a % of gross income. */
export const BACK_END_BENCHMARK_PERCENT = 36;

/**
 * Reading of the FOIR on net income. Upper bound of each band is inclusive.
 */
export const FOIR_ZONES = [
  {
    id: "comfortable",
    upTo: 35,
    label: "Comfortable",
    note: "Well inside every lender's limit, with room for a new loan.",
  },
  {
    id: "manageable",
    upTo: 45,
    label: "Manageable",
    note: "Most lenders will still sanction, though the amount will be trimmed.",
  },
  {
    id: "stretched",
    upTo: 55,
    label: "Stretched",
    note: "At the top of common FOIR caps — expect a smaller loan or a longer tenure.",
  },
  {
    id: "overleveraged",
    upTo: Infinity,
    label: "Over-leveraged",
    note: "Beyond what mainstream lenders underwrite; reducing an obligation comes first.",
  },
];

/** Highest FOIR target this calculator will test against. */
export const MAX_TARGET_FOIR_PERCENT = 100;

/** Upper sanity bound on any rupee amount. */
const MAX_AMOUNT = 1e9;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Zone that a FOIR percentage falls into.
 * @param {number} foirPercent
 * @returns {{id: string, label: string, note: string}}
 */
export function zoneForFoir(foirPercent) {
  if (!isNum(foirPercent) || foirPercent < 0) return FOIR_ZONES[0];
  const zone = FOIR_ZONES.find((entry) => foirPercent <= entry.upTo);
  return zone || FOIR_ZONES[FOIR_ZONES.length - 1];
}

/**
 * Compute the debt-to-income picture.
 *
 * @param {object} input
 * @param {number} input.grossMonthlyIncome income before tax and deductions
 * @param {number} input.netMonthlyIncome take-home pay
 * @param {number} [input.homeLoanEmi]
 * @param {number} [input.carLoanEmi]
 * @param {number} [input.personalLoanEmi]
 * @param {number} [input.creditCardMinimumDue] minimum due, which is what lenders count
 * @param {number} [input.otherEmi] education loan, gold loan, consumer durable EMI
 * @param {number} [input.rentPaid] rent, counted only when includeRent is true
 * @param {boolean} [input.includeRent] some lenders add rent to the obligations
 * @param {number} [input.targetFoirPercent] FOIR you want to test headroom against
 * @returns {object} ratios and zone, or { error } when the input is unusable
 */
export function computeDebtToIncome({
  grossMonthlyIncome,
  netMonthlyIncome,
  homeLoanEmi = 0,
  carLoanEmi = 0,
  personalLoanEmi = 0,
  creditCardMinimumDue = 0,
  otherEmi = 0,
  rentPaid = 0,
  includeRent = false,
  targetFoirPercent = 50,
} = {}) {
  const amounts = [
    grossMonthlyIncome,
    netMonthlyIncome,
    homeLoanEmi,
    carLoanEmi,
    personalLoanEmi,
    creditCardMinimumDue,
    otherEmi,
    rentPaid,
  ];
  if (!amounts.every(isNum) || !isNum(targetFoirPercent)) {
    return { error: "Enter a valid number in every field." };
  }
  if (amounts.some((value) => value < 0) || targetFoirPercent < 0) {
    return { error: "Income and EMI amounts cannot be negative." };
  }
  if (amounts.some((value) => value > MAX_AMOUNT)) {
    return { error: "Enter amounts below Rs 100 crore." };
  }
  if (netMonthlyIncome <= 0) {
    return { error: "Enter your net take-home income for the month." };
  }
  if (grossMonthlyIncome <= 0) {
    return { error: "Enter your gross monthly income." };
  }
  if (netMonthlyIncome > grossMonthlyIncome) {
    return { error: "Take-home pay cannot be more than gross income." };
  }
  if (targetFoirPercent <= 0 || targetFoirPercent > MAX_TARGET_FOIR_PERCENT) {
    return { error: `Target FOIR should be between 1% and ${MAX_TARGET_FOIR_PERCENT}%.` };
  }

  const rentCounted = includeRent ? rentPaid : 0;
  const housingPayment = homeLoanEmi + rentCounted;
  const totalObligations =
    homeLoanEmi + carLoanEmi + personalLoanEmi + creditCardMinimumDue + otherEmi + rentCounted;

  const foirNet = (totalObligations / netMonthlyIncome) * 100;
  const dtiGross = (totalObligations / grossMonthlyIncome) * 100;
  const frontEndGross = (housingPayment / grossMonthlyIncome) * 100;

  const zone = zoneForFoir(foirNet);

  const targetObligationCeiling = (netMonthlyIncome * targetFoirPercent) / 100;
  const headroom = targetObligationCeiling - totalObligations;

  const backEndCeiling = (grossMonthlyIncome * BACK_END_BENCHMARK_PERCENT) / 100;
  const frontEndCeiling = (grossMonthlyIncome * FRONT_END_BENCHMARK_PERCENT) / 100;

  return {
    grossMonthlyIncome,
    netMonthlyIncome,
    components: [
      { label: "Home loan EMI", amount: homeLoanEmi },
      { label: "Car / vehicle loan EMI", amount: carLoanEmi },
      { label: "Personal loan EMI", amount: personalLoanEmi },
      { label: "Credit card minimum due", amount: creditCardMinimumDue },
      { label: "Other EMIs", amount: otherEmi },
      { label: "Rent counted as an obligation", amount: rentCounted },
    ].filter((row) => row.amount > 0),
    housingPayment,
    totalObligations,

    foirNetPercent: foirNet,
    dtiGrossPercent: dtiGross,
    frontEndGrossPercent: frontEndGross,

    zoneId: zone.id,
    zoneLabel: zone.label,
    zoneNote: zone.note,

    targetFoirPercent,
    targetObligationCeiling,
    /** Positive: room for a new EMI. Negative: how much you are over. */
    headroom,
    hasHeadroom: headroom > 0,
    reduceBy: headroom < 0 ? -headroom : 0,

    frontEndBenchmarkPercent: FRONT_END_BENCHMARK_PERCENT,
    backEndBenchmarkPercent: BACK_END_BENCHMARK_PERCENT,
    frontEndCeiling,
    backEndCeiling,
    passesFrontEnd: housingPayment <= frontEndCeiling,
    passesBackEnd: totalObligations <= backEndCeiling,

    residualIncome: netMonthlyIncome - totalObligations,
    residualPercent: ((netMonthlyIncome - totalObligations) / netMonthlyIncome) * 100,
  };
}
