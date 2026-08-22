const seo = {
  title: "Paleo Macro Calculator: Protein, Fat, Carbs",
  metaDescription:
    "Mifflin-St Jeor BMR and activity to calories, protein set per kg, fat as a share of energy, carbs as the remainder — then converted to grams of food.",
  steps: [
    "Under \"About you\" set \"Sex (for the BMR equation)\", Age (years), Weight (kg), Height (cm), an Activity level from Sedentary (×1.2) to Extra active (×1.9), and a Goal from \"Lose weight quickly (-750 kcal)\" to \"Gain weight (+500 kcal)\".",
    "Set \"Protein (g per kg of body weight)\" — 1.8 by default — and \"Fat (% of energy)\", which starts at 40 with 35-45% flagged as the usual paleo range; carbohydrate takes whatever calories are left.",
    "Read the Daily calorie target with BMR and TDEE beneath it, the Protein, Fat and Carbohydrate tiles in grams and % of energy, the \"Fibre target (14 g per 1,000 kcal)\" row, and the \"What the targets look like in food\" tables of protein and carb sources; Copy result copies the targets.",
  ],
  intro:
    "The Paleo Macro Calculator produces daily protein, fat and carbohydrate targets for a paleo template, using the Mifflin-St Jeor equation for resting metabolic rate, a standard activity multiplier for maintenance calories, and your goal to set the deficit or surplus. Protein is set from grams per kilogram of body weight, fat as a share of total energy, and carbohydrate takes whatever remains — because paleo is defined by which foods are included, not by a fixed ratio. It then converts both targets into grams of the foods a paleo diet actually uses: meat, fish, eggs, tubers, fruit and vegetables.",
  useCases: [
    "Working out the carbohydrate target after removing grains and legumes, so the calories come back in from sweet potato and fruit.",
    "Setting a protein goal of 1.8 g per kilogram and seeing what that means in grams of chicken, salmon or eggs.",
    "Checking whether a 40% fat share still leaves enough carbohydrate for hard training days.",
    "Estimating a fibre target once beans and wholegrains are out of the diet.",
  ],
  benefits: [
    ["Carbs are calculated, not assumed", "The carbohydrate figure follows from your calories, protein and fat rather than a one-size ratio."],
    ["Food-level translation", "Protein and carb targets both convert into grams of specific paleo-compliant foods."],
    ["Warnings where they matter", "Flags protein above 35% of energy and holds calorie targets at a safety floor."],
  ],
  faqs: [
    [
      "What are the macros on a paleo diet?",
      "There is no official split, because paleo is defined by food choice rather than ratio. In practice protein commonly lands at 20-30% of energy, fat at 35-45% and carbohydrate at the rest, since the calories previously coming from grains and legumes have to be replaced by fat and by starchy vegetables and fruit.",
    ],
    [
      "What can you eat for carbs on paleo?",
      "Tubers, fruit and vegetables do all the work: cooked sweet potato has about 20.7 g of carbohydrate per 100 g, banana about 22.8 g, butternut squash about 10.5 g and apple about 13.8 g. Reaching 250-300 g of carbohydrate a day from these sources means a genuinely large volume of food, which is worth planning for rather than discovering mid-week.",
    ],
    [
      "How much protein should you eat on paleo?",
      "The same 1.2-2.0 g per kilogram of body weight that applies to any diet, with the higher end for people training hard; this calculator defaults to 1.8 g/kg. Protein sustained above roughly 35% of total energy runs into the practical ceiling on urea synthesis and is flagged here rather than silently accepted.",
    ],
    [
      "Is the paleo diet missing any nutrients?",
      "Removing dairy takes out a major calcium source, and removing grains and legumes removes a large share of most people's fibre, folate and thiamine intake. None of that is impossible to replace with fish bones, leafy greens, nuts, fruit and vegetables, but it is worth checking with a doctor or registered dietitian — this tool is informational only.",
    ],
  ],
};

export default seo;
