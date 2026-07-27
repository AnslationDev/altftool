/**
 * AI usage journal — validation and aggregation.
 *
 * Pure module: no React, no DOM, no clock. Anything date-relative takes the
 * reference date as an argument so the same input always gives the same output.
 */

/**
 * Outcome rubric. `weight` is the share of the task the AI actually finished,
 * used to build the effectiveness score. The scale is defined here and nowhere
 * else, so a change to the rubric changes every number consistently.
 *  1.00 shipped untouched, 0.75 light edit, 0.40 heavy rewrite,
 *  0.15 redone from scratch (only the idea survived), 0.00 thrown away.
 */
export const OUTCOMES = [
  { id: "shipped", label: "Used as-is", weight: 1.0 },
  { id: "light-edit", label: "Light edit", weight: 0.75 },
  { id: "heavy-edit", label: "Heavy rewrite", weight: 0.4 },
  { id: "redone", label: "Redone from scratch", weight: 0.15 },
  { id: "abandoned", label: "Abandoned", weight: 0.0 },
];

export const OUTCOME_IDS = OUTCOMES.map((outcome) => outcome.id);

const OUTCOME_BY_ID = OUTCOMES.reduce((map, outcome) => {
  map[outcome.id] = outcome;
  return map;
}, {});

/** Outcomes that count as "no rework needed" for the first-pass rate. */
export const FIRST_PASS_OUTCOMES = ["shipped"];

/** Field limits, kept small so a journal stays readable and fast. */
export const MAX_ENTRIES = 500;
export const MAX_TASK_LENGTH = 140;
export const MAX_ATTEMPTS = 50;
export const MAX_MINUTES = 24 * 60; // one working day per entry

/** Effectiveness score bands, used for the plain-language verdict. */
export const SCORE_BANDS = [
  { min: 85, label: "Strong fit", note: "Most tasks ship with little or no rework." },
  { min: 65, label: "Working well", note: "Useful output, but budget time for edits." },
  { min: 45, label: "Mixed", note: "Roughly half the output needs real rewriting." },
  { min: 0, label: "Poor fit", note: "Most attempts are rewritten or thrown away." },
];

const isBlank = (value) => typeof value !== "string" || value.trim().length === 0;

const toFiniteNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
};

/** True when `value` is an ISO calendar date (YYYY-MM-DD) that really exists. */
export function isIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const probe = new Date(Date.UTC(year, month - 1, day));
  return (
    probe.getUTCFullYear() === year && probe.getUTCMonth() === month - 1 && probe.getUTCDate() === day
  );
}

/** Whole days between two ISO dates (later - earlier). Returns NaN if invalid. */
export function daysBetween(fromIso, toIso) {
  if (!isIsoDate(fromIso) || !isIsoDate(toIso)) return NaN;
  const MS_PER_DAY = 86400000;
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);
  return Math.round((to - from) / MS_PER_DAY);
}

/**
 * Validate one journal entry.
 * @returns {{entry: object}|{error: string}}
 */
export function validateEntry(raw) {
  if (!raw || typeof raw !== "object") return { error: "Entry is missing." };
  if (isBlank(raw.task)) return { error: "Describe the task in a few words." };
  if (raw.task.trim().length > MAX_TASK_LENGTH) {
    return { error: `Keep the task under ${MAX_TASK_LENGTH} characters.` };
  }
  if (!isIsoDate(raw.date)) return { error: "Pick a valid date." };
  if (!OUTCOME_BY_ID[raw.outcome]) return { error: "Choose an outcome for the task." };

  const attempts = toFiniteNumber(raw.attempts);
  if (Number.isNaN(attempts) || attempts < 1) return { error: "Attempts must be at least 1." };
  if (attempts > MAX_ATTEMPTS) return { error: `Attempts cannot exceed ${MAX_ATTEMPTS}.` };

  const minutesSpent = toFiniteNumber(raw.minutesSpent);
  const minutesSaved = toFiniteNumber(raw.minutesSaved);
  if (Number.isNaN(minutesSpent) || minutesSpent < 0) {
    return { error: "Minutes spent cannot be negative." };
  }
  if (Number.isNaN(minutesSaved) || minutesSaved < 0) {
    return { error: "Minutes saved cannot be negative." };
  }
  if (minutesSpent > MAX_MINUTES || minutesSaved > MAX_MINUTES) {
    return { error: `Keep minutes under ${MAX_MINUTES} per entry.` };
  }

  return {
    entry: {
      id: typeof raw.id === "string" && raw.id ? raw.id : `${raw.date}-${raw.task.trim()}`,
      date: raw.date,
      task: raw.task.trim(),
      model: isBlank(raw.model) ? "Unspecified" : raw.model.trim(),
      outcome: raw.outcome,
      attempts: Math.round(attempts),
      minutesSpent: Math.round(minutesSpent),
      minutesSaved: Math.round(minutesSaved),
      notes: isBlank(raw.notes) ? "" : raw.notes.trim(),
    },
  };
}

/** Effectiveness score for a single entry, 0-100. */
export function scoreEntry(entry) {
  const outcome = OUTCOME_BY_ID[entry?.outcome];
  if (!outcome) return 0;
  return outcome.weight * 100;
}

export function bandForScore(score) {
  const value = Number.isFinite(score) ? score : 0;
  return SCORE_BANDS.find((band) => value >= band.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
}

const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Aggregate a journal.
 *
 * @param {Array<object>} entries validated entries
 * @param {{today?: string, recentDays?: number}} [context] `today` is an ISO
 *        date supplied by the caller — the maths never reads the clock itself.
 * @returns {object|{error: string}}
 */
export function summarizeJournal(entries, context = {}) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { error: "Add at least one entry to see your usage summary." };
  }
  if (entries.length > MAX_ENTRIES) {
    return { error: `This journal holds up to ${MAX_ENTRIES} entries.` };
  }

  const clean = [];
  for (const raw of entries) {
    const checked = validateEntry(raw);
    if (checked.error) return { error: checked.error };
    clean.push(checked.entry);
  }

  const total = clean.length;
  let attempts = 0;
  let minutesSpent = 0;
  let minutesSaved = 0;
  let weightSum = 0;
  let firstPass = 0;

  const byOutcome = OUTCOMES.map((outcome) => ({ ...outcome, count: 0 }));
  const outcomeIndex = byOutcome.reduce((map, row, index) => {
    map[row.id] = index;
    return map;
  }, {});

  const modelMap = new Map();
  let earliest = clean[0].date;
  let latest = clean[0].date;

  for (const entry of clean) {
    attempts += entry.attempts;
    minutesSpent += entry.minutesSpent;
    minutesSaved += entry.minutesSaved;
    weightSum += OUTCOME_BY_ID[entry.outcome].weight;
    if (FIRST_PASS_OUTCOMES.includes(entry.outcome) && entry.attempts === 1) firstPass += 1;
    byOutcome[outcomeIndex[entry.outcome]].count += 1;

    if (entry.date < earliest) earliest = entry.date;
    if (entry.date > latest) latest = entry.date;

    const current = modelMap.get(entry.model) ?? {
      model: entry.model,
      count: 0,
      attempts: 0,
      weightSum: 0,
      minutesSaved: 0,
      minutesSpent: 0,
    };
    current.count += 1;
    current.attempts += entry.attempts;
    current.weightSum += OUTCOME_BY_ID[entry.outcome].weight;
    current.minutesSaved += entry.minutesSaved;
    current.minutesSpent += entry.minutesSpent;
    modelMap.set(entry.model, current);
  }

  const effectiveness = (weightSum / total) * 100;
  const netMinutes = minutesSaved - minutesSpent;

  for (const row of byOutcome) {
    row.share = round1((row.count / total) * 100);
  }

  const byModel = Array.from(modelMap.values())
    .map((row) => ({
      model: row.model,
      count: row.count,
      avgAttempts: round1(row.attempts / row.count),
      effectiveness: round1((row.weightSum / row.count) * 100),
      netMinutes: row.minutesSaved - row.minutesSpent,
    }))
    .sort((a, b) => b.count - a.count || b.effectiveness - a.effectiveness);

  const spanDays = daysBetween(earliest, latest);
  const daysCovered = Number.isNaN(spanDays) ? 1 : spanDays + 1;

  let recent = null;
  const today = context.today;
  const recentDays = Number.isFinite(Number(context.recentDays)) ? Number(context.recentDays) : 7;
  if (isIsoDate(today) && recentDays > 0) {
    const window = clean.filter((entry) => {
      const age = daysBetween(entry.date, today);
      return Number.isFinite(age) && age >= 0 && age < recentDays;
    });
    recent = {
      days: recentDays,
      count: window.length,
      netMinutes: window.reduce((sum, entry) => sum + entry.minutesSaved - entry.minutesSpent, 0),
    };
  }

  return {
    total,
    entries: clean,
    attempts,
    avgAttempts: round1(attempts / total),
    minutesSpent,
    minutesSaved,
    netMinutes,
    netHours: round1(netMinutes / 60),
    minutesPerEntry: round1(netMinutes / total),
    effectiveness: round1(effectiveness),
    band: bandForScore(effectiveness),
    firstPassCount: firstPass,
    firstPassRate: round1((firstPass / total) * 100),
    reworkRate: round1(((total - firstPass) / total) * 100),
    byOutcome,
    byModel,
    earliest,
    latest,
    daysCovered,
    entriesPerDay: round1(total / Math.max(1, daysCovered)),
    recent,
  };
}

/** Tab-separated export of a journal, one row per entry. Pure string builder. */
export function toTsv(entries) {
  const header = ["Date", "Task", "Model", "Outcome", "Attempts", "Minutes spent", "Minutes saved"];
  const rows = (Array.isArray(entries) ? entries : []).map((entry) => [
    entry.date,
    entry.task,
    entry.model,
    OUTCOME_BY_ID[entry.outcome]?.label ?? entry.outcome,
    entry.attempts,
    entry.minutesSpent,
    entry.minutesSaved,
  ]);
  return [header, ...rows].map((row) => row.join("\t")).join("\n");
}
