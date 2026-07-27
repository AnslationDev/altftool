/**
 * Content repurposing planning.
 *
 * Every output channel derives its asset count from either the source video
 * itself (one per video) or from the number of key moments you marked in it
 * (one asset per N moments, capped). Effort is asset count x a per-asset
 * minute estimate. The calendar spreads the finished assets across a cadence.
 *
 * All dates are taken as arguments — nothing here reads the clock.
 */

export const MIN_SOURCE_MINUTES = 1;
export const MAX_SOURCE_MINUTES = 600;

export const MIN_MOMENTS = 1;
export const MAX_MOMENTS = 40;

/** Below this many minutes of source per marked moment, the plan is optimistic. */
export const MINUTES_PER_MOMENT_FLOOR = 1.5;

export const MIN_CLIP_SECONDS = 10;
export const MAX_CLIP_SECONDS = 180;

export const MIN_PER_WEEK = 1;
export const MAX_PER_WEEK = 14;

/** Days in a publishing week, used to space the calendar. */
export const DAYS_PER_WEEK = 7;

/**
 * Output channels.
 *  perVideo    — a fixed number of assets per source video, or null
 *  perMoments  — one asset per this many key moments, or null
 *  cap         — hard ceiling on assets from one video
 *  effortMins  — planning estimate of hands-on production minutes per asset
 */
export const CHANNELS = [
  {
    id: "shorts",
    label: "Vertical clips (Shorts / Reels / TikTok)",
    perVideo: null,
    perMoments: 1,
    cap: 10,
    effortMins: 25,
    spec: "9:16, one moment per clip, hook in the first three seconds.",
  },
  {
    id: "carousel",
    label: "Carousel (Instagram / LinkedIn)",
    perVideo: null,
    perMoments: 3,
    cap: 4,
    effortMins: 45,
    spec: "4:5 portrait, 6-10 slides, one moment per slide group.",
  },
  {
    id: "quote",
    label: "Quote graphics",
    perVideo: null,
    perMoments: 2,
    cap: 6,
    effortMins: 12,
    spec: "1:1 square, one sentence pulled verbatim from the transcript.",
  },
  {
    id: "audiogram",
    label: "Audiograms",
    perVideo: null,
    perMoments: 4,
    cap: 3,
    effortMins: 20,
    spec: "Waveform over a still, burned-in captions, 45-90 seconds.",
  },
  {
    id: "pin",
    label: "Pinterest pins",
    perVideo: null,
    perMoments: 2,
    cap: 5,
    effortMins: 10,
    spec: "2:3 vertical, keyword-led title, link back to the full video.",
  },
  {
    id: "thread",
    label: "X thread",
    perVideo: 1,
    perMoments: null,
    cap: 1,
    effortMins: 30,
    spec: "One post per key moment, closing post links the full video.",
  },
  {
    id: "linkedin",
    label: "LinkedIn text post",
    perVideo: 1,
    perMoments: null,
    cap: 1,
    effortMins: 20,
    spec: "Lead with the single strongest moment; the rest is supporting detail.",
  },
  {
    id: "blog",
    label: "Blog article",
    perVideo: 1,
    perMoments: null,
    cap: 1,
    effortMins: 90,
    spec: "Edit the transcript into sections, one per key moment.",
  },
  {
    id: "newsletter",
    label: "Newsletter issue",
    perVideo: 1,
    perMoments: null,
    cap: 1,
    effortMins: 40,
    spec: "One takeaway up front, the video embedded below it.",
  },
];

export const DEFAULT_CHANNEL_IDS = ["shorts", "carousel", "quote", "thread", "newsletter"];

/** Assets one channel yields from a given number of key moments. */
export function assetsForChannel(channel, moments) {
  if (!channel) return 0;
  const count = Math.max(0, Math.trunc(Number(moments) || 0));
  if (channel.perVideo !== null) return Math.min(channel.perVideo, channel.cap);
  if (!channel.perMoments || count === 0) return 0;
  return Math.min(Math.ceil(count / channel.perMoments), channel.cap);
}

/** Add whole days to an ISO "YYYY-MM-DD" date. Pure: no clock access. */
export function addDays(isoDate, days) {
  const match = String(isoDate ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, y, m, d] = match;
  const base = Date.UTC(Number(y), Number(m) - 1, Number(d));
  if (!Number.isFinite(base)) return null;
  const shifted = new Date(base + Math.trunc(days) * 86400000);
  if (Number.isNaN(shifted.getTime())) return null;
  const pad = (value) => String(value).padStart(2, "0");
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
}

/**
 * Build the repurposing plan.
 * @param {object} input
 * @param {number} input.sourceMinutes  runtime of the source video
 * @param {number} input.moments        key moments marked in it
 * @param {number} input.clipSeconds    average length of a vertical clip
 * @param {string[]} input.channelIds   channels to produce for
 * @param {number} input.perWeek        assets published per week
 * @param {string} input.startDate      first publish date, "YYYY-MM-DD"
 * @param {number} [input.effortFactor] multiplier on the effort estimates
 */
export function buildRepurposingPlan(input = {}) {
  const {
    sourceMinutes,
    moments,
    clipSeconds,
    channelIds = DEFAULT_CHANNEL_IDS,
    perWeek,
    startDate,
    effortFactor = 1,
  } = input;

  const minutes = Number(sourceMinutes);
  const momentCount = Number(moments);
  const clip = Number(clipSeconds);
  const cadence = Number(perWeek);
  const factor = Number(effortFactor);

  if ([minutes, momentCount, clip, cadence, factor].some((value) => !Number.isFinite(value))) {
    return { error: "Enter valid numbers for runtime, key moments, clip length and cadence." };
  }
  if (minutes < MIN_SOURCE_MINUTES || minutes > MAX_SOURCE_MINUTES) {
    return {
      error: `Source runtime must be between ${MIN_SOURCE_MINUTES} and ${MAX_SOURCE_MINUTES} minutes.`,
    };
  }
  if (!Number.isInteger(momentCount) || momentCount < MIN_MOMENTS || momentCount > MAX_MOMENTS) {
    return {
      error: `Key moments must be a whole number between ${MIN_MOMENTS} and ${MAX_MOMENTS}.`,
    };
  }
  if (clip < MIN_CLIP_SECONDS || clip > MAX_CLIP_SECONDS) {
    return {
      error: `Average clip length must be between ${MIN_CLIP_SECONDS} and ${MAX_CLIP_SECONDS} seconds.`,
    };
  }
  if (!Number.isInteger(cadence) || cadence < MIN_PER_WEEK || cadence > MAX_PER_WEEK) {
    return {
      error: `Publishing cadence must be a whole number between ${MIN_PER_WEEK} and ${MAX_PER_WEEK} per week.`,
    };
  }
  if (factor <= 0 || factor > 5) {
    return { error: "Effort multiplier must be greater than 0 and at most 5." };
  }

  const selected = CHANNELS.filter((channel) => channelIds.includes(channel.id));
  if (selected.length === 0) {
    return { error: "Select at least one output channel." };
  }

  const firstDate = addDays(startDate, 0);
  if (!firstDate) {
    return { error: "Start date must be a real date in YYYY-MM-DD form." };
  }

  const rows = selected.map((channel) => {
    const count = assetsForChannel(channel, momentCount);
    const effortMinutes = count * channel.effortMins * factor;
    return {
      id: channel.id,
      label: channel.label,
      spec: channel.spec,
      rule:
        channel.perVideo !== null
          ? "1 per video"
          : `1 per ${channel.perMoments} moment${channel.perMoments === 1 ? "" : "s"} (max ${channel.cap})`,
      count,
      effortPerAsset: channel.effortMins * factor,
      effortMinutes,
    };
  });

  const totalAssets = rows.reduce((sum, row) => sum + row.count, 0);
  if (totalAssets === 0) {
    return { error: "That combination produces no assets. Mark more key moments or add a channel." };
  }

  const totalEffortMinutes = rows.reduce((sum, row) => sum + row.effortMinutes, 0);
  const sourceSeconds = minutes * 60;
  const clipCount = rows.find((row) => row.id === "shorts")?.count ?? 0;
  const clipSecondsTotal = clipCount * clip;

  // Space assets evenly inside each publishing week.
  const spacing = Math.max(1, Math.floor(DAYS_PER_WEEK / cadence));
  const schedule = [];
  let slot = 0;
  rows.forEach((row) => {
    for (let i = 0; i < row.count; i += 1) {
      const week = Math.floor(slot / cadence);
      const withinWeek = slot % cadence;
      const dayOffset = week * DAYS_PER_WEEK + withinWeek * spacing;
      schedule.push({
        key: `${row.id}-${i + 1}`,
        channel: row.label,
        title: row.count > 1 ? `${row.label} ${i + 1}` : row.label,
        date: addDays(firstDate, dayOffset),
        dayOffset,
        week: week + 1,
      });
      slot += 1;
    }
  });

  schedule.sort((a, b) => a.dayOffset - b.dayOffset);

  const weeks = Math.ceil(totalAssets / cadence);
  const lastDate = schedule.length > 0 ? schedule[schedule.length - 1].date : firstDate;

  const warnings = [];
  const minutesPerMoment = minutes / momentCount;
  if (minutesPerMoment < MINUTES_PER_MOMENT_FLOOR) {
    warnings.push(
      `${momentCount} moments in ${minutes} minutes is one every ${minutesPerMoment.toFixed(1)} minutes. Fewer, stronger moments usually cut better.`,
    );
  }
  if (clipSecondsTotal > sourceSeconds) {
    warnings.push(
      "The clips add up to more footage than the source video contains — shorten the average clip or cut fewer.",
    );
  }
  if (totalEffortMinutes / 60 > 20) {
    warnings.push(
      `${(totalEffortMinutes / 60).toFixed(1)} hours of production from one video is a lot. Drop a channel or reduce the moments.`,
    );
  }

  return {
    sourceMinutes: minutes,
    moments: momentCount,
    clipSeconds: clip,
    perWeek: cadence,
    effortFactor: factor,
    rows,
    totalAssets,
    totalEffortMinutes,
    totalEffortHours: totalEffortMinutes / 60,
    effortPerAsset: totalEffortMinutes / totalAssets,
    clipCount,
    clipSecondsTotal,
    sourceSeconds,
    sourceCoverage: sourceSeconds > 0 ? clipSecondsTotal / sourceSeconds : 0,
    minutesPerMoment,
    schedule,
    weeks,
    startDate: firstDate,
    lastDate,
    warnings,
  };
}
