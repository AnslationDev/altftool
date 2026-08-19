const seo = {
  title: "VTU CGPA to Percentage: 2018 vs 2022 Scheme",
  metaDescription:
    "(CGPA - 0.75) x 10 for 2015/2017/2018 CBCS, CGPA x 10 for 2021/2022. Pick your scheme and get the percentage, class awarded and SGPA from credits.",
  steps: [
    "Enter Your CGPA (0 to 10) and choose the Scheme on your grade card: '2015 / 2017 / 2018 CBCS scheme - (CGPA - 0.75) x 10', '2021 / 2022 scheme - CGPA x 10', or 'UGC equivalence - CGPA x 9.5'.",
    "There is no Convert button - the Percentage headline recalculates as you type, above the Formula applied, Class awarded and 'Marks lost to the 0.75 deduction' rows.",
    "If you still need the CGPA itself, press Add a subject under 'SGPA from this semester's subjects' and set credits plus a grade point from the O to F dropdown, or Add a semester under 'CGPA from all semesters', then press Copy result.",
  ],
  intro:
    "VTU converts a 10-point CGPA to a percentage with a linear rule that depends on your scheme: grade cards under the 2015, 2017 and 2018 CBCS schemes use (CGPA − 0.75) × 10, while 2021 and 2022 scheme cards use a plain CGPA × 10. This converter applies whichever rule matches your card, builds SGPA from subject credits and grade points, aggregates semesters into CGPA, and shows the class awarded. Because the 0.75 deduction costs a flat 7.5 percentage points, picking the wrong rule can push you either side of a 60% or 70% placement cutoff.",
  useCases: [
    "Convert a 2018-scheme B.E. CGPA of 8.24 into the 74.9% figure a company's application form expects.",
    "Compute SGPA for a semester where the subjects carry 4, 4, 3 and 2 credits at different grade points.",
    "Find the exact CGPA needed to clear a 70% placement eligibility bar under your own scheme.",
  ],
  benefits: [
    ["Scheme-aware", "Applies the deduction only where the scheme actually uses it, instead of assuming one formula for everyone."],
    ["Grade points built in", "The subject grade dropdown carries VTU's O to F letters with their mark bands, so no lookup table is needed."],
    ["Cutoff planning", "Shows the CGPA behind each common placement percentage and how far short you are."],
  ],
  faqs: [
    [
      "What is the VTU CGPA to percentage formula?",
      "For the 2015, 2017 and 2018 CBCS schemes it is (CGPA − 0.75) × 10, so a CGPA of 8.0 becomes 72.5%. Grade cards issued under the 2021 and 2022 schemes state a plain CGPA × 10, which turns the same 8.0 into 80%.",
    ],
    [
      "How is SGPA calculated in VTU?",
      "SGPA is the sum of each subject's credits multiplied by its grade point, divided by the total credits in that semester. A subject worth 4 credits at grade point 9 contributes 36 points, so heavier subjects move the SGPA more than lighter ones.",
    ],
    [
      "What percentage is First Class with Distinction in VTU?",
      "70% and above is generally shown as First Class with Distinction, 60% to below 70% as First Class and 50% to below 60% as Second Class. Under the deducting rule that means CGPA 7.75 for Distinction and CGPA 6.75 for First Class.",
    ],
    [
      "Which VTU formula should I write on a job application?",
      "Use the formula printed on your own grade card or provisional degree certificate, since that is the document an employer will verify against. If neither states a formula, ask the VTU examination section for a conversion certificate rather than choosing the rule that flatters your score.",
    ],
  ],
};

export default seo;
