/**
 * Shorts Vs Long Form Time Planner — pure allocation maths.
 * No React, no DOM. Solves a small integer knapsack exactly, no heuristics.
 */

/** Revenue is quoted per 1,000 views, the standard RPM base. */
export const RPM_BASE_VIEWS = 1000;

/**
 * Upper bound on how many pieces of one format the optimiser will consider in a
 * week. It keeps the exhaustive search small and reflects that no one publishes
 * more than a few hundred pieces a week.
 */
export const MAX_PIECES_PER_WEEK = 200;

const isNum = (value) => Number.isFinite(Number(value));

/** Expected revenue from one piece: views / 1000 x RPM. */
export function revenuePerPiece({ avgViews, rpm }) {
  const views = Number(avgViews);
  const rate = Number(rpm);
  if (!(views >= 0)) return { error: "Average views cannot be negative." };
  if (!(rate >= 0)) return { error: "RPM cannot be negative." };
  return { revenue: (views / RPM_BASE_VIEWS) * rate };
}

/** Expected revenue per production hour for one format. */
export function valuePerHour({ avgViews, rpm, hoursPerPiece }) {
  const per = revenuePerPiece({ avgViews, rpm });
  if (per.error) return per;
  const hours = Number(hoursPerPiece);
  if (!(hours > 0)) return { error: "Hours per piece must be greater than zero." };
  return { valuePerHour: per.revenue / hours, revenuePerPiece: per.revenue };
}

/**
 * Exhaustive integer allocation: try every feasible number of long-form videos,
 * fill the remaining hours with as many Shorts as the cap allows, and keep the
 * best total. With caps in the low hundreds this is a handful of iterations and
 * returns the true optimum rather than a greedy approximation.
 */
export function planWeek({
  weeklyHours,
  shorts,
  longForm,
  goal = "revenue",
} = {}) {
  const hours = Number(weeklyHours);
  if (!isNum(weeklyHours) || hours <= 0) return { error: "Weekly production hours must be greater than zero." };
  if (!shorts || !longForm) return { error: "Provide the figures for both formats." };

  const formats = [
    { key: "shorts", name: "Shorts", ...shorts },
    { key: "longForm", name: "Long form", ...longForm },
  ];

  for (const format of formats) {
    if (!isNum(format.hoursPerPiece) || Number(format.hoursPerPiece) <= 0) {
      return { error: `${format.name}: hours per piece must be greater than zero.` };
    }
    if (!isNum(format.avgViews) || Number(format.avgViews) < 0) {
      return { error: `${format.name}: average views must be zero or more.` };
    }
    if (!isNum(format.rpm) || Number(format.rpm) < 0) {
      return { error: `${format.name}: RPM must be zero or more.` };
    }
    if (!isNum(format.maxPerWeek) || Number(format.maxPerWeek) < 0) {
      return { error: `${format.name}: weekly cap must be zero or more.` };
    }
  }
  if (goal !== "revenue" && goal !== "views") return { error: "Goal must be either revenue or views." };

  const metrics = formats.map((format) => {
    const value = valuePerHour(format);
    return {
      ...format,
      hoursPerPiece: Number(format.hoursPerPiece),
      avgViews: Number(format.avgViews),
      rpm: Number(format.rpm),
      maxPerWeek: Math.min(MAX_PIECES_PER_WEEK, Math.floor(Number(format.maxPerWeek))),
      revenuePerPiece: value.error ? 0 : value.revenuePerPiece,
      valuePerHour: value.error ? 0 : value.valuePerHour,
      viewsPerHour: Number(format.avgViews) / Number(format.hoursPerPiece),
    };
  });

  const [shortMetric, longMetric] = metrics;
  const scoreOf = (short, long) =>
    goal === "views"
      ? short * shortMetric.avgViews + long * longMetric.avgViews
      : short * shortMetric.revenuePerPiece + long * longMetric.revenuePerPiece;

  const maxLong = Math.min(longMetric.maxPerWeek, Math.floor(hours / longMetric.hoursPerPiece));
  let best = null;
  for (let long = 0; long <= maxLong; long += 1) {
    const hoursLeft = hours - long * longMetric.hoursPerPiece;
    const short = Math.min(shortMetric.maxPerWeek, Math.floor(hoursLeft / shortMetric.hoursPerPiece + 1e-9));
    const usedHours = long * longMetric.hoursPerPiece + short * shortMetric.hoursPerPiece;
    const score = scoreOf(short, long);
    if (!best || score > best.score) {
      best = { short, long, usedHours, score };
    }
  }

  if (!best) return { error: "No feasible plan at these hours and caps." };

  const shortsRevenue = best.short * shortMetric.revenuePerPiece;
  const longRevenue = best.long * longMetric.revenuePerPiece;
  const shortsViews = best.short * shortMetric.avgViews;
  const longViews = best.long * longMetric.avgViews;

  const notes = [];
  if (best.short === shortMetric.maxPerWeek && shortMetric.valuePerHour > longMetric.valuePerHour) {
    notes.push("Shorts are the higher earner per hour but the weekly cap is binding — raising it would improve the plan.");
  }
  if (best.long === longMetric.maxPerWeek && longMetric.valuePerHour > shortMetric.valuePerHour) {
    notes.push("Long form is the higher earner per hour but the weekly cap is binding — raising it would improve the plan.");
  }
  const idle = hours - best.usedHours;
  if (idle >= Math.min(shortMetric.hoursPerPiece, longMetric.hoursPerPiece)) {
    notes.push(`${idle.toFixed(1)} hours are unusable because both caps are reached.`);
  } else if (idle > 0) {
    notes.push(`${idle.toFixed(1)} hours are left over — not enough for another piece of either format.`);
  }
  if (shortMetric.valuePerHour === longMetric.valuePerHour) {
    notes.push("Both formats return the same per hour, so the split is driven only by the caps and the hour remainder.");
  }

  return {
    weeklyHours: hours,
    goal,
    shorts: {
      ...shortMetric,
      count: best.short,
      hours: best.short * shortMetric.hoursPerPiece,
      revenue: shortsRevenue,
      views: shortsViews,
    },
    longForm: {
      ...longMetric,
      count: best.long,
      hours: best.long * longMetric.hoursPerPiece,
      revenue: longRevenue,
      views: longViews,
    },
    totalRevenue: shortsRevenue + longRevenue,
    totalViews: shortsViews + longViews,
    usedHours: best.usedHours,
    idleHours: idle,
    notes,
  };
}

/** Revenue if every available hour went into one format, for comparison. */
export function allInOnFormat({ weeklyHours, format }) {
  const hours = Number(weeklyHours);
  if (!(hours > 0)) return { error: "Weekly production hours must be greater than zero." };
  if (!format || !(Number(format.hoursPerPiece) > 0)) return { error: "Hours per piece must be greater than zero." };
  const cap = Math.min(MAX_PIECES_PER_WEEK, Math.floor(Number(format.maxPerWeek ?? MAX_PIECES_PER_WEEK)));
  const count = Math.min(cap, Math.floor(hours / Number(format.hoursPerPiece) + 1e-9));
  const per = revenuePerPiece({ avgViews: format.avgViews, rpm: format.rpm });
  if (per.error) return per;
  return {
    count,
    revenue: count * per.revenue,
    views: count * Number(format.avgViews),
    hours: count * Number(format.hoursPerPiece),
  };
}
