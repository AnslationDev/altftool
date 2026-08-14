const seo = {
  title: "Bank Exam Negative Marking Calculator (0.25 Penalty)",
  metaDescription:
    "Scores IBPS and SBI prelims section by section with the one-fourth penalty, and shows marks lost, net score and where the cutoff sits.",
  steps: [
    "Pick an Exam pattern: IBPS PO Prelims, IBPS Clerk Prelims, SBI PO Prelims or IBPS RRB Officer Scale I Prelims.",
    "For English Language, Quantitative Aptitude and Reasoning give Questions attempted and Accuracy (%), then set Extra questions guessed and Options left standing on a guess.",
    "Read Net score after penalty against the Cutoff you are aiming at, with the Attempted / Correct / Lost / Net table per section, then press Copy result.",
  ],
  intro:
    "This banking negative marking calculator converts section-wise attempts and accuracy into the net score an IBPS or SBI objective test actually awards, applying the official penalty of one-fourth of a question's marks for every wrong answer. It scores English, Quantitative Aptitude and Reasoning separately because sectional timing forces separate attempt decisions, then totals the marks earned against the marks surrendered. Since these papers carry five options and a 0.25 deduction, a blind guess is worth exactly zero on average — the tool shows how much elimination changes that.",
  useCases: [
    "Reviewing a prelims mock where 82 attempts at 78% accuracy produced a lower net score than 68 attempts at 90%.",
    "Working out how far a section-wise attempt plan lands from last year's cutoff before the next practice test.",
    "Testing whether ruling out two of five options makes those borderline questions worth answering.",
  ],
  benefits: [
    ["Section-wise, like the real paper", "Sectional timing means each section needs its own attempt call, so each is scored on its own."],
    ["Shows marks surrendered", "The deduction appears as its own figure instead of hiding inside a net total."],
    ["Covers PO, Clerk and RRB patterns", "Question counts and durations follow the published structure of each prelims paper."],
  ],
  faqs: [
    [
      "How much negative marking is there in IBPS and SBI exams?",
      "One-fourth of the marks assigned to a question is deducted for each wrong answer in the objective tests. On a one-mark question that is 0.25 marks. Questions left unanswered carry no penalty, and the descriptive paper is not subject to the deduction.",
    ],
    [
      "Is guessing worth it in bank exams?",
      "A blind guess is exactly break-even, not profitable. These papers have five options, so a random pick is right 20% of the time: 0.2 × 1 − 0.8 × 0.25 = 0 marks. Ruling out one option lifts the expected value to about +0.06 and ruling out three lifts it to +0.375, so only eliminated-option guesses actually pay.",
    ],
    [
      "What accuracy do I need for attempting to be profitable?",
      "20%. With a deduction of one-fourth, answering breaks even at an accuracy of 0.25 ÷ 1.25. In practice aim far higher — because cutoffs are decided by net marks, most selected candidates in prelims combine a moderate attempt count with accuracy above 85%.",
    ],
    [
      "Does negative marking apply to the descriptive paper?",
      "No. The one-fourth penalty applies only to the objective tests. The descriptive paper in mains, such as the letter and essay section, is evaluated on its own and no marks are deducted for weak answers, though it is separately qualifying in most recruitments.",
    ],
  ],
};

export default seo;
