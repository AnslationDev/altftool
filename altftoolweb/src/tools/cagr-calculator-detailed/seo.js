const seo = {
  "intro": "CAGR Calculator Detailed turns a start value, an end value and a holding period into the compound annual growth rate — the single steady yearly rate that would have taken you from one to the other. Alongside the CAGR it shows absolute return, the growth multiple, the doubling time and a year-wise path at that constant rate. Useful for comparing mutual funds, stocks, property or business revenue over unequal periods.",
  "useCases": [
    "Compare a stock held for 7 years 6 months against a fund held for 3 years on an annualised basis.",
    "Convert a headline 'my money grew 2.5x' into a per-year rate you can benchmark against an index.",
    "Check a business's revenue growth rate between two financial years."
  ],
  "benefits": [
    [
      "Years and months",
      "Handles part-years, so a 7-year-6-month holding is annualised correctly rather than rounded."
    ],
    [
      "Absolute vs annualised",
      "Shows total return and simple average next to CAGR so the difference is obvious."
    ],
    [
      "Doubling time included",
      "Gives the exact doubling period at that rate plus the Rule of 72 shortcut for comparison."
    ]
  ],
  "faqs": [
    [
      "What is the CAGR formula?",
      "CAGR = (end value ÷ start value) raised to the power of 1/number of years, minus 1. Multiply by 100 to express it as a percentage."
    ],
    [
      "How is CAGR different from absolute return?",
      "Absolute return is the total percentage gain regardless of time. CAGR spreads that gain across the holding period as a compounded yearly rate, which is the only fair way to compare investments held for different lengths of time."
    ],
    [
      "Can CAGR be used when I invested in instalments?",
      "No. CAGR assumes one lump sum in and one value out. For SIPs or any series of cash flows at different dates, use XIRR instead."
    ],
    [
      "Does a high CAGR mean the investment was safe?",
      "No. CAGR smooths the path into one steady number and hides the drawdowns along the way. Two investments with the same CAGR can have very different volatility."
    ]
  ]
};

export default seo;
