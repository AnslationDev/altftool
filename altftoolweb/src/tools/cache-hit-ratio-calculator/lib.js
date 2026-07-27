/**
 * Cache hit ratio and effective latency calculator.
 *
 * Formulas:
 *  - hit ratio        h = hits / (hits + misses)
 *  - effective latency (average memory access time, AMAT):
 *        AMAT = hit_time + miss_rate x miss_penalty
 *    (Hennessy & Patterson, "Computer Architecture: A Quantitative Approach").
 *    Here hit_time is the cache lookup latency, and the miss penalty is the
 *    backend fetch latency paid on top of the lookup in a look-aside cache.
 *  - speedup vs no cache = backend_latency / AMAT (every request would
 *    otherwise pay the backend latency).
 *  - backend load reduction = h (only misses reach the backend).
 */

/** Percentage scale factor. */
export const PERCENT = 100;

/**
 * @param {object} input
 * @param {number} input.hits               cache hits observed
 * @param {number} input.misses             cache misses observed
 * @param {number} input.cacheLatencyMs     cache lookup (hit) latency in ms
 * @param {number} input.backendLatencyMs   backend fetch latency (miss penalty) in ms
 * @param {number} [input.requestsPerSecond] optional traffic rate for load figures
 * @returns {object|{error:string}}
 */
export function computeCacheMetrics({
  hits,
  misses,
  cacheLatencyMs,
  backendLatencyMs,
  requestsPerSecond = 0,
}) {
  const hitCount = Number(hits);
  const missCount = Number(misses);
  const hitTime = Number(cacheLatencyMs);
  const missPenalty = Number(backendLatencyMs);
  const rps = Number(requestsPerSecond);

  if (!Number.isFinite(hitCount) || hitCount < 0) {
    return { error: "Hits must be a number of 0 or more." };
  }
  if (!Number.isFinite(missCount) || missCount < 0) {
    return { error: "Misses must be a number of 0 or more." };
  }
  const total = hitCount + missCount;
  if (total <= 0) {
    return { error: "Enter at least one hit or miss — the ratio is undefined for zero requests." };
  }
  if (!Number.isFinite(hitTime) || hitTime < 0) {
    return { error: "Cache latency must be 0 ms or more." };
  }
  if (!Number.isFinite(missPenalty) || missPenalty <= 0) {
    return { error: "Backend latency must be greater than 0 ms." };
  }
  if (!Number.isFinite(rps) || rps < 0) {
    return { error: "Requests per second cannot be negative." };
  }

  const hitRatio = hitCount / total;
  const missRatio = 1 - hitRatio;

  // AMAT = hit_time + miss_rate x miss_penalty
  const effectiveLatencyMs = hitTime + missRatio * missPenalty;
  // Without the cache every request pays the backend latency.
  const noCacheLatencyMs = missPenalty;
  const latencySavedPct = ((noCacheLatencyMs - effectiveLatencyMs) / noCacheLatencyMs) * PERCENT;
  const speedup = effectiveLatencyMs > 0 ? noCacheLatencyMs / effectiveLatencyMs : Infinity;

  const backendSharePct = missRatio * PERCENT;
  const backendLoadReductionPct = hitRatio * PERCENT;
  const backendRps = rps > 0 ? rps * missRatio : null;

  const warnings = [];
  if (hitTime >= missPenalty) {
    warnings.push(
      "Cache latency is not lower than backend latency — this cache adds delay instead of removing it.",
    );
  }

  return {
    totalRequests: total,
    hitRatioPct: hitRatio * PERCENT,
    missRatioPct: missRatio * PERCENT,
    effectiveLatencyMs,
    noCacheLatencyMs,
    latencySavedPct,
    speedup: Number.isFinite(speedup) ? speedup : null,
    backendSharePct,
    backendLoadReductionPct,
    backendRps,
    warnings,
  };
}
