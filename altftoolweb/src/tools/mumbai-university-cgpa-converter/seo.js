const seo = {
  title: "Mumbai University CGPA to Percentage: 7.1 x CGPA + 11",
  metaDescription:
    "Reproduces Mumbai University's CBCGS map, 7.1 x CGPA + 11, and computes the aggregate percentage from raw semester marks for the post-repeal route.",
  steps: [
    "Type Your CGPA (0 to 10) and pick a Conversion rule: the CBCGS formula 7.1 x CGPA + 11, Plain multiply CGPA x 10, or UGC equivalence CGPA x 9.5.",
    "For the post-repeal route, fill Semester marks obtained and Semester marks out of under Percentage from raw semester marks.",
    "Read the Percentage with Class on this percentage and Range this formula can produce, then press Copy result.",
  ],
  intro:
    "Mumbai University's Choice Based Credit and Grading System converts CGPA to percentage with an affine map — Percentage = 7.1 × CGPA + 11 — rather than the plain multiply most universities use, because CBCGS awards grade point 10 from 80 marks upward. This converter reproduces that figure for grade cards that carry it, computes the aggregate percentage straight from raw semester marks for the post-repeal route, and builds CGPA from course credits and grade points. The formula was repealed with effect from 1 January 2026, so the marks-based path matters as much as the formula now.",
  useCases: [
    "Reproduce the percentage printed on a CBCGS engineering grade card when a form asks you to show the working.",
    "Compute an aggregate percentage from six semesters of marks obtained and marks out of, the way the university now does it.",
    "Check which class a CGPA falls into before applying to a course with a 60% First Class requirement.",
  ],
  benefits: [
    ["Both routes covered", "The affine CBCGS formula for old grade cards and a marks-based aggregate for the current position."],
    ["Shows the formula's real range", "Makes clear that 7.1 × CGPA + 11 tops out at 82% and bottoms at 11%, which surprises most first-time users."],
    ["Grade table on hand", "The CBCGS letters with their mark bands, so a grade card can be typed in without a separate lookup."],
  ],
  faqs: [
    [
      "What is the Mumbai University CGPA to percentage formula?",
      "Percentage = 7.1 × CGPA + 11 under the Choice Based Credit and Grading System, so a CGPA of 8.00 gives 67.8%. The university repealed this formula with effect from 1 January 2026, after which the percentage is computed from actual marks.",
    ],
    [
      "Why is the Mumbai University formula 7.1 and not 10?",
      "Because CBCGS grade bands are not evenly spaced against marks — grade point 10 begins at 80 marks and grade point 4 at 40 — so multiplying by 10 would credit a top grade with marks nobody had to score. The 7.1 slope and 11 intercept fit the map to those bands.",
    ],
    [
      "How do I get a percentage now that the formula has been repealed?",
      "Add up the marks obtained across all semesters, divide by the total marks the semesters were out of, and multiply by 100. Colleges compute it this way and the university issues a conversion certificate on request.",
    ],
    [
      "What CGPA counts as First Class at Mumbai University?",
      "Under the 7.1 × CGPA + 11 map, 60% needs a CGPA of about 6.90 and 70% needs about 8.31. Class bands vary by faculty and programme, so confirm the threshold your own course applies before relying on it for an application.",
    ],
  ],
};

export default seo;
