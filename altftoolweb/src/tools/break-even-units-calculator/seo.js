const seo = {
  title: "Break-Even Units Calculator with Contribution Margin",
  metaDescription:
    "Enter fixed costs, price and variable cost to get break-even units rounded up, plus contribution margin per unit and break-even revenue.",
  intro:
    "The Break-Even Units Calculator answers one question in three inputs: how many units you must sell to cover your costs, calculated as fixed costs ÷ (price per unit − variable cost per unit), rounded up to a whole unit. Type in your fixed costs, selling price and variable cost and it returns the unit count along with contribution margin per unit and the break-even revenue that goes with it. It is the quick version for anyone who wants the number itself rather than a full cost-volume-profit model.",
  useCases: [
    "You are quoting a one-off print run: ₹10,000 of setup and artwork, ₹30 of stock per piece, ₹50 sale price — and you want the sales count that gets the job to zero before you agree the price.",
    "A market stall costs a flat fee for the day and you need to know how many coffees you must pour before the pitch fee is covered and every further cup is profit.",
    "You are comparing two suppliers whose per-unit price differs by a few rupees and want to see how many extra units the cheaper contribution margin saves you.",
  ],
  benefits: [
    ["Three inputs, no setup", "Fixed cost, price and variable cost are all it needs, so you get the unit count in one screen rather than filling in a forecasting model."],
    ["Rounds the way selling works", "Break-even units are rounded up, because 500.4 units means you have to sell 501 to actually clear your costs."],
    ["Refuses to return a fake answer", "When price is equal to or below variable cost the contribution margin is not positive, so the tool reports that instead of printing a break-even figure that could never be reached."],
  ],
  faqs: [
    [
      "What is the break-even units formula?",
      "Break-even units = fixed costs ÷ (price per unit − variable cost per unit). With ₹10,000 in fixed costs, a ₹50 price and ₹30 variable cost, the contribution margin is ₹20 per unit and break-even is 500 units.",
    ],
    [
      "What is contribution margin per unit?",
      "It is the selling price minus the variable cost of one unit — the amount each sale contributes toward fixed costs and then profit. At a ₹50 price and ₹30 variable cost, contribution margin is ₹20, or 40 percent of the price.",
    ],
    [
      "What counts as a fixed cost and what counts as variable?",
      "Fixed costs stay the same whatever you sell — rent, salaries, tooling, a stall fee, software subscriptions. Variable costs move with each unit — materials, packaging, payment-gateway fees, per-order shipping and sales commission.",
    ],
    [
      "Why can't the calculator give an answer when price is below variable cost?",
      "Because every extra unit then adds to the loss, so no sales volume ever covers the fixed cost. The contribution margin must be greater than zero; raise the price or cut per-unit cost until price exceeds variable cost.",
    ],
  ],
};

export default seo;
