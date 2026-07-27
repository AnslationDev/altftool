const seo = {
  "intro": "Mutual Fund XIRR Calculator turns a messy list of dated purchases and redemptions into one annualised return figure. You enter every transaction with its exact date, add the current portfolio value and its valuation date, and the tool solves for the rate that discounts all those cash flows back to zero — the same definition Excel's XIRR uses. It is built for investors comparing an actual SIP or lumpsum folio against a benchmark or an FD rate.",
  "useCases": [
    "Measure the real return on a SIP where you skipped some months or topped up in a market crash.",
    "Work out the return on a folio you partly redeemed, since absolute return ignores when the money moved.",
    "Compare a fund's XIRR with a fixed deposit rate before deciding to switch."
  ],
  "benefits": [
    [
      "Handles irregular dates",
      "Any mix of purchase dates, top-ups and partial redemptions is supported, not just neat monthly SIPs."
    ],
    [
      "Excel-accurate solver",
      "Newton-Raphson with a bisection fallback on a 365-day year, so negative and unusual returns still resolve."
    ],
    [
      "Absolute vs annualised",
      "Shows total gain and absolute return alongside XIRR so you can see how much timing changed the picture."
    ]
  ],
  "faqs": [
    [
      "What is XIRR in mutual funds?",
      "XIRR is the annualised rate of return that accounts for the exact date and size of every cash flow. For SIPs and any portfolio with multiple transactions it is the correct measure, because CAGR assumes a single investment held for the whole period."
    ],
    [
      "Why is my XIRR different from absolute return?",
      "Absolute return simply compares total value with total invested and ignores time. If most of your money went in recently, absolute return looks small while XIRR can be high — and the reverse for old investments."
    ],
    [
      "How do I enter a redemption or SWP withdrawal?",
      "Add it as a row with its date and choose Redemption (money out). Money you took out counts as a positive cash flow, and the current value of whatever is still invested goes in the valuation field."
    ],
    [
      "What is a good XIRR for an equity fund?",
      "Over long periods, diversified Indian equity funds have historically delivered roughly 10-14% XIRR, while debt funds sit nearer 6-8%. Past returns are not a promise of future ones — treat this as informational, not investment advice."
    ]
  ]
};

export default seo;
