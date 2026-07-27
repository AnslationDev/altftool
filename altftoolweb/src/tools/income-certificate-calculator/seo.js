const seo = {
  intro:
    "This calculator aggregates family income the way an income certificate application actually tests it, which is not the same as adding up what the household earns. For an EWS certificate every source counts — salary, agriculture, business and profession alike — and eligibility needs gross annual family income below ₹8,00,000 under the DoPT order of 31 January 2019, plus four separate asset tests. For an OBC non-creamy-layer certificate the same ₹8,00,000 ceiling applies but income from salary and from agricultural land is expressly left out of the computation. Enter the figures once and the tool applies whichever rule your certificate uses.",
  useCases: [
    "A family with ₹9,00,000 of salary and ₹3,00,000 of agricultural income checking whether they are still non-creamy-layer, since neither of those heads enters the OBC income test.",
    "An EWS applicant confirming that a 1,050 sq ft flat disqualifies the family whatever their income, before paying the application fee.",
    "A student applying for a state scholarship entering the state's own ceiling and seeing how much headroom the household has against it.",
  ],
  benefits: [
    ["Applies the right exclusions", "Salary and agricultural income drop out automatically for the OBC test and stay in for EWS."],
    ["Runs the EWS asset tests", "Land, flat and plot limits are checked separately, because each disqualifies on its own."],
    ["Spells out who counts as family", "The EWS and creamy-layer definitions differ, and the tool states the one that applies."],
  ],
  faqs: [
    [
      "What is the income limit for an EWS certificate?",
      "Gross annual family income must be below ₹8,00,000, counting every source including salary, agriculture, business and profession, for the financial year immediately before the year of application. Family means the applicant, their parents, siblings below 18, and the spouse and children below 18. Exactly ₹8,00,000 does not qualify — the rule says below.",
    ],
    [
      "Is salary counted for the OBC creamy layer?",
      "No. Income from salaries and income from agricultural land are both excluded when applying the ₹8,00,000 income criterion for the creamy layer, following the DoPT clarification of 14 October 2004. That is why a salaried family well above ₹8,00,000 in total earnings can still hold a valid non-creamy-layer certificate.",
    ],
    [
      "What property disqualifies a family from EWS?",
      "Any one of four holdings: agricultural land of 5 acres or more, a residential flat of 1,000 sq ft or more, a residential plot of 100 sq yards or more in a notified municipality, or a residential plot of 200 sq yards or more outside one. Property in different locations is clubbed together, and failing any single test disqualifies the family regardless of income.",
    ],
    [
      "Whose income goes into an OBC non-creamy-layer certificate?",
      "The income of the candidate's parents. The candidate's own income is not taken into account, and neither is the income of the candidate's spouse. The test also looks at three consecutive years rather than a single year, and it is only one of six routes into the creamy layer — a parent holding a Group A post can place the family there whatever the income.",
    ],
  ],
};

export default seo;
