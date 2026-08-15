const seo = {
  title: "FD Ladder Planner: Rung Maturities and Blended",
  metaDescription:
    "Split a lump sum across 2–10 staggered FDs. Quarterly compounding gives each rung's amount, rate, maturity value and date, plus the blended yield.",
  steps: [
    "Enter \"Lump sum to invest (INR)\", \"Number of rungs (2-10)\", \"Shortest tenure (months)\" and \"Gap between rungs (months)\".",
    "Set \"Rate on shortest rung (% p.a.)\" and \"Rate change per rung (%)\", then choose \"How to split the money\" — equal, more in short tenures, or more in long tenures.",
    "Read The ladder table for each rung's Amount, Rate and Maturity with its date, plus Average effective yield and Weighted average tenure, then press \"Copy result\".",
  ],
  "intro": "Fixed Deposit Ladder Planner splits one lump sum across several FDs of staggered tenures so a deposit matures at regular intervals instead of everything being locked until a single date. It compounds each rung quarterly the way cumulative bank FDs do, applies a rising rate to longer rungs, and reports every rung's amount, rate, maturity value and maturity date alongside the blended yield and weighted average tenure. It is aimed at savers parking a bonus, retirement payout or emergency fund who want both liquidity and long-tenure rates.",
  "useCases": [
    "Spread a Rs 5 lakh bonus across 1 to 5-year FDs so one deposit matures every year.",
    "Compare a liquidity-first split that loads the short rungs against a yield-first split weighted to long tenures.",
    "Plan a retiree's income ladder so a maturity lands each year to cover annual expenses."
  ],
  "benefits": [
    [
      "Rung-by-rung detail",
      "Each deposit shows its amount, rate, maturity date and interest, not just a single total."
    ],
    [
      "Blended yield",
      "Reports the weighted average effective yield and average tenure of the whole ladder."
    ],
    [
      "Three split strategies",
      "Equal, short-tenure heavy or long-tenure heavy allocation with one dropdown."
    ]
  ],
  "faqs": [
    [
      "What is an FD ladder?",
      "Instead of one deposit for one tenure, you divide the money into several FDs maturing at staggered dates. Something matures regularly for liquidity, while the rest keeps earning higher long-tenure rates, and reinvesting each maturity smooths out interest-rate changes."
    ],
    [
      "How is FD maturity calculated here?",
      "Each rung uses the cumulative FD formula with quarterly compounding: maturity = principal x (1 + rate/400) raised to (4 x years). This matches how most Indian banks compute cumulative fixed deposits."
    ],
    [
      "Should I break an FD if rates rise?",
      "Premature withdrawal usually attracts a penalty of around 0.5% to 1% and the rate applicable for the period actually held. A ladder reduces the need to break deposits because a rung matures regularly. This is informational, not personalised advice."
    ],
    [
      "How is FD interest taxed?",
      "FD interest is taxable at your income slab rate in the year it accrues. Banks deduct TDS at 10% once interest paid to you in a financial year crosses Rs 50,000 (Rs 1,00,000 for senior citizens); Form 15G or 15H can be filed if your income is below the taxable limit."
    ]
  ]
};

export default seo;
