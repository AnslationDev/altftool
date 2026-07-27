const seo = {
  intro:
    "This calculator measures AKTU attendance — attended ÷ held × 100 — against the 75% minimum AKTU's ordinances set for end-semester exam eligibility. It reports the shortage in both percent and classes, solves (attended + n) ÷ (held + n) ≥ 75% for the exact consecutive classes needed to recover, and, given the classes still left in the semester, tells you whether 75% is even reachable and how many future classes you can safely miss.",
  useCases: [
    "A B.Tech student at 68% mid-semester finding the exact number of consecutive classes that gets them back to 75%",
    "Checking before a planned absence how many classes can be missed without dipping below the AKTU line",
    "Entering the classes left before the detained list is prepared to see whether full attendance from today can still save the semester",
  ],
  benefits: [
    ["Shortage in real units", "Reports how many class attendances short of 75% you are, not just a percentage gap."],
    ["Exact recovery count", "Solves the recovery inequality precisely — no rule-of-thumb estimates."],
    ["Semester-end projection", "Uses the remaining classes to say whether 75% is still mathematically reachable and what buffer is left."],
  ],
  faqs: [
    [
      "What is the minimum attendance required in AKTU?",
      "75% of the classes held in the semester, per AKTU's ordinances, to be eligible for the end-semester examinations. Institutes prepare the detained list from their own registers, and any relaxation on medical or similar genuine grounds is discretionary, documented and decided by the institute and university — not something to plan around.",
    ],
    [
      "How do I calculate how many classes I need to reach 75% attendance?",
      "Solve (attended + n) ÷ (held + n) ≥ 0.75, which gives n ≥ (0.75 × held − attended) ÷ 0.25. At 82 of 120 classes (68.33%), that is n ≥ (90 − 82) ÷ 0.25 = 32 consecutive classes. Every additional class you miss during recovery pushes the number up further.",
    ],
    [
      "Can AKTU attendance shortage make me ineligible even if my marks are good?",
      "Yes. Attendance eligibility is independent of internal or external marks — a student below the required percentage is detained from the end-semester exam regardless of academic performance, and the subject then has to be taken when next offered.",
    ],
    [
      "Is it possible to recover attendance late in the semester?",
      "Only if enough classes remain: attending every remaining class gives a best-possible finish of (attended + remaining) ÷ (held + remaining). If that value is below 75%, no amount of attendance can recover the shortfall — this tool computes exactly that ceiling so you know before it is too late.",
    ],
  ],
};

export default seo;
