const seo = {
  title: "Silly Mistake Tracker: Mock Test Marks-Lost Trend",
  metaDescription:
    "Log avoidable errors per mock in six categories — misreads, calc slips, wrong bubbles — and see marks lost, your worst category and first-to-latest trend.",
  steps: [
    "Set Marks lost per silly mistake (e.g. 5 for a +4/−1 MCQ answered wrong instead of right), then log each mock's counts across the six categories from Misread the question to Time-pressure guess.",
    "Press Add mock after every test and Remove mock to drop one; blank category counts are treated as 0.",
    "Read the latest mock's mistake count and marks lost, the trend versus your first mock, and the worst-category table with its Fix column, then press Copy result.",
  ],
  intro:
    "The Silly Mistake Tracker applies the classic error-log method to mock tests: after each mock you log avoidable errors under six process categories — misread question, calculation slip, sign/unit error, wrong bubble, ignored instruction and time-pressure guess — and the tool computes marks lost per mock, the trend from your first to latest mock, and which category costs you most. It is for JEE, NEET, CAT, banking and board-exam aspirants whose scores leak marks to errors they already knew how to avoid.",
  useCases: [
    "A JEE aspirant logging 14 silly mistakes in Mock 1 and checking three mocks later whether the count is actually falling",
    "A NEET repeater quantifying that calculation slips alone cost 20+ marks per paper before changing rough-work habits",
    "A CAT taker separating knowledge gaps from process errors so revision time goes to the right problem",
  ],
  benefits: [
    ["Marks, not vibes", "Each mistake is converted to marks lost using your exam's marking scheme, so the damage is concrete."],
    ["Trend across mocks", "First-to-latest change in count and percentage shows whether your fixes are working."],
    ["Category-specific fixes", "Every category ships with the standard corrective habit, targeted at your worst one."],
  ],
  faqs: [
    [
      "How do I stop making silly mistakes in exams?",
      "Track them by category, then attack the single worst category with a specific habit — underlining what the question asks for misreads, doing arithmetic on paper for calculation slips, matching question numbers to the answer sheet every few questions for bubbling errors. Untracked mistakes repeat; the error-log method works because it turns a vague problem into one measurable behaviour at a time.",
    ],
    [
      "What counts as a silly mistake versus a knowledge gap?",
      "A silly mistake is a question you could have answered correctly with the knowledge you already had — you misread it, slipped in arithmetic, dropped a sign or unit, bubbled the wrong option, ignored an instruction, or guessed under time pressure. If you did not know the concept or formula, that is a knowledge gap and belongs in your revision plan, not this log.",
    ],
    [
      "How many marks do silly mistakes cost in an exam like JEE or NEET?",
      "Multiply your mistake count by the marks swing per question — in a +4/−1 MCQ pattern, answering wrong instead of right swings 5 marks, so even 6 silly mistakes can cost 30 marks, often more than an entire chapter's weight. Enter your exam's own scheme in the tracker to see your personal figure per mock.",
    ],
    [
      "How should I use an error log across mock tests?",
      "Log every avoidable error within an hour of finishing the mock while you remember why it happened, review the worst category the day before the next mock, and watch the first-to-latest trend rather than any single paper. A falling count across three or more mocks means the habit is sticking; a flat count means the fix needs to change.",
    ],
  ],
};

export default seo;
