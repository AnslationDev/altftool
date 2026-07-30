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
    lowLabel: "Flexible",
    highLabel: "Structured",
    lowDetail: "You adapt as things change and prefer to keep your options open rather than lock in a fixed plan.",
    highDetail: "You do your best work with clear systems, routines, and a defined process to follow.",
  },
  leadership: {
    label: "Leadership",
    lowLabel: "Collaborator",
    highLabel: "Leader",
    lowDetail: "You prefer contributing as part of a team over directing it, and work well alongside others toward a shared goal.",
    highDetail: "You naturally step up to guide projects and people, and enjoy taking ownership of outcomes.",
  },
  socialEnergy: {
    label: "Social Energy",
    lowLabel: "Introvert",
    highLabel: "Extrovert",
    lowDetail: "Quiet, focused time recharges you, and you tend to prefer deeper one-on-one conversations over large groups.",
    highDetail: "Social interaction energizes you, and you tend to think out loud and thrive in group settings.",
  },
  planning: {
    label: "Planning Style",
    lowLabel: "Spontaneous",
    highLabel: "Planner",
    lowDetail: "You like to stay open to the moment and adjust course as opportunities come up.",
    highDetail: "You feel most comfortable when you've mapped out the steps ahead of time.",
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
    const dominant = percent == null ? null : percent >= 50 ? meta.highLabel : meta.lowLabel;
    const detail = percent == null ? null : percent >= 50 ? meta.highDetail : meta.lowDetail;

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
