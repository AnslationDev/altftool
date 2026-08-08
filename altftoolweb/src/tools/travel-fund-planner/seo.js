const seo = {
  title: "Travel Fund Planner: Forex, TCS and Monthly Saving",
  metaDescription:
    "Build a trip budget with forex markup on the foreign share, a contingency buffer and section 206C(1G) TCS, then back-solve the monthly saving.",
  steps: [
    "Under 'The trip', enter Travellers, Nights away, 'Return airfare per person', 'Accommodation per night, total', daily food and local spend, activities, visa, insurance and shopping extras in rupees.",
    "Under 'Forex, buffer and tax', choose 'Domestic trip - no TCS', 'Overseas tour package from an operator' or 'Other overseas remittance under LRS', set the foreign-currency share, forex markup and contingency buffer percentages, then under 'How you are funding it' enter Months until departure, what you have already saved and the expected return.",
    "'Save every month' gives the monthly figure, with Trip budget, Forex markup, Contingency buffer, 'TCS under section 206C(1G)', Total to fund, Per person and 'Shortfall to save' listed below plus a 'Where the budget goes' share table; Copy result copies the plan.",
  ],
  intro:
    "A travel fund planner turns a trip into a single funded number and then into a monthly saving. It builds the budget from per-person and per-night components, adds the forex markup on the share actually paid in foreign currency, applies a contingency buffer, and includes tax collected at source under section 206C(1G) of the Income-tax Act where the spending is an overseas tour package or an LRS remittance. The shortfall left after your existing savings compound to the departure date is converted to a monthly contribution using the ordinary-annuity formula.",
  useCases: [
    "Costing a seven-night trip for two, including the 2% forex markup most cards add, before booking anything.",
    "Checking how much TCS a ₹12 lakh tour package attracts once the ₹10 lakh financial-year threshold is crossed.",
    "Finding the monthly amount that funds the trip in ten months so nothing lands on a credit card.",
  ],
  benefits: [
    ["Forex markup counted", "The bank's spread is applied only to the share you actually pay abroad, not the whole budget."],
    ["TCS shown separately", "Tax collected at source is included in the cash you need but flagged as recoverable, not as a cost."],
    ["Buffer before booking", "A contingency percentage sits on top of the budget, so a fare change does not become a card balance."],
  ],
  faqs: [
    [
      "How much TCS is charged on foreign travel from India?",
      "Under section 206C(1G), an overseas tour programme package attracts 5% TCS on the aggregate up to the financial-year threshold of ₹10 lakh per PAN and 20% above it; other LRS remittances that are not for education or medical treatment attract nil up to ₹10 lakh and 20% on the excess. The threshold was raised from ₹7 lakh by the Finance Act 2025 — confirm the current position, as it is revised in most Budgets.",
    ],
    [
      "Is TCS on foreign travel refundable?",
      "It is not an extra tax. TCS is collected on your PAN and appears in Form 26AS, so it is set off against your income tax liability when you file and refunded if you have overpaid. Budget the cash for it anyway, because you pay it at booking and recover it months later.",
    ],
    [
      "What is a realistic forex markup?",
      "Most Indian credit cards add a foreign transaction fee of around 2–3.5% on top of the conversion rate, while prepaid forex cards typically load a smaller spread on the rate itself. Compare the all-in rate rather than the headline fee, and enter the number your own card actually charges.",
    ],
    [
      "How big should the contingency buffer on a trip be?",
      "10% of the budget is a common starting point and covers ordinary overruns like a taxi strike or a pricier meal. Push it to 15–20% for long-haul trips, remote destinations, or when you are booking non-refundable fares many months ahead and currency movement could work against you.",
    ],
  ],
};

export default seo;
