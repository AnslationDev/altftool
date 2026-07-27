/**
 * AWS NAT Gateway monthly cost model.
 *
 * Rates are the published on-demand list prices for US East (N. Virginia,
 * us-east-1) from the Amazon VPC pricing page (aws.amazon.com/vpc/pricing).
 * A NAT gateway bills for every hour it is provisioned plus a per-GB charge on
 * every byte it processes in either direction. Data that then leaves AWS to the
 * internet ALSO pays the standard EC2 data-transfer-out rates on top — the part
 * most bills forget. Prices vary by region and change over time.
 */

/** $0.045 per NAT gateway per hour (us-east-1, VPC pricing page). */
export const NAT_HOURLY_RATE = 0.045;

/** $0.045 per GB of data processed by the NAT gateway, any direction (us-east-1). */
export const NAT_DATA_PROCESSING_PER_GB = 0.045;

/** 730 hours — AWS's standard month length for monthly estimates (365 × 24 ÷ 12). */
export const HOURS_PER_MONTH = 730;

/**
 * EC2 data-transfer-out to the internet, us-east-1 (aws.amazon.com/ec2/pricing —
 * Data Transfer section). First 100 GB/month across AWS services is free.
 */
export const EGRESS_FREE_GB = 100;
export const EGRESS_TIERS = [
  { uptoGb: 10240, ratePerGb: 0.09 }, // up to 10 TB/month
  { uptoGb: 51200, ratePerGb: 0.085 }, // next 40 TB
  { uptoGb: 153600, ratePerGb: 0.07 }, // next 100 TB
  { uptoGb: Infinity, ratePerGb: 0.05 }, // over 150 TB
];

/**
 * Tiered internet egress cost after the monthly free allowance.
 * Tier bands are applied to the billable (post-free-tier) volume.
 */
export function computeEgressCost(gb) {
  const billable = Math.max(0, gb - EGRESS_FREE_GB);
  let remaining = billable;
  let prev = 0;
  let cost = 0;
  for (const tier of EGRESS_TIERS) {
    const bandSize = tier.uptoGb - prev;
    const inBand = Math.min(remaining, bandSize);
    if (inBand <= 0) break;
    cost += inBand * tier.ratePerGb;
    remaining -= inBand;
    prev = tier.uptoGb;
  }
  return cost;
}

/**
 * Compute the monthly NAT gateway bill.
 *
 * @param {object} input
 * @param {number} input.gatewayCount      NAT gateways running (typically one per AZ).
 * @param {number} input.dataProcessedGb   GB processed through the gateways per month.
 * @param {number} [input.internetEgressGb] Portion of that traffic that exits to the
 *                                          internet (adds EC2 data-transfer-out cost).
 * @param {number} [input.hoursPerMonth]   Hours each gateway runs (default 730 = whole month).
 * @returns {object} cost breakdown, or { error } for invalid input.
 */
export function computeNatGatewayCost({
  gatewayCount,
  dataProcessedGb,
  internetEgressGb = 0,
  hoursPerMonth = HOURS_PER_MONTH,
}) {
  const count = Number(gatewayCount);
  const dataGb = Number(dataProcessedGb);
  const egressGb = Number(internetEgressGb);
  const hours = Number(hoursPerMonth);

  if (!Number.isFinite(count) || count < 1 || !Number.isInteger(count)) {
    return { error: "Number of NAT gateways must be a whole number of at least 1." };
  }
  if (!Number.isFinite(dataGb) || dataGb < 0) {
    return { error: "Data processed per month cannot be negative." };
  }
  if (!Number.isFinite(egressGb) || egressGb < 0) {
    return { error: "Internet egress cannot be negative." };
  }
  if (egressGb > dataGb) {
    return { error: "Internet egress cannot exceed the total data processed by the gateways." };
  }
  if (!Number.isFinite(hours) || hours <= 0 || hours > 744) {
    return { error: "Hours per month must be between 1 and 744." };
  }

  const hourlyCost = count * hours * NAT_HOURLY_RATE;
  const processingCost = dataGb * NAT_DATA_PROCESSING_PER_GB;
  const egressCost = computeEgressCost(egressGb);
  const total = hourlyCost + processingCost + egressCost;

  return {
    gatewayCount: count,
    hours,
    hourlyCost,
    hourlyCostPerGateway: hours * NAT_HOURLY_RATE,
    processingCost,
    egressCost,
    total,
    effectivePerGb: dataGb > 0 ? (processingCost + egressCost) / dataGb : 0,
  };
}
