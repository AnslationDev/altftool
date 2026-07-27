const seo = {
  intro:
    "This converter restates one area in square feet, square metres, square yards (gaj), ares, acres and hectares, and converts a rate quoted in any one of them into the rate and total in the others. It uses the exact definition of the foot as 0.3048 metres, which makes one square foot exactly 0.09290304 square metres and one square yard exactly 9 square feet. Useful when a listing quotes the plot in square feet, the sale deed records it in square metres and the broker quotes the rate per gaj.",
  useCases: [
    "Convert a 1,200 sq ft flat into square metres for a registration document or a home loan form.",
    "Compare a builder quoting Rs 6,000 per sq ft with a seller quoting per square yard on the same plot.",
    "Turn plot dimensions of 30 ft by 40 ft into square metres and acres without doing the multiplication twice.",
  ],
  benefits: [
    ["Exact, not rounded", "Built on the defined 0.3048 m foot, so nothing drifts as you convert back and forth."],
    ["Rate in every unit", "See what a per-sq-ft rate works out to per sq m and per gaj, and the total either way."],
    ["Dimensions or area", "Enter length and width when that is all a listing gives you."],
  ],
  faqs: [
    [
      "How many square metres is 1,000 square feet?",
      "92.903 square metres. One square foot is exactly 0.09290304 sq m, so multiply square feet by 0.0929 to get square metres, or divide by 10.7639 to go the other way.",
    ],
    [
      "How many square feet are in 1 square metre?",
      "10.7639 square feet. It comes straight from the definition of the foot as 0.3048 m: 1 divided by 0.3048 squared is 10.76391.",
    ],
    [
      "Is 1 gaj the same as 1 square yard?",
      "Yes. In north Indian property listings gaj means square yard, which is exactly 9 square feet or 0.83612736 square metres. A 100 gaj plot is therefore 900 sq ft.",
    ],
    [
      "How many square feet are in an acre?",
      "43,560 square feet, which is 4,046.86 square metres or 4,840 square yards. A hectare is larger at 10,000 sq m, about 2.471 acres.",
    ],
  ],
};

export default seo;
