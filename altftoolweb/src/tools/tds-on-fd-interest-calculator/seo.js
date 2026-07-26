const seo = {
  intro:
    "Banks deduct TDS on fixed deposit interest under Section 194A once your interest with that bank crosses the annual threshold — and the deduction applies to the whole interest, not just the excess. This calculator works out the TDS at 10% (or 20% where PAN is not on record), checks whether you qualify to file Form 15G or 15H to stop the deduction, and shows the net interest credited plus any tax still payable at your slab. Useful for depositors planning FD ladders and for retirees relying on interest income.",
  useCases: [
    "Checking whether splitting a large deposit across two banks keeps annual interest under the TDS threshold at each bank.",
    "A retiree confirming Form 15H eligibility before the branch deducts TDS on the first quarterly interest credit.",
    "Reconciling the TDS shown in Form 26AS against the interest certificate your bank issued for the year.",
  ],
  benefits: [
    ["Threshold logic done right", "Applies TDS to the full interest once the limit is crossed, which is where most manual estimates go wrong."],
    ["15G vs 15H, decided", "Tests each declaration's actual conditions — age, nil tax liability and the interest ceiling that applies only to 15G."],
    ["Beyond the deduction", "Compares TDS already deducted with tax due at your slab so you know whether to expect a refund or pay the balance."],
  ],
  faqs: [
    [
      "At what interest amount does a bank start deducting TDS on an FD?",
      "From FY 2025-26 the Section 194A threshold for bank deposits is ₹50,000 of interest a year for depositors below 60 and ₹1,00,000 for senior citizens (it was ₹40,000 and ₹50,000 earlier). The limit is per bank, aggregated across all its branches.",
    ],
    [
      "Is TDS charged on the full interest or only the amount above the threshold?",
      "On the full interest. If a non-senior depositor earns ₹52,000, TDS at 10% is deducted on the entire ₹52,000, not on the ₹2,000 excess.",
    ],
    [
      "What is the difference between Form 15G and Form 15H?",
      "Form 15H is for resident senior citizens aged 60 and above and only requires that tax on estimated total income be nil. Form 15G is for residents below 60 (and HUFs) and additionally requires that total interest income not exceed the basic exemption limit. Both are self-declarations and cannot be filed without a valid PAN.",
    ],
    [
      "Does no TDS mean the FD interest is tax free?",
      "No. FD interest is fully taxable as income from other sources at your slab rate whether or not TDS was deducted; a 15G or 15H declaration only stops the deduction at source. This tool is informational and not tax advice.",
    ],
  ],
};

export default seo;
