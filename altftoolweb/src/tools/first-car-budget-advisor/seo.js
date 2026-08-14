const seo = {
  title: "First Car Budget Calculator — the 20/4/10 Rule",
  metaDescription:
    "Enter income, savings and running costs to get the on-road price, down payment, loan and EMI the 20/4/10 rule allows — running costs come out first.",
  steps: [
    "Enter 'Gross monthly income (₹)', 'Savings available (₹)' and the running costs — km per month, mileage, fuel price, insurance and service per year.",
    "Choose a 'Loan tenure' — 36, 48 (the 20/4/10 limit), 60 or 72 months — and adjust the 20% minimum down payment or the 10% income cap.",
    "Read 'On-road price you can afford' with its down payment, loan and EMI, then press 'Copy result' for the full cost breakdown.",
  ],
  intro:
    "This advisor works out the highest on-road price a first-time buyer can safely pay, using the 20/4/10 rule: at least 20% down in cash, a loan of no more than 4 years, and total monthly car cost — EMI plus fuel, insurance, maintenance and parking — capped at 10% of gross monthly income. It starts from that 10% ceiling, subtracts your real running costs to find the EMI you can carry, converts that EMI into a loan principal with the reducing-balance annuity formula, and adds the cash you can spare. The result is a price ceiling and the down payment, loan and EMI that go with it, not a dealership pre-approval.",
  useCases: [
    "Fix a walk-in budget before visiting a showroom, so the sales conversation starts from a number you set rather than the EMI you are offered.",
    "Check whether a car you already like leaves room for its own fuel, insurance and service bills at your salary.",
    "Compare a 48-month loan against the 60- and 72-month tenures dealers push, and see how much the longer term really buys.",
  ],
  benefits: [
    ["Running costs counted first", "Fuel, insurance, servicing and parking come out of the budget before any EMI does."],
    ["Shows what is limiting you", "Says whether the ceiling comes from your monthly income or from the cash you have saved."],
    ["Down payment kept honest", "Enforces the 20% minimum and lets you ring-fence an emergency fund before the deposit."],
  ],
  faqs: [
    [
      "What is the 20/4/10 rule for buying a car?",
      "It caps three things: pay at least 20% of the on-road price as a cash down payment, take a loan no longer than 4 years, and keep total monthly car spending under 10% of gross monthly income. The 10% is all-in — EMI, fuel, insurance, servicing and parking together, not the EMI alone, which is where most buyers overshoot.",
    ],
    [
      "How much car can I afford on a ₹1,00,000 monthly salary?",
      "The 10% ceiling gives ₹10,000 a month for everything. If running 700 km a month at 18 km/l costs about ₹4,100 in fuel and insurance plus servicing add roughly ₹2,000 a month, only about ₹3,900 is left for an EMI — around ₹1.5 lakh of loan over 48 months at 9.5%. Add your down payment cash to that to get the on-road price you can reach.",
    ],
    [
      "Should I take a 7-year car loan to afford a better car?",
      "A longer tenure lowers the EMI but leaves you owing more than the car is worth for most of the term, and interest keeps accruing while resale value falls. A car depreciating faster than the loan amortises means you cannot sell without writing a cheque. If a 4-year loan does not fit, the honest reading is that the car is above budget.",
    ],
    [
      "Is on-road price the same as ex-showroom price?",
      "No. On-road price adds road tax, registration, the first year of insurance, and any dealer handling or accessory charges to the ex-showroom price, and it is what you actually finance. Depending on the state and vehicle value the gap is commonly 10% to 20%, so budget against the on-road figure. Consult a qualified financial adviser before committing to any loan.",
    ],
  ],
};

export default seo;
