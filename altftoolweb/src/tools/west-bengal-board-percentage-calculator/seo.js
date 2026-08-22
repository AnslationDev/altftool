const seo = {
  title: "West Bengal Board Percentage Calculator",
  metaDescription:
    "Madhyamik marks out of 700 with WBBSE letter grades; HS out of 500 with the best-five rule applied and the dropped elective named.",
  steps: [
    "Pick the exam - 'Madhyamik (WBBSE, class 10)' or Higher Secondary - then enter each subject's 'Marks scored' and 'Maximum marks', using 'Add subject' for a fourth elective.",
    "For Higher Secondary, tick 'Always counts (language paper)' on the two language rows; the best three remaining electives are added to make the 500-mark total and the dropped subject is named.",
    "Read the 'Aggregate percentage' with division, per-subject AA-D grades for Madhyamik and any subject below the pass mark, then press 'Copy result'.",
  ],
  intro:
    "West Bengal's two boards count marks differently, and this tool applies the right rule to each. Madhyamik under WBBSE totals all seven subjects out of 700 and reports a letter grade per subject on the AA to D bands, where D (below 25) is the fail band. Higher Secondary under WBCHSE totals only five subjects out of 500 — both compulsory languages plus the best three electives — so the weakest elective is dropped, which is exactly why students take a fourth optional elective as insurance.",
  useCases: [
    "Converting a Madhyamik grade sheet into the single percentage a class 11 admission form asks for",
    "Seeing which elective the Higher Secondary best-five rule will drop before the marksheet is issued",
    "Checking how many marks short a subject fell of the pass mark, to decide whether to apply for review or scrutiny",
  ],
  benefits: [
    ["Best-five rule applied automatically", "Languages are kept, the weakest elective is dropped, and the tool names the subject it dropped."],
    ["Per-subject grades for Madhyamik", "Each subject is placed on the AA, A+, A, B+, B, C, D bands as WBBSE reports them."],
    ["Pass check separate from percentage", "A subject below the pass mark is flagged even when the aggregate looks comfortable."],
  ],
  faqs: [
    [
      "How is the Madhyamik percentage calculated?",
      "Add the marks of all seven subjects and divide by 700, then multiply by 100. A total of 585 out of 700 is 83.57%. Unlike Higher Secondary, no subject is dropped from the Madhyamik total.",
    ],
    [
      "What is the best-five rule in West Bengal HS?",
      "The Higher Secondary total of 500 is made up of the two compulsory language papers plus the best three of the elective subjects. Because most students sit four electives, the lowest-scoring elective is left out of the total, though it still appears on the marksheet.",
    ],
    [
      "What is the pass mark in Madhyamik?",
      "25 marks out of 100 in a subject. Anything below that is grade D, which is the fail band, and the subject must be cleared before the candidate is declared passed regardless of the aggregate.",
    ],
    [
      "What are the Madhyamik grades?",
      "AA for 90 to 100, A+ for 80 to 89, A for 60 to 79, B+ for 45 to 59, B for 35 to 44, C for 25 to 34, and D below 25. The grade is per subject; the overall result is expressed as marks and percentage rather than a single letter.",
    ],
  ],
};

export default seo;
