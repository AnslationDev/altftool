const seo = {
  title: "Section 80E Calculator: Education Loan Interest",
  metaDescription:
    "Builds a year-by-year EMI schedule and marks which years fall inside Section 80E's 8-year window, plus the tax saved at your slab rate and 4% cess.",
  steps: [
    "Enter \"Loan amount (Rs)\", \"Interest rate (% per year)\" and \"Repayment tenure (years)\", then pick the financial year under \"Repayment starts in\" and your income tax slab rate.",
    "The tool builds a reducing-balance EMI schedule and labels each financial year Deductible or Expired against the 8-assessment-year window.",
    "Read the deductible interest, interest outside the 8-year window, and the tax saved at your slab plus 4% cess in the year-wise table; \"Copy result\" exports it.",
  ],
  "intro": "Section 80E Education Loan Interest Deduction estimates how much of your education loan interest is actually deductible. It builds a full EMI amortisation from your loan amount, rate and tenure, splits interest year by year, and marks which years fall inside the eight assessment years that Section 80E allows from the year repayment begins. Because the section caps the years and not the rupees, a long tenure can leave interest stranded outside the window — the calculator shows exactly how much.",
  "useCases": [
    "A graduate starting repayment on a Rs 15 lakh loan, checking the first-year deduction before submitting an investment declaration.",
    "A parent who co-signed a child's education loan working out the total tax saving across the eight eligible years.",
    "Someone deciding between a 10-year and a 15-year tenure and seeing how much interest falls outside the 80E window."
  ],
  "benefits": [
    [
      "Year-by-year amortisation",
      "Real reducing-balance EMI maths gives the interest for each financial year rather than a flat average."
    ],
    [
      "8-year window mapped out",
      "Each year is labelled deductible or expired so the eligibility period is unambiguous."
    ],
    [
      "Tax saving in rupees",
      "Applies your slab rate plus 4% cess to the deductible interest to show the actual benefit."
    ]
  ],
  "faqs": [
    [
      "Is there a maximum limit on the Section 80E deduction?",
      "No. The entire interest paid in a year is deductible, with no monetary ceiling. The limit is on time — eight assessment years starting from the year you begin repaying interest, or until the interest is fully repaid, whichever comes first."
    ],
    [
      "Can I claim the principal repayment too?",
      "No. Only the interest component qualifies under Section 80E. Principal repayment on an education loan gets no deduction."
    ],
    [
      "Who can claim the deduction?",
      "An individual who has taken the loan from a bank, notified financial institution or approved charitable institution for higher education of self, spouse, children, or a student for whom they are legal guardian."
    ],
    [
      "Is Section 80E available in the new tax regime?",
      "No. Like other Chapter VI-A deductions, 80E can be claimed only if you opt for the old tax regime."
    ]
  ]
};

export default seo;
