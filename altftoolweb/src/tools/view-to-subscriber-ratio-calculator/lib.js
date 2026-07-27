/**
 * View To Subscriber Ratio Calculator — pure conversion maths.
 * No React, no DOM.
 */

/** YouTube Partner Programme subscriber requirement, used for the "views to 1,000 subs" projection. */
export const YPP_SUBSCRIBER_REQUIREMENT = 1000;

/** Conversion is quoted per thousand views, the same base as CPM and RPM. */
export const RATE_BASE_VIEWS = 1000;

/**
 * Bands are derived from the effort each ratio implies, not from a claimed
 * industry average: at 1 subscriber per 1,000 views it takes a million views to
 * add a thousand subscribers, at 5 it takes 200,000.
 */
export const RATIO_BANDS = [
  { min: 5, label: "Very strong", note: "About 200,000 views per 1,000 new subscribers." },
  { min: 2, label: "Strong", note: "Between 200,000 and 500,000 views per 1,000 subscribers." },
  { min: 1, label: "Typical", note: "Between 500,000 and 1,000,000 views per 1,000 subscribers." },
  { min: 0.5, label: "Low", note: "1 to 2 million views per 1,000 subscribers." },
  { min: 0, label: "Very low", note: "Over 2 million views per 1,000 subscribers — the hook or the ask is not landing." },
];

const isNum = (value) => Number.isFinite(Number(value));

/**
 * Core ratio maths for one reporting period, with an optional previous period
 * and an optional subscriber goal.
 */
export function computeViewToSubRatio({
  views,
  subsGained,
  previousViews = null,
  previousSubsGained = null,
  currentSubscribers = 0,
  subscriberGoal = 0,
} = {}) {
  const v = Number(views);
  const s = Number(subsGained);
  if (!isNum(views) || !isNum(subsGained)) return { error: "Enter numbers for views and subscribers gained." };
  if (v <= 0) return { error: "Views in the period must be greater than zero." };
  if (s < 0) return { error: "Subscribers gained cannot be negative." };

  const current = isNum(currentSubscribers) ? Math.max(0, Number(currentSubscribers)) : 0;
  const goal = isNum(subscriberGoal) ? Math.max(0, Number(subscriberGoal)) : 0;

  const subsPerThousand = (s / v) * RATE_BASE_VIEWS;
  const conversionPct = (s / v) * 100;
  const viewsPerSub = s > 0 ? v / s : null;
  const band = RATIO_BANDS.find((entry) => subsPerThousand >= entry.min) ?? RATIO_BANDS[RATIO_BANDS.length - 1];

  const viewsForThousandSubs = s > 0 ? (YPP_SUBSCRIBER_REQUIREMENT * v) / s : null;

  const remainingToGoal = goal > current ? goal - current : 0;
  const viewsToGoal = remainingToGoal > 0 && s > 0 ? (remainingToGoal * v) / s : remainingToGoal > 0 ? null : 0;

  let trend = null;
  if (isNum(previousViews) && isNum(previousSubsGained) && Number(previousViews) > 0 && Number(previousSubsGained) >= 0) {
    const pv = Number(previousViews);
    const ps = Number(previousSubsGained);
    const previousRatio = (ps / pv) * RATE_BASE_VIEWS;
    const delta = subsPerThousand - previousRatio;
    trend = {
      previousRatio,
      delta,
      changePct: previousRatio > 0 ? (delta / previousRatio) * 100 : null,
      direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
    };
  }

  const notes = [];
  if (s > v) {
    notes.push(
      "More subscribers than views in the period — some are arriving from the Shorts feed, search or off-platform links rather than these views.",
    );
  }
  if (s === 0) notes.push("No subscribers gained, so views per subscriber and the projections cannot be calculated.");
  if (goal > 0 && goal <= current) notes.push("The subscriber goal is already met.");

  return {
    views: v,
    subsGained: s,
    subsPerThousand,
    conversionPct,
    viewsPerSub,
    band,
    viewsForThousandSubs,
    currentSubscribers: current,
    subscriberGoal: goal,
    remainingToGoal,
    viewsToGoal,
    trend,
    notes,
  };
}

/** Subscribers a given view count would produce at the measured ratio. */
export function projectSubscribers({ subsPerThousand, plannedViews }) {
  const rate = Number(subsPerThousand);
  const views = Number(plannedViews);
  if (!(rate >= 0)) return { error: "Subscribers per thousand views cannot be negative." };
  if (!(views >= 0)) return { error: "Planned views cannot be negative." };
  return { subscribers: (rate * views) / RATE_BASE_VIEWS };
}
