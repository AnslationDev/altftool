const seo = {
  title: "Crypto Tax Calculator India: 30% Tax + 1% TDS",
  metaDescription:
    "Work out India's flat 30% crypto tax under Section 115BBH plus surcharge, 4% cess and 1% TDS under 194S — with losses excluded as the law requires.",
  steps: [
    "Click \"Add trade\" and enter each asset with its \"Cost of acquisition (INR)\" and \"Sale consideration (INR)\".",
    "Set the Section 194S threshold that applies to you (₹50,000, ₹10,000 or none), your surcharge band, and any TDS already deducted or gifted crypto.",
    "Read the total tax at 30% plus surcharge and 4% cess, the 1% TDS and the balance to pay, then click \"Copy result\".",
  ],
  intro:
    "This calculator applies India's virtual digital asset rules to your trades: a flat 30% tax on every profitable transfer under Section 115BBH, plus surcharge and 4% health and education cess, and the separate 1% TDS under Section 194S on the sale consideration. Because losses on one coin cannot be set off against gains on another, it lists each trade separately and shows how much of your real profit is taxed anyway. It is aimed at Indian residents trading on exchanges or peer-to-peer.",
  useCases: [
    "You made ₹80,000 on Bitcoin and lost ₹50,000 on Ethereum — see why tax is charged on ₹80,000, not ₹30,000.",
    "Reconciling the 1% TDS your exchange already deducted against the tax you actually owe when filing your return.",
    "Checking whether your yearly sale value crosses the ₹50,000 Section 194S threshold that triggers TDS at all.",
  ],
  benefits: [
    ["Loss set-off rule modelled correctly", "Losing trades are shown but excluded from taxable income, exactly as Section 115BBH requires."],
    ["TDS and tax kept separate", "The 1% TDS on turnover is calculated apart from the 30% tax and credited against the final liability."],
    ["Surcharge and cess included", "Adds the surcharge band for your income level and the 4% cess so the number matches your return."],
  ],
  faqs: [
    [
      "How is crypto taxed in India?",
      "Income from transferring a virtual digital asset is taxed at a flat 30% under Section 115BBH, plus applicable surcharge and 4% cess. Only the cost of acquisition is deductible — exchange fees, gas fees and interest are not.",
    ],
    [
      "Can I set off crypto losses against crypto gains?",
      "No. A loss on one virtual digital asset cannot be set off against a gain on another, cannot be set off against any other income, and cannot be carried forward to a later year.",
    ],
    [
      "When does the 1% TDS under Section 194S apply?",
      "On the consideration for a transfer once the yearly value crosses ₹50,000 for individuals and HUFs whose accounts are not audited, and ₹10,000 for everyone else. Indian exchanges deduct it automatically; in peer-to-peer trades the buyer must deduct it.",
    ],
    [
      "Is crypto received as a gift or airdrop taxable?",
      "Yes. A virtual digital asset received without consideration is taxed in the recipient's hands, and a later sale is taxed again at 30% on the gain over that value. Gifts from specified relatives are exempt.",
    ],
  ],
};

export default seo;
