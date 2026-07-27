const seo = {
  intro:
    "The break-even point is the sales volume at which total contribution exactly covers fixed costs, calculated as fixed costs divided by contribution per unit, where contribution is selling price minus variable cost per unit. This calculator returns that volume and the revenue it represents, then adds the figures a small business actually plans with: units needed for a profit target, the margin of safety between expected sales and break-even, and the degree of operating leverage. It works for any unit — a plate, a subscription, a billable hour or a box.",
  useCases: [
    "Checking how many plates a day a new restaurant must serve before the rent and salaries are covered",
    "Testing whether a 10% discount campaign still leaves the shop above break-even once contribution falls",
    "Working out the sales volume that produces Rs 10 lakh of after-tax profit at a 25% tax rate",
  ],
  benefits: [
    ["Volume and revenue together", "Answers both how many to sell and how much to bill."],
    ["Target profit built in", "Grosses an after-tax target up to the pre-tax profit the volume must produce."],
    ["Risk view", "Margin of safety and operating leverage show how much a sales dip would hurt."],
  ],
  faqs: [
    [
      "How do you calculate the break-even point?",
      "Divide fixed costs by contribution per unit, where contribution is selling price minus variable cost per unit. On Rs 2,00,000 of fixed costs with a Rs 500 price and Rs 300 variable cost, contribution is Rs 200 and break-even is 1,000 units, or Rs 5,00,000 of revenue.",
    ],
    [
      "What is the difference between fixed and variable costs?",
      "Fixed costs do not change with how much you sell — rent, salaries, insurance, software subscriptions. Variable costs move with each sale — raw material, packaging, delivery, payment gateway charges. Only variable costs are subtracted from price to get contribution, which is what pays for the fixed costs.",
    ],
    [
      "What is a good margin of safety for a small business?",
      "Margin of safety is the gap between expected sales and break-even sales, as a percentage of expected sales. Anything above about 20% gives room for a bad quarter, while a single-digit margin of safety means a small drop in volume pushes the business into a loss.",
    ],
    [
      "What does it mean if variable cost is higher than the selling price?",
      "There is no break-even point at all. Each additional sale increases the loss, so more volume makes the position worse, and the only fixes are raising the price, cutting the unit cost or dropping the product. That is why this calculator refuses to return a number in that case.",
    ],
  ],
};

export default seo;
