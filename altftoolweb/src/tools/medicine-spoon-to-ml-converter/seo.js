const seo = {
  intro:
    "The Medicine Spoon to Millilitre Converter turns a spoon-based dosing instruction into an exact volume, using the defined capacities rather than a guess: 5 mL for the medicine teaspoon, 10 mL for a dessertspoon, 15 mL for the metric tablespoon, 20 mL for the Australian tablespoon and 4.92892 mL for the US customary teaspoon. It also works backwards from millilitres to spoons and, if you enter the label strength per 5 mL, shows the milligrams that volume delivers. It exists because ordinary kitchen spoons hold between about 2.5 and 7 mL, a spread wide enough to matter for a child's dose.",
  useCases: [
    "Convert a leaflet that says 'two teaspoonfuls' into the 10 mL to draw up in the supplied oral syringe.",
    "Check what an Australian tablespoon instruction means when your measuring spoon is a 15 mL metric one.",
    "Work out the milligrams a 7.5 mL dose delivers from a 250 mg per 5 mL suspension.",
    "Translate an old dessertspoon instruction on a family medicine into a modern millilitre figure.",
  ],
  benefits: [
    ["Defined capacities", "Uses the exact spoon definitions, including the 4.92892 mL US customary teaspoon, not rounded folklore."],
    ["Syringe-ready figures", "Every volume is also rounded to the nearest 0.1 mL mark you can actually set."],
    ["Strength aware", "Optional mg per 5 mL turns the volume into the milligram dose it delivers."],
  ],
  faqs: [
    [
      "How many mL is a teaspoon of medicine?",
      "A teaspoon on a medicine label means 5 mL. The US customary recipe teaspoon is slightly smaller at 4.92892 mL, and a random kitchen teaspoon can hold anywhere from about 2.5 to 7 mL, which is why dosing with cutlery is discouraged.",
    ],
    [
      "How many mL is a tablespoon of medicine?",
      "15 mL in the UK, India and most of the world, which is three 5 mL teaspoons. Australia is the exception at 20 mL, and the US customary tablespoon used in recipes is 14.787 mL.",
    ],
    [
      "Is it safe to use a kitchen spoon for medicine?",
      "No. Published studies of household dosing repeatedly find teaspoon volumes ranging from roughly 2.5 mL to over 7 mL, which can mean half or one and a half times the intended dose. Use the oral syringe, dosing cup or spoon supplied with the medicine.",
    ],
    [
      "How do I work out the milligrams in a spoonful?",
      "Divide the volume by 5 and multiply by the milligrams per 5 mL on the label. A 7.5 mL dose of a 250 mg per 5 mL suspension is 1.5 × 250 = 375 mg. Check the strength on the bottle you have, since the same medicine is sold at several strengths.",
    ],
  ],
};

export default seo;
