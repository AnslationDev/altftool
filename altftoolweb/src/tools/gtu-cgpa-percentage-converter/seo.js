const seo = {
  title: "GTU CGPA to Percentage Converter — (CPI − 0.5) × 10",
  metaDescription:
    "Convert GTU SPI, CPI or CGPA to percentage with the credit-system rule (CPI − 0.5) × 10, build SPI from AA–FF grades, or reverse a cut-off.",
  steps: [
    "Choose the Regulation, pick 'Index to percentage' or 'Percentage to index', and enter your 'SPI, CPI or CGPA (out of 10)' or your 'Percentage of marks'.",
    "Rebuild a missing number below: pick AA–FF grade codes and credits under 'SPI from subject grades', or roll semesters together under 'CPI from semester SPIs' with 'Add subject' and 'Add semester'.",
    "Read the equivalent figure with its formula written out and the 'Credits carrying a backlog' row, then click 'Copy result'.",
  ],
  intro:
    "This converter reads Gujarat Technological University's performance indices as marks. GTU prints an SPI for each semester and a CPI across them, both on a 10 point scale, and under the credit system introduced for the 2009 admission batch the equivalence is percentage = (CPI - 0.5) x 10. Build the SPI from AA to FF subject grades, roll the semesters into a CPI, then convert - or reverse the rule to find the index a stated cut-off needs.",
  useCases: [
    "A placement form asks for a percentage and your GTU marksheet only prints CPI 8.24.",
    "Reconstructing a semester SPI from subject grade codes and credits before results are consolidated.",
    "Checking how far one FF backlog drags the SPI down when the failed subject carries four credits.",
  ],
  benefits: [
    ["GTU vocabulary", "Works in SPI and CPI, the terms actually printed on a GTU marksheet, not a generic SGPA."],
    ["Regulation selectable", "The 0.5 offset rule and the straight scaling seen on some statements are separate options."],
    ["Backlog visible", "Failed credits are counted and shown, because an FF still occupies its credits in the denominator."],
  ],
  faqs: [
    [
      "How do I convert GTU CPI to percentage?",
      "Subtract 0.5 from the CPI and multiply by 10. A CPI of 8.24 gives (8.24 - 0.5) x 10 = 77.4%, and a CPI of 7.0 gives 65%. The same rule is applied to the CGPA reported after the final semester.",
    ],
    [
      "What is the difference between SPI, CPI and CGPA at GTU?",
      "SPI is the credit weighted grade point average of a single semester. CPI is the same average taken across every semester completed so far. The figure reported after the final semester is the CGPA, and all three sit on the same 10 point scale.",
    ],
    [
      "What are the GTU grade points?",
      "AA is 10, AB is 9, BB is 8, BC is 7, CC is 6, CD is 5, DD is 4 and FF is 0. DD is the lowest passing grade, so a subject graded FF has to be cleared again while still counting its credits in the SPI denominator.",
    ],
    [
      "What CPI do I need for 70 percent at GTU?",
      "7.5 under the credit system rule, since reversing it gives CPI = (percentage / 10) + 0.5. On the same basis 60% needs a CPI of 6.5 and 75% needs 8.0. For anything official, ask GTU for an equivalence certificate rather than submitting a calculated figure.",
    ],
  ],
};

export default seo;
