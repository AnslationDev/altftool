const seo = {
  title: "Invoice Late Fee Calculator: Interest by Day",
  metaDescription:
    "Price an overdue invoice on actual/365, actual/360 or 30/360, with grace days, fixed or % fees, and presets for 1.5%/month, UK, EU and MSMED terms.",
  steps: [
    "Choose a preset under \"Start from a known term set\" (1.5% a month, UK statutory, EU Directive 2011/7/EU, MSMED) or enter \"Invoice amount outstanding\", \"Due date\" and \"Payment date (or today, if unpaid)\".",
    "Set \"Interest rate (% a year)\", \"Grace period (days)\", \"Day-count basis\", \"Interest accrual\", plus any \"Fixed / statutory fee\" or \"One-off penalty (% of invoice)\".",
    "Read \"Total now payable\" with the \"Effective annual cost of the charge\" and \"Days counted for interest\", then press \"Copy result\".",
  ],
  intro:
    "This calculator works out what an overdue invoice actually costs: interest for the days it ran late, plus any fixed or percentage late fee your terms allow. It applies the day-count basis you specify — actual/365, actual/360 or 30/360 US bond basis — and either simple interest or monthly or daily compounding, then shows the effective annual cost of the charge so you can see whether it is compensatory or punitive. Presets cover the common 1.5% a month US invoice term, the UK statutory formula of base rate plus 8 percentage points with fixed compensation of £40 to £100, EU Directive 2011/7/EU, and the Indian MSMED Act's monthly-rest interest.",
  useCases: [
    "Price the interest due on an invoice paid 47 days late under 1.5% per month terms.",
    "Add UK statutory fixed compensation of £70 to a £6,000 debt alongside the interest claim.",
    "Compare what actual/365 and 30/360 produce before you put a figure in a demand letter.",
  ],
  benefits: [
    ["Basis actually matters", "The same rate and dates give a different answer on actual/365, actual/360 and 30/360 — all three are here."],
    ["Grace periods respected", "Interest starts only after the contractual grace days have run, not from the due date."],
    ["Shows the real annual cost", "Converts the whole charge back to an effective annual percentage, which is what a court or client will ask about."],
  ],
  faqs: [
    [
      "How do I calculate interest on an overdue invoice?",
      "Multiply the outstanding amount by the annual rate, then by the days late divided by the days in a year for your basis. On a 100,000 invoice at 12% paid 30 days late on actual/365 that is 100,000 × 0.12 × 30/365 = 986.30.",
    ],
    [
      "What is a reasonable late fee on an invoice?",
      "The most common commercial term is 1.5% per month, which is 18% a year, and many contracts pair it with a small fixed administration fee. Rates far above the cost of the delay risk being treated as an unenforceable penalty rather than compensation, and several jurisdictions cap them outright.",
    ],
    [
      "What is the UK statutory late payment interest rate?",
      "For business-to-business debts the Late Payment of Commercial Debts (Interest) Act 1998 sets statutory interest at 8 percentage points above the Bank of England base rate in force on the last day of the six-month period in which the debt became late. Section 5A adds fixed compensation of £40 for debts under £1,000, £70 up to £9,999.99 and £100 at £10,000 or more.",
    ],
    [
      "Does actual/360 or actual/365 give a bigger late fee?",
      "Actual/360 gives more, because dividing by 360 rather than 365 makes each day worth about 1.4% more interest. Over 30 days at 12% on 100,000 the difference is 1,000 versus 986.30, so state the basis explicitly in your terms.",
    ],
  ],
};

export default seo;
