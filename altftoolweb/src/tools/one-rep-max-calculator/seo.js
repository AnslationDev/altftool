const seo = {
  intro:
    "One Rep Max Calculator estimates the heaviest weight you could lift for a single rep, using the weight and rep count from a set you have already completed. It runs the well-known Epley, Brzycki and Lombardi formulas so you can compare estimates instead of trusting one number, and it works for any lift — squat, bench, deadlift or overhead press.",
  useCases: [
    "Set training percentages for a strength programme that prescribes work at 70–85% of 1RM.",
    "Estimate a max safely when you do not have a spotter or do not want to risk a true one-rep attempt.",
    "Track strength progress month to month by comparing estimated maxes from the same rep range.",
  ],
  benefits: [
    [
      "Three formulas, not one",
      "Epley, Brzycki and Lombardi disagree slightly by rep range — seeing all three tells you how confident the estimate is.",
    ],
    [
      "Built for programming",
      "Turn one working set into the training percentages your programme actually asks for.",
    ],
    [
      "No true max attempt needed",
      "Estimate from a set you already did, so you skip the injury risk and fatigue of testing a real single.",
    ],
  ],
  faqs: [
    [
      "How accurate is an estimated one-rep max?",
      "It is most accurate from sets of about 3–6 reps, usually within a few percent of a true max. Above roughly 10 reps the estimate drifts high, because endurance starts to matter more than pure strength.",
    ],
    [
      "Why do Epley, Brzycki and Lombardi give different numbers?",
      "Each formula was fitted to different lifters and rep ranges. Brzycki tends to read lower at high reps, Epley slightly higher, and Lombardi uses a power curve. Taking the middle of the three is a reasonable working figure.",
    ],
    [
      "Which reps should I enter for the best estimate?",
      "Use a hard set taken close to failure at 3–6 reps. A set you stopped well short of failure will underestimate your max, and a very high-rep set will overestimate it.",
    ],
    [
      "Can I use the same 1RM for every lift?",
      "No — estimate each lift separately. Rep strength varies by movement, so your bench and deadlift will not follow the same weight-to-rep relationship even at the same effort.",
    ],
  ],
};

export default seo;
