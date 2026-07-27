/**
 * AWS EBS monthly cost model.
 *
 * All rates are the published on-demand list prices for the US East (N. Virginia,
 * us-east-1) region from the AWS EBS pricing page (aws.amazon.com/ebs/pricing).
 * EBS bills per GB-month (and per provisioned IOPS-month / MB-s-month) prorated by
 * the second; this tool assumes the volume exists for the whole month.
 * Prices differ by region and change over time — treat results as an estimate.
 */

/** Volume types and their us-east-1 list prices (AWS EBS pricing page). */
export const VOLUME_TYPES = [
  {
    id: "gp3",
    label: "gp3 — General Purpose SSD",
    // $0.08 per GB-month of provisioned storage.
    storagePerGbMonth: 0.08,
    // First 3,000 IOPS are free; extra provisioned IOPS bill at $0.005/IOPS-month.
    freeIops: 3000,
    iopsPerMonth: 0.005,
    // First 125 MB/s of throughput free; extra bills at $0.04 per provisioned MB/s-month.
    freeThroughputMbps: 125,
    throughputPerMbpsMonth: 0.04,
    supportsProvisionedIops: true,
    supportsProvisionedThroughput: true,
    maxIops: 16000, // gp3 hard limit per volume.
    maxThroughputMbps: 1000, // gp3 hard limit per volume.
  },
  {
    id: "gp2",
    label: "gp2 — General Purpose SSD (previous gen)",
    // $0.10 per GB-month; IOPS scale with size (3 IOPS/GB) and are not billed separately.
    storagePerGbMonth: 0.1,
    supportsProvisionedIops: false,
    supportsProvisionedThroughput: false,
  },
  {
    id: "io1",
    label: "io1 — Provisioned IOPS SSD",
    // $0.125 per GB-month plus $0.065 per provisioned IOPS-month (flat, no free tier).
    storagePerGbMonth: 0.125,
    freeIops: 0,
    iopsPerMonth: 0.065,
    supportsProvisionedIops: true,
    supportsProvisionedThroughput: false,
    maxIops: 64000,
  },
  {
    id: "io2",
    label: "io2 — Provisioned IOPS SSD (Block Express)",
    // $0.125 per GB-month. IOPS bill on a tiered schedule (see IO2_IOPS_TIERS).
    storagePerGbMonth: 0.125,
    freeIops: 0,
    tieredIops: true,
    supportsProvisionedIops: true,
    supportsProvisionedThroughput: false,
    maxIops: 256000,
  },
  {
    id: "st1",
    label: "st1 — Throughput Optimized HDD",
    // $0.045 per GB-month; throughput scales with size, not billed separately.
    storagePerGbMonth: 0.045,
    supportsProvisionedIops: false,
    supportsProvisionedThroughput: false,
  },
  {
    id: "sc1",
    label: "sc1 — Cold HDD",
    // $0.015 per GB-month.
    storagePerGbMonth: 0.015,
    supportsProvisionedIops: false,
    supportsProvisionedThroughput: false,
  },
];

/**
 * io2 tiered IOPS rates (us-east-1): first 32,000 IOPS at $0.065/IOPS-month,
 * 32,001–64,000 at $0.046, above 64,000 at $0.032 (AWS EBS pricing page).
 */
export const IO2_IOPS_TIERS = [
  { uptoIops: 32000, ratePerIopsMonth: 0.065 },
  { uptoIops: 64000, ratePerIopsMonth: 0.046 },
  { uptoIops: Infinity, ratePerIopsMonth: 0.032 },
];

/** EBS snapshots to S3, standard tier: $0.05 per GB-month (us-east-1). */
export const SNAPSHOT_PER_GB_MONTH = 0.05;

function io2IopsCost(iops) {
  let cost = 0;
  let prev = 0;
  for (const tier of IO2_IOPS_TIERS) {
    const inTier = Math.min(iops, tier.uptoIops) - prev;
    if (inTier <= 0) break;
    cost += inTier * tier.ratePerIopsMonth;
    prev = tier.uptoIops;
  }
  return cost;
}

/**
 * Compute the monthly EBS bill.
 *
 * @param {object} input
 * @param {string} input.volumeType       One of the VOLUME_TYPES ids.
 * @param {number} input.sizeGb           Provisioned size of one volume, in GB.
 * @param {number} [input.provisionedIops]        Provisioned IOPS (gp3 / io1 / io2).
 * @param {number} [input.throughputMbps]         Provisioned throughput in MB/s (gp3 only).
 * @param {number} [input.volumeCount]            Identical volumes (default 1).
 * @param {number} [input.snapshotGb]             Total snapshot data stored, in GB.
 * @returns {object} cost breakdown, or { error } for invalid input.
 */
export function computeEbsCost({
  volumeType,
  sizeGb,
  provisionedIops = 0,
  throughputMbps = 0,
  volumeCount = 1,
  snapshotGb = 0,
}) {
  const type = VOLUME_TYPES.find((t) => t.id === volumeType);
  if (!type) return { error: "Choose a valid EBS volume type." };

  const size = Number(sizeGb);
  const iops = Number(provisionedIops);
  const throughput = Number(throughputMbps);
  const count = Number(volumeCount);
  const snapshot = Number(snapshotGb);

  if (!Number.isFinite(size) || size <= 0) {
    return { error: "Enter a volume size greater than 0 GB." };
  }
  if (!Number.isFinite(count) || count < 1 || !Number.isInteger(count)) {
    return { error: "Number of volumes must be a whole number of at least 1." };
  }
  if (!Number.isFinite(iops) || iops < 0) {
    return { error: "Provisioned IOPS cannot be negative." };
  }
  if (!Number.isFinite(throughput) || throughput < 0) {
    return { error: "Provisioned throughput cannot be negative." };
  }
  if (!Number.isFinite(snapshot) || snapshot < 0) {
    return { error: "Snapshot storage cannot be negative." };
  }
  if (type.supportsProvisionedIops && type.maxIops && iops > type.maxIops) {
    return {
      error: `${type.label.split(" — ")[0]} supports at most ${type.maxIops.toLocaleString("en-US")} IOPS per volume.`,
    };
  }
  if (
    type.supportsProvisionedThroughput &&
    type.maxThroughputMbps &&
    throughput > type.maxThroughputMbps
  ) {
    return {
      error: `gp3 supports at most ${type.maxThroughputMbps.toLocaleString("en-US")} MB/s per volume.`,
    };
  }

  const storageCostPerVolume = size * type.storagePerGbMonth;

  let iopsCostPerVolume = 0;
  if (type.supportsProvisionedIops) {
    if (type.tieredIops) {
      iopsCostPerVolume = io2IopsCost(iops);
    } else {
      const billableIops = Math.max(0, iops - (type.freeIops ?? 0));
      iopsCostPerVolume = billableIops * (type.iopsPerMonth ?? 0);
    }
  }

  let throughputCostPerVolume = 0;
  if (type.supportsProvisionedThroughput) {
    const billableMbps = Math.max(0, throughput - (type.freeThroughputMbps ?? 0));
    throughputCostPerVolume = billableMbps * (type.throughputPerMbpsMonth ?? 0);
  }

  const perVolume = storageCostPerVolume + iopsCostPerVolume + throughputCostPerVolume;
  const storageCost = storageCostPerVolume * count;
  const iopsCost = iopsCostPerVolume * count;
  const throughputCost = throughputCostPerVolume * count;
  const snapshotCost = snapshot * SNAPSHOT_PER_GB_MONTH;
  const total = storageCost + iopsCost + throughputCost + snapshotCost;

  return {
    volumeType: type.id,
    volumeLabel: type.label,
    storageCost,
    iopsCost,
    throughputCost,
    snapshotCost,
    perVolume,
    volumeCount: count,
    total,
  };
}
