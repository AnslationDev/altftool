/**
 * Video engagement and retention maths.
 *
 * Every figure below is a ratio of numbers you already have in your own
 * analytics export. Nothing is estimated or modelled.
 *
 *   total engagements       = likes + comments + shares + saves
 *   engagement rate (views) = total engagements / views x 100
 *   engagement rate (reach) = total engagements / impressions x 100
 *   engagement rate (audience) = total engagements / followers x 100
 *   view-through rate       = views / impressions x 100
 *   average % viewed        = average view duration / video length x 100
 *   total watch time        = views x average view duration
 */

/** Comment volume is conventionally quoted per 1,000 views. */
export const COMMENTS_PER_BASE = 1000;

export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 3600;

/**
 * Conventional rule-of-thumb bands for engagement rate measured against views.
 * These are industry shorthand used in creator reporting, not figures published
 * by any platform — compare against your own channel history first.
 */
export const ENGAGEMENT_BANDS = [
  { max: 1, label: "Low", note: "Below the level most channels see on an average upload." },
  { max: 3, label: "Typical", note: "In line with a normal upload for an established channel." },
  { max: 6, label: "Strong", note: "Comfortably above a routine upload." },
  { max: 10, label: "Very strong", note: "The kind of ratio a hit video or a tight niche produces." },
  { max: Infinity, label: "Exceptional", note: "Check for a small view base or duplicated counts before celebrating." },
];

/**
 * Rule-of-thumb bands for average percentage viewed. Long videos naturally sit
 * lower than short ones, so read this alongside the video length.
 */
export const RETENTION_BANDS = [
  { max: 25, label: "Weak retention", note: "Most viewers leave in the first quarter — tighten the opening." },
  { max: 40, label: "Below average", note: "Common for long uploads; check the audience-retention graph for the drop." },
  { max: 60, label: "Healthy", note: "A solid hold for most formats." },
  { max: Infinity, label: "Excellent", note: "Viewers are staying past the halfway mark in numbers." },
];

const isNonNegative = (value) => Number.isFinite(value) && value >= 0;

function bandFor(bands, value) {
  for (const band of bands) {
    if (value <= band.max) return { label: band.label, note: band.note };
  }
  return { label: bands[bands.length - 1].label, note: bands[bands.length - 1].note };
}

/** Safe ratio: returns null instead of NaN or Infinity when the base is unusable. */
export function ratePercent(part, base) {
  if (!isNonNegative(part) || !Number.isFinite(base) || base <= 0) return null;
  return (part / base) * 100;
}

/** Seconds -> "1h 02m 03s" / "3m 42s" / "42s". */
export function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "—";
  const whole = Math.round(totalSeconds);
  const hours = Math.floor(whole / SECONDS_PER_HOUR);
  const minutes = Math.floor((whole % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = whole % SECONDS_PER_MINUTE;
  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
  }
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  return `${seconds}s`;
}

/**
 * @param {object} input all counts come straight from your analytics export
 * @param {number} input.views
 * @param {number} [input.impressions]   0 or blank = skip reach-based metrics
 * @param {number} [input.followers]     subscribers / followers at time of posting
 * @param {number} [input.likes]
 * @param {number} [input.comments]
 * @param {number} [input.shares]
 * @param {number} [input.saves]
 * @param {number} [input.videoLengthSeconds]
 * @param {number} [input.avgViewDurationSeconds]
 * @returns {object} metrics, or { error } when the input cannot produce a real answer
 */
export function computeVideoEngagement({
  views,
  impressions = 0,
  followers = 0,
  likes = 0,
  comments = 0,
  shares = 0,
  saves = 0,
  videoLengthSeconds = 0,
  avgViewDurationSeconds = 0,
} = {}) {
  const numbers = {
    views,
    impressions,
    followers,
    likes,
    comments,
    shares,
    saves,
    videoLengthSeconds,
    avgViewDurationSeconds,
  };
  for (const [key, value] of Object.entries(numbers)) {
    if (!Number.isFinite(Number(value))) {
      return { error: "Every field must be a number — clear any stray text first." };
    }
    if (Number(value) < 0) {
      return { error: `${key.replace(/([A-Z])/g, " $1").toLowerCase()} cannot be negative.` };
    }
  }

  const v = Number(views);
  if (!(v > 0)) {
    return { error: "Enter a view count above zero — every rate here is measured against views." };
  }

  const imp = Number(impressions);
  if (imp > 0 && imp < v) {
    return { error: "Impressions cannot be fewer than views — every view starts as an impression." };
  }

  const length = Number(videoLengthSeconds);
  const avd = Number(avgViewDurationSeconds);
  if (length > 0 && avd > length) {
    return { error: "Average view duration cannot exceed the video length." };
  }

  const totalEngagements = Number(likes) + Number(comments) + Number(shares) + Number(saves);

  const engagementByViews = ratePercent(totalEngagements, v);
  const engagementByImpressions = ratePercent(totalEngagements, imp);
  const engagementByFollowers = ratePercent(totalEngagements, Number(followers));
  const viewThroughRate = ratePercent(v, imp);
  const averagePercentageViewed = ratePercent(avd, length);
  const totalWatchSeconds = v * avd;

  return {
    totalEngagements,
    engagementByViews,
    engagementByImpressions,
    engagementByFollowers,
    viewThroughRate,
    averagePercentageViewed,
    likeRate: ratePercent(Number(likes), v),
    commentRate: ratePercent(Number(comments), v),
    shareRate: ratePercent(Number(shares), v),
    saveRate: ratePercent(Number(saves), v),
    commentsPerThousandViews: (Number(comments) / v) * COMMENTS_PER_BASE,
    totalWatchSeconds,
    totalWatchHours: totalWatchSeconds / SECONDS_PER_HOUR,
    totalWatchLabel: formatDuration(totalWatchSeconds),
    avgViewDurationLabel: formatDuration(avd),
    engagementBand: bandFor(ENGAGEMENT_BANDS, engagementByViews ?? 0),
    retentionBand:
      averagePercentageViewed === null ? null : bandFor(RETENTION_BANDS, averagePercentageViewed),
    views: v,
  };
}
