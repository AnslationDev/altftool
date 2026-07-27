/**
 * Google Cloud Run cost model — request-based billing (CPU allocated only
 * during request processing), with idle min-instance charges.
 *
 * Rates are the published Tier 1 region list prices (e.g. us-central1) from
 * the Cloud Run pricing page (cloud.google.com/run/pricing).
 * Prices vary by region tier and change over time — treat results as estimates.
 */

/** Active vCPU: $0.000024 per vCPU-second (Tier 1, request-based billing). */
export const CPU_ACTIVE_PER_SECOND = 0.000024;

/** Active memory: $0.0000025 per GiB-second (Tier 1, request-based billing). */
export const MEMORY_ACTIVE_PER_GIB_SECOND = 0.0000025;

/** Requests: $0.40 per million requests (request-based billing only). */
export const PRICE_PER_MILLION_REQUESTS = 0.4;

/**
 * Cloud Run monthly free tier (Tier 1 regions, request-based billing):
 * 180,000 vCPU-seconds, 360,000 GiB-seconds and 2 million requests free.
 */
export const FREE_VCPU_SECONDS = 180_000;
export const FREE_GIB_SECONDS = 360_000;
export const FREE_REQUESTS = 2_000_000;

/**
 * Idle min instances bill at the instance-based ("CPU always allocated")
 * rates: $0.000018 per vCPU-second and $0.000002 per GiB-second (Tier 1).
 */
export const CPU_IDLE_PER_SECOND = 0.000018;
export const MEMORY_IDLE_PER_GIB_SECOND = 0.000002;

/** Request-based billing rounds each request's time up to the nearest 100 ms. */
export const BILLING_INCREMENT_MS = 100;

/** 730 hours × 3600 s — seconds in Google's standard billing month. */
export const SECONDS_PER_MONTH = 730 * 3600;

/**
 * Compute the monthly Cloud Run bill for one service.
 *
 * @param {object} input
 * @param {number} input.requestsPerMonth  Requests served per month.
 * @param {number} input.avgDurationMs     Average request processing time, ms.
 * @param {number} input.vcpu              vCPU allocated per instance (0.08–8; commonly 1 or 2).
 * @param {number} input.memoryGiB         Memory allocated per instance, GiB.
 * @param {number} [input.concurrency]     Average concurrent requests sharing one
 *                                         instance (billing follows instance time,
 *                                         so higher concurrency divides the cost).
 * @param {number} [input.minInstances]    Warm min instances kept idle all month.
 * @returns {object} cost breakdown, or { error } for invalid input.
 */
export function computeCloudRunCost({
  requestsPerMonth,
  avgDurationMs,
  vcpu,
  memoryGiB,
  concurrency = 1,
  minInstances = 0,
}) {
  const requests = Number(requestsPerMonth);
  const durationMs = Number(avgDurationMs);
  const cpu = Number(vcpu);
  const memory = Number(memoryGiB);
  const conc = Number(concurrency);
  const minInst = Number(minInstances);

  if (!Number.isFinite(requests) || requests < 0) {
    return { error: "Requests per month must be zero or more." };
  }
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return { error: "Average request duration must be greater than 0 ms." };
  }
  if (!Number.isFinite(cpu) || cpu <= 0 || cpu > 8) {
    return { error: "vCPU per instance must be between 0.08 and 8." };
  }
  if (!Number.isFinite(memory) || memory <= 0 || memory > 32) {
    return { error: "Memory per instance must be between 0.1 and 32 GiB." };
  }
  if (!Number.isFinite(conc) || conc < 1 || conc > 1000) {
    return { error: "Concurrency must be between 1 and 1000." };
  }
  if (!Number.isFinite(minInst) || minInst < 0 || !Number.isInteger(minInst)) {
    return { error: "Minimum instances must be a whole number of zero or more." };
  }

  // Each request's time is rounded up to the nearest 100 ms increment.
  const billedSecondsPerRequest =
    (Math.ceil(durationMs / BILLING_INCREMENT_MS) * BILLING_INCREMENT_MS) / 1000;

  // Instance-seconds: concurrent requests share one instance's clock.
  const instanceSeconds = (requests * billedSecondsPerRequest) / conc;

  const activeCpuSeconds = instanceSeconds * cpu;
  const activeGibSeconds = instanceSeconds * memory;

  const billableCpuSeconds = Math.max(0, activeCpuSeconds - FREE_VCPU_SECONDS);
  const billableGibSeconds = Math.max(0, activeGibSeconds - FREE_GIB_SECONDS);
  const billableRequests = Math.max(0, requests - FREE_REQUESTS);

  const cpuCost = billableCpuSeconds * CPU_ACTIVE_PER_SECOND;
  const memoryCost = billableGibSeconds * MEMORY_ACTIVE_PER_GIB_SECOND;
  const requestCost = (billableRequests / 1_000_000) * PRICE_PER_MILLION_REQUESTS;

  // Conservative idle model: min instances billed idle for the whole month.
  const idleSeconds = minInst * SECONDS_PER_MONTH;
  const idleCost =
    idleSeconds * cpu * CPU_IDLE_PER_SECOND +
    idleSeconds * memory * MEMORY_IDLE_PER_GIB_SECOND;

  const total = cpuCost + memoryCost + requestCost + idleCost;

  return {
    billedSecondsPerRequest,
    instanceSeconds,
    activeCpuSeconds,
    activeGibSeconds,
    billableCpuSeconds,
    billableGibSeconds,
    billableRequests,
    cpuCost,
    memoryCost,
    requestCost,
    idleCost,
    total,
  };
}
