const seo = {
  title: "Marks Needed Calculator – Hit Your Target Percentage",
  metaDescription:
    "Enter marks scored, papers remaining and a target percent to get the exact marks still needed, rounded up, plus whether the target is still reachable.",
  steps: [
    "Enter your Marks scored so far, the Maximum marks of exams already taken, the Maximum marks still to be examined and your Target overall percentage.",
    "Read 'Marks still needed', which recomputes as you type and is rounded up to the next whole mark the way real mark sheets score.",
    "Check 'Required in remaining exams', 'Best possible overall percentage' and 'Target reachable?' — Yes or No — then press Copy result for a text summary.",
  ],
  intro:
    "This calculator computes the exact marks you still need in remaining exams to finish at a target overall percentage, using the standard weighted formula: marks needed = target% × (marks so far + remaining maximum) − marks already scored, rounded up to the next whole mark. It also reports what percentage of the remaining papers that represents and flags targets that are no longer mathematically reachable. It is built for students mid-way through a term, semester or board year.",
  useCases: [
    "A student with 320/500 after half-yearly exams checking what the finals demand for a 75% aggregate",
    "A college student computing the minimum end-semester score that keeps a scholarship's percentage condition alive",
    "A repeater checking honestly whether a 90% goal is still possible or whether the target should be revised",
  ],
  benefits: [
    ["Exact, not approximate", "Marks needed are computed from the weighted total and rounded up, the way real mark sheets work."],
    ["Feasibility check", "If even a perfect remaining score cannot reach the target, the tool says so and shows the best possible outcome."],
    ["Remaining-exam difficulty", "The requirement is restated as a percentage of the papers left, so you know how hard the ask is."],
  ],
  faqs: [
    [
      "How do I calculate how many marks I need for 75 percent overall?",
      "Multiply 0.75 by the combined maximum of all exams, then subtract the marks you already have. With 320/500 scored and 500 marks remaining, you need 0.75 × 1000 − 320 = 430 marks, which is 86% of the remaining papers.",
    ],
    [
      "Why does the calculator round the marks needed upwards?",
      "Because marks are awarded in whole units on most mark sheets, a requirement of 429.5 means you must actually score 430. Rounding down would show a total that falls just short of the target.",
    ],
    [
      "How do I know if my target percentage is still achievable?",
      "Compare the marks needed against the maximum marks remaining. If needed marks exceed what is left, the target is unreachable; this tool then shows your best possible overall percentage assuming a perfect score in everything left.",
    ],
    [
      "Does this work for CGPA or grade-point systems?",
      "Directly, no — it works in raw marks and percentages. Convert grade points to percentage using your university's official conversion (many use percentage = CGPA × 9.5 or a similar multiplier) before entering values, and confirm the multiplier with your institution.",
    ],
  ],
};

export default seo;
