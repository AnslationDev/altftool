/**
 * Emergency fund sizing.
 *
 * The standard personal-finance guidance is an emergency fund covering three to six
 * months of *essential* outgo. Three months is the widely used floor; six months is the
 * usual figure for a household with a single earner or dependants; twelve months is the
 * figure normally quoted for self-employed and commission-based income. This module turns
 * that qualitative range into a number by starting at the floor and adding months for each
 * documented risk factor, then clamping to the 3-12 month band.
 *
 *   targetMonths = clamp(BASE_MONTHS + Σ adders, MIN_MONTHS, MAX_MONTHS)
 *   and never below (expected job-search months + JOB_SEARCH_BUFFER_MONTHS)
 *
 *   monthlyOutgo  = essential living expenses + contractual loan instalments
 *   targetFund    = monthlyOutgo * targetMonths
 *   currentRunway = existing liquid savings / monthlyOutgo   (in months)
 *   monthsToFill  = gap / monthly amount you can set aside
 *
 * Loan instalments are added to essential outgo because they are contractual: a lender
 * does not pause an EMI while you look for work.
 *
 * Everything here is currency-agnostic. The currency code only affects display, so the
 * same model works for INR, USD, EUR or anything else.
 */

/** Three months of essential outgo is the common floor in emergency-fund guidance. */
export const BASE_MONTHS = 3;
/** Below three months a fund does not survive a single billing cycle plus notice period. */
export const MIN_MONTHS = 3;
/** Twelve months is the top of the usual published range, quoted for self-employed income. */
export const MAX_MONTHS = 12;

/**
 * Extra months by how predictable the income is. A permanent salary is the reference
 * point (0); freelance and business income adds the most because it can stop gradually
 * rather than on a single termination date.
 */
export const EMPLOYMENT_ADDERS = {
  government: -0.5,
  permanent: 0,
  contract: 1.5,
  commission: 2,
  freelance: 3,
  business: 3,
};

export const EMPLOYMENT_LABELS = {
  government: "Government / public sector",
  permanent: "Permanent salaried",
  contract: "Fixed-term contract",
  commission: "Commission or variable pay",
  freelance: "Freelance / gig",
  business: "Business owner",
};

/** A household with one earner has no second income to fall back on. */
export const SINGLE_INCOME_ADDER = 1;
/** Each person financially dependent on you lengthens the runway you need. */
export const DEPENDANT_ADDER = 0.5;
/** Beyond six dependants the marginal effect on runway flattens out. */
export const DEPENDANT_ADDER_CAP = 3;
/** Without health cover, one hospital bill can empty the fund, so it must be deeper. */
export const NO_HEALTH_COVER_ADDER = 1.5;
/** You still need to eat during the month you sign the new offer. */
export const JOB_SEARCH_BUFFER_MONTHS = 1;

/** Sanity ceilings so absurd input produces an error instead of an absurd answer. */
export const MAX_DEPENDANTS = 20;
export const MAX_JOB_SEARCH_MONTHS = 24;

/** Currencies offered for display. Codes are ISO 4217; locales only affect grouping. */
export const CURRENCIES = [
  { code: "INR", locale: "en-IN", label: "Indian rupee" },
  { code: "USD", locale: "en-US", label: "US dollar" },
  { code: "EUR", locale: "de-DE", label: "Euro" },
  { code: "GBP", locale: "en-GB", label: "Pound sterling" },
  { code: "AED", locale: "en-AE", label: "UAE dirham" },
  { code: "SGD", locale: "en-SG", label: "Singapore dollar" },
  { code: "AUD", locale: "en-AU", label: "Australian dollar" },
  { code: "CAD", locale: "en-CA", label: "Canadian dollar" },
  { code: "JPY", locale: "ja-JP", label: "Japanese yen" },
  { code: "ZAR", locale: "en-ZA", label: "South African rand" },
];

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

const round0 = (value) => Math.round(value);
const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/**
 * @param {object} input
 * @param {number|string} input.monthlyExpenses Essential monthly living cost (rent, food, utilities, transport, school fees).
 * @param {number|string} [input.monthlyDebt] Contractual loan and card instalments per month.
 * @param {string} [input.employment] Key of EMPLOYMENT_ADDERS.
 * @param {boolean} [input.singleIncome] True if one person earns for the household.
 * @param {number|string} [input.dependants] People financially dependent on that income.
 * @param {boolean} [input.healthCover] True if the household has health insurance.
 * @param {number|string} [input.jobSearchMonths] Months you expect a replacement job to take.
 * @param {number|string} [input.existingSavings] Liquid savings already set aside.
 * @param {number|string} [input.monthlySaving] Amount you can add to the fund each month.
 */
export function sizeEmergencyFund({
  monthlyExpenses,
  monthlyDebt = 0,
  employment = "permanent",
  singleIncome = false,
  dependants = 0,
  healthCover = true,
  jobSearchMonths = 3,
  existingSavings = 0,
  monthlySaving = 0,
} = {}) {
  const expenses = toNumber(monthlyExpenses);
  const debt = toNumber(monthlyDebt);
  const people = toNumber(dependants);
  const search = toNumber(jobSearchMonths);
  const existing = toNumber(existingSavings);
  const saving = toNumber(monthlySaving);

  const numbers = [expenses, debt, people, search, existing, saving];
  if (numbers.some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers in every amount field." };
  }
  if (numbers.some((value) => value < 0)) {
    return { error: "Amounts, dependants and months cannot be negative." };
  }
  if (!(expenses > 0)) {
    return { error: "Enter your essential monthly expenses to size a fund." };
  }
  if (people > MAX_DEPENDANTS) {
    return { error: `Dependants should be ${MAX_DEPENDANTS} or fewer.` };
  }
  if (search > MAX_JOB_SEARCH_MONTHS) {
    return { error: `Expected job-search time should be ${MAX_JOB_SEARCH_MONTHS} months or less.` };
  }
  if (!Object.prototype.hasOwnProperty.call(EMPLOYMENT_ADDERS, employment)) {
    return { error: "Choose how your income is earned." };
  }

  const employmentAdder = EMPLOYMENT_ADDERS[employment];
  const incomeAdder = singleIncome ? SINGLE_INCOME_ADDER : 0;
  const dependantAdder = Math.min(Math.floor(people) * DEPENDANT_ADDER, DEPENDANT_ADDER_CAP);
  const healthAdder = healthCover ? 0 : NO_HEALTH_COVER_ADDER;

  const rawMonths = BASE_MONTHS + employmentAdder + incomeAdder + dependantAdder + healthAdder;
  const jobSearchFloor = search + JOB_SEARCH_BUFFER_MONTHS;
  const targetMonths = clamp(Math.max(rawMonths, jobSearchFloor), MIN_MONTHS, MAX_MONTHS);

  const monthlyOutgo = expenses + debt;
  const targetFund = monthlyOutgo * targetMonths;
  const gap = Math.max(0, targetFund - existing);
  const surplus = Math.max(0, existing - targetFund);
  const currentRunwayMonths = monthlyOutgo > 0 ? existing / monthlyOutgo : 0;
  const coveragePct = targetFund > 0 ? Math.min(100, (existing / targetFund) * 100) : 0;

  let monthsToFill = null;
  if (gap > 0) monthsToFill = saving > 0 ? Math.ceil(gap / saving) : null;
  else monthsToFill = 0;

  const drivers = [
    { label: "Baseline (three months of essential outgo)", months: BASE_MONTHS },
    { label: EMPLOYMENT_LABELS[employment], months: employmentAdder },
    { label: singleIncome ? "Single earner in the household" : "Two or more earners", months: incomeAdder },
    { label: `${Math.floor(people)} dependant(s)`, months: dependantAdder },
    { label: healthCover ? "Health cover in place" : "No health insurance", months: healthAdder },
  ];
  if (jobSearchFloor > rawMonths) {
    drivers.push({
      label: `Raised to your ${round1(search)}-month job search plus a month`,
      months: round1(jobSearchFloor - rawMonths),
    });
  }
  if (Math.max(rawMonths, jobSearchFloor) > MAX_MONTHS) {
    drivers.push({
      label: `Capped at ${MAX_MONTHS} months`,
      months: round1(MAX_MONTHS - Math.max(rawMonths, jobSearchFloor)),
    });
  }
  if (Math.max(rawMonths, jobSearchFloor) < MIN_MONTHS) {
    drivers.push({
      label: `Floored at ${MIN_MONTHS} months`,
      months: round1(MIN_MONTHS - Math.max(rawMonths, jobSearchFloor)),
    });
  }

  let status = "critical";
  if (coveragePct >= 100) status = "funded";
  else if (currentRunwayMonths >= MIN_MONTHS) status = "on-track";
  else if (currentRunwayMonths >= 1) status = "thin";

  return {
    targetMonths: round1(targetMonths),
    monthlyOutgo: round0(monthlyOutgo),
    targetFund: round0(targetFund),
    existingSavings: round0(existing),
    gap: round0(gap),
    surplus: round0(surplus),
    currentRunwayMonths: round2(currentRunwayMonths),
    coveragePct: round1(coveragePct),
    monthsToFill,
    monthlySaving: round0(saving),
    status,
    drivers: drivers.map((item) => ({ ...item, months: round1(item.months) })),
  };
}
