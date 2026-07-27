/**
 * YouTube RPM earnings maths.
 *
 * Definitions used here are YouTube's own (YouTube Analytics "Revenue" tab):
 *  - RPM  = total revenue the CREATOR keeps, per 1,000 TOTAL views, across every
 *           revenue stream (ads, Premium, memberships, Super Thanks). It is a
 *           post-revenue-share figure, so revenue = views / 1000 x RPM exactly.
 *  - CPM  = what ADVERTISERS pay per 1,000 ad impressions. It is gross and it is
 *           measured over monetized playbacks only, not over total views.
 *
 * No React, no DOM, no clock reads. Pure functions only.
 */

/** RPM and CPM are both quoted "per mille" — per 1,000. */
export const VIEWS_PER_MILLE = 1000;

/**
 * YouTube Partner Program revenue split for watch-page (long-form) ads:
 * the creator keeps 55% of the gross ad revenue, YouTube keeps 45%.
 */
export const YT_LONG_FORM_CREATOR_SHARE = 0.55;

/**
 * Shorts monetization pays from the Shorts Creator Pool, from which the
 * creator is allocated 45% after music licensing costs are taken out.
 */
export const YT_SHORTS_CREATOR_SHARE = 0.45;

/** Sanity ceilings so absurd input returns a message instead of a silly number. */
export const MAX_MONTHLY_VIEWS = 1e11;
export const MAX_RPM = 100000;
export const MAX_MONTHS = 120;

const MONTHS_PER_YEAR = 12;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Revenue for a channel from monthly views and RPM.
 * revenue per month = monthlyViews / 1000 x rpm
 */
export function estimateEarnings({ monthlyViews, rpm, months = 1 }) {
  if (!isNum(monthlyViews) || !isNum(rpm) || !isNum(months)) {
    return { error: "Enter numbers for monthly views, RPM and the number of months." };
  }
  if (monthlyViews < 0) return { error: "Monthly views cannot be negative." };
  if (rpm < 0) return { error: "RPM cannot be negative." };
  if (monthlyViews > MAX_MONTHLY_VIEWS) {
    return { error: "Monthly views look unrealistic — keep them under 100 billion." };
  }
  if (rpm > MAX_RPM) return { error: "RPM looks unrealistic — keep it under 100,000." };
  if (months < 1 || months > MAX_MONTHS) {
    return { error: "Choose a period between 1 and 120 months." };
  }

  const wholeMonths = Math.round(months);
  const monthly = (monthlyViews / VIEWS_PER_MILLE) * rpm;
  const perThousandViews = rpm;
  const perView = monthlyViews > 0 ? monthly / monthlyViews : rpm / VIEWS_PER_MILLE;

  return {
    monthlyViews,
    rpm,
    months: wholeMonths,
    monthly,
    period: monthly * wholeMonths,
    annual: monthly * MONTHS_PER_YEAR,
    periodViews: monthlyViews * wholeMonths,
    perThousandViews,
    perView,
  };
}

/**
 * Convert an advertiser-side CPM into the creator-side RPM it implies.
 *
 *   revenue per monetized playback = cpm / 1000 x creatorShare
 *   RPM = revenue / total views x 1000
 *       = cpm x (monetizedPlaybackRate / 100) x creatorShare
 *
 * monetizedPlaybackRate is the share of views that actually served an ad; on most
 * channels it is well under 100% because not every view is ad-eligible.
 */
export function cpmToRpm({ cpm, monetizedPlaybackRate, creatorShare = YT_LONG_FORM_CREATOR_SHARE }) {
  if (!isNum(cpm) || !isNum(monetizedPlaybackRate) || !isNum(creatorShare)) {
    return { error: "Enter numbers for CPM, monetized playback rate and revenue share." };
  }
  if (cpm < 0) return { error: "CPM cannot be negative." };
  if (monetizedPlaybackRate < 0 || monetizedPlaybackRate > 100) {
    return { error: "Monetized playback rate must be between 0% and 100%." };
  }
  if (creatorShare <= 0 || creatorShare > 1) {
    return { error: "Creator revenue share must be between 0 and 1." };
  }

  const rpm = cpm * (monetizedPlaybackRate / 100) * creatorShare;
  return {
    rpm,
    cpm,
    monetizedPlaybackRate,
    creatorShare,
    grossPerThousandMonetized: cpm,
    creatorPerThousandMonetized: cpm * creatorShare,
  };
}

/**
 * Low / expected / high scenario band for the same view count.
 * Each scenario is the same RPM formula applied to a different RPM.
 */
export function buildScenarios({ monthlyViews, lowRpm, expectedRpm, highRpm, months = 12 }) {
  const inputs = [
    ["Conservative", lowRpm],
    ["Expected", expectedRpm],
    ["Optimistic", highRpm],
  ];

  const rows = [];
  for (const [label, rpm] of inputs) {
    const result = estimateEarnings({ monthlyViews, rpm, months });
    if (result.error) return { error: result.error };
    rows.push({
      label,
      rpm,
      monthly: result.monthly,
      period: result.period,
      annual: result.annual,
    });
  }

  const spread = rows[2].annual - rows[0].annual;
  return { rows, spread, months: rows[0] ? Math.round(months) : 0 };
}
