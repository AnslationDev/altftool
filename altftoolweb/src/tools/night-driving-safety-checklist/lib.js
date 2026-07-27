/**
 * Night driving readiness.
 *
 * Two independent assessments, combined into one verdict:
 *
 *  1. EQUIPMENT — a weighted checklist. Score is the share of available weight
 *     that is ticked. Items marked critical are legal or see-and-be-seen
 *     essentials; leaving one unticked is reported as a blocker regardless of
 *     the score, because an 88% score with a dead brake light is not "88% safe".
 *     Items that do not apply (no fog lamps fitted, no glasses worn) are removed
 *     from the denominator rather than counted as failures.
 *
 *  2. FATIGUE — two published rules, applied to your own numbers:
 *
 *     a) Hours awake as an alcohol equivalent. Dawson & Reid (Nature, 1997;
 *        388:235) found that performance after 17 hours of wakefulness matched
 *        a blood alcohol concentration of 0.05%, and after 24 hours matched
 *        0.10%. Those two anchors are interpolated linearly here.
 *
 *     b) The circadian trough. Sleep-related crashes cluster in the small hours;
 *        02:00–06:00 is the window used here. Any overlap between that window
 *        and your planned drive is measured in hours and reported.
 *
 * Nothing in this module reads the clock — the departure hour and the hours
 * already awake are arguments, so the same inputs always give the same output.
 */

/** Dawson & Reid (1997) anchor: 17 h awake ≈ 0.05% BAC-equivalent impairment. */
export const AWAKE_HOURS_BAC_05 = 17;
/** Dawson & Reid (1997) anchor: 24 h awake ≈ 0.10% BAC-equivalent impairment. */
export const AWAKE_HOURS_BAC_10 = 24;
const BAC_AT_05 = 0.05;
const BAC_AT_10 = 0.1;

/** Circadian trough used for sleep-related crash risk: 02:00 to 06:00. */
export const CIRCADIAN_LOW_START_HOUR = 2;
export const CIRCADIAN_LOW_END_HOUR = 6;

/** Standard rest guidance: a break of at least 15 minutes every 2 hours. */
export const BREAK_INTERVAL_HOURS = 2;
export const BREAK_MINUTES = 15;

/** Sleep in the previous 24 h below this is treated as a fatigue blocker. */
export const MIN_SLEEP_HOURS = 6;

/** Longest single-day drive this planner will reason about. */
const MAX_DRIVE_HOURS = 24;

/**
 * The checklist. `weight` is relative importance; `critical` marks an item that
 * must be ticked before setting off. `optional` items can be marked "not
 * applicable" and are then dropped from both numerator and denominator.
 */
export const CHECKLIST = [
  // --- lights and being seen ---
  { id: "low-beam", group: "Lights", label: "Both low beams work and are aimed down, not into oncoming eyes", weight: 5, critical: true },
  { id: "high-beam", group: "Lights", label: "High beam works and dips cleanly from the stalk", weight: 4, critical: true },
  { id: "tail-brake", group: "Lights", label: "Tail lights and both brake lights light up", weight: 5, critical: true },
  { id: "indicators", group: "Lights", label: "Indicators and hazard lights flash at normal speed", weight: 3, critical: false },
  { id: "reflectors", group: "Lights", label: "Rear reflectors and reflective tape are clean and uncovered", weight: 3, critical: false },
  { id: "fog-lamps", group: "Lights", label: "Fog lamps work", weight: 2, critical: false, optional: true },

  // --- glass and vision ---
  { id: "windscreen", group: "Vision", label: "Windscreen cleaned inside as well as outside", weight: 5, critical: true },
  { id: "wipers", group: "Vision", label: "Wipers leave no streaks and the washer bottle is full", weight: 3, critical: false },
  { id: "mirrors", group: "Vision", label: "Rear-view mirror set to its night (dipped) position", weight: 3, critical: false },
  { id: "dash-dim", group: "Vision", label: "Dashboard and screen brightness turned down", weight: 2, critical: false },
  { id: "no-film", group: "Vision", label: "No dark film on the windscreen or front side glass", weight: 4, critical: false },
  { id: "glasses", group: "Vision", label: "Clear prescription glasses to hand — not yellow 'night driving' lenses", weight: 3, critical: false, optional: true },

  // --- driver state ---
  { id: "slept", group: "Driver", label: "At least 7 hours of sleep in the last 24 hours", weight: 5, critical: true },
  { id: "no-sedatives", group: "Driver", label: "No alcohol and no sedating medication today", weight: 5, critical: true },
  { id: "eye-test", group: "Driver", label: "Eyesight tested within the last two years", weight: 3, critical: false },
  { id: "co-driver", group: "Driver", label: "A second licensed driver who can take over", weight: 3, critical: false, optional: true },

  // --- vehicle and route ---
  { id: "tyres", group: "Vehicle", label: "Tyre pressures and tread checked before setting off", weight: 4, critical: true },
  { id: "fuel", group: "Vehicle", label: "Enough fuel or charge to avoid stopping in an unlit stretch", weight: 3, critical: false },
  { id: "triangle", group: "Vehicle", label: "Warning triangle and reflective jacket on board", weight: 3, critical: false },
  { id: "route", group: "Vehicle", label: "Route and rest stops planned, phone charged", weight: 3, critical: false },
];

/** Readiness bands for the equipment score. */
export const READINESS_BANDS = [
  { min: 90, label: "Ready to go", tone: "success" },
  { min: 75, label: "Nearly ready", tone: "warn" },
  { min: 0, label: "Not ready", tone: "danger" },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Impairment equivalent of continuous wakefulness, as a blood alcohol
 * concentration in percent. Linear between the two published anchors and
 * extended on the same slope beyond 24 h. Returns 0 below 17 h, where the
 * study reports no measurable alcohol-equivalent decrement.
 */
export function bacEquivalent(hoursAwake) {
  if (!isNum(hoursAwake) || hoursAwake <= AWAKE_HOURS_BAC_05) return 0;
  const slope = (BAC_AT_10 - BAC_AT_05) / (AWAKE_HOURS_BAC_10 - AWAKE_HOURS_BAC_05);
  return BAC_AT_05 + (hoursAwake - AWAKE_HOURS_BAC_05) * slope;
}

/**
 * Hours of a drive that fall inside a daily clock window, handling midnight
 * wrap-around and drives longer than the gap to the window.
 */
export function windowOverlapHours(startHour, durationHours, winStart, winEnd) {
  if (!isNum(startHour) || !isNum(durationHours) || durationHours <= 0) return 0;
  const end = startHour + durationHours;
  let total = 0;
  for (let day = 0; day * 24 <= end; day += 1) {
    const openAt = day * 24 + winStart;
    const closeAt = day * 24 + winEnd;
    total += Math.max(0, Math.min(end, closeAt) - Math.max(startHour, openAt));
  }
  return total;
}

/**
 * @param {object} input
 * @param {Record<string, boolean>} input.checked   ticked checklist ids
 * @param {Record<string, boolean>} input.notApplicable  optional ids marked N/A
 * @param {number} input.departureHour  0-23, when the drive starts
 * @param {number} input.driveHours     planned hours behind the wheel
 * @param {number} input.hoursAwake     hours since waking, at departure
 * @param {number} input.sleepLastNight hours slept in the previous 24 h
 */
export function assessNightDrive({
  checked = {},
  notApplicable = {},
  departureHour,
  driveHours,
  hoursAwake,
  sleepLastNight,
}) {
  if (![departureHour, driveHours, hoursAwake, sleepLastNight].every(isNum))
    return { error: "Enter a valid number for the departure time, drive length, hours awake and sleep." };
  if (departureHour < 0 || departureHour > 23)
    return { error: "Departure hour must be between 0 and 23." };
  if (driveHours <= 0) return { error: "Planned driving time must be more than zero hours." };
  if (driveHours > MAX_DRIVE_HOURS)
    return { error: `Plan ${MAX_DRIVE_HOURS} hours or less — anything longer needs an overnight stop, not a checklist.` };
  if (hoursAwake < 0 || hoursAwake > 48)
    return { error: "Hours awake must be between 0 and 48." };
  if (sleepLastNight < 0 || sleepLastNight > 24)
    return { error: "Sleep in the last 24 hours must be between 0 and 24 hours." };

  // --- equipment score ---
  let earned = 0;
  let available = 0;
  const blockers = [];
  const missing = [];
  const groups = new Map();

  for (const item of CHECKLIST) {
    const skipped = Boolean(item.optional && notApplicable[item.id]);
    if (skipped) continue;
    const isChecked = Boolean(checked[item.id]);
    available += item.weight;
    if (isChecked) earned += item.weight;
    else if (item.critical) blockers.push(item.label);
    else missing.push(item.label);

    const bucket = groups.get(item.group) ?? { group: item.group, earned: 0, available: 0, open: 0 };
    bucket.available += item.weight;
    if (isChecked) bucket.earned += item.weight;
    else bucket.open += 1;
    groups.set(item.group, bucket);
  }

  if (available === 0)
    return { error: "Every checklist item has been marked not applicable — nothing left to score." };

  const score = (earned / available) * 100;
  const groupScores = [...groups.values()].map((bucket) => ({
    ...bucket,
    percent: (bucket.earned / bucket.available) * 100,
  }));

  // --- fatigue ---
  const hoursAwakeAtArrival = hoursAwake + driveHours;
  const bacAtStart = bacEquivalent(hoursAwake);
  const bacAtArrival = bacEquivalent(hoursAwakeAtArrival);
  const circadianHours = windowOverlapHours(
    departureHour,
    driveHours,
    CIRCADIAN_LOW_START_HOUR,
    CIRCADIAN_LOW_END_HOUR,
  );
  const arrivalHour = (departureHour + driveHours) % 24;
  const recommendedBreaks = Math.max(0, Math.ceil(driveHours / BREAK_INTERVAL_HOURS) - 1);
  const restMinutes = recommendedBreaks * BREAK_MINUTES;

  const fatigueFlags = [];
  if (sleepLastNight < MIN_SLEEP_HOURS)
    fatigueFlags.push(
      `Only ${sleepLastNight} h of sleep in the last 24 hours — under ${MIN_SLEEP_HOURS} h, a night drive should be postponed rather than managed.`,
    );
  if (bacAtArrival >= BAC_AT_05)
    fatigueFlags.push(
      `You will have been awake ${hoursAwakeAtArrival.toFixed(1)} h by the end, an impairment comparable to ${bacAtArrival.toFixed(3)}% blood alcohol.`,
    );
  if (circadianHours > 0)
    fatigueFlags.push(
      `${circadianHours.toFixed(1)} h of this drive falls in the 02:00–06:00 window, when sleep-related crashes peak.`,
    );
  if (recommendedBreaks > 0)
    fatigueFlags.push(
      `Plan ${recommendedBreaks} stop${recommendedBreaks === 1 ? "" : "s"} of ${BREAK_MINUTES} minutes — one every ${BREAK_INTERVAL_HOURS} hours.`,
    );

  let fatigueRisk;
  if (sleepLastNight < MIN_SLEEP_HOURS || bacAtArrival >= BAC_AT_10) fatigueRisk = "high";
  else if (bacAtArrival >= BAC_AT_05 || circadianHours >= 2) fatigueRisk = "elevated";
  else if (circadianHours > 0 || driveHours > 4) fatigueRisk = "moderate";
  else fatigueRisk = "low";

  // --- combined verdict ---
  const band = READINESS_BANDS.find((entry) => score >= entry.min);
  let verdict;
  let tone;
  if (blockers.length > 0) {
    verdict = `Do not set off — ${blockers.length} essential item${blockers.length === 1 ? "" : "s"} unchecked`;
    tone = "danger";
  } else if (fatigueRisk === "high") {
    verdict = "Equipment is fine, but the fatigue numbers say postpone or swap drivers";
    tone = "danger";
  } else if (score < 75 || fatigueRisk === "elevated") {
    verdict = "Fixable — clear the open items and plan the breaks before you leave";
    tone = "warn";
  } else {
    verdict = band.label;
    tone = band.tone;
  }

  return {
    score,
    earned,
    available,
    groupScores,
    blockers,
    missing,
    checkedCount: CHECKLIST.filter((item) => checked[item.id] && !notApplicable[item.id]).length,
    hoursAwakeAtArrival,
    bacAtStart,
    bacAtArrival,
    circadianHours,
    arrivalHour,
    recommendedBreaks,
    restMinutes,
    fatigueRisk,
    fatigueFlags,
    verdict,
    tone,
  };
}

/** 22.5 -> "22:30", for showing a computed arrival time. */
export function formatClockHour(hour) {
  if (!isNum(hour)) return "—";
  const wrapped = ((hour % 24) + 24) % 24;
  const h = Math.floor(wrapped);
  const m = Math.round((wrapped - h) * 60);
  const rollover = m === 60;
  const hh = String((rollover ? h + 1 : h) % 24).padStart(2, "0");
  const mm = String(rollover ? 0 : m).padStart(2, "0");
  return `${hh}:${mm}`;
}
