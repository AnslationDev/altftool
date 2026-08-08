const seo = {
  title: "Break-Even Calculator: Units, Revenue, Safety Margin",
  metaDescription:
    "Break-even units = fixed cost ÷ (price − variable cost). Returns contribution per unit, break-even revenue, target-profit units and margin of safety.",
  intro:
    "The Break-Even Calculator works out how many units you must sell before a product stops losing money, using the standard formula break-even units = fixed cost ÷ (selling price − variable cost per unit). Enter your fixed cost, per-unit variable cost, selling price, expected sales and a profit target, and it returns contribution per unit, contribution margin, break-even revenue, the units needed to hit your target profit, and margin of safety. A cost-volume-profit chart marks the exact unit count where the revenue and total-cost lines cross, and the whole scenario table exports to CSV.",
  useCases: [
    "You are pricing a product at ₹850 with ₹320 of materials and packaging per unit and ₹4.5 lakh of fixed setup cost, and you need to know whether 1,200 units in the first season actually clears the outlay.",
    "A supplier raises your per-unit cost by ₹40 and you want to see how far the break-even point moves before deciding whether to absorb it or raise the price.",
    "You are writing the numbers section of a loan or investor deck and need the break-even units, break-even revenue and margin of safety percentage that a lender will ask for.",
  ],
  benefits: [
    ["Shows the whole curve, not one number", "Plots revenue against total cost across your full unit range so you can see how fast profit turns positive after the crossover."],
    ["Separates target profit from break-even", "Calculates units for zero profit and units for a stated profit goal side by side, using (fixed cost + target profit) ÷ contribution."],
    ["Flags impossible pricing immediately", "If the selling price is at or below variable cost, contribution is zero or negative and the tool says break-even is not possible instead of printing a misleading figure."],
  ],
  faqs: [
    [
      "How do you calculate the break-even point in units?",
      "Divide total fixed cost by the contribution per unit, where contribution = selling price − variable cost per unit. With ₹4,50,000 fixed cost, an ₹850 price and ₹320 variable cost, contribution is ₹530 and break-even is 850 units, rounded up because you cannot sell a fraction of a unit.",
    ],
    [
      "What is a good margin of safety percentage?",
      "Margin of safety is (expected units − break-even units) ÷ expected units, and many small businesses treat anything under about 20 percent as thin because a modest sales miss then pushes you into a loss. A negative figure means your forecast sales are below break-even.",
    ],
    [
      "Why does the calculator apply tax only on positive profit?",
      "Because a loss-making period has no profit to tax, the tool applies your tax rate to profit before tax only when that figure is above zero. Loss carry-forward and set-off rules vary by jurisdiction, so treat the tax line as an estimate and confirm it with an accountant.",
    ],
    [
      "How many units do I need to sell to earn a specific profit?",
      "Add the profit you want to your fixed cost, then divide by contribution per unit: (fixed cost + target profit) ÷ contribution. With ₹4,50,000 fixed cost, ₹2,50,000 target profit and ₹530 contribution, that is 1,321 units.",
    ],
  ],
};

export default seo;
