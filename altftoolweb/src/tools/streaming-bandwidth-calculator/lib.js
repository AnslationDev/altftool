/**
 * Live streaming upload bandwidth.
 *
 *   stream bitrate      = video kbps + audio kbps
 *   on-the-wire bitrate = stream bitrate x (1 + overhead%)   [TCP/IP + RTMP headers
 *                                                             and retransmissions]
 *   recommended line    = on-the-wire bitrate x headroom     [spare capacity so
 *                                                             other traffic and
 *                                                             bitrate spikes do not
 *                                                             drop frames]
 *   data per hour       = on-the-wire bitrate x 3600 / 8     [kilobits -> bytes]
 *
 * All bitrates are kilobits per second (kbps), the unit encoders use.
 */

/** RTMP/SRT over TCP/IP: header and retransmission overhead, typically 3-5%. */
export const DEFAULT_OVERHEAD_PERCENT = 5;
/** Common advice: keep at least twice the stream bitrate in upload capacity. */
export const DEFAULT_HEADROOM = 2;
/** Decimal gigabyte, the unit ISPs use for data caps. */
export const BYTES_PER_GB = 1e9;

/**
 * Published live-streaming video bitrate ranges (kbps) for H.264 SDR.
 * Ranges follow YouTube Live's recommended settings; Twitch caps ingest lower
 * (about 6,000 kbps for most channels), which the tool notes separately.
 */
export const QUALITY_PRESETS = [
  { id: "360p30", label: "360p 30 fps", low: 400, typical: 700, high: 1000 },
  { id: "480p30", label: "480p 30 fps", low: 500, typical: 1200, high: 2000 },
  { id: "720p30", label: "720p 30 fps", low: 1500, typical: 3000, high: 4000 },
  { id: "720p60", label: "720p 60 fps", low: 2250, typical: 4500, high: 6000 },
  { id: "1080p30", label: "1080p 30 fps", low: 3000, typical: 4500, high: 6000 },
  { id: "1080p60", label: "1080p 60 fps", low: 4500, typical: 6000, high: 9000 },
  { id: "1440p30", label: "1440p 30 fps", low: 6000, typical: 9000, high: 13000 },
  { id: "1440p60", label: "1440p 60 fps", low: 9000, typical: 12000, high: 18000 },
  { id: "2160p30", label: "2160p (4K) 30 fps", low: 13000, typical: 20000, high: 34000 },
  { id: "2160p60", label: "2160p (4K) 60 fps", low: 20000, typical: 30000, high: 51000 },
];

/** Typical AAC live audio settings. */
export const AUDIO_PRESETS = [
  { id: "96", label: "96 kbps stereo (voice)", kbps: 96 },
  { id: "128", label: "128 kbps stereo (standard)", kbps: 128 },
  { id: "160", label: "160 kbps stereo (Twitch max)", kbps: 160 },
  { id: "256", label: "256 kbps stereo (music)", kbps: 256 },
  { id: "384", label: "384 kbps 5.1 surround", kbps: 384 },
];

/** Ingest ceiling most Twitch channels get; useful as a warning threshold. */
export const TWITCH_INGEST_LIMIT_KBPS = 6000;

export const QUALITY_LEVELS = [
  { id: "low", label: "Low end of range" },
  { id: "typical", label: "Typical" },
  { id: "high", label: "High end of range" },
];

const MAX_KBPS = 200000; // far above any consumer ingest limit

export function findQuality(id) {
  return QUALITY_PRESETS.find((item) => item.id === id) || null;
}

/**
 * @returns {{error:string}|{
 *  videoKbps:number, audioKbps:number, streamKbps:number,
 *  wireKbps:number, wireMbps:number,
 *  recommendedKbps:number, recommendedMbps:number,
 *  gbPerHour:number, gbForSession:number,
 *  status:"comfortable"|"tight"|"insufficient"|"unknown",
 *  statusText:string, uploadMbps:number|null,
 *  overThirdPartyLimit:boolean
 * }}
 */
export function computeStreamBandwidth({
  videoKbps = 6000,
  audioKbps = 128,
  overheadPercent = DEFAULT_OVERHEAD_PERCENT,
  headroom = DEFAULT_HEADROOM,
  uploadMbps = 0,
  hours = 2,
} = {}) {
  const values = [videoKbps, audioKbps, overheadPercent, headroom, uploadMbps, hours];
  if (values.some((value) => !Number.isFinite(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (!(videoKbps > 0)) return { error: "Video bitrate must be greater than zero." };
  if (videoKbps > MAX_KBPS) return { error: "That video bitrate is far beyond any ingest limit." };
  if (audioKbps < 0) return { error: "Audio bitrate cannot be negative." };
  if (overheadPercent < 0 || overheadPercent > 100) {
    return { error: "Protocol overhead should be between 0% and 100%." };
  }
  if (!(headroom >= 1)) return { error: "Headroom must be at least 1x the stream bitrate." };
  if (headroom > 10) return { error: "Headroom above 10x is not a realistic target." };
  if (uploadMbps < 0) return { error: "Upload speed cannot be negative." };
  if (hours < 0) return { error: "Stream length cannot be negative." };

  const streamKbps = videoKbps + audioKbps;
  const wireKbps = streamKbps * (1 + overheadPercent / 100);
  const recommendedKbps = wireKbps * headroom;
  const bytesPerSecond = (wireKbps * 1000) / 8;

  let status = "unknown";
  let statusText = "Enter your measured upload speed to see whether the line can carry this stream.";
  if (uploadMbps > 0) {
    const uploadKbps = uploadMbps * 1000;
    if (uploadKbps < wireKbps) {
      status = "insufficient";
      statusText = "Your upload speed is below the stream bitrate — expect dropped frames.";
    } else if (uploadKbps < recommendedKbps) {
      status = "tight";
      statusText = "The stream fits, but with little spare capacity for spikes or other devices.";
    } else {
      status = "comfortable";
      statusText = "Your upload speed covers the stream with the headroom you asked for.";
    }
  }

  return {
    videoKbps,
    audioKbps,
    streamKbps,
    wireKbps,
    wireMbps: wireKbps / 1000,
    recommendedKbps,
    recommendedMbps: recommendedKbps / 1000,
    gbPerHour: (bytesPerSecond * 3600) / BYTES_PER_GB,
    gbForSession: (bytesPerSecond * 3600 * hours) / BYTES_PER_GB,
    status,
    statusText,
    uploadMbps: uploadMbps > 0 ? uploadMbps : null,
    overThirdPartyLimit: videoKbps > TWITCH_INGEST_LIMIT_KBPS,
  };
}
