const seo = {
  title: "SWP Calculator: How Long Will Your Corpus Last?",
  metaDescription:
    "Month-by-month SWP simulation: enter corpus, monthly withdrawal, return and annual step-up to see exactly when the money runs out — or never does.",
  steps: [
    "Enter your Investment corpus (₹), Monthly withdrawal (₹), Expected return (% per year) and an optional Annual step-up (%).",
    "The simulator applies growth first and the withdrawal second for every month, up to a 100-year cap.",
    "Read how long the corpus lasts, the never-ending withdrawal limit and the year-by-year balance table, then click Copy result.",
  ],
  "intro": "SWP Withdrawal Calculator shows how long a mutual fund corpus can fund a Systematic Withdrawal Plan once you fix the monthly payout and an expected rate of return. It simulates every month — growth first, then the withdrawal — so you see the exact number of payouts, the total cash taken out, and whatever balance survives. It is built for retirees, FIRE planners and anyone converting a lumpsum into a monthly income.",
  "useCases": [
    "Check whether a Rs 50 lakh retirement corpus can pay Rs 30,000 a month for 25 years.",
    "Add a 5-8% annual step-up to keep withdrawals in line with inflation and see how much sooner the corpus empties.",
    "Find the maximum monthly withdrawal that never touches the principal at your assumed return."
  ],
  "benefits": [
    [
      "Month-by-month simulation",
      "Growth and withdrawal are applied every month, not annualised, so the corpus life is realistic."
    ],
    [
      "Inflation step-up built in",
      "Increase the payout each year and instantly see the cost in corpus longevity."
    ],
    [
      "Year-wise balance table",
      "Track opening balance, cash withdrawn and closing balance for every year of the plan."
    ]
  ],
  "faqs": [
    [
      "How long will my corpus last in an SWP?",
      "It depends on the gap between your withdrawal and the growth on the remaining balance. If the monthly withdrawal is below corpus x (annual return / 12), the corpus theoretically lasts forever; above that it depletes, and this calculator counts the exact number of months."
    ],
    [
      "How is SWP from an equity mutual fund taxed?",
      "Each withdrawal is treated as a redemption, so only the gain portion of every unit sold is taxed as capital gains — short-term if held under 12 months for equity funds, long-term after that. This tool shows pre-tax figures, so check current rates or ask a tax adviser."
    ],
    [
      "Is an SWP better than a fixed monthly interest payout?",
      "An SWP returns your own units plus growth, so the payout is not guaranteed and the corpus can fall in bad markets, but it stays invested and is usually more tax-efficient than fully taxable interest income. It is informational guidance, not investment advice."
    ],
    [
      "What return should I assume for an SWP?",
      "Conservative planners use 6-8% for hybrid or debt-oriented funds and 9-11% for equity-heavy portfolios. Run the calculator at two or three rates to see how sensitive your plan is to a bad decade."
    ]
  ]
};

export default seo;
