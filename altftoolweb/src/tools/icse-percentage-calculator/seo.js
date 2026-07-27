const seo = {
  intro:
    "This calculator computes ICSE and ISC percentages exactly as CISCE does: English is compulsory, and the aggregate averages English with your best 4 other subjects for ICSE (five subjects) or best 3 for ISC (four subjects). Enter marks out of 100, and the tool shows which subjects were counted, which were dropped, and whether every subject clears the pass mark — 33% for ICSE and 35% for ISC.",
  useCases: [
    "An ICSE student with seven subjects finding the official best-of-five percentage (English + best 4) for Class 11 admission cut-offs",
    "An ISC student averaging English with their best 3 electives to quote the percentage colleges and DU-style cut-off lists use",
    "Checking whether a low score in Geography is dropped from the aggregate or drags the percentage down",
  ],
  benefits: [
    ["The actual CISCE rule", "English compulsory plus best 4 (ICSE) or best 3 (ISC) — not a plain average of everything."],
    ["Shows counted vs dropped", "Each subject is labelled as counted in the aggregate or dropped, so the arithmetic is transparent."],
    ["Correct pass marks", "Applies 33% for ICSE and 35% for ISC, the standards CISCE has used since the 2019 examinations."],
  ],
  faqs: [
    [
      "How is ICSE percentage calculated?",
      "Average English with your best 4 other subjects: add the five marks and divide by 5. For example, English 89 with best-four scores of 95, 92, 90 and 85 gives 451 ÷ 5 = 90.2%. English is always counted, however you scored in it — only the non-English subjects compete for the best-4 slots.",
    ],
    [
      "How is ISC percentage calculated?",
      "Average English with your best 3 other subjects: add the four marks and divide by 4. English 80 with best-three scores of 92, 88 and 70 gives 330 ÷ 4 = 82.5%. This English-plus-best-3 figure is what most college admission lists mean by an ISC percentage.",
    ],
    [
      "What are the passing marks in ICSE and ISC?",
      "33% per subject in ICSE and 35% per subject in ISC. CISCE lowered these from 35% and 40% respectively with effect from the 2019 examinations. A subject below the pass mark still appears on the marksheet, and the tool flags it even if it is dropped from the best-subject aggregate.",
    ],
    [
      "Is English compulsory in the ICSE best of five?",
      "Yes. CISCE's aggregate always includes English and then takes the best 4 of the remaining subjects for ICSE (best 3 for ISC), so a weak English score cannot be dropped. That is the key difference from CBSE's best-of-five convention, where the five highest scores are simply averaged.",
    ],
  ],
};

export default seo;
