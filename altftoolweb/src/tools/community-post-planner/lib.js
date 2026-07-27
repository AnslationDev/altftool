/**
 * Community Post Planner — schedule maths.
 *
 * Nothing here touches React, the DOM or the clock: every date is passed in as
 * an argument so the same inputs always produce the same schedule.
 */

/** Milliseconds in one day (24 * 60 * 60 * 1000). */
export const MS_PER_DAY = 86400000;

/** Days in a week — used to turn "posts per week" into a horizon total. */
export const DAYS_PER_WEEK = 7;

/** Guard rails. A community tab cannot usefully be planned outside these. */
export const LIMITS = {
  minHorizonDays: 7,
  maxHorizonDays: 365,
  minPostsPerWeek: 0.5,
  maxPostsPerWeek: 21, // three a day is already the practical ceiling
  minUploadIntervalDays: 1,
  maxUploadIntervalDays: 90,
  maxPosts: 500, // keeps the rendered table sane
};

/**
 * Post formats a creator community tab supports.
 * `effortMinutes` are planning estimates for writing + assembling one post,
 * used only to total up the weekly time cost.
 */
export const POST_FORMATS = [
  {
    id: "poll",
    label: "Poll",
    weight: 3,
    effortMinutes: 5,
    prompts: [
      "Two thumbnail options — which one makes you click?",
      "Which topic should the next video cover?",
      "How long should the next deep-dive run?",
      "Pick the format for next week: tutorial, review or Q&A.",
    ],
  },
  {
    id: "image",
    label: "Image",
    weight: 3,
    effortMinutes: 10,
    prompts: [
      "Behind-the-scenes frame from the current edit.",
      "Desk / setup shot with one thing you changed this week.",
      "Screenshot of a result, chart or before-after.",
      "A single-panel meme about the topic you are covering.",
    ],
  },
  {
    id: "text",
    label: "Text update",
    weight: 2,
    effortMinutes: 8,
    prompts: [
      "Status note: what is filming, what is stuck, when it lands.",
      "One tip from the research that did not fit in the video.",
      "Short story about a mistake you made this week.",
      "Recap of the last upload plus one follow-up thought.",
    ],
  },
  {
    id: "question",
    label: "Open question",
    weight: 1,
    effortMinutes: 4,
    prompts: [
      "Ask the audience what they are struggling with right now.",
      "Ask for the worst advice they have been given on this topic.",
      "Ask which tool or product they want tested next.",
      "Ask for one thing they want changed about the channel.",
    ],
  },
  {
    id: "clip",
    label: "Clip or teaser",
    weight: 1,
    effortMinutes: 15,
    prompts: [
      "15-second teaser cut from the upcoming upload.",
      "Outtake or blooper that did not make the final edit.",
      "Timelapse of the build, edit or setup.",
      "Answer one comment on camera in under a minute.",
    ],
  },
];

export const DEFAULT_FORMAT_WEIGHTS = POST_FORMATS.reduce((acc, format) => {
  acc[format.id] = format.weight;
  return acc;
}, {});

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parse a "YYYY-MM-DD" string into a UTC timestamp.
 * Returns NaN when the string is not a real calendar date.
 */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return NaN;
  const [year, month, day] = value.split("-").map(Number);
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return NaN;
  }
  return stamp;
}

/** Add whole days to a UTC timestamp and return "YYYY-MM-DD". */
export function addDaysIso(stamp, days) {
  const next = new Date(stamp + days * MS_PER_DAY);
  const year = String(next.getUTCFullYear()).padStart(4, "0");
  const month = String(next.getUTCMonth() + 1).padStart(2, "0");
  const day = String(next.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Weekday name for a UTC timestamp offset by `days`. */
export function weekdayName(stamp, days) {
  return WEEKDAYS[new Date(stamp + days * MS_PER_DAY).getUTCDay()];
}

/**
 * Largest remainder (Hare quota) apportionment.
 * Splits `total` whole items across `weights` so the parts always sum to
 * exactly `total` — the same method used to apportion seats from vote shares.
 */
export function allocateByLargestRemainder(total, weights) {
  const keys = Object.keys(weights);
  const sum = keys.reduce((acc, key) => acc + Math.max(0, weights[key] || 0), 0);
  const result = {};
  keys.forEach((key) => {
    result[key] = 0;
  });
  if (!(total > 0) || !(sum > 0)) return result;

  const exact = keys.map((key) => {
    const share = (Math.max(0, weights[key] || 0) / sum) * total;
    return { key, floor: Math.floor(share), remainder: share - Math.floor(share) };
  });

  let assigned = 0;
  exact.forEach((item) => {
    result[item.key] = item.floor;
    assigned += item.floor;
  });

  const leftovers = exact
    .slice()
    .sort((a, b) => b.remainder - a.remainder || keys.indexOf(a.key) - keys.indexOf(b.key));

  let index = 0;
  while (assigned < total && leftovers.length > 0) {
    result[leftovers[index % leftovers.length].key] += 1;
    assigned += 1;
    index += 1;
  }
  return result;
}

/**
 * Order the allocated formats so the same format rarely lands twice in a row.
 * Greedy "most remaining first, never repeat the previous one" — deterministic.
 */
export function interleaveFormats(counts) {
  const pool = Object.keys(counts)
    .filter((key) => counts[key] > 0)
    .map((key) => ({ key, left: counts[key] }));
  const order = [];
  let previous = null;

  while (pool.some((item) => item.left > 0)) {
    const available = pool.filter((item) => item.left > 0);
    const notPrevious = available.filter((item) => item.key !== previous);
    const pick = (notPrevious.length > 0 ? notPrevious : available).reduce((best, item) =>
      item.left > best.left ? item : best,
    );
    pick.left -= 1;
    order.push(pick.key);
    previous = pick.key;
  }
  return order;
}

/** Largest gap between consecutive touchpoints, in days. */
export function longestSilentGap(dayOffsets, horizonDays) {
  const points = Array.from(new Set([0, ...dayOffsets, horizonDays])).sort((a, b) => a - b);
  let longest = 0;
  for (let i = 1; i < points.length; i += 1) {
    longest = Math.max(longest, points[i] - points[i - 1]);
  }
  return longest;
}

/**
 * Build a community-post schedule.
 *
 * @param {object} input
 * @param {string} input.startDate      "YYYY-MM-DD" — day 0 of the plan (also an upload day).
 * @param {number} input.horizonDays    how many days to plan.
 * @param {number} input.uploadIntervalDays days between main uploads.
 * @param {number} input.postsPerWeek   community posts to publish per week.
 * @param {object} [input.formatWeights] relative mix per format id.
 * @returns {object} schedule, or { error } when the input cannot be planned.
 */
export function planCommunityPosts({
  startDate,
  horizonDays,
  uploadIntervalDays,
  postsPerWeek,
  formatWeights = DEFAULT_FORMAT_WEIGHTS,
} = {}) {
  const start = parseIsoDate(startDate);
  if (!Number.isFinite(start)) {
    return { error: "Enter a valid start date in YYYY-MM-DD form." };
  }

  const horizon = Number(horizonDays);
  const interval = Number(uploadIntervalDays);
  const perWeek = Number(postsPerWeek);

  if (![horizon, interval, perWeek].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for the plan length, upload gap and posts per week." };
  }
  if (horizon < LIMITS.minHorizonDays || horizon > LIMITS.maxHorizonDays) {
    return {
      error: `Plan length must be between ${LIMITS.minHorizonDays} and ${LIMITS.maxHorizonDays} days.`,
    };
  }
  if (interval < LIMITS.minUploadIntervalDays || interval > LIMITS.maxUploadIntervalDays) {
    return {
      error: `Upload gap must be between ${LIMITS.minUploadIntervalDays} and ${LIMITS.maxUploadIntervalDays} days.`,
    };
  }
  if (perWeek < LIMITS.minPostsPerWeek || perWeek > LIMITS.maxPostsPerWeek) {
    return {
      error: `Posts per week must be between ${LIMITS.minPostsPerWeek} and ${LIMITS.maxPostsPerWeek}.`,
    };
  }

  const weightTotal = POST_FORMATS.reduce(
    (acc, format) => acc + Math.max(0, Number(formatWeights[format.id]) || 0),
    0,
  );
  if (!(weightTotal > 0)) {
    return { error: "Give at least one post format a share above zero." };
  }

  const wholeHorizon = Math.round(horizon);
  const wholeInterval = Math.round(interval);
  const totalPosts = Math.max(1, Math.round((perWeek * wholeHorizon) / DAYS_PER_WEEK));
  if (totalPosts > LIMITS.maxPosts) {
    return { error: `That plan needs ${totalPosts} posts — shorten the horizon or lower the cadence.` };
  }

  const uploadOffsets = [];
  for (let day = 0; day < wholeHorizon; day += wholeInterval) uploadOffsets.push(day);

  const cleanWeights = {};
  POST_FORMATS.forEach((format) => {
    cleanWeights[format.id] = Math.max(0, Number(formatWeights[format.id]) || 0);
  });
  const counts = allocateByLargestRemainder(totalPosts, cleanWeights);
  const order = interleaveFormats(counts);

  const usedPrompts = {};
  const posts = [];
  for (let i = 0; i < totalPosts; i += 1) {
    // Evenly spaced mid-points: keeps the first and last post off the edges.
    const offset = Math.min(
      wholeHorizon - 1,
      Math.max(0, Math.round(((i + 0.5) * wholeHorizon) / totalPosts)),
    );
    const formatId = order[i];
    const format = POST_FORMATS.find((item) => item.id === formatId);
    const seen = usedPrompts[formatId] || 0;
    usedPrompts[formatId] = seen + 1;

    const nextUpload = uploadOffsets.find((day) => day >= offset);
    const lastUpload = uploadOffsets.filter((day) => day <= offset).pop();
    const daysToNextUpload = nextUpload === undefined ? null : nextUpload - offset;
    const daysSinceUpload = lastUpload === undefined ? null : offset - lastUpload;

    let role = "Gap filler";
    if (daysToNextUpload !== null && daysToNextUpload <= 2) role = "Upload warm-up";
    else if (daysSinceUpload !== null && daysSinceUpload <= 1) role = "Upload follow-up";

    posts.push({
      index: i + 1,
      dayOffset: offset,
      date: addDaysIso(start, offset),
      weekday: weekdayName(start, offset),
      week: Math.floor(offset / DAYS_PER_WEEK) + 1,
      formatId,
      formatLabel: format.label,
      effortMinutes: format.effortMinutes,
      idea: format.prompts[seen % format.prompts.length],
      role,
      daysToNextUpload,
    });
  }

  const uploads = uploadOffsets.map((offset, index) => ({
    index: index + 1,
    dayOffset: offset,
    date: addDaysIso(start, offset),
    weekday: weekdayName(start, offset),
  }));

  const effortMinutes = posts.reduce((acc, post) => acc + post.effortMinutes, 0);
  const weeks = wholeHorizon / DAYS_PER_WEEK;
  const mix = POST_FORMATS.map((format) => ({
    id: format.id,
    label: format.label,
    count: counts[format.id] || 0,
    share: totalPosts > 0 ? ((counts[format.id] || 0) / totalPosts) * 100 : 0,
  }));

  const gapDays = longestSilentGap(
    posts.map((post) => post.dayOffset).concat(uploads.map((upload) => upload.dayOffset)),
    wholeHorizon,
  );

  return {
    startDate: addDaysIso(start, 0),
    endDate: addDaysIso(start, wholeHorizon - 1),
    horizonDays: wholeHorizon,
    totalPosts,
    totalUploads: uploads.length,
    postsPerWeek: totalPosts / weeks,
    touchpointsPerWeek: (totalPosts + uploads.length) / weeks,
    averageDaysBetweenPosts: totalPosts > 1 ? wholeHorizon / totalPosts : wholeHorizon,
    longestSilentGapDays: gapDays,
    effortMinutes,
    effortMinutesPerWeek: effortMinutes / weeks,
    mix,
    posts,
    uploads,
  };
}
