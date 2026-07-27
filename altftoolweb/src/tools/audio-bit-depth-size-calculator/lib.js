/**
 * Uncompressed linear PCM (WAV / AIFF / BWF) size maths.
 *
 *   bytes per second = sampleRate x bitDepth x channels / 8
 *   bitrate (bit/s)  = sampleRate x bitDepth x channels
 *   file size        = bytes per second x duration + container header
 *
 * These are exact for linear PCM because every sample frame occupies the same
 * number of bits — there is no entropy coding, so nothing depends on content.
 *
 * Pure module: no React, no DOM, no clock.
 */

/** A byte is 8 bits. */
export const BITS_PER_BYTE = 8;

/**
 * Canonical RIFF/WAVE PCM header: 12-byte RIFF chunk descriptor + 24-byte
 * "fmt " chunk + 8-byte "data" chunk header = 44 bytes before the samples.
 */
export const WAV_HEADER_BYTES = 44;

/**
 * RIFF stores chunk sizes in unsigned 32-bit fields, so a classic .wav cannot
 * exceed 4 GiB - 1 byte. Beyond that you need RF64 / BW64 or Sony Wave64.
 */
export const WAV_MAX_BYTES = 4294967295;

export const KIB = 1024;
export const MIB = 1024 * 1024;
export const GIB = 1024 * 1024 * 1024;

export const SAMPLE_RATE_PRESETS = [
  { label: "44.1 kHz — CD, most music", value: 44100 },
  { label: "48 kHz — video, broadcast", value: 48000 },
  { label: "88.2 kHz — 2× CD", value: 88200 },
  { label: "96 kHz — hi-res tracking", value: 96000 },
  { label: "176.4 kHz — 4× CD", value: 176400 },
  { label: "192 kHz — hi-res mastering", value: 192000 },
  { label: "32 kHz — legacy broadcast", value: 32000 },
  { label: "22.05 kHz — low-bandwidth speech", value: 22050 },
];

export const BIT_DEPTH_PRESETS = [
  { label: "8-bit integer", value: 8 },
  { label: "16-bit integer — CD standard", value: 16 },
  { label: "24-bit integer — studio standard", value: 24 },
  { label: "32-bit integer / float", value: 32 },
  { label: "64-bit float — DAW internal", value: 64 },
];

export const CHANNEL_PRESETS = [
  { label: "1 — mono", value: 1 },
  { label: "2 — stereo", value: 2 },
  { label: "6 — 5.1 surround", value: 6 },
  { label: "8 — 7.1 surround", value: 8 },
  { label: "12 — 7.1.4 Atmos bed", value: 12 },
];

/** Largest values we will accept, to keep results meaningful rather than absurd. */
export const MAX_SAMPLE_RATE = 3072000; // 32x 96 kHz; above any real converter
export const MAX_CHANNELS = 512;
export const MAX_DURATION_SECONDS = 100 * 60 * 60; // 100 hours

const isFiniteNumber = (value) => Number.isFinite(value);

/** Combine an h/m/s duration into plain seconds. */
export function toSeconds({ hours = 0, minutes = 0, seconds = 0 }) {
  const h = Number(hours);
  const m = Number(minutes);
  const s = Number(seconds);
  if (![h, m, s].every(isFiniteNumber)) return NaN;
  return h * 3600 + m * 60 + s;
}

/** Format a byte count with binary (KiB/MiB/GiB) units. */
export function formatBinaryBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes >= GIB) return `${(bytes / GIB).toFixed(2)} GiB`;
  if (bytes >= MIB) return `${(bytes / MIB).toFixed(2)} MiB`;
  if (bytes >= KIB) return `${(bytes / KIB).toFixed(2)} KiB`;
  return `${Math.round(bytes)} bytes`;
}

/** Format a byte count with decimal (kB/MB/GB) units, as disks are sold. */
export function formatDecimalBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(2)} kB`;
  return `${Math.round(bytes)} bytes`;
}

/** Seconds -> "1 h 02 m 03 s". */
export function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "—";
  const whole = Math.floor(totalSeconds);
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const s = whole % 60;
  if (h > 0) return `${h} h ${String(m).padStart(2, "0")} m ${String(s).padStart(2, "0")} s`;
  if (m > 0) return `${m} m ${String(s).padStart(2, "0")} s`;
  return `${totalSeconds.toFixed(totalSeconds < 10 ? 2 : 0)} s`;
}

/**
 * Size and bitrate of an uncompressed PCM recording.
 *
 * @returns {object} either { error } or the full breakdown.
 */
export function computeAudioSize({
  sampleRate,
  bitDepth,
  channels,
  durationSeconds,
  includeHeader = true,
}) {
  const rate = Number(sampleRate);
  const depth = Number(bitDepth);
  const ch = Number(channels);
  const dur = Number(durationSeconds);

  if (![rate, depth, ch, dur].every(isFiniteNumber)) {
    return { error: "Enter a number in every field." };
  }
  if (rate <= 0) return { error: "Sample rate must be greater than zero." };
  if (rate > MAX_SAMPLE_RATE) {
    return { error: `Sample rate above ${MAX_SAMPLE_RATE} Hz is beyond any real converter.` };
  }
  if (depth <= 0) return { error: "Bit depth must be greater than zero." };
  if (depth > 64) return { error: "Bit depth above 64 bits per sample is not used in audio." };
  if (ch <= 0) return { error: "There must be at least one channel." };
  if (ch > MAX_CHANNELS) return { error: `Channel count is capped at ${MAX_CHANNELS}.` };
  if (dur < 0) return { error: "Duration cannot be negative." };
  if (dur === 0) return { error: "Enter a duration longer than zero." };
  if (dur > MAX_DURATION_SECONDS) return { error: "Duration is capped at 100 hours." };

  const bitsPerFrame = depth * ch; // one sample frame = one sample per channel
  const bytesPerFrame = bitsPerFrame / BITS_PER_BYTE;
  const bitrateBps = rate * bitsPerFrame;
  const bytesPerSecond = bitrateBps / BITS_PER_BYTE;

  const dataBytes = bytesPerSecond * dur;
  const headerBytes = includeHeader ? WAV_HEADER_BYTES : 0;
  const totalBytes = dataBytes + headerBytes;

  const usableForData = WAV_MAX_BYTES - WAV_HEADER_BYTES;

  return {
    sampleRate: rate,
    bitDepth: depth,
    channels: ch,
    durationSeconds: dur,
    bitsPerFrame,
    bytesPerFrame,
    bitrateBps,
    bitrateKbps: bitrateBps / 1000,
    bitrateMbps: bitrateBps / 1e6,
    bytesPerSecond,
    bytesPerMinute: bytesPerSecond * 60,
    bytesPerHour: bytesPerSecond * 3600,
    totalFrames: rate * dur,
    dataBytes,
    headerBytes,
    totalBytes,
    exceedsWavLimit: totalBytes > WAV_MAX_BYTES,
    maxWavSeconds: usableForData / bytesPerSecond,
  };
}

/**
 * How much audio fits in a given amount of storage.
 * storageValue is interpreted in decimal GB (how drives are sold) by default.
 */
export function computeStorageFit({ bytesPerSecond, storageGb, decimalUnits = true }) {
  const bps = Number(bytesPerSecond);
  const gb = Number(storageGb);
  if (!isFiniteNumber(bps) || bps <= 0) return { error: "Bitrate is not available." };
  if (!isFiniteNumber(gb) || gb <= 0) return { error: "Storage size must be greater than zero." };
  const storageBytes = gb * (decimalUnits ? 1e9 : GIB);
  return { storageBytes, seconds: storageBytes / bps };
}
