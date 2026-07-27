/**
 * DigitalOcean pricing model, encoded from digitalocean.com/pricing
 * (USD, Basic shared-CPU droplets, last checked mid-2025).
 * Droplets bill hourly and cap at the monthly price after 672 hours.
 * Each droplet accrues a pooled outbound transfer allowance; overage
 * is billed per GB. Prices change; treat results as estimates.
 */

/** DigitalOcean caps droplet billing at 672 hours per month (28 days x 24 h). */
export const BILLING_HOURS_CAP = 672;

/**
 * Basic (shared CPU, regular SSD) droplet plans — digitalocean.com/pricing.
 * transferGb is the monthly outbound transfer allowance the droplet adds
 * to the account pool.
 */
export const DROPLET_PLANS = [
  { id: "s-1-512", label: "512 MB / 1 vCPU / 10 GB SSD", usd: 4, transferGb: 500 },
  { id: "s-1-1", label: "1 GB / 1 vCPU / 25 GB SSD", usd: 6, transferGb: 1000 },
  { id: "s-1-2", label: "2 GB / 1 vCPU / 50 GB SSD", usd: 12, transferGb: 2000 },
  { id: "s-2-2", label: "2 GB / 2 vCPU / 60 GB SSD", usd: 18, transferGb: 3000 },
  { id: "s-2-4", label: "4 GB / 2 vCPU / 80 GB SSD", usd: 24, transferGb: 4000 },
  { id: "s-4-8", label: "8 GB / 4 vCPU / 160 GB SSD", usd: 48, transferGb: 5000 },
  { id: "s-8-16", label: "16 GB / 8 vCPU / 320 GB SSD", usd: 96, transferGb: 6000 },
];

/** Block storage volumes — $0.10 per GB per month (digitalocean.com/pricing, Volumes). */
export const VOLUME_PER_GB_MONTH = 0.1;

/** Snapshots — $0.06 per GB per month (digitalocean.com/pricing, Snapshots). */
export const SNAPSHOT_PER_GB_MONTH = 0.06;

/** Load balancer — $12 per node per month for the small size (digitalocean.com/pricing). */
export const LOAD_BALANCER_PER_NODE_MONTH = 12;

/** Bandwidth overage beyond the pooled allowance — $0.01 per GiB. */
export const BANDWIDTH_OVERAGE_PER_GB = 0.01;

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Estimate the monthly DigitalOcean bill.
 *
 * @param {object} input
 * @param {string} input.planId           One of DROPLET_PLANS ids.
 * @param {number} input.dropletCount     Number of droplets of that plan.
 * @param {number} input.hoursPerDroplet  Hours each droplet exists in the month (capped at 672).
 * @param {number} input.volumeGb         Total block storage volume size in GB.
 * @param {number} input.snapshotGb       Total snapshot data in GB.
 * @param {number} input.lbNodes          Load balancer nodes (small size).
 * @param {number} input.outboundGb       Total outbound transfer used in GB.
 * @returns {object} breakdown, or { error }.
 */
export function estimateDropletCost({
  planId,
  dropletCount,
  hoursPerDroplet,
  volumeGb,
  snapshotGb,
  lbNodes,
  outboundGb,
}) {
  const fields = [
    ["Droplet count", dropletCount],
    ["Hours per droplet", hoursPerDroplet],
    ["Volume size", volumeGb],
    ["Snapshot size", snapshotGb],
    ["Load balancer nodes", lbNodes],
    ["Outbound transfer", outboundGb],
  ];
  for (const [label, value] of fields) {
    const n = Number(value);
    if (!Number.isFinite(n)) return { error: `${label} must be a number.` };
    if (n < 0) return { error: `${label} cannot be negative.` };
  }

  const plan = DROPLET_PLANS.find((p) => p.id === planId);
  if (!plan) return { error: "Choose a valid droplet plan." };

  const count = Math.floor(Number(dropletCount));
  const hours = Math.min(Number(hoursPerDroplet), BILLING_HOURS_CAP);
  const nodes = Math.floor(Number(lbNodes));
  const usedGb = Number(outboundGb);

  if (count === 0 && nodes === 0 && Number(volumeGb) === 0 && Number(snapshotGb) === 0) {
    return { error: "Add at least one droplet, volume, snapshot or load balancer node." };
  }

  // Droplets bill hourly (monthly price / 672) and cap at the monthly price.
  const hourFraction = hours / BILLING_HOURS_CAP;
  const dropletCost = round2(plan.usd * hourFraction * count);

  // The transfer allowance accrues hourly, so partial-month droplets pool less.
  const pooledAllowanceGb = round2(plan.transferGb * hourFraction * count);
  const overageGb = Math.max(0, usedGb - pooledAllowanceGb);
  const bandwidthOverage = round2(overageGb * BANDWIDTH_OVERAGE_PER_GB);

  const volumeCost = round2(Number(volumeGb) * VOLUME_PER_GB_MONTH);
  const snapshotCost = round2(Number(snapshotGb) * SNAPSHOT_PER_GB_MONTH);
  const lbCost = round2(nodes * LOAD_BALANCER_PER_NODE_MONTH);

  const total = round2(dropletCost + bandwidthOverage + volumeCost + snapshotCost + lbCost);

  return {
    plan: plan.label,
    planUsd: plan.usd,
    dropletCount: count,
    hoursBilled: hours,
    dropletCost,
    pooledAllowanceGb,
    overageGb: round2(overageGb),
    bandwidthOverage,
    volumeCost,
    snapshotCost,
    lbCost,
    total,
    yearlyTotal: round2(total * 12),
  };
}
