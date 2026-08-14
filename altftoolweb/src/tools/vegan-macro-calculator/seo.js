const seo = {
  title: "Vegan Macro Calculator with Plant Protein Adjustment",
  metaDescription:
    "Plant-based protein, fat and carb targets from Mifflin-St Jeor, raised by a 1.0-1.3 digestibility factor, with a 14 g/1,000 kcal fibre goal.",
  steps: [
    "Under 'About you' enter Sex (for the BMR equation), Age (years), Weight (kg) and Height (cm), then pick an Activity level from Sedentary to Extra active and a Goal from 'Lose weight quickly (-750 kcal)' to 'Gain weight (+500 kcal)'.",
    "Under 'Plant-based settings' set 'Protein (g per kg of body weight)', which defaults to 1.6, the 'Plant digestibility adjustment (1.0-1.3)', which defaults to 1.15, and 'Fat (% of energy)', which defaults to 27.",
    "Read the Daily protein target with its base grams and adjustment, the Protein, Fat and Carbohydrate cards, the BMR and TDEE rows and the 'Fibre target (14 g per 1,000 kcal)', then press Copy result; the food table converts the target into grams of seitan (25 g protein per 100 g), tempeh (19 g) or firm tofu (17 g).",
  ],
  intro:
    "The Vegan Macro Calculator sets daily protein, fat and carbohydrate targets for a plant-based diet, raising the protein figure by a digestibility adjustment because most plant proteins score lower than animal proteins on PDCAAS and DIAAS. Calories come from the Mifflin-St Jeor equation multiplied by an activity factor and adjusted for your goal; fat is a chosen share of energy, carbohydrate takes the remainder, and fibre is set at the 14 g per 1,000 kcal adequate intake. It also shows how many grams of tofu, lentils, tempeh or seitan the protein target actually represents.",
  useCases: [
    "Switching to a plant-based diet and wanting to know whether the usual 1.6 g/kg protein target still applies.",
    "Checking how much tempeh or lentils it takes to reach 115 g of protein in a day.",
    "Setting a fibre goal that matches your calorie intake rather than a generic 30 g figure.",
    "Planning a lean bulk on a vegan diet where the protein target has to be hit without overshooting calories.",
  ],
  benefits: [
    ["Digestibility accounted for", "Protein is raised by an adjustable 1.0-1.3 factor rather than reusing an omnivore target unchanged."],
    ["Real food quantities", "Twelve common plant sources with protein per 100 g, converted into the grams needed for your target."],
    ["Complementary pairings explained", "Which pairings cover which limiting amino acid, and why combining at every meal is not required."],
  ],
  faqs: [
    [
      "How much protein does a vegan need per day?",
      "Start from the same 1.2-2.0 g per kilogram of body weight used for anyone else, then raise it by roughly 10-20% to account for lower plant protein digestibility. For a 62 kg person at 1.6 g/kg that means about 99 g becomes about 114 g a day.",
    ],
    [
      "Do vegans need to combine proteins at every meal?",
      "No. Cereals are typically limiting in lysine and pulses in methionine, so the two complement each other, but current guidance is that eating a variety of plant proteins across the day is sufficient — the body maintains an amino acid pool. Soy, quinoa and hemp already contain all the essential amino acids in useful amounts.",
    ],
    [
      "Which plant foods have the most protein?",
      "Per 100 g as eaten, seitan is around 25 g, tempeh 19 g, firm tofu 17 g, cooked lentils 9 g and cooked chickpeas about 9 g, while dry textured soy protein is roughly 52 g before rehydrating. Values vary by brand and preparation, so check the label on what you buy.",
    ],
    [
      "How much fibre should a vegan diet have?",
      "The adequate intake is 14 g of fibre per 1,000 kcal, so a 2,000 kcal diet targets about 28 g. Plant-based diets usually reach this easily; if you are increasing intake quickly, raise it gradually and with enough fluid to avoid discomfort. This tool is informational only — discuss vitamin B12, iron, iodine and vitamin D with a doctor or registered dietitian.",
    ],
  ],
};

export default seo;
