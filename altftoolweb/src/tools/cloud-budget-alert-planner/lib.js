/**
 * Cloud budget alert planning maths.
 *
 * The threshold ladder mirrors what the providers themselves default to:
 *  - GCP Billing budgets create alerts at 50%, 90% and 100% of budget.
 *  - AWS Budgets' recommended template alerts at 85% actual and at
 *    100% of the *forecasted* month-end spend.
 * The forecast used here is the same linear run-rate model the consoles
 * show for early-month projections: month-to-date spend divided by days
 * elapsed, extrapolated across the month.
 */

/**
 * Actual-spend alert thresholds (percent of budget).
 * 50%: early heads-up (GCP default) — 85%: act now (AWS recommended)
 * — 100%: budget exhausted.
 */
export const ACTUAL_THRESHOLDS = [50, 85, 100];

/** Forecast alert threshold: fire when projected month-end spend reaches 100% of budget. */
export const FORECAST_THRESHOLD = 100;

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Plan alert thresholds from month-to-date spend.
 *
 * @param {object} input
 * @param {number} input.monthlyBudget    Budget for the calendar month.
 * @param {number} input.monthToDateSpend Spend so far this month.
 * @param {number} input.dayOfMonth       Days elapsed (1-31), i.e. today's day number.
 * @param {number} input.daysInMonth      Days in this month (28-31).
 * @returns {object} plan, or { error }.
 */
export function planBudgetAlerts({ monthlyBudget, monthToDateSpend, dayOfMonth, daysInMonth }) {
  const budget = Number(monthlyBudget);
  const spend = Number(monthToDateSpend);
  const day = Number(dayOfMonth);
  const days = Number(daysInMonth);

  if (!Number.isFinite(budget) || budget <= 0) {
    return { error: "Enter a monthly budget greater than zero." };
  }
  if (!Number.isFinite(spend) || spend < 0) {
    return { error: "Month-to-date spend cannot be negative." };
  }
  if (!Number.isFinite(days) || !Number.isInteger(days) || days < 28 || days > 31) {
    return { error: "Days in month must be a whole number between 28 and 31." };
  }
  if (!Number.isFinite(day) || !Number.isInteger(day) || day < 1 || day > days) {
    return { error: `Day of month must be a whole number between 1 and ${days}.` };
  }

  // Linear run-rate forecast: the model cloud consoles use early in the month.
  const dailyRunRate = spend / day;
  const forecast = dailyRunRate * days;
  const percentUsed = (spend / budget) * 100;
  const forecastPercent = (forecast / budget) * 100;
  // On a perfectly even burn you should have used day/days of the budget by now.
  const expectedPercentToday = (day / days) * 100;
  const onTrack = forecast <= budget;

  // Day of month each actual-spend threshold trips at the current run rate.
  const thresholdDay = (percent) => {
    if (dailyRunRate <= 0) return null;
    const hitDay = Math.ceil((budget * (percent / 100)) / dailyRunRate);
    return hitDay <= days ? hitDay : null;
  };

  const actualAlerts = ACTUAL_THRESHOLDS.map((percent) => ({
    percent,
    amount: round2(budget * (percent / 100)),
    alreadyPassed: percentUsed >= percent,
    projectedDay: thresholdDay(percent),
  }));

  // The forecast trigger fires as soon as projected month-end spend >= budget,
  // which at a constant run rate is true from day one whenever forecast >= budget.
  const forecastAlert = {
    percent: FORECAST_THRESHOLD,
    amount: round2(budget),
    firing: forecast >= budget && spend > 0,
  };

  const exhaustionDay = thresholdDay(100);

  return {
    budget: round2(budget),
    spend: round2(spend),
    dailyRunRate: round2(dailyRunRate),
    forecast: round2(forecast),
    forecastPercent: round2(forecastPercent),
    percentUsed: round2(percentUsed),
    expectedPercentToday: round2(expectedPercentToday),
    onTrack,
    projectedOverspend: round2(Math.max(0, forecast - budget)),
    remainingBudget: round2(Math.max(0, budget - spend)),
    // Max average daily spend for the rest of the month that still lands on budget.
    safeDailySpend:
      day < days ? round2(Math.max(0, budget - spend) / (days - day)) : round2(Math.max(0, budget - spend)),
    exhaustionDay,
    actualAlerts,
    forecastAlert,
    dayOfMonth: day,
    daysInMonth: days,
  };
}
