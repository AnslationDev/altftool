const seo = {
  intro:
    "Packing shoes is a minimum set cover problem: each pair covers some of the conditions a trip throws at you, and you want the fewest pairs that cover them all. This planner searches every combination in its catalogue rather than guessing, returning the smallest set and, among equally small sets, the lightest one — then shows what it weighs packed once you wear the heaviest pair on the journey. Shoes are the bulkiest thing in most bags, so removing one pair usually frees more space than a week of clothing.",
  useCases: [
    "Work out whether a city trip with one formal dinner and rain in the forecast needs two pairs or three.",
    "Cut a trekking-plus-beach itinerary down from four pairs to the minimum that still covers both.",
    "Decide which pair to wear on the plane so the heaviest one never enters the bag.",
  ],
  benefits: [
    ["Exact, not a rule of thumb", "Searches every combination for the true minimum rather than applying a greedy shortcut."],
    ["Lightest among the smallest", "When several sets tie on pair count, it picks the one that weighs least."],
    ["Space accounted for", "Reports packed litres as well as kilograms, because shoes fail a bag on volume first."],
  ],
  faqs: [
    [
      "How many pairs of shoes should I take on a trip?",
      "Usually two, occasionally three: one pair you can walk in all day, one that satisfies the strictest dress code on the itinerary, and a third only if there is a genuinely separate condition such as a trail or a beach. Three pairs is the point at which footwear starts dominating a cabin bag.",
    ],
    [
      "Which shoes should I wear on the plane?",
      "The heaviest and bulkiest pair, always. Boots or trainers worn on the journey cost nothing against your baggage allowance, while the same pair packed can take five to seven litres of bag volume and over a kilogram of your limit.",
    ],
    [
      "Can one pair of shoes cover a whole trip?",
      "Only if every condition falls in one shoe's range — leather-look travel sneakers, for instance, cover walking, smart casual and driving, so a city break with no formal dress code and no rain genuinely needs one pair. Add a formal dinner or a wet forecast and no single pair covers it.",
    ],
    [
      "How do I pack shoes so they take less space?",
      "Nest them sole to sole in opposite directions, fill each shoe with socks and underwear so the volume is not wasted, and put the pair in a bag along the base of the case rather than on top. That is already assumed in the volume figures here, which is why they are lower than a shoebox.",
    ],
  ],
};

export default seo;
