const seo = {
  intro:
    "The Home Affordability Calculator works backwards from your salary to the highest property price you can realistically buy. It applies the FOIR rule lenders use (a fixed share of net income available for all EMIs), converts that EMI capacity into a loan amount with the reducing-balance formula, then checks it against your down payment, the bank's loan-to-value cap and the stamp duty and registration you must pay from your own pocket. It is built for first-time buyers and upgraders who want a budget before they start site visits.",
  useCases: [
    "A salaried buyer earning INR 1.5 lakh a month with one running car EMI wants to know the flat budget a bank will actually support at 8.5% over 20 years.",
    "A couple with INR 20 lakh saved wants to see whether their cash or their income is the real ceiling before they shortlist projects.",
    "A buyer comparing a 15-year and a 25-year tenure wants to see how much extra property price the longer loan unlocks and what it costs in total interest.",
  ],
  benefits: [
    [
      "Uses the lender's own FOIR test",
      "Deducts existing EMIs first, so the budget reflects what an underwriter would approve rather than gross salary alone.",
    ],
    [
      "Counts the hidden cash costs",
      "Stamp duty and registration are taken out of your savings before the down payment, which is where most budgets slip.",
    ],
    [
      "Tells you the binding constraint",
      "Shows whether income or down payment is capping your price, so you know which one to fix.",
    ],
  ],
  faqs: [
    [
      "What is FOIR and what value should I use?",
      "FOIR (fixed obligation to income ratio) is the share of your net monthly income a lender lets all your EMIs consume. Most Indian banks work with 40% to 55%, allowing the higher end for higher incomes, so 50% is a reasonable default.",
    ],
    [
      "How much of the property price will a bank fund?",
      "RBI norms cap the loan-to-value at 90% for homes up to INR 30 lakh, 80% between INR 30 lakh and 75 lakh, and 75% above INR 75 lakh. The cap applies to the property value only, not to stamp duty or registration.",
    ],
    [
      "Are stamp duty and registration included in the loan?",
      "Generally no. Stamp duty is typically 4% to 7% of the agreement value depending on the state, plus around 1% registration, and lenders expect you to pay it in cash — which is why this calculator deducts it from your savings first.",
    ],
    [
      "Does a longer tenure really let me buy a bigger home?",
      "It raises the loan a given EMI can service, but with diminishing returns: past roughly 20 years each extra year adds very little loan and a lot of interest, because almost the entire early EMI goes to interest.",
    ],
  ],
};

export default seo;
