const seo = {
  title: "California Sales Tax Calculator: 7.25% + District",
  metaDescription:
    "Split California sales tax into 6.00% state, 1.25% local and district tax at the delivery address, with exempt groceries and a reverse mode.",
  steps: [
    "Choose a Destination preset, from \"No district (statewide minimum)\" at 7.25% up to Oakland or Santa Monica at 10.25%, or type the District rate yourself as a percentage on top of the 7.25% base.",
    "Enter Taxable goods (USD), Exempt items e.g. grocery food (USD), the Delivery / shipping charge and the Handling charge, and tick \"Delivery is by common carrier, separately stated and at actual cost\" where Regulation 1628 applies.",
    "Read Total sales tax broken into State tax (6.00%), Uniform local tax (1.25%) and District tax, plus Total due and the effective rate — or tick \"The taxable figures above already include sales tax\" to back the tax out instead.",
  ],
  intro:
    "This calculator builds California sales tax from its two parts: the 7.25% statewide base rate — 6.00% state plus a 1.25% uniform local share made of the 1.00% Bradley-Burns tax and the 0.25% county transportation tax — and the district transactions and use tax voted at the delivery address, which pushes combined rates as high as about 10.75%. It separates exempt grocery food under Revenue & Taxation Code section 6359 and exempt separately stated common-carrier delivery under Regulation 1628 from the taxable base. Sellers, marketplace sellers shipping into California and buyers checking a receipt all get the same state, local and district split.",
  useCases: [
    "An online seller shipping to a Los Angeles address, checking that the district portion of the 9.5% combined rate is charged rather than the seller's own city rate.",
    "A grocery and general store ringing up a mixed basket, keeping cold food exempt while taxing household goods at the combined rate.",
    "A bookkeeper reconciling a tax-inclusive point-of-sale total, backing the tax out to report taxable gross receipts on the CDTFA return.",
  ],
  benefits: [
    ["Three-way rate split", "Shows the 6.00% state, 1.25% local and district shares separately, which is how the CDTFA return is laid out."],
    ["Delivery treated correctly", "Common-carrier delivery at actual cost stays exempt while handling is taxed, matching Regulation 1628."],
    ["Reverse mode", "Backs tax out of a tax-inclusive till total so taxable gross receipts are reported accurately."],
  ],
  faqs: [
    [
      "What is the sales tax rate in California?",
      "The statewide base is 7.25%, the highest state-level base rate in the United States. District taxes add anywhere from 0.10% to roughly 3.5% on top, so combined rates run from 7.25% in areas with no district up to about 10.75% in parts of Alameda and Los Angeles counties.",
    ],
    [
      "Is shipping taxable in California?",
      "Not when the goods go by common carrier, the delivery charge is stated separately on the invoice, and the charge is not more than your actual cost of delivery. If you mark shipping up, deliver in your own vehicle, or bill a combined shipping and handling line, the charge becomes taxable — Regulation 1628.",
    ],
    [
      "Is food taxed in California?",
      "Cold food products for human consumption sold for off-premises use are exempt under RTC 6359 — groceries, in effect. Hot prepared food, carbonated soft drinks, alcohol, candy sold at restaurants and dine-in meals are taxable, and the 80-80 rule can make cold food taxable at some food-service businesses.",
    ],
    [
      "Does a trade-in reduce sales tax on a car in California?",
      "No. Unlike many states, California taxes the full selling price of the vehicle with no deduction for a trade-in allowance, so a $30,000 car with a $10,000 trade-in is still taxed on $30,000. Use tax is then collected by the DMV at registration; check with the DMV or a tax professional for your situation.",
    ],
  ],
};

export default seo;
