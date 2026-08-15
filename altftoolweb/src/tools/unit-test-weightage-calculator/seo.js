const seo = {
  title: "Weighted Test Score Calculator for Unit Tests & Exams",
  metaDescription:
    "Combine unequal unit tests into one score by the weighted mean of percentages — weight a half-yearly 2× and see each test's exact mark contribution.",
  steps: [
    "Enter each test's \"Marks scored\" and \"Out of (maximum)\" — the defaults show two 25-mark unit tests and an 80-mark half-yearly — and set \"Final score out of\".",
    "Give each test a \"Weight (relative)\" (1, 1, 2 makes the half-yearly count double) and use \"Add test\" or \"Remove\" to match your term's tests.",
    "Read \"Final subject score\" with its percentage and each test's share of the final in marks, then click \"Copy result\" for the full breakdown.",
  ],
  intro:
    "This calculator combines unit test scores of different sizes into one final subject score using the weighted mean of percentages: final = Σ(weight × scored ÷ max) ÷ Σweight, scaled to your chosen maximum. Weights are relative — a half-yearly with weight 2 counts double a unit test with weight 1 — so it mirrors how schools and colleges actually merge unequal tests. Each test's effective share of the final and its exact mark contribution are shown alongside the total.",
  useCases: [
    "A CBSE-pattern student merging two 25-mark unit tests and an 80-mark half-yearly, with the half-yearly counting double",
    "A college student whose course grades three quizzes and a midterm with different weightings, projecting the pre-final standing",
    "A parent converting a term's mixed test results into a single percentage to track progress across report cards",
  ],
  benefits: [
    ["Handles unequal test sizes", "Every test is converted to a percentage first, so a 25-mark and an 80-mark test combine fairly."],
    ["Relative weights, no percentages needed", "Type 1, 1, 2 instead of computing 25%, 25%, 50% — the tool normalises automatically."],
    ["Per-test contribution shown", "See how many marks of the final each test supplied and which test is dragging the average."],
  ],
  faqs: [
    [
      "How do I calculate a weighted average of test scores?",
      "Convert each test to a fraction (scored ÷ maximum), multiply by its weight, add them up and divide by the total weight: final % = Σ(weight × scored ÷ max) ÷ Σweight × 100. For example 18/25, 21/25 and 58/80 with weights 1, 1, 2 gives (0.72 + 0.84 + 2 × 0.725) ÷ 4 = 75.25%.",
    ],
    [
      "What does the weight of a test mean?",
      "Weight is the test's relative importance in the final score — a weight-2 exam counts exactly twice a weight-1 quiz. Because the formula divides by the sum of weights, only the ratios matter: weights 1, 1, 2 give identical results to 25, 25, 50.",
    ],
    [
      "Why can't I just average the raw marks of my tests?",
      "Because tests have different maximums: averaging 18/25 and 58/80 as raw marks (38 of 52.5) mixes scales and skews toward the bigger test even before any intended weighting. The correct method converts each score to a percentage first and only then applies the weights.",
    ],
    [
      "Does this calculator handle a best-of rule, like best 2 of 3 unit tests?",
      "Yes, manually — give the dropped test a weight of 0 (or remove its row) and the calculator averages only the remaining tests. It does not automatically pick your best scores, so apply your school's best-of rule before setting the weights.",
    ],
  ],
};

export default seo;
