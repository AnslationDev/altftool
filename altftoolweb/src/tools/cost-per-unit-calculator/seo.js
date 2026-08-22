const seo = {
  title: "Cost Per Unit Calculator: Rejects & Break-Even",
  metaDescription:
    "Absorb overhead across a batch, recover the cost of rejects from good units, and get full cost per unit, contribution, break-even and target price.",
  steps: [
    "Enter the batch: Units started in the batch, Reject / scrap rate (%), and the four variable lines — Direct material per unit, Direct labour per unit, Packaging per unit and Other variable cost per unit.",
    "Add Fixed overhead for the period and Batches sharing that overhead so the run absorbs only its share, then set Selling price per unit and Target net margin (%).",
    "Read “Full cost per good unit” above the saleable-of-started count, with Contribution per unit, Contribution margin, Break-even volume, Margin of safety, Batch profit, Net margin and the price your target margin needs, plus the “What a bigger run would cost” table at half, double and five times the run; “Copy result” copies the sheet.",
  ],
  intro:
    "Cost per unit is total batch cost divided by the units you can actually sell, so it has to absorb both the variable cost of every unit started and the fixed overhead allotted to the run. This calculator takes batch size, reject rate, the four standard variable cost lines, the period's fixed overhead and how many batches share it, then returns absorption cost per good unit, contribution per unit, break-even volume and the price a target margin requires. It follows the marginal-costing identity contribution = price minus variable cost, with break-even = fixed cost divided by contribution.",
  useCases: [
    "A garment unit runs 1,000 pieces with a 4% reject rate and needs the true cost per saleable piece before quoting a buyer.",
    "A cloud kitchen wants to know how many portions must sell each month before the rent and salaries are covered.",
    "A packaging supplier is asked for a 25% net margin and needs the exact price that delivers it after overhead absorption.",
  ],
  benefits: [
    ["Rejects costed properly", "Material and labour spent on scrapped units are recovered from the good units, which is where most quick estimates go wrong."],
    ["Absorption and marginal side by side", "Full cost per unit for pricing, contribution per unit for accept-or-reject and break-even decisions."],
    ["Volume sensitivity built in", "A table shows the unit cost at half, double and five times the run size, so the overhead effect is visible."],
  ],
  faqs: [
    [
      "How do you calculate cost per unit?",
      "Add total fixed cost allocated to the run and total variable cost, then divide by the number of good units produced. If 1,000 units are started at 75 per unit of variable cost with 60,000 of overhead and 4% are rejected, the total is 135,000 over 960 good units, or 140.63 per unit.",
    ],
    [
      "What is the difference between cost per unit and variable cost per unit?",
      "Variable cost per unit covers only what each unit consumes — material, direct labour, packaging — and does not move when volume changes. Cost per unit adds a share of fixed overhead, so it falls as the batch gets larger. Use variable cost for a one-off incremental order and full cost for list pricing.",
    ],
    [
      "How do I calculate break-even units for a batch?",
      "Divide the fixed cost absorbed by the batch by the contribution per unit, where contribution is selling price minus variable cost per good unit. With 60,000 of fixed cost and 120.88 of contribution the break-even is 497 units. If contribution is zero or negative there is no break-even at that price.",
    ],
    [
      "What price gives a 25% net margin?",
      "Divide full cost per unit by 0.75, because a margin is expressed on selling price, not on cost. A unit costing 140.63 must sell at 187.50 for a 25% margin. Marking up cost by 25% instead gives 175.79, which is only a 20% margin — a common and expensive mistake.",
    ],
  ],
};

export default seo;
