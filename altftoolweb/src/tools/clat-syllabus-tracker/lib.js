/**
 * CLAT (UG) syllabus tracker.
 *
 * Paper structure and marking follow the Consortium of National Law
 * Universities' scheme for the undergraduate paper as revised for CLAT 2025:
 * 120 comprehension-based multiple-choice questions in 2 hours, one mark for
 * each correct answer and a deduction of 0.25 marks for each wrong answer.
 * The five sections carry the indicative weights the Consortium publishes:
 * English 20%, Current Affairs including General Knowledge 25%, Legal
 * Reasoning 25%, Logical Reasoning 20% and Quantitative Techniques 10%.
 *
 * Everything here is pure arithmetic — no dates, no DOM, no React.
 */

/** Questions in the CLAT UG paper (Consortium pattern from CLAT 2025). */
export const TOTAL_QUESTIONS = 120;

/** Duration of the paper in minutes. */
export const DURATION_MINUTES = 120;

/** Marks added for a correct answer. */
export const MARK_CORRECT = 1;

/** Marks deducted for a wrong answer (negative marking of one quarter mark). */
export const PENALTY_WRONG = 0.25;

/**
 * Revision states for a topic. The weights turn four qualitative states into
 * one percentage for display; they are not a Consortium scale.
 */
export const TOPIC_STATUSES = [
  { id: "not-started", label: "Not started", weight: 0 },
  { id: "learning", label: "Covered once", weight: 0.5 },
  { id: "practised", label: "Practised with passages", weight: 0.8 },
  { id: "mastered", label: "Mastered in mocks", weight: 1 },
];

export const DEFAULT_STATUS = "not-started";

const STATUS_WEIGHT = TOPIC_STATUSES.reduce((acc, status) => {
  acc[status.id] = status.weight;
  return acc;
}, {});

/**
 * Sections of the CLAT UG paper. `weightPercent` is the Consortium's
 * indicative weight and `minQuestions`/`maxQuestions` the published band for
 * the 120-question paper.
 */
export const CLAT_SECTIONS = [
  {
    id: "english",
    name: "English Language",
    weightPercent: 20,
    minQuestions: 22,
    maxQuestions: 26,
    topics: [
      "Reading comprehension of 450-word passages",
      "Main idea and central theme",
      "Inference and conclusion",
      "Author's argument and point of view",
      "Tone, style and attitude",
      "Vocabulary in context",
      "Summary and paraphrase",
    ],
  },
  {
    id: "current-affairs",
    name: "Current Affairs including General Knowledge",
    weightPercent: 25,
    minQuestions: 28,
    maxQuestions: 32,
    topics: [
      "News-based passages from the last 12 months",
      "Indian polity and government schemes in the news",
      "International affairs, treaties and summits",
      "Economy and budget in the news",
      "Awards, honours and appointments",
      "Sports events and records",
      "Arts, culture and heritage",
      "Science, environment and technology in the news",
      "Static general knowledge linked to current events",
    ],
  },
  {
    id: "legal-reasoning",
    name: "Legal Reasoning",
    weightPercent: 25,
    minQuestions: 28,
    maxQuestions: 32,
    topics: [
      "Applying a stated principle to a set of facts",
      "Law of contract principles",
      "Law of torts principles",
      "Criminal law principles",
      "Constitutional law and fundamental rights",
      "Family and personal law",
      "Public policy and legal developments in the news",
      "Identifying which principle governs a passage",
    ],
  },
  {
    id: "logical-reasoning",
    name: "Logical Reasoning",
    weightPercent: 20,
    minQuestions: 22,
    maxQuestions: 26,
    topics: [
      "Premises, conclusions and argument structure",
      "Assumptions and unstated premises",
      "Strengthening and weakening an argument",
      "Inference and logical consequence",
      "Analogies and relationships",
      "Contradictions and paradoxes",
      "Sequences, arrangements and syllogisms",
    ],
  },
  {
    id: "quantitative",
    name: "Quantitative Techniques",
    weightPercent: 10,
    minQuestions: 10,
    maxQuestions: 14,
    topics: [
      "Ratio, proportion and variation",
      "Percentages",
      "Averages and mixtures",
      "Profit, loss and discount",
      "Simple and compound interest",
      "Time, speed, distance and work",
      "Mensuration",
      "Data interpretation from tables, graphs and charts",
    ],
  },
];

/** Days shown in the reading-practice log. */
export const READING_LOG_DAYS = 30;

export function sectionById(id) {
  return CLAT_SECTIONS.find((section) => section.id === id) || null;
}

export function topicKey(sectionId, index) {
  return `${sectionId}:${index}`;
}

function weightOf(statusId) {
  const weight = STATUS_WEIGHT[statusId];
  return typeof weight === "number" ? weight : 0;
}

/** Midpoint of a section's published question band, used for planning. */
export function typicalQuestions(section) {
  return (section.minQuestions + section.maxQuestions) / 2;
}

/**
 * Readiness for one section: the average status weight of its topics.
 * @returns {object} readiness figures, or { error }
 */
export function sectionReadiness(sectionId, statusMap = {}) {
  const section = sectionById(sectionId);
  if (!section) return { error: "Unknown CLAT section." };

  const total = section.topics.length;
  let weighted = 0;
  let mastered = 0;
  let notStarted = 0;

  section.topics.forEach((_, index) => {
    const status = statusMap[topicKey(sectionId, index)] || DEFAULT_STATUS;
    weighted += weightOf(status);
    if (status === "mastered") mastered += 1;
    if (status === DEFAULT_STATUS) notStarted += 1;
  });

  const percent = total > 0 ? (weighted / total) * 100 : 0;

  return {
    id: section.id,
    name: section.name,
    weightPercent: section.weightPercent,
    minQuestions: section.minQuestions,
    maxQuestions: section.maxQuestions,
    typicalQuestions: typicalQuestions(section),
    total,
    mastered,
    notStarted,
    percent,
    /** Contribution of this section to the overall weighted readiness. */
    contribution: (percent * section.weightPercent) / 100,
  };
}

/**
 * Overall readiness, weighted by the Consortium's section weights rather than
 * by topic count — a Quantitative topic is worth less than a Legal one.
 */
export function overallReadiness(statusMap = {}) {
  const sections = CLAT_SECTIONS.map((section) => sectionReadiness(section.id, statusMap));
  const weightTotal = CLAT_SECTIONS.reduce((sum, section) => sum + section.weightPercent, 0);
  if (weightTotal <= 0) return { error: "Section weights are missing." };

  const percent = sections.reduce((sum, section) => sum + section.contribution, 0) / (weightTotal / 100);
  const topics = sections.reduce((sum, section) => sum + section.total, 0);
  const mastered = sections.reduce((sum, section) => sum + section.mastered, 0);
  const weakest = sections.reduce(
    (worst, section) => (worst === null || section.percent < worst.percent ? section : worst),
    null,
  );

  return {
    sections,
    percent,
    topics,
    mastered,
    weakest,
    minutesPerQuestion: DURATION_MINUTES / TOTAL_QUESTIONS,
  };
}

/**
 * Reading-practice consistency.
 *
 * @param {boolean[]} log  One entry per day, oldest first, newest last.
 * @returns {object} { daysLogged, consistencyPercent, currentStreak, longestStreak } or { error }
 */
export function readingConsistency(log) {
  if (!Array.isArray(log) || log.length === 0) {
    return { error: "The reading log is empty." };
  }

  let daysLogged = 0;
  let longestStreak = 0;
  let running = 0;

  log.forEach((day) => {
    if (day) {
      daysLogged += 1;
      running += 1;
      if (running > longestStreak) longestStreak = running;
    } else {
      running = 0;
    }
  });

  // The current streak runs backwards from the most recent day.
  let currentStreak = 0;
  for (let index = log.length - 1; index >= 0; index -= 1) {
    if (!log[index]) break;
    currentStreak += 1;
  }

  return {
    days: log.length,
    daysLogged,
    missed: log.length - daysLogged,
    consistencyPercent: (daysLogged / log.length) * 100,
    currentStreak,
    longestStreak,
  };
}

/**
 * Marks under the CLAT marking scheme for a given number of attempts and
 * accuracy. Unattempted questions score nothing and cost nothing.
 *
 * @param {object} input { attempted, accuracyPercent }
 * @returns {object} { correct, wrong, marks, percentOfTotal } or { error }
 */
export function expectedScore({ attempted, accuracyPercent }) {
  const tries = Number(attempted);
  const accuracy = Number(accuracyPercent);

  if (!Number.isFinite(tries) || tries < 0) {
    return { error: "Questions attempted must be zero or more." };
  }
  if (tries > TOTAL_QUESTIONS) {
    return { error: `The paper has only ${TOTAL_QUESTIONS} questions.` };
  }
  if (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100) {
    return { error: "Accuracy must be between 0% and 100%." };
  }

  const correct = (tries * accuracy) / 100;
  const wrong = tries - correct;
  const marks = correct * MARK_CORRECT - wrong * PENALTY_WRONG;

  return {
    correct,
    wrong,
    unattempted: TOTAL_QUESTIONS - tries,
    marks,
    percentOfTotal: (marks / TOTAL_QUESTIONS) * 100,
    /**
     * Accuracy at which attempting one more question breaks even: a mark is
     * gained with probability p and 0.25 lost otherwise, so p = 0.25/1.25.
     */
    breakEvenAccuracy: (PENALTY_WRONG / (MARK_CORRECT + PENALTY_WRONG)) * 100,
  };
}
