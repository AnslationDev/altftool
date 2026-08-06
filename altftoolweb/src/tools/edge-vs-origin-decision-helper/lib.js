/**
 * Edge vs origin latency model.
 *
 * The decision is dominated by one fact: an edge function is only fast if it
 * can answer WITHOUT crossing back to where the data lives. Each data
 * round trip from the edge to the origin region pays the full edge-origin
 * RTT, so:
 *
 *   origin path latency  = userToOriginRtt + compute
 *   edge path latency    = userToEdgeRtt + compute
 *                          + missRate x originCallsPerRequest x edgeToOriginRtt
 *
 * where missRate = 1 - cacheHitRatio for the edge's local data cache.
 * With zero origin calls (static content, replicated data) the edge always
 * wins because userToEdgeRtt < userToOriginRtt for far-away users. With one
 * or more uncached origin calls the edge is often SLOWER than going to the
 * origin directly — the well-known "edge tax" — because the request pays
 * both the user-edge hop and the full edge-origin hop.
 *
 * Hard blockers force origin regardless of latency: strong read-after-write
 * consistency against a single-region primary, heavy CPU/memory beyond edge
 * runtime limits, and data-residency rules pinning processing to a region.
 */

export const BLOCKERS = [
  {
    id: "strongConsistency",
    label: "Needs strong read-after-write consistency against a single-region primary database",
    explanation:
      "Every read must hit the primary region anyway, so edge execution adds a hop without removing one.",
  },
  {
    id: "heavyCompute",
    label: "Heavy CPU, memory or long-running work beyond edge runtime limits",
    explanation:
      "Edge runtimes cap CPU time, memory and execution duration (typically far below a container's); the workload will not fit.",
  },
  {
    id: "dataResidency",
    label: "Data-residency / compliance rules pin processing to one region",
    explanation:
      "Running in hundreds of PoPs violates the constraint by design; keep the endpoint in the compliant region.",
  },
];

/**
 * Decide edge vs origin for one endpoint.
 *
 * @param {object} input
 * @param {number} input.userToEdgeRttMs     Typical user -> nearest edge RTT (ms).
 * @param {number} input.userToOriginRttMs   Typical user -> origin region RTT (ms).
 * @param {number} input.edgeToOriginRttMs   Edge PoP -> origin region RTT (ms).
 * @param {number} input.originCallsPerRequest  Sequential data round trips to
 *                                           the origin region per request.
 * @param {number} input.cacheHitPercent     % of requests the edge answers from
 *                                           locally cached/replicated data (0-100).
 * @param {number} [input.computeMs]         Handler compute time (ms), same on
 *                                           either side.
 * @param {string[]} [input.blockers]        Ids from BLOCKERS that apply.
 * @returns {{ recommendation, edgeLatencyMs, originLatencyMs, savingsMs,
 *             savingsPercent, blocked, reasons }|{ error }}
 */
export function decideEdgeVsOrigin({
  userToEdgeRttMs,
  userToOriginRttMs,
  edgeToOriginRttMs,
  originCallsPerRequest,
  cacheHitPercent,
  computeMs = 0,
  blockers = [],
}) {
  const userEdge = Number(userToEdgeRttMs);
  const userOrigin = Number(userToOriginRttMs);
  const edgeOrigin = Number(edgeToOriginRttMs);
  const calls = Number(originCallsPerRequest);
  const hit = Number(cacheHitPercent);
  const compute = Number(computeMs);

  if (!Number.isFinite(userEdge) || userEdge < 0) {
    return { error: "User-to-edge RTT must be zero or a positive number of milliseconds." };
  }
  if (!Number.isFinite(userOrigin) || userOrigin < 0) {
    return { error: "User-to-origin RTT must be zero or a positive number of milliseconds." };
  }
  if (!Number.isFinite(edgeOrigin) || edgeOrigin < 0) {
    return { error: "Edge-to-origin RTT must be zero or a positive number of milliseconds." };
  }
  if (!Number.isFinite(calls) || calls < 0) {
    return { error: "Origin data calls per request must be zero or a positive number." };
  }
  if (!Number.isFinite(hit) || hit < 0 || hit > 100) {
    return { error: "Cache hit ratio must be between 0 and 100 percent." };
  }
  if (!Number.isFinite(compute) || compute < 0) {
    return { error: "Compute time must be zero or a positive number of milliseconds." };
  }

  const activeBlockers = BLOCKERS.filter((b) => blockers.includes(b.id));
  const blocked = activeBlockers.length > 0;

  const missRate = 1 - hit / 100;
  const missPenaltyMs = missRate * calls * edgeOrigin;

  const originLatencyMs = userOrigin + compute;
  const edgeLatencyMs = userEdge + compute + missPenaltyMs;

  const savingsMs = originLatencyMs - edgeLatencyMs;
  const savingsPercent = originLatencyMs > 0 ? (savingsMs / originLatencyMs) * 100 : 0;

  // ms saved by terminating the connection at the edge instead of the origin,
  // BEFORE accounting for the cost of any origin data calls. Negative means
  // the nearest edge PoP is actually farther from this user than the origin
  // region itself.
  const hopSavingsMs = userOrigin - userEdge;

  // Break-even edge cache/replica hit ratio: the hit% at which the edge and
  // origin paths have equal latency, holding every other input fixed. Only
  // meaningful when there is at least one per-request origin data call and a
  // non-zero edge-to-origin hop — otherwise the hit ratio has no effect on
  // edge latency at all, so there is nothing to solve for.
  let breakEvenHitPercent = null;
  if (calls > 0 && edgeOrigin > 0) {
    breakEvenHitPercent = 100 * (1 - hopSavingsMs / (calls * edgeOrigin));
  }

  const reasons = [];
  if (blocked) {
    for (const b of activeBlockers) reasons.push(`${b.label}: ${b.explanation}`);
  }

  let recommendation;
  if (blocked) {
    recommendation = "origin";
    reasons.push(
      "A hard blocker applies, so the latency comparison is moot — run this endpoint at the origin (optionally still fronted by a CDN for static assets).",
    );
  } else if (savingsMs > 0) {
    recommendation = "edge";
    reasons.push(
      calls === 0
        ? "The endpoint needs no per-request origin data, so the edge answers entirely from the nearby PoP — the ideal edge case."
        : `Expected origin data cost per request is ${missPenaltyMs.toFixed(0)} ms (${(missRate * 100).toFixed(0)}% miss rate x ${calls} call(s) x ${edgeOrigin} ms), which is smaller than the ${hopSavingsMs.toFixed(0)} ms the user saves by terminating at the edge.`,
    );
  } else {
    recommendation = "origin";
    if (missPenaltyMs > 0 && hopSavingsMs > 0) {
      reasons.push(
        `Uncached origin data calls cost an expected ${missPenaltyMs.toFixed(0)} ms per request from the edge — more than the ${hopSavingsMs.toFixed(0)} ms saved on the user hop. Crossing back to the data ("the edge tax") makes the edge path slower here.`,
      );
    } else if (missPenaltyMs > 0) {
      reasons.push(
        `The nearest edge PoP is ${Math.abs(hopSavingsMs).toFixed(0)} ms farther from this user than the origin region, and uncached origin data calls add a further ${missPenaltyMs.toFixed(0)} ms per request — both push the edge path behind the origin here.`,
      );
    } else {
      reasons.push(
        `The nearest edge PoP is ${Math.abs(hopSavingsMs).toFixed(0)} ms farther from this user than the origin region itself, so terminating at the edge adds latency instead of saving it — origin wins on the network hop alone, independent of any data calls.`,
      );
    }
    // Raising the hit ratio (or batching/splitting) can only flip the
    // decision when the edge PoP is genuinely closer to the user than the
    // origin — if the hop itself already favours origin, no amount of
    // caching changes that.
    if (hopSavingsMs > 0) {
      reasons.push(
        "To flip this decision: cache or replicate the data at the edge (raise the hit ratio), batch the round trips into one, or move only the data-free part of the endpoint to the edge.",
      );
    }
  }

  return {
    recommendation,
    blocked,
    edgeLatencyMs,
    originLatencyMs,
    missPenaltyMs,
    missRatePercent: missRate * 100,
    savingsMs,
    savingsPercent,
    breakEvenHitPercent,
    reasons,
  };
}
