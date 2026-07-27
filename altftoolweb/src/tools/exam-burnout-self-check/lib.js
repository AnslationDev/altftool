/**
 * Exam / study burnout self-check.
 *
 * Structure follows the three-dimension model of academic burnout described by
 * Schaufeli et al. (2002) for the Maslach Burnout Inventory — Student Survey
 * (MBI-SS): emotional EXHAUSTION from study demands, CYNICISM (a distant or
 * indifferent attitude towards study), and reduced academic EFFICACY.
 * The items below are original plain-language questions written for this tool
 * (the MBI-SS itself is a copyrighted commercial instrument), and the cut-off
 * bands are informational heuristics, not clinical thresholds.
 *
 * This is an informational self-reflection tool, NOT a diagnostic instrument.
 */

/** 0–4 frequency scale, the same response format the MBI family of tools uses conceptually. */
export const RATING_SCALE = [
  { value: 0, label: "Never" },
  { value: 1, label: "Rarely" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Often" },
  { value: 4, label: "Almost always" },
];

export const MIN_RATING = 0;
export const MAX_RATING = 4;

export const DIMENSIONS = [
  { id: "exhaustion", label: "Exhaustion" },
  { id: "cynicism", label: "Cynicism / detachment" },
  { id: "efficacy", label: "Reduced study efficacy" },
];

/**
 * 12 items, 4 per dimension. `reverse: true` marks positively-worded efficacy
 * items: answering "almost always" to them indicates LOW burnout, so the item
 * score is (MAX_RATING - answer).
 */
export const QUESTIONS = [
  { id: "q1", dimension: "exhaustion", reverse: false, text: "I feel drained at the end of a study day, even a short one." },
  { id: "q2", dimension: "exhaustion", reverse: false, text: "I wake up tired at the thought of another day of preparation." },
  { id: "q3", dimension: "exhaustion", reverse: false, text: "Studying for this exam leaves me too exhausted for anything else." },
  { id: "q4", dimension: "exhaustion", reverse: false, text: "I get headaches, eye strain or body tension during long study sessions." },
  { id: "q5", dimension: "cynicism", reverse: false, text: "I have lost interest in the subjects I am preparing." },
  { id: "q6", dimension: "cynicism", reverse: false, text: "I doubt whether this exam or course is worth the effort." },
  { id: "q7", dimension: "cynicism", reverse: false, text: "I go through study material mechanically, without caring what it says." },
  { id: "q8", dimension: "cynicism", reverse: false, text: "I avoid talking or thinking about my preparation." },
  { id: "q9", dimension: "efficacy", reverse: true, text: "I can effectively solve problems or questions that come up in my study." },
  { id: "q10", dimension: "efficacy", reverse: true, text: "I feel I am making real progress towards my exam goal." },
  { id: "q11", dimension: "efficacy", reverse: true, text: "After a study session I can recall the main points I covered." },
  { id: "q12", dimension: "efficacy", reverse: true, text: "I feel confident handling the syllabus that remains." },
];

/**
 * Heuristic bands on the 0–4 mean item score. Thirds of the scale:
 * below 1.5 = low, 1.5 to below 2.5 = moderate, 2.5 and above = high.
 * These are informational cut points for self-reflection only.
 */
export const BAND_MODERATE_FROM = 1.5;
export const BAND_HIGH_FROM = 2.5;

export function bandFor(score) {
  if (score >= BAND_HIGH_FROM) return "high";
  if (score >= BAND_MODERATE_FROM) return "moderate";
  return "low";
}

export const BAND_LABELS = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
};

/**
 * Recovery suggestions keyed by dimension, shown when that dimension is
 * moderate or high. Drawn from widely recommended study-recovery practice
 * (spaced breaks, sleep hygiene, goal re-framing, retrieval practice).
 */
export const SUGGESTIONS = {
  exhaustion: [
    "Cap study blocks at 45-60 minutes with a genuine off-screen break between them.",
    "Protect 7-9 hours of sleep; sacrificing sleep for revision lowers retention the next day.",
    "Schedule at least one fully study-free half-day per week and treat it as non-negotiable.",
  ],
  cynicism: [
    "Reconnect the exam to a concrete personal goal — write one sentence on why you started.",
    "Switch study formats for a few days (videos, discussion, teaching a peer) to break monotony.",
    "Talk to a mentor, senior or friend preparing for the same exam; isolation feeds detachment.",
  ],
  efficacy: [
    "Use retrieval practice (closed-book recall, past papers) so progress becomes visible and measurable.",
    "Break the syllabus into small units and tick them off — finished units are proof of progress.",
    "Review topics you already know well occasionally; earned confidence is fuel, not wasted time.",
  ],
};

export const HIGH_OVERALL_NOTE =
  "A high overall score on a self-check like this is a signal to slow down and talk to someone — a counsellor, doctor or trusted mentor — especially if low mood, hopelessness or sleep problems persist for more than two weeks.";

/**
 * Score the self-check.
 * @param {object} input
 * @param {number[]} input.answers  Array of 12 integers 0-4, aligned with QUESTIONS order.
 * @returns {object} { dimensionScores, overallScore, overallBand, suggestions, ... } or { error }
 */
export function scoreBurnout({ answers }) {
  if (!Array.isArray(answers) || answers.length !== QUESTIONS.length) {
    return { error: `Answer all ${QUESTIONS.length} questions to see your result.` };
  }
  for (let i = 0; i < answers.length; i += 1) {
    const a = Number(answers[i]);
    if (!Number.isInteger(a) || a < MIN_RATING || a > MAX_RATING) {
      return { error: `Question ${i + 1} needs an answer between ${MIN_RATING} and ${MAX_RATING}.` };
    }
  }

  const sums = { exhaustion: 0, cynicism: 0, efficacy: 0 };
  const counts = { exhaustion: 0, cynicism: 0, efficacy: 0 };

  QUESTIONS.forEach((question, index) => {
    const raw = Number(answers[index]);
    const itemScore = question.reverse ? MAX_RATING - raw : raw;
    sums[question.dimension] += itemScore;
    counts[question.dimension] += 1;
  });

  const dimensionScores = DIMENSIONS.map((dimension) => {
    // counts are always 4 per dimension by construction, but guard anyway.
    const count = counts[dimension.id];
    const score = count > 0 ? sums[dimension.id] / count : 0;
    const band = bandFor(score);
    return { id: dimension.id, label: dimension.label, score, band };
  });

  const overallScore =
    dimensionScores.reduce((total, d) => total + d.score, 0) / dimensionScores.length;
  const overallBand = bandFor(overallScore);

  const suggestions = dimensionScores
    .filter((d) => d.band !== "low")
    .flatMap((d) => SUGGESTIONS[d.id].map((tip) => ({ dimension: d.label, tip })));

  return {
    dimensionScores,
    overallScore,
    overallBand,
    maxScore: MAX_RATING,
    suggestions,
    showSupportNote: overallBand === "high",
  };
}
