const seo = {
  title: "Down Payment Planner: Stamp Duty & RBI LTV",
  metaDescription:
    "Monthly saving for a house down payment, with price growth to the purchase date, stamp duty and registration in cash, and a check against the RBI LTV cap.",
  steps: [
    "Enter \"Property price today (₹)\", \"Years until you buy\", \"Property price growth (% per year)\" and \"Down payment (% of price)\".",
    "Add \"Stamp duty, registration & charges (%)\", \"Already saved for this (₹)\", \"Return on those savings (% per year)\" and your home loan rate and tenure.",
    "Read \"Save every month\" with the \"Cash needed on the day\" and \"Loan and EMI\" rows, then the \"Against the RBI loan-to-value ceiling\" panel; press Copy result.",
  ],
  intro:
    "A down payment planner works out the monthly saving that puts the right amount of cash in your hands on the day you buy, not the day you plan. It inflates the property price to the purchase date, adds stamp duty and registration — costs a housing loan does not cover — compounds what you have already set aside, then solves the ordinary-annuity payment C = gap × i ÷ ((1+i)^n − 1) for the shortfall. It also checks the down payment against the RBI loan-to-value ceiling, which sets the legal minimum a bank can accept.",
  useCases: [
    "Planning a ₹80 lakh flat three years out and finding the true cash requirement once 7% stamp duty and registration are added.",
    "Checking whether a 20% down payment is even permitted once the resulting loan pushes past the RBI's ₹75 lakh loan-size band, where the LTV ceiling drops to 75%.",
    "Comparing how much less you need to save each month if you push the purchase from three years out to five.",
  ],
  benefits: [
    ["Stamp duty is not forgotten", "Registration and duty are charged on the property value and paid in cash, so they are added to the target rather than assumed away."],
    ["Regulatory check built in", "The plan is tested against the RBI LTV slab for the property value, so an impossible down payment is flagged before you commit."],
    ["EMI preview", "The loan left after your down payment is turned into an EMI at your chosen rate and tenure."],
  ],
  faqs: [
    [
      "What is the minimum down payment for a home loan in India?",
      "It follows the RBI loan-to-value ceiling: 90% LTV for loans up to ₹30 lakh, 80% for loans above ₹30 lakh and up to ₹75 lakh, and 75% above ₹75 lakh. That makes the minimum down payment roughly 10%, 20% and 25% of the property value respectively, before stamp duty. Lenders frequently ask for more than the regulatory floor.",
    ],
    [
      "Does a home loan cover stamp duty and registration?",
      "Generally no. Under the RBI rule, stamp duty, registration and other documentation charges may be included in the property cost for LTV purposes only for loans up to ₹10 lakh; above that they must be funded from your own pocket. Budget them as cash on top of the down payment.",
    ],
    [
      "How much is stamp duty on a house?",
      "It is a state levy, so the rate depends on where the property is registered — commonly in the 4–7% range with registration charges of about 1% on top, and several states offer a lower rate for women buyers. Check the current rate on your state registration department's site before finalising the budget.",
    ],
    [
      "Where should I keep the down payment money while I save?",
      "Match the instrument to the horizon. Under three years, a recurring deposit, short-tenure fixed deposit or liquid fund keeps the amount predictable, because an equity fall in the final year would force you to delay the purchase. Enter the realistic rate for whatever you actually use. This is general information, not investment advice.",
    ],
  ],
};

export default seo;
