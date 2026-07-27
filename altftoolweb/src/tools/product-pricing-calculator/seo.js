const seo = {
  intro:
    "This calculator sets a selling price from the bottom up: it builds the landed unit cost from materials, labour, packaging, inbound shipping and a share of monthly overhead, then solves for the price that leaves your target gross margin after a marketplace commission — price = cost ÷ (1 − commission − margin) — before adding sales tax and rounding to a price point. Because commission is a share of the selling price rather than of cost, adding it to the margin is not enough; the formula accounts for that, and refuses combinations where commission plus margin reach 100%. The margin actually achieved is recalculated after rounding, not assumed.",
  useCases: [
    "Price a handmade product for a marketplace that takes 15% of the sale.",
    "Work out the shelf price including 18% GST that still leaves a 40% gross margin.",
    "Find how many units a month must sell to cover fixed overhead at the chosen price.",
  ],
  benefits: [
    ["Commission solved properly", "The price accounts for a commission charged on the selling price, not bolted on after the margin."],
    ["Overhead absorbed", "Monthly fixed costs are divided across expected units so the unit cost is the real one."],
    ["Rounding checked", "Charm and round-number price points are applied, then the resulting margin is recomputed."],
  ],
  faqs: [
    [
      "How do I calculate a selling price from cost and margin?",
      "Divide the unit cost by one minus the margin expressed as a decimal. A cost of 85 at a 40% target margin gives 85 ÷ 0.60 = 141.67 before tax. Multiplying the cost by 1.40 instead is a markup, and would leave only a 28.6% margin.",
    ],
    [
      "How do I price for a marketplace that takes a commission?",
      "Subtract the commission from the denominator: price = cost ÷ (1 − commission − margin). At a cost of 85 with 15% commission and a 40% target margin the price is 85 ÷ 0.45 = 188.89, which leaves 160.56 after the platform's cut and 75.56 of profit.",
    ],
    [
      "Should I set the price before or after tax?",
      "Set it before tax, because tax is collected on the customer's behalf and never belongs to you. Add the rate afterwards to reach the shelf price — 141.67 plus 18% GST is 167.17 — and remember that a tax-inclusive shelf price must be divided by 1 plus the rate to recover the net price.",
    ],
    [
      "How many units do I need to sell to break even?",
      "Divide fixed costs by the contribution per unit, which is the amount you receive after commission minus the variable cost. With 12,000 of monthly overhead and a contribution of 71.67, break-even is 168 units a month.",
    ],
  ],
};

export default seo;
