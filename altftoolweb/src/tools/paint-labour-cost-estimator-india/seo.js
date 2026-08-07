const seo = {
  intro:
    "This estimator converts a home's carpet area into the painter's labour bill by multiplying painted surface area by a per-sqft labour rate that varies with finish grade and city tier. It uses the standard contractor rule that paintable wall area is roughly 3 to 3.5 times carpet area at a 10 ft ceiling, adds the ceiling as a separate surface, and prices full-wall putty as its own labour line. It is built for homeowners comparing painting quotes and for contractors sanity-checking a rate before they send one.",
  useCases: [
    "Checking whether a painter's quote of Rs 25 per sqft for a 1,000 sqft flat is labour-only or quietly includes material",
    "Working out how much of a repainting budget goes to labour before choosing between distemper, washable emulsion and a texture finish",
    "Estimating how many days two painters will need for a duplex with 12 ft ceilings, so you can plan when to move furniture back",
  ],
  benefits: [
    ["Separates labour from material", "Prices only the painter's charge, so you can compare a labour-rate quote against a turnkey one."],
    ["City-tier aware", "Applies a multiplier to the baseline rate because painter day wages differ sharply between metros and small towns."],
    ["Schedule as well as cost", "Converts painted area into painter-days and calendar days at your chosen crew size."],
  ],
  faqs: [
    [
      "How much do painters charge per square foot in India?",
      "Labour-only rates typically run about Rs 5 to Rs 9 per sqft for distemper and basic emulsion repaint work, Rs 14 to Rs 25 for premium washable emulsion with full putty, and roughly Rs 27 to Rs 38 or more per sqft for texture and designer finishes, depending on city tier. Metro rates run 45-75% above smaller-city rates because painter day wages are higher there.",
    ],
    [
      "Is paint included in a per-sqft painting rate?",
      "Usually not. Contractors in India quote a labour rate and a material rate separately, and a turnkey or 'with material' quote is normally two to three times the labour-only figure. Always ask which one you are being shown, and get the paint brand, product name and number of coats in writing.",
    ],
    [
      "How do I calculate the paintable area of my house?",
      "Multiply carpet area by about 3.2 for walls at a standard 10 ft ceiling, then add the carpet area once more if the ceiling is being painted. A 1,000 sqft flat therefore works out to roughly 3,200 sqft of wall plus 1,000 sqft of ceiling, or 4,200 sqft of painted surface.",
    ],
    [
      "Why does ceiling height change the labour cost?",
      "Above roughly 10 ft a painter cannot work off a step ladder and has to erect staging, which slows the job and adds setup time, so contractors typically add around 15% to the labour bill. Double-height living rooms and stairwells attract the largest surcharge.",
    ],
  ],
};

export default seo;
