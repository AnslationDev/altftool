const seo = {
  title: "Whey Scoop Calculator: Purity and Cost per 25 g",
  metaDescription:
    "Divides protein per scoop by scoop weight for real purity — 24 g in a 30 g scoop is 80% — and compares tubs on cost per 25 g of protein.",
  steps: [
    "Copy the panel off the tub into Tub net weight (g), Tub price, Scoop weight (g) and Protein per scoop (g).",
    "Add Carbohydrate per scoop (g), Fat per scoop (g), Protein you want per shake (g), Scoops per day and your Currency.",
    "\"Cost per 25 g of protein\" heads the result, with % protein by weight, Scoops in the tub, Days one tub lasts and Cost per day set out below it.",
  ],
  intro:
    "A whey scoop protein calculator converts the nutrition panel on your tub into the numbers that actually matter: protein purity as a percentage of the powder, grams of protein per scoop and per tub, and cost per 25 g of protein. Purity is simply protein per scoop divided by scoop weight — a 30 g scoop with 24 g of protein is 80% protein, which is standard WPC80 concentrate, while isolate is specified at around 90%. Comparing tubs on price per kilogram is misleading because scoop sizes and purity differ; price per 25 g of protein is the like-for-like figure.",
  useCases: [
    "Compare a cheap 1 kg concentrate against a pricier isolate on cost per 25 g of protein rather than price per kilo.",
    "Check whether a tub advertised as high protein is really only 60% protein once you divide protein per scoop by scoop weight.",
    "Work out that a 30 g scoop with 24 g of protein needs 1.04 scoops to make a 25 g shake.",
    "Budget a training block by seeing how many days a tub lasts at two scoops a day and what that costs per day.",
  ],
  benefits: [
    ["Purity in one number", "Protein per scoop divided by scoop weight tells you what you are really buying."],
    ["Fair price comparison", "Cost per 25 g of protein normalises for scoop size and purity across brands."],
    ["Label sanity checks", "Rejects impossible panels, such as protein exceeding the scoop weight or macros that overshoot it."],
  ],
  faqs: [
    [
      "How much protein is in one scoop of whey?",
      "Usually 20-25 g in a 30 g scoop, which is 67-83% protein by weight. Divide the protein per scoop on the label by the scoop weight to get the real figure — concentrate typically lands at 70-80%, isolate at roughly 90%.",
    ],
    [
      "How do I compare two whey tubs on price?",
      "Convert both to cost per gram of protein, not cost per kilogram of powder. Divide the tub price by the total protein in the tub (tub weight times purity). Multiplying that by 25 gives a cost per standard 25 g serving that is directly comparable across brands and scoop sizes.",
    ],
    [
      "Is whey isolate worth the extra money?",
      "Isolate is around 90% protein versus 70-80% for concentrate, and has far less lactose, so it is worth it if you are lactose intolerant or counting every gram of carbohydrate. On cost per gram of protein the two are often close; run both through the calculator before deciding.",
    ],
    [
      "Should I weigh my scoop instead of trusting it?",
      "Yes, if the numbers matter to you. Scoops measure volume, and powder settles or compacts during shipping, so a level scoop can vary by several grams from the stated weight. Weighing on a kitchen scale once tells you how far off your scoop actually is.",
    ],
  ],
};

export default seo;
