const seo = {
  title: "Cascading Discount Calculator: Effective % Off",
  metaDescription:
    "Stack successive offers, a flat coupon and tax for the real effective discount: 50% then 20% is 60% off, not 70%, and the gap is shown.",
  steps: [
    "Enter the List price / MRP per unit and Quantity, then fill Offer 1 (%) and Offer 2 (%).",
    "Use Add another offer for up to 8 stacked stages, set the Flat coupon off (after % offers), and pick a rate from the 0, 5, 12, 18 and 28% GST chips.",
    "Read the single Effective discount with the net price, the percentage points by which simply adding the offers overstates it, and the Stage by stage table of the price left after each offer.",
  ],
  intro:
    "A cascading discount is a chain of offers applied one after another, each on the price the previous one left behind, so the effective discount is 1 minus the product of the remaining fractions — never the sum of the percentages. This calculator takes a list price, any number of stacked percentage offers, a flat coupon and a tax rate, and returns the single equivalent discount, the net price and exactly how much the naive addition overstates your saving. It is built for shoppers comparing offers and for sellers pricing a promotion stack.",
  useCases: [
    "A store advertises '50% off plus an extra 20% off at the counter' and you want to know whether that is 70% or 60%.",
    "You are stacking a festive sale price, a bank card offer and a flat 500 coupon, and need the true landed price before GST.",
    "You price a promotion as a retailer and must check the margin left after a distributor discount, a trade discount and a cash discount.",
  ],
  benefits: [
    ["Multiplies, never adds", "Each offer is applied to the reduced price, which is how successive discounts actually work at the till."],
    ["Shows the overstatement", "The gap between the plain sum of the offers and the real effective discount is printed as a percentage-point figure."],
    ["Coupon and tax in the right order", "The flat coupon comes off after the percentages and tax is charged on the discounted value, matching normal invoice sequencing."],
  ],
  faqs: [
    [
      "Is 50% off plus 20% off the same as 70% off?",
      "No — it is 60% off. The second discount is taken on the already-reduced price, so 100 becomes 50 and then 40, a total saving of 60. The single equivalent discount for two offers is d1 + d2 - (d1 x d2)/100, which here is 50 + 20 - 10 = 60%.",
    ],
    [
      "How do I calculate the effective rate of three or more stacked discounts?",
      "Multiply the remaining fractions and subtract from one: effective = [1 - (1 - d1/100)(1 - d2/100)(1 - d3/100)] x 100. Three 50% discounts give 1 - 0.5 x 0.5 x 0.5 = 0.875, so 87.5% off, not 150%.",
    ],
    [
      "Does the order of the discounts change the final price?",
      "No. Multiplication is commutative, so 20% then 10% and 10% then 20% both leave 72% of the price. The order only matters when a flat rupee coupon or a rupee cap is mixed in, because a fixed amount removed early is worth more than the same amount removed after a percentage cut.",
    ],
    [
      "Is GST charged before or after a discount?",
      "After. Under section 15 of the CGST Act, 2017 the taxable value is the transaction value, and a discount recorded on the invoice at the time of supply is excluded from it, so GST applies to the discounted amount. Post-sale discounts are only excluded if they were agreed before the supply and are linked to the relevant invoices — confirm the treatment with your tax adviser for your own invoices.",
    ],
  ],
};

export default seo;
