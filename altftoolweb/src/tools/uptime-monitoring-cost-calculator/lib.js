/**
 * Uptime Monitoring Cost Calculator — pure logic. No React, no DOM.
 *
 * Two pricing models are supported because that is how synthetic-monitoring
 * vendors actually bill:
 *   - per check run  (metered: you buy a bucket of check executions, e.g. per 1,000)
 *   - per monitor    (seat-style: a flat monthly price per monitor, per location)
 *
 * Everything else is arithmetic on the calendar: check volume, detection time and
 * how the check interval compares with the downtime budget your SLO allows.
 */

/**
 * Average calendar month = 365.25 / 12 = 30.4375 days.
 * Using 30 or 31 skews annual figures by up to 3%, so the average is used
 * everywhere and the annual figure is simply the monthly figure times 12.
 */
export const AVERAGE_MONTH_DAYS = 365.25 / 12;
export const SECONDS_PER_MONTH = AVERAGE_MONTH_DAYS * 24 * 60 * 60; // 2,629,800
export const MINUTES_PER_MONTH = AVERAGE_MONTH_DAYS * 24 * 60; // 43,830
export const MONTHS_PER_YEAR = 12;

/** Check-run pricing is normally quoted per this many runs. */
export const CHECKS_PER_PRICING_BLOCK = 1000;

export const PRICING_MODELS = [
  {
    id: "perCheck",
    label: "Metered — price per 1,000 check runs",
    hint: "How usage-based synthetic monitoring is normally billed.",
  },
  {
    id: "perMonitor",
    label: "Per monitor — flat monthly price per monitor per location",
    hint: "How seat-style uptime plans are normally billed.",
  },
];

/** Common check intervals offered by uptime vendors, in seconds. */
export const INTERVAL_OPTIONS = [10, 30, 60, 120, 300, 600, 1800, 3600];

export const CURRENCIES = [
  { code: "USD", locale: "en-US" },
  { code: "EUR", locale: "de-DE" },
  { code: "GBP", locale: "en-GB" },
  { code: "INR", locale: "en-IN" },
];

/** Monthly downtime budget in minutes for an availability target. */
export function downtimeBudgetMinutes(availabilityPercent) {
  if (!Number.isFinite(availabilityPercent)) return 0;
  const clamped = Math.min(100, Math.max(0, availabilityPercent));
  return (MINUTES_PER_MONTH * (100 - clamped)) / 100;
}

/**
 * Compute monitoring cost and detection characteristics.
 *
 * @returns {object} full breakdown, or { error } for invalid input.
 */
export function computeMonitoringCost({
  endpoints = 1,
  intervalSeconds = 60,
  locations = 1,
  pricingModel = "perCheck",
  pricePerBlock = 0,
  pricePerMonitor = 0,
  platformFee = 0,
  alertsPerMonth = 0,
  pricePerAlert = 0,
  confirmationRetries = 1,
  retryDelaySeconds = 30,
  availabilityTarget = 99.9,
} = {}) {
  const n = Number(endpoints);
  const interval = Number(intervalSeconds);
  const loc = Number(locations);
  const block = Number(pricePerBlock);
  const perMonitor = Number(pricePerMonitor);
  const fee = Number(platformFee);
  const alerts = Number(alertsPerMonth);
  const alertPrice = Number(pricePerAlert);
  const retries = Number(confirmationRetries);
  const retryDelay = Number(retryDelaySeconds);
  const slo = Number(availabilityTarget);

  const numbers = [n, interval, loc, block, perMonitor, fee, alerts, alertPrice, retries, retryDelay, slo];
  if (numbers.some((value) => !Number.isFinite(value))) {
    return { error: "Enter a valid number in every field." };
  }
  if (n <= 0) return { error: "Monitor at least one endpoint." };
  if (!Number.isInteger(n)) return { error: "Endpoint count must be a whole number." };
  if (interval <= 0) return { error: "Check interval must be greater than zero seconds." };
  if (interval > SECONDS_PER_MONTH) return { error: "A check interval longer than a month is not monitoring." };
  if (loc <= 0 || !Number.isInteger(loc)) return { error: "Probe locations must be a whole number of at least 1." };
  if ([block, perMonitor, fee, alerts, alertPrice, retryDelay].some((value) => value < 0)) {
    return { error: "Prices, fees and volumes cannot be negative." };
  }
  if (retries < 0 || !Number.isInteger(retries)) return { error: "Confirmation retries must be 0 or a positive whole number." };
  if (slo <= 0 || slo > 100) return { error: "Availability target must be above 0% and at most 100%." };

  const model = PRICING_MODELS.find((item) => item.id === pricingModel);
  if (!model) return { error: "Pick a pricing model." };

  const runsPerEndpointPerLocation = SECONDS_PER_MONTH / interval;
  const checksPerMonth = n * loc * runsPerEndpointPerLocation;
  const monitorCount = n * loc;

  const checkCost =
    model.id === "perCheck" ? (checksPerMonth / CHECKS_PER_PRICING_BLOCK) * block : monitorCount * perMonitor;
  const alertCost = alerts * alertPrice;
  const monthlyCost = checkCost + alertCost + fee;
  const annualCost = monthlyCost * MONTHS_PER_YEAR;
  const costPerEndpoint = monthlyCost / n;
  const costPerThousandChecks = checksPerMonth > 0 ? (monthlyCost / checksPerMonth) * CHECKS_PER_PRICING_BLOCK : 0;

  // Detection time. A failure that starts just after a check runs is not seen
  // until the next run, so the wait averages half an interval, and each
  // confirmation retry adds its own delay before the alert fires.
  const meanDetectionSeconds = interval / 2 + retries * retryDelay;
  const worstDetectionSeconds = interval + retries * retryDelay;

  const budgetMinutes = downtimeBudgetMinutes(slo);
  const worstDetectionMinutes = worstDetectionSeconds / 60;
  const budgetShare = budgetMinutes > 0 ? (worstDetectionMinutes / budgetMinutes) * 100 : Infinity;

  return {
    model,
    checksPerMonth,
    checksPerDay: checksPerMonth / AVERAGE_MONTH_DAYS,
    monitorCount,
    checkCost,
    alertCost,
    platformFee: fee,
    monthlyCost,
    annualCost,
    costPerEndpoint,
    costPerThousandChecks,
    meanDetectionSeconds,
    worstDetectionSeconds,
    budgetMinutes,
    budgetShare: Number.isFinite(budgetShare) ? budgetShare : 100,
    intervalSeconds: interval,
    endpoints: n,
    locations: loc,
    note:
      budgetMinutes > 0 && worstDetectionMinutes > budgetMinutes
        ? `A single missed check (${worstDetectionMinutes.toFixed(1)} min worst case) already exceeds the ${budgetMinutes.toFixed(1)} min monthly budget a ${slo}% target allows — shorten the interval or lower the target.`
        : null,
  };
}

/** "45 s", "2 min 30 s", "1 hr 5 min". */
export function formatSeconds(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  if (seconds < 60) return `${Math.round(seconds * 10) / 10} s`;
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const rest = Math.round(seconds % 60);
    return rest === 0 ? `${minutes} min` : `${minutes} min ${rest} s`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return minutes === 0 ? `${hours} hr` : `${hours} hr ${minutes} min`;
}
