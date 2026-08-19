const seo = {
  title: "Atkins Phase Calculator: Net Carbs, Protein & Fat",
  metaDescription:
    "Get the net carb allowance for your Atkins phase and week on the 20 g / +5 g / +10 g ladder, plus protein per kg and the fat that fills your calories.",
  steps: [
    "Enter Sex (for the BMR equation), Age (years), Weight (kg) and Height (cm), then pick an Activity level from 'Sedentary (desk job, little exercise)' to 'Athlete (twice-daily or physical job)'.",
    "Choose the Atkins phase — Phase 1 Induction through Phase 4 Lifetime Maintenance — plus 'Week number in this phase' (or 'Your carb tolerance (g net carbs/day)' in maintenance), a Goal, and Protein (g per kg body weight).",
    "Read the Daily net carb allowance with the fat / protein / carb calorie split bar and the Atkins carb ladder table; a warning appears if fat falls under 20% of calories. Press 'Copy result' to save it.",
  ],
  intro:
    "This calculator turns the four published Atkins phases into a daily macro target: the net carb allowance fixed by your phase, a moderate protein amount set per kilogram of body weight, and dietary fat filling the remaining calories. Energy needs come from the Mifflin-St Jeor equation multiplied by an activity factor, so the numbers move with your size and training load rather than a one-size-fits-all template. It is built for anyone running Atkins 20 or Atkins 40 who wants to know exactly how many net carbs today allows and what the rest of the plate should look like.",
  useCases: [
    "Checking that week 4 of Ongoing Weight Loss should be at 40 g net carbs, not still stuck at the 20 g Induction level",
    "Working out how much fat to eat once protein is set at 1.4 g per kg so calories still land at a 20% deficit",
    "Setting a personal carb tolerance in Lifetime Maintenance and seeing what that does to the fat and protein split",
  ],
  benefits: [
    ["Phase-accurate carb ladder", "Applies the real 20 g / +5 g / +10 g weekly steps instead of a single fixed number."],
    ["Fat is calculated, not guessed", "Fat grams are whatever is left after carbs and protein hit your calorie target."],
    ["Flags an impossible split", "Warns when fat drops under 20% of calories, which usually means protein is set too high."],
  ],
  faqs: [
    [
      "How many carbs a day on Atkins Induction?",
      "20 g of net carbs a day, held for a minimum of two weeks. Atkins asks that 12–15 g of that 20 come from foundation vegetables such as spinach, broccoli, cauliflower and salad leaves, leaving only about 5–8 g for everything else.",
    ],
    [
      "What are net carbs and why does Atkins count them?",
      "Net carbs are total carbohydrate minus fibre minus sugar alcohols. Fibre and most polyols are not absorbed as glucose, so they have little effect on blood sugar — that is why a 100 g serving of broccoli with 7 g total carbs and 3 g fibre counts as 4 g net carbs.",
    ],
    [
      "How fast do you increase carbs between Atkins phases?",
      "Phase 2 starts at 25 g and adds 5 g a day each week while weight loss continues, up to about 50 g. Phase 3 starts at 50 g and adds 10 g a week up to roughly 80 g. If the scale stalls, you drop back to the previous week's number rather than pushing higher.",
    ],
    [
      "How much protein should I eat on Atkins?",
      "Atkins is moderate-protein, not high-protein — commonly 1.2–1.6 g per kilogram of body weight, which for a 90 kg person is roughly 110–145 g a day. Going much higher squeezes fat out of the plan and makes the calorie target very hard to eat. Anyone with reduced kidney function should agree a protein level with their doctor first.",
    ],
  ],
};

export default seo;
