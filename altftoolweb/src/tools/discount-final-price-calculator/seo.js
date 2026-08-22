const seo = {
  title: "Discount Calculator: Stacked Offers, Final Price",
  metaDescription:
    "20% then 10% is 28% off, not 30%. Stack percentage and flat discounts in order, add GST on the discounted value, see the equivalent single discount.",
  steps: [
    "Enter List price before discount (INR) and set GST added on the discounted price (%), using the 0%, 5%, 12%, 18% and 28% slab buttons if one matches.",
    "Under Discounts, in the order they apply press Add discount for each step and set it to % off or Flat amount off, in the sequence the seller applies them — a flat amount and a percentage do not commute.",
    "Final payable updates live, with rows for You save, Equivalent single discount and If the percentages were simply added — overstates by …, and Copy result copies the whole breakdown.",
  ],
  intro:
    "Successive discounts multiply rather than add: a price cut of 20% followed by a further 10% leaves 0.8 × 0.9 = 0.72 of the original, an equivalent single discount of 28% and not 30%. This calculator applies percentage and flat-rupee discounts in the order a checkout actually applies them, adds GST on the discounted value as section 15(3)(a) of the CGST Act requires, and reports the true saving, the final payable amount and the equivalent single discount. It also works backwards from a marked price and a price paid to the discount percentage that implies.",
  useCases: [
    "Checking whether a sale banner reading 40% + extra 20% is really the 60% off it appears to be",
    "Working out the invoice total when a flat coupon and a percentage discount are both applied before 18% GST",
    "Comparing a straight 30% off against a 20% discount stacked with a 15% card offer",
  ],
  benefits: [
    ["Correct stacking maths", "Percentages are multiplied, not added, and the overstatement is shown explicitly."],
    ["Order-aware", "Flat and percentage discounts are applied in sequence, because swapping them changes the price."],
    ["GST on the right base", "Tax is computed on the discounted transaction value, matching invoice-level discount rules."],
  ],
  faqs: [
    [
      "How do you calculate two discounts applied one after another?",
      "Multiply the remaining fractions rather than adding the discounts. For 20% then 10%, multiply the price by 0.80 and then by 0.90, giving 0.72 of the original — a 28% total discount. On a Rs 2,000 item that is Rs 1,440, so the saving is Rs 560 and not the Rs 600 that adding the percentages would suggest.",
    ],
    [
      "Is 20% off plus an extra 10% the same as 30% off?",
      "No, and the gap widens as the discounts get bigger. Stacking 20% and 10% gives 28%; stacking 50% and 50% gives 75%, not 100%. The equivalent single discount is always 1 − (1 − d₁)(1 − d₂), which is smaller than d₁ + d₂ whenever both are positive.",
    ],
    [
      "Is GST charged before or after a discount?",
      "After, when the discount appears on the invoice itself. Section 15(3)(a) of the CGST Act, 2017 allows a discount given at or before the time of supply and recorded on the invoice to be excluded from the transaction value, so GST applies to the discounted amount. Discounts agreed after the sale need a prior agreement and a credit note before they can reduce the taxable value.",
    ],
    [
      "Does it matter whether the flat discount or the percentage is applied first?",
      "Yes. Taking Rs 200 off Rs 1,000 and then 10% leaves Rs 720, while applying 10% first and then Rs 200 off leaves Rs 700 — a Rs 20 difference on the same two offers. Percentage discounts commute with each other, but a flat amount does not commute with a percentage, so enter the steps in the order the seller applies them.",
    ],
  ],
};

export default seo;
