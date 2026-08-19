const seo = {
  title: "DCA Calculator: Weekly to Yearly Growth",
  metaDescription:
    "Compound a lump sum plus recurring contributions weekly to yearly. Returns projected value, total invested, ROI, CAGR, inflation-adjusted and ±2% cases.",
  steps: [
    "Under \"Investment Details\" enter \"Initial Investment\" and \"Recurring Investment\", then pick \"Investment Frequency\" — Weekly, Bi-Weekly, Monthly, Quarterly or Yearly — and a Currency (INR ₹, USD $, EUR € or GBP £).",
    "Set \"Expected Annual Return\", \"Duration (Years)\", \"Inflation Rate\" and the \"Compounding\" basis; the per-period rate is derived from the compounding frequency and the contribution frequency together.",
    "Read \"Estimated portfolio\" with the Total Invested, Estimated Profit, CAGR and Inflation Adjusted cards and the Scenario Comparison at ±2%, then press \"Export CSV\" to download dca-calculator-schedule.csv.",
  ],
  intro:
    "The DCA Calculator projects what a dollar-cost-averaging plan could grow to by compounding a lump sum plus a fixed recurring contribution period by period, using a per-period rate of (1 + annual return / compounding frequency)^(compounding frequency / contributions per year) − 1. You set the contribution rhythm — weekly (52), bi-weekly (26), monthly (12), quarterly (4) or yearly (1) — the expected annual return, the horizon and an inflation rate, and it returns the projected value, total invested, profit, ROI and an inflation-adjusted figure, plus best and worst cases at ±2% on the return. It is a projection model for planning, not a forecast of what any real investment will do.",
  useCases: [
    "Deciding whether to invest 10,000 a month or 2,500 a week into the same plan, and seeing how much the extra compounding periods actually change the ending balance.",
    "Checking what a 10-year SIP at an assumed 12% would be worth in today's money after 6% inflation, before committing to the contribution amount.",
    "Stress-testing a retirement contribution plan by comparing the average case against the −2% worst case to see how much of the target depends on the return assumption holding.",
  ],
  benefits: [
    [
      "Contribution frequency actually changes the maths",
      "The per-period rate is derived from your compounding frequency, so weekly and monthly plans of the same annual total produce genuinely different curves rather than the same number relabelled.",
    ],
    [
      "Real terms as well as nominal",
      "The projected value is also divided by (1 + inflation)^years, so you see purchasing power at the end of the horizon next to the headline figure.",
    ],
    [
      "Three return scenarios side by side",
      "Every projection is rerun at +2% and −2% on your expected return, which shows the spread a single assumption is hiding.",
    ],
  ],
  faqs: [
    [
      "What is dollar-cost averaging?",
      "Dollar-cost averaging is investing a fixed amount on a fixed schedule regardless of price, so you buy more units when prices are low and fewer when they are high. It removes the timing decision from each contribution; this calculator models the resulting balance assuming a steady compound return rather than actual price swings.",
    ],
    [
      "How does the calculator convert my annual return into a per-period rate?",
      "It uses (1 + annual return / compounding frequency) raised to the power of (compounding frequency / contributions per year), minus 1. So a 12% return compounded monthly with weekly contributions gives a weekly rate of about 0.23%, not simply 12% divided by 52.",
    ],
    [
      "Should I invest weekly or monthly?",
      "More frequent contributions put money to work sooner, so weekly investing of the same annual total ends slightly ahead of monthly in this model — but the gap is usually small compared with the effect of the contribution amount and the return assumption. Weigh it against transaction costs and whether the schedule matches when you actually get paid.",
    ],
    [
      "Why is the inflation-adjusted value so much lower?",
      "Because it divides the ending balance by (1 + inflation rate) raised to the number of years. At 6% inflation over 10 years that divisor is about 1.79, so a projected balance is worth roughly 56% of its face value in today's money. These figures are illustrative projections, not investment advice — talk to a licensed financial adviser before acting on them.",
    ],
  ],
};

export default seo;
