/**
 * Audio file size and data rate.
 *
 * Uncompressed linear PCM (WAV, AIFF, BWF) is exactly:
 *     bytes per second = sample rate x (bit depth / 8) x channels
 *     file bytes       = bytes per second x seconds + container header
 * A canonical WAV header (RIFF + fmt + data chunks) is 44 bytes; broadcast WAV
 * adds a bext chunk, so real files are a few hundred bytes larger.
 *
 * Constant-bitrate compressed formats are simply:
 *     file bytes = kbps x 1000 / 8 x seconds
 * (kbps here is 1000 bits per second, the way codecs and streaming specs use it,
 * not 1024.)
 *
 * FLAC is lossless and therefore programme-dependent — it cannot be given an
 * exact size — so it is modelled as a share of the PCM size that you can adjust.
 */

/** Canonical RIFF/WAVE header: 12-byte RIFF + 24-byte fmt + 8-byte data chunk. */
export const WAV_HEADER_BYTES = 44;

/**
 * The RIFF size field is an unsigned 32-bit integer, so a plain WAV cannot
 * exceed 4,294,967,295 bytes. Longer recordings need RF64, Wave64 or CAF.
 */
export const WAV_MAX_BYTES = 4_294_967_295;

export const BIT_DEPTHS = [8, 16, 24, 32];

export const SAMPLE_RATES = [
  { hz: 22050, label: "22.05 kHz — speech / low-fi" },
  { hz: 32000, label: "32 kHz — broadcast radio" },
  { hz: 44100, label: "44.1 kHz — CD" },
  { hz: 48000, label: "48 kHz — video standard" },
  { hz: 88200, label: "88.2 kHz — 2x CD" },
  { hz: 96000, label: "96 kHz — high-resolution" },
  { hz: 192000, label: "192 kHz — archival / mastering" },
];

export const CHANNEL_PRESETS = [
  { count: 1, label: "Mono (1)" },
  { count: 2, label: "Stereo (2)" },
  { count: 6, label: "5.1 surround (6)" },
  { count: 8, label: "7.1 surround (8)" },
];

/** Common delivery codecs at their usual constant bitrates. */
export const CODEC_PRESETS = [
  { id: "mp3-320", label: "MP3 320 kbps", kbps: 320, note: "Highest-quality MP3 CBR." },
  { id: "mp3-192", label: "MP3 192 kbps", kbps: 192, note: "Common music download rate." },
  { id: "mp3-128", label: "MP3 128 kbps", kbps: 128, note: "Legacy default; audible artefacts on cymbals." },
  { id: "aac-256", label: "AAC 256 kbps", kbps: 256, note: "Typical premium streaming tier." },
  { id: "aac-128", label: "AAC 128 kbps", kbps: 128, note: "Roughly matches MP3 at 192 kbps." },
  { id: "opus-96", label: "Opus 96 kbps", kbps: 96, note: "Transparent for most stereo music." },
  { id: "opus-64", label: "Opus 64 kbps", kbps: 64, note: "Podcast and voice delivery." },
];

export const MIN_SAMPLE_RATE = 8000;
export const MAX_SAMPLE_RATE = 768000;
export const MAX_CHANNELS = 16;
export const MAX_TOTAL_SECONDS = 360000; // 100 hours

export const MIN_FLAC_RATIO = 0.2;
export const MAX_FLAC_RATIO = 1;

/** Typical FLAC output for 16-bit stereo music sits around 55–65% of PCM. */
export const DEFAULT_FLAC_RATIO = 0.6;

const round = (value, places) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/** Decimal (SI) byte units — the units drive makers and cloud storage bill in. */
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1000) return `${Math.round(bytes)} B`;
  if (bytes < 1_000_000) return `${round(bytes / 1000, 1)} kB`;
  if (bytes < 1_000_000_000) return `${round(bytes / 1_000_000, 2)} MB`;
  return `${round(bytes / 1_000_000_000, 2)} GB`;
}

/** "1:03:20" or "3:20". */
export function formatDuration(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * @returns {{error: string} | object}
 */
export function computeAudioSize({
  hours = 0,
  minutes = 0,
  seconds = 0,
  sampleRate,
  bitDepth,
  channels,
  flacRatio = DEFAULT_FLAC_RATIO,
} = {}) {
  const h = Number(hours);
  const m = Number(minutes);
  const s = Number(seconds);
  const rate = Number(sampleRate);
  const depth = Number(bitDepth);
  const chans = Number(channels);
  const ratio = Number(flacRatio);

  if (![h, m, s, rate, depth, chans, ratio].every((value) => Number.isFinite(value))) {
    return { error: "Every field needs a number." };
  }
  if (h < 0 || m < 0 || s < 0) {
    return { error: "Duration cannot be negative." };
  }

  const totalSeconds = h * 3600 + m * 60 + s;
  if (totalSeconds <= 0) {
    return { error: "Enter a duration longer than zero." };
  }
  if (totalSeconds > MAX_TOTAL_SECONDS) {
    return { error: "Duration is capped at 100 hours — split the recording into files." };
  }
  if (rate < MIN_SAMPLE_RATE || rate > MAX_SAMPLE_RATE) {
    return { error: `Sample rate must be between ${MIN_SAMPLE_RATE} and ${MAX_SAMPLE_RATE} Hz.` };
  }
  if (!BIT_DEPTHS.includes(depth)) {
    return { error: `Bit depth must be one of ${BIT_DEPTHS.join(", ")} bits.` };
  }
  if (!Number.isInteger(chans) || chans < 1 || chans > MAX_CHANNELS) {
    return { error: `Channel count must be a whole number from 1 to ${MAX_CHANNELS}.` };
  }
  if (ratio < MIN_FLAC_RATIO || ratio > MAX_FLAC_RATIO) {
    return { error: `FLAC ratio must be between ${MIN_FLAC_RATIO} and ${MAX_FLAC_RATIO} of the PCM size.` };
  }

  const bytesPerSecond = rate * (depth / 8) * chans;
  const bitsPerSecond = bytesPerSecond * 8;
  const audioBytes = bytesPerSecond * totalSeconds;
  const pcmBytes = audioBytes + WAV_HEADER_BYTES;

  const flacBytes = audioBytes * ratio;

  const codecs = CODEC_PRESETS.map((codec) => ({
    id: codec.id,
    label: codec.label,
    kbps: codec.kbps,
    note: codec.note,
    bytes: (codec.kbps * 1000 * totalSeconds) / 8,
  }));

  const formats = [
    {
      id: "pcm",
      label: `WAV / AIFF PCM ${depth}-bit ${round(rate / 1000, 2)} kHz`,
      bytes: pcmBytes,
      kbps: round(bitsPerSecond / 1000, 1),
      note: "Uncompressed. Exact size, no quality loss.",
    },
    {
      id: "flac",
      label: `FLAC (estimated at ${Math.round(ratio * 100)}% of PCM)`,
      bytes: flacBytes,
      kbps: round((bitsPerSecond * ratio) / 1000, 1),
      note: "Lossless but programme-dependent — dense mixes compress less than sparse ones.",
    },
    ...codecs.map((codec) => ({ ...codec, note: codec.note })),
  ];

  return {
    totalSeconds,
    durationLabel: formatDuration(totalSeconds),
    sampleRate: rate,
    bitDepth: depth,
    channels: chans,
    bytesPerSecond,
    bitsPerSecond,
    kbps: round(bitsPerSecond / 1000, 1),
    mbPerMinute: round((bytesPerSecond * 60) / 1_000_000, 2),
    mbPerHour: round((bytesPerSecond * 3600) / 1_000_000, 1),
    audioBytes,
    pcmBytes,
    pcmMB: round(pcmBytes / 1_000_000, 2),
    pcmMiB: round(pcmBytes / 1_048_576, 2),
    pcmGB: round(pcmBytes / 1_000_000_000, 3),
    pcmLabel: formatBytes(pcmBytes),
    flacBytes,
    flacRatio: ratio,
    exceedsWavLimit: pcmBytes > WAV_MAX_BYTES,
    formats,
  };
}
