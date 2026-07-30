const seo = {
  intro:
    "This BMR Calculator estimates the calories your body burns at complete rest using the Mifflin-St Jeor equation — 10 x weight in kg plus 6.25 x height in cm minus 5 x age, then +5 for men or -161 for women — and multiplies it by an activity factor from 1.2 to 1.9 to give your total daily energy expenditure. From that it builds a target for losing or gaining 0.25 to 0.5 kg a week, splits the calories 25 percent protein, 45 percent carbohydrate and 30 percent fat, and adds BMI, a Deurenberg body-fat estimate and protein and water targets. It is a planning estimate for healthy adults, not a clinical measurement.",
  useCases: [
    "You are starting a cut and need a real daily calorie number to aim at rather than a guess, plus the gram targets for protein, carbs and fat that go with it.",
    "Your weight has stalled on a fixed calorie intake and you want to check what your maintenance level actually is now that you weigh less than when you started.",
    "You switched from a desk job to shift work on your feet and want to see how much moving from the sedentary 1.2 factor to the very active 1.725 factor changes your daily requirement.",
  ],
  benefits: [
    [
      "Uses the modern equation",
      "Runs Mifflin-St Jeor rather than the older Harris-Benedict formula, which generally overestimates resting expenditure in today's populations.",
    ],
    [
      "Turns the target into grams and meals",
      "Converts your chosen calorie goal into protein, carb and fat grams at 4, 4 and 9 kcal per gram, then splits the day 25/35/30/10 across breakfast, lunch, dinner and snacks.",
    ],
    [
      "Refuses to go below a floor",
      "Weight-loss targets are clamped at 1,200 kcal a day, so a large deficit on a small frame does not silently produce an unsafe number.",
    ],
  ],
  faqs: [
    [
      "What is the Mifflin-St Jeor formula for BMR?",
      "BMR = (10 x weight in kg) + (6.25 x height in cm) - (5 x age in years) + 5 for men, or - 161 for women. For a 30-year-old man of 175 cm and 68 kg that gives about 1,629 kcal a day. It is the equation most dietitians now use in place of Harris-Benedict.",
    ],
    [
      "What activity multiplier should I pick?",
      "Sedentary is 1.2 for little or no exercise, lightly active 1.375 for 1-3 days a week, moderate 1.55 for 3-5 days, very active 1.725 for 6-7 days, and extra active 1.9 for hard training plus a physical job. Most people overestimate here, so if you are between two levels the lower one usually tracks reality better.",
    ],
    [
      "How big a calorie deficit gives 0.5 kg of loss a week?",
      "The tool subtracts 500 kcal a day from your TDEE for roughly 0.5 kg a week and 250 kcal for roughly 0.25 kg, based on the convention that about 7,700 kcal equals a kilogram of body mass. Losses of 0.25 to 0.5 kg per week are the range generally considered sustainable; faster drops tend to cost lean tissue.",
    ],
    [
      "How accurate is the body-fat percentage shown?",
      "It is a rough estimate from the Deurenberg equation, which derives body fat from BMI, age and sex: 1.20 x BMI + 0.23 x age - 16.2 for men or - 5.4 for women. Because it starts from BMI it inherits BMI's blind spot and will read high for muscular people and low for those with little muscle — DEXA or a skinfold measurement is far more reliable.",
    ],
  ],
};

export default seo;
