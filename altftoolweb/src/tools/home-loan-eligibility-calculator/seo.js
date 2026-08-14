const seo = {
  title: "Home Loan Eligibility Calculator: FOIR and RBI LTV Cap",
  metaDescription:
    "Estimate your sanction from income, existing EMIs, age and property value — the lower of the FOIR repayment limit and the RBI loan-to-value ceiling.",
  steps: [
    "Enter Net monthly income (INR), Other monthly income (rent, co-applicant), Existing monthly EMIs (INR), FOIR allowed by lender (%), Interest rate (% per year), Tenure wanted (years), Your age (years), Employment type and Property agreement value (INR).",
    "Figures recompute as you type, and the \"Use the typical FOIR for this income\" button fills in the FOIR band lenders normally allow at that income level.",
    "Estimated eligible loan gives the sanction and the tenure it assumes, above rows for Eligible on repayment capacity, Eligible on RBI LTV ceiling, Binding constraint, Indicative EMI, Own contribution (down payment) and Total interest over the tenure; press Copy result.",
  ],
  intro:
    "This calculator estimates the home loan a lender is likely to sanction by applying two tests at once: the FOIR (Fixed Obligation to Income Ratio) cap on how much of your monthly income can go to EMIs, and the RBI loan-to-value ceiling on how much of the property value can be financed. The EMI you can afford is capitalised into a principal with the reducing-balance present value formula P = EMI x (1 - (1 + r)^-n) / r, and the sanction is the lower of the income-based and LTV-based limits. It is built for first-time buyers sizing a budget before they pay a booking amount.",
  useCases: [
    "Checking how much you can borrow before shortlisting flats, so you do not book a property you cannot finance",
    "Seeing whether closing a car loan or personal loan would free enough FOIR headroom to lift your sanction",
    "Testing how a co-applicant's salary or rental income changes the eligible amount and the down payment you must arrange",
  ],
  benefits: [
    ["Shows the binding limit", "Tells you whether income or the LTV ceiling is capping your loan."],
    ["Age-aware tenure", "Trims the tenure so the loan closes by 60 for salaried or 65 for self-employed borrowers."],
    ["Down payment in the open", "Reports the own contribution and effective LTV, not just the loan figure."],
  ],
  faqs: [
    [
      "How much home loan can I get on a 1 lakh salary?",
      "At a net income of Rs 1 lakh a month with no existing EMIs, a 60% FOIR allows an EMI of about Rs 60,000, which capitalises to roughly Rs 69 lakh over 20 years at 8.5%. Existing EMIs are deducted from that allowance rupee for rupee, so a Rs 10,000 car loan EMI cuts the eligible amount to about Rs 58 lakh.",
    ],
    [
      "What is FOIR in a home loan?",
      "FOIR is the share of your monthly income that a lender lets you spend on all fixed obligations combined, including the new EMI. Indian lenders commonly allow 50% at lower incomes rising to about 65% at higher incomes, because a high earner keeps more residual income after the same percentage is taken.",
    ],
    [
      "What is the maximum loan-to-value ratio on a home loan in India?",
      "RBI norms cap housing loan LTV at 90% of property value for loans up to Rs 30 lakh, 80% for loans above Rs 30 lakh up to Rs 75 lakh, and 75% above Rs 75 lakh. Stamp duty and registration charges are excluded from the property value used for this test, so budget for them separately.",
    ],
    [
      "Why does my age reduce the loan I am eligible for?",
      "Lenders want the loan repaid by superannuation, usually age 60 for salaried and 65 for self-employed borrowers, so a 50-year-old salaried applicant gets at most a 10-year tenure. A shorter tenure means a higher EMI per rupee borrowed, which shrinks the principal the same FOIR allowance can support. Adding a younger co-applicant is the usual way around this, and a lender or financial adviser can confirm what your case allows.",
    ],
  ],
};

export default seo;
