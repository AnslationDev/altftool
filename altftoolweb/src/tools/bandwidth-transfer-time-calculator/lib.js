/**
 * Bandwidth transfer-time calculation.
 *
 *   time (s) = size (bits) / (link rate (bit/s) x efficiency)
 *
 * Unit conventions:
 *  - Decimal (SI) size units: kB/MB/GB/TB = powers of 1000 (IEC 80000-13);
 *    this matches how drive vendors and most file managers on macOS label
 *    sizes.
 *  - Binary size units: KiB/MiB/GiB/TiB = powers of 1024 (IEC 80000-13);
 *    matches Windows Explorer's reported "KB/MB" figures.
 *  - Network link rates are ALWAYS decimal bits per second: 1 Mbps =
 *    1,000,000 bit/s (ISP marketing, Ethernet standards).
 *  - 1 byte = 8 bits.
 *  - Protocol efficiency: TCP/IPv4 over Ethernet loses roughly 2-6% to
 *    Ethernet/IP/TCP headers and ACKs; real-world defaults of ~90-95%
 *    goodput are standard rules of thumb. The user controls the percentage.
 */

export const BITS_PER_BYTE = 8;

export const SIZE_UNITS = [
  { id: "B", label: "bytes (B)", bytes: 1 },
  { id: "KB", label: "kilobytes (kB, 1000 B)", bytes: 1e3 },
  { id: "MB", label: "megabytes (MB, 1000² B)", bytes: 1e6 },
  { id: "GB", label: "gigabytes (GB, 1000³ B)", bytes: 1e9 },
  { id: "TB", label: "terabytes (TB, 1000⁴ B)", bytes: 1e12 },
  { id: "KiB", label: "kibibytes (KiB, 1024 B)", bytes: 1024 },
  { id: "MiB", label: "mebibytes (MiB, 1024² B)", bytes: 1024 ** 2 },
  { id: "GiB", label: "gibibytes (GiB, 1024³ B)", bytes: 1024 ** 3 },
  { id: "TiB", label: "tebibytes (TiB, 1024⁴ B)", bytes: 1024 ** 4 },
];

export const SPEED_UNITS = [
  { id: "bps", label: "bit/s", bitsPerSecond: 1 },
  { id: "Kbps", label: "kbit/s (Kbps)", bitsPerSecond: 1e3 },
  { id: "Mbps", label: "Mbit/s (Mbps)", bitsPerSecond: 1e6 },
  { id: "Gbps", label: "Gbit/s (Gbps)", bitsPerSecond: 1e9 },
  { id: "MBps", label: "MB/s (megabytes per second)", bitsPerSecond: 8e6 },
  { id: "GBps", label: "GB/s (gigabytes per second)", bitsPerSecond: 8e9 },
];

// Rule-of-thumb goodput for TCP/IP over Ethernet after header + ACK overhead.
export const DEFAULT_EFFICIENCY_PERCENT = 90;

/** Human-friendly duration string from seconds. */
export function formatTransferDuration(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  if (!Number.isFinite(s)) return "—";
  if (s < 1) return `${(s * 1000).toFixed(0)} ms`;
  // Anything that would round to "60.0" at one decimal place belongs to the
  // next whole minute, not this branch — fall through so it carries below.
  if (s < 59.95) return `${s.toFixed(1)} sec`;
  // Round to a single whole-second total first, then decompose it. Rounding
  // each unit (days/hours/minutes/seconds) independently — as before — could
  // produce a seconds value of 60 without carrying into minutes (and so on),
  // yielding invalid strings like "17 h 11 min 60 sec".
  const wholeSeconds = Math.round(s);
  const days = Math.floor(wholeSeconds / 86400);
  const hours = Math.floor((wholeSeconds % 86400) / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const seconds = wholeSeconds % 60;
  const parts = [];
  if (days) parts.push(`${days} d`);
  if (hours) parts.push(`${hours} h`);
  if (minutes) parts.push(`${minutes} min`);
  if (seconds && !days) parts.push(`${seconds} sec`);
  return parts.length > 0 ? parts.join(" ") : "0 sec";
}

const DECIMAL_BYTE_UNITS = [
  { id: "TB", divisor: 1e12 },
  { id: "GB", divisor: 1e9 },
  { id: "MB", divisor: 1e6 },
  { id: "KB", divisor: 1e3 },
  { id: "B", divisor: 1 },
];

const DECIMAL_BIT_UNITS = [
  { id: "Tbit", divisor: 1e12 },
  { id: "Gbit", divisor: 1e9 },
  { id: "Mbit", divisor: 1e6 },
  { id: "kbit", divisor: 1e3 },
  { id: "bit", divisor: 1 },
];

function scaleToUnit(rawValue, units) {
  const magnitude = Math.max(0, Number(rawValue) || 0);
  const unit = units.find((u) => magnitude >= u.divisor) || units[units.length - 1];
  const value = magnitude / unit.divisor;
  const decimals = unit.divisor === 1 ? 0 : 2;
  const rounded = Math.round(value * 10 ** decimals) / 10 ** decimals;
  return `${rounded} ${unit.id}`;
}

/**
 * Human-friendly data size, auto-scaled from bytes to the largest decimal
 * unit (B/KB/MB/GB/TB) that keeps the figure >= 1 — unlike a hardcoded ÷1e9,
 * this never rounds a real, nonzero transfer down to a misleading "0 GB".
 */
export function formatDataSize(totalBytes) {
  return scaleToUnit(totalBytes, DECIMAL_BYTE_UNITS);
}

/** Human-friendly bit count, auto-scaled from bits to bit/kbit/Mbit/Gbit/Tbit. */
export function formatBitSize(totalBits) {
  return scaleToUnit(totalBits, DECIMAL_BIT_UNITS);
}

/**
 * Compute transfer time.
 *
 * @param {object} input
 * @param {number} input.sizeValue          Size figure, >= 0.
 * @param {string} input.sizeUnit           One of SIZE_UNITS ids.
 * @param {number} input.speedValue         Link rate figure, > 0.
 * @param {string} input.speedUnit          One of SPEED_UNITS ids.
 * @param {number} [input.efficiencyPercent] Goodput percentage 1-100.
 * @returns {{ seconds, idealSeconds, totalBits, effectiveBitsPerSecond,
 *             effectiveMegabytesPerSecond }|{ error }}
 */
export function computeTransferTime({
  sizeValue,
  sizeUnit,
  speedValue,
  speedUnit,
  efficiencyPercent = DEFAULT_EFFICIENCY_PERCENT,
}) {
  const size = Number(sizeValue);
  const speed = Number(speedValue);
  const efficiency = Number(efficiencyPercent);

  const sizeDef = SIZE_UNITS.find((u) => u.id === sizeUnit);
  const speedDef = SPEED_UNITS.find((u) => u.id === speedUnit);
  if (!sizeDef) return { error: "Choose a size unit." };
  if (!speedDef) return { error: "Choose a speed unit." };

  if (!Number.isFinite(size) || size < 0) {
    return { error: "Enter the data size as zero or a positive number." };
  }
  if (!Number.isFinite(speed) || speed <= 0) {
    return { error: "Link speed must be greater than zero." };
  }
  if (!Number.isFinite(efficiency) || efficiency <= 0 || efficiency > 100) {
    return { error: "Efficiency must be between 1 and 100 percent." };
  }

  const totalBits = size * sizeDef.bytes * BITS_PER_BYTE;
  const linkBitsPerSecond = speed * speedDef.bitsPerSecond;
  const effectiveBitsPerSecond = linkBitsPerSecond * (efficiency / 100);

  if (
    !Number.isFinite(totalBits) ||
    !Number.isFinite(linkBitsPerSecond) ||
    !Number.isFinite(effectiveBitsPerSecond)
  ) {
    return { error: "That data size is too large to compute. Try a smaller value or a bigger unit." };
  }

  const idealSeconds = totalBits / linkBitsPerSecond;
  const seconds = totalBits / effectiveBitsPerSecond;

  return {
    seconds,
    idealSeconds,
    overheadSeconds: seconds - idealSeconds,
    totalBits,
    totalBytes: size * sizeDef.bytes,
    linkBitsPerSecond,
    effectiveBitsPerSecond,
    effectiveMegabytesPerSecond: effectiveBitsPerSecond / BITS_PER_BYTE / 1e6,
    efficiencyPercent: efficiency,
  };
}
