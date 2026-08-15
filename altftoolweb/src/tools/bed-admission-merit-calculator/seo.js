const seo = {
  title: "B.Ed Merit Calculator: Graduation + Entrance Index",
  metaDescription:
    "Weight graduation percentage against entrance score to get a B.Ed merit index out of 100, with the NCTE 50% (55% B.Tech) eligibility floor checked.",
  steps: [
    "Enter Graduation marks obtained and Graduation maximum marks, then the Entrance exam score and Entrance exam maximum.",
    "Set Weight given to graduation marks (%) or pick the Entrance exam only, Graduation marks only, or Combined 30 : 70 preset.",
    "Read the Merit index out of 100 with the NCTE eligibility floor row, then press Copy result.",
  ],
  intro:
    "This calculator produces a B.Ed admission merit index as a weighted average of graduation percentage and entrance-exam percentage on a 100-point scale — the formula behind entrance-ranked lists (UP B.Ed JEE, Bihar CET-B.Ed, MAH B.Ed CET), graduation-ranked university lists, and mixed formulas. It also checks the NCTE Regulations, 2014 eligibility floor of 50% graduation marks (55% for B.E./B.Tech candidates). It is for graduates planning a two-year B.Ed and wanting to know where they stand before counselling.",
  useCases: [
    "A UP B.Ed JEE candidate converting a score out of 400 into a percentage to compare against previous closing ranks",
    "A graduate with 58% checking they clear the NCTE 50% floor before paying an application fee",
    "An applicant to a university that weighs graduation 30 : entrance 70 computing the exact combined index",
  ],
  benefits: [
    ["Covers all three merit models", "Presets for entrance-only, graduation-only and combined weighted formulas."],
    ["NCTE floor check", "Flags graduation marks below the 50% (or 55% engineering) eligibility minimum automatically."],
    ["Transparent breakdown", "Shows the exact contribution of graduation and entrance so the index is verifiable."],
  ],
  faqs: [
    [
      "How is B.Ed admission merit calculated?",
      "Entrance-based states rank purely on the entrance score — UP B.Ed JEE, Bihar CET-B.Ed and MAH B.Ed CET publish rank lists from the exam alone, with graduation marks only as an eligibility condition. Universities without an entrance rank on graduation percentage, and some use a weighted mix; all three fit the formula merit = graduationPercent x (w/100) + entrancePercent x ((100-w)/100), where w is the graduation weight from 0 to 100.",
    ],
    [
      "What is the minimum percentage in graduation for B.Ed admission?",
      "50% in the bachelor's or master's degree under the NCTE Regulations, 2014, and 55% for B.E./B.Tech holders with specialisation in science and mathematics. States and universities give relaxation (commonly 5%) to reserved categories, so a candidate below the general floor should check their state brochure.",
    ],
    [
      "Can I do B.Ed without an entrance exam?",
      "Yes, where the university or state admits on graduation merit — many private and some state universities rank applicants by degree percentage alone. Large state systems, however, require the state entrance (UP, Bihar, Maharashtra, MP and others), so check whether your target college sits inside a centralised counselling system.",
    ],
    [
      "Is B.Ed merit calculated on graduation or post-graduation marks?",
      "Eligibility can be met through either — NCTE accepts 50% in the bachelor's or the master's degree. For merit lists, institutions that rank on qualifying marks almost always use the bachelor's percentage; enter whichever marksheet your brochure says counts, using its printed maximum.",
    ],
  ],
};

export default seo;
