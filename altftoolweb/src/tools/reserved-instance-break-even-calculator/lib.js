/**
 * Reserved instance / committed-use break-even maths.
 *
 * Cloud reservations (AWS Reserved Instances and Savings Plans, Azure
 * Reservations, GCP Committed Use Discounts) all share one structure:
 * you commit for a fixed term (1 or 3 years), optionally pay an upfront
 * amount, and pay a lower recurring rate for the whole term whether or
 * not the instance runs. The reservation only wins if you actually use
 * the capacity long enough. This module computes that break-even point.
 */

/**
 * Billing convention: clouds price a month as 730 hours (8,760 h / 12).
 * AWS, Azure and GCP all use this figure on their pricing pages.
 */
export const HOURS_PER_MONTH = 730;

/** Supported commitment terms, in months. */
export const TERM_OPTIONS = [
  { id: "1yr", label: "1-year commitment", months: 12 },
  { id: "3yr", label: "3-year commitment", months: 36 },
];

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Compute break-even uptime for a reservation against on-demand pricing.
 *
 * The reservation costs `upfront + reservedHourly * 730 * termMonths`
 * no matter what. Paying on demand costs `onDemandHourly * 730` for each
 * month the workload actually runs. Break-even months m* solves:
 *   onDemandHourly * 730 * m* = total reservation cost
 *
 * @param {object} input
 * @param {number} input.onDemandHourly  On-demand price per hour (USD).
 * @param {number} input.reservedHourly  Effective recurring reserved price per hour (0 for all-upfront).
 * @param {number} input.upfront         One-time upfront payment (USD).
 * @param {string} input.termId          One of TERM_OPTIONS ids.
 * @returns {object} break-even analysis, or { error }.
 */
export function computeBreakEven({ onDemandHourly, reservedHourly, upfront, termId = "1yr" }) {
  const od = Number(onDemandHourly);
  const res = Number(reservedHourly);
  const up = Number(upfront);

  if (!Number.isFinite(od)) return { error: "Enter the on-demand hourly rate as a number." };
  if (od <= 0) return { error: "The on-demand hourly rate must be greater than zero." };
  if (!Number.isFinite(res) || res < 0) {
    return { error: "The reserved hourly rate cannot be negative (use 0 for all-upfront)." };
  }
  if (!Number.isFinite(up) || up < 0) return { error: "The upfront payment cannot be negative." };
  if (res === 0 && up === 0) {
    return { error: "A reservation with no upfront and a $0 hourly rate is free — enter its real price." };
  }

  const term = TERM_OPTIONS.find((t) => t.id === termId);
  if (!term) return { error: "Choose a 1-year or 3-year term." };

  const termMonths = term.months;
  const monthlyOnDemand = od * HOURS_PER_MONTH;
  const monthlyReservedRecurring = res * HOURS_PER_MONTH;
  const totalReserved = up + monthlyReservedRecurring * termMonths;
  const totalOnDemandFullTerm = monthlyOnDemand * termMonths;

  // Months of actual usage at which cumulative on-demand spend equals the
  // committed reservation cost.
  const breakEvenMonths = totalReserved / monthlyOnDemand;
  const paysOff = breakEvenMonths <= termMonths;
  const minUtilizationPercent = (breakEvenMonths / termMonths) * 100;

  const savingsFullTerm = totalOnDemandFullTerm - totalReserved;
  const savingsPercent = (savingsFullTerm / totalOnDemandFullTerm) * 100;

  return {
    termMonths,
    termLabel: term.label,
    monthlyOnDemand: round2(monthlyOnDemand),
    monthlyReservedRecurring: round2(monthlyReservedRecurring),
    totalReserved: round2(totalReserved),
    totalOnDemandFullTerm: round2(totalOnDemandFullTerm),
    breakEvenMonths: round2(breakEvenMonths),
    paysOff,
    minUtilizationPercent: round2(minUtilizationPercent),
    savingsFullTerm: round2(savingsFullTerm),
    savingsPercent: round2(savingsPercent),
  };
}
