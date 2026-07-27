const seo = {
  intro:
    "SPPU computes SGPA as the credit-weighted mean of your grade points for one semester — the sum of credits multiplied by grade points, divided by total credits — and CGPA as the same weighted mean across every semester, using each semester's credit load as the weight. This calculator applies both formulas on SPPU's 10-point letter scale (O = 10 down to F = 0) and shows how far the correct credit-weighted CGPA sits from the plain average of SGPAs that students often calculate by mistake. It also works backwards to the SGPA you need in your remaining credits to land on a target CGPA.",
  useCases: [
    "Confirming an SGPA the day results are declared, before the official grade card is available on the portal",
    "Finding the average SGPA needed over the remaining semesters to finish with an 8.5 CGPA",
    "Seeing how many credits a single F grade removes from your earned-credit total",
  ],
  benefits: [
    ["Credit-weighted CGPA", "Weights each semester by its credits instead of averaging SGPAs, which is the usual error."],
    ["Backlog impact made explicit", "Separates credits registered from credits earned so a 0-point course is visible."],
    ["Target planner", "Shows the SGPA the remaining credits must average, and flags targets that exceed a 10-point maximum."],
  ],
  faqs: [
    [
      "How is SGPA calculated in SPPU?",
      "Multiply each course's credits by its grade point, add the products, and divide by the total credits registered that semester. Courses of 4, 3, 3, 2 and 2 credits graded 9, 8, 7, 10 and 6 give 113 credit points over 14 credits, an SGPA of 8.07.",
    ],
    [
      "Is CGPA just the average of all my SGPAs?",
      "Only when every semester carries exactly the same number of credits. CGPA is Σ(SGPA × semester credits) ÷ Σ(semester credits), so a 24-credit semester pulls the CGPA more than an 18-credit one, and the two methods typically differ by a few hundredths.",
    ],
    [
      "What are SPPU grade points?",
      "O carries 10 points, A+ 9, A 8, B+ 7, B 6, C 5, P 4, and both F and AB carry 0. The letter awarded depends on the marks band your faculty and pattern prescribe, but the point values above are what feed the SGPA formula.",
    ],
    [
      "How do I convert SPPU CGPA to a percentage?",
      "SPPU uses a conversion table published in its credit-system ordinance, not one fixed multiplier, and the table differs between patterns and faculties — so read the equivalence from your own ordinance or grade card rather than applying a generic formula. Any single-multiplier estimate you see online can be several percentage points out.",
    ],
  ],
};

export default seo;
