const seo = {
  intro:
    "This checker tests a school student's details against the five central pre-matric scholarship schemes: SC (income up to Rs 2.5 lakh), ST (Rs 2.5 lakh), OBC/EBC/DNT under PM-YASASVI (Rs 2.5 lakh), minority students (Rs 1 lakh plus 50% in the previous exam), and the no-income-ceiling component for children of parents in hazardous occupations. Since the 2022-23 revision the main schemes cover classes 9 and 10 only, while the hazardous-occupations component runs from class 1 to 10. It is for parents and students checking National Scholarship Portal eligibility before the application window.",
  useCases: [
    "An SC student in class 9 with Rs 2 lakh family income confirming eligibility before NSP applications open",
    "A minority-community family checking whether the Rs 1 lakh income ceiling and 50% marks condition are both met",
    "A parent in a notified hazardous occupation discovering their class 4 child qualifies despite the main schemes starting at class 9",
  ],
  benefits: [
    ["All five central schemes at once", "One form checks SC, ST, OBC/EBC/DNT, minority and hazardous-occupation eligibility together."],
    ["Exact ceilings applied", "Uses the published income limits — Rs 2.5 lakh for SC/ST/OBC schemes and Rs 1 lakh for the minority scheme."],
    ["Reasons, not just verdicts", "Every 'not eligible' result states exactly which condition failed so you know what to verify."],
  ],
  faqs: [
    [
      "Who is eligible for the pre-matric scholarship?",
      "Students of classes 9 and 10 from SC, ST, OBC, EBC, DNT or notified minority communities whose family income is within the scheme ceiling — Rs 2.5 lakh a year for the SC, ST and OBC/EBC/DNT schemes and Rs 1 lakh for the minority scheme. Children of parents in notified hazardous occupations qualify from class 1 to 10 with no income ceiling.",
    ],
    [
      "Is the pre-matric scholarship available for classes 1 to 8?",
      "Generally no since the 2022-23 revision: the Centre restricted the SC, OBC and minority pre-matric schemes to classes 9 and 10, reasoning that the Right to Education Act already makes elementary education free. The exception is the component for children of parents in hazardous occupations, which still covers classes 1 to 10.",
    ],
    [
      "What is the income limit for the pre-matric scholarship?",
      "Rs 2.5 lakh a year of parental/family income for the SC, ST and OBC/EBC/DNT schemes, and Rs 1 lakh for the minority students scheme. Income certificates from the competent authority are required as proof, and state-run schemes may set different limits.",
    ],
    [
      "How do I apply for a pre-matric scholarship?",
      "Through the National Scholarship Portal (scholarships.gov.in) for most central schemes, or the state's own portal where the state disburses the scheme. Applications need Aadhaar, a bank account, caste/community and income certificates and school verification, and each academic year has its own fresh and renewal deadlines.",
    ],
  ],
};

export default seo;
