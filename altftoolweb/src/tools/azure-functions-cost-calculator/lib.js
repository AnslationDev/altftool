/**
 * Azure Functions Consumption plan cost model, with an Elastic Premium (EP1)
 * comparison.
 *
 * Rates are the published pay-as-you-go list prices for the East US region from
 * the Azure Functions pricing page (azure.microsoft.com/pricing/details/functions).
 * Consumption billing = executions + GB-seconds, each with a monthly free grant.
 * Prices vary by region and change over time — treat results as an estimate.
 */

/** $0.20 per million executions (Consumption plan, East US). */
export const PRICE_PER_MILLION_EXECUTIONS = 0.2;

/** First 1,000,000 executions per month are free (monthly free grant). */
export const FREE_EXECUTIONS = 1_000_000;

/** $0.000016 per GB-second of execution time (Consumption plan, East US). */
export const PRICE_PER_GB_SECOND = 0.000016;

/** First 400,000 GB-seconds per month are free (monthly free grant). */
export const FREE_GB_SECONDS = 400_000;

/**
 * Billing granularity rules from the Azure Functions pricing page:
 * memory is rounded up to the nearest 128 MB (max 1,536 MB on Consumption),
 * and each execution bills a minimum of 100 ms.
 */
export const MEMORY_ROUNDING_MB = 128;
export const MAX_CONSUMPTION_MEMORY_MB = 1536;
export const MIN_BILLED_MS = 100;

/**
 * Elastic Premium plan unit prices, East US pay-as-you-go
 * (azure.microsoft.com/pricing/details/functions — Premium plan section):
 * ~$126.29 per vCPU-month and ~$8.979 per GB-month.
 * EP1 = 1 vCPU + 3.5 GB memory, the smallest premium instance.
 */
export const PREMIUM_VCPU_MONTHLY = 126.29;
export const PREMIUM_GB_MONTHLY = 8.979;
export const EP1_VCPU = 1;
export const EP1_MEMORY_GB = 3.5;
export const EP1_MONTHLY = PREMIUM_VCPU_MONTHLY * EP1_VCPU + PREMIUM_GB_MONTHLY * EP1_MEMORY_GB;

/**
 * Compute the monthly Consumption plan bill and compare against one EP1 instance.
 *
 * @param {object} input
 * @param {number} input.executionsPerMonth  Total function executions per month.
 * @param {number} input.avgDurationMs       Average execution time in milliseconds.
 * @param {number} input.memoryMb            Observed peak memory per execution, MB.
 * @returns {object} cost breakdown, or { error } for invalid input.
 */
export function computeAzureFunctionsCost({ executionsPerMonth, avgDurationMs, memoryMb }) {
  const executions = Number(executionsPerMonth);
  const durationMs = Number(avgDurationMs);
  const memory = Number(memoryMb);

  if (!Number.isFinite(executions) || executions < 0) {
    return { error: "Executions per month must be zero or more." };
  }
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return { error: "Average duration must be greater than 0 ms." };
  }
  if (!Number.isFinite(memory) || memory <= 0) {
    return { error: "Memory must be greater than 0 MB." };
  }
  if (memory > MAX_CONSUMPTION_MEMORY_MB) {
    return {
      error: `The Consumption plan caps memory at ${MAX_CONSUMPTION_MEMORY_MB} MB per execution — use the Premium plan for more.`,
    };
  }

  // Memory rounds up to the nearest 128 MB; duration bills a minimum of 100 ms.
  const billedMemoryGb =
    (Math.ceil(memory / MEMORY_ROUNDING_MB) * MEMORY_ROUNDING_MB) / 1024;
  const billedMsPerExecution = Math.max(durationMs, MIN_BILLED_MS);

  const totalGbSeconds = executions * (billedMsPerExecution / 1000) * billedMemoryGb;
  const billableGbSeconds = Math.max(0, totalGbSeconds - FREE_GB_SECONDS);
  const gbSecondCost = billableGbSeconds * PRICE_PER_GB_SECOND;

  const billableExecutions = Math.max(0, executions - FREE_EXECUTIONS);
  const executionCost = (billableExecutions / 1_000_000) * PRICE_PER_MILLION_EXECUTIONS;

  const consumptionTotal = gbSecondCost + executionCost;
  const premiumTotal = EP1_MONTHLY;

  return {
    billedMemoryGb,
    billedMsPerExecution,
    totalGbSeconds,
    freeGbSecondsUsed: Math.min(totalGbSeconds, FREE_GB_SECONDS),
    billableGbSeconds,
    gbSecondCost,
    freeExecutionsUsed: Math.min(executions, FREE_EXECUTIONS),
    billableExecutions,
    executionCost,
    consumptionTotal,
    premiumTotal,
    cheaperPlan: consumptionTotal <= premiumTotal ? "consumption" : "premium-ep1",
    monthlySavingOnCheaper: Math.abs(premiumTotal - consumptionTotal),
  };
}
