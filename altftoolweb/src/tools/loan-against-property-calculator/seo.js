const seo = {
  title: "Loan Against Property Calculator: LTV & FOIR Eligibility",
  metaDescription:
    "Tests both lender limits — the LTV cap on your property and the EMI your FOIR allows — shows which binds, plus EMI, total interest and post-loan FOIR.",
  steps: [
    "Pick a 'Property type' — each option shows its typical LTV, from Residential 70% to Vacant land 50% — then enter 'Market value of property (INR)' and any 'Existing loan outstanding on this property (INR)'.",
    "Fill 'Net monthly income (INR)', 'Monthly rental income (INR)' (only 75% of rent is counted), 'Existing monthly EMIs (INR)', 'FOIR limit (%)', 'Interest rate (% per year)' and 'Tenure (years)' — the result recomputes as you type, with no Calculate button.",
    "Read the 'Eligible loan amount' headline, the Property-based and Income-based limit cards with the binding one highlighted, the EMI, total interest and 'FOIR after this loan'; 'Copy result' copies the summary.",
  ],
  "intro": "Loan Against Property Calculator estimates how large a LAP you can get by testing the two limits every lender applies: the loan-to-value cap on the mortgaged property and the EMI your income can service inside the lender's FOIR ceiling. It reports both limits, tells you which one is binding, and then shows the EMI, total interest and your resulting FOIR. Built for salaried and self-employed borrowers weighing a mortgage loan for business capital, education or debt consolidation.",
  "useCases": [
    "Find out whether a 1 crore residential property can support the 50 lakh you need for business working capital.",
    "See how much more you qualify for after closing a personal loan that is eating into your FOIR.",
    "Compare eligibility on a commercial shop at 60% LTV against a residential flat at 70% LTV.",
    "Check the effect of stretching the tenure from 10 to 15 years on both the EMI and the eligible amount."
  ],
  "benefits": [
    [
      "Both limits, side by side",
      "Property LTV and income affordability are calculated separately so you can see which one is holding you back."
    ],
    [
      "Realistic income treatment",
      "Only 75% of rental income counts and existing EMIs are deducted, mirroring standard lender policy."
    ],
    [
      "Full repayment picture",
      "EMI, total interest, total repayment and post-loan FOIR are shown for the amount you would actually be sanctioned."
    ]
  ],
  "faqs": [
    [
      "How much loan can I get against my property?",
      "Typically 50-70% of the lender's assessed market value — around 65-70% for residential, 55-60% for commercial and often 50% for vacant land — and never more than what your income can service within the FOIR limit. Any existing mortgage on the same property is deducted."
    ],
    [
      "What is FOIR and why does it cap my loan?",
      "FOIR (fixed obligation to income ratio) is the share of monthly income a lender lets you spend on all EMIs together, usually 50-60%. If your income supports an EMI of only 62,500 after existing obligations, the loan amount is capped at whatever that EMI can repay over the tenure."
    ],
    [
      "Is a loan against property cheaper than a personal loan?",
      "Yes, generally. Because the property is security, LAP rates run several percentage points below unsecured personal loan rates and tenures stretch to 15-20 years. The trade-off is that the lender can enforce the mortgage if you default."
    ],
    [
      "Does the lender use my purchase price or current market value?",
      "The lender's empanelled valuer assesses the current market value, and the LTV is applied to that figure, not to your purchase price or circle rate. The valuation is often conservative, so treat this calculator's output as an estimate."
    ]
  ]
};

export default seo;
