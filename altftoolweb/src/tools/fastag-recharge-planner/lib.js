/**
 * FASTag recharge planning.
 *
 * Toll rules used
 *  - Return-journey concession: under the National Highways Fee (Determination of
 *    Rates and Collection) Rules, 2008, a return journey completed within 24 hours
 *    of the outward journey is charged at one and a half times the one-way fee,
 *    so a same-day round trip costs 25% less than two single crossings.
 *  - Balance: NHAI withdrew the minimum-balance requirement for car, jeep and van
 *    (fee class 4) FASTags in February 2021, so the threshold below is your own
 *    safety buffer rather than a rule. A tag is blocked when the balance cannot
 *    cover a crossing.
 *
 * All dates are "YYYY-MM-DD" handled in UTC and passed in as arguments.
 */

const MS_PER_DAY = 86400000;

/** Calendar constants used to turn a weekly habit into monthly and yearly figures. */
export const DAYS_PER_YEAR = 365.25;
export const DAYS_PER_MONTH = DAYS_PER_YEAR / 12;

/** NH Fee Rules, 2008 — a return trip inside 24 hours costs 1.5 one-way fares. */
export const RETURN_TRIP_MULTIPLIER = 1.5;

/** Round a recommended top-up up to a tidy figure. */
export const TOPUP_ROUNDING = 100;

export function parseDate(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const stamp = Date.UTC(year, month - 1, day);
  const probe = new Date(stamp);
  if (probe.getUTCFullYear() !== year) return NaN;
  if (probe.getUTCMonth() !== month - 1) return NaN;
  if (probe.getUTCDate() !== day) return NaN;
  return stamp;
}

export function toIsoDate(stamp) {
  if (!Number.isFinite(stamp)) return "";
  return new Date(stamp).toISOString().slice(0, 10);
}

export function addDays(isoDate, days) {
  const stamp = parseDate(isoDate);
  if (!Number.isFinite(stamp) || !Number.isFinite(days)) return "";
  return toIsoDate(stamp + Math.trunc(days) * MS_PER_DAY);
}

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * Work out the toll burn rate and the recharge rhythm it implies.
 *
 * @param {object} input
 * @param {number} input.oneWayFare      average fee for a single crossing
 * @param {number} input.tripsPerWeek    round trips per week if sameDayReturn, otherwise single crossings
 * @param {boolean} input.sameDayReturn  true when the return leg is inside 24 hours
 * @param {number} input.balance         current FASTag balance
 * @param {number} input.threshold       balance you never want to drop below
 * @param {number} input.targetDays      how long you want each recharge to last
 * @param {string} input.today           reference date "YYYY-MM-DD"
 * @param {number} [input.monthlyPass]   price of a local monthly pass, 0 if none
 */
export function planRecharges({
  oneWayFare,
  tripsPerWeek,
  sameDayReturn = true,
  balance,
  threshold = 0,
  targetDays = 30,
  today,
  monthlyPass = 0,
} = {}) {
  const numbers = { oneWayFare, tripsPerWeek, balance, threshold, targetDays, monthlyPass };
  for (const value of Object.values(numbers)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return { error: "Enter a valid number in every field." };
    }
  }
  if (!Number.isFinite(parseDate(today))) {
    return { error: "Reference date must be a real calendar date." };
  }
  if (oneWayFare < 0 || balance < 0 || threshold < 0 || monthlyPass < 0) {
    return { error: "Amounts cannot be negative." };
  }
  if (tripsPerWeek < 0) return { error: "Trips per week cannot be negative." };
  if (tripsPerWeek > 200) return { error: "More than 200 trips a week is not a realistic pattern." };
  if (!(targetDays > 0) || targetDays > 365) {
    return { error: "A recharge should be planned to last between 1 and 365 days." };
  }
  const costPerTrip = sameDayReturn ? oneWayFare * RETURN_TRIP_MULTIPLIER : oneWayFare;
  const weeklySpend = costPerTrip * tripsPerWeek;
  const dailyBurn = weeklySpend / 7;
  const monthlySpend = dailyBurn * DAYS_PER_MONTH;
  const annualSpend = dailyBurn * DAYS_PER_YEAR;

  // Same-day return concession, expressed against paying two single fares.
  const savingPerReturnTrip = sameDayReturn
    ? oneWayFare * (2 - RETURN_TRIP_MULTIPLIER)
    : 0;
  const annualConcessionSaving = savingPerReturnTrip * tripsPerWeek * (DAYS_PER_YEAR / 7);

  const usableBalance = balance - threshold;
  let daysOfCover = null;
  let rechargeOn = today;
  let rechargeMessage = "";
  if (dailyBurn <= 0) {
    rechargeMessage = "No toll usage entered, so the balance is not going down.";
  } else if (usableBalance <= 0) {
    daysOfCover = 0;
    rechargeMessage = "The balance is already at or below your buffer — top up now.";
  } else {
    daysOfCover = Math.floor(usableBalance / dailyBurn);
    rechargeOn = addDays(today, daysOfCover);
    rechargeMessage = `Balance covers about ${daysOfCover} days of tolls before it reaches your buffer.`;
  }

  const rawTopUp = dailyBurn * targetDays;
  const recommendedTopUp =
    rawTopUp <= 0 ? 0 : Math.ceil(rawTopUp / TOPUP_ROUNDING) * TOPUP_ROUNDING;
  const rechargesPerYear = dailyBurn <= 0 ? 0 : DAYS_PER_YEAR / targetDays;

  const schedule = [];
  if (dailyBurn > 0) {
    let cursor = rechargeOn;
    for (let index = 0; index < 6; index += 1) {
      schedule.push({
        date: cursor,
        amount: recommendedTopUp,
        coversUntil: addDays(cursor, Math.trunc(targetDays)),
      });
      cursor = addDays(cursor, Math.trunc(targetDays));
    }
  }

  const passVerdict =
    monthlyPass > 0
      ? monthlyPass < monthlySpend
        ? {
            better: "pass",
            saving: round2(monthlySpend - monthlyPass),
          }
        : { better: "payPerUse", saving: round2(monthlyPass - monthlySpend) }
      : null;

  return {
    costPerTrip: round2(costPerTrip),
    weeklySpend: round2(weeklySpend),
    dailyBurn: round2(dailyBurn),
    monthlySpend: round2(monthlySpend),
    annualSpend: round2(annualSpend),
    savingPerReturnTrip: round2(savingPerReturnTrip),
    annualConcessionSaving: round2(annualConcessionSaving),
    usableBalance: round2(usableBalance),
    daysOfCover,
    rechargeOn: dailyBurn > 0 ? rechargeOn : "",
    rechargeMessage,
    recommendedTopUp,
    rechargesPerYear: round2(rechargesPerYear),
    rechargesPerYearWhole: dailyBurn <= 0 ? 0 : Math.ceil(rechargesPerYear),
    schedule,
    monthlyPass: round2(monthlyPass),
    passVerdict,
  };
}

/** What a single top-up buys, in days and in crossings. */
export function topUpCoverage(amount, dailyBurn, costPerTrip) {
  if (!Number.isFinite(amount) || amount < 0) {
    return { error: "Top-up amount must be zero or more." };
  }
  if (!Number.isFinite(dailyBurn) || dailyBurn <= 0) {
    return { error: "Enter your toll usage first." };
  }
  if (!Number.isFinite(costPerTrip) || costPerTrip <= 0) {
    return { error: "Enter a toll fee greater than zero." };
  }
  return {
    days: Math.floor(amount / dailyBurn),
    trips: Math.floor(amount / costPerTrip),
  };
}
