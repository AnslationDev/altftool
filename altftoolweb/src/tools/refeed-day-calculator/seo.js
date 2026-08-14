const seo = {
  title: "Refeed Day Calculator: Carbs, Calories and Macros",
  metaDescription:
    "Mifflin-St Jeor maintenance with protein held constant and fat at a floor, giving refeed carb grams and what the day costs your weekly deficit.",
  steps: [
    "Enter sex, age, height (cm), body weight (kg), activity level and your Normal diet-day calories (kcal), then set Protein (g per kg body weight) and Refeed-day fat (g per kg body weight).",
    "Pick a Refeed level and Refeed days per week (1, 2 or 3); maintenance comes from Mifflin-St Jeor plus the activity multiplier, protein stays fixed, fat drops to its floor and carbohydrate takes the remaining calories at 4 kcal per gram.",
    "Read the refeed-day carbohydrate figure in grams, the 'Diet day vs refeed day' macro table, the 'What it costs the week' deficit maths and the upper-bound scale rise, then press 'Copy result'.",
  ],
  intro:
    "A refeed day is a planned day at or slightly above maintenance calories where the extra energy comes almost entirely from carbohydrate. This calculator derives maintenance from the Mifflin-St Jeor equation plus an activity multiplier, holds protein constant, drops fat to a floor around 0.5 g per kg, and gives carbohydrate the remaining calories using the Atwater factors of 4, 4 and 9 kcal per gram. It also shows the weekly deficit before and after the refeed, so you can see exactly what the day costs in fat loss.",
  useCases: [
    "Set carbohydrate grams for a Saturday refeed during a cut without guessing how high to go.",
    "See whether two refeed days a week still leaves a weekly deficit, or wipes it out entirely.",
    "Explain a 0.8 kg overnight scale jump as glycogen and bound water rather than fat gain.",
    "Compare a maintenance refeed against a maintenance +20% refeed before choosing one.",
  ],
  benefits: [
    ["Macros, not just a calorie number", "Protein stays fixed and fat drops to a floor, so the extra calories land where a refeed is supposed to put them."],
    ["Weekly deficit maths included", "Shows the kilograms per week given up by adding refeed days, instead of leaving you to guess."],
    ["Explains the scale spike", "Gives an upper-bound water-weight figure from roughly 3 g of water per gram of stored glycogen."],
  ],
  faqs: [
    [
      "How many carbs should I eat on a refeed day?",
      "Enough to fill the calorie target once protein and fat are set — typically 4-7 g per kg of body weight, which is around 350-550 g for an 80 kg person at maintenance. The exact figure depends on your maintenance calories and how low you push fat that day.",
    ],
    [
      "What is the difference between a refeed and a cheat day?",
      "A refeed has a calorie ceiling (usually maintenance to maintenance +20%) and a deliberate macro split weighted towards carbohydrate. A cheat day has neither, and can easily run 2,000-3,000 kcal over maintenance — enough to erase a week of deficit.",
    ],
    [
      "Why does my weight jump after a refeed day?",
      "Stored glycogen holds roughly 3 g of water per gram, so replenishing a few hundred grams of glycogen adds close to a kilogram on the scale overnight. It is water and stored fuel, not fat, and it comes back off over the following days once you return to the diet-day intake.",
    ],
    [
      "How often should I do a refeed?",
      "Practical guidance ties frequency to how lean you are: around twice a week under 10% body fat for men or 18% for women, once a week in the mid range, and once every one to two weeks at higher body fat. This is a training-community heuristic rather than a clinical standard, so treat it as a starting point and discuss any structured diet with a dietitian.",
    ],
  ],
};

export default seo;
