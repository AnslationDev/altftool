const seo = {
  intro:
    "The Retirement Planner takes the amount you invest every month and compounds it forward to your retirement age at your expected return, then converts the resulting corpus into a sustainable withdrawal figure using the real return — (1 + return) ÷ (1 + inflation) − 1 — spread across the years between retirement and life expectancy. It answers the contribution-first question: given what I can actually save each month, how big does the pot get and how much can it pay out? Alongside the headline numbers you get a year-by-year table separating what you put in from what growth added.",
  useCases: [
    "You already invest a fixed 10,000 a month and want to see what that becomes by age 60 at a 10% return, and what it can safely pay out until 85.",
    "You are deciding whether to retire at 58 or 62 and want to compare the corpus and the sustainable withdrawal at each retirement age with everything else held constant.",
    "You want to show someone how much of a 30-year corpus is their own contributions versus compounding, which the year-wise table splits into invested and interest columns.",
  ],
  benefits: [
    ["Contribution-first, not goal-first", "You enter what you can save rather than a target, so the output is a plan you are already able to fund."],
    ["Withdrawals are inflation-adjusted", "The payout figure is derived from the real return rather than the nominal one, so 6% inflation is not quietly ignored in the drawdown phase."],
    ["Shows the compounding split each year", "The detail table reports cumulative invested, cumulative growth and closing balance for every year of the accumulation phase."],
  ],
  faqs: [
    [
      "How much will my monthly investment be worth at retirement?",
      "The planner compounds each monthly contribution at your expected annual return divided by 12, from your current age to your retirement age, with the contribution added at the start of each month. Enter 10,000 a month at 10% from 30 to 60 and it returns the full corpus plus how much of it was growth rather than deposits.",
    ],
    [
      "How does it work out a safe withdrawal amount?",
      "It annuitises the corpus over the retirement years — life expectancy minus retirement age, 25 years on the defaults of 60 and 85 — at the real return rather than the nominal one. Using the inflation-adjusted rate is what keeps the withdrawal sustainable rather than optimistic.",
    ],
    [
      "What return and inflation rates should I use?",
      "Use rates you can defend for your own portfolio; the defaults are 10% expected return and 6% inflation. Because the drawdown depends on the gap between the two, raising the return assumption by a point or two changes the outcome far more than most people expect — run a pessimistic case as well as a hopeful one.",
    ],
    [
      "Is this the same as a retirement corpus calculator?",
      "No — this one starts from your monthly contribution and tells you what corpus it builds, while a corpus calculator starts from your target expenses and tells you what contribution is required. Both are informational projections based on assumed rates, not financial advice; consult a licensed adviser before committing to a plan.",
    ],
  ],
};

export default seo;
