const seo = {
  title: "Dividend Tax Calculator India: Slab Rate, 194 TDS",
  metaDescription:
    "Dividend taxed at your slab rate with surcharge capped at 15%, 4% cess, the section 57 interest cap of 20%, and section 194 TDS credited per company.",
  steps: [
    "List each payer under \"Dividend received in the financial year\" — Company or fund 1 with its Dividend received (INR) — and press \"Add another payer\" for the rest, so the ₹10,000 section 194 threshold is applied company by company.",
    "Under \"Your tax position\" set \"Interest on money borrowed to invest (INR)\", \"Your marginal slab rate\" (0 to 30%) and \"Surcharge on total income\", and tick \"PAN furnished to the registrar\" or \"Form 15G / 15H filed for nil TDS\" as they apply.",
    "\"Total tax on dividend income\" appears with rows for \"Interest deduction allowed (max 20%)\", Taxable dividend, \"Health and education cess at 4%\", \"TDS already deducted under section 194\" and Balance tax payable or Refund due, plus a \"TDS company by company\" table; Copy result copies it.",
  ],
  intro:
    "This calculator works out the income tax a resident individual owes on dividends from Indian companies and mutual funds, which since the Finance Act 2020 are taxed at the shareholder's own slab rate as income from other sources under section 56(2)(i). It applies the only deduction the law allows — interest on money borrowed to buy the shares, capped at 20% of the dividend under the second proviso to section 57(1) — then credits the tax already withheld under section 194 and shows what is still payable. It is aimed at retail investors reconciling their Annual Information Statement before filing.",
  useCases: [
    "Check whether the 10% TDS your registrar deducted covers the tax due, or whether a 30%-slab investor still owes the balance.",
    "See how much of the interest on a loan-against-shares actually reduces dividend income once the 20% ceiling bites.",
    "Work out whether dividend receipts push your balance tax past ₹10,000 and trigger advance tax instalments under section 208.",
  ],
  benefits: [
    ["Per-payer TDS logic", "Applies the ₹10,000 section 194 threshold company by company, the way registrars actually deduct."],
    ["Section 57 cap built in", "Splits your interest cost into the allowed 20% and the part that is disallowed outright."],
    ["Surcharge ceiling honoured", "Restricts surcharge on dividend to 15% even when your other income sits in a higher band."],
  ],
  faqs: [
    [
      "How much tax do I pay on dividend income in India?",
      "Dividend is added to your total income and taxed at your slab rate, plus applicable surcharge and 4% health and education cess. For someone in the 30% slab with no surcharge, ₹1,00,000 of dividend costs ₹31,200 in tax.",
    ],
    [
      "What is the TDS limit on dividend for FY 2025-26?",
      "₹10,000 per company for the financial year. The Finance Act 2025 raised the section 194 threshold from ₹5,000 to ₹10,000 with effect from 1 April 2025, and the rate stays at 10% where PAN is on record, or 20% under section 206AA if it is not.",
    ],
    [
      "Can I deduct demat charges or brokerage from dividend income?",
      "No. The second proviso to section 57(1) allows only interest on money borrowed to make the investment, and even that is limited to 20% of the dividend income. Brokerage, demat annual charges and advisory fees are not deductible against dividend.",
    ],
    [
      "Is dividend still tax-free up to ₹10 lakh?",
      "No. That exemption under section 10(34), along with the 10% tax under section 115BBDA, ended when Dividend Distribution Tax was abolished from 1 April 2020. All dividend received on or after that date is taxable in the shareholder's hands with no exempt slab.",
    ],
  ],
};

export default seo;
