/**
 * Resignation Date Optimizer — pure calculation layer.
 *
 * No React, no DOM, no Date.now(). Every date enters as an ISO "YYYY-MM-DD"
 * string argument so the same inputs always produce the same output.
 *
 * Statutory sources encoded here (read 28 July 2026):
 *  - Payment of Gratuity Act, 1972 s.4(1)  — gratuity on termination after not
 *    less than five years of continuous service.
 *  - Payment of Gratuity Act, 1972 s.4(2)  — 15 days' wages for every completed
 *    year of service or part thereof in excess of six months; for monthly-rated
 *    employees 15 days' wages = monthly wages x 15 / 26.
 *  - Payment of Gratuity Act, 1972 s.4(3)  — statutory ceiling, raised to
 *    Rs 20,00,000 by the Payment of Gratuity (Amendment) Act, 2018 (w.e.f.
 *    29 March 2018).
 *  - Payment of Gratuity Act, 1972 s.2A(2)(a) — an employee is deemed to be in
 *    continuous service for one year if he has actually worked for not less than
 *    190 days (establishment working less than six days a week / below-ground
 *    mine) or 240 days (any other case) in the preceding twelve months.
 *  - Income-tax Act, 1961 s.10(10)(ii) — gratuity exemption for employees
 *    covered by the 1972 Act, ceiling Rs 20,00,000.
 *  - Income-tax Act, 1961 s.10(10AA)(ii) — leave encashment exemption for
 *    non-government employees; ceiling raised to Rs 25,00,000 by CBDT
 *    Notification No. 31/2023 dated 24 May 2023 (w.e.f. 1 April 2023).
 *  - Income-tax Act, 1961 s.16 — contains no deduction for notice pay recovered
 *    by an employer, which is why a buyout is modelled as non-deductible.
 *  - CBIC Circular No. 178/10/2022-GST dated 3 August 2022 — notice pay recovery
 *    by an employer is not consideration for a supply; no GST arises on it.
 */

/** s.4(2): 15 days' wages per qualifying year. */
export const GRATUITY_DAYS_PER_YEAR = 15;
/** s.4(2): monthly-rated wages are divided by 26 to get a day's wage. */
export const GRATUITY_MONTH_DIVISOR = 26;
/** s.4(1): the settled, uncontested eligibility threshold. */
export const GRATUITY_STRICT_YEARS = 5;
/** s.4(3), as amended by the Payment of Gratuity (Amendment) Act, 2018. */
export const GRATUITY_STATUTORY_CAP = 2000000;
/** Income-tax Act s.10(10)(ii) ceiling for employees covered by the 1972 Act. */
export const GRATUITY_EXEMPTION_CAP = 2000000;
/** s.2A(2)(a)(ii): 240 days actually worked, establishments working six days. */
export const CONTINUOUS_SERVICE_DAYS_SIX_DAY_WEEK = 240;
/** s.2A(2)(a)(i): 190 days where the establishment works less than six days. */
export const CONTINUOUS_SERVICE_DAYS_SHORT_WEEK = 190;
/** Income-tax Act s.10(10AA)(ii) ceiling, CBDT Notification No. 31/2023. */
export const LEAVE_ENCASHMENT_EXEMPTION_CAP = 2500000;
/** s.10(10AA)(ii) limb (c): ten months' average salary. */
export const LEAVE_EXEMPT_AVERAGE_MONTHS = 10;
/** s.10(10AA)(ii) limb (d): credit capped at 30 days per completed year. */
export const LEAVE_EXEMPT_DAYS_PER_COMPLETED_YEAR = 30;
/** Payroll convention used for part-month salary and notice recovery. */
export const PAYROLL_DAYS_PER_MONTH = 30;
/** Health and education cess on income tax, Finance Act rate of 4%. */
export const HEALTH_AND_EDUCATION_CESS = 0.04;
/** Indian financial year runs 1 April to 31 March. */
export const FY_START_MONTH = 4;
/** Candidate dates are generated no further out than this. */
export const HORIZON_DAYS = 400;

const MS_PER_DAY = 86400000;
const MAX_MONTHLY_AMOUNT = 100000000; // Rs 10 crore a month — absurdity guard.
const MAX_LEAVE_BALANCE_DAYS = 1000;
const MAX_NOTICE_DAYS = 365;
const MAX_ONE_OFF_AMOUNT = 1000000000; // Rs 100 crore — absurdity guard.

/* ------------------------------------------------------------------ dates */

/** Parse "YYYY-MM-DD" to a UTC timestamp. Returns null when unusable. */
export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2200) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ts = Date.UTC(year, month - 1, day);
  const back = new Date(ts);
  if (back.getUTCFullYear() !== year) return null;
  if (back.getUTCMonth() !== month - 1) return null;
  if (back.getUTCDate() !== day) return null;
  return ts;
}

/** Format a UTC timestamp back to "YYYY-MM-DD". */
export function toISODate(ts) {
  return new Date(ts).toISOString().slice(0, 10);
}

export function addDays(ts, n) {
  return ts + n * MS_PER_DAY;
}

/** Calendar month addition, clamped to the last day of the target month. */
export function addMonths(ts, n) {
  const d = new Date(ts);
  const anchor = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  const year = anchor.getUTCFullYear();
  const month = anchor.getUTCMonth();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Date.UTC(year, month, Math.min(d.getUTCDate(), lastDay));
}

export function addYears(ts, n) {
  return addMonths(ts, n * 12);
}

export function diffDays(fromTs, toTs) {
  return Math.round((toTs - fromTs) / MS_PER_DAY);
}

/** Last calendar day of the month containing ts. */
export function endOfMonth(ts) {
  const d = new Date(ts);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0);
}

/** Indian financial year label, e.g. "2026-27", for the date given. */
export function fiscalYearLabel(ts) {
  const d = new Date(ts);
  const year = d.getUTCFullYear();
  const startYear = d.getUTCMonth() + 1 >= FY_START_MONTH ? year : year - 1;
  const endShort = String((startYear + 1) % 100).padStart(2, "0");
  return `${startYear}-${endShort}`;
}

/** 31 March closing the financial year that contains ts. */
export function fiscalYearEnd(ts) {
  const d = new Date(ts);
  const year = d.getUTCFullYear();
  const startYear = d.getUTCMonth() + 1 >= FY_START_MONTH ? year : year - 1;
  return Date.UTC(startYear + 1, 2, 31);
}

function isWorkingDayOfWeek(dow, workDaysPerWeek) {
  if (workDaysPerWeek >= 6) return dow !== 0; // Sunday off only
  return dow !== 0 && dow !== 6; // Saturday and Sunday off
}

/**
 * Days actually worked between two dates, both ends inclusive, counting only
 * the establishment's working days of the week. Paid public holidays are not
 * deducted: the Explanation to s.2A treats days of leave with full wages as
 * days worked.
 */
export function workingDaysBetween(startTs, endTs, workDaysPerWeek) {
  if (endTs < startTs) return 0;
  const totalDays = diffDays(startTs, endTs) + 1;
  const perWeek = workDaysPerWeek >= 6 ? 6 : 5;
  const fullWeeks = Math.floor(totalDays / 7);
  let count = fullWeeks * perWeek;
  const startDow = new Date(startTs).getUTCDay();
  const remainder = totalDays - fullWeeks * 7;
  for (let i = 0; i < remainder; i += 1) {
    if (isWorkingDayOfWeek((startDow + i) % 7, perWeek)) count += 1;
  }
  return count;
}

/** Earliest date on which `needed` working days have accrued from `anchorTs`. */
export function earliestDateMeetingWorkingDays(anchorTs, needed, workDaysPerWeek) {
  if (needed <= 0) return anchorTs;
  const perWeek = workDaysPerWeek >= 6 ? 6 : 5;
  let ts = addDays(anchorTs, Math.max(0, Math.floor((needed / perWeek) * 7) - 12));
  let guard = 0;
  while (workingDaysBetween(anchorTs, ts, perWeek) >= needed && guard < 60) {
    ts = addDays(ts, -1);
    guard += 1;
  }
  guard = 0;
  while (workingDaysBetween(anchorTs, ts, perWeek) < needed && guard < 60) {
    ts = addDays(ts, 1);
    guard += 1;
  }
  return ts;
}

/** Completed years, then completed months, then loose days of service. */
export function completedService(dojTs, lwdTs) {
  if (lwdTs < dojTs) return { years: 0, months: 0, days: 0 };
  let years = 0;
  while (addYears(dojTs, years + 1) <= lwdTs && years < 80) years += 1;
  const afterYears = addYears(dojTs, years);
  let months = 0;
  while (addMonths(afterYears, months + 1) <= lwdTs && months < 12) months += 1;
  const days = diffDays(addMonths(afterYears, months), lwdTs);
  return { years, months, days };
}

/** Completed whole calendar months between two dates. */
export function completedMonthsBetween(fromTs, toTs) {
  if (toTs <= fromTs) return 0;
  let months = 0;
  while (addMonths(fromTs, months + 1) <= toTs && months < 1200) months += 1;
  return months;
}

const inrRound = (n) => Math.round(n);

/* -------------------------------------------------------------- gratuity */

/**
 * Gratuity position on a given last working day.
 *
 * Returns both readings side by side: the settled five-year reading of s.4(1)
 * and the contested "4 years plus 240 days in the fifth year" reading built on
 * s.2A(2)(a). The second is a High Court reading (Madras High Court, Mettur
 * Beardsell Ltd. v. Regional Labour Commissioner, 1998 LLR 1072; followed by the
 * Kerala High Court in Sreeja B. v. Regional Joint Labour Commissioner, 2015).
 * It has not been settled uniformly and there is no binding Supreme Court ruling
 * on the point, so `contestedEligible` is reported separately and never merged
 * into the settled figure without a flag.
 */
export function computeGratuity({ dojTs, lwdTs, basicDaMonthly, workDaysPerWeek }) {
  const service = completedService(dojTs, lwdTs);
  const perWeek = workDaysPerWeek >= 6 ? 6 : 5;
  const threshold =
    perWeek >= 6 ? CONTINUOUS_SERVICE_DAYS_SIX_DAY_WEEK : CONTINUOUS_SERVICE_DAYS_SHORT_WEEK;

  const fourthAnniversary = addYears(dojTs, 4);
  const inFifthYear = lwdTs >= fourthAnniversary;
  const workedInFifthYear = inFifthYear
    ? workingDaysBetween(fourthAnniversary, lwdTs, perWeek)
    : 0;
  const calendarDaysInFifthYear = inFifthYear ? diffDays(fourthAnniversary, lwdTs) + 1 : 0;

  const strictEligible = service.years >= GRATUITY_STRICT_YEARS;
  const contestedEligible =
    !strictEligible && service.years >= 4 && workedInFifthYear >= threshold;

  // s.4(2): part of a year in excess of six months counts as a full year.
  const roundsUp = service.months > 6 || (service.months === 6 && service.days > 0);
  const payableYears = service.years + (roundsUp ? 1 : 0);

  const eligible = strictEligible || contestedEligible;
  const uncapped = eligible
    ? (GRATUITY_DAYS_PER_YEAR / GRATUITY_MONTH_DIVISOR) * basicDaMonthly * payableYears
    : 0;
  const amount = inrRound(Math.min(uncapped, GRATUITY_STATUTORY_CAP));
  const cappedByStatute = uncapped > GRATUITY_STATUTORY_CAP;

  return {
    service,
    strictEligible,
    contestedEligible,
    eligible,
    basis: strictEligible ? "settled" : contestedEligible ? "contested" : "none",
    threshold,
    workDaysPerWeek: perWeek,
    fourthAnniversary: toISODate(fourthAnniversary),
    workedInFifthYear,
    calendarDaysInFifthYear,
    shortOfThreshold: Math.max(0, threshold - workedInFifthYear),
    payableYears: eligible ? payableYears : 0,
    uncapped: inrRound(uncapped),
    amount,
    cappedByStatute,
    exempt: inrRound(Math.min(amount, GRATUITY_EXEMPTION_CAP)),
  };
}

/* ------------------------------------------------- leave encashment */

/**
 * Exemption under s.10(10AA)(ii): the least of the ceiling, the amount actually
 * received, ten months' average salary, and the cash value of leave credited at
 * 30 days per completed year of service.
 */
export function computeLeaveEncashmentExemption({
  encashment,
  balanceDays,
  avgMonthlySalary,
  completedYears,
}) {
  const limbCeiling = LEAVE_ENCASHMENT_EXEMPTION_CAP;
  const limbActual = encashment;
  const limbTenMonths = LEAVE_EXEMPT_AVERAGE_MONTHS * avgMonthlySalary;
  const creditDays = Math.min(
    balanceDays,
    LEAVE_EXEMPT_DAYS_PER_COMPLETED_YEAR * completedYears,
  );
  const limbThirtyDayCredit = creditDays * (avgMonthlySalary / PAYROLL_DAYS_PER_MONTH);
  const exempt = Math.max(
    0,
    Math.min(limbCeiling, limbActual, limbTenMonths, limbThirtyDayCredit),
  );
  return {
    exempt: inrRound(exempt),
    limbCeiling: inrRound(limbCeiling),
    limbActual: inrRound(limbActual),
    limbTenMonths: inrRound(limbTenMonths),
    limbThirtyDayCredit: inrRound(limbThirtyDayCredit),
    creditDays,
  };
}

/* --------------------------------------------------------- validation */

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function normaliseInput(raw) {
  const dojTs = parseISODate(raw.dateOfJoining);
  const todayTs = parseISODate(raw.today);
  const resignationTs = parseISODate(raw.resignationDate ?? raw.today);
  const bonusTs = raw.bonusAmount > 0 ? parseISODate(raw.bonusDate) : null;

  if (dojTs === null) return { error: "Enter a valid date of joining as YYYY-MM-DD." };
  if (todayTs === null) return { error: "Enter a valid current date as YYYY-MM-DD." };
  if (resignationTs === null) {
    return { error: "Enter a valid resignation date as YYYY-MM-DD." };
  }
  if (todayTs < dojTs) return { error: "The current date is before your date of joining." };
  if (resignationTs < dojTs) {
    return { error: "The resignation date is before your date of joining." };
  }
  if (diffDays(dojTs, todayTs) > 80 * 365) {
    return { error: "That is more than 80 years of service. Check the date of joining." };
  }

  const grossMonthly = Number(raw.grossMonthly);
  const basicDaMonthly = Number(raw.basicDaMonthly);
  const noticeDays = Number(raw.noticeDays);
  const leaveBalanceDays = Number(raw.leaveBalanceDays);
  const leaveAccrualPerMonth = Number(raw.leaveAccrualPerMonth);
  const leaveDivisor = Number(raw.leaveDivisor);
  const bonusAmount = Number(raw.bonusAmount);
  const marginalRate = Number(raw.marginalRate);
  const workDaysPerWeek = Number(raw.workDaysPerWeek) >= 6 ? 6 : 5;

  if (!isFiniteNumber(grossMonthly) || grossMonthly <= 0) {
    return { error: "Monthly gross salary must be a number greater than zero." };
  }
  if (grossMonthly > MAX_MONTHLY_AMOUNT) {
    return { error: "Monthly gross salary is above the Rs 10 crore limit this page handles." };
  }
  if (!isFiniteNumber(basicDaMonthly) || basicDaMonthly <= 0) {
    return { error: "Monthly basic plus DA must be a number greater than zero." };
  }
  if (basicDaMonthly > grossMonthly) {
    return { error: "Basic plus DA cannot be more than the monthly gross salary." };
  }
  if (!isFiniteNumber(noticeDays) || noticeDays < 0) {
    return { error: "Notice period must be zero or more days." };
  }
  if (noticeDays > MAX_NOTICE_DAYS) {
    return { error: "Notice period above 365 days is outside the range this page handles." };
  }
  if (!isFiniteNumber(leaveBalanceDays) || leaveBalanceDays < 0) {
    return { error: "Leave balance must be zero or more days." };
  }
  if (leaveBalanceDays > MAX_LEAVE_BALANCE_DAYS) {
    return { error: "A leave balance above 1000 days is outside the range this page handles." };
  }
  if (!isFiniteNumber(leaveAccrualPerMonth) || leaveAccrualPerMonth < 0 || leaveAccrualPerMonth > 10) {
    return { error: "Leave accrual must be between 0 and 10 days a month." };
  }
  if (leaveDivisor !== 26 && leaveDivisor !== 30) {
    return { error: "Leave encashment day basis must be 26 or 30 days a month." };
  }
  if (!isFiniteNumber(bonusAmount) || bonusAmount < 0) {
    return { error: "Bonus or retention amount must be zero or more." };
  }
  if (bonusAmount > MAX_ONE_OFF_AMOUNT) {
    return { error: "Bonus amount is above the Rs 100 crore limit this page handles." };
  }
  if (bonusAmount > 0 && bonusTs === null) {
    return { error: "Enter the bonus or retention clause date as YYYY-MM-DD." };
  }
  if (!isFiniteNumber(marginalRate) || marginalRate < 0 || marginalRate > 0.45) {
    return { error: "Marginal tax rate must be between 0% and 45%." };
  }

  return {
    dojTs,
    todayTs,
    resignationTs,
    bonusTs,
    grossMonthly,
    basicDaMonthly,
    noticeDays,
    leaveBalanceDays,
    leaveAccrualPerMonth,
    leaveDivisor,
    bonusAmount,
    bonusMode: raw.bonusMode === "clawback" ? "clawback" : "payout",
    noticeRecoveryBasis: raw.noticeRecoveryBasis === "gross" ? "gross" : "basic",
    marginalRate,
    workDaysPerWeek,
  };
}

/* ---------------------------------------------------------- scenario */

/** Full rupee picture for one candidate last working day. */
export function computeScenario(input, lwdTs) {
  const daysAhead = Math.max(0, diffDays(input.todayTs, lwdTs));
  const dailyGross = input.grossMonthly / PAYROLL_DAYS_PER_MONTH;
  const salaryAhead = inrRound(daysAhead * dailyGross);

  const noticeServed = Math.max(0, diffDays(input.resignationTs, lwdTs));
  const noticeShortfall = Math.max(0, input.noticeDays - noticeServed);
  const recoveryBase =
    input.noticeRecoveryBasis === "gross" ? input.grossMonthly : input.basicDaMonthly;
  const noticeRecovery = inrRound(
    noticeShortfall * (recoveryBase / PAYROLL_DAYS_PER_MONTH),
  );

  const monthsAhead = completedMonthsBetween(input.todayTs, lwdTs);
  const leaveDays = input.leaveBalanceDays + input.leaveAccrualPerMonth * monthsAhead;
  const leaveDayRate = input.basicDaMonthly / input.leaveDivisor;
  const leaveEncashment = inrRound(leaveDays * leaveDayRate);

  const gratuity = computeGratuity({
    dojTs: input.dojTs,
    lwdTs,
    basicDaMonthly: input.basicDaMonthly,
    workDaysPerWeek: input.workDaysPerWeek,
  });

  const leaveExemption = computeLeaveEncashmentExemption({
    encashment: leaveEncashment,
    balanceDays: leaveDays,
    avgMonthlySalary: input.basicDaMonthly,
    completedYears: gratuity.service.years,
  });

  let bonusReceived = 0;
  let bonusClawback = 0;
  if (input.bonusAmount > 0 && input.bonusTs !== null) {
    if (input.bonusMode === "payout") {
      bonusReceived = lwdTs >= input.bonusTs ? inrRound(input.bonusAmount) : 0;
    } else {
      bonusClawback = lwdTs < input.bonusTs ? inrRound(input.bonusAmount) : 0;
    }
  }

  // Exit-linked settlement only. Salary for days still worked is held apart
  // because it grows with every extra day and would otherwise swamp the effect
  // of the exit date itself.
  const settlementTotal =
    gratuity.amount + leaveEncashment + bonusReceived - noticeRecovery - bonusClawback;
  const total = salaryAhead + settlementTotal;

  const exemptTotal = gratuity.exempt + leaveExemption.exempt;
  // s.16 provides no deduction for notice pay recovered, so the recovery is not
  // netted off the taxable base in the default view.
  const taxableBase = Math.max(
    0,
    salaryAhead +
      bonusReceived +
      (gratuity.amount - gratuity.exempt) +
      (leaveEncashment - leaveExemption.exempt),
  );
  const effectiveRate = input.marginalRate * (1 + HEALTH_AND_EDUCATION_CESS);
  const estimatedTax = inrRound(taxableBase * effectiveRate);
  const afterTaxTotal = total - estimatedTax;

  // Tax that turns on how the buyout is treated. Under the default view the
  // recovery is not deductible, so tax is paid on salary the employee never
  // keeps; if the employer instead nets it off in Form 16 (the view taken by
  // the ITAT Ahmedabad bench in Nandinho Rebello v. DCIT, ITA 2378/Ahd/2013,
  // order dated 18 April 2017) this much tax is not paid.
  const buyoutTaxSwing = inrRound(noticeRecovery * effectiveRate);
  const recoveryPreTaxCost =
    effectiveRate < 1 ? inrRound(noticeRecovery / (1 - effectiveRate)) : noticeRecovery;

  return {
    lwd: toISODate(lwdTs),
    lwdTs,
    daysAhead,
    salaryAhead,
    noticeServed,
    noticeShortfall,
    noticeRecovery,
    noticeRecoverySigned: -noticeRecovery,
    recoveryPreTaxCost,
    buyoutTaxSwing,
    leaveDays: Math.round(leaveDays * 100) / 100,
    leaveEncashment,
    leaveExemption,
    gratuity,
    bonusReceived,
    bonusClawback,
    bonusNet: bonusReceived - bonusClawback,
    settlementTotal,
    total,
    exemptTotal,
    taxableBase,
    estimatedTax,
    effectiveRate,
    afterTaxTotal,
    fiscalYear: fiscalYearLabel(lwdTs),
    monthLabel: `${new Date(lwdTs).getUTCFullYear()}-${String(new Date(lwdTs).getUTCMonth() + 1).padStart(2, "0")}`,
  };
}

/* ------------------------------------------------------- candidates */

function pushCandidate(map, ts, reason, horizonEnd, todayTs) {
  if (ts < todayTs || ts > horizonEnd) return;
  const key = toISODate(ts);
  const existing = map.get(key);
  if (existing) {
    if (!existing.reasons.includes(reason)) existing.reasons.push(reason);
    return;
  }
  map.set(key, { ts, reasons: [reason] });
}

/** Build the list of last-working-day candidates worth pricing. */
export function buildCandidateDates(input) {
  const { todayTs, dojTs, resignationTs } = input;
  const horizonEnd = addDays(todayTs, HORIZON_DAYS);
  const map = new Map();

  pushCandidate(map, todayTs, "Leaving today", horizonEnd, todayTs);
  pushCandidate(
    map,
    addDays(resignationTs, input.noticeDays),
    `Full ${input.noticeDays}-day notice served from the resignation date`,
    horizonEnd,
    todayTs,
  );

  const perWeek = input.workDaysPerWeek;
  const threshold =
    perWeek >= 6 ? CONTINUOUS_SERVICE_DAYS_SIX_DAY_WEEK : CONTINUOUS_SERVICE_DAYS_SHORT_WEEK;
  const fourthAnniversary = addYears(dojTs, 4);
  pushCandidate(
    map,
    earliestDateMeetingWorkingDays(fourthAnniversary, threshold, perWeek),
    `4 years plus ${threshold} days worked in the 5th year (contested s.2A reading)`,
    horizonEnd,
    todayTs,
  );

  for (let year = 4; year <= 12; year += 1) {
    const anniversary = addYears(dojTs, year);
    if (year >= GRATUITY_STRICT_YEARS) {
      pushCandidate(
        map,
        anniversary,
        `${year} years of continuous service completed (s.4(1))`,
        horizonEnd,
        todayTs,
      );
    }
    pushCandidate(
      map,
      addDays(addMonths(anniversary, 6), 1),
      `${year} years and 6 months plus a day — s.4(2) rounds the gratuity to ${year + 1} years`,
      horizonEnd,
      todayTs,
    );
  }

  for (let i = 0; i < 4; i += 1) {
    pushCandidate(
      map,
      endOfMonth(addMonths(todayTs, i)),
      "Last day of a payroll month",
      horizonEnd,
      todayTs,
    );
  }

  const fyEnd = fiscalYearEnd(todayTs);
  pushCandidate(map, fyEnd, "31 March — last day of the financial year", horizonEnd, todayTs);
  pushCandidate(
    map,
    addDays(fyEnd, 1),
    "1 April — payout falls in the next financial year",
    horizonEnd,
    todayTs,
  );
  pushCandidate(
    map,
    fiscalYearEnd(addYears(todayTs, 1)),
    "31 March — last day of the following financial year",
    horizonEnd,
    todayTs,
  );

  if (input.bonusAmount > 0 && input.bonusTs !== null) {
    if (input.bonusMode === "payout") {
      pushCandidate(map, input.bonusTs, "Bonus or retention payout date", horizonEnd, todayTs);
    } else {
      pushCandidate(
        map,
        input.bonusTs,
        "Clawback window closes on this date",
        horizonEnd,
        todayTs,
      );
      pushCandidate(
        map,
        addDays(input.bonusTs, -1),
        "Last day still inside the clawback window",
        horizonEnd,
        todayTs,
      );
    }
  }

  return [...map.values()].sort((a, b) => a.ts - b.ts);
}

/* ------------------------------------------------------------- main */

/**
 * Price every candidate last working day and rank them by total rupee outcome
 * before income tax. Returns { error } on unusable input.
 */
export function rankResignationDates(rawInput) {
  const input = normaliseInput(rawInput ?? {});
  if (input.error) return { error: input.error };

  const candidates = buildCandidateDates(input);
  if (candidates.length === 0) {
    return { error: "No candidate last working day falls inside the two-year horizon." };
  }

  const rows = candidates.map((candidate) => ({
    ...computeScenario(input, candidate.ts),
    reasons: candidate.reasons,
  }));

  const baseline =
    rows.find((row) => row.lwdTs === input.todayTs) ?? computeScenario(input, input.todayTs);

  const withDelta = rows.map((row) => ({
    ...row,
    delta: row.total - baseline.total,
    settlementDelta: row.settlementTotal - baseline.settlementTotal,
    afterTaxDelta: row.afterTaxTotal - baseline.afterTaxTotal,
  }));

  const ranked = withDelta
    .filter((row) => row.lwdTs !== baseline.lwdTs)
    .sort((a, b) => b.total - a.total || a.lwdTs - b.lwdTs)
    .slice(0, 3);

  const byDate = [...withDelta].sort((a, b) => a.lwdTs - b.lwdTs);

  const fiscalYears = new Set(byDate.map((row) => row.fiscalYear));
  const gratuityFlip = byDate.some((row) => row.gratuity.basis === "contested");
  const settledFlip =
    !baseline.gratuity.strictEligible && byDate.some((row) => row.gratuity.strictEligible);

  return {
    baseline: { ...baseline, delta: 0, settlementDelta: 0, afterTaxDelta: 0 },
    ranked,
    byDate,
    flags: {
      crossesFiscalYear: fiscalYears.size > 1,
      fiscalYears: [...fiscalYears],
      anyContestedGratuity: gratuityFlip,
      settledEligibilityAhead: settledFlip,
      strictEligibleDate: toISODate(addYears(input.dojTs, GRATUITY_STRICT_YEARS)),
      contestedEligibleDate: toISODate(
        earliestDateMeetingWorkingDays(
          addYears(input.dojTs, 4),
          input.workDaysPerWeek >= 6
            ? CONTINUOUS_SERVICE_DAYS_SIX_DAY_WEEK
            : CONTINUOUS_SERVICE_DAYS_SHORT_WEEK,
          input.workDaysPerWeek,
        ),
      ),
      continuousServiceThreshold:
        input.workDaysPerWeek >= 6
          ? CONTINUOUS_SERVICE_DAYS_SIX_DAY_WEEK
          : CONTINUOUS_SERVICE_DAYS_SHORT_WEEK,
    },
  };
}
