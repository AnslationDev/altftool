const seo = {
  intro:
    "This calculator adds the 6.25% Texas state sales tax under Tax Code § 151.051 to the local city, county, transit and special-district rate at your location, which the statute caps at 2% combined — so the maximum rate anywhere in Texas is 8.25%. It treats delivery and handling charges as part of the taxable sales price when the item shipped is taxable (Comptroller Rule 3.303), keeps groceries and prescription drugs out of the base, and can reverse tax out of a tax-inclusive total. A separate panel handles motor vehicles, which are taxed under Tax Code chapter 152 instead.",
  useCases: [
    "A Houston retailer confirming the 8.25% combined rate and splitting the state and local shares for the monthly return.",
    "An out-of-state seller weighing whether to track every Texas jurisdiction or elect the single local use tax rate.",
    "A car buyer comparing a dealer quote, checking the 6.25% motor vehicle tax on the price after a trade-in allowance.",
  ],
  benefits: [
    ["2% cap enforced", "Rejects a local rate above the statutory ceiling, catching the common mistake of typing the combined rate."],
    ["Shipping handled by rule", "Delivery charges follow the taxability of the goods, exactly as Rule 3.303 requires."],
    ["Vehicle tax kept separate", "Shows the chapter 152 vehicle tax with its trade-in deduction rather than mixing it into general sales tax."],
  ],
  faqs: [
    [
      "What is the sales tax rate in Texas?",
      "The state rate is 6.25%. Local jurisdictions can add up to 2% more, so the combined rate ranges from 6.25% in areas with no local tax to a maximum of 8.25%. Houston, Dallas, San Antonio, Austin and Fort Worth all sit at the 8.25% ceiling.",
    ],
    [
      "Is shipping taxable in Texas?",
      "Yes, when the item being shipped is taxable. Delivery, shipping, handling and transportation charges are part of the taxable sales price under Comptroller Rule 3.303, even if listed separately. If the goods are exempt, the delivery charge attached to them is exempt too.",
    ],
    [
      "Is food taxed in Texas?",
      "Food products for home consumption are exempt under Tax Code § 151.314 — bread, milk, produce, meat and similar groceries. Prepared food sold ready to eat, candy, soft drinks and dietary supplements are taxable at the full combined rate.",
    ],
    [
      "How is sales tax on a car calculated in Texas?",
      "Vehicles are taxed at 6.25% under Tax Code chapter 152, not under the general sales tax, and there is no local add-on. The tax is charged on the sales price less any trade-in allowance, so a $30,000 car with a $10,000 trade-in is taxed on $20,000, giving $1,250. Confirm with the county tax office at titling.",
    ],
  ],
};

export default seo;
