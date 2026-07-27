/**
 * Streaming data usage.
 *
 * The whole tool rests on one identity:
 *     bytes = bitrate (bits per second) / 8 x seconds
 * so at a steady bitrate,
 *     GB per hour = kbps x 1000 x 3600 / 8 / 1_000_000_000 = kbps x 0.00045
 * i.e. 1 Mbps of streaming is 0.45 GB every hour.
 *
 * Data is reported in decimal gigabytes (1 GB = 1,000,000,000 bytes) because
 * that is the unit mobile networks meter and bill allowances in.
 *
 * A protocol-overhead percentage is applied on top of the media payload. Real
 * usage always exceeds the raw media bitrate: TCP/IP and TLS framing, HLS/DASH
 * manifests, thumbnails, telemetry and re-buffered segments all cost bytes.
 * A few percent is typical; the figure is editable because it varies by app.
 */

/** 1 kbps sustained for one hour, expressed in decimal GB. */
export const GB_PER_HOUR_PER_KBPS = (1000 * 3600) / 8 / 1_000_000_000; // = 0.00045

export const MIN_BITRATE_KBPS = 8;
export const MAX_BITRATE_KBPS = 200_000;
export const MAX_HOURS_PER_DAY = 24;
export const MAX_DAYS_PER_MONTH = 31;
export const MIN_CAP_GB = 0.1;
export const MAX_CAP_GB = 100_000;
export const MAX_OVERHEAD_PERCENT = 30;

/** Default allowance for protocol, manifest and telemetry traffic. */
export const DEFAULT_OVERHEAD_PERCENT = 5;

/**
 * Typical delivery bitrates. Streaming services use adaptive bitrate ladders, so
 * these are representative mid-ladder rungs rather than fixed guarantees — the
 * bitrate field stays editable for a service that publishes its own numbers.
 */
export const QUALITY_PRESETS = [
  { id: "audio-voice", group: "Audio", label: "Podcast / speech (Opus 64 kbps)", kbps: 64 },
  { id: "audio-normal", group: "Audio", label: "Music, normal quality (AAC 128 kbps)", kbps: 128 },
  { id: "audio-high", group: "Audio", label: "Music, high quality (AAC 256 kbps)", kbps: 256 },
  { id: "audio-lossless", group: "Audio", label: "CD-quality lossless (1,411 kbps)", kbps: 1411 },
  { id: "audio-hires", group: "Audio", label: "Hi-res 24-bit / 192 kHz (9,216 kbps)", kbps: 9216 },
  { id: "video-240", group: "Video", label: "240p data saver (~0.3 Mbps)", kbps: 300 },
  { id: "video-480", group: "Video", label: "480p standard definition (~1 Mbps)", kbps: 1000 },
  { id: "video-720", group: "Video", label: "720p HD (~3 Mbps)", kbps: 3000 },
  { id: "video-1080", group: "Video", label: "1080p full HD (~5 Mbps)", kbps: 5000 },
  { id: "video-1440", group: "Video", label: "1440p QHD (~9 Mbps)", kbps: 9000 },
  { id: "video-2160", group: "Video", label: "4K UHD (~16 Mbps)", kbps: 16000 },
  { id: "video-call", group: "Video", label: "Video call, HD (~2 Mbps)", kbps: 2000 },
];

const round = (value, places) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/** Decimal data units, as metered by mobile networks. */
export function formatData(gigabytes) {
  if (!Number.isFinite(gigabytes) || gigabytes < 0) return "—";
  if (gigabytes < 0.001) return `${round(gigabytes * 1_000_000, 1)} kB`;
  if (gigabytes < 1) return `${round(gigabytes * 1000, 1)} MB`;
  return `${round(gigabytes, 2)} GB`;
}

/** "8 h 53 min" from a decimal hour count. */
export function formatHours(hours) {
  if (!Number.isFinite(hours) || hours < 0) return "—";
  const whole = Math.floor(hours);
  const mins = Math.round((hours - whole) * 60);
  if (whole === 0) return `${mins} min`;
  if (mins === 0) return `${whole} h`;
  return `${whole} h ${mins} min`;
}

/**
 * @returns {{error: string} | object}
 */
export function computeStreamingUsage({
  bitrateKbps,
  hoursPerDay,
  daysPerMonth,
  dataCapGB,
  overheadPercent = DEFAULT_OVERHEAD_PERCENT,
} = {}) {
  const kbps = Number(bitrateKbps);
  const perDay = Number(hoursPerDay);
  const days = Number(daysPerMonth);
  const cap = Number(dataCapGB);
  const overhead = Number(overheadPercent);

  if (![kbps, perDay, days, cap, overhead].every((value) => Number.isFinite(value))) {
    return { error: "Every field needs a number." };
  }
  if (kbps < MIN_BITRATE_KBPS || kbps > MAX_BITRATE_KBPS) {
    return { error: `Bitrate must be between ${MIN_BITRATE_KBPS} and ${MAX_BITRATE_KBPS} kbps.` };
  }
  if (perDay < 0 || perDay > MAX_HOURS_PER_DAY) {
    return { error: `Hours per day must be between 0 and ${MAX_HOURS_PER_DAY}.` };
  }
  if (days < 1 || days > MAX_DAYS_PER_MONTH) {
    return { error: `Days per month must be between 1 and ${MAX_DAYS_PER_MONTH}.` };
  }
  if (cap < MIN_CAP_GB || cap > MAX_CAP_GB) {
    return { error: `Data allowance must be between ${MIN_CAP_GB} and ${MAX_CAP_GB} GB.` };
  }
  if (overhead < 0 || overhead > MAX_OVERHEAD_PERCENT) {
    return { error: `Overhead must be between 0% and ${MAX_OVERHEAD_PERCENT}%.` };
  }

  const overheadFactor = 1 + overhead / 100;
  const effectiveKbps = kbps * overheadFactor;

  const gbPerHour = effectiveKbps * GB_PER_HOUR_PER_KBPS;
  const gbPerMinute = gbPerHour / 60;
  const gbPerDay = gbPerHour * perDay;
  const gbPerMonth = gbPerDay * days;

  // Hours of viewing the allowance covers. gbPerHour is always > 0 here because
  // the bitrate floor is 8 kbps, so this division is safe.
  const hoursOnAllowance = cap / gbPerHour;
  const daysOnAllowance = perDay > 0 ? hoursOnAllowance / perDay : null;

  const capUsedPercent = round((gbPerMonth / cap) * 100, 1);
  const overAllowance = gbPerMonth > cap;
  const remainingGB = round(cap - gbPerMonth, 2);
  const overageGB = round(Math.max(0, gbPerMonth - cap), 2);
  const spareGB = round(Math.max(0, cap - gbPerMonth), 2);

  const summaryText = [
    "Streaming data usage",
    `Stream bitrate: ${kbps} kbps (+${overhead}% overhead = ${round(effectiveKbps, 0)} kbps effective)`,
    `Per hour: ${formatData(gbPerHour)} · per minute: ${formatData(gbPerMinute)}`,
    `${perDay} h/day for ${days} days: ${formatData(gbPerMonth)}`,
    `Allowance: ${cap} GB — that is ${formatHours(hoursOnAllowance)} of streaming`,
    overAllowance
      ? `Over allowance by ${formatData(gbPerMonth - cap)}.`
      : `Leaves ${formatData(Math.max(0, remainingGB))} spare.`,
  ].join("\n");

  return {
    kbps,
    mbps: round(kbps / 1000, 3),
    overheadPercent: overhead,
    effectiveKbps: round(effectiveKbps, 1),
    gbPerHour: round(gbPerHour, 4),
    mbPerHour: round(gbPerHour * 1000, 1),
    gbPerMinute: round(gbPerMinute, 5),
    mbPerMinute: round(gbPerMinute * 1000, 2),
    gbPerDay: round(gbPerDay, 3),
    gbPerMonth: round(gbPerMonth, 2),
    hoursOnAllowance: round(hoursOnAllowance, 2),
    daysOnAllowance: daysOnAllowance === null ? null : round(daysOnAllowance, 1),
    capGB: cap,
    capUsedPercent,
    overAllowance,
    remainingGB,
    overageGB,
    spareGB,
    hoursPerDay: perDay,
    daysPerMonth: days,
    summaryText,
  };
}

/** Per-hour usage for every preset, for the comparison table. */
export function comparePresets(overheadPercent = DEFAULT_OVERHEAD_PERCENT) {
  const overhead = Number(overheadPercent);
  const factor = Number.isFinite(overhead) && overhead >= 0 ? 1 + overhead / 100 : 1;
  return QUALITY_PRESETS.map((preset) => ({
    ...preset,
    gbPerHour: round(preset.kbps * factor * GB_PER_HOUR_PER_KBPS, 4),
  }));
}
