const seo = {
  title: "Anna University CGPA to Percentage Converter",
  metaDescription:
    "Convert CGPA with the x10 rule, the (CGPA - 0.5) x 10 variant or UGC x 9.5, build CGPA from semester credits, and check the 8.50 / 7.00 class.",
  steps: [
    "Enter 'Your CGPA (0 to 10)' and pick a Conversion rule — Anna University standard (Percentage = CGPA x 10), the Deducted variant ((CGPA - 0.5) x 10) or UGC equivalence (CGPA x 9.5).",
    "Tick 'Passed every subject at the first appearance, within the normal duration' if it applies, and under 'Build your CGPA from semester credits' fill each Semester credits and Semester GPA box, using 'Add a semester' for more rows.",
    "Read Percentage with Formula applied and Degree classification, compare all three formulas under 'The same CGPA under each rule', then press Copy result.",
  ],
  intro:
    "Anna University converts a 10-point CGPA to a percentage with a linear rule — the regulations state Percentage = CGPA x 10 — and this converter applies that rule, along with the deducted and UGC variants that appear on some statements, so you can reproduce whichever figure your own document quotes. It also builds the CGPA itself from semester credits, because CGPA is the credit-weighted average of grade points: the sum of credits times grade points, divided by total credits. Degree classification and the GPA still needed to reach a target CGPA are worked out from the same numbers.",
  useCases: [
    "Fill the percentage field on a placement or higher-studies form when your Anna University grade sheet only prints a CGPA.",
    "Work out the CGPA after six semesters when each semester carried a different credit load.",
    "Check what average GPA the last two semesters must deliver to finish above CGPA 8.50 for First Class with Distinction.",
  ],
  benefits: [
    ["Every rule in one place", "Shows the standard x 10 conversion beside the deducted and UGC x 9.5 variants so you can match your transcript."],
    ["Credit weighting done properly", "Averages semester GPAs by credits rather than treating every semester as equal."],
    ["Classification included", "Applies the CGPA 8.50 and 7.00 thresholds and the no-arrears condition for Distinction."],
  ],
  faqs: [
    [
      "How do I convert Anna University CGPA to percentage?",
      "Multiply the CGPA by 10, the conversion stated in Anna University's regulations. A CGPA of 8.52 becomes 85.2%. If your consolidated statement prints a different formula, such as one that subtracts 0.5 first, use the figure on your own document.",
    ],
    [
      "How is CGPA calculated at Anna University?",
      "CGPA is the sum of each course's credits multiplied by its grade point, divided by total credits taken. Grade points run O = 10, A+ = 9, A = 8, B+ = 7, B = 6 and RA = 0, so a heavier course pulls the average more than a lighter one.",
    ],
    [
      "What CGPA is First Class with Distinction at Anna University?",
      "CGPA 8.50 or above, with every subject passed at the first appearance and the programme completed within its normal duration. A CGPA of 8.50 or more with an arrear history is classified First Class instead, and First Class alone needs CGPA 7.00.",
    ],
    [
      "Which percentage should I write on a job application?",
      "The one your university document supports. Employers and admission portals generally accept the percentage or the conversion formula printed on the consolidated grade statement, and the Controller of Examinations can issue a conversion certificate if a form insists on a percentage.",
    ],
  ],
};

export default seo;
