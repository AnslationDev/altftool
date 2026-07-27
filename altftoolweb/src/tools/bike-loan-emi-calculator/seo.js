const seo = {
  intro:
    "A bike loan EMI calculator works out the monthly instalment on a two-wheeler loan using the standard reducing-balance annuity formula, EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ − 1), where r is the annual rate divided by twelve and n is the tenure in months. It builds the amount financed the way a lender does — from the on-road price, which is ex-showroom plus RTO tax and registration plus insurance plus accessories, less your down payment — and shows the processing fee both ways, paid up front or added to the loan. The output includes total interest and a year-by-year amortisation schedule.",
  useCases: [
    "Checking the EMI on a ₹1.35 lakh on-road commuter after a ₹35,000 down payment at 10.5% over 36 months",
    "Comparing a 24-month and a 48-month tenure to see how much extra interest the longer one costs",
    "Deciding whether to pay the processing fee up front or let the dealer add it to the loan",
  ],
  benefits: [
    ["Financed on the on-road price", "Adds RTO, insurance and accessories, which is what the lender actually funds."],
    ["Fee handled honestly", "Prices the difference between paying the processing fee up front and financing it."],
    ["Full schedule", "Shows principal, interest and closing balance for each year of the tenure."],
  ],
  faqs: [
    [
      "How is bike loan EMI calculated?",
      "By the reducing-balance formula EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ − 1), with P the amount financed, n the number of monthly instalments and r the monthly rate — the annual rate divided by 12 and by 100. On ₹1,00,000 at 10.5% over 36 months that gives an EMI of about ₹3,250 and total interest of roughly ₹17,000.",
    ],
    [
      "What down payment do I need for a two-wheeler loan?",
      "Lenders commonly fund 80% to 95% of the on-road price, so a down payment of 5% to 20% is typical, and some schemes advertise nil down payment on selected models. A larger down payment cuts both the instalment and the total interest and often earns a lower rate, because it reduces the lender's loan-to-value exposure.",
    ],
    [
      "Is 0% interest bike finance genuinely free?",
      "Rarely. At a true 0% the instalment is just the amount financed divided by the tenure, but the cost usually reappears as a lost cash discount, a higher processing fee or a compulsory accessory or insurance package. Compare the total outgo against the best cash price for the same bike before accepting the scheme.",
    ],
    [
      "Does the loan cover insurance and RTO charges?",
      "Usually yes — two-wheeler loans are sanctioned against the on-road price, which includes RTO tax, registration and the first-year insurance premium, and many dealers add accessories to it as well. That also means you pay interest on those items for the whole tenure, so paying insurance and accessories in cash is worth considering if you have the money.",
    ],
  ],
};

export default seo;
