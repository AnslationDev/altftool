const seo = {
  title: "Illinois Sales Tax Calculator: 6.25% Plus Local",
  metaDescription:
    "Add Illinois' 6.25% rate to home rule, county and RTA local tax, price reduced-rate food and drugs, and see the 5.00/1.00/0.25 statutory split.",
  steps: [
    "Pick a Location preset such as \"Chicago — 10.25%\", or type your own Local rate (% on top of 6.25%).",
    "Enter General merchandise (USD), the Food, drugs and medical appliances (USD) basket with its Rate on those items (%), and any Delivery charge (USD).",
    "Read Total sales tax with the State share of the 6.25% (5.00%), Municipal share (1.00%) and County share (0.25%) rows, then press Copy result.",
  ],
  intro:
    "This calculator combines the 6.25% Illinois general merchandise rate under the Retailers' Occupation Tax Act (35 ILCS 120) with the local home rule, county, transit and business district taxes that stack on top, and prices qualifying drugs, medical appliances and food at their reduced rate on the same receipt. It also shows how the 6.25% is split by statute — 5.00% to the state, 1.00% to municipalities and 0.25% to counties — which is why the 'state' rate already contains a local element. Retailers, remote sellers shipping into Illinois and shoppers checking a Chicago receipt all get the same layered breakdown.",
  useCases: [
    "A Chicago retailer confirming the 10.25% combined rate and separating the state, city, county and RTA components for the ST-1 return.",
    "A pharmacy ringing up a basket with prescription items at the reduced rate alongside general merchandise at the full rate.",
    "A remote seller destination-sourcing an order and needing the correct local rate for the customer's town rather than its own.",
  ],
  benefits: [
    ["Two rates on one receipt", "Handles general merchandise and reduced-rate food, drugs and medical appliances together, the way a real basket looks."],
    ["Statutory split shown", "Breaks the 6.25% into its 5.00% / 1.00% / 0.25% shares so the distribution is visible."],
    ["Delivery rule respected", "Lets you mark delivery non-taxable when it was separately contracted for and avoidable, per 86 Ill. Adm. Code 130.415."],
  ],
  faqs: [
    [
      "What is the sales tax rate in Chicago?",
      "10.25% on general merchandise — the highest combined rate among large US cities. It is the 6.25% Illinois state rate plus 1.25% City of Chicago, 1.75% Cook County and 1.00% Regional Transportation Authority.",
    ],
    [
      "What is the Illinois state sales tax rate?",
      "6.25% on general merchandise. That headline figure is itself divided by statute: 5.00% stays with the state, 1.00% is distributed to municipalities and 0.25% to counties, before any additional local tax is added on top.",
    ],
    [
      "Is there still a grocery tax in Illinois?",
      "The 1% state grocery tax was repealed with effect from 1 January 2026 under Public Act 103-0781, but the same law lets municipalities impose their own 1% grocery tax without a referendum. Whether you pay 0% or 1% on food therefore depends on your town — check its ordinance or the MyTax Illinois Tax Rate Finder.",
    ],
    [
      "Is shipping taxable in Illinois?",
      "It depends on whether delivery was separately contracted for. If the delivery charge is an inseparable part of the sale, it is taxable; if the buyer had a genuine choice — for example the option to collect the goods — and the charge is stated separately, it is not. The rule is at 86 Ill. Adm. Code 130.415; ask a tax professional if your invoices are borderline.",
    ],
  ],
};

export default seo;
