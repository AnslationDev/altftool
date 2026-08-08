const seo = {
  title: "Calories Burned Washing Dishes: MET Calculator",
  metaDescription:
    "Works out calories per wash from MET x 3.5 x kg / 200 — 1.8 METs at the sink, 3.3 scrubbing — then projects it to a day, week and year.",
  steps: [
    "Enter your Body weight, switch the Weight unit between Kilograms (kg) and Pounds (lb), then set Minutes per wash, Washes per day and Days per week you wash up.",
    "Pick one of the four MET options under How you wash up, from Hand washing at the sink, standing at 1.8 METs to Heavy scrubbing at 3.3 METs, and the kcal/min = MET x 3.5 x kg / 200 figure recalculates as you type.",
    "Read Calories per wash at the top, then the Burn rate, Per day, Per week, Per year and Net above resting rows, and press Copy result to take the summary.",
  ],
  intro:
    "This calculator works out how many calories washing up costs, using the metabolic-equivalent formula kcal/min = MET x 3.5 x kg / 200 with the published MET values for dishwashing: 1.8 METs standing at the sink, 2.5 METs when you are also clearing the table, and 3.3 METs for general moderate kitchen work such as scrubbing pots. It then projects a single wash out to a day, a week and a full year so a small repeated task is visible at the scale it actually happens. Both the gross figure and the net figure above resting metabolism are shown.",
  useCases: [
    "See what two 15-minute washes a day add up to across a year when you are auditing daily non-exercise movement.",
    "Compare hand washing at the sink against loading a dishwasher before deciding whether the appliance changes your daily activity much.",
    "Add a realistic household-chores line to an activity diary instead of logging the whole day as sedentary.",
  ],
  benefits: [
    [
      "Four separate MET values",
      "Standing washing, clearing while walking, heavy scrubbing and dishwasher loading are priced separately rather than lumped together.",
    ],
    [
      "Week and year projection",
      "A 30-kcal task looks trivial until you multiply it by 730 washes — the yearly total makes that visible.",
    ],
    [
      "Net burn, not just gross",
      "Subtracting resting metabolism shows the part actually attributable to the chore.",
    ],
  ],
  faqs: [
    [
      "How many calories does washing dishes burn?",
      "About 2.2 kcal a minute for a 70 kg adult standing at the sink, so roughly 33 kcal for a 15-minute wash and 132 kcal an hour. Washing dishes is listed at 1.8 METs in the compendium of physical activities, rising to 3.3 METs if you are moving around cooking and cleaning at the same time.",
    ],
    [
      "Does washing dishes count as exercise?",
      "No. Moderate-intensity activity starts at 3.0 METs, and standing at the sink is only 1.8 METs, so it counts as light activity. It still contributes to total daily energy expenditure and to breaking up sitting time, which matters independently of formal exercise.",
    ],
    [
      "Is hand washing better than a dishwasher for burning calories?",
      "Marginally, and mostly because it takes longer. Hand washing at 1.8 METs for 15 minutes burns about 33 kcal for a 70 kg adult, while loading a dishwasher is closer to a 2.5 MET clearing-and-walking task but usually lasts only 5 to 10 minutes, so the totals come out similar.",
    ],
    [
      "How long would I have to wash up to lose a kilogram of fat?",
      "Using the classic 7,700 kcal per kilogram of body fat, and a net burn of about 29 kcal a day from two 15-minute washes at 70 kg, it would take around 260 days. That rule of thumb ignores metabolic adaptation and appetite changes, so treat it as a scale illustration and not a weight-loss plan.",
    ],
  ],
};

export default seo;
