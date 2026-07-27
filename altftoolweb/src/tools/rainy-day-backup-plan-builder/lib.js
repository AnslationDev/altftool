/**
 * Rainy day backup plan builder.
 *
 * Two pieces of real arithmetic sit underneath this.
 *
 * 1. What a rain percentage means. A probability of precipitation (PoP) is the
 *    chance of at least 0.01 inch (0.25 mm) of rain at any given point in the
 *    forecast area during the period. The US National Weather Service defines
 *    it as PoP = C x A, the forecaster's confidence that rain will occur
 *    somewhere multiplied by the fraction of the area expected to get it. A 40%
 *    day is not "40% of the day is wet"; it is a 40% chance that your specific
 *    spot records measurable rain.
 *
 * 2. How risk compounds across a trip. Treating each day as independent:
 *
 *      P(no day is washed out) = product of (1 - risk_i)
 *      P(at least one washout) = 1 - that product
 *      expected washouts       = sum of risk_i
 *
 *    Six days at 30% each is not "a 30% chance of rain on the trip" — it is a
 *    88% chance of losing at least one day, and about 1.8 days lost on average.
 *    Independence is an approximation: a stalled weather system correlates days
 *    and makes the true spread narrower, so read the figures as a planning
 *    guide rather than a forecast.
 *
 * Risk is the forecast probability scaled by how much rain actually ruins the
 * activity, which is a stated model rather than a measured statistic: a market
 * walk survives a shower, a boat trip does not.
 *
 * Pure functions. No clock, no network, no DOM.
 */

/** PoP threshold used by the US National Weather Service, in millimetres. */
export const POP_THRESHOLD_MM = 0.25;

/** A day at or above this effective risk gets a backup plan written for it. */
export const BACKUP_THRESHOLD = 0.3;

/** A swap is only worth suggesting if it moves this many points of PoP. */
export const SWAP_MIN_GAIN_PCT = 15;

export const MAX_DAYS = 30;

/**
 * How much rain actually costs you, by activity type. A stated planning model:
 * the factor is the share of the activity's value that rain removes.
 */
export const SENSITIVITIES = [
  {
    id: "low",
    label: "Survives a shower",
    factor: 0.4,
    note: "Markets, city walking, covered arcades, anything with doorways to duck into.",
  },
  {
    id: "medium",
    label: "Spoiled but possible",
    factor: 0.7,
    note: "General sightseeing, gardens, cycling, walking tours.",
  },
  {
    id: "high",
    label: "Cancelled outright",
    factor: 1,
    note: "Beach, hiking, boat trips, viewpoints, open-air sport, anything ticketed and weather-dependent.",
  },
];

const SENSITIVITY_BY_ID = Object.fromEntries(SENSITIVITIES.map((item) => [item.id, item]));

/** Bands for describing a single day's risk. */
export const RISK_BANDS = [
  { min: 0.7, label: "Very likely lost", tone: "danger" },
  { min: 0.4, label: "At real risk", tone: "warn" },
  { min: BACKUP_THRESHOLD, label: "Worth a backup", tone: "warn" },
  { min: 0.15, label: "Probably fine", tone: "ok" },
  { min: 0, label: "Low risk", tone: "ok" },
];

export function bandForRisk(risk) {
  return RISK_BANDS.find((band) => risk >= band.min) || RISK_BANDS[RISK_BANDS.length - 1];
}

/** A blank itinerary day. */
export function emptyDay(counter) {
  return {
    id: `day-${counter}`,
    label: `Day ${counter}`,
    activity: "",
    rainPct: 30,
    sensitivity: "medium",
    isIndoor: false,
  };
}

/** A blank indoor alternative. */
export function emptyOption(counter) {
  return { id: `option-${counter}`, label: "", hours: 2, bookingNeeded: false };
}

/**
 * @param {object} input
 * @param {Array} input.days     itinerary days
 * @param {Array} input.options  pool of indoor alternatives
 */
export function buildBackupPlan(input) {
  const { days = [], options = [] } = input || {};

  if (!Array.isArray(days) || !Array.isArray(options)) {
    return { error: "The itinerary is missing." };
  }
  if (days.length === 0) return { error: "Add at least one day to the itinerary." };
  if (days.length > MAX_DAYS) return { error: `Keep the itinerary to ${MAX_DAYS} days or fewer.` };

  const scored = [];
  for (let index = 0; index < days.length; index += 1) {
    const day = days[index];
    const rainPct = Number(day?.rainPct);
    if (!Number.isFinite(rainPct) || rainPct < 0 || rainPct > 100) {
      return { error: `Rain chance on ${day?.label || `day ${index + 1}`} must be between 0% and 100%.` };
    }
    const sensitivity = SENSITIVITY_BY_ID[day?.sensitivity] || SENSITIVITY_BY_ID.medium;
    const isIndoor = Boolean(day?.isIndoor);
    const risk = isIndoor ? 0 : (rainPct / 100) * sensitivity.factor;
    scored.push({
      id: day?.id || `day-${index + 1}`,
      index,
      label: (day?.label || `Day ${index + 1}`).trim() || `Day ${index + 1}`,
      activity: typeof day?.activity === "string" ? day.activity.trim() : "",
      rainPct,
      sensitivity,
      isIndoor,
      risk,
      band: bandForRisk(isIndoor ? 0 : (rainPct / 100) * sensitivity.factor),
      needsBackup: !isIndoor && risk >= BACKUP_THRESHOLD,
    });
  }

  const outdoorDays = scored.filter((day) => !day.isIndoor);
  const indoorDays = scored.filter((day) => day.isIndoor);

  const expectedWashouts = scored.reduce((sum, day) => sum + day.risk, 0);
  const pNone = scored.reduce((product, day) => product * (1 - day.risk), 1);
  const pAtLeastOne = 1 - pNone;
  const pAllOutdoorLost = outdoorDays.length > 0 ? outdoorDays.reduce((product, day) => product * day.risk, 1) : 0;

  // Assign indoor alternatives to the riskiest days first, no repeats.
  const usableOptions = options
    .filter((option) => typeof option?.label === "string" && option.label.trim().length > 0)
    .map((option, index) => ({
      id: option.id || `option-${index + 1}`,
      label: option.label.trim(),
      hours: Number.isFinite(Number(option.hours)) ? Number(option.hours) : 0,
      bookingNeeded: Boolean(option.bookingNeeded),
    }));

  const atRisk = [...scored].filter((day) => day.needsBackup).sort((a, b) => b.risk - a.risk || a.index - b.index);
  const assignments = atRisk.map((day, position) => ({
    day,
    option: usableOptions[position] || null,
  }));
  const uncovered = assignments.filter((entry) => !entry.option).map((entry) => entry.day);
  const spareOptions = usableOptions.slice(atRisk.length);

  // Swap suggestions: move an outdoor plan off a wet day onto a dry indoor day.
  const wetOutdoor = [...outdoorDays].sort((a, b) => b.rainPct - a.rainPct);
  const dryIndoor = [...indoorDays].sort((a, b) => a.rainPct - b.rainPct);
  const swaps = [];
  const usedIndoor = new Set();
  for (const outdoor of wetOutdoor) {
    const partner = dryIndoor.find(
      (candidate) => !usedIndoor.has(candidate.id) && outdoor.rainPct - candidate.rainPct >= SWAP_MIN_GAIN_PCT,
    );
    if (!partner) continue;
    usedIndoor.add(partner.id);
    const newRisk = (partner.rainPct / 100) * outdoor.sensitivity.factor;
    swaps.push({
      from: outdoor,
      to: partner,
      riskBefore: outdoor.risk,
      riskAfter: newRisk,
      saving: outdoor.risk - newRisk,
    });
  }

  const expectedAfterSwaps = expectedWashouts - swaps.reduce((sum, swap) => sum + swap.saving, 0);

  const notes = [];
  if (pAtLeastOne >= 0.8 && outdoorDays.length > 1) {
    notes.push(
      `There is a ${Math.round(pAtLeastOne * 100)}% chance at least one outdoor day is lost. Plan for it rather than hoping — that is what the numbers say, not a pessimistic reading of them.`,
    );
  }
  if (uncovered.length > 0) {
    notes.push(`${uncovered.length} at-risk day${uncovered.length === 1 ? " has" : "s have"} no indoor alternative listed yet.`);
  }
  if (usableOptions.some((option) => option.bookingNeeded)) {
    notes.push("Backups that need booking are not backups if you book them on the wet morning. Check whether same-day tickets exist before you rely on them.");
  }
  if (outdoorDays.length > 0 && outdoorDays.every((day) => day.rainPct >= 60)) {
    notes.push("Every outdoor day is above 60%. This is a season problem, not a scheduling one — consider swapping the whole trip's shape towards indoor cities.");
  }

  return {
    days: scored,
    outdoorDays,
    indoorDays,
    expectedWashouts,
    expectedAfterSwaps,
    pNone,
    pAtLeastOne,
    pAllOutdoorLost,
    assignments,
    uncovered,
    spareOptions,
    swaps,
    notes,
  };
}

const PCT = (value) => `${Math.round(value * 100)}%`;

/** Clipboard summary. */
export function formatBackupPlanText(plan) {
  if (!plan || plan.error) return "";
  const lines = [
    "Rainy day backup plan",
    `Chance of losing at least one outdoor day: ${PCT(plan.pAtLeastOne)}`,
    `Expected days lost: ${Math.round(plan.expectedWashouts * 10) / 10} of ${plan.outdoorDays.length} outdoor days`,
    "",
    "Days:",
  ];
  plan.days.forEach((day) => {
    lines.push(
      `  ${day.label}${day.activity ? ` — ${day.activity}` : ""}: ${day.rainPct}% rain, ${day.isIndoor ? "indoor" : `${day.sensitivity.label.toLowerCase()}, risk ${PCT(day.risk)}`}`,
    );
  });
  if (plan.assignments.length > 0) {
    lines.push("", "Backups:");
    plan.assignments.forEach((entry) => {
      lines.push(`  ${entry.day.label}: ${entry.option ? entry.option.label : "NO BACKUP PLANNED"}`);
    });
  }
  if (plan.swaps.length > 0) {
    lines.push("", "Suggested swaps:");
    plan.swaps.forEach((swap) => {
      lines.push(`  Move ${swap.from.activity || swap.from.label} from ${swap.from.label} (${swap.from.rainPct}%) to ${swap.to.label} (${swap.to.rainPct}%)`);
    });
    lines.push(`  Expected days lost after swaps: ${Math.round(plan.expectedAfterSwaps * 10) / 10}`);
  }
  return lines.join("\n");
}
