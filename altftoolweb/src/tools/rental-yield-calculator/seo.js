const seo = {
  title: "Rental Yield Calculator: Gross, Net and Cash Flow",
  metaDescription:
    "Work out gross and net rental yield after vacancy and every running cost, plus post-EMI monthly cash flow, cash-on-cash return and a 6-year projection.",
  steps: [
    "Enter Purchase Price, Current Market Value and Monthly Rent with a Vacancy Rate %, plus Down Payment, Loan Amount, Interest Rate and Loan Tenure if it is EMI-funded.",
    "Fill the Annual Expenses fields — Maintenance Cost, Property Tax, Insurance, HOA Charges, Repairs, Utilities, Other Expenses, and a Management Fee charged as a % of collected rent.",
    "Read Gross Yield, Net Yield, Monthly Cash Flow, ROI and Break-even, then press Copy Summary or Export CSV to save rental-yield-calculation.csv.",
  ],
  intro:
    "Rental Yield Calculator works out what a let property actually returns: gross yield is annual rent after a vacancy allowance divided by the purchase price, and net yield subtracts every running cost — maintenance, property tax, insurance, HOA, repairs, utilities and a management fee charged as a percentage of collected rent — before dividing by the same price. It then layers on the loan, reporting monthly cash flow after EMI, cash-on-cash return against your down payment, total ROI including capital appreciation, and a six-year projection where rent grows 3% a year and expenses 2%. It is for landlords and buy-to-let investors comparing one property against another on returns rather than on rent alone.",
  useCases: [
    "You are choosing between a ₹50 lakh flat renting at ₹25,000 and a cheaper one renting at ₹18,000, and need net yield rather than rent to tell them apart.",
    "The property is EMI-funded and you want to know whether it feeds you or costs you every month once the loan payment is set against net rental income.",
    "A managing agent quotes 8% of collected rent and you want to see exactly how much that fee, plus a 5% vacancy allowance, shaves off your net yield.",
  ],
  benefits: [
    ["Separates gross yield from net yield", "Both are computed against the same purchase price, so you can see precisely how much of the headline yield the running costs eat."],
    ["Vacancy is priced in, not assumed away", "Rent is discounted by your vacancy rate before any yield or fee is calculated, so an empty month is not quietly ignored."],
    ["Return on the money you actually put in", "Cash-on-cash return measures post-EMI cash flow against the down payment, not against the full property price."],
  ],
  faqs: [
    [
      "What is the difference between gross and net rental yield?",
      "Gross yield is annual rent after the vacancy allowance divided by the purchase price; net yield subtracts all operating expenses from that rent first. On a ₹50 lakh flat at ₹25,000 a month with 5% vacancy, gross yield is 5.70% — and once ₹1.16 lakh of annual expenses come off, net yield falls to about 3.38%.",
    ],
    [
      "Does the yield include my home loan EMI?",
      "No, and that is deliberate. Yield measures the property's return independent of how you financed it, so the EMI sits outside it and appears instead in the monthly cash-flow figure and the cash-on-cash return, which divides post-EMI cash flow by your down payment.",
    ],
    [
      "How is the property management fee treated?",
      "As a percentage of rent actually collected, not of headline rent — an 8% fee on ₹2.85 lakh of vacancy-adjusted rent is ₹22,800, and that amount joins maintenance, tax, insurance, repairs, utilities and other costs in the expense total.",
    ],
    [
      "What assumptions drive the six-year projection?",
      "Rent grows 3% a year and operating expenses 2% a year, with the EMI held flat, so the cash-flow line usually improves over time. Those are working assumptions, not forecasts — replace them mentally with your own market's rent growth before making a purchase decision, and consult a qualified adviser on the investment itself.",
    ],
  ],
};

export default seo;
