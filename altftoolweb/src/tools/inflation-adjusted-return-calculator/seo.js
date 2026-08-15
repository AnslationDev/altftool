const seo = {
  title: "Inflation Adjusted Return Calculator – Real Returns",
  metaDescription:
    "Fisher-equation real return from a nominal rate and inflation, with optional tax on returns and your corpus restated in today's rupees.",
  steps: [
    "Enter the Investment amount (₹), Nominal return (% p.a.), Inflation (% p.a.), Period (years) and an optional Tax on returns (%).",
    "Or apply a Quick scenario such as 'Bank FD 7% taxed at 30%' — the real return updates instantly using (1 + nominal) ÷ (1 + inflation) − 1.",
    "Read the real annual return, the value in today's money and the purchasing power lost to inflation, then click Copy result.",
  ],
  "intro": "Inflation Adjusted Return Calculator converts a headline (nominal) return into the real return you actually keep once inflation is stripped out, using the exact Fisher equation rather than the rough 'return minus inflation' shortcut. It also shows what your investment is worth in today's money after any number of years, and optionally accounts for tax on returns. It's for investors comparing FDs, debt funds and equity on a like-for-like basis.",
  "useCases": [
    "Check whether a 7% fixed deposit actually beats 6% inflation once 30% tax is applied.",
    "Compare a 12% equity return against inflation over a 10-year holding period in real terms.",
    "Show a client or family member how much purchasing power a savings account loses each year."
  ],
  "benefits": [
    [
      "Exact Fisher maths",
      "Uses (1 + nominal) ÷ (1 + inflation) − 1 instead of simple subtraction, which overstates real returns."
    ],
    [
      "Today's-money view",
      "Shows the future corpus restated in current rupees so the number means something."
    ],
    [
      "Optional tax input",
      "Apply a tax rate on returns to compare taxable and tax-free instruments fairly."
    ]
  ],
  "faqs": [
    [
      "What is the difference between nominal and real return?",
      "Nominal return is the headline percentage an investment quotes. Real return is what's left after inflation, and it's the only figure that tells you whether your purchasing power actually grew."
    ],
    [
      "Why not just subtract inflation from the return?",
      "Subtraction is a quick approximation that overstates the real return, and the gap widens as rates rise. At 12% return and 6% inflation, subtraction gives 6% but the exact real return is about 5.66%."
    ],
    [
      "Can the real return be negative?",
      "Yes. Any time inflation runs higher than your post-tax return — common with savings accounts and low-yield deposits — the real return is negative and your money buys less over time."
    ],
    [
      "What inflation rate should I use?",
      "Many Indian investors plan with 6% as a long-run CPI assumption, but personal inflation for education, healthcare or rent is often higher. Run the calculation at a couple of rates to see the range."
    ]
  ]
};

export default seo;
