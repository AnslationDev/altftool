const seo = {
  title: "Sinclair Calculator: IWF Weightlifting Total",
  metaDescription:
    "Enter bodyweight, snatch and clean & jerk for the IWF Sinclair total, using the published 2021-2024 Paris or 2017-2020 Tokyo constants.",
  steps: [
    "Choose the Coefficient set, Men or Women, and the Olympic cycle: 2021-2024 Paris or 2017-2020 Tokyo.",
    "Set Units to Kilograms or Pounds, then enter Bodyweight, Snatch and Clean & jerk.",
    "Read the Sinclair total with the coefficient and kilo total behind it, then press Copy result.",
  ],
  intro:
    "The Sinclair coefficient converts an Olympic weightlifting total into the total the same athlete would theoretically produce at the heaviest world-record bodyweight, so every category can be ranked on one list. The IWF formula is 10^(A × (log₁₀(bodyweight ÷ b))²), applied only below the reference bodyweight b — at or above b the coefficient is exactly 1.00. This calculator carries the published A and b constants for the 2021–2024 and 2017–2020 Olympic cycles and multiplies them by your snatch plus clean & jerk.",
  useCases: [
    "Rank a club competition where a 55 kg and a 102 kg lifter both competed, using one Sinclair list instead of separate categories.",
    "Compare your own total from two seasons at different bodyweights to see whether relative performance actually improved.",
    "Rescore an older result with the 2017–2020 constants that were in force when it was set.",
    "Work out the total needed at your bodyweight to reach a national-level Sinclair figure.",
  ],
  benefits: [
    ["Official IWF constants", "Carries the published A and b values per Olympic cycle rather than a single fixed table."],
    ["Correct behaviour at b", "Coefficients above the reference bodyweight return exactly 1.00, as the IWF defines."],
    ["Two cycles built in", "Rescore historical results with the constants that applied at the time."],
  ],
  faqs: [
    [
      "How is the Sinclair coefficient calculated?",
      "Take the base-10 logarithm of bodyweight divided by the reference bodyweight b, square it, multiply by the cycle constant A, then raise 10 to that power. For a 100 kg man in the 2021–2024 cycle (A = 0.722762521, b = 193.609 kg) the coefficient is about 1.147, so a 400 kg total becomes a Sinclair total near 459.",
    ],
    [
      "What do A and b mean in the Sinclair formula?",
      "b is the bodyweight of the world-record holder in the heaviest category, and A is a fitted constant derived from world-record data across the categories. The IWF recalculates both at the start of each Olympic cycle, which is why a Sinclair total from one cycle is not directly comparable with another.",
    ],
    [
      "Does the Sinclair coefficient favour lighter or heavier lifters?",
      "It is designed to be neutral: the coefficient falls smoothly towards 1.00 as bodyweight approaches b, so a superheavyweight gets no multiplier while a 55 kg lifter gets a large one. Critics point out that the fit still reflects the record data of the cycle it was built from, so small biases can appear between categories.",
    ],
    [
      "Is there a Sinclair adjustment for masters athletes?",
      "Yes — the Sinclair–Meltzer–Faber (often called Sinclair–Malone–Meltzer) age factors multiply the Sinclair total by an additional age coefficient for masters competition. This calculator applies only the standard bodyweight coefficient, so masters results need that separate age factor applied afterwards.",
    ],
  ],
};

export default seo;
