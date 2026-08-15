const seo = {
  title: "Daily Spending Calculator — Your Safe-to-Spend",
  metaDescription:
    "One safe-to-spend number for today: (income − bills − savings − spent) ÷ days left this month, with pace warnings and food, transport and fun envelopes.",
  steps: [
    "Enter Monthly take-home income, list Fixed commitments with Add row, and set the Savings goal as a 0–60% of income slider or a Fixed amount.",
    "Log Discretionary spent so far this month — day-to-day food, travel and going out, not the bills already listed.",
    "Read the Safe to spend per day figure with the Rest of this week and Next 7 days allowances and the pace verdict, then click Copy plan.",
  ],
  intro:
    "The Safe-to-Spend Daily Planner answers one question — how much can I spend today — using the formula (income − fixed commitments − savings goal − already spent) ÷ days left in this month. Because savings is subtracted before the daily number is worked out, you save by default rather than saving whatever survives to month end. It suits salaried people on a monthly cycle who keep overshooting in the first fortnight and running dry in the last one; amounts are shown in Indian rupees.",
  useCases: [
    "It is the 14th, you have already spent more than you meant to, and you need to know what the rest of the month allows per day without touching your savings",
    "You want to know whether a weekend trip fits, by checking the rest-of-week and next-seven-days allowances before you book anything",
    "Your rent or EMI just went up and you want to see, in one number, what that does to everyday spending before you commit to the new figure",
  ],
  benefits: [
    ["Recalculates from days remaining, not the whole month", "A heavy weekend does not blow the budget — it lowers tomorrow's number, and the plan rebalances each time you log spending."],
    ["Pace warning on day 8, not day 28", "Actual spend per day elapsed is compared against the flat plan, and flags when you drift more than 5% either way."],
    ["Splits the daily number into envelopes", "Food, transport and fun each get a share of the daily figure, so one takeaway does not quietly eat the travel budget."],
  ],
  faqs: [
    [
      "How is the safe-to-spend figure calculated?",
      "Discretionary pool minus what you have already spent, divided by the days remaining in the month including today. The pool itself is take-home income minus every fixed commitment you list minus your savings target, so on a 30-day month with a pool of 30,000 and nothing spent yet the figure is 1,000 per day.",
    ],
    [
      "What counts as a fixed commitment versus daily spending?",
      "Anything that leaves your account whether or not you get out of bed — rent, EMIs, insurance, school fees, subscriptions — goes in commitments. Food, travel and going out are daily spending, and only that second group belongs in the spent-so-far box, otherwise your bills get deducted twice.",
    ],
    [
      "How much should I set as the savings goal?",
      "The slider runs from 0% to 60% of income, and a commonly cited starting point is 20%, which is what the planner opens on. What is right for you depends on your debts, dependants and emergency fund, so treat the number as a planning input rather than advice — a qualified financial adviser can set it against your full picture.",
    ],
    [
      "Does my plan stay saved?",
      "Yes — income, commitments, savings mode, spend-so-far and envelope shares are written to this browser's local storage, so the plan is still there next visit. It stays on this device only and is never uploaded; clearing site data or using a different browser starts you from the defaults again.",
    ],
  ],
};

export default seo;
