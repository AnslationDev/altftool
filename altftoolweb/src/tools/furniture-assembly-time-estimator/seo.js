const seo = {
  title: "Furniture Assembly Time Estimator (Flat-Pack)",
  metaDescription:
    "Costs a flat-pack build from the box contents — 0.8 min a panel, 0.4 a screw, 0.6 a cam lock — then adjusts for skill, tools, helpers and repeat items.",
  steps: [
    "Pick the Item — Wardrobe, 2 doors, Chest of 4 drawers, Dining chair and nine more — or type your own counts into Panels and major parts, Screws and bolts, Cam locks and Wooden dowels.",
    "Set Experience from \"First flat-pack I have built\" to \"Professional assembler\", Tools on hand from the Allen key in the box to a drill-driver with clutch, and People building, where 2 people are worth ×1.6.",
    "Read Estimated build time with its likely range and finish clock time, the split across unpacking, instructions, assembly, clearing up and breaks, and the tool checklist to have ready before you open the carton.",
  ],
  intro:
    "This estimator predicts how long a flat-pack furniture build will take by costing the work that is actually in the box: about 0.8 minutes to handle each panel, 0.4 to drive each screw, 0.6 per cam lock and 0.2 per dowel, on top of a base time for the item. That work content is scaled by experience and tools, divided by an effective team size — two people are worth about 1.6 builders once handing and holding are counted — and, when you are building several identical items, reduced by Wright's 90% learning curve. It also lists the tools to have on the floor before the carton is opened.",
  useCases: [
    "Deciding whether a two-door wardrobe fits into a Saturday morning or needs the whole day",
    "Quoting a paid assembly job for six identical dining chairs, where the sixth takes noticeably less time than the first",
    "Checking how much faster a build gets with a cordless drill-driver instead of the Allen key in the box",
  ],
  benefits: [
    ["Counts what is in the box", "Part, screw, cam lock and dowel counts drive the estimate, so a heavy chest of drawers is not treated like a bedside table."],
    ["Realistic team maths", "Extra people are worth less than one each; the model uses 1.6× for two and 2.0× for three rather than pretending help is linear."],
    ["Learning curve for batches", "Repeated identical items follow Wright's 90% curve, so the batch total is not just the single-item time multiplied out."],
  ],
  faqs: [
    [
      "How long does it take to assemble flat-pack furniture?",
      "Most single items land between 30 minutes and 3 hours: a dining chair is around 35–55 minutes, a bookshelf 60–90, a desk 70–95 minutes and a two-door wardrobe often 2.5–4 hours for one person. Part count and cam-lock count predict it better than the price or the brand.",
    ],
    [
      "Is it faster to assemble furniture with two people?",
      "Yes, but not twice as fast — expect roughly a 35–40% saving rather than 50%, because one person is often waiting, holding or reading. A second pair of hands helps most on wardrobes and beds where large panels must be held upright, and least on small items where two people simply get in each other's way.",
    ],
    [
      "Does a power drill speed up flat-pack assembly?",
      "A basic cordless drill-driver typically cuts total time by around 15–25% compared with hand tools — more on items with lots of screws like a bed or TV unit, less on smaller items. Add a clutch and a proper bit set and the saving grows to roughly 25–35%. Set the clutch low and finish by hand — chipboard strips easily, and an over-driven cam bolt or hinge screw is far slower to fix than it was to drive.",
    ],
    [
      "Why is the second identical item quicker to build than the first?",
      "Because you have already read the manual, learned the part names and worked out the sequence. This is the learning curve first described by T. P. Wright in 1936: at a 90% rate, every doubling of the number built cuts the unit time to 90% of the previous figure, so six chairs take about 5.1 times the first chair rather than 6 times.",
    ],
  ],
};

export default seo;
