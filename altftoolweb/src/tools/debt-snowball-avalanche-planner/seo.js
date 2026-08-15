const seo = {
  title: "Debt Snowball vs Avalanche Planner — See the Interest Gap",
  metaDescription:
    "Runs both payoff orders month by month with rolled-over minimums — months to debt-free, total interest and the exact rupee gap between the two.",
  steps: [
    "Fill each debt's 'Debt name', 'Outstanding balance (INR)', 'Interest rate (% per year)' and 'Minimum monthly payment (INR)', adding rows with 'Add another debt'.",
    "Enter 'Total you can put towards debt each month (INR)' — the planner simulates both orders month by month, rolling every cleared minimum into the next target.",
    "Compare the Avalanche and Snowball cards (time to debt-free, interest, total paid) and the two payoff-order lists, then press 'Copy result'.",
  ],
  "intro": "Debt Snowball vs Avalanche Planner runs a month-by-month simulation of every loan and card you owe under two payoff orders: smallest balance first (snowball) and highest interest rate first (avalanche). Minimum payments go out on all debts, the leftover budget attacks one target, and each cleared minimum rolls into the next debt. You get months to debt-free, total interest and the exact payoff sequence for both strategies, so the choice is made on numbers rather than folklore.",
  "useCases": [
    "Decide whether to clear a 42% credit card first or the small consumer-durable EMI that would be gone in four months.",
    "See how many months earlier you finish if you raise your monthly debt budget by 5,000 rupees.",
    "Plan the order for clearing a personal loan, a card and a two-wheeler loan on one fixed salary.",
    "Show a partner the rupee cost of choosing the psychologically easier snowball order."
  ],
  "benefits": [
    [
      "True rollover simulation",
      "Freed-up minimums are recycled into the next target debt every month, exactly as both methods prescribe."
    ],
    [
      "Numbers, not opinions",
      "The interest gap and the month gap between the two orders are shown for your actual balances and rates."
    ],
    [
      "Payoff sequence included",
      "Each strategy lists which debt clears in which month, so you can print it and tick items off."
    ]
  ],
  "faqs": [
    [
      "What is the difference between the debt snowball and the debt avalanche?",
      "The snowball throws every spare rupee at the smallest balance, so accounts disappear quickly and momentum builds. The avalanche targets the highest interest rate first, which mathematically minimises total interest. Both pay the minimum on everything else."
    ],
    [
      "Which method actually saves more money?",
      "The avalanche, always — it can never cost more interest than the snowball because it removes the most expensive debt first. The gap can be small when balances and rates are similar, which is why this planner shows the exact rupee difference for your case."
    ],
    [
      "Should I still pay minimums on the other debts?",
      "Yes. Skipping a minimum triggers late fees, penal interest and a bureau record that can dent your credit score for years. Only the surplus above all minimums goes to the target debt."
    ],
    [
      "What if my budget barely covers the minimum payments?",
      "Then neither method makes much headway and the tool will warn you. Look at raising income or reducing expenses, and speak to your lenders about restructuring before the balances compound further. This is general information, not personalised financial advice."
    ]
  ]
};

export default seo;
