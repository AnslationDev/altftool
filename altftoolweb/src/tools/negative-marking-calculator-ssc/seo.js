const seo = {
  title: "SSC Negative Marking Calculator — CGL & CHSL Net Score",
  metaDescription:
    "Net score under real SSC schemes — CGL Tier-I's −0.50 of 2 marks means four wrong answers erase one correct — plus marks lost and break-even accuracy.",
  steps: [
    "Pick an 'Exam' preset — SSC CGL Tier-I (100 Q × 2 marks, −0.50), CGL Tier-II Paper-I, CHSL Tier-I, CPO Paper-I, MTS — or a custom scheme.",
    "Enter your 'Correct answers' and 'Wrong answers' counts (defaults 70 and 20).",
    "Read 'Marks lost to wrong answers' with the net score, break-even guessing accuracy and the 'How the penalty compounds' table, then press 'Copy result'.",
  ],
  intro:
    "This calculator quantifies what negative marking costs in SSC exams using the formula net score = correct × marks − wrong × penalty. SSC CGL and CHSL Tier-I deduct 0.50 of each question's 2 marks per wrong answer, CGL Tier-II deducts 1 of 3, and CPO deducts 0.25 of 1 — so in the Tier-I scheme every four wrong answers erase one correct answer. Aspirants get the marks lost, the net score, and the break-even accuracy that tells them when attempting a doubtful question still pays.",
  useCases: [
    "Estimating a CGL Tier-I score of 70 correct and 20 wrong: 140 earned minus 10 lost, net 130 of 200",
    "Seeing how many Tier-II marks a risky 15-question guessing spree could burn at −1 per wrong",
    "Deciding whether to attempt 50-50 questions by comparing your accuracy with the 20% break-even line",
  ],
  benefits: [
    ["Real SSC schemes", "CGL Tier-I and Tier-II, CHSL and CPO penalties are preset from SSC's notifications, plus a fully custom mode."],
    ["Loss made concrete", "Marks lost and 'correct answers cancelled' are shown separately from marks earned."],
    ["Attempt strategy", "Break-even guessing accuracy per scheme shows exactly when leaving a question blank beats guessing."],
  ],
  faqs: [
    [
      "How much is the negative marking in SSC CGL?",
      "Tier-I deducts 0.50 mark for each wrong answer against 2 marks for a correct one (100 questions, 200 marks). Tier-II Paper-I deducts 1 mark against 3 for a correct answer. Both are a fraction of the question's marks — one-fourth and one-third respectively.",
    ],
    [
      "How many wrong answers cancel one correct answer in SSC CGL Tier-I?",
      "Four. Each wrong answer costs 0.50 mark and each correct answer earns 2, so 4 wrong answers (−2 marks) exactly cancel 1 correct answer. In Tier-II, where the ratio is 1 to 3, three wrong answers cancel one correct.",
    ],
    [
      "Is it better to guess or leave a question blank in SSC exams?",
      "Guess whenever your chance of being right beats the break-even accuracy, which is penalty ÷ (marks + penalty) — 20% for the Tier-I scheme (0.5 of 2.5). A blind guess among 4 options is 25%, already above break-even, and eliminating one option raises it to 33%. Leaving blank only wins when you truly cannot rule anything out and the format punishes attempts more heavily than SSC's does.",
    ],
    [
      "Does SSC normalise scores after applying negative marking?",
      "Yes. For multi-shift papers SSC first computes each candidate's raw net score (correct × marks − wrong × penalty) and then applies its published normalisation formula across shifts, so the scorecard figure can differ from your raw estimate. This calculator gives the raw score; the Commission's normalised marks are what count for the cut-off.",
    ],
  ],
};

export default seo;
