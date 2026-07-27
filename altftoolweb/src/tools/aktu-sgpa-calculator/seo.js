const seo = {
  intro:
    "SGPA at AKTU is the credit-weighted average of your grade points for one semester: multiply each subject's credits by its grade point, add them up, and divide by the total credits registered. This calculator does that on AKTU's 10-point scale (A++ = 10 down to F = 0), converts the result using the university's own equivalence of percentage = (CGPA − 0.75) × 10, and separates credits earned from credits lost to carry-over papers. It also rolls the new semester into your running CGPA.",
  useCases: [
    "Checking your SGPA the moment AKTU declares results, before the formal grade sheet is downloadable",
    "Working out the percentage figure to type into a placement portal that will not accept a CGPA",
    "Testing how much a single carry-over paper drags the semester average down before the back-paper exam",
  ],
  benefits: [
    ["Credit weighting, not a plain average", "A 4-credit subject moves the SGPA twice as much as a 2-credit one."],
    ["Earned credits shown separately", "F-grade subjects stay in the denominator but add nothing, so the shortfall is visible."],
    ["Percentage on AKTU's own rule", "Uses the (CGPA − 0.75) × 10 equivalence rather than an arbitrary multiplier."],
  ],
  faqs: [
    [
      "How is SGPA calculated in AKTU?",
      "SGPA = Σ(credits × grade point) ÷ Σ(credits) for that semester. With subjects of 4, 3, 3, 2 and 1 credits graded 9, 8, 10, 7 and 6, the credit points are 36 + 24 + 30 + 14 + 6 = 110 over 13 credits, giving an SGPA of 8.46.",
    ],
    [
      "How do I convert AKTU CGPA to percentage?",
      "AKTU's published equivalence is percentage = (CGPA − 0.75) × 10, so a CGPA of 8.00 is 72.5% and a CGPA of 7.50 is 67.5%. Use the CGPA, not a single semester's SGPA, when a form asks for your overall percentage.",
    ],
    [
      "What are the AKTU grade points?",
      "A++ carries 10 points, A+ 9, A 8, B+ 7, B 6, C 5, D 4 and F 0, against mark bands of 90+, 80–89, 70–79, 60–69, 50–59, 45–49, 40–44 and below 40. The points are what drive the SGPA; the mark boundaries can differ slightly between scheme documents, so confirm yours.",
    ],
    [
      "Does a back paper affect my SGPA?",
      "Yes. An F carries 0 grade points but its credits still count in the denominator, so the SGPA falls and those credits are not earned until you clear the back paper. Once you pass, the improved grade replaces the F in the revised result and the credits are added to your earned total.",
    ],
  ],
};

export default seo;
