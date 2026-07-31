/**
 * Cloudflare Workers (Paid plan) + Workers KV cost model.
 *
 * All figures are Cloudflare's published Workers Paid plan pricing from
 * developers.cloudflare.com/workers/platform/pricing and
 * developers.cloudflare.com/kv/platform/pricing.
 * The $5/month Workers Paid subscription includes monthly allowances; usage
 * beyond them bills at the listed unit rates. Prices change over time.
 */

/** Workers Paid plan base subscription: $5 per month. */
export const BASE_PLAN_PRICE = 5;

/** Requests: 10 million included per month, then $0.30 per additional million. */
export const INCLUDED_REQUESTS_M = 10;
export const REQUEST_OVERAGE_PER_M = 0.3;

/** CPU time: 30 million CPU-milliseconds included, then $0.02 per additional million. */
export const INCLUDED_CPU_MS_M = 30;
export const CPU_OVERAGE_PER_M_MS = 0.02;

/** Workers KV — reads: 10 million included, then $0.50 per additional million. */
export const KV_INCLUDED_READS_M = 10;
export const KV_READ_OVERAGE_PER_M = 0.5;

/** Workers KV — writes: 1 million included, then $5.00 per additional million. */
export const KV_INCLUDED_WRITES_M = 1;
export const KV_WRITE_OVERAGE_PER_M = 5;

/** Workers KV — deletes: 1 million included, then $5.00 per additional million. */
export const KV_INCLUDED_DELETES_M = 1;
export const KV_DELETE_OVERAGE_PER_M = 5;

/** Workers KV — lists: 1 million included, then $5.00 per additional million. */
export const KV_INCLUDED_LISTS_M = 1;
export const KV_LIST_OVERAGE_PER_M = 5;

/** Workers KV — storage: 1 GB included, then $0.50 per GB-month. */
export const KV_INCLUDED_STORAGE_GB = 1;
export const KV_STORAGE_OVERAGE_PER_GB = 0.5;

/**
 * Compute the estimated monthly Workers Paid bill.
 *
 * @param {object} input
 * @param {number} input.requestsM     Worker requests, millions per month.
 * @param {number} input.avgCpuMs      Average CPU time per request, milliseconds.
 * @param {number} [input.kvReadsM]    KV reads, millions per month.
 * @param {number} [input.kvWritesM]   KV writes, millions per month.
 * @param {number} [input.kvDeletesM]  KV deletes, millions per month.
 * @param {number} [input.kvListsM]    KV list operations, millions per month.
 * @param {number} [input.kvStorageGb] KV stored data, GB.
 * @returns {object} cost breakdown, or { error } for invalid input.
 */
export function computeWorkersCost({
  requestsM,
  avgCpuMs,
  kvReadsM = 0,
  kvWritesM = 0,
  kvDeletesM = 0,
  kvListsM = 0,
  kvStorageGb = 0,
}) {
  const requests = Number(requestsM);
  const cpuMs = Number(avgCpuMs);
  const reads = Number(kvReadsM);
  const writes = Number(kvWritesM);
  const deletes = Number(kvDeletesM);
  const lists = Number(kvListsM);
  const storage = Number(kvStorageGb);

  if (!Number.isFinite(requests)) {
    return { error: "Enter worker requests per month as a number." };
  }
  if (requests < 0) {
    return { error: "Requests per month must be zero or more." };
  }
  if (!Number.isFinite(cpuMs)) {
    return { error: "Enter the average CPU time per request as a number." };
  }
  if (cpuMs < 0) {
    return { error: "Average CPU time cannot be negative." };
  }
  if (cpuMs > 300000) {
    return { error: "Workers cap CPU time at 300,000 ms (5 minutes) per request." };
  }
  for (const [label, value] of [
    ["KV reads", reads],
    ["KV writes", writes],
    ["KV deletes", deletes],
    ["KV lists", lists],
    ["KV storage", storage],
  ]) {
    if (!Number.isFinite(value) || value < 0) {
      return { error: `${label} cannot be negative.` };
    }
  }

  // Total CPU-milliseconds in millions: (requests in M) × (avg ms per request).
  const totalCpuMsM = requests * cpuMs;

  const requestCost =
    Math.max(0, requests - INCLUDED_REQUESTS_M) * REQUEST_OVERAGE_PER_M;
  const cpuCost = Math.max(0, totalCpuMsM - INCLUDED_CPU_MS_M) * CPU_OVERAGE_PER_M_MS;

  const kvReadCost = Math.max(0, reads - KV_INCLUDED_READS_M) * KV_READ_OVERAGE_PER_M;
  const kvWriteCost = Math.max(0, writes - KV_INCLUDED_WRITES_M) * KV_WRITE_OVERAGE_PER_M;
  const kvDeleteCost =
    Math.max(0, deletes - KV_INCLUDED_DELETES_M) * KV_DELETE_OVERAGE_PER_M;
  const kvListCost = Math.max(0, lists - KV_INCLUDED_LISTS_M) * KV_LIST_OVERAGE_PER_M;
  const kvStorageCost =
    Math.max(0, storage - KV_INCLUDED_STORAGE_GB) * KV_STORAGE_OVERAGE_PER_GB;

  const kvCost = kvReadCost + kvWriteCost + kvDeleteCost + kvListCost + kvStorageCost;
  const total = BASE_PLAN_PRICE + requestCost + cpuCost + kvCost;

  return {
    basePlanCost: BASE_PLAN_PRICE,
    totalCpuMsM,
    requestCost,
    cpuCost,
    kvReadCost,
    kvWriteCost,
    kvDeleteCost,
    kvListCost,
    kvStorageCost,
    kvCost,
    total,
  };
}
