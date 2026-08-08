const seo = {
  title: "Merch Margin Calculator: Profit per Unit After Fees",
  metaDescription:
    "Profit per merch unit after blank, print, packaging and shipping costs plus marketplace, payment and fixed fees — with margin and break-even price.",
  steps: [
    "Enter the Sale price with the per-unit Blank cost, Print cost, Packaging and Shipping.",
    "Set Marketplace %, Payment % and Returns %, which are charged against the sale price, plus the Fixed fee added on top.",
    "The four tiles read Profit, Margin, Break-even and Fees; Copy puts the price, profit with margin and break-even price on the clipboard, and Reset restores the worked example.",
  ],
  intro:
    "Merch profit per unit is the order value minus the unit cost and minus every fee, where the fee percentage is charged on the price plus any shipping you collect: profit = (price + shipping) x (1 - platform rate - processing rate) - fixed fees - blank - print - packaging - postage. This calculator also reports margin against revenue, markup against cost, the effect of a return rate, the break-even selling price and the price that would hit a target margin. Aimed at creators and small brands pricing print-on-demand or short-run merch.",
  useCases: [
    "Find out that an 899 tee with a 260 blank, 120 print and 90 postage keeps about 333 after an 8% marketplace fee.",
    "See how a 4% return rate quietly removes a chunk of profit, because returned goods and outbound postage are gone even when the sale is refunded.",
    "Work out the lowest price you could ever sell at without losing money before you plan a sale.",
    "Set the price that delivers a 40% margin instead of guessing a round number and hoping.",
  ],
  benefits: [
    ["Fees on the full order", "Percentages are applied to price plus shipping, the way marketplaces actually charge them."],
    ["Margin and markup, both shown", "A 40% margin is a 67% markup — mixing them up is how merch gets underpriced."],
    ["Returns and setup cost included", "Effective profit after returns, plus the units needed to recover artwork and sampling costs."],
  ],
  faqs: [
    [
      "How do you calculate profit margin on merchandise?",
      "Subtract the unit cost and all fees from what the buyer pays, then divide the result by that same order value. On an 899 order with 470 of goods and postage and about 96 of fees, profit is 333 and margin is 37%.",
    ],
    [
      "What is the difference between margin and markup?",
      "Margin divides profit by the selling price; markup divides the same profit by cost. A 333 profit on an 899 sale costing 566 is a 37% margin but a 59% markup. Quoting markup as if it were margin consistently overstates how much you keep.",
    ],
    [
      "Do marketplace fees apply to shipping too?",
      "On most marketplaces, yes. The percentage is charged on the whole order value including the shipping you collect, which is why offering free shipping and building the postage into the price still costs you the fee on that amount.",
    ],
    [
      "How does a return rate affect merch profit?",
      "A refunded order gives the revenue back while the printed item and outbound postage are already spent. At a 4% return rate on a unit that costs 470 to make and deliver, you lose roughly 19 per unit sold on top of the returned profit, cutting a 333 profit to about 301.",
    ],
  ],
};

export default seo;
