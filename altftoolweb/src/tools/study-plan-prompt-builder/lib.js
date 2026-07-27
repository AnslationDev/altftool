/**
 * Study Plan Prompt Builder — turns a syllabus (topic list), a start date and an
 * exam date into a prompt that asks an AI assistant to lay out a day-by-day
 * spaced study plan.
 *
 * The schedule maths encoded here follows the spaced-repetition literature:
 * reviews at expanding intervals beat massed re-reading (Ebbinghaus's forgetting
 * curve; Cepeda et al. 2006 meta-analysis on distributed practice). The plan
 * reserves a final consolidation block before the exam, a standard exam-prep
 * practice, sized at FINAL_REVIEW_FRACTION of available study days.
 */

/**
 * Expanding review intervals in days after first study of a topic.
 * The 1-3-7-14-30 ladder is the widely used expanding-interval schedule in
 * spaced-repetition practice (each gap roughly doubles).
 */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30];

/** Share of study days reserved as a final mixed-review block before the exam. */
export const FINAL_REVIEW_FRACTION = 0.15; // common exam-prep guidance: keep ~10-20% for consolidation
export const MIN_FINAL_REVIEW_DAYS = 1;

/** Practical bounds. */
export const MIN_TOPICS = 1;
export const MAX_TOPICS = 60; // beyond ~60 lines a single AI response cannot schedule reliably
export const MIN_DAYS_PER_WEEK = 1;
export const MAX_DAYS_PER_WEEK = 7;
export const MIN_HOURS_PER_DAY = 0.5;
export const MAX_HOURS_PER_DAY = 12;
export const MAX_PLAN_DAYS = 365; // a plan longer than a year is out of scope for one prompt

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_WEEK = 7;

/** Parse an ISO yyyy-mm-dd string into a UTC-midnight Date, or null when invalid. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

/** Whole days between two UTC-midnight dates. */
export function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/** Split a multi-line syllabus string into trimmed, non-empty topic lines. */
export function parseTopics(raw) {
  if (typeof raw !== "string") return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Build the study-plan prompt.
 *
 * @param {object} input
 * @param {string} input.syllabus       Topics, one per line.
 * @param {string} input.startDate      First study day, yyyy-mm-dd.
 * @param {string} input.examDate       Exam date, yyyy-mm-dd (not a study day).
 * @param {number} input.daysPerWeek    Study days per week, 1-7.
 * @param {number} input.hoursPerDay    Hours available on each study day.
 * @param {string} [input.weakTopics]   Optional comma/line list of weaker topics to weight.
 * @returns {object} plan stats + prompt, or { error }.
 */
export function buildStudyPlanPrompt({
  syllabus,
  startDate,
  examDate,
  daysPerWeek,
  hoursPerDay,
  weakTopics = "",
}) {
  const topics = parseTopics(syllabus);
  if (topics.length < MIN_TOPICS) {
    return { error: "List at least one syllabus topic (one per line)." };
  }
  if (topics.length > MAX_TOPICS) {
    return { error: `Keep the syllabus to ${MAX_TOPICS} topics or fewer — merge sub-points into their parent topic.` };
  }

  const start = parseIsoDate(startDate);
  const exam = parseIsoDate(examDate);
  if (!start) return { error: "Enter a valid start date in yyyy-mm-dd form." };
  if (!exam) return { error: "Enter a valid exam date in yyyy-mm-dd form." };

  const prepDays = daysBetween(start, exam);
  if (prepDays < 1) return { error: "The exam date must be after the start date." };
  if (prepDays > MAX_PLAN_DAYS) {
    return { error: `The plan window is ${prepDays} days — keep it within ${MAX_PLAN_DAYS} days.` };
  }

  const perWeek = Number(daysPerWeek);
  if (!Number.isInteger(perWeek) || perWeek < MIN_DAYS_PER_WEEK || perWeek > MAX_DAYS_PER_WEEK) {
    return { error: `Study days per week must be a whole number between ${MIN_DAYS_PER_WEEK} and ${MAX_DAYS_PER_WEEK}.` };
  }

  const hours = Number(hoursPerDay);
  if (!Number.isFinite(hours) || hours < MIN_HOURS_PER_DAY || hours > MAX_HOURS_PER_DAY) {
    return { error: `Hours per study day must be between ${MIN_HOURS_PER_DAY} and ${MAX_HOURS_PER_DAY}.` };
  }

  // Study days available in the window, pro-rated by days-per-week.
  const studyDays = Math.floor((prepDays * perWeek) / DAYS_PER_WEEK);
  if (studyDays < 1) {
    return { error: "The window is too short for even one study day — start earlier or add study days per week." };
  }

  const finalReviewDays = Math.max(
    MIN_FINAL_REVIEW_DAYS,
    Math.round(studyDays * FINAL_REVIEW_FRACTION),
  );
  if (finalReviewDays >= studyDays) {
    return {
      error: "There is no room for first-pass study before the review block — start earlier or add study days per week.",
    };
  }
  const firstPassDays = studyDays - finalReviewDays;
  const totalHours = studyDays * hours;

  // Reviews only fit inside the window; drop ladder rungs longer than the plan.
  const usableIntervals = REVIEW_INTERVALS_DAYS.filter((gap) => gap < prepDays);

  const weak = parseTopics(weakTopics.replace(/,/g, "\n"));

  const lines = [];
  lines.push("You are a study coach who builds realistic, spaced study schedules.");
  lines.push("");
  lines.push(`Build a day-by-day study plan from ${startDate} to the exam on ${examDate}.`);
  lines.push(`Constraints:`);
  lines.push(`- Study ${perWeek} day${perWeek === 1 ? "" : "s"} per week, about ${hours} hour${hours === 1 ? "" : "s"} per study day (about ${studyDays} study days and ${Math.round(totalHours)} study hours in total).`);
  lines.push(`- Cover every topic below in a first pass during the first ${firstPassDays} study days.`);
  lines.push(
    `- After a topic's first pass, schedule short spaced reviews of it at roughly ${usableIntervals.join(", ")} day${usableIntervals.length === 1 ? "" : "s"} later (skip any review that would land after the exam).`,
  );
  lines.push(
    `- Reserve the final ${finalReviewDays} study day${finalReviewDays === 1 ? "" : "s"} before the exam as a mixed review block: past-paper questions, self-testing and the weakest topics only — no new material.`,
  );
  lines.push("- Prefer active recall (practice questions, self-explanation, blank-page recall) over re-reading in every session.");
  lines.push("- The exam day itself is not a study day.");
  if (weak.length > 0) {
    lines.push(`- Give extra sessions to these weaker topics: ${weak.join("; ")}.`);
  }
  lines.push("");
  lines.push(`Syllabus topics (${topics.length}):`);
  for (const topic of topics) lines.push(`- ${topic}`);
  lines.push("");
  lines.push("Output format:");
  lines.push("- A table with one row per calendar study day: date, topics (new vs review), activity, and time in minutes.");
  lines.push("- Minutes per day must sum to the daily hours above; do not overbook any day.");
  lines.push("- End with a one-paragraph summary of how the spacing is distributed.");

  return {
    prompt: lines.join("\n"),
    topicsCount: topics.length,
    prepDays,
    studyDays,
    firstPassDays,
    finalReviewDays,
    totalHours,
    usableIntervals,
  };
}
