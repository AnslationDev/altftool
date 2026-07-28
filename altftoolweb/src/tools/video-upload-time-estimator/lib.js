/**
 * Upload time estimation.
 *
 * Transfer time = file size in bits / effective throughput in bits per second.
 *
 * Two unit conventions collide here and both are kept explicit:
 *  - Network speeds are quoted by ISPs in decimal bits per second, so 1 Mbps is
 *    exactly 1,000,000 bits per second (IEC/SI decimal prefixes).
 *  - File sizes are shown by macOS, Android and most cloud UIs in decimal bytes
 *    (1 GB = 1,000,000,000 bytes) but by Windows Explorer in binary bytes
 *    (1 GiB = 1,073,741,824 bytes), which is 7.4% larger at the GB mark.
 */

/** A byte is 8 bits. */
export const BITS_PER_BYTE = 8;

/** File size units, in bytes. Binary units follow IEC 80000-13 (KiB/MiB/GiB). */
export const SIZE_UNITS = [
  { id: "MB", name: "MB (decimal, 1000^2)", bytes: 1e6 },
  { id: "GB", name: "GB (decimal, 1000^3)", bytes: 1e9 },
  { id: "TB", name: "TB (decimal, 1000^4)", bytes: 1e12 },
  { id: "MiB", name: "MiB (binary, 1024^2)", bytes: 1024 ** 2 },
  { id: "GiB", name: "GiB (binary, 1024^3)", bytes: 1024 ** 3 },
];

/** Link speed units, in bits per second. */
export const SPEED_UNITS = [
  { id: "kbps", name: "kbps", bitsPerSecond: 1e3 },
  { id: "Mbps", name: "Mbps", bitsPerSecond: 1e6 },
  { id: "Gbps", name: "Gbps", bitsPerSecond: 1e9 },
  { id: "MBps", name: "MB/s", bitsPerSecond: 8e6 },
];

/**
 * Typical UPLOAD speeds by connection type, in Mbps. These are representative
 * real-world figures, not guarantees — most consumer cable and DSL lines are
 * asymmetric, so upload is a fraction of the advertised download speed.
 */
export const CONNECTION_PRESETS = [
  { id: "4g", name: "Mobile 4G LTE", mbps: 8 },
  { id: "5g", name: "Mobile 5G (mid-band)", mbps: 25 },
  { id: "dsl", name: "VDSL / ADSL broadband", mbps: 10 },
  { id: "cable", name: "Cable broadband (asymmetric)", mbps: 20 },
  { id: "fibre100", name: "Fibre 100 Mbps plan", mbps: 40 },
  { id: "fibre-sym", name: "Symmetric fibre 300 Mbps", mbps: 300 },
  { id: "gigabit", name: "Gigabit fibre", mbps: 940 },
];

/**
 * Protocol overhead. A 1500-byte Ethernet MTU carrying TCP over IPv4 spends
 * 20 bytes on the IP header, 20 on the TCP header and typically 12 on TCP
 * timestamp options, i.e. about 3.5% of every packet. TLS records, HTTP
 * multipart boundaries, ACK traffic and retransmissions push the practical
 * figure to roughly 5-10% for a large upload.
 */
export const DEFAULT_OVERHEAD_PERCENT = 8;

/**
 * Link utilisation. Congestion control ramp-up, competing devices and Wi-Fi
 * contention mean a single upload rarely sustains the full line rate; 85-95%
 * is normal on a quiet wired link.
 */
export const DEFAULT_UTILISATION_PERCENT = 90;

export const MAX_OVERHEAD_PERCENT = 50;

const findUnit = (list, id) => list.find((item) => item.id === id) || null;

/**
 * Estimate upload time.
 *
 * @returns {object} seconds, effective throughput and byte/bit totals, or { error }
 */
export function estimateUploadTime({
  sizeValue,
  sizeUnit = "GB",
  speedValue,
  speedUnit = "Mbps",
  overheadPercent = DEFAULT_OVERHEAD_PERCENT,
  utilisationPercent = DEFAULT_UTILISATION_PERCENT,
} = {}) {
  const size = Number(sizeValue);
  const speed = Number(speedValue);
  const overhead = Number(overheadPercent);
  const utilisation = Number(utilisationPercent);

  if (![size, speed, overhead, utilisation].every((value) => Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }

  const sizeInfo = findUnit(SIZE_UNITS, sizeUnit);
  const speedInfo = findUnit(SPEED_UNITS, speedUnit);
  if (!sizeInfo) return { error: "Choose a file size unit from the list." };
  if (!speedInfo) return { error: "Choose a speed unit from the list." };

  if (size <= 0) return { error: "File size must be greater than zero." };
  if (speed <= 0) return { error: "Upload speed must be greater than zero." };
  if (overhead < 0 || overhead > MAX_OVERHEAD_PERCENT) {
    return { error: `Protocol overhead should be between 0% and ${MAX_OVERHEAD_PERCENT}%.` };
  }
  if (utilisation <= 0 || utilisation > 100) {
    return { error: "Link utilisation should be above 0% and at most 100%." };
  }

  const fileBytes = size * sizeInfo.bytes;
  const fileBits = fileBytes * BITS_PER_BYTE;
  const rawBitsPerSecond = speed * speedInfo.bitsPerSecond;
  const effectiveBitsPerSecond =
    (rawBitsPerSecond * (utilisation / 100)) / (1 + overhead / 100);

  if (!(effectiveBitsPerSecond > 0)) {
    return { error: "Those settings leave no usable bandwidth." };
  }

  const seconds = fileBits / effectiveBitsPerSecond;
  const theoreticalSeconds = fileBits / rawBitsPerSecond;

  return {
    fileBytes,
    fileBits,
    seconds,
    theoreticalSeconds,
    lostSeconds: seconds - theoreticalSeconds,
    rawMbps: rawBitsPerSecond / 1e6,
    effectiveMbps: effectiveBitsPerSecond / 1e6,
    effectiveMBps: effectiveBitsPerSecond / BITS_PER_BYTE / 1e6,
    filesPerHour: 3600 / seconds,
    efficiencyPercent: (theoreticalSeconds / seconds) * 100,
  };
}

/** Format a duration in seconds as a compact human string. Never returns NaN. */
export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  if (seconds < 1) return "under 1 second";
  const total = Math.round(seconds);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (secs && days === 0) parts.push(`${secs}s`);
  return parts.length ? parts.join(" ") : "0s";
}

/** Upload time in seconds for each preset connection, for the comparison table. */
export function comparePresets({ sizeValue, sizeUnit, overheadPercent, utilisationPercent } = {}) {
  return CONNECTION_PRESETS.map((preset) => {
    const result = estimateUploadTime({
      sizeValue,
      sizeUnit,
      speedValue: preset.mbps,
      speedUnit: "Mbps",
      overheadPercent,
      utilisationPercent,
    });
    return {
      id: preset.id,
      name: preset.name,
      mbps: preset.mbps,
      seconds: result.error ? null : result.seconds,
      error: result.error || null,
    };
  });
}
