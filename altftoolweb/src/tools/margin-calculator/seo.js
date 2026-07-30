const seo = {
  intro:
    "The Profit Margin Calculator takes a cost and a selling price and returns the gross margin as (price minus cost) divided by price, alongside the cash profit and the equivalent markup, which divides the same profit by cost instead. Enter 60 and 100 and you get a 40 percent margin, 40 in profit and a 66.67 percent markup — the two percentages that people most often confuse. It is for anyone pricing a product, checking a quote or sanity-testing a supplier deal.",
  useCases: [
    "Checking whether a wholesale price still clears your target margin after a supplier raises the unit cost, before you agree the new terms.",
    "Translating a supplier's quoted markup into the margin your accountant actually asks for, since a 50 percent markup is only a 33.33 percent margin.",
    "Pricing a freelance job by entering your true cost of delivery and the fee you plan to quote, to see what proportion of the invoice is actually profit.",
  ],
  benefits: [
    [
      "Margin and markup side by side",
      "Both percentages come out of the same cost and price, which is the fastest way to stop confusing the two.",
    ],
    [
      "Cash profit, not just a percentage",
      "The absolute profit is shown next to the ratios, so a high margin on a small ticket does not look better than it is.",
    ],
    [
      "Two inputs, no setup",
      "Cost and selling price are the only fields, so you can re-check a price in the middle of a negotiation.",
    ],
  ],
  faqs: [
    [
      "What is the difference between margin and markup?",
      "Margin divides profit by the selling price; markup divides the same profit by the cost. A product costing 60 and selling at 100 has a 40 percent margin but a 66.67 percent markup, and markup is always the larger of the two figures for a profitable sale.",
    ],
    [
      "How do I calculate gross profit margin?",
      "Subtract the cost from the selling price, divide by the selling price, then multiply by 100. That is exactly what this calculator does, so cost 60 and price 100 gives (100 - 60) / 100 = 40 percent.",
    ],
    [
      "What is a good profit margin?",
      "It depends entirely on the trade — grocery retail commonly runs on single-digit gross margins while software can exceed 80 percent — so compare against your own sector rather than a universal target. Use this figure as gross margin only; it excludes overheads, wages and tax, and a tax adviser or accountant should confirm your net position.",
    ],
    [
      "Can the margin be negative?",
      "Yes, if the cost is higher than the selling price the profit is negative and so is the margin, which means you are selling at a loss. A margin of exactly 0 percent means you are covering cost and nothing else.",
    ],
  ],
};

export default seo;
