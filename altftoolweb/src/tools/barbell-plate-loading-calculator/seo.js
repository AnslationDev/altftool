const seo = {
  title: "Barbell Plate Calculator: Per Side, kg or lb",
  metaDescription:
    "Subtracts the bar and both collars, halves the rest, then picks plates from the pairs you own. Shows the shortfall when a target cannot be made.",
  steps: [
    "Set Units to Kilograms or Pounds, choose the Bar (Men's bar — 20 kg or Women's bar — 15 kg), then enter Target weight and Collar weight, each side.",
    "Under \"What is in your rack\", set how many pairs you own of each disc from 25 kg down to 0.25 kg, and enter 0 for any denomination you do not have.",
    "Read Loaded bar weight and the \"Per side, sleeve outwards\" list, largest disc first, then press Copy result — any shortfall against your target is stated.",
  ],
  intro:
    "This calculator turns a target bar weight into plates to hang on each sleeve: weight per side is (target − bar − both collars) ÷ 2, and an exact bounded search finds a closest combination from the denominations you actually own. The selected combination is listed from the largest plate to the smallest for sleeve loading. Bar weights and disc sizes follow IWF and IPF competition specifications — a 20 kg men's bar, a 15 kg women's bar, 2.5 kg collars and 25/20/15/10/5/2.5/1.25 kg discs — with a pound mode for 45 lb bars. When a number cannot be made, it shows the closest loading and how much it falls short.",
  useCases: [
    "Load a competition-style attempt of 142.5 kg on a 20 kg bar with 2.5 kg collars without doing the arithmetic mid-session.",
    "Find out what the closest loadable weight is in a hotel gym that only has 10 lb and 25 lb plates.",
    "Check whether you own the small change — 1.25 kg or 0.5 kg discs — needed to make a 2 kg jump instead of a 5 kg one.",
    "Convert a programme written in pounds into a kilogram bar loading that lands as close as your plates allow.",
  ],
  benefits: [
    ["Respects your real plate stock", "Set the number of pairs you own and the loading never asks for a disc you do not have."],
    ["Handles collars properly", "Competition collars add 5 kg to the bar and are subtracted before the plates are chosen."],
    ["Honest about impossible numbers", "Shows the achievable weight and the shortfall instead of silently rounding."],
  ],
  faqs: [
    [
      "How do I calculate plates per side on a barbell?",
      "Subtract the bar and both collars from the target, then halve what is left. For 142.5 kg on a 20 kg bar with 2.5 kg collars: 142.5 − 20 − 5 = 117.5, and half of that is 58.75 kg per side — two 25s, a 5, a 2.5 and a 1.25.",
    ],
    [
      "How much does a standard barbell weigh?",
      "An IWF or IPF men's competition bar is 20 kg (about 44 lb) and a women's bar is 15 kg (about 33 lb). Imperial gyms usually use a 45 lb men's bar and a 35 lb women's bar, and training or technique bars run 5–10 kg.",
    ],
    [
      "Do collars count towards the total weight?",
      "Yes. Competition collars weigh 2.5 kg each, so they add 5 kg to the loaded bar and must be subtracted before you work out plates per side. Light spring clips weigh a few hundred grams and are usually ignored — enter 0 for those.",
    ],
    [
      "What is the smallest weight jump I can make?",
      "It is twice your smallest plate, because every disc goes on both sleeves. With 1.25 kg discs the smallest jump is 2.5 kg; adding 0.5 kg and 0.25 kg fractional plates brings that down to 1 kg and 0.5 kg, which is why microplates are popular for pressing movements.",
    ],
  ],
};

export default seo;
