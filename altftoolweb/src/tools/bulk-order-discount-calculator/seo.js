const seo = {
  intro:
    "Bulk price lists come in two shapes and they give different totals for the same order. Flat (non-cumulative) tiers charge every unit at the rate of the band the quantity reaches, so 60 units on a 50+ break at Rs 80 costs Rs 4,800. Graduated (slab) tiers charge each unit at its own band's rate, so the same 60 units cost 9 × 100 + 40 × 90 + 11 × 80 = Rs 5,380. This calculator prices an order either way, adds freight and GST on goods plus freight, and reports the effective and landed cost per unit — including the flat-tier cases where ordering more units lowers the total.",
  useCases: [
    "Deciding whether to order 48 units at the mid tier or 50 at the next break when 50 costs less in total",
    "Converting a supplier's slab price list into a single landed cost per unit for a costing sheet",
    "Checking whether topping up an order to clear a free-shipping threshold is cheaper than paying freight",
  ],
  benefits: [
    ["Both tier structures", "Flat whole-order rates and graduated slab rates, priced from the same list."],
    ["Finds the cheaper bigger order", "Flags when buying more units costs less, which flat tiering makes possible."],
    ["Landed cost, not list price", "Freight and GST folded in to give the number a costing sheet actually needs."],
  ],
  faqs: [
    [
      "How do you calculate a bulk discount price?",
      "Find the tier your quantity falls into and multiply. With flat tiers of 1–9 at Rs 100, 10–49 at Rs 90 and 50+ at Rs 80, an order of 60 units is charged entirely at Rs 80, giving Rs 4,800. The effective discount against the base rate is (100 − 80) ÷ 100 = 20%.",
    ],
    [
      "What is the difference between flat and graduated quantity pricing?",
      "Flat pricing applies one rate to the whole order once the quantity reaches a break. Graduated pricing charges each unit at the rate of the band it sits in, like income tax slabs. For 60 units on the same list, flat gives Rs 4,800 and graduated gives Rs 5,380 — a Rs 580 difference on identical published rates, so it is worth confirming which one a supplier means.",
    ],
    [
      "Can ordering more units cost less in total?",
      "Yes, but only with flat tiering. Ordering 48 units at Rs 90 costs Rs 4,320, while 50 units at Rs 80 costs Rs 4,000 — two extra units and Rs 320 less. Graduated pricing is always monotonic, so the total can never fall as quantity rises.",
    ],
    [
      "Is GST charged on shipping in a bulk order?",
      "Yes, when the supplier charges the freight. Section 15(2)(c) of the CGST Act, 2017 includes incidental expenses such as packing and freight charged by the supplier in the value of supply, so GST applies to goods plus shipping at the rate applicable to the goods. Freight arranged independently by the buyer is a separate supply with its own treatment.",
    ],
  ],
};

export default seo;
