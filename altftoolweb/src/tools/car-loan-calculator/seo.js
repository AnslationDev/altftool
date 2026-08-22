const seo = {
  title: "Car Loan Calculator: Monthly Payment & Interest",
  metaDescription:
    "Enter price, down payment, rate and term: get the monthly instalment plus amount financed, total interest and total cost. 0% offers handled.",
  intro:
    "The Car Loan Calculator works out the monthly payment on a vehicle loan using the standard amortisation formula — payment = P x r x (1+r)^n / ((1+r)^n - 1), where P is the price minus your down payment, r is the annual rate divided by 12, and n is the term in months. Enter price, down payment, annual interest rate and term in years and you get the monthly instalment plus the amount financed, total interest and total cost including the deposit. It is for buyers comparing offers and anyone checking a dealer's payment quote against the arithmetic.",
  useCases: [
    "A dealer quotes a monthly figure but not the rate — you back into the numbers by entering the price, deposit and term to see what payment the advertised APR should actually produce.",
    "You are deciding whether to put another 2,000 down: run it twice and compare the total interest line, which shows exactly what the larger deposit saves over the full term.",
    "Choosing between a 4-year and a 6-year term on the same car, so you can see how much the lower monthly payment costs you in extra interest.",
  ],
  benefits: [
    [
      "Shows the interest, not just the payment",
      "Every result breaks out amount financed, total interest and total cost, so the true price of the loan is on screen next to the instalment.",
    ],
    [
      "Down payment handled correctly",
      "The deposit is subtracted before interest is applied and added back into total cost, which is how the real loan works.",
    ],
    [
      "Handles a 0% offer",
      "When the rate is zero the calculator divides the balance evenly across the term instead of returning a division error, so promotional finance can be compared directly.",
    ],
  ],
  faqs: [
    [
      "How is a car loan monthly payment calculated?",
      "The payment is P x r x (1+r)^n / ((1+r)^n - 1), where P is the amount financed, r is the monthly rate (annual rate / 12 / 100) and n is the number of months. A 20,000 loan at 7% over 5 years means r = 0.005833 and n = 60.",
    ],
    [
      "Does a bigger down payment reduce the interest I pay?",
      "Yes — interest is charged only on the amount financed, so every unit of deposit removes both principal and the interest that principal would have accrued. Increasing the deposit lowers the monthly payment and the total interest at the same time.",
    ],
    [
      "Is a longer car loan term cheaper?",
      "A longer term lowers the monthly payment but raises the total interest, because the balance is outstanding for more months. Run the same loan at two terms and compare the total interest row to see the trade-off in your own numbers.",
    ],
    [
      "Does this include tax, registration or insurance?",
      "No — the calculation covers principal and interest only. Add taxes, fees and any dealer add-ons into the car price field if they are being financed, and treat the result as informational rather than a finance quote; your lender's disclosure is the binding figure.",
    ],
  ],
};

export default seo;
