/**
 * Child education corpus planning.
 *
 * The goal is expressed as a corpus needed on the day the course starts, not as a
 * single inflated fee, because a degree is paid over several years and the money left
 * in the fund keeps earning while the course runs.
 *
 * 1. Fee for course year k (k = 0 for the first year), where Y = years until the course
 *    starts and e = education fee inflation:
 *        feeYear(k) = currentAnnualFee * (1 + e)^(Y + k)
 *
 * 2. Corpus required on day one of the course = the present value, at course start, of
 *    every year's fee discounted at the return r you expect to keep earning during the
 *    course:
 *        required = Σ feeYear(k) / (1 + r)^k
 *
 * 3. What you already hold grows for n = Y*12 months at the monthly rate i = r/12:
 *        futureValueOfExisting = existing * (1 + i)^n
 *
 * 4. The shortfall is met by a monthly SIP, optionally stepped up once a year. Because
 *    the future value of a contribution plan is linear in the contribution, the required
 *    first-year SIP is  gap / (future value of a 1-rupee plan), computed by an exact
 *    month-by-month roll-forward so an annual step-up is handled without approximation.
 *
 * All rates are inputs. Education fee inflation in India is commonly planned at a higher
 * rate than general CPI inflation; use the actual fee history of the institution you are
 * targeting rather than a rule of thumb.
 */

/** Sanity ceilings. Beyond these the plan stops being meaningful. */
export const MAX_YEARS_TO_START = 30;
export const MAX_COURSE_YEARS = 8;
export const MAX_RATE_PCT = 25;
export const MAX_STEP_UP_PCT = 30;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

const round0 = (value) => Math.round(value);
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Future value of a plan contributing 1 unit a month, stepped up by stepUpPct once every
 * 12 months, compounded at monthly rate i over n months. Contributions are made at the
 * end of each month.
 */
function contributionFactor(months, monthlyRate, stepUpPct) {
  const growth = 1 + stepUpPct / 100;
  let balance = 0;
  for (let month = 1; month <= months; month += 1) {
    const yearIndex = Math.floor((month - 1) / 12);
    balance = balance * (1 + monthlyRate) + Math.pow(growth, yearIndex);
  }
  return balance;
}

/**
 * @param {object} input
 * @param {number|string} input.currentAnnualFee Today's cost of one year of the course.
 * @param {number|string} input.yearsToStart Years until the child starts the course.
 * @param {number|string} input.courseYears Duration of the course in years.
 * @param {number|string} input.educationInflation Annual fee inflation, % per year.
 * @param {number|string} input.expectedReturn Annual return on the savings, % per year.
 * @param {number|string} [input.existingCorpus] Amount already earmarked for this goal.
 * @param {number|string} [input.stepUpPct] Annual increase in the SIP amount, % per year.
 */
export function planEducationCorpus({
  currentAnnualFee,
  yearsToStart,
  courseYears,
  educationInflation,
  expectedReturn,
  existingCorpus = 0,
  stepUpPct = 0,
} = {}) {
  const fee = toNumber(currentAnnualFee);
  const years = toNumber(yearsToStart);
  const duration = toNumber(courseYears);
  const inflation = toNumber(educationInflation);
  const returnPct = toNumber(expectedReturn);
  const existing = toNumber(existingCorpus);
  const stepUp = toNumber(stepUpPct);

  const all = [fee, years, duration, inflation, returnPct, existing, stepUp];
  if (all.some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (all.some((value) => value < 0)) {
    return { error: "Fees, years and rates cannot be negative." };
  }
  if (!(fee > 0)) return { error: "Enter today's cost of one year of the course." };
  if (!(years > 0) || years > MAX_YEARS_TO_START) {
    return { error: `Years until the course starts should be between 1 and ${MAX_YEARS_TO_START}.` };
  }
  if (!(duration >= 1) || duration > MAX_COURSE_YEARS) {
    return { error: `Course duration should be between 1 and ${MAX_COURSE_YEARS} years.` };
  }
  if (inflation > MAX_RATE_PCT) {
    return { error: `Fee inflation above ${MAX_RATE_PCT}% a year is not a realistic plan.` };
  }
  if (returnPct > MAX_RATE_PCT) {
    return { error: `Expected return above ${MAX_RATE_PCT}% a year is not a realistic plan.` };
  }
  if (stepUp > MAX_STEP_UP_PCT) {
    return { error: `An annual SIP step-up above ${MAX_STEP_UP_PCT}% is not sustainable.` };
  }

  const wholeCourseYears = Math.round(duration);
  const e = inflation / 100;
  const r = returnPct / 100;
  const monthlyRate = r / 12;
  const months = Math.round(years * 12);

  const schedule = [];
  let requiredCorpus = 0;
  let nominalTotal = 0;
  for (let k = 0; k < wholeCourseYears; k += 1) {
    const feeThatYear = fee * Math.pow(1 + e, years + k);
    const discounted = feeThatYear / Math.pow(1 + r, k);
    requiredCorpus += discounted;
    nominalTotal += feeThatYear;
    schedule.push({
      courseYear: k + 1,
      yearsFromNow: round2(years + k),
      fee: round0(feeThatYear),
      presentValueAtStart: round0(discounted),
    });
  }

  const futureValueOfExisting = existing * Math.pow(1 + monthlyRate, months);
  const gap = Math.max(0, requiredCorpus - futureValueOfExisting);

  const factor = contributionFactor(months, monthlyRate, stepUp);
  let monthlySip = 0;
  if (gap > 0) {
    monthlySip = factor > 0 ? gap / factor : null;
    if (monthlySip !== null && !Number.isFinite(monthlySip)) monthlySip = null;
  }

  // Total actually paid in by the saver, so the compounding contribution is visible.
  let totalInvested = 0;
  if (monthlySip !== null && monthlySip > 0) {
    for (let month = 1; month <= months; month += 1) {
      totalInvested += monthlySip * Math.pow(1 + stepUp / 100, Math.floor((month - 1) / 12));
    }
  }

  const finalYearSip =
    monthlySip !== null && monthlySip > 0 && months > 0
      ? monthlySip * Math.pow(1 + stepUp / 100, Math.floor((months - 1) / 12))
      : 0;

  const todaysTotalFee = fee * wholeCourseYears;

  return {
    months,
    courseYears: wholeCourseYears,
    firstYearFeeToday: round0(fee),
    todaysTotalFee: round0(todaysTotalFee),
    firstYearFeeFuture: schedule.length ? schedule[0].fee : 0,
    nominalTotalFee: round0(nominalTotal),
    inflationMultiple: round2(nominalTotal / todaysTotalFee),
    requiredCorpus: round0(requiredCorpus),
    existingCorpus: round0(existing),
    futureValueOfExisting: round0(futureValueOfExisting),
    gap: round0(gap),
    monthlySip: monthlySip === null ? null : round0(monthlySip),
    finalYearSip: round0(finalYearSip),
    totalInvested: round0(totalInvested),
    growthEarned: monthlySip === null ? 0 : round0(Math.max(0, gap - totalInvested)),
    stepUpPct: round2(stepUp),
    funded: gap <= 0,
    schedule,
  };
}
