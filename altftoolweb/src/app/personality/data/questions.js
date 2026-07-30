// Each question maps to one trait dimension, scored from the chosen Likert
// option (see scoring.js) so the result page can compute something real
// from the answers instead of just a completion percentage.
export const questions = [
  {
    id: 1,
    question:
      "I enjoy working in a structured environment.",
    trait: "structure",
  },

  {
    id: 2,
    question:
      "I enjoy leading teams and projects.",
    trait: "leadership",
  },

  {
    id: 3,
    question:
      "I feel energized after social interactions.",
    trait: "socialEnergy",
  },

  {
    id: 4,
    question:
      "I prefer planning over spontaneity.",
    trait: "planning",
  },
];