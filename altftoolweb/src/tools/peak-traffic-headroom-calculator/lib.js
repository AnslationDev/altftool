/**
 * Peak traffic headroom / capacity planning maths.
 *
 * The model is the standard capacity-planning chain used in SRE practice
 * (see Google SRE Book, ch. "Software Engineering in SRE" / capacity planning,
 * and AWS Well-Architected reliability pillar):
 *
 *   projected peak load = baseline average
 *                       x daily peak-to-average ratio
 *                       x event spike multiplier
 *                       x (1 + expected growth)
 *
 *   required capacity   = projected peak / target peak utilization
 *
 * Running below 100% utilization at peak is deliberate: the buffer absorbs load
 * imbalance between instances, retry storms, garbage-collection pauses and the
 * loss of an instance mid-spike. 60% is a common target for latency-sensitive
 * services; batch-like services can run hotter.
 *
 *   headroom % = (capacity - projected peak) / capacity x 100
 *
 * i.e. the share of your fleet's throughput still unused at the projected peak.
 * Redundancy is expressed as N+R: R extra instances on top of the load-derived
 * count so a failure (or a deploy draining one instance) does not eat the buffer.
 */

/**
 * Common default: plan peak utilization at 60% for latency-sensitive services,
 * leaving 40% headroom for imbalance, retries and instance loss.
 */
export const DEFAULT_TARGET_UTILIZATION_PERCENT = 60;

/**
 * Typical diurnal peak-to-average ratio for consumer web traffic is roughly
 * 2-3x the daily average; 2.5 is a middle default the user should replace with
 * their own monitoring data.
 */
export const DEFAULT_PEAK_TO_AVERAGE_RATIO = 2.5;

/** N+1 redundancy: tolerate the loss of one instance at peak without breaching the target. */
export const DEFAULT_REDUNDANCY_INSTANCES = 1;

/** Utilization must be a workable percentage: above 0 and at most 100. */
export const MIN_UTILIZATION_PERCENT = 1;
export const MAX_UTILIZATION_PERCENT = 100;

/**
 * Compute projected peak load, required capacity, instance counts and headroom.
 *
 * @param {object} input
 * @param {number} input.baselineRps            Normal average throughput, requests/second.
 * @param {number} input.peakToAverageRatio     Daily peak divided by daily average (from monitoring).
 * @param {number} input.spikeMultiplier        Event multiplier on top of a normal peak (sale, campaign, viral post).
 * @param {number} [input.growthPercent]        Expected organic growth between now and the event, %.
 * @param {number} input.perInstanceRps         Sustainable requests/second of one instance at acceptable latency (from a load test).
 * @param {number} [input.targetUtilizationPercent] Peak utilization you are willing to run at, % (default 60).
 * @param {number} [input.currentInstances]     Instances running today, for the gap analysis.
 * @param {number} [input.redundancyInstances]  Extra instances for N+R failure tolerance (default 1).
 * @returns {object} results, or { error } for invalid input.
 */
export function computeHeadroom({
  baselineRps,
  peakToAverageRatio = DEFAULT_PEAK_TO_AVERAGE_RATIO,
  spikeMultiplier,
  growthPercent = 0,
  perInstanceRps,
  targetUtilizationPercent = DEFAULT_TARGET_UTILIZATION_PERCENT,
  currentInstances = 0,
  redundancyInstances = DEFAULT_REDUNDANCY_INSTANCES,
}) {
  const baseline = Number(baselineRps);
  const ratio = Number(peakToAverageRatio);
  const spike = Number(spikeMultiplier);
  const growth = Number(growthPercent);
  const perInstance = Number(perInstanceRps);
  const utilization = Number(targetUtilizationPercent);
  const current = Number(currentInstances);
  const redundancy = Number(redundancyInstances);

  if (!Number.isFinite(baseline) || baseline <= 0) {
    return { error: "Enter your baseline traffic in requests per second (a number above 0)." };
  }
  if (!Number.isFinite(ratio) || ratio < 1) {
    return { error: "Peak-to-average ratio must be at least 1 — the daily peak cannot be below the average." };
  }
  if (!Number.isFinite(spike) || spike < 1) {
    return { error: "Spike multiplier must be at least 1 (1 means no event spike)." };
  }
  if (!Number.isFinite(growth) || growth < -100) {
    return { error: "Growth cannot be below -100% — traffic cannot become negative." };
  }
  if (!Number.isFinite(perInstance) || perInstance <= 0) {
    return { error: "Per-instance capacity must be above 0 requests per second. Get it from a load test." };
  }
  if (
    !Number.isFinite(utilization) ||
    utilization < MIN_UTILIZATION_PERCENT ||
    utilization > MAX_UTILIZATION_PERCENT
  ) {
    return { error: "Target peak utilization must be between 1% and 100%." };
  }
  if (!Number.isFinite(current) || current < 0 || !Number.isInteger(current)) {
    return { error: "Current instances must be a whole number of 0 or more." };
  }
  if (!Number.isFinite(redundancy) || redundancy < 0 || !Number.isInteger(redundancy)) {
    return { error: "Redundancy instances must be a whole number of 0 or more." };
  }

  // Projected peak = baseline x diurnal peak x event spike x growth.
  const projectedPeakRps = baseline * ratio * spike * (1 + growth / 100);

  // Required capacity so the projected peak lands at the target utilization.
  const requiredCapacityRps = projectedPeakRps / (utilization / 100);

  // Instances derived from load, then N+R on top.
  const instancesForLoad = Math.ceil(requiredCapacityRps / perInstance);
  const instancesRecommended = instancesForLoad + redundancy;

  const currentCapacityRps = current * perInstance;

  // Headroom of the CURRENT fleet against the projected peak.
  // (capacity - peak) / capacity: 0% means saturated, negative means over capacity.
  const currentHeadroomPercent =
    currentCapacityRps > 0
      ? ((currentCapacityRps - projectedPeakRps) / currentCapacityRps) * 100
      : null;

  // Peak utilization the current fleet would actually hit.
  const currentPeakUtilizationPercent =
    currentCapacityRps > 0 ? (projectedPeakRps / currentCapacityRps) * 100 : null;

  // Largest event spike multiplier the current fleet can absorb while staying
  // at or under the target utilization: solve for spike in
  // baseline*ratio*spike*(1+g) = currentCapacity * targetUtil.
  const growthAdjustedPeakBase = baseline * ratio * (1 + growth / 100);
  const maxSpikeAbsorbable =
    currentCapacityRps > 0 && growthAdjustedPeakBase > 0
      ? (currentCapacityRps * (utilization / 100)) / growthAdjustedPeakBase
      : null;

  const additionalInstancesNeeded = Math.max(0, instancesRecommended - current);

  return {
    projectedPeakRps,
    requiredCapacityRps,
    instancesForLoad,
    instancesRecommended,
    redundancyInstances: redundancy,
    currentInstances: current,
    currentCapacityRps,
    currentHeadroomPercent,
    currentPeakUtilizationPercent,
    maxSpikeAbsorbable,
    additionalInstancesNeeded,
    targetUtilizationPercent: utilization,
    perInstanceRps: perInstance,
    meetsTarget: current >= instancesRecommended,
  };
}
