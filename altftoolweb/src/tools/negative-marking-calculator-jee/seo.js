const seo = {
  title: "JEE Main Negative Marking Calculator (+4 and -1)",
  metaDescription:
    "Project a JEE Main raw score out of 300 from Section A and Section B attempts, with marks lost to -1 and the best and worst guess outcomes.",
  steps: [
    "Under Section A — multiple choice enter MCQs in the paper, MCQs solved, Accuracy on solved MCQs (%), MCQs guessed and Options left standing on a guess.",
    "Under Section B — numerical value enter Numerical questions in the paper, Numerical questions solved, Accuracy on those (%) and Numerical answers typed on a hunch.",
    "Read the Expected raw score with its worst-to-best range, the What a guess is worth panel and the Break-even accuracy figure, then press Copy result.",
  ],
  intro:
    "This JEE negative marking calculator turns an attempt plan into an expected JEE Main raw score using the official +4 for correct and -1 for incorrect scheme applied to both Section A multiple-choice questions and Section B numerical-value questions. It models the two sections separately because a four-option MCQ guess carries a small positive expected value while a typed numerical answer you have not solved is a certain -1. The output separates marks earned from marks handed back, and shows the best and worst case across the questions you guessed.",
  useCases: [
    "A candidate deciding whether to fill in six shaky Section A options in the last five minutes or leave them blank.",
    "Comparing a high-attempt, low-accuracy strategy against a selective 45-question attempt at 90% accuracy on the same paper.",
    "Checking how many marks a habit of typing rough numerical answers is quietly costing across full-length mocks.",
  ],
  benefits: [
    ["Section A and B modelled apart", "MCQ guessing and numerical guessing behave completely differently and are scored separately."],
    ["Shows the cost, not just the total", "Marks lost to negative marking appear as their own line instead of disappearing into a net score."],
    ["Range, not a single number", "Every projection carries the worst and best outcome for the guessed block."],
  ],
  faqs: [
    [
      "Is there negative marking in JEE Main numerical questions?",
      "Yes. Since JEE Main 2023, Section B numerical-value questions carry -1 for a wrong answer, the same as Section A. Before that the section was penalty-free, which is why older strategy advice about attempting every numerical question no longer holds.",
    ],
    [
      "How many marks is JEE Main out of?",
      "300 marks from 75 questions in Paper 1 — 25 questions per subject, made up of 20 multiple-choice and 5 numerical-value questions, each worth 4 marks, over 180 minutes. The optional questions in Section B were withdrawn from JEE Main 2025.",
    ],
    [
      "Should I guess in JEE Main?",
      "On a four-option MCQ, yes: a blind guess averages 0.25 × 4 − 0.75 × 1 = +0.25 marks, and ruling out one option raises that to about +0.67. On a numerical question, no — there are no options, so an unsolved answer is effectively a guaranteed -1.",
    ],
    [
      "Does this give my NTA score or percentile?",
      "No. It gives the raw score out of 300. The NTA score on the scorecard is a normalised percentile calculated across all shifts of that session, so it depends on how every other candidate performed and cannot be worked out from raw marks alone.",
    ],
  ],
};

export default seo;
