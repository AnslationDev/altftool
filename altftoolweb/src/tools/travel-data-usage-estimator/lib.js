/**
 * Travel mobile-data estimator.
 *
 * Every figure below is a published or vendor-documented consumption rate for
 * the activity, expressed in megabytes. Data is counted in DECIMAL megabytes
 * (1 GB = 1000 MB) because that is how mobile operators and roaming packs are
 * sold, not in binary gibibytes.
 *
 * Total daily usage is a straight sum of each activity's rate multiplied by the
 * amount of that activity per day, plus a fixed background allowance, then
 * scaled by a protocol-overhead factor. Trip usage is daily usage x days.
 */

/** Operators sell data in decimal units: 1 GB = 1000 MB. */
export const MB_PER_GB = 1000;

/**
 * Turn-by-turn navigation streams vector tiles and traffic updates only.
 * Google Maps navigation measures at roughly 5 MB per hour of driving.
 */
export const MAPS_MB_PER_HOUR = 5;

/**
 * Video streaming rates per hour, as published by the streaming services for
 * each quality setting (Netflix quotes ~0.3 GB/h for its lowest setting,
 * ~0.7 GB/h for standard definition and ~7 GB/h for 4K; YouTube at 1080p
 * measures around 1.5-2 GB/h). The hd (720p) tier below is set at 1.2 GB/h,
 * an interpolated mid-point between the sd and fullhd rates rather than a
 * directly Netflix-quoted figure.
 */
export const VIDEO_QUALITY_MB_PER_HOUR = {
  saver: { label: "Data saver (240-360p)", rate: 300 },
  sd: { label: "SD (480p)", rate: 700 },
  hd: { label: "HD (720p)", rate: 1200 },
  fullhd: { label: "Full HD (1080p)", rate: 2000 },
  uhd: { label: "4K (2160p)", rate: 7000 },
};

/**
 * Music streaming bitrates converted to MB/hour: MB/h = kbps x 3600 / 8 / 1000.
 * 160 kbps (Spotify "High") = 72 MB/h; 320 kbps ("Very high") = 144 MB/h;
 * 96 kbps ("Normal") = 43 MB/h.
 */
export const AUDIO_QUALITY_MB_PER_HOUR = {
  normal: { label: "Normal (96 kbps)", rate: 43 },
  high: { label: "High (160 kbps)", rate: 72 },
  veryHigh: { label: "Very high (320 kbps)", rate: 144 },
};

/**
 * Scrolling an image and video feed (Instagram, TikTok, Reels) is effectively
 * low-bitrate video: measurements cluster around 100 MB per 10 minutes for
 * short-form video and far less for text feeds. 600 MB/hour is the mid-point
 * for a mixed feed with autoplay left on.
 */
export const SOCIAL_MB_PER_HOUR = 600;

/**
 * VoIP call rates per minute. WhatsApp voice measures near 0.5 MB/min;
 * WhatsApp / FaceTime video calls measure near 5 MB/min at default quality.
 */
export const VOICE_CALL_MB_PER_MINUTE = 0.5;
export const VIDEO_CALL_MB_PER_MINUTE = 5;

/**
 * Photo upload size. A 12 MP JPEG from a phone camera is about 3.5 MB; the
 * HEIF/HEIC format used by newer phones is roughly half that.
 */
export const PHOTO_FORMAT_MB = {
  heic: { label: "HEIC / HEIF", size: 2 },
  jpeg: { label: "JPEG", size: 3.5 },
  raw: { label: "RAW / ProRAW", size: 25 },
};

/**
 * Video capture sizes per minute as published by Apple for iPhone recording:
 * 1080p at 30 fps is about 60 MB/minute and 4K at 30 fps about 190 MB/minute.
 */
export const VIDEO_CAPTURE_MB_PER_MINUTE = {
  hd1080: { label: "1080p at 30 fps", size: 60 },
  uhd4k: { label: "4K at 30 fps", size: 190 },
};

/**
 * Background allowance: messaging, email, boarding passes, ride-hailing,
 * banking apps, OS telemetry and push notifications on a travel day.
 */
export const DEFAULT_BASELINE_MB_PER_DAY = 60;

/**
 * TCP/TLS headers, retries on weak roaming signal and app retries add real
 * billable bytes on top of payload. 10% is a conservative default.
 */
export const DEFAULT_OVERHEAD_PERCENT = 10;

/** Head-room added on top of the estimate when recommending a pack size. */
export const RECOMMENDED_BUFFER_PERCENT = 20;

/** Practical caps so a typo cannot produce a meaningless answer. */
export const MAX_DAYS = 365;
export const MAX_HOURS_PER_DAY = 24;
export const MAX_MINUTES_PER_DAY = 1440;
export const MAX_ITEMS_PER_DAY = 2000;

const round = (value, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const toNumber = (raw) => {
  if (raw === "" || raw === null || raw === undefined) return 0;
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/** Convert decimal megabytes to a readable "1.24 GB" / "480 MB" string. */
export function formatData(megabytes) {
  if (!Number.isFinite(megabytes) || megabytes < 0) return "—";
  if (megabytes >= MB_PER_GB) {
    return `${round(megabytes / MB_PER_GB, 2)} GB`;
  }
  return `${round(megabytes, megabytes < 10 ? 1 : 0)} MB`;
}

/**
 * Estimate the mobile data a trip will consume.
 *
 * @param {object} input
 * @param {number|string} input.days                  nights/days of the trip
 * @param {number|string} input.mapsHoursPerDay       hours of turn-by-turn navigation
 * @param {number|string} input.videoHoursPerDay      hours of video streaming
 * @param {string}        input.videoQuality          key of VIDEO_QUALITY_MB_PER_HOUR
 * @param {number|string} input.audioHoursPerDay      hours of music streaming
 * @param {string}        input.audioQuality          key of AUDIO_QUALITY_MB_PER_HOUR
 * @param {number|string} input.socialHoursPerDay     hours scrolling social feeds
 * @param {number|string} input.videoCallMinutesPerDay
 * @param {number|string} input.voiceCallMinutesPerDay
 * @param {number|string} input.photosPerDay          photos auto-backed-up per day
 * @param {string}        input.photoFormat           key of PHOTO_FORMAT_MB
 * @param {number|string} input.captureMinutesPerDay  minutes of video backed up per day
 * @param {string}        input.captureQuality        key of VIDEO_CAPTURE_MB_PER_MINUTE
 * @param {boolean}       input.backupOnWifiOnly      if true, photo/video backup uses no mobile data
 * @param {number|string} input.baselineMbPerDay      background app allowance
 * @param {number|string} input.overheadPercent       protocol/retry overhead
 * @returns {object} estimate, or { error } when the input cannot be used.
 */
export function estimateTripData(input = {}) {
  const {
    videoQuality = "sd",
    audioQuality = "high",
    photoFormat = "heic",
    captureQuality = "hd1080",
    backupOnWifiOnly = false,
  } = input;

  const numeric = {
    days: toNumber(input.days),
    mapsHoursPerDay: toNumber(input.mapsHoursPerDay),
    videoHoursPerDay: toNumber(input.videoHoursPerDay),
    audioHoursPerDay: toNumber(input.audioHoursPerDay),
    socialHoursPerDay: toNumber(input.socialHoursPerDay),
    videoCallMinutesPerDay: toNumber(input.videoCallMinutesPerDay),
    voiceCallMinutesPerDay: toNumber(input.voiceCallMinutesPerDay),
    photosPerDay: toNumber(input.photosPerDay),
    captureMinutesPerDay: toNumber(input.captureMinutesPerDay),
    baselineMbPerDay:
      input.baselineMbPerDay === undefined
        ? DEFAULT_BASELINE_MB_PER_DAY
        : toNumber(input.baselineMbPerDay),
    overheadPercent:
      input.overheadPercent === undefined
        ? DEFAULT_OVERHEAD_PERCENT
        : toNumber(input.overheadPercent),
  };

  if (Object.values(numeric).some((value) => Number.isNaN(value))) {
    return { error: "Every field must be a number." };
  }
  if (Object.values(numeric).some((value) => value < 0)) {
    return { error: "Values cannot be negative." };
  }
  if (!(numeric.days >= 1)) {
    return { error: "Trip length must be at least 1 day." };
  }
  if (numeric.days > MAX_DAYS) {
    return { error: `Trip length cannot exceed ${MAX_DAYS} days.` };
  }

  const hourFields = [
    numeric.mapsHoursPerDay,
    numeric.videoHoursPerDay,
    numeric.audioHoursPerDay,
    numeric.socialHoursPerDay,
  ];
  if (hourFields.some((value) => value > MAX_HOURS_PER_DAY)) {
    return { error: `No activity can exceed ${MAX_HOURS_PER_DAY} hours a day.` };
  }
  if (
    numeric.videoCallMinutesPerDay > MAX_MINUTES_PER_DAY ||
    numeric.voiceCallMinutesPerDay > MAX_MINUTES_PER_DAY ||
    numeric.captureMinutesPerDay > MAX_MINUTES_PER_DAY
  ) {
    return { error: `Minutes per day cannot exceed ${MAX_MINUTES_PER_DAY}.` };
  }
  if (numeric.photosPerDay > MAX_ITEMS_PER_DAY) {
    return { error: `Photos per day cannot exceed ${MAX_ITEMS_PER_DAY}.` };
  }
  if (numeric.overheadPercent > 100) {
    return { error: "Overhead cannot exceed 100%." };
  }

  // Each hour/minute field is capped individually above, but nothing stopped a
  // combined day (e.g. 8h maps + 10h video + 10h audio + 8h social = 36h) from
  // slipping through as a normal-looking estimate. This is a blunt sum-to-24
  // check: it treats every activity as if it used the phone exclusively, which
  // is conservative — some activities (e.g. audio streaming in the background
  // while using maps or scrolling social) can legitimately overlap in real
  // usage, so this will also flag some valid concurrent-usage inputs, not just
  // typos. That's the safer trade-off versus silently accepting physically
  // impossible days.
  const totalDayHours =
    numeric.mapsHoursPerDay +
    numeric.videoHoursPerDay +
    numeric.audioHoursPerDay +
    numeric.socialHoursPerDay +
    (numeric.videoCallMinutesPerDay + numeric.voiceCallMinutesPerDay + numeric.captureMinutesPerDay) / 60;
  if (totalDayHours > 24) {
    return { error: "Combined daily activity cannot exceed 24 hours. Reduce one or more activities." };
  }

  const video = VIDEO_QUALITY_MB_PER_HOUR[videoQuality];
  const audio = AUDIO_QUALITY_MB_PER_HOUR[audioQuality];
  const photo = PHOTO_FORMAT_MB[photoFormat];
  const capture = VIDEO_CAPTURE_MB_PER_MINUTE[captureQuality];
  if (!video || !audio || !photo || !capture) {
    return { error: "Unknown quality option selected." };
  }

  const backupFactor = backupOnWifiOnly ? 0 : 1;

  const lines = [
    {
      id: "maps",
      label: "Maps and navigation",
      detail: `${numeric.mapsHoursPerDay} h/day at ${MAPS_MB_PER_HOUR} MB/h`,
      perDayMb: numeric.mapsHoursPerDay * MAPS_MB_PER_HOUR,
    },
    {
      id: "video",
      label: "Video streaming",
      detail: `${numeric.videoHoursPerDay} h/day at ${video.label}`,
      perDayMb: numeric.videoHoursPerDay * video.rate,
    },
    {
      id: "audio",
      label: "Music and podcasts",
      detail: `${numeric.audioHoursPerDay} h/day at ${audio.label}`,
      perDayMb: numeric.audioHoursPerDay * audio.rate,
    },
    {
      id: "social",
      label: "Social feeds",
      detail: `${numeric.socialHoursPerDay} h/day at ${SOCIAL_MB_PER_HOUR} MB/h`,
      perDayMb: numeric.socialHoursPerDay * SOCIAL_MB_PER_HOUR,
    },
    {
      id: "videoCalls",
      label: "Video calls",
      detail: `${numeric.videoCallMinutesPerDay} min/day at ${VIDEO_CALL_MB_PER_MINUTE} MB/min`,
      perDayMb: numeric.videoCallMinutesPerDay * VIDEO_CALL_MB_PER_MINUTE,
    },
    {
      id: "voiceCalls",
      label: "Voice / VoIP calls",
      detail: `${numeric.voiceCallMinutesPerDay} min/day at ${VOICE_CALL_MB_PER_MINUTE} MB/min`,
      perDayMb: numeric.voiceCallMinutesPerDay * VOICE_CALL_MB_PER_MINUTE,
    },
    {
      id: "photoBackup",
      label: "Photo backup",
      detail: backupOnWifiOnly
        ? "Wi-Fi only — no mobile data"
        : `${numeric.photosPerDay} photos/day at ${photo.size} MB (${photo.label})`,
      perDayMb: backupFactor * numeric.photosPerDay * photo.size,
    },
    {
      id: "videoBackup",
      label: "Video backup",
      detail: backupOnWifiOnly
        ? "Wi-Fi only — no mobile data"
        : `${numeric.captureMinutesPerDay} min/day at ${capture.size} MB/min (${capture.label})`,
      perDayMb: backupFactor * numeric.captureMinutesPerDay * capture.size,
    },
    {
      id: "baseline",
      label: "Messaging, email and background apps",
      detail: `${numeric.baselineMbPerDay} MB/day allowance`,
      perDayMb: numeric.baselineMbPerDay,
    },
  ];

  const payloadPerDayMb = lines.reduce((sum, line) => sum + line.perDayMb, 0);
  const overheadMultiplier = 1 + numeric.overheadPercent / 100;
  const perDayMb = payloadPerDayMb * overheadMultiplier;
  const tripMb = perDayMb * numeric.days;
  const overheadMbPerDay = perDayMb - payloadPerDayMb;

  const recommendedGb =
    tripMb <= 0
      ? 0
      : Math.max(
          1,
          Math.ceil((tripMb * (1 + RECOMMENDED_BUFFER_PERCENT / 100)) / MB_PER_GB),
        );

  const breakdown = lines
    .map((line) => ({
      ...line,
      perDayMb: round(line.perDayMb, 2),
      tripMb: round(line.perDayMb * numeric.days, 2),
      sharePercent:
        payloadPerDayMb > 0 ? round((line.perDayMb / payloadPerDayMb) * 100, 1) : 0,
    }))
    .sort((a, b) => b.perDayMb - a.perDayMb);

  // "Biggest driver" is picked from actual usage activities only, before the
  // overhead row (below) is appended — overhead is a protocol tax on top of
  // usage, not an activity someone can reduce like the others.
  const biggest = breakdown.find((line) => line.perDayMb > 0) || null;

  // The breakdown table (and the copied text summary, which reuses this same
  // array) previously listed payload-only rows that never summed to the
  // headline "Per day" / "Whole trip" figures above, which already include
  // overhead — a visible gap that undermined the tool's "rates you can check"
  // claim. Appending overhead as its own row makes the two totals reconcile.
  // Its sharePercent is numeric.overheadPercent itself (not payload-relative
  // like the other rows) because overhead is defined as exactly that percent
  // of the payload total by construction, so this is exact, not estimated.
  const roundedOverheadPerDayMb = round(overheadMbPerDay, 2);
  const breakdownWithOverhead =
    roundedOverheadPerDayMb > 0
      ? [
          ...breakdown,
          {
            id: "overhead",
            label: "Network overhead",
            detail: `${numeric.overheadPercent}% protocol/retry overhead added on top of the payload rows above`,
            perDayMb: roundedOverheadPerDayMb,
            tripMb: round(overheadMbPerDay * numeric.days, 2),
            sharePercent: numeric.overheadPercent,
          },
        ]
      : breakdown;

  return {
    days: numeric.days,
    perDayMb: round(perDayMb, 2),
    perDayGb: round(perDayMb / MB_PER_GB, 3),
    tripMb: round(tripMb, 2),
    tripGb: round(tripMb / MB_PER_GB, 3),
    payloadPerDayMb: round(payloadPerDayMb, 2),
    overheadMbPerDay: roundedOverheadPerDayMb,
    overheadPercent: numeric.overheadPercent,
    recommendedGb,
    bufferPercent: RECOMMENDED_BUFFER_PERCENT,
    breakdown: breakdownWithOverhead,
    biggestDriverId: biggest ? biggest.id : null,
    biggestDriverLabel: biggest ? biggest.label : null,
  };
}
