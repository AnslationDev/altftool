const seo = {
  title: "Crypto Loss Set-Off Rules Under Section 115BBH",
  metaDescription:
    "Section 115BBH taxes crypto gains at 30% and blocks every set-off. Enter your trades to see the extra tax, the 1% 194S TDS and disallowed fees.",
  steps: [
    "Press Add trade for each disposal and fill Asset, Cost of acquisition (INR), Sale consideration (INR) and Fees and gas paid (INR).",
    "Choose your Surcharge on your total income and tick 'I am a specified person for Section 194S' if the higher TDS threshold applies.",
    "Compare Total tax on your crypto gains with the 'If netting were allowed' column, plus Losses thrown away and TDS refundable, then press Copy result.",
  ],
  intro:
    "Section 115BBH of the Income-tax Act taxes gains on virtual digital assets at a flat 30% and expressly refuses any set-off: a loss on a crypto trade cannot reduce a gain on another crypto trade, cannot reduce salary or capital gains, and cannot be carried forward to a later year. This explainer takes your year's trades and shows the tax you actually owe against the tax you would owe if gains and losses could be netted, so the cost of the rule is a number rather than a complaint. It also applies the Section 194S 1% TDS and shows that exchange fees and gas are not deductible.",
  useCases: [
    "A trader who made ₹1 lakh on Bitcoin and lost ₹60,000 on Ethereum seeing that tax is charged on the full ₹1 lakh.",
    "Someone whose year ended in an overall loss checking whether anything can be carried into next year.",
    "A holder working out the effective tax rate once non-deductible exchange fees are counted against the real profit.",
  ],
  benefits: [
    ["The counterfactual shown", "Puts the tax as the law stands next to the tax if netting were allowed, and prints the difference."],
    ["Fees treated correctly", "Only cost of acquisition is deducted, because Section 115BBH(2)(a) allows nothing else."],
    ["TDS credit included", "Applies the 1% Section 194S deduction and shows whether it leaves tax payable or a refund."],
  ],
  faqs: [
    [
      "Can I set off crypto losses against crypto gains in India?",
      "No. Section 115BBH(2)(b) blocks it. The Finance Bill 2022 originally barred set-off only against income from other sources, but an official amendment removed the word 'other', so a loss on one virtual digital asset cannot be set off against a gain on another. If you gain ₹1,00,000 on one coin and lose ₹60,000 on another, tax is charged on the full ₹1,00,000.",
    ],
    [
      "Can crypto losses be carried forward to next year?",
      "No. Section 115BBH(2)(b) also bars carry forward, so a loss that cannot be used in the year it arises simply disappears. This is unlike capital losses on shares, which can be carried forward for eight assessment years.",
    ],
    [
      "What is the tax rate on cryptocurrency in India?",
      "A flat 30% under Section 115BBH, plus any surcharge applicable to your total income and a 4% health and education cess. On a ₹1,00,000 gain with no surcharge that comes to ₹31,200. The rate does not depend on how long you held the asset or on your income slab.",
    ],
    [
      "Are exchange fees and gas fees deductible against crypto gains?",
      "No. Section 115BBH(2)(a) allows only the cost of acquisition. Trading fees, gas fees, transfer charges, interest on money borrowed to buy, and mining infrastructure costs are all disallowed, which is why the effective rate on what you really made is usually higher than 30%. Speak to a chartered accountant about how your particular transactions should be reported in Schedule VDA.",
    ],
  ],
};

export default seo;
