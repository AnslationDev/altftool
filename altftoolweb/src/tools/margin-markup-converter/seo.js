const seo = {
  title: "Markup to Margin Converter & Discount Break-Even",
  metaDescription:
    "Convert markup to margin with margin = markup ÷ (1 + markup), solve cost, price and profit from any two, and see the margin a discount leaves.",
  steps: [
    "Under 'I know' choose Cost and markup %, Cost and margin %, Cost and selling price, Selling price and margin % or Selling price and markup %, enter the two figures and pick a Currency.",
    "Put a figure in 'Discount off the selling price (%)' to see what a promotion leaves of the margin, or whether it wipes the margin out entirely.",
    "Read Unit cost, Selling price, Gross profit per unit, Markup on cost, Margin on price and Price as a multiple of cost, check the 'Markup and margin side by side' table, then press Copy result.",
  ],
  intro:
    "Markup measures profit against cost — (price − cost) ÷ cost — while gross margin measures the same profit against the selling price — (price − cost) ÷ price. Because the denominators differ, markup is always the larger figure on a profitable sale, and confusing the two systematically underprices stock. This converter solves the whole picture from any two of cost, price, margin and markup using the exact identities margin = markup ÷ (1 + markup) and markup = margin ÷ (1 − margin), and also shows what a discount does to the margin you started with.",
  useCases: [
    "Translate a supplier's suggested 50% markup into the 33.33% gross margin it actually produces.",
    "Price a product from cost when the target is a 40% gross margin rather than a markup.",
    "Check whether a 30% promotional discount leaves any margin on a 40%-margin line.",
  ],
  benefits: [
    ["Exact identities", "Uses the algebraic conversion, not an approximation, so the numbers reconcile to the cent."],
    ["Solves from any pair", "Cost and markup, cost and margin, cost and price, price and margin, or price and markup."],
    ["Discount reality check", "Shows the margin that survives a discount, and flags the point where the sale goes below cost."],
  ],
  faqs: [
    [
      "What is the difference between margin and markup?",
      "Markup is profit as a percentage of cost; margin is profit as a percentage of the selling price. A product costing 100 and selling for 150 carries a 50% markup but a 33.33% margin — the same 50 of profit against two different bases.",
    ],
    [
      "How do I convert markup to margin?",
      "Divide the markup by one plus the markup, both as decimals. A 50% markup is 0.5 ÷ 1.5 = 0.3333, or a 33.33% margin. Going the other way, margin ÷ (1 − margin) gives the markup, so a 50% margin needs a 100% markup.",
    ],
    [
      "What markup do I need for a 50% margin?",
      "100% — you have to double the cost. This is what retailers call keystone pricing, and it is the clearest example of why the two measures cannot be used interchangeably.",
    ],
    [
      "How much discount wipes out my margin?",
      "A discount equal to your gross margin percentage takes the sale to exactly break-even on direct cost. On a 40% margin, a 40% discount leaves nothing, and a 20% discount cuts the margin to 25% rather than to 20%.",
    ],
  ],
};

export default seo;
