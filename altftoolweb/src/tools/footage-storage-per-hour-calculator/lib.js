/**
 * Footage storage planning.
 *
 * Core identity: storage = data rate x running time.
 *   bytes/second = total_megabits_per_second x 1e6 / 8
 * Card and drive capacities are quoted by manufacturers in decimal units,
 * so 1 GB = 1e9 bytes here. The binary figure an OS shows (GiB = 2^30 bytes)
 * is returned alongside it.
 */

/** Bits in one megabit. */
export const BITS_PER_MEGABIT = 1e6;
/** Manufacturer (decimal) gigabyte. */
export const BYTES_PER_GB = 1e9;
/** Binary gibibyte, what Finder/Explorer show. */
export const BYTES_PER_GIB = 1024 ** 3;
/** Seconds in an hour. */
export const SECONDS_PER_HOUR = 3600;

/**
 * Reference point used to convert the published "Mbps at 1920x1080" figure of
 * an intraframe codec into a bits-per-pixel constant so it can be scaled to any
 * resolution and frame rate. Apple publishes ProRes data rates at 1920x1080
 * 29.97p, which is 2,073,600 px x 29.97 = 62,145,792 pixels per second.
 */
export const PRORES_REFERENCE_PIXELS_PER_SECOND = 1920 * 1080 * 29.97;

const bppFromProRes = (mbpsAt1080p2997) =>
  (mbpsAt1080p2997 * BITS_PER_MEGABIT) / PRORES_REFERENCE_PIXELS_PER_SECOND;

/**
 * Uncompressed source depth used to turn Avid's published DNxHR compression
 * ratios into bits per pixel: 8-bit 4:2:2 carries 16 bits per pixel and
 * 12-bit 4:2:2 carries 24 bits per pixel; DNxHR 444 is 12-bit RGB at 36 bpp.
 */
const UNCOMPRESSED_BPP_8BIT_422 = 16;
const UNCOMPRESSED_BPP_12BIT_422 = 24;
const UNCOMPRESSED_BPP_12BIT_444 = 36;

/**
 * Codec catalogue.
 *  - kind "perPixel": data rate scales with resolution and frame rate.
 *  - kind "fixed":    the format defines a target bitrate regardless of
 *                     resolution (long-GOP camera recording modes).
 *  - kind "custom":   the user supplies the Mbps figure.
 */
export const CODECS = [
  {
    id: "prores-proxy",
    label: "Apple ProRes 422 Proxy",
    kind: "perPixel",
    // Apple: 45 Mbps at 1920x1080 29.97p
    bitsPerPixel: bppFromProRes(45),
    note: "Offline / edit proxy",
  },
  {
    id: "prores-lt",
    label: "Apple ProRes 422 LT",
    kind: "perPixel",
    // Apple: 102 Mbps at 1920x1080 29.97p
    bitsPerPixel: bppFromProRes(102),
    note: "Light mastering",
  },
  {
    id: "prores-422",
    label: "Apple ProRes 422",
    kind: "perPixel",
    // Apple: 147 Mbps at 1920x1080 29.97p
    bitsPerPixel: bppFromProRes(147),
    note: "Broadcast delivery",
  },
  {
    id: "prores-hq",
    label: "Apple ProRes 422 HQ",
    kind: "perPixel",
    // Apple: 220 Mbps at 1920x1080 29.97p
    bitsPerPixel: bppFromProRes(220),
    note: "Standard master",
  },
  {
    id: "prores-4444",
    label: "Apple ProRes 4444",
    kind: "perPixel",
    // Apple: 330 Mbps at 1920x1080 29.97p (video only, no alpha)
    bitsPerPixel: bppFromProRes(330),
    note: "VFX / alpha",
  },
  {
    id: "prores-4444-xq",
    label: "Apple ProRes 4444 XQ",
    kind: "perPixel",
    // Apple: 500 Mbps at 1920x1080 29.97p
    bitsPerPixel: bppFromProRes(500),
    note: "HDR finishing",
  },
  {
    id: "dnxhr-lb",
    label: "Avid DNxHR LB",
    kind: "perPixel",
    // Avid DNxHR spec: ~22:1 from 8-bit 4:2:2
    bitsPerPixel: UNCOMPRESSED_BPP_8BIT_422 / 22,
    note: "Offline proxy",
  },
  {
    id: "dnxhr-sq",
    label: "Avid DNxHR SQ",
    kind: "perPixel",
    // Avid DNxHR spec: ~7:1 from 8-bit 4:2:2
    bitsPerPixel: UNCOMPRESSED_BPP_8BIT_422 / 7,
    note: "Suitable for delivery",
  },
  {
    id: "dnxhr-hq",
    label: "Avid DNxHR HQ",
    kind: "perPixel",
    // Avid DNxHR spec: ~4.5:1 from 8-bit 4:2:2
    bitsPerPixel: UNCOMPRESSED_BPP_8BIT_422 / 4.5,
    note: "High quality 8-bit",
  },
  {
    id: "dnxhr-hqx",
    label: "Avid DNxHR HQX",
    kind: "perPixel",
    // Avid DNxHR spec: ~5.5:1 from 12-bit 4:2:2
    bitsPerPixel: UNCOMPRESSED_BPP_12BIT_422 / 5.5,
    note: "12-bit / HDR",
  },
  {
    id: "dnxhr-444",
    label: "Avid DNxHR 444",
    kind: "perPixel",
    // Avid DNxHR spec: ~4.5:1 from 12-bit RGB 4:4:4
    bitsPerPixel: UNCOMPRESSED_BPP_12BIT_444 / 4.5,
    note: "RGB finishing",
  },
  {
    id: "uncompressed-10bit-422",
    label: "Uncompressed 10-bit 4:2:2",
    kind: "perPixel",
    // 10-bit 4:2:2 carries 20 bits per pixel (Y + half-rate Cb/Cr)
    bitsPerPixel: 20,
    note: "No compression",
  },
  {
    id: "xavc-s-4k-100",
    label: "Sony XAVC S 4K 100 Mbps",
    kind: "fixed",
    mbps: 100,
    note: "Fixed camera mode",
  },
  {
    id: "xavc-s-hd-50",
    label: "Sony XAVC S HD 50 Mbps",
    kind: "fixed",
    mbps: 50,
    note: "Fixed camera mode",
  },
  {
    id: "h264-4k-100",
    label: "H.264 / H.265 4K 100 Mbps",
    kind: "fixed",
    mbps: 100,
    note: "Mirrorless 4K All-I",
  },
  {
    id: "h265-4k-50",
    label: "H.265 4K 50 Mbps (long-GOP)",
    kind: "fixed",
    mbps: 50,
    note: "Efficient capture",
  },
  {
    id: "avchd-24",
    label: "AVCHD 24 Mbps",
    kind: "fixed",
    mbps: 24,
    note: "Legacy HD",
  },
  {
    id: "h264-stream-8",
    label: "H.264 1080p delivery 8 Mbps",
    kind: "fixed",
    mbps: 8,
    note: "Web master",
  },
  {
    id: "custom",
    label: "Custom bitrate (Mbps)",
    kind: "custom",
    note: "Enter your own",
  },
];

/** Common shooting resolutions, width x height. */
export const RESOLUTION_PRESETS = [
  { id: "hd", label: "1920 x 1080 (HD)", width: 1920, height: 1080 },
  { id: "dci2k", label: "2048 x 1080 (DCI 2K)", width: 2048, height: 1080 },
  { id: "uhd", label: "3840 x 2160 (UHD 4K)", width: 3840, height: 2160 },
  { id: "dci4k", label: "4096 x 2160 (DCI 4K)", width: 4096, height: 2160 },
  { id: "6k", label: "6144 x 3456 (6K)", width: 6144, height: 3456 },
  { id: "uhd8k", label: "7680 x 4320 (UHD 8K)", width: 7680, height: 4320 },
];

/** Uncompressed PCM audio: channels x bit depth x sample rate bits per second. */
export function audioMbps({ channels, bitDepth, sampleRateHz }) {
  if (!(channels > 0) || !(bitDepth > 0) || !(sampleRateHz > 0)) return 0;
  return (channels * bitDepth * sampleRateHz) / BITS_PER_MEGABIT;
}

export function findCodec(codecId) {
  return CODECS.find((codec) => codec.id === codecId) || null;
}

const MAX_DIMENSION = 16384; // beyond any current acquisition format
const MAX_FPS = 1000; // high-speed capture upper sanity bound

/**
 * @returns {{error:string}|{
 *  videoMbps:number, audioMbps:number, totalMbps:number,
 *  bytesPerSecond:number, mbPerMinute:number,
 *  gbPerHour:number, gibPerHour:number,
 *  gbTotal:number, secondsTotal:number,
 *  minutesPerCard:number|null, cardsNeeded:number|null,
 *  codecLabel:string, megapixels:number
 * }}
 */
export function computeFootageStorage({
  codecId = "prores-hq",
  width = 1920,
  height = 1080,
  fps = 25,
  customMbps = 100,
  audioChannels = 2,
  audioBitDepth = 24,
  audioSampleRateHz = 48000,
  hours = 1,
  cardGb = 128,
} = {}) {
  const codec = findCodec(codecId);
  if (!codec) return { error: "Pick a codec from the list." };

  const numbers = [width, height, fps, hours, cardGb, customMbps];
  if (numbers.some((value) => !Number.isFinite(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (!(width > 0) || !(height > 0)) {
    return { error: "Frame width and height must be greater than zero." };
  }
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    return { error: `Frame size cannot exceed ${MAX_DIMENSION} pixels per side.` };
  }
  if (!(fps > 0)) return { error: "Frame rate must be greater than zero." };
  if (fps > MAX_FPS) return { error: `Frame rate above ${MAX_FPS} fps is out of range.` };
  if (hours < 0) return { error: "Recorded hours cannot be negative." };
  if (cardGb < 0) return { error: "Card or drive size cannot be negative." };

  let video;
  if (codec.kind === "custom") {
    if (!(customMbps > 0)) return { error: "Custom bitrate must be greater than zero." };
    video = customMbps;
  } else if (codec.kind === "fixed") {
    video = codec.mbps;
  } else {
    video = (codec.bitsPerPixel * width * height * fps) / BITS_PER_MEGABIT;
  }

  const audio = audioMbps({
    channels: audioChannels,
    bitDepth: audioBitDepth,
    sampleRateHz: audioSampleRateHz,
  });

  const totalMbps = video + audio;
  const bytesPerSecond = (totalMbps * BITS_PER_MEGABIT) / 8;
  const secondsTotal = hours * SECONDS_PER_HOUR;
  const bytesPerHour = bytesPerSecond * SECONDS_PER_HOUR;

  const cardBytes = cardGb * BYTES_PER_GB;
  const minutesPerCard = cardBytes > 0 && bytesPerSecond > 0 ? cardBytes / bytesPerSecond / 60 : null;
  const cardsNeeded =
    cardBytes > 0 ? Math.max(1, Math.ceil((bytesPerSecond * secondsTotal) / cardBytes)) : null;

  return {
    codecLabel: codec.label,
    megapixels: (width * height) / 1e6,
    videoMbps: video,
    audioMbps: audio,
    totalMbps,
    bytesPerSecond,
    mbPerMinute: (bytesPerSecond * 60) / 1e6,
    gbPerHour: bytesPerHour / BYTES_PER_GB,
    gibPerHour: bytesPerHour / BYTES_PER_GIB,
    gbTotal: (bytesPerSecond * secondsTotal) / BYTES_PER_GB,
    secondsTotal,
    minutesPerCard,
    cardsNeeded,
  };
}
