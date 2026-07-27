/**
 * AI ROI Calculator — standard return-on-investment arithmetic applied to an AI
 * tool subscription:
 *
 *   value  = active seats × hours saved/user/week × weeks/month × loaded hourly rate
 *   ROI %  = (value − cost) / cost × 100      (the classic ROI formula)
 *
 * Nothing here is a forecast of model quality; it prices the time the team reports
 * saving against what the tool costs.
 */

/** Calendar average: 52 weeks / 12 months. Using 4 would understate a month by ~8%. */
export const WEEKS_PER_MONTH = 52 / 12;

export const MONTHS_PER_YEAR = 12;

/** Adoption is a share of seats actually using the tool, 0-100%. */
export const ADOPTION_MIN_PCT = 0;
export const ADOPTION_MAX_PCT = 100;

/**
 * Computes monthly and annual ROI for an AI tool.
 * All money figures are in the same currency unit the user enters.
 * Returns a result object or { error }.
 */
export function computeAiRoi({
  seats,
  costPerSeatMonthly,
  otherMonthlyCost = 0,
  hoursSavedPerUserPerWeek,
  hourlyRate,
  adoptionPct = 100,
}) {
  const s = Number(seats);
  const cps = Number(costPerSeatMonthly);
  const other = Number(otherMonthlyCost);
  const hrs = Number(hoursSavedPerUserPerWeek);
  const rate = Number(hourlyRate);
  const adoption = Number(adoptionPct);

  if (!Number.isFinite(s) || s <= 0 || !Number.isInteger(s)) {
    return { error: "Seats must be a whole number of at least 1." };
  }
  if (!Number.isFinite(cps) || cps < 0 || !Number.isFinite(other) || other < 0) {
    return { error: "Costs cannot be negative. Enter 0 if a cost does not apply." };
  }
  if (!Number.isFinite(hrs) || hrs < 0) {
    return { error: "Hours saved per user per week cannot be negative." };
  }
  // 168 hours in a week is the physical ceiling.
  if (hrs > 168) {
    return { error: "Hours saved per user per week cannot exceed 168 (a full week)." };
  }
  if (!Number.isFinite(rate) || rate <= 0) {
    return { error: "Hourly rate must be greater than zero." };
  }
  if (!Number.isFinite(adoption) || adoption < ADOPTION_MIN_PCT || adoption > ADOPTION_MAX_PCT) {
    return { error: "Adoption must be between 0 and 100 percent." };
  }

  const monthlyCost = s * cps + other;
  if (monthlyCost <= 0) {
    return { error: "Total monthly cost must be greater than zero to compute a return on it." };
  }

  const activeSeats = s * (adoption / 100);
  const monthlyHoursSaved = activeSeats * hrs * WEEKS_PER_MONTH;
  const monthlyValue = monthlyHoursSaved * rate;
  const netMonthly = monthlyValue - monthlyCost;
  const roiPct = (netMonthly / monthlyCost) * 100;

  // Hours each active user must save per week just to cover the cost.
  const hourValueDenominator = activeSeats * WEEKS_PER_MONTH * rate;
  const breakEvenHoursPerUserPerWeek =
    hourValueDenominator > 0 ? monthlyCost / hourValueDenominator : null;

  return {
    monthlyCost,
    activeSeats,
    monthlyHoursSaved,
    monthlyValue,
    netMonthly,
    roiPct,
    annualNet: netMonthly * MONTHS_PER_YEAR,
    annualHoursSaved: monthlyHoursSaved * MONTHS_PER_YEAR,
    breakEvenHoursPerUserPerWeek,
    paysForItself: netMonthly >= 0,
  };
}
