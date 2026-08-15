const seo = {
  title: "Loan Eligibility from Salary: FOIR and RBI LTV",
  metaDescription:
    "Enter take-home pay, running EMIs, rate and tenure to get the loan a FOIR band supports, capped by the RBI 90/80/75% loan-to-value ladder for home loans.",
  steps: [
    "Enter Net take-home salary (INR a month), EMIs already running, Interest rate (% a year) and Tenure (months).",
    "Pick Home loan and add the Property value, or switch FOIR to Enter my lender's FOIR instead of the typical band for your income.",
    "Read Loan you are eligible for and which ceiling capped it, with EMI ceiling at this FOIR, Own contribution needed and Income left after all EMIs.",
  ],
  intro:
    "Loan eligibility from salary is set by the fixed obligation to income ratio: the share of your net monthly income a lender will let all EMIs consume, commonly 40% to 55% depending on how much you take home. This calculator turns that ceiling into a maximum EMI, converts the EMI into a loan amount with the present-value-of-an-annuity formula, and for home loans applies the RBI loan-to-value ladder of 90% up to Rs 30 lakh, 80% up to Rs 75 lakh and 75% above that. The result is the smaller of the two ceilings, which is what a bank would actually sanction.",
  useCases: [
    "Checking how large a home loan a Rs 80,000 take-home salary supports at 8.5% over 20 years when a Rs 10,000 car EMI is already running.",
    "Working out how much own contribution you need once the loan-to-value limit is applied to the property price.",
    "Seeing how much eligibility rises by stretching the tenure from 15 years to 25, or by closing a small personal loan first.",
  ],
  benefits: [
    [
      "Both ceilings, not just one",
      "Income capacity and the RBI loan-to-value ladder are applied together, and the result says which one binds.",
    ],
    [
      "Real annuity maths",
      "The loan is the present value of the maximum EMI at your rate and tenure, not a rough multiple of salary.",
    ],
    [
      "Residual income shown",
      "You see what is left each month after every EMI, which is the number that decides whether the loan is comfortable.",
    ],
  ],
  faqs: [
    [
      "What is FOIR and what percentage do banks allow?",
      "FOIR is total EMIs divided by net monthly income. Indian lenders commonly allow around 40% at incomes up to Rs 30,000 a month, 45% up to Rs 50,000, 50% up to Rs 1 lakh and 55% above that. It is credit policy set by each bank, not a regulatory limit, so a strong profile can get more.",
    ],
    [
      "How much home loan can I get on a Rs 50,000 salary?",
      "At a 50% FOIR with no existing EMIs the ceiling is Rs 25,000 a month, which supports roughly Rs 29 lakh at 8.5% over 20 years. Add existing EMIs and the eligible amount falls rupee for rupee against that Rs 25,000 ceiling.",
    ],
    [
      "How much of the property price will the bank fund?",
      "The RBI loan-to-value ceilings are 90% for loans up to Rs 30 lakh, 80% for loans above Rs 30 lakh and up to Rs 75 lakh, and 75% above Rs 75 lakh. Stamp duty, registration and documentation charges are excluded from the property value for this purpose, so budget for those separately.",
    ],
    [
      "Does adding a co-applicant increase eligibility?",
      "Yes, when the co-applicant has assessable income, because their income is added before the FOIR is applied. Lenders usually require the co-applicant to be a co-owner of the property for a housing loan; the exact treatment varies by bank, so confirm before applying.",
    ],
  ],
};

export default seo;
