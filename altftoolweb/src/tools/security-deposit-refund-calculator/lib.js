/**
 * Security deposit refund on vacating a rented property.
 *
 * Reference points
 *  - Model Tenancy Act, 2021, section 11(1): the security deposit shall not exceed two months'
 *    rent for residential premises and six months' rent for non-residential premises.
 *  - Model Tenancy Act, 2021, section 11(2): the deposit is refundable on the date the landlord
 *    takes vacant possession, after deducting any liability of the tenant.
 *  The Model Tenancy Act is a template the central government circulated in 2021; it binds a
 *  tenancy only in a state or union territory that has enacted or notified it. Elsewhere the
 *  agreement and the local rent legislation govern, so the cap is shown as guidance, not as a
 *  rule that automatically applies.
 *
 *  Normal wear and tear is not a deductible damage. Repainting, deep cleaning and repairs can be
 *  deducted only where the agreement says so or the damage goes beyond ordinary use.
 */

/** Section 11(1) caps, in months of rent. */
export const DEPOSIT_CAP_MONTHS = { residential: 2, nonResidential: 6 };

/**
 * Bases used to convert a monthly rent into a daily rate for a part month.
 *  - "thirty" treats every month as 30 days, the common contractual shorthand.
 *  - "actual" uses monthly rent x 12 / 365, which is calendar-accurate over a year.
 */
export const DAILY_RENT_BASES = {
  thirty: { label: "30-day month", divisor: 30, annual: false },
  actual: { label: "Actual days (x12 / 365)", divisor: 365, annual: true },
};

/** Days in a year used by the "actual" basis. */
export const DAYS_PER_YEAR = 365;
export const MONTHS_PER_YEAR = 12;

/** Sanity bounds so a stray keystroke cannot produce a nonsense answer. */
export const MAX_UNPAID_MONTHS = 60;
export const MAX_SHORTFALL_DAYS = 730;
export const MAX_INTEREST_RATE = 24;
export const MAX_MONTHS_HELD = 600;

function isNum(value) {
  return typeof value === "number" && Number.isFinite(value);
}

/** Rent for one day, on the chosen basis. */
export function dailyRent(monthlyRent, basis = "thirty") {
  if (!isNum(monthlyRent) || monthlyRent <= 0) return 0;
  if (basis === "actual") return (monthlyRent * MONTHS_PER_YEAR) / DAYS_PER_YEAR;
  return monthlyRent / DAILY_RENT_BASES.thirty.divisor;
}

/**
 * Compute the refund due.
 *
 * @param {object} input
 * @param {number} input.deposit             Deposit originally paid.
 * @param {number} input.monthlyRent         Rent for the last full month.
 * @param {number} input.unpaidRentMonths    Whole or part months of rent still owed.
 * @param {number} input.noticeShortfallDays Days short of the agreed notice period.
 * @param {number} input.unpaidUtilities     Electricity, water, gas and society dues left unpaid.
 * @param {number} input.damageCost          Repairs beyond normal wear and tear.
 * @param {number} input.cleaningCost        Painting or deep cleaning the agreement allows.
 * @param {number} input.otherDeductions     Anything else the agreement permits.
 * @param {"thirty"|"actual"} input.dailyRentBasis
 * @param {"residential"|"nonResidential"} input.premisesType
 * @param {number} input.interestRatePercent Simple interest the agreement promises on the deposit.
 * @param {number} input.monthsHeld          How long the landlord held the deposit.
 */
export function computeDepositRefund({
  deposit,
  monthlyRent,
  unpaidRentMonths = 0,
  noticeShortfallDays = 0,
  unpaidUtilities = 0,
  damageCost = 0,
  cleaningCost = 0,
  otherDeductions = 0,
  dailyRentBasis = "thirty",
  premisesType = "residential",
  interestRatePercent = 0,
  monthsHeld = 0,
}) {
  if (!isNum(deposit) || deposit < 0) {
    return { error: "The deposit paid must be zero or more." };
  }
  if (!isNum(monthlyRent) || monthlyRent <= 0) {
    return { error: "Monthly rent must be greater than zero." };
  }
  const money = [unpaidUtilities, damageCost, cleaningCost, otherDeductions];
  if (money.some((value) => !isNum(value) || value < 0)) {
    return { error: "Deduction amounts cannot be negative." };
  }
  if (!isNum(unpaidRentMonths) || unpaidRentMonths < 0 || unpaidRentMonths > MAX_UNPAID_MONTHS) {
    return { error: `Unpaid rent must be between 0 and ${MAX_UNPAID_MONTHS} months.` };
  }
  if (
    !isNum(noticeShortfallDays) ||
    noticeShortfallDays < 0 ||
    noticeShortfallDays > MAX_SHORTFALL_DAYS
  ) {
    return { error: `Notice shortfall must be between 0 and ${MAX_SHORTFALL_DAYS} days.` };
  }
  if (!DAILY_RENT_BASES[dailyRentBasis]) {
    return { error: "Choose a 30-day month or actual days for the daily rent." };
  }
  if (!DEPOSIT_CAP_MONTHS[premisesType]) {
    return { error: "Choose residential or non-residential premises." };
  }
  if (
    !isNum(interestRatePercent) ||
    interestRatePercent < 0 ||
    interestRatePercent > MAX_INTEREST_RATE
  ) {
    return { error: `Interest on the deposit must be between 0% and ${MAX_INTEREST_RATE}%.` };
  }
  if (!isNum(monthsHeld) || monthsHeld < 0 || monthsHeld > MAX_MONTHS_HELD) {
    return { error: `Months held must be between 0 and ${MAX_MONTHS_HELD}.` };
  }

  const perDay = dailyRent(monthlyRent, dailyRentBasis);
  const unpaidRentAmount = unpaidRentMonths * monthlyRent;
  const noticeShortfallAmount = noticeShortfallDays * perDay;

  const lines = [
    { label: "Unpaid rent", amount: unpaidRentAmount, detail: `${unpaidRentMonths} month(s) at ${Math.round(monthlyRent)}` },
    {
      label: "Notice period shortfall",
      amount: noticeShortfallAmount,
      detail: `${noticeShortfallDays} day(s) at ${Math.round(perDay)} a day`,
    },
    { label: "Unpaid utilities and society dues", amount: unpaidUtilities, detail: "" },
    { label: "Damage beyond normal wear and tear", amount: damageCost, detail: "" },
    { label: "Painting or deep cleaning", amount: cleaningCost, detail: "" },
    { label: "Other agreed deductions", amount: otherDeductions, detail: "" },
  ].filter((line) => line.amount > 0);

  const totalDeductions =
    unpaidRentAmount +
    noticeShortfallAmount +
    unpaidUtilities +
    damageCost +
    cleaningCost +
    otherDeductions;

  // Simple interest, since deposit interest clauses are almost always drafted as simple.
  const interest = (deposit * (interestRatePercent / 100) * monthsHeld) / MONTHS_PER_YEAR;
  const refundable = deposit + interest;
  const refund = Math.max(0, refundable - totalDeductions);
  const shortfall = Math.max(0, totalDeductions - refundable);

  const capMonths = DEPOSIT_CAP_MONTHS[premisesType];
  const capAmount = capMonths * monthlyRent;
  const exceedsCap = deposit > capAmount;
  const depositInMonths = deposit / monthlyRent;

  return {
    deposit,
    interest,
    refundable,
    lines,
    totalDeductions,
    refund,
    shortfall,
    refundPercent: refundable > 0 ? (refund / refundable) * 100 : 0,
    dailyRent: perDay,
    dailyRentBasisLabel: DAILY_RENT_BASES[dailyRentBasis].label,
    capMonths,
    capAmount,
    exceedsCap,
    excessOverCap: Math.max(0, deposit - capAmount),
    depositInMonths,
    premisesType,
  };
}
