/**
 * Data rate conversion.
 *
 * Everything is normalised to bits per second, then converted back out.
 *
 * Unit conventions:
 *  - Bit-rate prefixes are decimal by definition (IEC 60027-2 / SI): 1 kbps is
 *    exactly 1000 bit/s, 1 Mbps is 1,000,000 bit/s. Codecs, ISPs and delivery
 *    specs all use this convention.
 *  - Byte-rate prefixes are given in both flavours: decimal kB/MB/GB (1000^n)
 *    as used by macOS and cloud dashboards, and binary KiB/MiB/GiB (1024^n,
 *    IEC 80000-13) as used by Windows Explorer and most disk tools.
 *  - 1 byte = 8 bits, so 1 MB/s = 8 Mbps exactly.
 */

export const BITS_PER_BYTE = 8;

/** Every supported unit, expressed as bits per second. */
export const RATE_UNITS = [
  { id: "bps", name: "bit/s", short: "bit/s", bits: 1, group: "Bits" },
  { id: "kbps", name: "kbit/s (kbps)", short: "kbps", bits: 1e3, group: "Bits" },
  { id: "Mbps", name: "Mbit/s (Mbps)", short: "Mbps", bits: 1e6, group: "Bits" },
  { id: "Gbps", name: "Gbit/s (Gbps)", short: "Gbps", bits: 1e9, group: "Bits" },
  { id: "Bps", name: "byte/s", short: "B/s", bits: BITS_PER_BYTE, group: "Bytes (decimal)" },
  { id: "kBps", name: "kB/s (1000 bytes)", short: "kB/s", bits: 8e3, group: "Bytes (decimal)" },
  { id: "MBps", name: "MB/s (1000^2 bytes)", short: "MB/s", bits: 8e6, group: "Bytes (decimal)" },
  { id: "GBps", name: "GB/s (1000^3 bytes)", short: "GB/s", bits: 8e9, group: "Bytes (decimal)" },
  {
    id: "KiBps",
    name: "KiB/s (1024 bytes)",
    short: "KiB/s",
    bits: BITS_PER_BYTE * 1024,
    group: "Bytes (binary)",
  },
  {
    id: "MiBps",
    name: "MiB/s (1024^2 bytes)",
    short: "MiB/s",
    bits: BITS_PER_BYTE * 1024 ** 2,
    group: "Bytes (binary)",
  },
  {
    id: "GiBps",
    name: "GiB/s (1024^3 bytes)",
    short: "GiB/s",
    bits: BITS_PER_BYTE * 1024 ** 3,
    group: "Bytes (binary)",
  },
  {
    id: "MBpm",
    name: "MB per minute",
    short: "MB/min",
    bits: 8e6 / 60,
    group: "Per minute / hour",
  },
  {
    id: "GBph",
    name: "GB per hour",
    short: "GB/h",
    bits: 8e9 / 3600,
    group: "Per hour",
  },
  {
    id: "TBpd",
    name: "TB per day",
    short: "TB/day",
    bits: 8e12 / 86400,
    group: "Per day",
  },
];

/**
 * Reference bitrates from published specifications and encoder guidelines.
 * Each figure is a documented number, not an estimate.
 */
export const REFERENCE_RATES = [
  { id: "mp3-320", name: "MP3 at 320 kbps", mbps: 0.32, note: "Highest standard MPEG-1 Layer III rate." },
  {
    id: "cd",
    name: "Audio CD (PCM)",
    mbps: 1.4112,
    note: "44,100 Hz x 16 bit x 2 channels = 1,411,200 bit/s.",
  },
  {
    id: "yt-1080",
    name: "YouTube 1080p upload (SDR, 24-30 fps)",
    mbps: 8,
    note: "YouTube's recommended video bitrate for 1080p standard frame rate.",
  },
  {
    id: "yt-1440",
    name: "YouTube 1440p upload (SDR, 24-30 fps)",
    mbps: 16,
    note: "YouTube's recommended video bitrate for 1440p standard frame rate.",
  },
  {
    id: "yt-2160",
    name: "YouTube 2160p upload (SDR, 24-30 fps)",
    mbps: 40,
    note: "YouTube recommends 35-45 Mbps for 4K standard frame rate.",
  },
  {
    id: "dvd",
    name: "DVD-Video, maximum video rate",
    mbps: 9.8,
    note: "DVD-Video caps video at 9.8 Mbps and total multiplex at 10.08 Mbps.",
  },
  {
    id: "bluray",
    name: "Blu-ray, maximum video rate",
    mbps: 40,
    note: "BD-ROM allows up to 40 Mbps video within a 48 Mbps total stream.",
  },
  {
    id: "prores-422",
    name: "ProRes 422 at 1920x1080 29.97",
    mbps: 147,
    note: "Apple's published target data rate for ProRes 422 at 1080p29.97.",
  },
  {
    id: "prores-hq",
    name: "ProRes 422 HQ at 1920x1080 29.97",
    mbps: 220,
    note: "Apple's published target data rate for ProRes 422 HQ at 1080p29.97.",
  },
  {
    id: "dcp",
    name: "Digital cinema package (JPEG 2000)",
    mbps: 250,
    note: "DCI specification caps the image stream at 250 Mbps.",
  },
];

const unitById = (id) => RATE_UNITS.find((unit) => unit.id === id) || null;

/**
 * Convert one data rate into every supported unit.
 *
 * @param {number} value    the quantity entered
 * @param {string} fromUnit RATE_UNITS id
 * @returns {object} bitsPerSecond plus a conversion table, or { error }
 */
export function convertDataRate({ value, fromUnit = "Mbps" } = {}) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return { error: "Enter a number to convert." };

  const unit = unitById(fromUnit);
  if (!unit) return { error: "Choose a unit from the list." };
  if (amount <= 0) return { error: "The data rate must be greater than zero." };

  const bitsPerSecond = amount * unit.bits;
  if (!Number.isFinite(bitsPerSecond) || bitsPerSecond <= 0) {
    return { error: "That value is too large to convert." };
  }

  return {
    bitsPerSecond,
    bytesPerSecond: bitsPerSecond / BITS_PER_BYTE,
    unit,
    conversions: RATE_UNITS.map((target) => ({
      id: target.id,
      name: target.name,
      short: target.short,
      group: target.group,
      value: bitsPerSecond / target.bits,
    })),
  };
}

/**
 * How much storage a stream at this rate consumes over a given time.
 *
 * @param {number} bitsPerSecond
 * @param {number} seconds
 * @returns {object} bytes and human-friendly multiples, or { error }
 */
export function storageForDuration({ bitsPerSecond, seconds } = {}) {
  const rate = Number(bitsPerSecond);
  const time = Number(seconds);
  if (!Number.isFinite(rate) || !Number.isFinite(time)) {
    return { error: "Rate and duration must both be numbers." };
  }
  if (rate <= 0) return { error: "The data rate must be greater than zero." };
  if (time < 0) return { error: "Duration cannot be negative." };

  const bytes = (rate * time) / BITS_PER_BYTE;
  return {
    bytes,
    megabytes: bytes / 1e6,
    gigabytes: bytes / 1e9,
    gibibytes: bytes / 1024 ** 3,
    perMinuteMB: (rate * 60) / BITS_PER_BYTE / 1e6,
    perHourGB: (rate * 3600) / BITS_PER_BYTE / 1e9,
  };
}

/**
 * Work backwards: what bitrate fits a target file size into a target duration?
 *
 * @param {number} sizeMB   target size in decimal megabytes
 * @param {number} seconds  duration the file must cover
 * @returns {object} required bitrate, or { error }
 */
export function bitrateForTarget({ sizeMB, seconds } = {}) {
  const size = Number(sizeMB);
  const time = Number(seconds);
  if (!Number.isFinite(size) || !Number.isFinite(time)) {
    return { error: "Target size and duration must both be numbers." };
  }
  if (size <= 0) return { error: "Target size must be greater than zero." };
  if (time <= 0) return { error: "Duration must be greater than zero." };

  const bitsPerSecond = (size * 1e6 * BITS_PER_BYTE) / time;
  return {
    bitsPerSecond,
    kbps: bitsPerSecond / 1e3,
    mbps: bitsPerSecond / 1e6,
  };
}
