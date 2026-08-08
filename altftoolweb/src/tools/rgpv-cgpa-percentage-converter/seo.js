const seo = {
  title: "RGPV CGPA to Percentage: (CGPA - 0.75) x 10 Rule",
  metaDescription:
    "Applies the RGPV rule percentage = (CGPA - 0.75) x 10, reverses it to find the CGPA a cut-off needs, and builds a CGPA from credit-weighted SGPAs.",
  steps: [
    "Pick 'CGPA to percentage' or 'Percentage to CGPA', then type the figure into 'CGPA or SGPA (out of 10)' or 'Percentage of marks'.",
    "To start from semester results, fill Semester 1 SGPA and its Credits and add a row per semester so the cumulative CGPA is weighted by credits.",
    "Read the Equivalent percentage with 'Equivalent marks out of 1000', the division and the nearest letter grade, then press Copy result.",
  ],
  intro:
    "This converter turns an RGPV grade point average into the percentage of marks that application forms ask for, using the university's linear equivalence: percentage = (CGPA - 0.75) x 10. It works in both directions, so you can also recover the CGPA a required percentage implies, and it aggregates semester SGPAs into a credit weighted CGPA first if you only have semester results. Students at Rajiv Gandhi Proudyogiki Vishwavidyalaya use it when a recruiter, a scholarship portal or a postgraduate application will not accept a grade point figure.",
  useCases: [
    "A campus recruiter's form has a single percentage field and your RGPV mark sheet only prints a CGPA of 7.84.",
    "A postgraduate application demands a minimum of 60% and you want to know the CGPA that clears it before you apply.",
    "You have six semester SGPAs and their credits but no consolidated mark sheet yet, and need one cumulative figure.",
  ],
  benefits: [
    ["The published RGPV rule", "Uses the 0.75 offset RGPV applies, not a generic multiply-by-ten shortcut."],
    ["Works backwards too", "Enter a cut-off percentage and see the exact CGPA that meets it."],
    ["Credit weighted aggregation", "Semester SGPAs are combined by credits, the way a consolidated mark sheet does it."],
  ],
  faqs: [
    [
      "How do I convert RGPV CGPA to percentage?",
      "Subtract 0.75 from the CGPA and multiply by 10. A CGPA of 7.84 becomes (7.84 - 0.75) x 10 = 70.9%, and a CGPA of 8.0 becomes 72.5%. The same rule converts a single semester SGPA.",
    ],
    [
      "Why does RGPV subtract 0.75 instead of just multiplying by 10?",
      "Because each letter grade covers a band of marks and the grade point is pegged near the top of that band. Multiplying a grade average by 10 would therefore overstate the marks, so the 0.75 offset pulls the figure back towards the middle of the band the grade represents.",
    ],
    [
      "What CGPA equals 60% at RGPV?",
      "6.75. Reversing the formula gives CGPA = (percentage / 10) + 0.75, so 60% needs 6.75 and 75% needs 8.25. Those are the two thresholds most first division and distinction requirements sit on.",
    ],
    [
      "Will a company accept this converted percentage?",
      "Usually yes, because it is the university's own published equivalence, but some employers and foreign universities insist on a percentage certified by the institution. If a form warns that self-calculated figures will be rejected, request an official equivalence certificate from the RGPV examination section before submitting.",
    ],
  ],
};

export default seo;
