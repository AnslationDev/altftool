const seo = {
  title: "Income Tax Slab Visualizer: Old vs New, FY",
  metaDescription:
    "See the rupee tax each slab adds under both FY 2025-26 regimes, with the ₹75,000 standard deduction, 87A rebate, surcharge relief and 4% cess.",
  intro:
    "The Income Tax Slab Visualizer breaks your Indian income tax bill down slab by slab, so you can see precisely how much of the total comes from the 5% band, the 20% band, the 30% band and so on. It runs the old regime and the new regime (Section 115BAC) side by side for FY 2025-26, applying the standard deduction, the Section 87A rebate, surcharge with marginal relief, and the 4% health and education cess. It is built for salaried employees, pensioners and freelancers who want to understand where their tax actually comes from rather than just seeing one final number.",
  useCases: [
    "A salaried employee earning ₹18 lakh wants to see how much of the bill comes from the 30% slab before deciding whether extra 80C investments are worth it.",
    "A pensioner aged 62 compares the old regime's higher ₹3 lakh basic exemption against the new regime's wider slabs and ₹75,000 standard deduction.",
    "A consultant crossing ₹50 lakh checks how the 10% surcharge and marginal relief change the marginal cost of the next rupee earned.",
  ],
  benefits: [
    ["Per-slab contribution", "Shows the rupee tax each individual slab adds, not just the total."],
    [
      "Both regimes at once",
      "Old and new regime slabs are computed together so the cheaper option is obvious.",
    ],
    [
      "Rebate, surcharge and cess included",
      "Applies Section 87A, surcharge with marginal relief and 4% cess the way the Act does.",
    ],
  ],
  faqs: [
    [
      "What are the new regime income tax slabs for FY 2025-26?",
      "Under Section 115BAC for FY 2025-26 the slabs are nil up to ₹4 lakh, 5% from ₹4–8 lakh, 10% from ₹8–12 lakh, 15% from ₹12–16 lakh, 20% from ₹16–20 lakh, 25% from ₹20–24 lakh and 30% above ₹24 lakh. Salaried taxpayers also get a ₹75,000 standard deduction.",
    ],
    [
      "Why is my tax zero at ₹12 lakh in the new regime?",
      "The Section 87A rebate wipes out up to ₹60,000 of tax when new-regime taxable income is ₹12 lakh or less. Slab tax at exactly ₹12 lakh is ₹60,000, so the rebate cancels it entirely and nothing is payable.",
    ],
    [
      "Does the tax rate apply to my whole income once I cross a slab?",
      "No. India uses progressive slab taxation, so only the portion of income falling inside a slab is taxed at that slab's rate. This visualizer shows exactly how much income sits in each band and the tax it produces.",
    ],
    [
      "How is surcharge calculated on high incomes?",
      "Surcharge is charged on the tax amount at 10% above ₹50 lakh, 15% above ₹1 crore and 25% above ₹2 crore, with an extra 37% band above ₹5 crore that applies only in the old regime. Marginal relief caps the surcharge so extra tax never exceeds the extra income above the threshold.",
    ],
  ],
};

export default seo;
