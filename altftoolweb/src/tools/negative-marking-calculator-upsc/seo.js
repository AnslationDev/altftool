const seo = {
  title: "UPSC Negative Marking Calculator: 1/3 Penalty",
  metaDescription:
    "Score a tiered UPSC prelims attempt plan under the one-third penalty. Break-even accuracy is 25% — see which guesses add marks in GS Paper I or CSAT.",
  steps: [
    "Pick the Paper — GS Paper I at 2 marks a question or the qualifying CSAT paper at 2.5 — then enter Questions solved with knowledge and your Accuracy on those (%).",
    "Split the rest into Guesses with two options left, Guesses with three options left and Pure blind guesses, and set Your target or expected cutoff.",
    "Read the Expected score out of the paper total with its best-and-worst range, then the Which guesses are worth taking table, where each tier is marked Attempt, Neutral or Skip alongside the attempt count that maximises expected marks.",
  ],
  intro:
    "This UPSC negative marking calculator applies the Civil Services Preliminary Examination penalty — one-third of the marks assigned to a question, deducted for every wrong answer — to a tiered attempt plan and returns the expected score plus the attempt count that maximises it. Because the deduction is one-third, the break-even accuracy is exactly 25%, which is the same as the odds of a blind guess among four options, so a wild guess is mathematically neutral and only elimination makes attempting profitable. It covers both Paper I General Studies at 2 marks a question and the qualifying CSAT paper at 2.5 marks a question.",
  useCases: [
    "Deciding how many of the 30 borderline questions in a mock to attempt when two options can be ruled out and how many to leave blank.",
    "Checking whether an 85-attempt strategy at 70% accuracy beats a 65-attempt strategy at 85% accuracy on the same GS paper.",
    "Confirming a CSAT attempt plan still clears the 33% qualifying bar of 66 marks after the penalty is applied.",
  ],
  benefits: [
    ["Tiered, not a single accuracy figure", "Sure answers, two-option guesses, three-option guesses and blind guesses are scored separately."],
    ["Names the optimal attempt count", "Tiers with a negative expected value are identified so you know exactly which attempts to drop."],
    ["Handles both papers correctly", "GS Paper I uses 2 marks a question and CSAT uses 2.5, so the deduction differs and is calculated for each."],
  ],
  faqs: [
    [
      "How much is deducted for a wrong answer in UPSC prelims?",
      "One-third of the marks assigned to that question. In GS Paper I each question is worth 2 marks, so a wrong answer costs 0.67 marks; in CSAT each question is worth 2.5 marks, so it costs 0.83. Marking more than one option counts as wrong and carries the same penalty.",
    ],
    [
      "Is blind guessing worth it in UPSC prelims?",
      "It is exactly break-even, not profitable. With four options a blind guess is right 25% of the time, giving 0.25 × 2 − 0.75 × 0.67 = 0 expected marks in GS. Ruling out even one option turns the same guess positive, which is why elimination — not guessing volume — decides your score.",
    ],
    [
      "How many questions should I attempt in UPSC prelims?",
      "Attempt every question where you can eliminate at least one option, and leave the rest blank. There is no fixed number: the expected-value maths says any attempt with better than 25% accuracy adds marks and anything below 25% subtracts them, so the right count depends entirely on how many questions you can narrow down.",
    ],
    [
      "What are the qualifying marks for CSAT?",
      "33% of 200, which is 66 marks. CSAT is a qualifying paper only — clearing it is compulsory, but the marks do not count towards the prelims merit list, which is drawn from General Studies Paper I alone.",
    ],
  ],
};

export default seo;
