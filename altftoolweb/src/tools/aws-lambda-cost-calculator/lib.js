/**
 * AWS Lambda on-demand pricing model (x86, US East N. Virginia, aws.amazon.com/lambda/pricing,
 * checked July 2025). Lambda bills two meters: requests and compute (GB-seconds).
 * Duration is billed per 1 ms with no minimum rounding since December 2020.
 */

/** $0.20 per 1 million requests — AWS Lambda pricing page, x86, us-east-1. */
export const REQUEST_PRICE_PER_MILLION = 0.2;

/** $0.0000166667 per GB-second of compute — AWS Lambda pricing page, x86, us-east-1. */
export const GB_SECOND_PRICE = 0.0000166667;

/** Always-free tier: 1M requests per month (does not expire after 12 months). */
export const FREE_TIER_REQUESTS = 1_000_000;

/** Always-free tier: 400,000 GB-seconds of compute per month. */
export const FREE_TIER_GB_SECONDS = 400_000;

/** Lambda lets you configure memory from 128 MB to 10,240 MB (AWS Lambda quotas). */
export const MIN_MEMORY_MB = 128;
export const MAX_MEMORY_MB = 10_240;

/** Lambda prices compute per GB-second where 1 GB = 1,024 MB (binary, per AWS docs). */
export const MB_PER_GB = 1024;

const MS_PER_SECOND = 1000;
const MILLION = 1_000_000;

/** The free tier resets every calendar month, so a year is 12 identical months. */
const MONTHS_PER_YEAR = 12;

/**
 * Compute the monthly on-demand Lambda bill.
 *
 * @param {object} input
 * @param {number} input.invocationsPerMonth  Total invocations in the month.
 * @param {number} input.memoryMb             Configured memory, 128–10240 MB.
 * @param {number} input.avgDurationMs        Average billed duration per invocation, in ms.
 * @param {boolean} [input.applyFreeTier]     Subtract the always-free tier (default true).
 * @returns {object} cost breakdown, or { error } for invalid input.
 */
export function computeLambdaCost({
  invocationsPerMonth,
  memoryMb,
  avgDurationMs,
  applyFreeTier = true,
}) {
  const invocations = Number(invocationsPerMonth);
  const memory = Number(memoryMb);
  const duration = Number(avgDurationMs);

  if (!Number.isFinite(invocations) || invocations < 0) {
    return { error: "Enter the number of invocations per month (0 or more)." };
  }
  if (!Number.isFinite(memory) || memory < MIN_MEMORY_MB || memory > MAX_MEMORY_MB) {
    return { error: `Memory must be between ${MIN_MEMORY_MB} MB and ${MAX_MEMORY_MB} MB.` };
  }
  if (!Number.isFinite(duration) || duration < 0) {
    return { error: "Average duration must be 0 ms or more." };
  }

  // GB-seconds = invocations × (duration in seconds) × (memory in GB).
  const gbSeconds = invocations * (duration / MS_PER_SECOND) * (memory / MB_PER_GB);

  const freeRequests = applyFreeTier ? FREE_TIER_REQUESTS : 0;
  const freeGbSeconds = applyFreeTier ? FREE_TIER_GB_SECONDS : 0;

  const billableRequests = Math.max(0, invocations - freeRequests);
  const billableGbSeconds = Math.max(0, gbSeconds - freeGbSeconds);

  const requestCharge = (billableRequests / MILLION) * REQUEST_PRICE_PER_MILLION;
  const computeCharge = billableGbSeconds * GB_SECOND_PRICE;
  const total = requestCharge + computeCharge;

  return {
    gbSeconds,
    billableRequests,
    billableGbSeconds,
    requestCharge,
    computeCharge,
    total,
    annualTotal: total * MONTHS_PER_YEAR,
    freeRequestsUsed: Math.min(invocations, freeRequests),
    freeGbSecondsUsed: Math.min(gbSeconds, freeGbSeconds),
    // Effective cost per million invocations once both meters are combined.
    costPerMillionInvocations: invocations > 0 ? (total / invocations) * MILLION : 0,
    applyFreeTier,
  };
}
