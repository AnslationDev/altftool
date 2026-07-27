/**
 * Vercel Pro plan usage cost model.
 *
 * All figures are Vercel's published Pro plan list prices and included
 * allowances from vercel.com/pricing (managed infrastructure pricing).
 * Included allowances are per team per month; overage bills at the listed
 * unit rate. Pricing changes over time — treat results as an estimate.
 */

/** Pro plan seat price: $20 per team member per month (vercel.com/pricing). */
export const SEAT_PRICE = 20;

/** Fast data transfer (edge to visitor): 1 TB included, then $0.15/GB. */
export const INCLUDED_BANDWIDTH_GB = 1024;
export const BANDWIDTH_OVERAGE_PER_GB = 0.15;

/** Edge requests: 10 million included, then $2.00 per additional million. */
export const INCLUDED_EDGE_REQUESTS_M = 10;
export const EDGE_REQUEST_OVERAGE_PER_M = 2;

/** Function invocations: 1 million included, then $0.60 per additional million. */
export const INCLUDED_INVOCATIONS_M = 1;
export const INVOCATION_OVERAGE_PER_M = 0.6;

/** Function duration: 1,000 GB-hours included, then $0.18 per GB-hour. */
export const INCLUDED_FUNCTION_GB_HOURS = 1000;
export const FUNCTION_DURATION_OVERAGE_PER_GB_HOUR = 0.18;

/**
 * Build execution: Pro includes 24,000 build minutes per month on standard
 * machines (vercel.com/docs/limits). There is no simple per-minute overage
 * price — exceeding it needs on-demand concurrency / enhanced builds — so the
 * tool flags the excess instead of pricing it.
 */
export const INCLUDED_BUILD_MINUTES = 24000;

/**
 * Compute the estimated monthly Vercel Pro bill.
 *
 * @param {object} input
 * @param {number} input.seats               Team members (each pays the seat price).
 * @param {number} input.bandwidthGb         Fast data transfer used, GB/month.
 * @param {number} input.edgeRequestsM       Edge requests, in millions/month.
 * @param {number} input.invocationsM        Function invocations, in millions/month.
 * @param {number} input.functionGbHours     Function duration used, GB-hours/month.
 * @param {number} input.buildMinutes        Build minutes used per month.
 * @returns {object} cost breakdown, or { error } for invalid input.
 */
export function computeVercelCost({
  seats,
  bandwidthGb,
  edgeRequestsM,
  invocationsM,
  functionGbHours,
  buildMinutes,
}) {
  const seatCount = Number(seats);
  const bandwidth = Number(bandwidthGb);
  const edgeReq = Number(edgeRequestsM);
  const invocations = Number(invocationsM);
  const gbHours = Number(functionGbHours);
  const builds = Number(buildMinutes);

  if (!Number.isFinite(seatCount) || seatCount < 1 || !Number.isInteger(seatCount)) {
    return { error: "Seats must be a whole number of at least 1." };
  }
  if (!Number.isFinite(bandwidth) || bandwidth < 0) {
    return { error: "Bandwidth cannot be negative." };
  }
  if (!Number.isFinite(edgeReq) || edgeReq < 0) {
    return { error: "Edge requests cannot be negative." };
  }
  if (!Number.isFinite(invocations) || invocations < 0) {
    return { error: "Function invocations cannot be negative." };
  }
  if (!Number.isFinite(gbHours) || gbHours < 0) {
    return { error: "Function duration cannot be negative." };
  }
  if (!Number.isFinite(builds) || builds < 0) {
    return { error: "Build minutes cannot be negative." };
  }

  const seatCost = seatCount * SEAT_PRICE;
  const bandwidthCost =
    Math.max(0, bandwidth - INCLUDED_BANDWIDTH_GB) * BANDWIDTH_OVERAGE_PER_GB;
  const edgeRequestCost =
    Math.max(0, edgeReq - INCLUDED_EDGE_REQUESTS_M) * EDGE_REQUEST_OVERAGE_PER_M;
  const invocationCost =
    Math.max(0, invocations - INCLUDED_INVOCATIONS_M) * INVOCATION_OVERAGE_PER_M;
  const durationCost =
    Math.max(0, gbHours - INCLUDED_FUNCTION_GB_HOURS) *
    FUNCTION_DURATION_OVERAGE_PER_GB_HOUR;

  const buildMinutesOver = Math.max(0, builds - INCLUDED_BUILD_MINUTES);

  const total = seatCost + bandwidthCost + edgeRequestCost + invocationCost + durationCost;

  return {
    seatCost,
    bandwidthCost,
    edgeRequestCost,
    invocationCost,
    durationCost,
    buildMinutesOver,
    buildWithinPlan: buildMinutesOver === 0,
    total,
  };
}
