/**
 * Git LFS storage & bandwidth estimator.
 *
 * Model facts:
 * - Git LFS stores every pushed version of a tracked file as a separate
 *   object; old versions are never garbage-collected from the server by
 *   default (git-lfs docs / GitHub "About storage and bandwidth usage").
 * - A fresh `git clone` downloads only the LFS objects needed for the
 *   checked-out ref (the current version of each file), not every historical
 *   version — LFS smudges on checkout (git-lfs docs).
 * - GitHub billing (docs.github.com, "About billing for Git Large File
 *   Storage"): every account gets 1 GiB of free LFS storage and 1 GiB/month
 *   of free bandwidth; extra capacity is bought as data packs at
 *   US$5/month, each adding 50 GiB storage and 50 GiB/month bandwidth.
 *   (GitHub has announced metered LFS billing for some plans; the data-pack
 *   model below is the long-standing published scheme — treat the dollar
 *   figure as an estimate and check your provider's current pricing.)
 * - 1 GiB = 1024 MiB (binary units, which GitHub uses for LFS quotas).
 */

/** GitHub LFS free tier: 1 GiB storage (docs.github.com LFS billing). */
export const FREE_STORAGE_GIB = 1;
/** GitHub LFS free tier: 1 GiB bandwidth per month. */
export const FREE_BANDWIDTH_GIB = 1;
/** One GitHub data pack adds 50 GiB storage per month. */
export const PACK_STORAGE_GIB = 50;
/** One GitHub data pack adds 50 GiB bandwidth per month. */
export const PACK_BANDWIDTH_GIB = 50;
/** Price of one data pack, US$ per month. */
export const PACK_PRICE_USD = 5;
/** Binary unit: MiB per GiB. */
export const MIB_PER_GIB = 1024;

/**
 * Estimate LFS storage, bandwidth and GitHub data-pack cost.
 *
 * @param {object} input
 * @param {number} input.trackedFiles       Number of LFS-tracked files at HEAD.
 * @param {number} input.avgFileSizeMB      Average size of each tracked file, MiB.
 * @param {number} input.newVersionsPerFilePerMonth  New versions pushed per file per month.
 * @param {number} input.months             Horizon to project, months.
 * @param {number} input.clonesPerMonth     Fresh clones (incl. CI) per month.
 * @returns {object} estimate or { error }.
 */
export function estimateLfs({
  trackedFiles,
  avgFileSizeMB,
  newVersionsPerFilePerMonth,
  months,
  clonesPerMonth,
}) {
  const files = Number(trackedFiles);
  const size = Number(avgFileSizeMB);
  const versions = Number(newVersionsPerFilePerMonth);
  const horizon = Number(months);
  const clones = Number(clonesPerMonth);

  if (!Number.isFinite(files) || files <= 0) {
    return { error: "Enter how many LFS-tracked files the repository has (at least 1)." };
  }
  if (!Number.isFinite(size) || size <= 0) {
    return { error: "Average file size must be a positive number of MiB." };
  }
  if (!Number.isFinite(versions) || versions < 0) {
    return { error: "New versions per file per month cannot be negative." };
  }
  if (!Number.isFinite(horizon) || horizon < 1 || !Number.isInteger(horizon)) {
    return { error: "Projection horizon must be a whole number of months (at least 1)." };
  }
  if (!Number.isFinite(clones) || clones < 0) {
    return { error: "Clones per month cannot be negative." };
  }

  // Working set at HEAD: what one fresh clone downloads.
  const currentSetGiB = (files * size) / MIB_PER_GIB;

  // Server storage: initial versions + every new version pushed over the horizon
  // (LFS keeps all versions; nothing is purged by default).
  const newVersionsGiB = (files * size * versions * horizon) / MIB_PER_GIB;
  const storageAtEndGiB = currentSetGiB + newVersionsGiB;

  // Monthly bandwidth: each fresh clone pulls the current working set.
  // (Team members' incremental pulls of changed files are ignored — they are
  // usually small next to clone traffic; note this in the UI.)
  const monthlyBandwidthGiB = clones * currentSetGiB;

  // Data packs must cover BOTH the storage overage and the bandwidth overage —
  // one pack adds 50 GiB to each pool.
  const storageOverGiB = Math.max(0, storageAtEndGiB - FREE_STORAGE_GIB);
  const bandwidthOverGiB = Math.max(0, monthlyBandwidthGiB - FREE_BANDWIDTH_GIB);
  const packsForStorage = Math.ceil(storageOverGiB / PACK_STORAGE_GIB);
  const packsForBandwidth = Math.ceil(bandwidthOverGiB / PACK_BANDWIDTH_GIB);
  const packsNeeded = Math.max(packsForStorage, packsForBandwidth);
  const monthlyCostUsd = packsNeeded * PACK_PRICE_USD;

  return {
    currentSetGiB,
    storageAtEndGiB,
    newVersionsGiB,
    monthlyBandwidthGiB,
    storageOverGiB,
    bandwidthOverGiB,
    packsForStorage,
    packsForBandwidth,
    packsNeeded,
    monthlyCostUsd,
    horizonMonths: horizon,
    boundBy:
      packsNeeded === 0
        ? "free tier"
        : packsForStorage >= packsForBandwidth
          ? "storage"
          : "bandwidth",
  };
}
