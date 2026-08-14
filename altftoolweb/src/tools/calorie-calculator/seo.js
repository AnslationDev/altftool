const seo = {
  title: "Calorie and Macro Calculator (Mifflin-St Jeor)",
  metaDescription:
    "Mifflin-St Jeor BMR times an activity factor of 1.2-1.9, adjusted 250 or 500 kcal, split 30/40/30 into protein, carb and fat grams.",
  intro:
    "This calculator works out your daily calorie target and the gram split of protein, carbs and fat behind it, using the Mifflin-St Jeor equation for BMR (10 × kg + 6.25 × cm − 5 × age, then +5 for men or −161 for women), an activity multiplier from 1.2 to 1.9 for TDEE, and a goal adjustment of ±250 or ±500 kcal. It then divides the target into a 30% protein / 40% carbohydrate / 30% fat split and converts those calories to grams at 4, 4 and 9 kcal per gram. Everything is shown — BMR, TDEE and target — so you can see which step produced the number, not just the final figure.",
  useCases: [
    "You have started tracking food in an app and need a starting daily target and macro grams to enter, instead of accepting the app's default",
    "You want to know whether a 500 kcal cut is realistic for you or whether 250 is the sensible pace, and you need both numbers side by side to decide",
    "Your weight has been flat for a month and you want to check whether the calorie ceiling you have been eating to is actually below your estimated TDEE",
  ],
  benefits: [
    ["Shows BMR, TDEE and target separately", "You can see that a −500 goal is a deficit against your maintenance number rather than an arbitrary figure, which makes it easy to adjust later."],
    ["Macros in grams, not just percentages", "The 30/40/30 split is converted at 4 kcal per gram of protein and carbohydrate and 9 per gram of fat, so you get numbers you can actually log."],
    ["Mifflin-St Jeor, named in the output", "The BMR step uses the equation most dietetic practice guidelines favour for non-athletes, and the tool tells you the BMR it derived so you can cross-check it."],
  ],
  faqs: [
    [
      "What is the difference between BMR and TDEE?",
      "BMR is what you would burn at complete rest; TDEE is BMR multiplied by an activity factor to cover movement, exercise and digestion. This tool uses 1.2 for sedentary, 1.375 lightly active, 1.55 moderately active, 1.725 active and 1.9 very active — so an office worker and a construction worker with identical bodies can differ by more than 1,000 kcal a day.",
    ],
    [
      "How big a calorie deficit should I use?",
      "The tool offers −250 and −500 kcal per day. A 500 kcal daily deficit corresponds to roughly 0.45 kg of body weight per week using the traditional 7,700 kcal-per-kg approximation, while −250 is about half that and is generally easier to sustain. Very low targets are a matter for a dietitian or doctor rather than a calculator.",
    ],
    [
      "Why 30% protein, 40% carbs, 30% fat?",
      "It is a balanced general-purpose split that sits inside the widely used acceptable macronutrient distribution ranges (roughly 10-35% protein, 45-65% carbohydrate, 20-35% fat). At a 2,000 kcal target it works out to 150 g protein, 200 g carbohydrate and 67 g fat. Athletes, low-carb eaters and people with medical conditions will want a different ratio.",
    ],
    [
      "How accurate is the Mifflin-St Jeor estimate?",
      "It predicts measured resting energy expenditure within 10% for roughly 70-80% of people, and it tends to be less accurate at the extremes of body composition because it uses total weight rather than lean mass. Treat the output as a starting point, then adjust based on two to four weeks of real weight data. This is general information, not medical or dietary advice.",
    ],
  ],
};

export default seo;
