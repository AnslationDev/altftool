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
  if (s < 1) return `${(s * 1000).toFixed(0)} ms`;
  if (s < 60) return `${s.toFixed(1)} sec`;
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = Math.round(s % 60);
  const parts = [];
  if (days) parts.push(`${days} d`);
  if (hours) parts.push(`${hours} h`);
  if (minutes) parts.push(`${minutes} min`);
  if (seconds && !days) parts.push(`${seconds} sec`);
  return parts.length > 0 ? parts.join(" ") : "0 sec";
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
