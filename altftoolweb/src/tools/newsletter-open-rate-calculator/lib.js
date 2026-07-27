/**
 * Newsletter Open Rate Calculator — pure email metric maths.
 * No React, no DOM.
 *
 * Every rate below follows the standard email-marketing convention: engagement
 * rates use DELIVERED as the denominator (sent minus bounces), while the bounce
 * rate itself uses sent. Mixing the two is the most common reporting error.
 */

/** Denominator each rate is measured against, shown in the UI. */
export const RATE_BASIS = {
  open: "delivered",
  click: "delivered",
  clickToOpen: "unique opens",
  bounce: "sent",
  unsubscribe: "delivered",
  complaint: "delivered",
};

/**
 * A widely used deliverability guardrail: mailbox providers treat spam
 * complaints above 0.1% of delivered mail as a problem, and 0.3% as severe.
 * Hard-bounce rates above 2% are the usual warning line for list hygiene.
 */
export const DELIVERABILITY_LIMITS = {
  complaintWarn: 0.1,
  complaintSevere: 0.3,
  bounceWarn: 2,
};

/**
 * Apple Mail Privacy Protection, introduced in 2021, pre-fetches tracking
 * pixels for users who opt in, registering an open whether or not the message
 * was read. Any open rate measured with a pixel is therefore inflated by an
 * unknown share, which is why an adjusted figure is worth calculating.
 */
export const MPP_NOTE =
  "Pixel-based opens include Apple Mail Privacy Protection prefetches, so the raw open rate is inflated.";

const isNum = (value) => Number.isFinite(Number(value));

/** Safe percentage: returns null instead of NaN or Infinity when the base is zero. */
export function rate(part, whole) {
  const p = Number(part);
  const w = Number(whole);
  if (!isNum(part) || !isNum(whole)) return null;
  if (w <= 0) return null;
  return (p / w) * 100;
}

/** All headline metrics for one campaign. */
export function computeCampaignMetrics({
  sent,
  bounces = 0,
  uniqueOpens = 0,
  uniqueClicks = 0,
  unsubscribes = 0,
  complaints = 0,
  machineOpens = 0,
} = {}) {
  if (!isNum(sent)) return { error: "Enter the number of emails sent." };
  const sentCount = Number(sent);
  if (sentCount <= 0) return { error: "Emails sent must be greater than zero." };

  const fields = { bounces, uniqueOpens, uniqueClicks, unsubscribes, complaints, machineOpens };
  for (const [name, value] of Object.entries(fields)) {
    if (!isNum(value)) return { error: `Enter a number for ${name.replace(/([A-Z])/g, " $1").toLowerCase()}.` };
    if (Number(value) < 0) return { error: "Counts cannot be negative." };
  }

  const bounceCount = Number(bounces);
  if (bounceCount > sentCount) return { error: "Bounces cannot exceed emails sent." };

  const delivered = sentCount - bounceCount;
  if (delivered <= 0) {
    return { error: "Every email bounced, so no engagement rate can be calculated." };
  }

  const opens = Number(uniqueOpens);
  const clicks = Number(uniqueClicks);
  const machine = Number(machineOpens);

  if (opens > delivered) return { error: "Unique opens cannot exceed delivered emails." };
  if (clicks > delivered) return { error: "Unique clicks cannot exceed delivered emails." };
  if (machine > opens) return { error: "Machine opens cannot exceed total unique opens." };

  const humanOpens = opens - machine;

  const metrics = {
    sent: sentCount,
    delivered,
    bounces: bounceCount,
    uniqueOpens: opens,
    uniqueClicks: clicks,
    machineOpens: machine,
    humanOpens,
    deliveryRate: rate(delivered, sentCount),
    bounceRate: rate(bounceCount, sentCount),
    openRate: rate(opens, delivered),
    adjustedOpenRate: rate(humanOpens, delivered),
    clickRate: rate(clicks, delivered),
    clickToOpenRate: rate(clicks, opens),
    unsubscribeRate: rate(Number(unsubscribes), delivered),
    complaintRate: rate(Number(complaints), delivered),
  };

  const flags = [];
  if (metrics.bounceRate !== null && metrics.bounceRate > DELIVERABILITY_LIMITS.bounceWarn) {
    flags.push(
      `Bounce rate is ${metrics.bounceRate.toFixed(2)}%, above the ${DELIVERABILITY_LIMITS.bounceWarn}% list-hygiene warning line. Clean the list before the next send.`,
    );
  }
  if (metrics.complaintRate !== null && metrics.complaintRate >= DELIVERABILITY_LIMITS.complaintSevere) {
    flags.push(
      `Complaint rate is ${metrics.complaintRate.toFixed(3)}%, at or above the ${DELIVERABILITY_LIMITS.complaintSevere}% level mailbox providers treat as severe.`,
    );
  } else if (metrics.complaintRate !== null && metrics.complaintRate > DELIVERABILITY_LIMITS.complaintWarn) {
    flags.push(
      `Complaint rate is ${metrics.complaintRate.toFixed(3)}%, above the ${DELIVERABILITY_LIMITS.complaintWarn}% threshold providers watch.`,
    );
  }
  if (clicks > opens) {
    flags.push(
      "More clicks than opens — normal when images are blocked or a security scanner follows links, but it makes the click-to-open rate exceed 100%.",
    );
  }
  if (machine === 0 && opens > 0) flags.push(MPP_NOTE);

  return { ...metrics, flags };
}

/** Compare a campaign against a benchmark you supply, in percentage points and relative terms. */
export function compareToBenchmark({ value, benchmark }) {
  if (value === null || !isNum(value)) return { error: "No rate available to compare." };
  if (!isNum(benchmark)) return { error: "Enter a benchmark to compare against." };
  const v = Number(value);
  const b = Number(benchmark);
  const points = v - b;
  return {
    points,
    relativePct: b > 0 ? (points / b) * 100 : null,
    direction: points > 0 ? "above" : points < 0 ? "below" : "level",
  };
}

/**
 * Extra opens or clicks needed to reach a target rate on the same delivered
 * volume — useful for setting a realistic goal for the next send.
 */
export function countNeededForRate({ targetRatePct, delivered, currentCount }) {
  const target = Number(targetRatePct);
  const base = Number(delivered);
  const current = Number(currentCount);
  if (!(target >= 0)) return { error: "Target rate cannot be negative." };
  if (target > 100) return { error: "A rate above 100% is not possible on this base." };
  if (!(base > 0)) return { error: "Delivered emails must be greater than zero." };
  if (!(current >= 0)) return { error: "Current count cannot be negative." };
  const needed = (target / 100) * base;
  return { needed, extra: Math.max(0, needed - current), alreadyMet: current >= needed };
}
