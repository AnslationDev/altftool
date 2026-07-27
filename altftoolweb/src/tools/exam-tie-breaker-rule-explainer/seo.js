const seo = {
  intro:
    "A tie-breaker rule is the ordered list of criteria an examining body applies when two candidates finish on identical marks, and it is applied strictly in sequence — the first criterion on which they differ fixes the rank and nothing after it is consulted. This explainer runs the published order for NEET UG, JEE Main, UPSC Civil Services, SSC and IBPS or SBI recruitment against two candidates and shows exactly which criterion decided the result. Each rule set is presented with the body that issued it, because these lists are revised: NEET dropped both the age criterion and the draw of lots within three years.",
  useCases: [
    "Working out why two NEET candidates on 640 marks received different All India Ranks.",
    "Checking whether a JEE Main tie would be settled on Mathematics before Physics, or go all the way to date of birth.",
    "Explaining to a study group why SSC ends its tie-break with alphabetical order while NTA lets identical candidates share a rank.",
  ],
  benefits: [
    ["Rules applied in the real order", "Criteria are evaluated in sequence and later ones are visibly marked as never reached."],
    ["Five bodies in one place", "NTA, UPSC, SSC and the bank recruitment boards each use a different logic, shown side by side."],
    ["Worked example for each exam", "Every rule set ships with a realistic pair of candidates that demonstrates the sequence."],
  ],
  faqs: [
    [
      "How are NEET UG ties broken?",
      "In order: higher marks in Biology (Botany plus Zoology), then Chemistry, then Physics, then the lower ratio of incorrect to correct answers across all subjects, then the same ratio within Biology, Chemistry and Physics. NTA removed the age criterion and the computerised draw of lots from 2024, so candidates identical on every criterion now share a rank.",
    ],
    [
      "What is the tie-breaking rule in JEE Main?",
      "Higher NTA score in Mathematics comes first, then Physics, then Chemistry, then the lower ratio of wrong to correct answers, then the older candidate. Candidates still level after all five are given the same rank.",
    ],
    [
      "How does SSC break a tie in CGL?",
      "By total marks in the final stage, then marks in the earlier tier, then date of birth with the older candidate placed higher, then alphabetical order of the first name. Because the last criterion can always separate two people, SSC results do not have shared ranks.",
    ],
    [
      "Does age help or hurt in a tie?",
      "Where age is used, being older helps. UPSC, SSC and the bank recruitment boards all place the senior candidate higher, and JEE Main does the same at its fifth criterion. NEET UG no longer uses age at all.",
    ],
  ],
};

export default seo;
