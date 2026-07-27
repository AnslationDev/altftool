/**
 * Coaching Fee vs Self-Study Cost comparison.
 *
 * Straight total-cost-of-preparation arithmetic — no statutory rules apply.
 * Coaching side  = programme fee + monthly recurring costs (travel, hostel/PG
 *                  premium, mess difference) × duration months + materials not
 *                  included in the fee.
 * Self-study side = books + test series + one-time buys + monthly recurring
 *                  costs (online subscriptions, internet, library) × months.
 * The comparison is presented as totals, effective per-month cost, and the
 * difference (positive = coaching costs more).
 */

/**
 * @param {object} input
 * @param {number} input.months               Preparation duration in months (same for both plans).
 * @param {number} input.coachingFee          Total coaching programme fee for the duration.
 * @param {number} [input.coachingMonthly]    Coaching-specific monthly costs (travel, hostel premium).
 * @param {number} [input.coachingOneTime]    Coaching-side one-time costs (admission kit, extra books).
 * @param {number} [input.selfOneTime]        Self-study one-time costs (books, test series, hardware).
 * @param {number} [input.selfMonthly]        Self-study monthly costs (subscriptions, internet, library).
 * @returns {object} totals + difference, or { error }.
 */
export function compareCoachingVsSelfStudy({
  months,
  coachingFee,
  coachingMonthly = 0,
  coachingOneTime = 0,
  selfOneTime = 0,
  selfMonthly = 0,
}) {
  const m = Number(months);
  if (!Number.isFinite(m) || m <= 0) {
    return { error: "Preparation duration must be at least 1 month." };
  }
  if (m > 120) {
    return { error: "Duration looks too long — enter 120 months (10 years) or less." };
  }

  const values = {
    coachingFee: Number(coachingFee),
    coachingMonthly: Number(coachingMonthly),
    coachingOneTime: Number(coachingOneTime),
    selfOneTime: Number(selfOneTime),
    selfMonthly: Number(selfMonthly),
  };
  for (const [key, value] of Object.entries(values)) {
    if (!Number.isFinite(value)) {
      return { error: "Every cost field must be a number (use 0 when it does not apply)." };
    }
    if (value < 0) {
      return { error: `Costs cannot be negative (check ${key.replace(/([A-Z])/g, " $1").toLowerCase()}).` };
    }
  }

  const coachingTotal = values.coachingFee + values.coachingOneTime + values.coachingMonthly * m;
  const selfTotal = values.selfOneTime + values.selfMonthly * m;

  const difference = coachingTotal - selfTotal; // positive => coaching costs more
  const cheaper =
    difference > 0 ? "self-study" : difference < 0 ? "coaching" : "equal";

  return {
    months: m,
    coachingTotal,
    selfTotal,
    coachingPerMonth: coachingTotal / m,
    selfPerMonth: selfTotal / m,
    difference: Math.abs(difference),
    differencePerMonth: Math.abs(difference) / m,
    cheaper,
    // How many times costlier the pricier plan is; null when the cheaper plan costs 0.
    costRatio:
      Math.min(coachingTotal, selfTotal) > 0
        ? Math.max(coachingTotal, selfTotal) / Math.min(coachingTotal, selfTotal)
        : null,
  };
}
