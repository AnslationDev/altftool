/**
 * Passing marks requirement tool.
 *
 * Indian university pass rules for a theory subject typically impose TWO
 * simultaneous minima, published in the scheme/ordinance:
 *  1. A minimum in the external (end-semester) paper alone — commonly 35–40%
 *     of the external maximum.
 *  2. A minimum in the subject aggregate (internal + external together) —
 *     commonly 40–50% of the total maximum.
 * The external marks needed are therefore:
 *   needByExternalRule  = ceil(externalMinPercent% × externalMax)
 *   needByAggregateRule = ceil(aggregatePassPercent% × (internalMax + externalMax)) − internalScored
 *   required            = max(needByExternalRule, needByAggregateRule, 0)
 * ceil() is used because exam marks are awarded in whole numbers and a fraction
 * short is a fail. If required exceeds externalMax the subject cannot be passed
 * with the current internal score. The default percentages (35% external, 40%
 * aggregate) are the most common published values, and both are editable.
 */

/** Common published external-only pass minimum (fraction of external max). */
export const DEFAULT_EXTERNAL_MIN_PERCENT = 35;
/** Common published aggregate pass minimum (fraction of total max). */
export const DEFAULT_AGGREGATE_PASS_PERCENT = 40;

/**
 * Compute the external marks needed to pass.
 *
 * @param {object} input
 * @param {number|string} input.internalScored        Internal marks obtained.
 * @param {number|string} input.internalMax           Internal component maximum.
 * @param {number|string} input.externalMax           External paper maximum.
 * @param {number|string} input.externalMinPercent    Separate external-only minimum (% of external max).
 * @param {number|string} input.aggregatePassPercent  Aggregate minimum (% of internal+external max).
 * @returns {object} result, or { error }.
 */
export function computeRequiredExternal({
  internalScored,
  internalMax,
  externalMax,
  externalMinPercent = DEFAULT_EXTERNAL_MIN_PERCENT,
  aggregatePassPercent = DEFAULT_AGGREGATE_PASS_PERCENT,
}) {
  const scored = Number(internalScored);
  const iMax = Number(internalMax);
  const eMax = Number(externalMax);
  const extPct = Number(externalMinPercent);
  const aggPct = Number(aggregatePassPercent);

  if (!Number.isFinite(iMax) || iMax < 0) {
    return { error: "Internal maximum must be zero or a positive number." };
  }
  if (!Number.isFinite(eMax) || eMax <= 0) {
    return { error: "External paper maximum must be a positive number (commonly 60, 70 or 100)." };
  }
  if (!Number.isFinite(scored) || scored < 0) {
    return { error: "Internal marks scored cannot be negative." };
  }
  if (scored > iMax) {
    return { error: `Internal marks scored (${scored}) cannot exceed the internal maximum (${iMax}).` };
  }
  if (!Number.isFinite(extPct) || extPct < 0 || extPct > 100) {
    return { error: "External-only pass percentage must be between 0 and 100." };
  }
  if (!Number.isFinite(aggPct) || aggPct < 0 || aggPct > 100) {
    return { error: "Aggregate pass percentage must be between 0 and 100." };
  }

  const totalMax = iMax + eMax;

  // Rule 1: minimum in the external paper alone.
  const needByExternalRule = Math.ceil((extPct / 100) * eMax);

  // Rule 2: aggregate minimum, less what the internal already contributes.
  // ceil of the shortfall: external marks come in whole numbers, so any
  // fractional shortfall still costs a full mark.
  const aggregateTarget = (aggPct / 100) * totalMax;
  const needByAggregateRule = Math.max(0, Math.ceil(aggregateTarget - scored));

  const required = Math.max(needByExternalRule, needByAggregateRule);
  const achievable = required <= eMax;

  const bindingRule =
    needByExternalRule >= needByAggregateRule ? "external-minimum" : "aggregate-minimum";

  return {
    required,
    achievable,
    bindingRule,
    needByExternalRule,
    needByAggregateRule,
    aggregateTarget: Number(aggregateTarget.toFixed(1)),
    totalMax,
    internalScored: scored,
    internalMax: iMax,
    externalMax: eMax,
    externalMinPercent: extPct,
    aggregatePassPercent: aggPct,
    /** Required external marks as a percentage of the external paper. */
    requiredPercentOfExternal: Number(((required / eMax) * 100).toFixed(1)),
    /** Marks of headroom left in the paper once the requirement is met. */
    headroom: Math.max(0, eMax - required),
  };
}
