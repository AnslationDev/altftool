const seo = {
  "intro": "Recurring Deposit Maturity Calculator works out what a bank RD pays back at the end of its term, applying the quarterly compounding that banks actually use: every monthly instalment earns interest only for the months it stays on deposit. Enter the instalment, tenure in years and months, and the quoted rate, and you get the maturity value, total interest, an effective annual yield, and the balance at each yearly milestone. It is useful for salaried savers, parents building a short-term fund, and senior citizens comparing the extra 0.5% most banks offer.",
  "useCases": [
    "Check what Rs 5,000 a month for 5 years at 6.7% will hand back at maturity.",
    "Compare a 12-month RD against a 24-month RD before locking in a tenure.",
    "See how the senior citizen rate premium of 0.5% changes the final payout."
  ],
  "benefits": [
    [
      "True bank formula",
      "Compounds quarterly and credits each instalment only for its own months on deposit."
    ],
    [
      "Effective yield shown",
      "Solves for the real annualised return, which is higher than the quoted simple rate."
    ],
    [
      "Milestone table",
      "Shows deposited amount, interest and balance at every completed year of the term."
    ]
  ],
  "faqs": [
    [
      "How is RD maturity calculated?",
      "Each instalment is compounded quarterly for the time it remains on deposit, so the maturity value is the sum of R x (1 + r/400) raised to (months on deposit / 3) across all instalments. The first instalment earns interest for the full tenure and the last for only one month."
    ],
    [
      "Why is the effective yield higher than the quoted rate?",
      "The quoted rate is a nominal annual rate compounded quarterly. Compounding four times a year makes the effective annual yield slightly higher, which is what this calculator reports separately."
    ],
    [
      "Is RD interest taxable?",
      "Yes. Recurring deposit interest is fully taxable at your income slab rate. Banks deduct TDS at 10% once interest across your deposits with them crosses Rs 50,000 in a financial year (Rs 1,00,000 for senior citizens). This is general information, not tax advice."
    ],
    [
      "What happens if I miss an instalment?",
      "Most banks charge a small penalty per missed instalment and may extend the maturity date or reduce the payout. This calculator assumes every instalment is paid on time."
    ]
  ]
};

export default seo;
