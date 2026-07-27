const seo = {
  intro:
    "This checker tests a business against every condition in section 10 of the CGST Act, 2017 that governs the GST composition scheme: the Rs 1.5 crore turnover ceiling (Rs 75 lakh in eight listed states), the Rs 50 lakh limit for the section 10(2A) service route, the 10%-or-Rs-5-lakh cap on services supplied alongside goods, and the six outright disqualifications in section 10(2). It returns the flat levy rate that would apply — 1% for traders and manufacturers, 5% for restaurants, 6% for service suppliers — or names the exact clause that blocks you. Useful before filing Form CMP-02 to opt in.",
  useCases: [
    "A retailer deciding before 31 March whether to file CMP-02 for the coming financial year",
    "A manufacturer checking whether the brick or aerated-water exclusion in section 10(2)(e) applies to their product",
    "A shop planning to list on an online marketplace and wanting to know if TCS collection kills their composition status",
  ],
  benefits: [
    ["Every clause tested", "Eight separate conditions, each shown as passed or failed with its section number."],
    ["State-aware ceiling", "Applies Rs 75 lakh instead of Rs 1.5 crore for the eight states where that limit still stands."],
    ["Names the blocker", "Instead of a bare yes or no, it tells you which condition to fix."],
  ],
  faqs: [
    [
      "Who is eligible for the GST composition scheme?",
      "A registered person whose aggregate turnover in the preceding financial year did not exceed Rs 1.5 crore — Rs 75 lakh in Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura and Uttarakhand — and who does not fall foul of the six exclusions in section 10(2). A separate section 10(2A) route with a Rs 50 lakh ceiling exists for service providers.",
    ],
    [
      "Can a composition dealer sell in another state?",
      "No. Section 10(2)(c) disqualifies anyone making inter-state outward supplies. Buying goods from another state is allowed; it is only outward supply across a state border that closes the scheme.",
    ],
    [
      "Can a composition dealer supply services?",
      "Yes, but only up to 10% of turnover in the State in the preceding financial year or Rs 5,00,000, whichever is higher, under the first proviso to section 10(1). Restaurant service is treated separately and is not counted against that cap.",
    ],
    [
      "Can I sell on Amazon or Flipkart under the composition scheme?",
      "No. Section 10(2)(d) bars supplies made through an electronic commerce operator that is required to collect tax at source under section 52, which covers the major marketplaces. You would need to move to the regular scheme first; discuss the switch with a GST practitioner.",
    ],
  ],
};

export default seo;
