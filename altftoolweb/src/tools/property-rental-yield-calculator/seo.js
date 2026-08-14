const seo = {
  title: "Rental Yield Calculator: Gross and Net After Tax",
  metaDescription:
    "Gross and net rental yield after vacancy, society charges and municipal tax, with the 30% Section 24(a) deduction and Section 24(b) interest applied.",
  steps: [
    "Enter 'Property purchase price (INR)' and 'Stamp duty, registration, brokerage, interiors (INR)', then 'Monthly rent received (INR)' and 'Vacant weeks per year'.",
    "Add the running costs — 'Society charges + repairs per year (INR)', 'Municipal property tax paid per year (INR)', 'Property insurance per year (INR)', 'Property management fee (% of rent)' and 'Home loan interest paid per year (INR)' — and pick 'Your income tax slab rate (%)'.",
    "Read 'Net rental yield after tax' beside the gross yield, then the 'Income from house property' table stepping from Gross Annual Value through the municipal tax deduction, the 30% standard deduction under Section 24(a), Section 24(b) interest, tax payable and loss carried forward; Copy result copies the summary.",
  ],
  intro:
    "Rental yield is the annual rent a property earns expressed as a percentage of what the property cost you, and this calculator works out both the gross figure and the net figure that survives vacancy, society charges, municipal tax and income tax. The tax layer follows the Income from house property head of the Income-tax Act, 1961 — municipal taxes paid are deducted from gross annual value, then a flat 30% standard deduction under Section 24(a), then interest on borrowed capital under Section 24(b). It is built for landlords and first-time property investors who want to compare a flat against a fixed deposit or an index fund on a like-for-like after-tax basis.",
  useCases: [
    "Deciding whether a ready-to-move 2BHK at 80 lakh renting for 25,000 a month beats leaving the money in a debt fund",
    "Checking how much of the yield disappears once stamp duty, registration and interiors are added to the purchase price",
    "Seeing how two vacant months between tenants change the annual return on a let-out flat",
    "Working out the tax saved when home loan interest creates a house-property loss that can be set off against salary",
  ],
  benefits: [
    [
      "Gross and net side by side",
      "The headline gross yield and the net after-tax yield appear together, so the gap between the brochure number and the real one is obvious.",
    ],
    [
      "Real statutory tax treatment",
      "Applies the 30% standard deduction, the Section 24(b) interest deduction and the 2 lakh set-off cap under Section 71(3A) rather than a flat guess.",
    ],
    [
      "Vacancy and costs are not optional",
      "Vacant weeks, society maintenance, municipal tax, insurance and a management fee all feed the net operating income, which is where most yield estimates go wrong.",
    ],
  ],
  faqs: [
    [
      "What is a good rental yield in India?",
      "Residential rental yields in Indian metros typically sit between 2% and 4% gross, and commercial or retail property runs roughly 6% to 9% gross. After vacancy, maintenance and tax, a residential net yield above 3% is doing well, which is why most residential buyers depend on capital appreciation rather than rent for their return.",
    ],
    [
      "How is gross rental yield different from net rental yield?",
      "Gross yield is annual rent divided by the property price, with nothing deducted. Net yield subtracts the money you actually spend — vacant periods, society charges, repairs, municipal property tax, insurance, any management fee — and the income tax on the rent, then divides by the total capital you put in including stamp duty and registration.",
    ],
    [
      "How is rental income taxed in India?",
      "Rent is taxed under Income from house property. Municipal taxes actually paid are deducted from the rent received to give net annual value, a flat 30% of that is allowed as a standard deduction under Section 24(a) with no bills required, and home loan interest is deducted under Section 24(b). The balance is added to your total income and taxed at your slab rate.",
    ],
    [
      "Can a loss on a let-out property be set off against salary?",
      "Yes, but only up to 2,00,000 in a financial year under Section 71(3A). Any unabsorbed loss beyond that is carried forward for up to eight assessment years and can then be set off only against house-property income. This is general information — confirm your own position with a chartered accountant.",
    ],
  ],
};

export default seo;
