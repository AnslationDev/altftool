const seo = {
  title: "Bill Split Calculator India: GST, Service Charge, Tip",
  metaDescription:
    "Applies 5% or 18% GST on food plus service charge, keeps alcohol on state VAT and the tip untaxed, then splits equally or by what each person ordered.",
  steps: [
    "Enter food and soft drinks pre-tax, alcohol pre-tax with its state tax percentage, and any service charge on the food bill.",
    "Choose 5% standalone or 18% hotel GST, set the tip percentage, then split Equally or By what each ordered.",
    "Read the grand total with CGST and SGST shown separately, the per-head amount, and the Who pays what table.",
  ],
  intro:
    "An Indian restaurant bill is built in a fixed order: food subtotal, then any service charge, then GST on the two together, then a tip that carries no tax. This calculator follows that order, applies 5% GST for a standalone restaurant or 18% where the restaurant sits inside a hotel with a declared room tariff above Rs 7,500 a day, keeps alcohol separate because it falls outside GST and attracts state excise or VAT instead, and then splits the total either equally or in proportion to what each person ordered.",
  useCases: [
    "Settling a group dinner where one table shared food but only two people drank",
    "Checking whether the service charge printed on the bill was added without being asked for",
    "Splitting a bill so each person pays for what they ordered, with GST and tip apportioned fairly",
  ],
  benefits: [
    ["Correct order of charges", "GST is applied to the food plus service charge, and the tip stays outside the tax."],
    ["Alcohol handled separately", "Drinks are taxed under state VAT or excise rather than GST, as on a real bill."],
    ["Round shares up cleanly", "Optional rounding to the nearest Rs 1, 5 or 10 with the surplus shown, not hidden."],
  ],
  faqs: [
    [
      "What is the GST rate on restaurant food in India?",
      "5% without input tax credit for standalone restaurants, split as 2.5% CGST and 2.5% SGST. Restaurants located inside a hotel where any unit of accommodation has a declared tariff above Rs 7,500 per day charge 18% with input tax credit. The rates come from Notification 11/2017-Central Tax (Rate) as amended by Notification 46/2017.",
    ],
    [
      "Is service charge mandatory in Indian restaurants?",
      "No. The Central Consumer Protection Authority's guidelines dated 4 July 2022 state that no hotel or restaurant shall add a service charge automatically or by default to the bill, and it cannot be collected under another name. A customer can ask for it to be removed, and a complaint can be filed with the National Consumer Helpline on 1915. The matter has been litigated, so check the current position if a restaurant disputes it.",
    ],
    [
      "Is GST charged on the service charge too?",
      "Yes, if the service charge appears on the bill. Under section 15 of the CGST Act, 2017 the value of a supply includes amounts the supplier charges, so a service charge forms part of the value that GST is levied on. On a Rs 2,000 food bill with a 10% service charge, GST at 5% is charged on Rs 2,200, giving Rs 110 rather than Rs 100.",
    ],
    [
      "Do you tip before or after GST in India?",
      "Custom is to tip on the pre-tax food value, since the tip is a voluntary payment to staff and not part of the restaurant's charge. Around 10% of the food bill is typical where no service charge has been paid, and many people skip the tip entirely when a service charge has already been added. A tip is not taxable to the customer either way.",
    ],
  ],
};

export default seo;
