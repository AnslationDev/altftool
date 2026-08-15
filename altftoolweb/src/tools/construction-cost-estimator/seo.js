const seo = {
  title: "House Construction Cost Estimator per Sq Ft",
  metaDescription:
    "Built-up area and finish grade to a rupee total: economy ₹1,600 to luxury ₹3,600 per sq ft, a city factor, 12 work heads and material quantities.",
  steps: [
    "Enter \"Built-up area per floor (sq ft)\" and Number of floors, then pick a Quality of construction — Economy / basic finish at ₹1,600/sq ft up to Luxury finish at ₹3,600/sq ft — and a Location from Metro to \"Tier 3 / small town\".",
    "Add \"Compound wall & external works (INR)\", \"Design & professional fees (% of civil cost)\" and \"Contingency (% of civil cost)\", or tick \"Use my own rate per sq ft\" to replace the benchmark with your own \"Rate per sq ft (INR, before city factor)\".",
    "The Estimated construction cost headline gives the all-in per-sq-ft rate and a likely range, over rows for City factor applied, Civil construction cost and Total estimated cost, plus \"Where the civil cost goes\" and \"Approximate material requirement\"; Copy result copies the estimate.",
  ],
  intro:
    "This estimator turns a built-up area and a quality grade into a rupee figure for building a house, using per-square-foot rates for economy, standard, premium and luxury finishes adjusted by a metro, tier-1, tier-2 or tier-3 city factor. On top of the civil cost it adds design and professional fees, a contingency and any external works, then splits the civil cost across twelve work heads and converts the area into thumb-rule quantities of cement, steel, sand, aggregate and bricks. It is meant for plot owners, self-builders and small contractors sizing a budget before a bill of quantities exists.",
  useCases: [
    "Working out whether a 2,400 sq ft two-floor house fits the budget before finalising the architect's drawings",
    "Sanity-checking a contractor's lump-sum quote against a per-square-foot benchmark for the same quality of finish",
    "Estimating how much cement, TMT steel and sand to plan for so material orders and cash flow can be staged",
    "Comparing the cost of an economy finish against a premium finish on the same footprint before choosing specifications",
  ],
  benefits: [
    ["Quality and city both matter", "The same slab costs more in a metro than a small town, so the rate is adjusted by a location factor as well as the finish grade."],
    ["Work-head breakdown", "See how much of the budget goes to foundation, steel, cement, tiling, plumbing and electrical instead of a single opaque number."],
    ["Material quantities included", "Thumb rules convert built-up area into cement bags, kilograms of steel, cubic feet of sand and aggregate, and brick counts."],
  ],
  faqs: [
    [
      "What is the current cost of house construction per square foot in India?",
      "As a broad benchmark, a basic finish runs around ₹1,500–1,700 per sq ft, a standard finish around ₹1,800–2,100, a premium finish around ₹2,400–2,800 and a luxury finish ₹3,000 and upward. Metro cities typically run 10–20% higher than the national average because of labour and transport costs.",
    ],
    [
      "Is built-up area or carpet area used for construction cost?",
      "Construction is priced on built-up area — the carpet area plus wall thickness plus balconies — because that is what actually gets built. Using carpet area with a built-up rate will understate the cost by roughly 20–30%.",
    ],
    [
      "How much cement and steel does a house need?",
      "Common thumb rules for an RCC-framed residential building are about 0.4 bags of cement, 4 kg of TMT steel, 1.8 cu ft of sand, 1.35 cu ft of aggregate and 8 bricks per sq ft of built-up area. Actual consumption depends on the structural design, span lengths and number of floors.",
    ],
    [
      "What costs are usually left out of a per-square-foot estimate?",
      "Plan sanction and approval fees, soil testing, borewell or water connection, electricity connection deposits, compound wall and landscaping, lift, solar, modular kitchen and loose furniture are normally quoted separately. Keep a 5–10% contingency for site conditions and material price movement.",
    ],
  ],
};

export default seo;
