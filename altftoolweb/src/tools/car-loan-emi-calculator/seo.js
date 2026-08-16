const seo = {
  title: "Car Loan EMI Calculator: Amortisation, Total Cost",
  metaDescription:
    "Reducing-balance EMI from on-road price, down payment, rate and tenure - with total interest, year-wise amortisation and full cash outgo including fees.",
  steps: [
    "Enter 'On-road price (INR)', 'Down payment (INR)', 'Interest rate (% per year)' and 'Tenure (years)' (1-10), plus the processing fee and any upfront insurance.",
    "Use the '10% down' to '25% down' quick buttons to set the down payment as a share of price — the EMI recalculates instantly.",
    "Read the Monthly EMI, 'Total cash outgo for the car' and the 'Year-by-year amortisation' table (Show/Hide toggle); 'Copy result' copies the summary.",
  ],
  "intro": "Car Loan EMI Calculator turns an on-road price, down payment, interest rate and tenure into the exact monthly EMI banks would charge, using the standard reducing-balance formula. It also shows total interest, the split between principal and interest, and a year-by-year amortisation schedule, plus one-time costs like the processing fee and upfront insurance so you see the real cash outgo. Useful for anyone comparing dealer finance quotes against a bank or NBFC offer before signing.",
  "useCases": [
    "Compare a 5-year loan at 9.5% from your bank with the dealer's in-house finance offer at a different rate and tenure.",
    "See how raising the down payment from 10% to 25% of the on-road price cuts both the EMI and the lifetime interest.",
    "Check whether a used-car loan at 13-15% still fits your monthly budget before you commit to the vehicle.",
    "Work out the outstanding balance at the end of year three if you plan to foreclose or trade the car in early."
  ],
  "benefits": [
    [
      "Real bank formula",
      "Uses reducing-balance EMI — the same method used in a sanction letter, not a flat-rate approximation."
    ],
    [
      "Full amortisation view",
      "Year-wise principal, interest and closing balance show exactly when the loan starts eating into principal."
    ],
    [
      "True cost of ownership",
      "Down payment, processing fee and upfront insurance are added on top of the repayment total."
    ]
  ],
  "faqs": [
    [
      "How is car loan EMI calculated?",
      "EMI = P x r x (1+r)^n / ((1+r)^n - 1), where P is the loan amount, r is the monthly interest rate (annual rate divided by 12 and by 100) and n is the number of monthly instalments. Interest is charged on the reducing balance, so the interest portion of each EMI falls over time."
    ],
    [
      "How much down payment should I pay on a car loan?",
      "Most lenders finance 80-90% of the on-road or ex-showroom price, so a 10-20% down payment is typical. A larger down payment reduces the financed amount, the EMI and the total interest, but keep enough cash aside for registration, insurance and an emergency buffer."
    ],
    [
      "Why is my dealer's flat rate cheaper than the bank's reducing rate?",
      "A flat rate charges interest on the full original principal for the whole tenure, so a 6% flat rate is roughly equivalent to an 11-12% reducing rate. Always convert both quotes to EMI and total interest before comparing."
    ],
    [
      "Does this calculator include GST and other charges?",
      "It adds the processing fee and any upfront add-ons you enter to the total cash outgo, but it does not compute GST on the fee, documentation charges or hypothecation costs. Treat the output as an informational estimate and confirm the final figures in your sanction letter."
    ]
  ]
};

export default seo;
