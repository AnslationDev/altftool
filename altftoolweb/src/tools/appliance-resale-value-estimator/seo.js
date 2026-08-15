const seo = {
  title: "Second-Hand Appliance Value: Fridge, AC, Washing",
  metaDescription:
    "Price a used fridge, AC or washing machine from original cost, age, condition, BEE star rating and warranty left, with an added discount for R-22 units.",
  steps: [
    "Pick the Appliance — Refrigerator, Split air conditioner, Window air conditioner or a washing machine — then fill Original purchase price (INR) and Age (months, 0-300).",
    "Set Condition, BEE star rating, Compressor / motor warranty left (years) and Known repair cost to deduct (INR); an air conditioner also offers Uses R-22 refrigerant.",
    "Read Estimated private-sale value with its ask-between range, the Second-hand dealer offer to expect and the Scrap-value floor, then press Copy result.",
  ],
  intro:
    "This estimator prices a used refrigerator, air conditioner or washing machine by applying a category-specific declining-balance depreciation curve to its original price, then adjusting for condition, BEE star rating, remaining compressor or motor warranty and how close the unit is to the end of its rated service life. White goods hold value differently from electronics: a fridge rated for about 12 years falls slowly at first, then collapses toward scrap as replacement age approaches. Older air conditioners running R-22 refrigerant carry an extra discount because that refrigerant is being phased out under the Montreal Protocol.",
  useCases: [
    "Pricing a four-year-old refrigerator before listing it ahead of a house move",
    "Checking whether an exchange offer on a new AC is better than selling the old one privately",
    "Deciding if a washing machine near the end of its service life is worth repairing before sale",
  ],
  benefits: [
    ["Per-category curves", "A fridge, a window AC and a semi-automatic washer each get their own retention rate and service life."],
    ["End-of-life taper", "Value falls sharply as the unit nears its rated life, which is how second-hand buyers actually price risk."],
    ["Moving costs counted", "Uninstall, transport and reinstall come off the price, which matters most for split air conditioners."],
  ],
  faqs: [
    [
      "How long does a refrigerator or air conditioner last?",
      "A refrigerator is generally rated for around 10-12 years of service and a room air conditioner for about 10, with washing machines nearer 8-10. Resale value drops steeply in the last few years of that window because a compressor or motor failure becomes the buyer's likely next expense.",
    ],
    [
      "Does the BEE star rating change resale value?",
      "Yes, because a second-hand buyer is really buying the electricity bill. A 5-star unit uses meaningfully less power than a 1-star unit of the same capacity, so higher-rated appliances sell faster and for a few percent more, and unrated older units sell hardest.",
    ],
    [
      "Why is an old R-22 air conditioner worth less?",
      "R-22 is a hydrochlorofluorocarbon being phased out under the Montreal Protocol, so supply for topping up shrinks and prices rise every year. Buyers discount R-22 units because any gas leak becomes an expensive, and eventually impractical, repair.",
    ],
    [
      "Is it worth repairing an appliance before selling it?",
      "Only when the repair costs clearly less than the value it restores, which this estimator makes visible by letting you deduct the repair from the working price. A cheap thermostat or door gasket usually pays for itself; a compressor replacement on a unit past its rated life rarely does. Get a written quote before deciding.",
    ],
  ],
};

export default seo;
