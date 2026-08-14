const seo = {
  title: "Wood Polish Quantity Calculator: Melamine, PU, NC",
  metaDescription:
    "Convert doors and furniture area into ready-to-spray litres of melamine, 2K PU or NC lacquer, split into base, hardener and thinner in ratio.",
  steps: [
    "Choose the 'Finish' - Melamine, PU (2K polyurethane) or NC lacquer - and set 'Sealer coats' and 'Topcoats' (default 1 + 2).",
    "Enter 'Furniture / panelling area (sq ft)', 'Number of doors' with height, width and faces polished, plus 'Wastage allowance (%)' - door area gets a 5% edge allowance automatically.",
    "Read 'Ready-to-spray polish needed' in litres, the sealer, topcoat, hardener and thinner to buy, and the material cost per sq ft; 'Copy result' captures the list.",
  ],
  intro:
    "This calculator converts the surface area of doors and furniture into the litres of melamine, 2K PU or NC lacquer a job needs, using the ready-to-spray spreading rate rather than the rate on the tin. It then splits that volume back into base, hardener and thinner in the system's mixing ratio — 2 parts base to 1 part hardener for PU, roughly 1:1 for melamine — so you know what to actually buy. Carpenters, polishers and homeowners supervising interior work use it before placing the order.",
  useCases: [
    "A homeowner buying melamine for four flush doors and a wardrobe without over-ordering thinner",
    "A contractor pricing a 2K PU finish and needing the hardener quantity separately from the base",
    "A carpenter checking whether one 4-litre pack of sealer covers a full bedroom set at two coats",
  ],
  benefits: [
    ["Ready-mix maths", "Works in sprayed volume first, then back-calculates each tinned component."],
    ["Doors measured properly", "Both faces plus a 5% edge allowance the face measurement misses."],
    ["Sealer and topcoat apart", "Bare wood drinks in sealer, so the two layers are costed at different spreading rates."],
  ],
  faqs: [
    [
      "How much melamine polish is needed per square foot?",
      "Roughly one litre of ready-to-spray melamine covers 90 square feet as a sealer coat and about 120 square feet as a topcoat. For a typical one-sealer plus two-topcoat schedule that works out to around one litre of ready mix per 33 square feet, or about half a litre of tinned melamine once the 1:1 thinner is accounted for.",
    ],
    [
      "What is the mixing ratio for PU polish?",
      "Two-pack PU wood finish is conventionally mixed 2 parts base to 1 part hardener by volume, with thinner added to reach spraying viscosity — commonly another 1 part. Always follow the ratio on the datasheet of the product you bought, because it varies by brand and by whether the finish is matt or glossy.",
    ],
    [
      "How do I calculate the polish area of a door?",
      "Multiply height by width for one face, double it if both faces are polished, then add about 5 percent for the four edges. A 6.5 ft by 3 ft shutter polished on both sides works out to roughly 41 square feet including edges.",
    ],
    [
      "How many coats of polish does wood need?",
      "A standard interior schedule is one to two sealer coats followed by two topcoats, with sanding between coats. Open-grained timber such as teak often needs the second sealer coat to fill the grain, while close-grained MDF and veneer usually do not.",
    ],
  ],
};

export default seo;
