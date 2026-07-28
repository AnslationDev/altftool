const seo = {
  title: "Debt Payoff Calculator — Snowball vs Avalanche",
  h1: "Debt Payoff Calculator: Snowball vs Avalanche",
  metaDescription:
    "Free debt payoff calculator: enter each balance, APR and minimum, then compare snowball vs avalanche month by month. Interest, timeline and CSV export.",
  intro:
    "The Debt Payoff Calculator runs a month-by-month simulation of every debt you enter, capped at 600 months. Each active balance is charged interest at APR ÷ 12 before any payment lands, minimums go out on all debts, and the entire remaining budget is thrown at one target debt — so cleared minimums roll forward automatically. Both orderings are simulated on every edit: avalanche sorts by highest APR first (ties broken by smaller balance), snowball by smallest balance first (ties broken by higher APR), which is how the interest and timeline gap between the two methods is shown side by side. Everything runs in your browser as React state; no balances are sent to a server and nothing is saved when you close the tab.",
  useCases: [
    "Sequence a 36% credit card, a 14% personal loan and a 10.5% education loan into one payoff order on a single fixed monthly budget.",
    "See how many months come off the timeline when the extra monthly payment moves from ₹0 to ₹25,000.",
    "Export the month-by-month schedule as CSV to check payment, interest and remaining balance against your actual statements.",
  ],
  benefits: [
    [
      "Both methods, always computed",
      "Snowball and avalanche are simulated in parallel from the same inputs, so the interest difference and the month gap are on screen without switching modes.",
    ],
    [
      "Real rollover mechanics",
      "Minimums are paid on every active debt first, whatever remains of the budget lands entirely on the current target, and freed-up minimums roll into the next debt.",
    ],
    [
      "Month-level schedule you can keep",
      "Export CSV writes month, payment, interest, principal paid and remaining balance for every month to debt-payoff-schedule.csv, generated in the browser.",
    ],
    [
      "Runs locally, nothing stored",
      "Balances, APRs and minimums live only in the page's React state. No account, no upload, and the figures are gone on reload.",
    ],
  ],
  faqs: [
    [
      "Is it better to pay off debt with the snowball or the avalanche method?",
      "Avalanche costs less interest; snowball clears individual accounts sooner. Because this calculator simulates both orders from the same inputs, the Avalanche Savings card shows the exact interest difference and the month gap for your own balances instead of a general rule of thumb.",
    ],
    [
      "How does this debt payoff calculator work out the interest?",
      "It charges each active balance interest once per month at APR ÷ 12 before any payment is applied, then subtracts the minimum payments and routes the whole remaining budget to the target debt. Next month's interest is charged on the new balance, so it compounds monthly.",
    ],
    [
      "Does the payoff order follow the highest interest rate or the smallest balance?",
      "Whichever method you select. Avalanche sorts debts by APR from highest to lowest and breaks ties by the smaller balance; snowball sorts by balance from smallest to largest and breaks ties by the higher APR. Minimums are still paid on every debt under both.",
    ],
    [
      "Can I add my own debts and interest rates?",
      "Yes. Four sample debts load by default, and you can rename, edit or delete any row and add as many new ones as you need. Each debt takes a balance, an APR between 0 and 99%, and a required monthly minimum — a 0% loan from family is a valid entry.",
    ],
    [
      "How much faster do extra payments clear the debt?",
      "The whole timeline recalculates the moment you change the Extra Monthly Payment field. The slider covers ₹0 to ₹1,00,000 in ₹1,000 steps and the number box accepts larger amounts; every extra rupee goes to a single target debt once all minimums are covered, which is what shortens the schedule.",
    ],
    [
      "What does it mean when the calculator says the plan is not feasible?",
      "It means the monthly budget never clears the balances within the 600-month (50-year) simulation limit — usually because the minimums barely cover the monthly interest. The tool flags this rather than showing an impossible debt-free date.",
    ],
    [
      "Can I export or share the payoff plan?",
      "Yes, two ways. Export CSV downloads debt-payoff-schedule.csv with one row per month (month, payment, interest, principal paid, remaining balance). Copy Summary puts a plain-text block on your clipboard with the method, monthly budget, debt-free month, total interest, total paid and the payoff order.",
    ],
    [
      "What currency does the debt payoff calculator use?",
      "Indian rupees. Amounts are formatted with the en-IN locale, so ₹1,25,000 uses lakh grouping and the debt-free date appears as a short month and year. The underlying maths is currency-agnostic — the months and interest are identical if you read the figures as any other unit.",
    ],
  ],
  steps: [
    "Enter each debt with its balance, APR and required monthly minimum — edit the four sample rows or add your own.",
    "Set your extra monthly payment, then switch between Avalanche and Snowball to compare total interest and months to debt-free.",
    "Read the payoff order and remaining-balance curve, then Export CSV or Copy Summary to keep the schedule.",
  ],
};

export default seo;
