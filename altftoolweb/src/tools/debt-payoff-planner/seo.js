const seo = {
  title: "Debt Payoff Planner: Months and Interest to Clear",
  metaDescription:
    "Charges interest at the annual rate ÷ 12 on the falling balance each month and reports months to payoff and total interest for Snowball and Avalanche.",
  steps: [
    "Enter Total Debt Amount, Interest Rate (% p.a.), Minimum Monthly Payment and Extra Monthly Payment — the defaults are ₹5,00,000 at 18% with ₹5,000 plus ₹2,000.",
    "Press Calculate; the projection charges the annual rate divided by 12 on the outstanding balance each month and runs for up to 600 months.",
    "The results panel shows Total Debt with four tiles — Snowball and Avalanche \"Months to Pay Off\" and \"Total Interest\" — and reads N/A when the monthly payment never outruns the interest charge.",
  ],
  intro:
    "The Debt Payoff Planner amortises your total debt month by month — charging interest at the annual rate divided by 12, then applying your minimum payment plus any extra straight to principal — and reports how many months the balance takes to clear and how much interest you pay along the way, under both the Snowball and Avalanche headings. Because it works from one combined balance, the two figures match: the ordering choice only changes the outcome once you split the balance into separate debts at different rates. It is for anyone deciding how much extra to put toward debt each month and wanting to see the payoff date move.",
  useCases: [
    "Testing what an extra 2,000 a month on top of your minimum does to a payoff date that currently sits years away.",
    "Deciding whether to keep paying the card minimum or consolidate, by seeing how much of each payment is being eaten by interest at an 18% rate.",
    "Setting a realistic debt-free target date before agreeing a repayment amount with a lender or a partner.",
  ],
  benefits: [
    [
      "Extra payments are modelled, not assumed",
      "Interest is recalculated on the falling balance every month, so an extra payment compounds into an earlier payoff instead of just reducing the total by its face value.",
    ],
    [
      "Interest cost shown as a separate number",
      "Total interest is reported alongside the payoff length, which is what makes the case for paying more than the minimum concrete.",
    ],
    [
      "Impossible plans are visible",
      "The projection runs up to 600 months, so a payment too small to outrun the interest returns no payoff date rather than a comfortable-looking answer.",
    ],
  ],
  faqs: [
    [
      "What is the difference between the debt snowball and debt avalanche methods?",
      "The avalanche pays the highest-interest debt first, which minimises total interest; the snowball pays the smallest balance first, which clears individual debts sooner and keeps motivation up. The difference only exists across multiple debts at different rates — on a single combined balance, as modelled here, both produce the same payoff month and the same interest total.",
    ],
    [
      "How is the monthly interest calculated?",
      "The annual rate is divided by 12 and applied to the outstanding balance each month, so 18% per year becomes 1.5% per month. On a 500,000 balance that is 7,500 of interest in the first month alone, and only the payment above that figure reduces what you owe.",
    ],
    [
      "Why does my debt never get paid off in the projection?",
      "Because your total monthly payment is at or below the monthly interest charge, so the principal never falls. At 1.5% monthly on a 500,000 balance you must pay more than 7,500 a month before a single rupee comes off the balance — raise the minimum or extra payment until the payoff month appears.",
    ],
    [
      "Should I pay off debt or save first?",
      "As a general rule, debt costing more than you can reliably earn on savings is worth clearing first, which is why credit card balances at 18% or more are usually the priority over a savings account. Keep a small emergency buffer so a surprise expense does not put you straight back on the card, and speak to a qualified financial adviser about your own situation — this tool is informational, not financial advice.",
    ],
  ],
};

export default seo;
