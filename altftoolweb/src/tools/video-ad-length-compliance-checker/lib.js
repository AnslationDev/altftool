/**
 * Video Ad Length Compliance Checker.
 *
 * A duration is checked against each placement's hard limits (what the ad
 * platform will actually accept) and its published recommended band (what the
 * platform's own creative guidance suggests). Pure module — no React, no DOM.
 *
 * Limits change; every entry carries the publisher whose spec it comes from so
 * the figure can be re-checked. Treat them as a pre-flight check, not a
 * guarantee of acceptance.
 */

/** One minute in seconds — used to keep the long limits readable below. */
const MIN = 60;

export const PLACEMENTS = [
  {
    id: "yt-bumper",
    platform: "YouTube",
    name: "Bumper ad",
    minSec: 1,
    maxSec: 6,
    recMinSec: 5,
    recMaxSec: 6,
    note: "Hard 6-second cap, unskippable. A frame over and the asset is rejected.",
    source: "Google Ads video ad formats",
  },
  {
    id: "yt-nonskippable",
    platform: "YouTube",
    name: "Non-skippable in-stream",
    minSec: 6,
    maxSec: 15,
    recMinSec: 10,
    recMaxSec: 15,
    note: "15 seconds in most markets; some markets (including India) allow up to 20 seconds.",
    source: "Google Ads video ad formats",
  },
  {
    id: "yt-skippable",
    platform: "YouTube",
    name: "Skippable in-stream",
    minSec: 12,
    maxSec: 3 * MIN,
    recMinSec: 15,
    recMaxSec: 30,
    note: "Skippable after 5 seconds. No hard cap in practice, but Google advises staying under 3 minutes.",
    source: "Google Ads video ad formats",
  },
  {
    id: "yt-shorts",
    platform: "YouTube",
    name: "Shorts placement",
    minSec: 3,
    maxSec: 60,
    recMinSec: 10,
    recMaxSec: 30,
    note: "Shorts inventory is vertical and capped at the Shorts length itself.",
    source: "YouTube Shorts specification",
  },
  {
    id: "meta-feed",
    platform: "Meta",
    name: "Facebook / Instagram feed",
    minSec: 1,
    maxSec: 241 * MIN,
    recMinSec: 5,
    recMaxSec: 15,
    note: "Technically accepts up to 241 minutes; Meta's own guidance is to stay at 15 seconds or under in feed.",
    source: "Meta Ads Guide",
  },
  {
    id: "ig-reels",
    platform: "Instagram",
    name: "Reels ad",
    minSec: 1,
    maxSec: 90,
    recMinSec: 8,
    recMaxSec: 15,
    note: "Reels ads run to 90 seconds; the drop-off after 15 seconds is steep.",
    source: "Meta Ads Guide",
  },
  {
    id: "ig-stories",
    platform: "Instagram",
    name: "Stories ad",
    minSec: 1,
    maxSec: 60,
    recMinSec: 5,
    recMaxSec: 15,
    note: "Anything over 15 seconds is split into multiple story cards on playback.",
    source: "Meta Ads Guide",
  },
  {
    id: "tiktok-infeed",
    platform: "TikTok",
    name: "In-feed ad",
    minSec: 5,
    maxSec: 60,
    recMinSec: 9,
    recMaxSec: 15,
    note: "Hard floor of 5 seconds. TikTok's creative guidance points at 9-15 seconds.",
    source: "TikTok Ads Manager specifications",
  },
  {
    id: "linkedin-video",
    platform: "LinkedIn",
    name: "Video ad",
    minSec: 3,
    maxSec: 30 * MIN,
    recMinSec: 6,
    recMaxSec: 15,
    note: "Accepts 3 seconds to 30 minutes; LinkedIn advises under 15 seconds for brand awareness.",
    source: "LinkedIn Marketing Solutions ad specs",
  },
  {
    id: "x-promoted",
    platform: "X",
    name: "Promoted video",
    minSec: 0.5,
    maxSec: 140,
    recMinSec: 6,
    recMaxSec: 15,
    note: "Standard cap is 2 minutes 20 seconds; longer runs need an account-level exception.",
    source: "X Ads video specifications",
  },
  {
    id: "snap-single",
    platform: "Snapchat",
    name: "Single video ad",
    minSec: 3,
    maxSec: 180,
    recMinSec: 5,
    recMaxSec: 6,
    note: "Accepts 3-180 seconds, but Snap's guidance is 5-6 seconds for the top-line message.",
    source: "Snapchat Ads specifications",
  },
  {
    id: "pinterest-video",
    platform: "Pinterest",
    name: "Standard video Pin ad",
    minSec: 4,
    maxSec: 15 * MIN,
    recMinSec: 6,
    recMaxSec: 15,
    note: "4 seconds to 15 minutes accepted; 6-15 seconds recommended.",
    source: "Pinterest Business ad specs",
  },
  {
    id: "ctv-standard",
    platform: "Connected TV",
    name: "Standard CTV / OTT spot",
    minSec: 15,
    maxSec: 30,
    recMinSec: 15,
    recMaxSec: 30,
    note: "CTV inventory is sold in fixed 15 and 30 second slots; odd lengths are usually rejected.",
    source: "Common CTV/OTT trafficking standard",
  },
  {
    id: "broadcast-tv",
    platform: "Broadcast TV",
    name: "Traditional TV spot",
    minSec: 10,
    maxSec: 60,
    recMinSec: 20,
    recMaxSec: 30,
    note: "Bought in whole slots — 10, 15, 20, 30 or 60 seconds — with the copy cut to the exact slot.",
    source: "Standard broadcast trafficking slots",
  },
];

/** Whole slot lengths a broadcast or CTV buy is normally trafficked in. */
export const BROADCAST_SLOTS_SEC = [6, 10, 15, 20, 30, 45, 60, 90, 120];

/** Frame rates a cut is usually delivered at. */
export const COMMON_FRAME_RATES = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60];

export const STATUS = {
  fail: "fail",
  warn: "warn",
  pass: "pass",
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Accepts "15", "0:15", "1:30", "01:02:30" and decimal seconds like "14.5".
 * Returns seconds, or null when the string is not a duration.
 */
export function parseDurationToSeconds(input) {
  if (isNum(input)) return input >= 0 ? input : null;
  if (typeof input !== "string") return null;
  const text = input.trim();
  if (!text) return null;
  if (!/^\d{1,3}(:\d{1,2}){0,2}(\.\d+)?$/.test(text)) return null;
  const parts = text.split(":");
  if (parts.length > 3) return null;
  let seconds = 0;
  for (const part of parts) {
    const value = Number(part);
    if (!Number.isFinite(value) || value < 0) return null;
    seconds = seconds * 60 + value;
  }
  if (parts.length > 1) {
    // Minutes and seconds fields above 59 are almost always a typo.
    for (let i = 1; i < parts.length; i += 1) {
      if (Number(parts[i]) > 59) return null;
    }
  }
  return seconds;
}

/** 95 -> "1:35". Sub-minute durations stay as plain seconds. */
export function formatSeconds(seconds) {
  if (!isNum(seconds) || seconds < 0) return "—";
  const rounded = Math.round(seconds * 100) / 100;
  if (rounded < 60) return `${rounded}s`;
  const minutes = Math.floor(rounded / 60);
  const rest = Math.round((rounded % 60) * 100) / 100;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

/** Signed trim/extend figure for display, e.g. "+2.5s" or "-1s". */
export function formatDelta(seconds) {
  if (!isNum(seconds)) return "—";
  const rounded = Math.round(seconds * 100) / 100;
  if (rounded === 0) return "—";
  return `${rounded > 0 ? "+" : ""}${rounded}s`;
}

/** Frames to seconds at a given frame rate. */
export function secondsFromFrames(frames, fps) {
  if (!isNum(frames) || !isNum(fps)) return null;
  if (frames < 0 || !(fps > 0)) return null;
  return frames / fps;
}

/** Seconds to whole frames at a given frame rate, rounded to the nearest frame. */
export function framesFromSeconds(seconds, fps) {
  if (!isNum(seconds) || !isNum(fps)) return null;
  if (seconds < 0 || !(fps > 0)) return null;
  return Math.round(seconds * fps);
}

/** Closest standard slot length, and how far the cut is from it. */
export function nearestBroadcastSlot(seconds) {
  if (!isNum(seconds) || seconds < 0) return null;
  let best = BROADCAST_SLOTS_SEC[0];
  let bestGap = Math.abs(seconds - best);
  for (const slot of BROADCAST_SLOTS_SEC) {
    const gap = Math.abs(seconds - slot);
    if (gap < bestGap) {
      best = slot;
      bestGap = gap;
    }
  }
  return { slotSec: best, deltaSec: seconds - best };
}

function statusFor(seconds, placement) {
  if (seconds < placement.minSec) {
    return {
      status: STATUS.fail,
      reason: `Below the ${formatSeconds(placement.minSec)} minimum.`,
      adjustSec: placement.minSec - seconds,
    };
  }
  if (seconds > placement.maxSec) {
    return {
      status: STATUS.fail,
      reason: `Over the ${formatSeconds(placement.maxSec)} maximum.`,
      adjustSec: placement.maxSec - seconds,
    };
  }
  if (seconds > placement.recMaxSec) {
    return {
      status: STATUS.warn,
      reason: `Accepted, but longer than the recommended ${formatSeconds(placement.recMaxSec)}.`,
      adjustSec: placement.recMaxSec - seconds,
    };
  }
  if (seconds < placement.recMinSec) {
    return {
      status: STATUS.warn,
      reason: `Accepted, but shorter than the recommended ${formatSeconds(placement.recMinSec)}.`,
      adjustSec: placement.recMinSec - seconds,
    };
  }
  return { status: STATUS.pass, reason: "Inside both the hard limits and the recommended band.", adjustSec: 0 };
}

/**
 * Check one duration against a set of placements.
 * `selectedIds` is an array of placement ids.
 */
export function checkAdDuration({ seconds, selectedIds = [], fps = 25 } = {}) {
  if (!isNum(seconds)) return { error: "Enter the clip length as seconds or mm:ss." };
  if (seconds <= 0) return { error: "Clip length must be greater than zero." };
  if (seconds > 24 * 60 * MIN) return { error: "Clip length must be under 24 hours." };
  if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
    return { error: "Pick at least one placement to check against." };
  }

  const chosen = PLACEMENTS.filter((placement) => selectedIds.includes(placement.id));
  if (chosen.length === 0) return { error: "None of those placements are recognised." };

  const rows = chosen.map((placement) => ({ ...placement, ...statusFor(seconds, placement) }));

  const failCount = rows.filter((row) => row.status === STATUS.fail).length;
  const warnCount = rows.filter((row) => row.status === STATUS.warn).length;
  const passCount = rows.length - failCount - warnCount;
  const acceptedCount = rows.length - failCount;

  // The window in which a single master cut would clear every chosen placement.
  const hardMin = Math.max(...chosen.map((placement) => placement.minSec));
  const hardMax = Math.min(...chosen.map((placement) => placement.maxSec));
  const softMin = Math.max(...chosen.map((placement) => placement.recMinSec));
  const softMax = Math.min(...chosen.map((placement) => placement.recMaxSec));

  const singleCutPossible = hardMin <= hardMax;
  const sweetSpotPossible = singleCutPossible && softMin <= softMax && softMin >= hardMin && softMax <= hardMax;

  let verdict;
  if (failCount > 0) {
    verdict = {
      id: "fail",
      label: `${failCount} of ${rows.length} placements would reject this cut`,
    };
  } else if (warnCount > 0) {
    verdict = {
      id: "warn",
      label: `Accepted everywhere, outside the recommended band on ${warnCount}`,
    };
  } else {
    verdict = { id: "pass", label: `Clears all ${rows.length} placements` };
  }

  return {
    seconds,
    rows,
    passCount,
    warnCount,
    failCount,
    acceptedCount,
    verdict,
    hardMin,
    hardMax,
    softMin,
    softMax,
    singleCutPossible,
    sweetSpotPossible,
    frames: framesFromSeconds(seconds, fps),
    fps,
    nearestSlot: nearestBroadcastSlot(seconds),
  };
}
