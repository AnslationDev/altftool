const seo = {
  title: "Florida Sales Tax Calculator: $5,000 Surtax Cap",
  metaDescription:
    "6% state tax on the full price, county surtax on only the first $5,000 per item. Pick a county or enter the DR-15DSS rate. Freight taxable by default.",
  steps: [
    "Pick your County of delivery from the preset list, which fills the rate, or type it into County surtax (% on top of 6%).",
    "Enter Price of one item (USD) and Quantity, add any Other taxable amount, Exempt items or Delivery / freight, and untick Freight is taxable only when the charge is separately stated.",
    "Read Total sales tax with the state base and the capped surtax base listed separately, then press Copy result for the full breakdown.",
  ],
  intro:
    "This calculator applies Florida's 6% state sales tax under Fla. Stat. § 212.05 together with the county discretionary sales surtax under § 212.055, and — unlike a flat combined-rate calculator — it enforces the rule that trips most people up: the surtax applies only to the first $5,000 of the sales price of any single item of tangible personal property, per § 212.054(2)(b)1. The 6% state tax has no ceiling, so on a $20,000 machine you pay 6% on the whole price but surtax on just $5,000. Retailers, equipment dealers and buyers comparing quotes get the state and surtax bases separated.",
  useCases: [
    "An equipment dealer quoting a $20,000 machine in Miami-Dade, where the surtax stops at $5,000 and the invoice rate is nowhere near a flat 7%.",
    "A retailer with a mixed basket of taxable goods, exempt groceries and a freight charge, working out which parts land in each tax base.",
    "A buyer comparing two counties, checking how much the different surtax rate actually changes the total once the per-item cap is applied.",
  ],
  benefits: [
    ["$5,000 cap applied per item", "Tests the ceiling item by item as the statute does, so two $4,000 items are treated differently from one $8,000 item."],
    ["Shows the surtax the cap saves", "Puts a dollar figure on the difference between a naive combined rate and the correct calculation."],
    ["Freight handled by rule", "Taxable freight is folded into the item's sales price, which is what pushes some invoices over the cap."],
  ],
  faqs: [
    [
      "What is the sales tax rate in Florida?",
      "The state rate is 6%. Counties add a discretionary sales surtax of 0.5% to 1.5% in most cases, so combined rates run from 6% in counties with no surtax to about 7.5% in Hillsborough, Duval and Leon. County rates are republished each January in form DR-15DSS.",
    ],
    [
      "Does Florida cap sales tax on expensive items?",
      "The county surtax is capped, not the state tax. Surtax applies only to the first $5,000 of the sales price of a single item of tangible personal property, so a $20,000 boat in a 1% county carries $1,200 state tax but only $50 of surtax. The cap does not apply to services, commercial rent or admissions.",
    ],
    [
      "Is shipping taxable in Florida?",
      "Usually yes. Delivery and freight are part of the taxable sales price unless the charge is stated separately on the invoice and the buyer had the option to avoid it by picking the item up — Rule 12A-1.045. When taxable, freight counts toward the item's sales price for the $5,000 surtax cap.",
    ],
    [
      "Is food taxed in Florida?",
      "Groceries — food products for human consumption sold for off-premises use — are exempt under Fla. Stat. § 212.08(1), and so are prescription medicines. Prepared meals, hot food, soft drinks and candy are taxable at the full combined rate. Check with the Department of Revenue for edge cases like bakery items sold for on-site eating.",
    ],
  ],
};

export default seo;
