const seo = {
  intro:
    "The Vitamin D Unit Converter changes a serum 25-hydroxyvitamin D result between the conventional unit ng/mL and the SI unit nmol/L using the exact molar-mass factor of 2.496, derived from the 400.64 g/mol molar mass of calcifediol. It then places the level against the Endocrine Society bands (deficiency below 20 ng/mL, insufficiency 20-29 ng/mL, sufficiency 30-100 ng/mL) and the Institute of Medicine cut-points. It is for anyone comparing a lab report against a guideline, a study or an earlier test that used the other unit system.",
  useCases: [
    "Compare an Indian or US lab report in ng/mL against a European report or research paper quoted in nmol/L.",
    "Check whether a 62 nmol/L result clears the 30 ng/mL sufficiency target before a follow-up appointment.",
    "Line up several years of 25(OH)D tests from different labs on one scale to see whether a level is actually rising.",
    "Translate a guideline threshold quoted in nmol/L into the ng/mL figure printed on your own report.",
  ],
  benefits: [
    ["Exact conversion factor", "Uses 2.496 from the calcifediol molar mass, and also shows the rounded 2.5 result labs print."],
    ["Guideline context", "Marks the level against both Endocrine Society and Institute of Medicine cut-points, which differ."],
    ["No stale numbers", "Invalid or implausible entries show a plain-language reason instead of a misleading figure."],
  ],
  faqs: [
    [
      "How do I convert vitamin D from ng/mL to nmol/L?",
      "Multiply the ng/mL figure by 2.496 to get nmol/L, and divide by 2.496 to go the other way. The factor comes from the 400.64 g/mol molar mass of 25-hydroxyvitamin D3, so 30 ng/mL is 74.9 nmol/L and 20 ng/mL is 49.9 nmol/L. Many reports round the factor to 2.5.",
    ],
    [
      "What is a normal vitamin D level?",
      "The Endocrine Society calls 30-100 ng/mL (75-250 nmol/L) sufficient, 20-29 ng/mL insufficient and below 20 ng/mL deficient. The Institute of Medicine sets a lower bar, treating 20 ng/mL (50 nmol/L) as adequate for bone health in most healthy people, which is why two reports can label the same number differently.",
    ],
    [
      "Is 50 nmol/L the same as 20 ng/mL?",
      "Almost exactly: 20 ng/mL converts to 49.92 nmol/L, which guidelines round to 50 nmol/L. That rounding is why the deficiency threshold is quoted as 20 ng/mL in one unit system and 50 nmol/L in the other.",
    ],
    [
      "What vitamin D level is too high?",
      "Levels above 100 ng/mL (250 nmol/L) are above every target range, and vitamin D intoxication with raised blood calcium is generally seen above 150 ng/mL (375 nmol/L). A high result usually follows prolonged high-dose supplementation; stop guessing at doses and ask your doctor to review the result and your calcium level.",
    ],
  ],
};

export default seo;
