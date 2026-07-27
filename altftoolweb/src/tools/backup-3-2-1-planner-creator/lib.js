/**
 * Creator Backup 3-2-1 Planner — capacity, cost and restore-time maths.
 *
 * The 3-2-1 rule (popularised by photographer Peter Krogh and later echoed by
 * US-CERT guidance) says: keep 3 copies of your data, on 2 different types of
 * media, with 1 copy off site. This module sizes that plan against a footage
 * library that is still growing.
 *
 * Pure module — no React, no DOM, no clocks. The horizon is passed in as a
 * number of months, never derived from the current date.
 */

/** The rule itself. */
export const RULE_TOTAL_COPIES = 3;
export const RULE_MEDIA_TYPES = 2;
export const RULE_OFFSITE_COPIES = 1;

/**
 * Free space to leave on every drive. Both HDDs and SSDs slow down and fragment
 * badly once a volume passes roughly 80-90% full, and a backup target with no
 * headroom cannot absorb the next shoot, so 20% is a safe default.
 */
export const DEFAULT_HEADROOM_PCT = 20;

/** Storage is sold in decimal units: 1 TB = 1000 GB = 1,000,000 MB. */
export const GB_PER_TB = 1000;
export const MB_PER_TB = 1000000;

/** Bits per byte, for converting an internet link speed into restore time. */
export const BITS_PER_BYTE = 8;

/** A decimal TB shown by Windows as binary TiB: 1 TB = 1000^4 / 1024^4 TiB. */
export const TB_TO_TIB = 1000 ** 4 / 1024 ** 4;

/** Sanity ceilings. */
export const MAX_LIBRARY_TB = 100000;
export const MAX_HORIZON_MONTHS = 240;
export const MIN_COPIES = 2;
export const MAX_COPIES = 5;

export const OFFSITE_MODES = [
  { id: "cloud", label: "Cloud archive (billed per TB per month)" },
  { id: "drive", label: "Rotated drive kept off site" },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

const FIELD_LABELS = {
  currentTB: "current library size",
  monthlyGrowthGB: "monthly growth",
  horizonMonths: "planning horizon",
  headroomPct: "free space headroom",
  driveSizeTB: "drive capacity",
  drivePrice: "price per drive",
  cloudPricePerTBMonth: "cloud price per TB per month",
  copies: "number of copies",
  localTransferMBs: "local transfer speed",
  internetMbps: "download speed",
};

/**
 * @param {object} input
 * @returns {object} the sized plan, or { error } when the input is unusable.
 */
export function planBackup({
  currentTB,
  monthlyGrowthGB,
  horizonMonths,
  headroomPct = DEFAULT_HEADROOM_PCT,
  driveSizeTB,
  drivePrice,
  cloudPricePerTBMonth,
  copies = RULE_TOTAL_COPIES,
  offsiteMode = "cloud",
  localTransferMBs,
  internetMbps,
} = {}) {
  const values = {
    currentTB,
    monthlyGrowthGB,
    horizonMonths,
    headroomPct,
    driveSizeTB,
    drivePrice,
    cloudPricePerTBMonth,
    copies,
    localTransferMBs,
    internetMbps,
  };
  for (const [key, value] of Object.entries(values)) {
    if (!isNum(value)) return { error: `Enter a valid number for ${FIELD_LABELS[key]}.` };
    if (value < 0) return { error: `${FIELD_LABELS[key]} cannot be negative.` };
  }
  if (!OFFSITE_MODES.some((entry) => entry.id === offsiteMode)) {
    return { error: "Choose how the off-site copy is stored." };
  }

  if (currentTB <= 0) return { error: "Current library size must be greater than zero." };
  if (currentTB > MAX_LIBRARY_TB) {
    return { error: `Current library size must be ${MAX_LIBRARY_TB} TB or less.` };
  }
  if (!Number.isInteger(horizonMonths) || horizonMonths < 1) {
    return { error: "Planning horizon must be a whole number of months, at least 1." };
  }
  if (horizonMonths > MAX_HORIZON_MONTHS) {
    return { error: `Planning horizon must be ${MAX_HORIZON_MONTHS} months or less.` };
  }
  if (headroomPct >= 90) return { error: "Free-space headroom must be under 90%." };
  if (driveSizeTB <= 0) return { error: "Drive capacity must be greater than zero." };
  if (!Number.isInteger(copies) || copies < MIN_COPIES || copies > MAX_COPIES) {
    return { error: `Number of copies must be a whole number between ${MIN_COPIES} and ${MAX_COPIES}.` };
  }
  if (localTransferMBs <= 0) return { error: "Local transfer speed must be greater than zero." };
  if (internetMbps <= 0) return { error: "Download speed must be greater than zero." };

  const monthlyGrowthTB = monthlyGrowthGB / GB_PER_TB;
  const projectedTB = currentTB + monthlyGrowthTB * horizonMonths;

  // Usable capacity is only (100 - headroom)% of what you buy.
  const usableFraction = (100 - headroomPct) / 100;
  const requiredPerCopyTB = projectedTB / usableFraction;
  const drivesPerCopy = Math.ceil(requiredPerCopyTB / driveSizeTB);

  const offsiteIsCloud = offsiteMode === "cloud";
  const driveBackedCopies = offsiteIsCloud ? copies - RULE_OFFSITE_COPIES : copies;
  const totalDrives = drivesPerCopy * driveBackedCopies;
  const hardwareCost = totalDrives * drivePrice;

  // Cloud is billed on what is stored each month, so sum the growing library
  // month by month rather than charging the end-state figure for every month.
  let cloudCost = 0;
  if (offsiteIsCloud) {
    for (let month = 1; month <= horizonMonths; month += 1) {
      cloudCost += (currentTB + monthlyGrowthTB * month) * cloudPricePerTBMonth;
    }
  }

  const totalCost = hardwareCost + cloudCost;

  // Restore time: bytes over a local bus, bits over an internet link.
  const localRestoreHours = (projectedTB * MB_PER_TB) / localTransferMBs / 3600;
  const cloudRestoreHours =
    (projectedTB * MB_PER_TB * BITS_PER_BYTE) / internetMbps / 3600;

  const plan = [
    {
      key: "primary",
      label: "Copy 1 — working storage",
      medium: "Internal or RAID working volume",
      location: "On site",
      drives: drivesPerCopy,
    },
    {
      key: "local-backup",
      label: "Copy 2 — local backup",
      medium: "External drive on a different make or interface",
      location: "On site, different room",
      drives: drivesPerCopy,
    },
    {
      key: "offsite",
      label: `Copy ${copies} — off-site`,
      medium: offsiteIsCloud ? "Cloud archive" : "Rotated external drive",
      location: offsiteIsCloud ? "Provider data centre" : "Second address",
      drives: offsiteIsCloud ? 0 : drivesPerCopy,
    },
  ];

  return {
    projectedTB,
    projectedTiB: projectedTB * TB_TO_TIB,
    growthTB: monthlyGrowthTB * horizonMonths,
    requiredPerCopyTB,
    drivesPerCopy,
    totalDrives,
    hardwareCost,
    cloudCost,
    totalCost,
    costPerMonth: totalCost / horizonMonths,
    costPerTB: projectedTB > 0 ? totalCost / projectedTB : null,
    localRestoreHours,
    cloudRestoreHours: offsiteIsCloud ? cloudRestoreHours : null,
    plan,
    /** True when the plan actually satisfies the 3-2-1 rule as configured. */
    meetsRule: copies >= RULE_TOTAL_COPIES,
  };
}

/** Format a duration in hours as "3 d 6 h" or "6 h 12 m". Pure display helper. */
export function formatHours(hours) {
  if (!isNum(hours) || hours < 0) return "—";
  if (hours < 1) return `${Math.round(hours * 60)} m`;
  if (hours < 48) {
    const whole = Math.floor(hours);
    const minutes = Math.round((hours - whole) * 60);
    return `${whole} h ${String(minutes).padStart(2, "0")} m`;
  }
  const days = Math.floor(hours / 24);
  const rest = Math.round(hours - days * 24);
  return `${days} d ${rest} h`;
}
