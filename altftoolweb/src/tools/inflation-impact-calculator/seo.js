const seo = {
  title: "Inflation Impact Calculator: Real Value of SIP",
  metaDescription:
    "Compound costs and salary at separate rates, deflate SIP and savings to today's rupees, and re-run it all at 3.5%, 6%, 8.5% and 12% inflation.",
  steps: [
    "Under Inflation Inputs enter Current monthly cost, Current savings, Inflation rate, Planning years, Income growth, Investment return, Monthly investment and Target real monthly value.",
    "Switch the Inflation scenario buttons between Low 3.5%, Normal 6%, High 8.5% and Stress 12%, or press Sample to load a worked example.",
    "Read the Purchasing Power Timeline, Scenario Stress Test and Savings Erosion panels, then Copy the summary or press CSV for inflation-impact-plan.csv.",
  ],
  intro:
    "Inflation Impact Calculator models a household's whole position against inflation: it compounds your monthly living cost forward at FV = P x (1 + i)^n, compounds your salary forward at its own growth rate, and reports the gap between the two, alongside the real value of your savings and SIP after inflation. Your portfolio is projected with a monthly SIP annuity plus lump-sum growth, then deflated to today's rupees, and the real return is taken from the Fisher relation (1 + return) / (1 + inflation) - 1 rather than by simply subtracting. The same numbers are re-run at four inflation scenarios — 3.5%, 6%, 8.5% and a 12% stress case.",
  useCases: [
    "Your household spends Rs 50,000 a month and your salary rises about 8% a year while costs rise 6% — the lifestyle gap line tells you whether that margin widens or closes over the next 12 years.",
    "You are running a Rs 15,000 monthly SIP at an assumed 10% return and want to know what it is worth in today's money at retirement, not the nominal figure the fund house quotes.",
    "Sanity-checking a long financial plan before you commit: switch to the 12% stress scenario to see whether the plan survives a decade of high inflation or only works in the base case.",
  ],
  benefits: [
    ["Salary growth is modelled, not assumed away", "Costs and income compound at separate rates, so you see whether your raises are actually outpacing your bills or just keeping up."],
    ["Real return uses the Fisher relation", "Dividing (1 + return) by (1 + inflation) is the correct calculation; subtracting the two rates overstates your real gain, and the difference grows as rates rise."],
    ["Four inflation scenarios side by side", "Every result is repeated at 3.5%, 6%, 8.5% and 12%, so you can see how fragile the plan is instead of trusting one assumption."],
  ],
  faqs: [
    [
      "How do I work out my real return after inflation?",
      "Divide (1 + your return) by (1 + inflation) and subtract 1. A 10% return with 6% inflation gives about 3.8% real, not the 4% you get by subtracting — and the calculator treats 3% real as the line between comfortably ahead and barely protected.",
    ],
    [
      "What will my monthly expenses be in 10 or 20 years?",
      "Multiply today's monthly cost by (1 + inflation)^years. At 6% inflation, a Rs 50,000 monthly budget becomes about Rs 89,500 in 10 years and about Rs 1,60,400 in 20 — which is why retirement targets set in today's rupees fall short.",
    ],
    [
      "How is the future value of a monthly SIP calculated?",
      "With the annuity formula: monthly amount x (((1 + r)^m - 1) / r), where r is the annual return divided by 12 and m is the number of months. The calculator then deflates that nominal total back to today's purchasing power so you can compare it against a target you set in current rupees.",
    ],
    [
      "Is my salary growth enough to keep up with inflation?",
      "It depends on the gap between the two rates, not on either rate alone: salary growing 8% against 6% inflation gains roughly 2% of real ground each year, while equal rates mean your standard of living is flat despite the raises. This is an informational model using rates you supply — a registered financial adviser should review any decision that rests on it.",
    ],
  ],
};

export default seo;
