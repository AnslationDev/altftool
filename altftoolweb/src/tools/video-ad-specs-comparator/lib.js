/**
 * Video ad placement specifications and asset checking.
 *
 * Each entry describes one PLACEMENT rather than one platform, because the
 * requirements for a vertical Reels ad and a square feed ad differ even though
 * both are bought through the same ad manager.
 *
 * The figures are the long-standing published limits for each placement. Ad
 * platforms revise their spec sheets without notice, so every result carries a
 * reminder to confirm against the live spec before a campaign goes out; the
 * `source` field names the document to check.
 */

/** Aspect ratios are floating point, so comparisons need a tolerance. */
export const ASPECT_TOLERANCE = 0.02;

/** Named aspect ratios used across placements. */
export const ASPECTS = {
  square: { label: "1:1", ratio: 1 },
  portrait45: { label: "4:5", ratio: 4 / 5 },
  vertical: { label: "9:16", ratio: 9 / 16 },
  landscape: { label: "16:9", ratio: 16 / 9 },
  portrait23: { label: "2:3", ratio: 2 / 3 },
};

/** Placements, with the limits each one enforces on upload. */
export const PLACEMENTS = [
  {
    id: "meta-feed",
    platform: "Meta",
    name: "Facebook & Instagram feed video",
    aspects: [ASPECTS.square, ASPECTS.portrait45, ASPECTS.landscape],
    recommended: { width: 1080, height: 1350 },
    minSeconds: 1,
    maxSeconds: 241 * 60,
    sweetSpotSeconds: [5, 15],
    maxFileSizeMB: 4096,
    formats: ["mp4", "mov"],
    minWidth: 600,
    source: "Meta Ads Guide, feed video placement",
    notes: [
      "4:5 fills the most feed space without being cropped.",
      "Design for sound off: burn in captions or supply an SRT.",
    ],
  },
  {
    id: "meta-reels",
    platform: "Meta",
    name: "Instagram & Facebook Reels ads",
    aspects: [ASPECTS.vertical],
    recommended: { width: 1080, height: 1920 },
    minSeconds: 1,
    maxSeconds: 90,
    sweetSpotSeconds: [5, 15],
    maxFileSizeMB: 4096,
    formats: ["mp4", "mov"],
    minWidth: 500,
    source: "Meta Ads Guide, Reels placement",
    notes: [
      "Keep text and logos clear of roughly the top 14% and bottom 20% of the frame.",
      "The UI overlays the lower third, so never put a call to action there.",
    ],
  },
  {
    id: "meta-stories",
    platform: "Meta",
    name: "Instagram & Facebook Stories ads",
    aspects: [ASPECTS.vertical],
    recommended: { width: 1080, height: 1920 },
    minSeconds: 1,
    maxSeconds: 60,
    sweetSpotSeconds: [5, 15],
    maxFileSizeMB: 4096,
    formats: ["mp4", "mov"],
    minWidth: 500,
    source: "Meta Ads Guide, Stories placement",
    notes: ["Stories segment long videos into cards, so front-load the message."],
  },
  {
    id: "youtube-skippable",
    platform: "YouTube",
    name: "Skippable in-stream ad",
    aspects: [ASPECTS.landscape, ASPECTS.square, ASPECTS.vertical],
    recommended: { width: 1920, height: 1080 },
    minSeconds: 12,
    maxSeconds: 180,
    sweetSpotSeconds: [15, 30],
    maxFileSizeMB: 256000,
    formats: ["mp4", "mov", "avi", "webm"],
    minWidth: 640,
    source: "Google Ads video ad requirements",
    notes: [
      "Viewers can skip after 5 seconds, so the hook has to land inside that window.",
      "The ad is uploaded to YouTube first, so YouTube's own upload limits apply.",
    ],
  },
  {
    id: "youtube-bumper",
    platform: "YouTube",
    name: "Bumper ad",
    aspects: [ASPECTS.landscape, ASPECTS.square, ASPECTS.vertical],
    recommended: { width: 1920, height: 1080 },
    minSeconds: 1,
    maxSeconds: 6,
    sweetSpotSeconds: [5, 6],
    maxFileSizeMB: 256000,
    formats: ["mp4", "mov", "avi", "webm"],
    minWidth: 640,
    source: "Google Ads bumper ad requirements",
    notes: ["Six seconds, unskippable — one idea only, and the brand must appear early."],
  },
  {
    id: "tiktok-feed",
    platform: "TikTok",
    name: "In-feed ad",
    aspects: [ASPECTS.vertical, ASPECTS.square, ASPECTS.landscape],
    recommended: { width: 1080, height: 1920 },
    minSeconds: 5,
    maxSeconds: 60,
    sweetSpotSeconds: [21, 34],
    maxFileSizeMB: 500,
    formats: ["mp4", "mov", "mpeg", "avi"],
    minWidth: 540,
    source: "TikTok Ads Manager video specifications",
    notes: [
      "TikTok's own guidance points at 21-34 seconds for in-feed performance.",
      "Native-looking, sound-on creative outperforms repurposed TV spots.",
    ],
  },
  {
    id: "linkedin-feed",
    platform: "LinkedIn",
    name: "Sponsored video",
    aspects: [ASPECTS.square, ASPECTS.landscape, ASPECTS.vertical],
    recommended: { width: 1920, height: 1080 },
    minSeconds: 3,
    maxSeconds: 30 * 60,
    sweetSpotSeconds: [15, 30],
    maxFileSizeMB: 200,
    formats: ["mp4"],
    minWidth: 360,
    source: "LinkedIn advertising video ad specifications",
    notes: [
      "The 200 MB ceiling is the tightest of the major platforms — expect to re-encode.",
      "Captions matter: most of the feed is watched muted at a desk.",
    ],
  },
  {
    id: "x-promoted",
    platform: "X (Twitter)",
    name: "Promoted video",
    aspects: [ASPECTS.square, ASPECTS.landscape, ASPECTS.vertical],
    recommended: { width: 1200, height: 1200 },
    minSeconds: 1,
    maxSeconds: 140,
    sweetSpotSeconds: [6, 15],
    maxFileSizeMB: 1024,
    formats: ["mp4", "mov"],
    minWidth: 640,
    source: "X Ads video specifications",
    notes: ["Platform guidance favours 15 seconds or less for promoted video."],
  },
  {
    id: "snap-single",
    platform: "Snapchat",
    name: "Single video ad",
    aspects: [ASPECTS.vertical],
    recommended: { width: 1080, height: 1920 },
    minSeconds: 3,
    maxSeconds: 180,
    sweetSpotSeconds: [3, 5],
    maxFileSizeMB: 1024,
    formats: ["mp4", "mov"],
    minWidth: 1080,
    source: "Snapchat Ads Manager creative specifications",
    notes: ["Snap recommends 3-5 seconds; the skip comes fast."],
  },
  {
    id: "pinterest-video",
    platform: "Pinterest",
    name: "Standard video Pin ad",
    aspects: [ASPECTS.square, ASPECTS.portrait23, ASPECTS.vertical, ASPECTS.landscape],
    recommended: { width: 1000, height: 1500 },
    minSeconds: 4,
    maxSeconds: 15 * 60,
    sweetSpotSeconds: [6, 15],
    maxFileSizeMB: 2048,
    formats: ["mp4", "mov", "m4v"],
    minWidth: 240,
    source: "Pinterest business video ad specs",
    notes: ["2:3 is Pinterest's native shape and the one the feed rewards."],
  },
];

export const CHECK_STATUS = { PASS: "pass", WARN: "warn", FAIL: "fail" };

/** Nearest named aspect ratio for a pixel size, plus the raw ratio. */
export function describeAspect(width, height) {
  const w = Number(width);
  const h = Number(height);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  const ratio = w / h;
  let best = null;
  Object.values(ASPECTS).forEach((aspect) => {
    const distance = Math.abs(aspect.ratio - ratio);
    if (!best || distance < best.distance) best = { ...aspect, distance };
  });
  return {
    ratio,
    nearest: best,
    exact: best ? best.distance <= ASPECT_TOLERANCE : false,
  };
}

/** Format a duration in seconds for spec copy. Never returns NaN. */
export function formatSeconds(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value < 0) return "—";
  if (value < 60) return `${Math.round(value * 10) / 10}s`;
  const minutes = Math.floor(value / 60);
  const rest = Math.round(value % 60);
  if (minutes < 60) return rest ? `${minutes}m ${rest}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

/**
 * Check one asset against one placement.
 *
 * @param {object} placement one entry from PLACEMENTS
 * @param {object} asset     { durationSeconds, width, height, fileSizeMB, format }
 */
export function checkPlacement(placement, asset) {
  const { durationSeconds, width, height, fileSizeMB, format } = asset;
  const checks = [];

  // Duration
  if (durationSeconds < placement.minSeconds) {
    checks.push({
      id: "duration",
      label: "Length",
      status: CHECK_STATUS.FAIL,
      detail: `Too short — minimum is ${formatSeconds(placement.minSeconds)}.`,
    });
  } else if (durationSeconds > placement.maxSeconds) {
    checks.push({
      id: "duration",
      label: "Length",
      status: CHECK_STATUS.FAIL,
      detail: `Too long — maximum is ${formatSeconds(placement.maxSeconds)}.`,
    });
  } else {
    const [low, high] = placement.sweetSpotSeconds;
    const inSweetSpot = durationSeconds >= low && durationSeconds <= high;
    checks.push({
      id: "duration",
      label: "Length",
      status: inSweetSpot ? CHECK_STATUS.PASS : CHECK_STATUS.WARN,
      detail: inSweetSpot
        ? `Inside the ${formatSeconds(low)}-${formatSeconds(high)} range this placement performs best in.`
        : `Accepted, but this placement favours ${formatSeconds(low)}-${formatSeconds(high)}.`,
    });
  }

  // Aspect ratio
  const ratio = width / height;
  const match = placement.aspects.find(
    (aspect) => Math.abs(aspect.ratio - ratio) <= ASPECT_TOLERANCE,
  );
  checks.push({
    id: "aspect",
    label: "Aspect ratio",
    status: match ? CHECK_STATUS.PASS : CHECK_STATUS.FAIL,
    detail: match
      ? `${match.label} is supported here.`
      : `Not a supported shape. This placement takes ${placement.aspects.map((a) => a.label).join(", ")}.`,
  });

  // Resolution
  checks.push({
    id: "resolution",
    label: "Resolution",
    status: width >= placement.minWidth ? CHECK_STATUS.PASS : CHECK_STATUS.FAIL,
    detail:
      width >= placement.minWidth
        ? `${width}x${height} clears the ${placement.minWidth}px minimum width.`
        : `${width}px wide is below the ${placement.minWidth}px minimum.`,
  });

  // File size
  checks.push({
    id: "filesize",
    label: "File size",
    status: fileSizeMB <= placement.maxFileSizeMB ? CHECK_STATUS.PASS : CHECK_STATUS.FAIL,
    detail:
      fileSizeMB <= placement.maxFileSizeMB
        ? `Under the ${placement.maxFileSizeMB} MB ceiling.`
        : `Over the ${placement.maxFileSizeMB} MB ceiling — re-encode at a lower bitrate.`,
  });

  // Container
  const normalisedFormat = String(format || "").toLowerCase().replace(/^\./, "");
  const formatOk = placement.formats.includes(normalisedFormat);
  checks.push({
    id: "format",
    label: "Container",
    status: formatOk ? CHECK_STATUS.PASS : CHECK_STATUS.FAIL,
    detail: formatOk
      ? `.${normalisedFormat} is accepted.`
      : `.${normalisedFormat || "unknown"} is not listed. Accepted: ${placement.formats.map((f) => `.${f}`).join(", ")}.`,
  });

  const failCount = checks.filter((check) => check.status === CHECK_STATUS.FAIL).length;
  const warnCount = checks.filter((check) => check.status === CHECK_STATUS.WARN).length;

  return {
    id: placement.id,
    platform: placement.platform,
    name: placement.name,
    source: placement.source,
    notes: placement.notes,
    recommended: placement.recommended,
    aspects: placement.aspects,
    minSeconds: placement.minSeconds,
    maxSeconds: placement.maxSeconds,
    maxFileSizeMB: placement.maxFileSizeMB,
    formats: placement.formats,
    checks,
    failCount,
    warnCount,
    accepted: failCount === 0,
  };
}

/**
 * Check one asset against a set of placements.
 *
 * @param {object} input
 * @param {number} input.durationSeconds
 * @param {number} input.width
 * @param {number} input.height
 * @param {number} input.fileSizeMB
 * @param {string} input.format
 * @param {string[]} input.placementIds
 * @returns {object} per-placement results, or { error }
 */
export function compareSpecs({
  durationSeconds,
  width,
  height,
  fileSizeMB,
  format = "mp4",
  placementIds,
} = {}) {
  const duration = Number(durationSeconds);
  const w = Number(width);
  const h = Number(height);
  const size = Number(fileSizeMB);

  if (![duration, w, h, size].every((value) => Number.isFinite(value))) {
    return { error: "Enter a number for length, width, height and file size." };
  }
  if (duration <= 0) return { error: "Video length must be greater than zero." };
  if (duration > 24 * 3600) return { error: "Video length should be 24 hours or less." };
  if (w <= 0 || h <= 0) return { error: "Width and height must be greater than zero." };
  if (w > 16384 || h > 16384) return { error: "Frame size should be 16384 pixels or less per side." };
  if (size <= 0) return { error: "File size must be greater than zero." };

  const selected = Array.isArray(placementIds) && placementIds.length > 0
    ? PLACEMENTS.filter((placement) => placementIds.includes(placement.id))
    : PLACEMENTS;

  if (selected.length === 0) return { error: "Select at least one placement to compare." };

  const asset = { durationSeconds: duration, width: w, height: h, fileSizeMB: size, format };
  const results = selected.map((placement) => checkPlacement(placement, asset));

  return {
    asset: { ...asset, aspect: describeAspect(w, h) },
    results,
    acceptedCount: results.filter((result) => result.accepted).length,
    totalCount: results.length,
  };
}
