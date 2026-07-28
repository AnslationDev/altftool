/**
 * Anxiety Check Questionnaire — informational seven-item anxiety self-check
 *
 * Seven statements covering the symptom domains clinicians ask about when
 * screening for generalised anxiety: nervousness, uncontrollable worry, worry
 * spreading across topics, difficulty relaxing, restlessness, irritability and a
 * sense of dread. Each is rated by how many days in the last two weeks it
 * applied, 0 to 3, giving a total of 0-21. The bands at 5, 10 and 15 follow the
 * cut-points used by the standard seven-item anxiety screeners in primary care,
 * where a total of 10 or more is the usual prompt for further assessment.
 *
 * Informational self-reflection only. This is not a diagnostic instrument and
 * does not replace assessment by a doctor or mental health professional.
 */

export const ANXIETY_ITEM_COUNT = 7;
export const ANXIETY_MAX_PER_ITEM = 3;
export const ANXIETY_MAX = ANXIETY_ITEM_COUNT * ANXIETY_MAX_PER_ITEM; // 21

/** The recall window the questions ask about. */
export const RECALL_DAYS = 14;

/** The score at and above which further assessment is conventionally suggested. */
export const ASSESSMENT_THRESHOLD = 10;

export const FREQUENCY_OPTIONS = [
  { value: 0, label: "Not at all", short: "Not at all" },
  { value: 1, label: "Several days", short: "Several days" },
  { value: 2, label: "More than half the days", short: "Over half" },
  { value: 3, label: "Nearly every day", short: "Nearly daily" },
];

export const ANXIETY_ITEMS = [
  { id: "on-edge", statement: "Feeling nervous, anxious or on edge" },
  { id: "uncontrolled-worry", statement: "Not being able to stop or control worrying" },
  { id: "worry-spread", statement: "Worrying too much about a lot of different things" },
  { id: "relax", statement: "Finding it hard to relax" },
  { id: "restless", statement: "Being so restless that sitting still is difficult" },
  { id: "irritable", statement: "Becoming easily annoyed or irritable" },
  { id: "dread", statement: "Feeling afraid, as though something awful might happen" },
];

export const ANXIETY_BANDS = [
  { min: 0, max: 4, label: "Minimal", note: "Few anxiety symptoms reported over the last two weeks." },
  { min: 5, max: 9, label: "Mild", note: "Some symptoms present. Worth watching, and worth mentioning if they persist." },
  {
    min: 10,
    max: 14,
    label: "Moderate",
    note: "A total of 10 or more is the usual point at which clinicians suggest a fuller assessment.",
  },
  { min: 15, max: ANXIETY_MAX, label: "Severe", note: "Symptoms reported frequently across nearly every area." },
];

export function bandForScore(total) {
  return ANXIETY_BANDS.find((b) => total >= b.min && total <= b.max) || null;
}

/**
 * Score a completed anxiety check.
 *
 * @param {object} input
 * @param {Array<number|null>} input.responses One value per item, each 0-3.
 * @returns {object} Result object, or { error } when it cannot be scored.
 */
export function computeAnxietyScore({ responses } = {}) {
  if (!Array.isArray(responses) || responses.length !== ANXIETY_ITEM_COUNT) {
    return { error: `This check needs exactly ${ANXIETY_ITEM_COUNT} answers.` };
  }

  const missing = responses.reduce(
    (list, value, index) => (value === null || value === undefined ? [...list, index + 1] : list),
    [],
  );
  if (missing.length > 0) {
    return { error: `Answer every statement — ${missing.length} still unanswered (item ${missing.join(", ")}).` };
  }

  for (const value of responses) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0 || n > ANXIETY_MAX_PER_ITEM) {
      return { error: "Each statement must be rated 0, 1, 2 or 3." };
    }
  }

  const breakdown = ANXIETY_ITEMS.map((item, index) => {
    const points = Number(responses[index]);
    const option = FREQUENCY_OPTIONS.find((o) => o.value === points);
    return { id: item.id, statement: item.statement, points, answer: option ? option.label : "" };
  });

  const total = breakdown.reduce((sum, row) => sum + row.points, 0);
  const band = bandForScore(total);
  const frequentItems = breakdown.filter((row) => row.points >= 2);

  return {
    total,
    max: ANXIETY_MAX,
    breakdown,
    band: band ? band.label : "",
    bandNote: band ? band.note : "",
    aboveAssessmentThreshold: total >= ASSESSMENT_THRESHOLD,
    assessmentThreshold: ASSESSMENT_THRESHOLD,
    frequentItems,
    frequentItemCount: frequentItems.length,
    recallDays: RECALL_DAYS,
  };
}

/**
 * Summarise a set of dated past scores. Pure: dates arrive as arguments, never
 * read from the clock, so the same log always produces the same summary.
 *
 * @param {Array<{date: string, total: number}>} entries ISO date strings, totals 0-21.
 * @returns {object} Summary, or { error } when an entry is malformed.
 */
export function summariseHistory(entries) {
  if (!Array.isArray(entries)) {
    return { error: "The history log must be a list of dated scores." };
  }
  if (entries.length === 0) {
    return {
      count: 0,
      sorted: [],
      average: null,
      first: null,
      latest: null,
      change: null,
      direction: "none",
      best: null,
      worst: null,
    };
  }

  for (const entry of entries) {
    const total = Number(entry && entry.total);
    if (!Number.isInteger(total) || total < 0 || total > ANXIETY_MAX) {
      return { error: `Every logged score must be a whole number from 0 to ${ANXIETY_MAX}.` };
    }
    if (!entry.date || typeof entry.date !== "string") {
      return { error: "Every logged score needs a date." };
    }
  }

  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const totals = sorted.map((entry) => Number(entry.total));
  const sum = totals.reduce((acc, value) => acc + value, 0);
  const first = sorted[0];
  const latest = sorted[sorted.length - 1];
  const change = Number(latest.total) - Number(first.total);

  return {
    count: sorted.length,
    sorted,
    average: sum / sorted.length,
    first,
    latest,
    change,
    direction: change < 0 ? "down" : change > 0 ? "up" : "unchanged",
    best: sorted.reduce((a, b) => (Number(b.total) < Number(a.total) ? b : a), sorted[0]),
    worst: sorted.reduce((a, b) => (Number(b.total) > Number(a.total) ? b : a), sorted[0]),
  };
}
