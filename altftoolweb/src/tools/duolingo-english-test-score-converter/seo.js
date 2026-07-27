const seo = {
  intro:
    "This converter maps a Duolingo English Test (DET) overall score — reported from 10 to 160 in 5-point increments — to its IELTS band using the concordance Duolingo publishes, plus the matching CEFR level (A1 to C1) and a TOEFL iBT range derived by chaining Duolingo's IELTS mapping with the ETS TOEFL–IELTS linking table. Applicants who took the DET for university admission use it to see how their score reads against IELTS- or TOEFL-based requirements.",
  useCases: [
    "An applicant with DET 120 checking whether it satisfies a university's IELTS 6.5 minimum before paying for another test",
    "A student comparing DET, IELTS and TOEFL requirements across universities to pick the cheapest test that clears all of them",
    "A counsellor translating a client's DET 105 into the CEFR level a European university lists in its admission rules",
  ],
  benefits: [
    ["Published concordance", "The IELTS mapping is Duolingo's own comparison scale — DET 115–120 aligning with IELTS 7.0 — not a guess."],
    ["CEFR included", "See the A1–C1 level Duolingo assigns to each score range, useful for European admissions."],
    ["Transparent TOEFL estimate", "The TOEFL range is clearly labelled as derived via the ETS linking table, not presented as official."],
  ],
  faqs: [
    [
      "What Duolingo score is equal to IELTS 7?",
      "115–120 on the Duolingo English Test aligns with IELTS band 7.0 under Duolingo's published concordance, with 105–110 matching 6.5 and 125–130 matching 7.5. Universities set their own DET cutoffs, and many that ask IELTS 6.5–7.0 list DET requirements between 110 and 125.",
    ],
    [
      "Is a 120 on the Duolingo English Test good?",
      "Yes — 120 aligns with IELTS 7.0 and CEFR B2 under Duolingo's published scales, which clears the English requirement at many universities. Highly competitive programmes often ask for 125–135, so check each institution's stated minimum.",
    ],
    [
      "How is the Duolingo English Test scored?",
      "The DET reports an overall score from 10 to 160 in 5-point increments, produced by an automated scoring system across the adaptive test, alongside subscores (Literacy, Conversation, Comprehension, Production) on the same scale. There is no pass mark — each institution sets its own required score.",
    ],
    [
      "Can I convert a Duolingo score to TOEFL officially?",
      "There is no single official Duolingo-to-TOEFL table from ETS; this tool derives the TOEFL range by mapping the DET score to an IELTS band with Duolingo's concordance and then to the TOEFL range for that band from the ETS TOEFL–IELTS linking study. Treat the result as an approximation and rely on the score type each university actually accepts.",
    ],
  ],
};

export default seo;
