const seo = {
  title: "Muscle Gain Calorie Calculator for a Lean Bulk",
  metaDescription:
    "Works the surplus back from your target gain rate in % of body weight a month, on Mifflin-St Jeor maintenance, then splits it into protein, fat and carbs.",
  steps: [
    "Fill in Sex, Age (years), Height (cm), Weight (kg) and Activity level, then set Target gain (% of body weight per month) or tap the Beginner, Intermediate or Advanced preset (1-1.5%, 0.5-1%, 0.25-0.5%).",
    "Set Protein (g per kg per day) and Fat (g per kg per day); the Daily calorie target recalculates from Mifflin-St Jeor maintenance and states the surplus above maintenance and the weekly gain in kg.",
    "Read the 'Daily macronutrient targets' table for protein, fat and carbohydrate in grams, kcal and percent, then press 'Copy result' for the whole plan or 'Reset' to restore the defaults.",
  ],
  intro:
    "Muscle Gain Calorie Calculator works the surplus backwards from the rate of weight gain you actually want, instead of guessing at a round number. Maintenance comes from the Mifflin-St Jeor equation multiplied by an activity factor; the target rate is set as a percentage of body weight per month — roughly 1 to 1.5 percent for beginners, 0.5 to 1 percent for intermediates and 0.25 to 0.5 percent for advanced lifters — and converted to daily calories using the 7,700 kcal per kilogram equivalence. It then splits the total into protein, fat and carbohydrate targets.",
  useCases: [
    "Set a lean bulk target that adds about 0.5 kg a month rather than 2 kg of mostly fat.",
    "Check whether a 500 kcal surplus is too aggressive for an advanced lifter at 90 kg.",
    "Convert a protein target of 1.8 g per kilogram into grams and calories for a food tracker.",
    "Estimate how many weeks a 5 kg gain will take at a sustainable rate.",
  ],
  benefits: [
    ["Rate-first, not guess-first", "The surplus follows from the gain rate you choose, so it scales with body weight."],
    ["Named equations", "Mifflin-St Jeor for RMR, standard activity multipliers and Atwater factors for the macros."],
    ["Flags bad settings", "Warns when the surplus is inside measurement noise or large enough that fat gain will outpace muscle."],
  ],
  faqs: [
    [
      "How many calories do I need to build muscle?",
      "Usually 5 to 20 percent above maintenance, which for most people is a surplus of about 150 to 500 kcal a day. The right number depends on your body weight and training age: a 75 kg intermediate targeting 0.75 percent gain a month needs only around 140 kcal a day extra.",
    ],
    [
      "How fast should I gain weight when bulking?",
      "About 1 to 1.5 percent of body weight a month for beginners, 0.5 to 1 percent for intermediates and 0.25 to 0.5 percent for advanced lifters. Gaining faster than that adds fat rather than extra muscle, because the rate at which muscle can be built is capped by training age.",
    ],
    [
      "How much protein do I need to build muscle?",
      "Between 1.6 and 2.2 g per kilogram of body weight per day. A 2018 meta-analysis in the British Journal of Sports Medicine found resistance-training gains plateaued at about 1.62 g/kg, so the higher end is insurance rather than a requirement.",
    ],
    [
      "Is a calorie surplus really needed to gain muscle?",
      "For most trained lifters, yes — a small surplus supports recovery and growth. Beginners, people returning after a break and those with higher body fat can gain some muscle at maintenance or in a deficit, which is why the tool lets you set a very low target rate. This is general fitness information, not dietary advice.",
    ],
  ],
};

export default seo;
