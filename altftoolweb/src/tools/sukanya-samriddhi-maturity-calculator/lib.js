/**
 * Sukanya Samriddhi Account maturity projection.
 *
 * Rules encoded here come from the Sukanya Samriddhi Account Scheme, 2019,
 * notified by the Ministry of Finance under the Government Savings Promotion
 * Act, 1873, and from the quarterly small savings rate notifications:
 *
 *  - The account may be opened by a guardian for a girl child who has not
 *    attained the age of TEN years.
 *  - Minimum deposit is Rs 250 in a financial year; maximum Rs 1,50,000 in a
 *    financial year, taken together across all accounts of that girl.
 *  - Deposits may be made for FIFTEEN years from the date of opening. The
 *    balance keeps earning interest after that until maturity.
 *  - The account MATURES on completion of TWENTY-ONE years from the date of
 *    opening. It may also be closed after the girl attains 18 for her marriage,
 *    within one month before to three months after the date of marriage.
 *  - Interest is compounded ANNUALLY and credited at the end of each financial
 *    year. The rate is notified quarterly by the Ministry of Finance.
 *  - Partial withdrawal of up to FIFTY PERCENT of the balance at the end of the
 *    preceding financial year is allowed once the girl attains 18 years or has
 *    passed the tenth standard, whichever is earlier.
 *  - Deposits qualify for deduction under section 80C, and the interest and the
 *    maturity amount are exempt from income tax.
 *
 * Nothing here reads the clock; every age and period is an argument.
 */

/** Rate notified for the scheme, % a year, compounded annually. */
export const NOTIFIED_RATE_PERCENT = 8.2;

/** Years for which deposits may be made from the date of opening. */
export const DEPOSIT_YEARS = 15;

/** Years from opening to maturity. */
export const MATURITY_YEARS = 21;

/** Minimum deposit in a financial year, in rupees. */
export const MIN_ANNUAL_DEPOSIT = 250;

/** Maximum deposit in a financial year, in rupees. */
export const MAX_ANNUAL_DEPOSIT = 150000;

/** The girl must be below this age when the account is opened. */
export const MAX_AGE_AT_OPENING = 10;

/** Age from which a partial withdrawal is permitted. */
export const PARTIAL_WITHDRAWAL_AGE = 18;

/** Share of the preceding year's balance that may be withdrawn. */
export const PARTIAL_WITHDRAWAL_SHARE = 0.5;

/** Deduction ceiling of section 80CCE, which section 80C sits inside. */
export const SECTION_80C_LIMIT = 150000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Project the account year by year.
 *
 * @param {object} input
 * @param {number} input.annualDeposit deposit made in each financial year
 * @param {number} [input.ageAtOpening] girl's age when the account is opened
 * @param {number} [input.annualRatePercent] notified rate, % a year
 * @param {number} [input.depositYears] years for which deposits are actually made
 * @param {"start"|"end"} [input.depositTiming] when in the year the deposit lands
 * @returns {object} projection, or { error } when the input is unusable
 */
export function computeSukanyaSamriddhi({
  annualDeposit,
  ageAtOpening = 0,
  annualRatePercent = NOTIFIED_RATE_PERCENT,
  depositYears = DEPOSIT_YEARS,
  depositTiming = "start",
} = {}) {
  if (depositTiming !== "start" && depositTiming !== "end") {
    return { error: "Choose whether the deposit is made at the start or the end of the year." };
  }
  const numbers = [annualDeposit, ageAtOpening, annualRatePercent, depositYears];
  if (!numbers.every(isNum)) {
    return { error: "Enter a valid number in every field." };
  }
  if (numbers.some((value) => value < 0)) {
    return { error: "Deposits, ages, rates and periods cannot be negative." };
  }
  if (annualDeposit < MIN_ANNUAL_DEPOSIT) {
    return { error: `The scheme requires at least Rs ${MIN_ANNUAL_DEPOSIT} in a financial year.` };
  }
  if (annualDeposit > MAX_ANNUAL_DEPOSIT) {
    return {
      error: `The scheme caps deposits at Rs ${MAX_ANNUAL_DEPOSIT.toLocaleString("en-IN")} in a financial year.`,
    };
  }
  if (ageAtOpening >= MAX_AGE_AT_OPENING) {
    return { error: `The account can only be opened before the girl turns ${MAX_AGE_AT_OPENING}.` };
  }
  if (annualRatePercent > 15) {
    return { error: "Enter an interest rate of 15% a year or less." };
  }
  if (depositYears < 1 || depositYears > DEPOSIT_YEARS) {
    return { error: `Deposits can be made for 1 to ${DEPOSIT_YEARS} years from opening.` };
  }

  const rate = annualRatePercent / 100;
  const years = Math.round(depositYears);
  const schedule = [];

  let balance = 0;
  let totalDeposited = 0;

  for (let year = 1; year <= MATURITY_YEARS; year += 1) {
    const opening = balance;
    const deposit = year <= years ? annualDeposit : 0;
    // A deposit made at the start of the financial year earns interest for the
    // whole year; one made at the end earns nothing that year.
    const interestBase = depositTiming === "start" ? opening + deposit : opening;
    const interest = interestBase * rate;
    balance = opening + deposit + interest;
    totalDeposited += deposit;

    schedule.push({
      year,
      ageDuringYear: ageAtOpening + year - 1,
      opening,
      deposit,
      interest,
      closing: balance,
    });
  }

  const maturityValue = balance;
  const totalInterest = maturityValue - totalDeposited;

  // Partial withdrawal: 50% of the balance at the end of the financial year
  // preceding the one in which the girl turns 18.
  const yearsToAge18 = Math.max(1, PARTIAL_WITHDRAWAL_AGE - ageAtOpening);
  const precedingYearIndex = Math.min(MATURITY_YEARS, Math.max(1, yearsToAge18)) - 1;
  const balanceBeforeWithdrawal =
    precedingYearIndex >= 1 ? schedule[precedingYearIndex - 1].closing : 0;
  const partialWithdrawalLimit = balanceBeforeWithdrawal * PARTIAL_WITHDRAWAL_SHARE;

  return {
    annualDeposit,
    depositYears: years,
    depositTiming,
    annualRatePercent,
    ageAtOpening,
    ageWhenDepositsStop: ageAtOpening + years,
    ageAtMaturity: ageAtOpening + MATURITY_YEARS,
    maturityYears: MATURITY_YEARS,

    totalDeposited,
    totalInterest,
    maturityValue,
    /** Maturity value divided by the money put in. */
    growthMultiple: totalDeposited > 0 ? maturityValue / totalDeposited : 0,
    /** Interest as a share of the maturity amount. */
    interestShare: maturityValue > 0 ? (totalInterest / maturityValue) * 100 : 0,

    balanceWhenDepositsStop: schedule[years - 1] ? schedule[years - 1].closing : 0,
    growthAfterDeposits: maturityValue - (schedule[years - 1] ? schedule[years - 1].closing : 0),

    partialWithdrawalAge: PARTIAL_WITHDRAWAL_AGE,
    yearsToAge18,
    balanceBeforeWithdrawal,
    partialWithdrawalLimit,

    /** 80C deduction the yearly deposit can claim, inside the shared Rs 1.5 lakh cap. */
    section80cEligible: Math.min(annualDeposit, SECTION_80C_LIMIT),
    section80cLimit: SECTION_80C_LIMIT,

    schedule,
  };
}
