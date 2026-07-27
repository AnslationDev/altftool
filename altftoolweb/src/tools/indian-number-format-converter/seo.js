const seo = {
  intro:
    "This converter translates numbers between the Indian numbering system (lakh, crore, lakh crore, grouped 2-2-3 as 1,50,00,000) and the international short scale (million, billion, trillion, grouped 3-3-3 as 15,000,000). The mapping is exact powers of ten: 1 lakh = 100,000, 1 crore = 10 million, 1 billion = 100 crore and 1 trillion = 1 lakh crore. It is built for anyone reading Indian financial news, startup funding reports or government budgets alongside international figures.",
  useCases: [
    "Translating a startup's $15 million funding round into crore for an Indian audience",
    "Converting a government budget line quoted in lakh crore into trillions for a global report",
    "Checking the digit grouping of a large rupee figure before putting it in a slide or invoice",
  ],
  benefits: [
    ["Exact powers of ten", "Conversions use the exact multipliers, so 1 billion is always precisely 100 crore, never an approximation."],
    ["Both groupings shown", "Every result appears in Indian 2-2-3 and international 3-3-3 comma style side by side."],
    ["All named units", "Reads input in lakh, crore, arab, kharab, lakh crore, million, billion or trillion, and shows each equivalent."],
  ],
  faqs: [
    [
      "How many crores is 1 million?",
      "1 million is 0.1 crore, i.e. 10 lakh. Going the other way, 1 crore equals 10 million. The relation is exact because a crore is 10^7 and a million is 10^6.",
    ],
    [
      "How much is 1 billion in lakhs and crores?",
      "1 billion equals 100 crore, or 10,000 lakh. Written in Indian digit grouping it is 1,00,00,00,000 and in international grouping 1,000,000,000.",
    ],
    [
      "What is a lakh crore in the international system?",
      "1 lakh crore is exactly 1 trillion (10^12). Indian budget documents use lakh crore because everyday Indian counting stops at crore; a budget of Rs 45 lakh crore is Rs 45 trillion.",
    ],
    [
      "Why are commas placed differently in Indian numbers?",
      "The Indian system groups the last three digits, then every two digits after that (2-2-3), matching the spoken units thousand, lakh and crore — so ten million is written 1,00,00,000, which reads directly as 1 crore. The international system groups every three digits (3-3-3), matching thousand, million, billion.",
    ],
  ],
};

export default seo;
