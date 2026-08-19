const seo = {
  title: "Savings Interest Calculator: Daily Balance",
  metaDescription:
    "Simulates every day's closing balance with monthly deposits, credits interest each calendar quarter, and shows the 80TTA/80TTB tax-free portion.",
  steps: [
    "Enter Opening balance (INR), Net monthly deposit (negative for a withdrawal), Interest rate, Period (months), Start date and Monthly deposit day (1-28).",
    "Pick the Account holder option — Below 60 (Section 80TTA, ₹10,000 exempt) or Senior citizen (80TTB, ₹50,000 exempt) — or tap a preset rate chip like 2.7% or 7%.",
    "Read Interest earned with the average and lowest balances, the Quarterly interest credits table and the taxable portion; press Copy result.",
  ],
  intro:
    "Since 2010 Indian banks have been required to calculate savings account interest on the daily closing balance rather than the old minimum-balance rule, and to credit it at least once a quarter. This calculator runs a real day-by-day simulation from your opening balance and monthly savings, applies the actual/365 accrual banks use, and credits the interest at each calendar quarter end so the compounding is right. It also flags how much of the interest stays tax free under Section 80TTA or 80TTB.",
  useCases: [
    "Comparing a 3% savings account at a large bank with a 6-7% small finance bank account before moving your emergency fund.",
    "Estimating the interest a salary account will throw off over a year when you add a fixed amount every month.",
    "Checking a quarterly interest credit on your passbook against what the daily-balance rule should have produced.",
  ],
  benefits: [
    ["Daily balance, not averages", "Simulates every day and every monthly deposit instead of applying a flat annual rate."],
    ["Quarterly compounding modelled", "Credits interest at each calendar quarter end so later quarters earn on the interest already paid."],
    ["Tax view included", "Applies the ₹10,000 Section 80TTA limit (₹50,000 under 80TTB for senior citizens) to show the taxable portion."],
  ],
  faqs: [
    [
      "How is savings account interest calculated in India?",
      "Banks apply the rate to the closing balance of each day, accrue it through the quarter, and credit the total at the end of the quarter. RBI mandated this daily-product method with effect from 1 April 2010.",
    ],
    [
      "How often is savings interest credited?",
      "At least quarterly under RBI norms — most banks credit on 30 June, 30 September, 31 December and 31 March. A few private banks credit monthly, which compounds slightly faster.",
    ],
    [
      "Is savings account interest taxable?",
      "Yes, it is taxable as income from other sources, but resident individuals below 60 can deduct up to ₹10,000 a year under Section 80TTA and senior citizens up to ₹50,000 under Section 80TTB — both available only under the old tax regime. This is informational, not tax advice.",
    ],
    [
      "Do banks deduct TDS on savings account interest?",
      "No. Section 194A applies to fixed and recurring deposits, not to savings bank interest, so no TDS is deducted — but you must still declare the interest in your return and pay tax on the portion above the 80TTA or 80TTB limit.",
    ],
  ],
};

export default seo;
