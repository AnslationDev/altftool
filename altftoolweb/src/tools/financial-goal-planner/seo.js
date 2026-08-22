const seo = {
  title: "Financial Goal Planner: Monthly Contribution",
  metaDescription:
    "Enter goal amount, years, expected return and current savings in rupees; get the monthly contribution needed after existing savings are compounded in.",
  steps: [
    "Enter 'Goal Amount' (₹), 'Time Horizon (Years)', 'Expected Return (% p.a.)' and 'Current Savings for Goal'.",
    "Click Calculate — the planner compounds your current savings to the goal date and funds only the remaining shortfall with the sinking-fund formula.",
    "Read 'Monthly Contribution Needed' as the headline result, with 'Future Value of Current Savings' shown beneath it.",
  ],
  intro:
    "This planner works out the monthly contribution you need to reach a money goal by a chosen date, using the sinking-fund formula PMT = shortfall × i ÷ ((1 + i)^n − 1) where i is the annual return divided by 12 and n is the number of months. It first grows what you have already saved at the annual rate you enter — current savings × (1 + r)^years — and only asks you to fund the gap that is left. Amounts are shown in Indian rupees, and the result is a planning estimate, not a guaranteed return.",
  useCases: [
    "Your child starts college in 10 years, the fee estimate is ₹50 lakh, and you want to know what to set up as a monthly SIP starting this month",
    "You have ₹5 lakh already earmarked for a house deposit and need to see how much of the target that money alone will cover by the time you buy",
    "You are comparing a 7-year and a 10-year timeline for the same goal to see how much the extra three years cut the monthly outgo",
  ],
  benefits: [
    [
      "Credits your existing savings first",
      "The corpus you already hold is compounded to the goal date and subtracted from the target, so you are not told to save for money you have.",
    ],
    [
      "Answers in monthly terms, not just a total",
      "The headline figure is the contribution per month, which is what you actually set up as a standing instruction — the future value of current savings is shown alongside it.",
    ],
    [
      "Degrades sensibly at a zero return",
      "If you enter 0% expected return it divides the shortfall evenly across the months instead of failing, so a pure cash savings plan still gets a number.",
    ],
  ],
  faqs: [
    [
      "How much do I need to save monthly for a ₹50 lakh goal in 10 years?",
      "About ₹18,100 a month if you already have ₹5 lakh set aside and assume a 10% annual return. That ₹5 lakh grows to roughly ₹12.97 lakh over the decade, leaving a ₹37.03 lakh shortfall to fund through monthly contributions.",
    ],
    [
      "What return rate should I enter?",
      "Use a rate that matches the asset you will actually hold, not a best case — a debt or fixed-deposit style plan and a diversified equity plan sit far apart, and the tool applies whatever single rate you type for the whole period. This is an informational projection; talk to a licensed adviser before committing to a product.",
    ],
    [
      "Does it account for inflation?",
      "No. Both the goal amount and the return you enter are nominal, so if your target is a future cost, inflate it yourself before entering it. A common approach is to raise today's cost by an assumed inflation rate for the number of years, then use that figure as the goal.",
    ],
    [
      "How many goals should I plan at once?",
      "Three to five major goals is the usual working limit — beyond that the monthly contributions compete and none of them get funded properly. Run the calculation once per goal and add up the monthly figures to check the total against what you can genuinely commit each month.",
    ],
  ],
};

export default seo;
