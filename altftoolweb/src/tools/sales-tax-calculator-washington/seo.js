const seo = {
  intro:
    "This calculator works out Washington retail sales tax by adding the 6.5% state rate under RCW 82.08.020 to the local city, county and transit rate that applies where the buyer takes delivery, which is the destination-based sourcing rule in RCW 82.32.730. It handles taxable shipping, a like-kind trade-in deduction and the extra 0.3% state tax on motor vehicle sales, and it can back the tax out of a price that already includes it. Sellers, online merchants shipping into Washington and buyers checking a quote all get the same state, local and total split.",
  useCases: [
    "An out-of-state online seller shipping an order to a Seattle address, working out which combined rate to charge and how much of it is the local share.",
    "A car buyer comparing an offer with a trade-in, checking the taxable price after the trade-in allowance and the additional 0.3% motor vehicle tax.",
    "A market stall or service business that quotes tax-inclusive prices, backing out the tax to report the correct taxable gross on its excise tax return.",
  ],
  benefits: [
    ["State and local split", "Separates the 6.5% state share from the local share so filing by location code is straightforward."],
    ["Destination sourcing built in", "Uses the buyer's delivery location rate, which is how Washington sources retail sales."],
    ["Trade-in and shipping handled", "Deducts a like-kind trade-in and lets you mark shipping taxable or not before the tax is computed."],
  ],
  faqs: [
    [
      "What is the sales tax rate in Washington State?",
      "The state portion is 6.5%, and local jurisdictions add their own rate on top, so the combined rate typically lands between about 7.0% and 10.6% depending on the address. Seattle sits near the top of that range and some unincorporated areas near the bottom.",
    ],
    [
      "Do I charge sales tax based on my location or the customer's?",
      "The customer's. Washington is a destination-based state under RCW 82.32.730, so retail sales are sourced to the place where the buyer receives the goods — the delivery address for shipped orders, or the store counter for over-the-counter sales.",
    ],
    [
      "Is shipping taxable in Washington?",
      "Yes, when the goods being shipped are taxable. Delivery, shipping and handling charges are part of the selling price under RCW 82.08.010(1), so tax applies to them at the same rate; if the goods are exempt, the related delivery charge is not taxed.",
    ],
    [
      "Why is car sales tax higher in Washington?",
      "Retail sales and leases of motor vehicles carry an additional 0.3% state tax under RCW 82.08.020(3) on top of the 6.5% state rate and the local rate, and buyers in the Sound Transit district also pay a separate regional transit authority motor vehicle excise tax at registration. Confirm the total with a licensing office or a tax professional.",
    ],
  ],
};

export default seo;
