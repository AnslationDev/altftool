/**
 * Influencer engagement rate maths.
 *
 * The three rates below are the standard definitions used by social analytics
 * platforms. All three take the SAME engagement total; only the denominator
 * changes, which is why they never agree with each other:
 *
 *   ER by followers   = engagements per post / followers        x 100
 *   ER by reach       = total engagements / total reach         x 100
 *   ER by impressions = total engagements / total impressions   x 100
 *
 * Reach counts unique accounts; impressions count every view, so impressions
 * are always >= reach and ER by impressions is always <= ER by reach.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/**
 * Creator tier boundaries by follower count. These are the common industry
 * convention used in influencer marketing rate cards, not a platform rule.
 */
export const CREATOR_TIERS = [
  { key: "sub", label: "Under 1K", min: 0, max: 1000 },
  { key: "nano", label: "Nano", min: 1000, max: 10000 },
  { key: "micro", label: "Micro", min: 10000, max: 100000 },
  { key: "mid", label: "Mid-tier", min: 100000, max: 500000 },
  { key: "macro", label: "Macro", min: 500000, max: 1000000 },
  { key: "mega", label: "Mega / celebrity", min: 1000000, max: Infinity },
];

/**
 * Rule-of-thumb quality bands for ER by followers on image and short-video
 * feeds. Treat them as orientation only — the honest benchmark is your own
 * account's trailing average, and rates fall as follower count rises.
 */
export const ER_QUALITY_BANDS = [
  { max: 1, label: "Low", note: "Below the level most brands look for." },
  { max: 3, label: "Solid", note: "Typical healthy range for an active account." },
  { max: 6, label: "Strong", note: "Well above average — a good pitch number." },
  { max: Infinity, label: "Exceptional", note: "Verify it is not driven by giveaways or bought engagement." },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Which tier a follower count sits in. */
export function classifyTier(followers) {
  if (!isNum(followers) || followers < 0) return null;
  return CREATOR_TIERS.find((tier) => followers >= tier.min && followers < tier.max) ?? null;
}

/** Which rule-of-thumb band an ER percentage sits in. */
export function classifyEngagement(ratePercent) {
  if (!isNum(ratePercent) || ratePercent < 0) return null;
  return ER_QUALITY_BANDS.find((band) => ratePercent < band.max) ?? null;
}

/**
 * @param {object} input totals measured across the SAME set of posts.
 *   followers    current follower count (denominator for ER by followers)
 *   posts        number of posts the totals cover (>= 1)
 *   likes/comments/shares/saves  totals across those posts
 *   reach        total reach across those posts (0 = not supplied)
 *   impressions  total impressions across those posts (0 = not supplied)
 */
export function computeEngagementRate({
  followers,
  posts,
  likes = 0,
  comments = 0,
  shares = 0,
  saves = 0,
  reach = 0,
  impressions = 0,
}) {
  const values = { followers, posts, likes, comments, shares, saves, reach, impressions };
  for (const [key, value] of Object.entries(values)) {
    if (!isNum(value)) return { error: `Enter a number for ${key}.` };
    if (value < 0) return { error: "Counts cannot be negative." };
  }
  if (followers < 1) return { error: "Follower count must be at least 1." };
  if (posts < 1) return { error: "Enter at least 1 post." };
  if (posts > 10000) return { error: "Keep the number of posts under 10,000." };
  if (reach > 0 && impressions > 0 && impressions < reach) {
    return { error: "Impressions cannot be lower than reach — every reached account counts at least one impression." };
  }

  const postCount = Math.round(posts);
  const engagements = likes + comments + shares + saves;
  const perPost = engagements / postCount;

  const erByFollowers = (perPost / followers) * 100;
  const erByReach = reach > 0 ? (engagements / reach) * 100 : null;
  const erByImpressions = impressions > 0 ? (engagements / impressions) * 100 : null;
  const reachRate = reach > 0 ? (reach / (followers * postCount)) * 100 : null;
  const frequency = reach > 0 && impressions > 0 ? impressions / reach : null;

  const commentRatio = engagements > 0 ? (comments / engagements) * 100 : 0;
  const saveRatio = engagements > 0 ? (saves / engagements) * 100 : 0;

  return {
    followers,
    posts: postCount,
    engagements,
    perPost,
    erByFollowers,
    erByReach,
    erByImpressions,
    reachRate,
    frequency,
    commentRatio,
    saveRatio,
    breakdown: { likes, comments, shares, saves },
    tier: classifyTier(followers),
    band: classifyEngagement(erByFollowers),
  };
}

/**
 * Engagements a post needs to hit a target ER by followers.
 * target engagements = followers x targetPercent / 100
 */
export function engagementsNeeded({ followers, targetPercent }) {
  if (!isNum(followers) || !isNum(targetPercent)) {
    return { error: "Enter a follower count and a target percentage." };
  }
  if (followers < 1) return { error: "Follower count must be at least 1." };
  if (targetPercent <= 0 || targetPercent > 100) {
    return { error: "Target engagement rate must be between 0% and 100%." };
  }
  return { needed: (followers * targetPercent) / 100, followers, targetPercent };
}
