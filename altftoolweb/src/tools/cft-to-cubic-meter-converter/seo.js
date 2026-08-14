const seo = {
  title: "CFT to Cubic Meter Converter — Brass, Litres, Tonnes",
  metaDescription:
    "Converts cubic feet to cubic metres (×0.0283168), brass, litres and yards, then applies bulk density for tonnes, tipper loads and cost per unit.",
  steps: [
    "Choose Start from: A volume — entering the Volume and its Unit — or L × W × H with the Measured in length unit.",
    "Pick the Material (for weight) with its kg/cu m bulk density, set the Tipper capacity (cft) and an optional Rate (₹) to price the load.",
    "Read the volume in cubic metres, cft and brass with weight in kg and tonnes, tipper loads to order and per-unit rates; Copy result exports the summary.",
  ],
  intro:
    "One cubic foot is exactly 0.028316846592 cubic metres, because a foot is defined as exactly 0.3048 metres. This converter moves a construction load between cubic feet, cubic metres, litres, brass, cubic yards and cubic inches, then multiplies by bulk density to give the weight in kilograms and tonnes, the number of tipper loads and the cost per unit. Bulk densities offered are the unit weights from IS 875 Part 1, plus the 1,440 kg per cubic metre figure that defines the standard 50 kg cement bag.",
  useCases: [
    "Convert a sand delivery quoted as 1 brass into cubic metres for a metric bill of quantities.",
    "Check whether a 4.5 tonne tipper receipt matches the 100 cft of sand you were charged for.",
    "Work out the concrete volume in a 10 ft by 10 ft slab 6 inches deep, in both cft and cubic metres.",
  ],
  benefits: [
    ["Exact volume maths", "Every conversion comes from the defined 0.3048 m foot, so nothing rounds away."],
    ["Volume to weight", "Applies published bulk densities for sand, aggregate, cement, concrete and soil."],
    ["Load and cost view", "Shows tipper loads to order and the same rate expressed per cft, per cubic metre, per brass and per tonne."],
  ],
  faqs: [
    [
      "How many cubic feet are in 1 cubic metre?",
      "35.3147 cubic feet. Going the other way, 1 cubic foot is 0.0283168 cubic metres — exact figures, since the foot is defined as 0.3048 metres.",
    ],
    [
      "What is 1 brass in cubic feet and cubic metres?",
      "One brass is 100 cubic feet, which is 2.8317 cubic metres. Brass is a volume measure used for sand, aggregate and rubble in western India; it says nothing about weight, which depends on the material and how damp it is.",
    ],
    [
      "How many tonnes is 100 cft of sand?",
      "About 4.5 tonnes. 100 cft is 2.83 cubic metres, and dry river sand has a bulk density near 1,600 kg per cubic metre, giving roughly 4,530 kg. Wet sand weighs more, so a weighbridge slip is the reliable check when buying by weight.",
    ],
    [
      "How do I convert cubic feet to litres?",
      "Multiply cubic feet by 28.3168. One cubic metre is 1,000 litres, and a cubic foot is 0.0283168 cubic metres, so 100 cft is 2,831.68 litres — useful for sizing a water tank quoted in cft.",
    ],
  ],
};

export default seo;
