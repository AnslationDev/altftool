const seo = {
  intro:
    "The University of Delhi converts CGPA to a percentage of marks by multiplying by 9.5, the UGC Choice Based Credit System equivalence its own conversion notification adopts. This converter applies that multiplier, builds the CGPA itself as the credit-weighted mean of semester SGPAs, and checks the result against the thresholds DU graduates most often need — 55% for UGC NET in the general category, 50% with the reserved-category relaxation, and the conventional 60% First Division mark. It also works backwards, showing the CGPA a stated percentage requires.",
  useCases: [
    "Convert a six-semester DU CGPA into the percentage a PG application form insists on.",
    "Check whether a master's CGPA clears the 55% UGC NET requirement, and by how much it falls short if not.",
    "See how much a credit-weighted CGPA differs from simply averaging the six SGPAs.",
  ],
  benefits: [
    ["The notified multiplier", "Uses 9.5 as DU's conversion notification does, rather than the flattering plain multiply by 10."],
    ["Credit weighting shown", "Prints the weighted CGPA beside the plain average so you can see which one your marksheet reflects."],
    ["Thresholds with sources", "Each eligibility bar names where the number comes from, so it can be checked rather than trusted."],
  ],
  faqs: [
    [
      "How do I convert DU CGPA to percentage?",
      "Multiply the CGPA across all semesters by 9.5. A CGPA of 8.20 gives 77.9%, and the highest percentage the rule can produce is 95% at a perfect CGPA of 10.",
    ],
    [
      "Why does DU use 9.5 and not 10?",
      "The 9.5 multiplier comes from the UGC's CBCS grading template, where grade point 10 corresponds to the mid-point of the 90 to 100 mark band. Multiplying by 10 would credit a top grade with marks the band does not guarantee.",
    ],
    [
      "What CGPA do I need for 55% to sit UGC NET?",
      "A CGPA of 5.79 on the 9.5 multiplier reaches 55%, the minimum in the master's degree for unreserved candidates. Reserved-category candidates need 50%, which the same rule puts at a CGPA of 5.26.",
    ],
    [
      "Is CGPA the average of my six SGPAs?",
      "Only when every semester carries the same credits. DU computes CGPA as the sum of credits times SGPA divided by total credits, so a heavier semester pulls the CGPA more than a lighter one and the plain average can differ by a few hundredths.",
    ],
  ],
};

export default seo;
