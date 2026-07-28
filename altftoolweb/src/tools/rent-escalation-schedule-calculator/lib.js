/**
 * Rent escalation schedule calculator.
 *
 * A commercial or residential lease normally fixes rent for a block of years and
 * then steps it up. The escalation clause is one of two shapes:
 *
 *   Percentage:  rent(step) = baseRent x (1 + p/100)^step
 *   Fixed amount: rent(step) = baseRent + (a x step)
 *
 * where step = floor(leaseYearIndex / escalationEveryYears) and leaseYearIndex is
 * the zero-based lease year the month falls in. So a 5% escalation every year
 * compounds — a common source of disputes, because 5% a year over nine years is a
 * 55% rise, not 45%. A "10% every 3 years" clause steps only at months 36 and 72.
 *
 * The schedule is built month by month so a term that is not a whole number of
 * years (a 30-month lease, say) produces a correct final partial year, and so a
 * rent-free fit-out period can be applied to the opening months.
 *
 * Effective annual escalation is computed as a compound annual growth rate:
 *   CAGR = (finalRent / baseRent)^(1 / yearsBetweenThem) - 1
 * which lets a "fixed Rs 3,000 every 2 years" clause be compared like-for-like
 * with a percentage clause.
 */

/** Longest lease term the schedule will build, in months (50 years). */
export const MAX_TERM_MONTHS = 600;

/** Cap on a single escalation step, as a sanity guard on input. */
export const MAX_ESCALATION_PERCENT = 100;

export const ESCALATION_TYPES = [
  { id: "percentage", label: "Percentage of the previous rent (compounding)" },
  { id: "fixed", label: "Fixed amount added to the base rent" },
];

const round2 = (value) => Math.round(value * 100) / 100;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @param {object} input
 * @param {number} input.baseMonthlyRent      Rent for month 1.
 * @param {string} input.escalationType       "percentage" or "fixed".
 * @param {number} input.escalationValue      Percent per step, or amount per step.
 * @param {number} input.escalationEveryYears Years between steps (1 = every year).
 * @param {number} input.termMonths           Lease term in months.
 * @param {number} input.rentFreeMonths       Opening months at zero rent.
 * @param {number} input.securityDepositMonths Deposit expressed in months of base rent.
 * @param {number} input.monthlyMaintenance   Non-escalating monthly charge, if any.
 * @returns {object} schedule and totals, or { error }.
 */
export function buildRentSchedule({
  baseMonthlyRent = 0,
  escalationType = "percentage",
  escalationValue = 0,
  escalationEveryYears = 1,
  termMonths = 36,
  rentFreeMonths = 0,
  securityDepositMonths = 0,
  monthlyMaintenance = 0,
} = {}) {
  const numbers = {
    baseMonthlyRent,
    escalationValue,
    escalationEveryYears,
    termMonths,
    rentFreeMonths,
    securityDepositMonths,
    monthlyMaintenance,
  };
  for (const key of Object.keys(numbers)) {
    if (!isNum(numbers[key])) return { error: "Enter a valid number in every field." };
    if (numbers[key] < 0) return { error: "Rents, terms and charges cannot be negative." };
  }

  if (!ESCALATION_TYPES.some((item) => item.id === escalationType)) {
    return { error: "Choose a percentage or a fixed-amount escalation." };
  }
  if (baseMonthlyRent <= 0) return { error: "Base monthly rent must be greater than zero." };
  if (termMonths < 1) return { error: "The lease term must be at least one month." };
  if (termMonths > MAX_TERM_MONTHS) {
    return { error: `Enter a lease term of ${MAX_TERM_MONTHS} months (50 years) or fewer.` };
  }
  if (escalationEveryYears < 1) {
    return { error: "Rent can step up at most once a year — enter 1 or more." };
  }
  if (escalationEveryYears > 25) {
    return { error: "Enter an escalation interval of 25 years or fewer." };
  }
  if (escalationType === "percentage" && escalationValue > MAX_ESCALATION_PERCENT) {
    return { error: `Enter an escalation of ${MAX_ESCALATION_PERCENT}% or less per step.` };
  }
  if (rentFreeMonths >= termMonths) {
    return { error: "The rent-free period must be shorter than the lease term." };
  }

  const term = Math.floor(termMonths);
  const free = Math.floor(rentFreeMonths);
  const interval = Math.floor(escalationEveryYears);

  const rentForMonth = (monthIndex) => {
    const leaseYear = Math.floor(monthIndex / 12);
    const step = Math.floor(leaseYear / interval);
    if (escalationType === "percentage") {
      return baseMonthlyRent * Math.pow(1 + escalationValue / 100, step);
    }
    return baseMonthlyRent + escalationValue * step;
  };

  const rows = [];
  let totalRent = 0;
  let totalMaintenance = 0;
  let currentRow = null;

  for (let monthIndex = 0; monthIndex < term; monthIndex += 1) {
    const leaseYear = Math.floor(monthIndex / 12) + 1;
    const contractRent = rentForMonth(monthIndex);
    const payable = monthIndex < free ? 0 : contractRent;

    if (!currentRow || currentRow.year !== leaseYear) {
      currentRow = {
        year: leaseYear,
        monthlyRent: round2(contractRent),
        months: 0,
        freeMonths: 0,
        rentPaid: 0,
        maintenancePaid: 0,
      };
      rows.push(currentRow);
    }

    currentRow.months += 1;
    if (monthIndex < free) currentRow.freeMonths += 1;
    currentRow.rentPaid += payable;
    currentRow.maintenancePaid += monthlyMaintenance;
    totalRent += payable;
    totalMaintenance += monthlyMaintenance;
  }

  for (const row of rows) {
    row.rentPaid = round2(row.rentPaid);
    row.maintenancePaid = round2(row.maintenancePaid);
    row.total = round2(row.rentPaid + row.maintenancePaid);
  }

  let cumulative = 0;
  for (const row of rows) {
    cumulative += row.total;
    row.cumulative = round2(cumulative);
  }

  const finalMonthlyRent = rentForMonth(term - 1);
  const totalIncreasePercent = ((finalMonthlyRent - baseMonthlyRent) / baseMonthlyRent) * 100;

  // Whole lease years between the first lease year and the last one.
  const yearsSpanned = rows.length - 1;
  const effectiveAnnualPercent =
    yearsSpanned > 0 && finalMonthlyRent > 0
      ? (Math.pow(finalMonthlyRent / baseMonthlyRent, 1 / yearsSpanned) - 1) * 100
      : 0;

  const stepCount = rows.filter(
    (row, index) => index > 0 && row.monthlyRent !== rows[index - 1].monthlyRent,
  ).length;

  return {
    rows,
    totalRent: round2(totalRent),
    totalMaintenance: round2(totalMaintenance),
    totalOutgo: round2(totalRent + totalMaintenance),
    averageMonthlyRent: round2(totalRent / term),
    finalMonthlyRent: round2(finalMonthlyRent),
    baseMonthlyRent: round2(baseMonthlyRent),
    totalIncreasePercent: round2(totalIncreasePercent),
    effectiveAnnualPercent: round2(effectiveAnnualPercent),
    securityDeposit: round2(baseMonthlyRent * securityDepositMonths),
    rentFreeValue: round2(
      Array.from({ length: Math.min(free, term) }, (unused, index) => rentForMonth(index)).reduce(
        (sum, value) => sum + value,
        0,
      ),
    ),
    termMonths: term,
    rentFreeMonths: free,
    stepCount,
  };
}
