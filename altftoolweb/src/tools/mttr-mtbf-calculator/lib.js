/**
 * MTTR / MTBF / availability calculator.
 *
 * Standard reliability-engineering definitions (as used in IEC 61703 and
 * common SRE/maintenance practice for repairable systems):
 *   MTTR (mean time to repair)      = total repair/restore time ÷ number of failures
 *   MTBF (mean time between failures) = total operating (up) time ÷ number of failures
 *   Failure rate λ                  = 1 ÷ MTBF   (assumes a constant failure rate)
 *   Inherent availability A         = MTBF ÷ (MTBF + MTTR) = uptime ÷ total time
 */

/** Hours in common observation windows, offered as presets. */
export const PERIOD_PRESETS = [
  { label: "1 week (168 h)", hours: "168" },
  { label: "30 days (720 h)", hours: "720" },
  { label: "90 days (2160 h)", hours: "2160" },
  { label: "1 year (8760 h)", hours: "8760" },
];

/**
 * Number of "nines" of availability, e.g. 99.9% → 3.
 * Defined as -log10(1 - A). Capped for display when availability is 100%.
 */
export const MAX_NINES_DISPLAY = 9; // beyond nine nines the figure is meaningless noise

export function ninesOfAvailability(availabilityFraction) {
  if (!Number.isFinite(availabilityFraction) || availabilityFraction < 0) return 0;
  if (availabilityFraction >= 1) return MAX_NINES_DISPLAY;
  const nines = -Math.log10(1 - availabilityFraction);
  return Math.min(MAX_NINES_DISPLAY, nines);
}

/**
 * Compute MTTR, MTBF, failure rate and availability from an observation window.
 *
 * @param {object} input
 * @param {number|string} input.periodHours        Total observation window, in hours.
 * @param {number|string} input.failures           Number of failures in the window (integer ≥ 0).
 * @param {number|string} input.totalRepairHours   Total time spent down/being repaired, in hours.
 * @returns {object} result or { error }
 */
export function computeReliability({ periodHours, failures, totalRepairHours }) {
  const period = Number(periodHours);
  const count = Number(failures);
  const repair = Number(totalRepairHours);

  if (periodHours === "" || !Number.isFinite(period)) {
    return { error: "Enter the total observation period in hours." };
  }
  if (period <= 0) return { error: "The observation period must be longer than zero hours." };
  if (failures === "" || !Number.isFinite(count)) {
    return { error: "Enter the number of failures (0 or more)." };
  }
  if (count < 0) return { error: "The number of failures cannot be negative." };
  if (!Number.isInteger(count)) return { error: "The number of failures must be a whole number." };
  if (totalRepairHours === "" || !Number.isFinite(repair)) {
    return { error: "Enter the total repair (down) time in hours." };
  }
  if (repair < 0) return { error: "Total repair time cannot be negative." };
  if (repair > period) {
    return { error: "Total repair time cannot exceed the observation period." };
  }
  if (count === 0 && repair > 0) {
    return { error: "Downtime with zero failures is contradictory — record at least one failure." };
  }

  const uptimeHours = period - repair;
  const availability = uptimeHours / period; // A = uptime / total time
  const availabilityPercent = availability * 100;

  if (count === 0) {
    // No failures observed: MTBF is undefined (no failure interval completed).
    return {
      noFailures: true,
      periodHours: period,
      failures: 0,
      uptimeHours,
      downtimeHours: 0,
      mtbfHours: null,
      mttrHours: null,
      failureRatePerHour: 0,
      availability,
      availabilityPercent,
      nines: ninesOfAvailability(availability),
      note: "No failures in the window — availability is 100% and MTBF cannot be estimated yet.",
    };
  }

  const mtbfHours = uptimeHours / count; // MTBF = up time / failures
  const mttrHours = repair / count; // MTTR = repair time / failures
  const failureRatePerHour = mtbfHours > 0 ? 1 / mtbfHours : 0; // λ = 1/MTBF

  return {
    noFailures: false,
    periodHours: period,
    failures: count,
    uptimeHours,
    downtimeHours: repair,
    mtbfHours,
    mttrHours,
    failureRatePerHour,
    availability,
    availabilityPercent,
    nines: ninesOfAvailability(availability),
  };
}
