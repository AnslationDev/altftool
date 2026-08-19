const seo = {
  title: "Rent vs Buy Home Calculator: Crossover Year",
  metaDescription:
    "Compares buyer net worth (home value minus loan) against a renter investing the down payment and every monthly saving, and reports the crossover year.",
  steps: [
    "Enter the home price, down payment %, loan interest rate and tenure, the monthly rent for the same home, and rent inflation.",
    "Set home appreciation, investment return and maintenance + property tax, drag How long will you stay?, and switch on the home-loan tax benefit or 7% registration.",
    "Read the verdict, the crossover year, the 3% / 5% / 8% appreciation sensitivity strip and the year-by-year net worth table, then press Copy summary.",
  ],
  intro:
    "Rent vs Buy Home Calculator compares the net worth you would hold as a buyer against the net worth you would hold as a renter at the end of a chosen horizon, and reports the year in which one overtakes the other. The buyer's side is home value minus outstanding loan balance, plus any surplus invested for the months when owning (EMI plus maintenance, minus any tax saving) costs less than rent that month; the renter's side is the down payment, registration and every month's cost difference invested at your assumed return and compounded monthly. It amortises the loan month by month with the standard EMI formula, escalates rent and home value annually, prices maintenance as a percentage of the home's current value, and can layer on stamp duty plus the old-regime home-loan tax deductions.",
  useCases: [
    "You are weighing a ₹1.2 crore metro 2BHK against ₹40,000 a month rent for the same flat and want to know whether a 10-year stay is long enough for buying to pay off.",
    "A job move in five or six years is likely, so you need the crossover year rather than a 20-year verdict — if buying only wins in year 12, renting is the answer.",
    "You want to see how badly the case for buying depends on appreciation, so you check the verdict at 3%, 5% and 8% a year before committing to a down payment.",
  ],
  benefits: [
    ["Tells you the crossover year", "Rather than one final verdict, it finds the first year in which buying or renting takes the lead and holds it to the end of your horizon."],
    ["Horizon is separate from loan tenure", "Model a 20-year loan you only stay in for 7 years — the buyer's net worth is home value minus the loan still outstanding at that point."],
    ["Appreciation sensitivity built in", "A side-by-side strip re-runs the whole simulation at 3%, 5% and 8% appreciation so you can see how fragile the verdict is."],
  ],
  faqs: [
    [
      "What is the crossover year?",
      "The first year from which one option stays ahead on net worth all the way to the end of your horizon. If buying trails for the first six years and leads from year seven onwards, the crossover is year 7 — which is roughly the minimum time you would need to stay for buying to make sense on these assumptions.",
    ],
    [
      "How does the home-loan tax benefit toggle work?",
      "It applies the old-regime deductions at a 30% slab: interest paid in the year capped at ₹2,00,000 under Section 24(b), plus principal repaid capped at ₹1,50,000 under Section 80C. The estimated saving is spread across the twelve months and netted off the ownership cost. It does not apply under the new tax regime — check your own position with a tax professional.",
    ],
    [
      "Are stamp duty and registration included?",
      "Only if you switch the toggle on, which adds a one-time 7% of the home price to the upfront outlay. That is a common ballpark for Indian states, but the actual rate varies by state and by buyer category, so adjust your expectations to your local figure.",
    ],
    [
      "Why does renting sometimes win even when the home appreciates?",
      "Because the renter's side is not just rent avoided — the down payment, registration and every month that the EMI plus maintenance exceeds rent are invested and compounded monthly at your assumed return. At the 11% default return and 5% appreciation, that compounding often outruns the equity built in the house over a short horizon.",
    ],
  ],
};

export default seo;
