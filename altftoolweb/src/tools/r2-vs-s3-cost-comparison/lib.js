/**
 * Cloudflare R2 vs Amazon S3 Standard monthly cost comparison.
 *
 * R2 rates: developers.cloudflare.com/r2/pricing (Standard storage class).
 * S3 rates: aws.amazon.com/s3/pricing, S3 Standard in us-east-1, plus the
 * EC2/S3 internet data-transfer-out tiers.
 * "Class A" R2 operations correspond to S3 PUT/COPY/POST/LIST (writes);
 * "Class B" correspond to S3 GET/SELECT (reads).
 * Prices change over time — treat results as an estimate.
 */

/* ---------------- Cloudflare R2 (Standard storage) ---------------- */

/** R2 storage: $0.015 per GB-month. */
export const R2_STORAGE_PER_GB = 0.015;

/** R2 Class A operations (writes/lists): $4.50 per million. */
export const R2_CLASS_A_PER_M = 4.5;

/** R2 Class B operations (reads): $0.36 per million. */
export const R2_CLASS_B_PER_M = 0.36;

/** R2 egress to the internet: $0 per GB. */
export const R2_EGRESS_PER_GB = 0;

/** R2 monthly free tier: 10 GB storage, 1M Class A and 10M Class B ops. */
export const R2_FREE_STORAGE_GB = 10;
export const R2_FREE_CLASS_A_M = 1;
export const R2_FREE_CLASS_B_M = 10;

/* ---------------- Amazon S3 Standard (us-east-1) ---------------- */

/**
 * S3 Standard storage tiers: $0.023/GB first 50 TB, $0.022/GB next 450 TB,
 * $0.021/GB over 500 TB per month.
 */
export const S3_STORAGE_TIERS = [
  { uptoGb: 51200, ratePerGb: 0.023 },
  { uptoGb: 512000, ratePerGb: 0.022 },
  { uptoGb: Infinity, ratePerGb: 0.021 },
];

/** S3 PUT/COPY/POST/LIST: $0.005 per 1,000 requests = $5.00 per million. */
export const S3_WRITE_PER_M = 5;

/** S3 GET/SELECT: $0.0004 per 1,000 requests = $0.40 per million. */
export const S3_READ_PER_M = 0.4;

/**
 * Internet data-transfer-out from S3 (us-east-1): first 100 GB/month free
 * across AWS services, then $0.09/GB up to 10 TB, $0.085 next 40 TB,
 * $0.07 next 100 TB, $0.05 beyond.
 */
export const S3_EGRESS_FREE_GB = 100;
export const S3_EGRESS_TIERS = [
  { uptoGb: 10240, ratePerGb: 0.09 },
  { uptoGb: 51200, ratePerGb: 0.085 },
  { uptoGb: 153600, ratePerGb: 0.07 },
  { uptoGb: Infinity, ratePerGb: 0.05 },
];

function tieredCost(amount, tiers) {
  let remaining = amount;
  let prev = 0;
  let cost = 0;
  for (const tier of tiers) {
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
 * Compare monthly object storage cost on R2 and S3 Standard.
 *
 * @param {object} input
 * @param {number} input.storageGb        Average data stored, GB.
 * @param {number} input.writeOpsM        Write-class ops (PUT/COPY/POST/LIST — R2 Class A), millions/month.
 * @param {number} input.readOpsM         Read-class ops (GET — R2 Class B), millions/month.
 * @param {number} input.egressGb         Data served to the internet, GB/month.
 * @param {boolean} [input.applyR2FreeTier] Deduct R2's monthly free tier (default true).
 * @returns {object} both breakdowns plus savings, or { error }.
 */
export function compareR2VsS3({
  storageGb,
  writeOpsM,
  readOpsM,
  egressGb,
  applyR2FreeTier = true,
}) {
  const storage = Number(storageGb);
  const writes = Number(writeOpsM);
  const reads = Number(readOpsM);
  const egress = Number(egressGb);

  if (!Number.isFinite(storage) || storage < 0) {
    return { error: "Stored data must be zero or more GB." };
  }
  if (!Number.isFinite(writes) || writes < 0) {
    return { error: "Write operations cannot be negative." };
  }
  if (!Number.isFinite(reads) || reads < 0) {
    return { error: "Read operations cannot be negative." };
  }
  if (!Number.isFinite(egress) || egress < 0) {
    return { error: "Egress cannot be negative." };
  }

  // R2: flat rates after (optional) free tier; egress always $0.
  const r2Storage =
    Math.max(0, storage - (applyR2FreeTier ? R2_FREE_STORAGE_GB : 0)) * R2_STORAGE_PER_GB;
  const r2Writes =
    Math.max(0, writes - (applyR2FreeTier ? R2_FREE_CLASS_A_M : 0)) * R2_CLASS_A_PER_M;
  const r2Reads =
    Math.max(0, reads - (applyR2FreeTier ? R2_FREE_CLASS_B_M : 0)) * R2_CLASS_B_PER_M;
  const r2Egress = egress * R2_EGRESS_PER_GB; // always 0 — kept explicit for the breakdown.
  const r2Total = r2Storage + r2Writes + r2Reads + r2Egress;

  // S3 Standard: tiered storage, flat request rates, tiered egress after 100 GB free.
  const s3Storage = tieredCost(storage, S3_STORAGE_TIERS);
  const s3Writes = writes * S3_WRITE_PER_M;
  const s3Reads = reads * S3_READ_PER_M;
  const s3Egress = tieredCost(Math.max(0, egress - S3_EGRESS_FREE_GB), S3_EGRESS_TIERS);
  const s3Total = s3Storage + s3Writes + s3Reads + s3Egress;

  const saving = s3Total - r2Total;
  const cheaper = saving >= 0 ? "r2" : "s3";
  const savingPercent =
    Math.max(s3Total, r2Total) > 0
      ? (Math.abs(saving) / Math.max(s3Total, r2Total)) * 100
      : 0;

  return {
    r2: { storage: r2Storage, writes: r2Writes, reads: r2Reads, egress: r2Egress, total: r2Total },
    s3: { storage: s3Storage, writes: s3Writes, reads: s3Reads, egress: s3Egress, total: s3Total },
    cheaper,
    saving: Math.abs(saving),
    savingPercent,
  };
}
