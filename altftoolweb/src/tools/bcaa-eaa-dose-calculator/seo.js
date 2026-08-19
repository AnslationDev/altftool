const seo = {
  title: "BCAA & EAA Dose Calculator: Leucine per Serving",
  metaDescription:
    "Set a leucine target and get the grams of BCAA 2:1:1, 4:1:1, 8:1:1, EAA or whey it takes — with WHO/FAO daily requirements and whole-food equivalents.",
  steps: [
    "Enter 'Bodyweight (kg)' and pick a Supplement — BCAA 2:1:1, 4:1:1, 8:1:1, EAA blend (all 9), whey, casein or soy protein isolate.",
    "Set 'Leucine target per serving (g)' between 1 and 6 and the servings per day; the Serving size in grams recalculates as you type.",
    "Press 'Copy result' for the serving size, indispensable amino acids per serving and the WHO/FAO daily requirement at your bodyweight.",
  ],
  intro:
    "A BCAA and EAA dose calculator works backwards from a leucine target: you choose how much leucine you want in a serving, and it returns the grams of BCAA 2:1:1, 4:1:1, 8:1:1, EAA blend or protein powder that delivers it. Roughly 2.5 to 3 g of leucine per feeding is the amount usually associated with a maximal muscle protein synthesis response, and 10 to 15 g of total indispensable amino acids is the matching per-serving figure. It also shows the WHO/FAO/UNU adult daily requirements for all nine indispensable amino acids at your bodyweight, and how much chicken, whey, tofu or milk supplies the same leucine.",
  useCases: [
    "Check whether a 5 g scoop of BCAA 2:1:1 actually reaches the 2.5 g leucine trigger.",
    "Compare 8:1:1 against 2:1:1 to see how much less powder you need for the same leucine.",
    "See how many grams of whey deliver the same leucine as an EAA blend, and at what protein cost.",
    "Show a client that 110 g of cooked chicken breast already contains 2.5 g of leucine.",
  ],
  benefits: [
    ["Ratio maths done properly", "A BCAA at r:1:1 is r/(r+2) leucine by weight — the dose reflects the actual ratio on the label."],
    ["Requirement vs performance dose", "Separates the WHO daily requirement from the per-serving amount used to trigger muscle protein synthesis."],
    ["Honest about BCAAs", "Flags that a branched-chain blend covers only 3 of the 9 indispensable amino acids."],
  ],
  faqs: [
    [
      "How many grams of BCAA should I take?",
      "For a 2.5 g leucine dose you need 5 g of a 2:1:1 BCAA, 3.8 g of a 4:1:1, or 3.1 g of an 8:1:1, because leucine makes up r/(r+2) of the powder at ratio r:1:1. That said, the leucine dose alone does not tell the whole story — the other indispensable amino acids need to be present too.",
    ],
    [
      "Are BCAAs or EAAs better?",
      "EAAs. Branched-chain amino acids supply only leucine, isoleucine and valine — 3 of the 9 indispensable amino acids — so the remaining six become limiting and the muscle protein synthesis response is smaller than from a complete EAA blend or a whole protein like whey. If you already eat enough total protein, neither supplement adds much.",
    ],
    [
      "How much leucine do I need per meal?",
      "About 2.5 to 3 g per feeding is the figure most commonly cited as the trigger for a maximal muscle protein synthesis response in adults. That comes with roughly 25-30 g of a high-quality protein such as whey, dairy, eggs, meat or fish.",
    ],
    [
      "What is the daily requirement for amino acids?",
      "The WHO/FAO/UNU 2007 adult reference values total 184 mg per kg bodyweight per day across the nine indispensable amino acids, including 39 mg/kg of leucine and 30 mg/kg of lysine. For a 75 kg adult that is about 13.8 g a day in total, which a normal protein intake covers comfortably. These are health requirements, not performance targets; a dietitian can advise on individual needs.",
    ],
  ],
};

export default seo;
