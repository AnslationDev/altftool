import { questions } from "./questions";

/**
 * Turns the saved Likert answers into real per-trait scores and a short
 * summary — the result page previously showed only a completion percentage
 * with no computed personality output at all.
 */

export const LIKERT_SCORE = {
  "Strongly Disagree": 1,
  Disagree: 2,
  Neutral: 3,
  Agree: 4,
  "Strongly Agree": 5,
};

export const TRAITS = {
  structure: {
    label: "Structure",
    lowLabel: "Leans flexible",
    midLabel: "Neutral response",
    highLabel: "Leans structured",
    lowDetail: "This answer leans toward adapting as plans change and keeping options open.",
    midDetail: "This answer sits at the midpoint between a defined routine and room to adapt.",
    highDetail: "This answer leans toward clear systems, routines, and a defined process.",
  },
  leadership: {
    label: "Leadership Preference",
    lowLabel: "Leans collaborative",
    midLabel: "Neutral response",
    highLabel: "Leans toward leading",
    lowDetail: "This answer leans toward contributing alongside a team rather than directing it.",
    midDetail: "This answer sits at the midpoint between contributing alongside others and taking the lead.",
    highDetail: "This answer leans toward guiding a team and taking ownership of shared outcomes.",
  },
  socialEnergy: {
    label: "Social Energy",
    lowLabel: "Leans toward quiet focus",
    midLabel: "Neutral response",
    highLabel: "Leans toward social energy",
    lowDetail: "This answer leans toward recharging through quiet, focused time.",
    midDetail: "This answer sits at the midpoint between quiet focus and social interaction.",
    highDetail: "This answer leans toward gaining energy from social interaction.",
  },
  planning: {
    label: "Planning Style",
    lowLabel: "Leans spontaneous",
    midLabel: "Neutral response",
    highLabel: "Leans planned",
    lowDetail: "This answer leans toward staying open to the moment and adjusting course as needed.",
    midDetail: "This answer sits at the midpoint between planning ahead and staying spontaneous.",
    highDetail: "This answer leans toward mapping out the steps ahead of time.",
  },
};

/**
 * @param {(id: number) => string | null} getAnswer
 * @returns {{ traits: Array, allAnswered: boolean }}
 */
export function computeResult(getAnswer) {
  const traits = questions.map((question) => {
    const answer = getAnswer(question.id);
    const rawScore = LIKERT_SCORE[answer] ?? null;
    const percent = rawScore == null ? null : Math.round(((rawScore - 1) / 4) * 100);
    const meta = TRAITS[question.trait];
    const direction =
      rawScore == null ? null : rawScore < 3 ? "low" : rawScore > 3 ? "high" : "mid";
    const dominant = direction == null ? null : meta[`${direction}Label`];
    const detail = direction == null ? null : meta[`${direction}Detail`];

    return {
      key: question.trait,
      label: meta.label,
      answer,
      percent,
      dominant,
      detail,
    };
  });

  return {
    traits,
    allAnswered: traits.every((trait) => trait.percent != null),
  };
}
