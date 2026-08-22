const seo = {
  title: "Calories Burned Cooking: MET Values by Stage",
  metaDescription:
    "Six kitchen stages priced at compendium MET values, times your body weight: kcal/min = MET x 3.5 x kg / 200. Shows gross and net-of-resting calories.",
  steps: [
    "Enter Body weight, choose Kilograms (kg) or Pounds (lb), and put minutes against each of the six stages from Prep and chopping to Washing up afterwards.",
    "Each stage is priced at its own compendium MET value — 2.0 for prep, 2.5 at the stove, 3.0 for dough work, 1.8 for washing up — times your weight and minutes.",
    "Read Calories burned in kcal, Calories above resting (net burn), average METs and the stage-by-stage breakdown table, then press Copy result.",
  ],
  intro:
    "This calculator estimates the calories you burn cooking a meal by pricing each kitchen stage at its published MET value and multiplying by your body weight and the minutes you spend on it. It uses the metabolic-equivalent formula kcal/min = MET x 3.5 x kg / 200, with MET values for prep, stove work, dough work, serving and washing up taken from the 2011 Compendium of Physical Activities. It is aimed at anyone who wants to see how much of a day's movement actually happens in the kitchen, and it separates gross calories from the net figure above resting metabolism.",
  useCases: [
    "Work out what an hour of chopping, cooking and clearing up on a Sunday actually adds to your daily activity total.",
    "Compare a quick 20-minute stir-fry against a two-hour weekend cook so you can log the difference in a food and activity diary.",
    "See how much of a home cook's daily NEAT (non-exercise activity thermogenesis) comes from rolling rotis and standing at the stove.",
  ],
  benefits: [
    [
      "Published MET values",
      "Each stage carries its own compendium code and MET value rather than one blanket number for 'cooking'.",
    ],
    [
      "Gross and net split",
      "Shows calories above resting metabolism, which is the only part genuinely attributable to the cooking itself.",
    ],
    [
      "Stage-level breakdown",
      "A per-stage table shows exactly which part of the meal cost the most energy.",
    ],
  ],
  faqs: [
    [
      "How many calories do you burn cooking for an hour?",
      "Roughly 130 to 245 kcal for a 70 kg adult, depending on how active the hour is. Light standing prep is 2.0 METs (about 147 kcal an hour at 70 kg), while general kitchen activity that mixes cooking, washing and tidying is 3.3 METs (about 243 kcal an hour at the same weight).",
    ],
    [
      "Is cooking counted as exercise?",
      "It counts as light physical activity, not exercise. Most kitchen tasks fall between 1.8 and 3.5 METs, and moderate-intensity activity only starts at 3.0 METs, so cooking contributes to daily movement and NEAT but does not usually meet the WHO guideline of 150 minutes of moderate activity a week on its own.",
    ],
    [
      "What is a MET and why does body weight matter?",
      "One MET is resting metabolism, defined as 3.5 mL of oxygen per kilogram of body weight per minute. Because the definition is per kilogram, a heavier person moves more mass and burns proportionally more calories doing exactly the same task, which is why weight is a required input.",
    ],
    [
      "Should I subtract resting calories from the result?",
      "If you are tracking calories on top of a resting or basal metabolic rate that already covers the whole day, use the net figure, otherwise you would double-count the resting portion. The tool shows both, and the difference over an hour is about 74 kcal for a 70 kg adult. For weight-management decisions, check the approach with a registered dietitian.",
    ],
  ],
};

export default seo;
