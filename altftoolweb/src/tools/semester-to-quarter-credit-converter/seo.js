const seo = {
  intro:
    "This converter translates college credits between the semester and quarter systems using the standard US registrar ratio of 1 semester credit = 1.5 quarter credits, which follows from the ~15-week semester versus ~10-week quarter term length. It works in both directions and shows what share of a typical bachelor's degree (120 semester or 180 quarter credits) your credits represent. It is built for transfer students moving between quarter-system schools (like many UC and Washington campuses) and semester-system schools.",
  useCases: [
    "A community-college student on semesters checking how 60 semester credits land at a quarter-system university (90 quarter credits)",
    "A UC transfer applicant converting 90 quarter credits back to the 60 semester credits an out-of-state school expects",
    "A degree auditor verifying that a mixed transcript still totals the 120-semester-credit graduation requirement",
  ],
  benefits: [
    ["Standard registrar ratio", "Uses the 1 : 1.5 semester-to-quarter conversion published by university transfer offices."],
    ["Both directions", "Semester to quarter and quarter to semester, with a one-tap swap."],
    ["Degree context", "Shows your credits as a percentage of a typical 120/180-credit bachelor's."],
  ],
  faqs: [
    [
      "How do I convert semester credits to quarter credits?",
      "Multiply by 1.5 — so a 3-semester-credit course equals 4.5 quarter credits, and 60 semester credits equal 90 quarter credits. The ratio comes from term length: a semester runs about 15 weeks against a quarter's 10, so each semester credit represents 1.5 times the instructional weeks.",
    ],
    [
      "How many quarter credits equal a bachelor's degree?",
      "About 180 quarter credits, which is the same workload as the 120 semester credits required at semester-system schools. Both represent roughly four years at 15 credits per term in the respective system.",
    ],
    [
      "Do I lose credits transferring from a quarter to a semester school?",
      "The arithmetic itself loses nothing — 90 quarter credits convert to exactly 60 semester credits. Losses happen at the course level: a 4-quarter-credit course becomes 2.67 semester credits, which may fall short of a 3-credit requirement, and the receiving school decides how fractional credits and course equivalencies are treated.",
    ],
    [
      "Which US universities use the quarter system?",
      "A minority and shrinking group, including most University of California undergraduate campuses (except Berkeley and Merced), the University of Washington, Oregon State, Stanford and many Washington/Oregon community colleges. The large majority of US institutions run semesters, which is why this conversion appears in almost every transfer evaluation.",
    ],
  ],
};

export default seo;
