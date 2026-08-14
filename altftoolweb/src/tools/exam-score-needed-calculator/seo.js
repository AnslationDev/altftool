const seo = {
  title: "Final Exam Score Needed Calculator by Grade Weight",
  metaDescription:
    "Enter your current grade, the final's weight and your target to get the minimum exam score in percent and marks — plus every grade band and what-ifs.",
  steps: [
    "Enter your Current grade so far (%), the Final exam weight (%), your Target overall grade (%) and the Final exam maximum marks.",
    "Read 'Score needed in the final', which updates as you type — the minimum percent and its marks out of your paper's maximum, showing 0% when the target is already secured or 'Not reachable' when even a perfect final falls short.",
    "Check 'Score needed for each grade band' for A through Pass and the 'What if you score...' table of overall outcomes, then press Copy result.",
  ],
  "intro": "Exam Score Needed Calculator solves the one question every student asks before finals: what is the minimum I can score and still hit my target? It takes the grade you carry in from assignments and mid-terms, the percentage weight of the final paper, and your target overall grade, then returns the exact score required — in percent and in raw marks. It also lists the score needed for every grade band and shows what your overall grade would be at a range of possible exam scores.",
  "useCases": [
    "Work out the minimum final exam score that keeps your course grade at an A before you plan your revision hours.",
    "Check whether a target is still mathematically reachable after a weak mid-term, so you can prioritise other papers.",
    "Convert the required percentage into actual marks on a 60-mark or 75-mark paper."
  ],
  "benefits": [
    [
      "Honest about impossible targets",
      "If even a perfect paper falls short, the tool says 'not reachable' instead of printing a score above 100%."
    ],
    [
      "All grade bands at once",
      "See the score needed for A, B, C, D and a bare pass in a single view, not one calculation at a time."
    ],
    [
      "What-if table",
      "Scan the overall grade you would land on at 40%, 60%, 80% or a perfect paper before you decide how hard to push."
    ]
  ],
  "faqs": [
    [
      "How do I calculate the score I need on my final exam?",
      "Use needed = (target - current x (1 - weight)) / weight, where weight is the final's share as a decimal. With a 72% current grade, a 40% weight and an 80% target, you need (80 - 72 x 0.6) / 0.4 = 92%."
    ],
    [
      "What does 'current grade' mean here?",
      "It is your weighted average across everything graded so far — assignments, quizzes and mid-terms — expressed as a percentage of the marks available in those components, not of the whole course."
    ],
    [
      "What if my result says the score needed is 0 or negative?",
      "It means your target is already locked in: even a zero on the final leaves you at or above it. The tool displays 0% and flags the target as already secured."
    ],
    [
      "Does this account for a minimum pass mark in the final paper itself?",
      "No. Many syllabi require a separate minimum in the end-semester paper regardless of internal marks, so check your course handbook before treating a low required score as safe."
    ]
  ]
};

export default seo;
