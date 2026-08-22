const seo = {
  title: "Police Exam Score Calculator: Negative Marking",
  metaDescription:
    "Score a constable paper from your correct and wrong counts: UP 2 marks with -0.5, Delhi 1 with -0.25, Bihar no-negative, or your own scheme.",
  steps: [
    "Pick your paper from the Exam list — \"UP Police Constable — 150 Q × 2 marks, −0.5\", \"Delhi Police Constable (SSC) — 100 Q × 1 mark, −0.25\", \"Bihar Police Constable — 100 Q × 1 mark, no negative\" — or Custom to type your own scheme.",
    "Enter \"Correct answers (per the key)\" and \"Wrong answers (per the key)\"; editing Total questions, Marks per correct answer or Marks deducted per wrong answer switches the Exam list to Custom on its own.",
    "Estimated score recalculates as you type, showing marks out of the paper total with Marks earned, Marks deducted, Attempted / unattempted, Accuracy on attempted and the Break-even accuracy for guessing; \"Copy result\" puts that summary on the clipboard.",
  ],
  intro:
    "This scorer computes a state police written exam result from your counts of correct and wrong answers using the universal formula: score = correct × marks-per-question − wrong × negative-marking. Presets carry real schemes — UP Police Constable's 150 questions at 2 marks with 0.5 deducted per wrong answer, Delhi Police (SSC) at 1 mark with −0.25, and Bihar's no-negative 100-mark paper — and a custom mode accepts any scheme from your notification. Candidates checking a released answer key get the exact total, the deduction, and their accuracy.",
  useCases: [
    "Tallying a UP Police Constable response sheet against the official key to estimate a score out of 300",
    "Checking how much the 0.25 negative marking cost in a Delhi Police (SSC) attempt",
    "Entering a custom scheme from any state notification the day the provisional key drops",
  ],
  benefits: [
    ["Real marking schemes", "UP, Bihar, Delhi, Rajasthan and MP constable patterns are preset from board notifications, with custom for everything else."],
    ["Deduction made visible", "Marks earned and marks lost are shown separately, so you see exactly what negative marking cost."],
    ["Guessing maths included", "Shows how many wrong answers cancel one correct and the break-even accuracy for attempting doubtful questions."],
  ],
  faqs: [
    [
      "How is the UP Police Constable exam scored?",
      "150 questions of 2 marks each for a 300-mark paper, with 0.5 mark deducted per wrong answer per the UPPRPB notification — so score = correct × 2 − wrong × 0.5, and four wrong answers wipe out one correct one.",
    ],
    [
      "Which police exams have no negative marking?",
      "Bihar Police Constable (CSBC) and MP Police Constable are prominent no-negative papers of 100 questions at 1 mark each. With no penalty, leaving a question blank is never better than guessing. Schemes do change between cycles, so always confirm in the current notification.",
    ],
    [
      "How many wrong answers cancel one correct answer with 1/4 negative marking?",
      "Four. When the deduction is one quarter of a question's marks — as in Delhi Police (0.25 of 1) or UP Police (0.5 of 2) — every four wrong answers erase the credit of one correct answer.",
    ],
    [
      "Is it worth guessing when there is negative marking?",
      "Only above the break-even accuracy, which equals penalty ÷ (marks + penalty). With 1 mark and −0.25 that is 20%: pure four-option guessing sits at 25%, slightly above break-even, and eliminating even one option pushes the odds further in your favour. This tool shows the break-even figure for whatever scheme you enter; the official scorecard, after key revisions and any normalisation, is what finally counts.",
    ],
  ],
};

export default seo;
