const seo = {
  intro:
    "Contribution Margin Calculator works out how much of each sale is left to cover fixed costs and profit, using contribution margin per unit = price per unit minus variable cost per unit, the contribution margin ratio as that figure divided by price, and total contribution as margin per unit times units sold. Enter three numbers — price, variable cost and units — and you get all three outputs at once. It is aimed at small business owners, freelancers and finance students pricing a product or checking whether a line is worth keeping.",
  useCases: [
    "You sell a product at 50 with 30 of materials, packaging and payment fees per unit, and want to confirm each sale leaves 20 toward rent and salaries before you commit to a price.",
    "A wholesaler asks for a 15 percent discount on a 2,000-unit order and you need to see what that does to the contribution margin ratio before agreeing.",
    "Two products bring in similar revenue but different variable costs, and you want the per-unit contribution side by side to decide which one to push in marketing.",
  ],
  benefits: [
    ["Per-unit, ratio and total in one pass", "You see the absolute margin, the percentage of price it represents and the total across your volume without running three separate sums."],
    ["Isolates variable cost from fixed cost", "The calculation deliberately excludes rent, salaries and other fixed costs, which is what makes the result usable for pricing and break-even work."],
    ["Ratio is guarded against a zero price", "If price per unit is zero the ratio is shown as a dash rather than a misleading number, so a blank field cannot masquerade as a result."],
  ],
  faqs: [
    [
      "How do you calculate contribution margin?",
      "Subtract variable cost per unit from price per unit. At a price of 50 and variable cost of 30, contribution margin is 20 per unit — the amount each sale contributes to fixed costs and then to profit.",
    ],
    [
      "What is the contribution margin ratio?",
      "Contribution margin divided by price, expressed as a percentage. A 20 margin on a 50 price is a 40 percent ratio, meaning 40 cents of every sales dollar is available for fixed costs and profit.",
    ],
    [
      "What counts as a variable cost?",
      "Costs that move with each additional unit — raw materials, direct labour paid per unit, packaging, shipping, sales commission and payment processing fees. Rent, insurance, salaried staff and software subscriptions are fixed and stay out of this calculation.",
    ],
    [
      "How do I get break-even units from contribution margin?",
      "Divide total fixed costs by contribution margin per unit. With 20 of margin per unit and 40,000 of fixed costs a year, break-even is 2,000 units; anything above that contributes to profit. This is a planning estimate, so confirm your cost classification with an accountant before basing decisions on it.",
    ],
  ],
};

export default seo;
