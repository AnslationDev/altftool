const seo = {
  intro:
    "The NPS Calculator projects your National Pension System corpus at retirement using the monthly-compounded annuity-due formula P × [((1+i)^n − 1) ÷ i] × (1+i), then splits that corpus into the annuity portion you must buy and the lump sum you can take. It is built for salaried Indians deciding how much to put into NPS: you set your age, monthly contribution and expected return — or build the return from an E/C/G asset mix at 12%, 8% and 7% — and see the corpus, the monthly pension it buys, and the tax deduction it earns. Deductions are worked out separately under 80CCD(1), 80CCD(1B) and 80CCD(2) for the old and new regimes, with 4% cess added to the saving.",
  useCases: [
    "You have already exhausted the ₹1.5 lakh 80C limit with EPF and insurance, and want to see exactly what the extra ₹50,000 under 80CCD(1B) is worth at your 30% slab before the March deadline.",
    "You are 35 and torn between a 75/15/10 equity-heavy mix and a 50/30/20 balanced one — you want the blended return each produces and the difference in corpus by age 60.",
    "Your employer offers to route a percentage of basic + DA into NPS, and you need to know whether the 14% cap in the new regime beats the 10% cap in the old one for your salary.",
  ],
  benefits: [
    [
      "Both sides of the NPS trade",
      "Shows the corpus you build and the pension the mandatory 40% annuity actually pays, not just a growth number.",
    ],
    [
      "Regime-aware deduction table",
      "Applies 80CCD(1B), the 10%-of-basic ceiling on 80CCD(1) and the 10% vs 14% employer cap separately, so old and new regime results are not conflated.",
    ],
    [
      "Asset mix that reflects the rules",
      "Blends E, C and G returns into a single rate and flags mixes above the 75% Active Choice equity cap that PFRDA would not allow.",
    ],
  ],
  faqs: [
    [
      "How much of my NPS corpus must go into an annuity?",
      "At least 40% at age 60 — the remaining 60% comes out as a tax-free lump sum. If the total corpus is ₹5 lakh or less the annuity requirement is waived and you can withdraw the whole amount. Exit before 60 is stricter: 80% must buy an annuity, with full withdrawal allowed only up to ₹2.5 lakh.",
    ],
    [
      "What is the extra ₹50,000 NPS deduction under 80CCD(1B)?",
      "It is a deduction of up to ₹50,000 for your own NPS contributions, available over and above the ₹1.5 lakh combined 80C/80CCD(1) limit and only in the old regime. No other instrument — ELSS, PPF, insurance premium or home-loan principal — can be claimed against it, which is why the calculator treats it first before allocating anything to 80CCD(1).",
    ],
    [
      "Is the NPS pension tax-free?",
      "No. The lump sum withdrawn at 60 is tax-free, but annuity income is taxed at your slab rate every year for life. This is an informational model of the current rules, not tax advice — confirm your own position with a chartered accountant before filing.",
    ],
    [
      "What return should I assume for NPS?",
      "The calculator's asset-mix helper uses long-run assumptions of 12% for the E (equity) fund, 8% for C (corporate bonds) and 7% for G (government securities), blended by your chosen percentages. These are assumptions, not guarantees — NPS returns are market-linked, and you can override the blend with any manual rate.",
    ],
  ],
};

export default seo;
