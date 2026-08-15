const seo = {
  title: "Swimming Calorie Calculator: MET by Stroke and Pace",
  metaDescription:
    "Estimate swim calories with the ACSM MET formula: 11 stroke options, gross and net kcal, pace per 100 m and calories per length.",
  steps: [
    "Set Body weight with the kg or lb unit dropdown and Time in the water (minutes), or tap the 15, 30, 45 or 60 min preset, then add Lengths swum (optional) and Pool length (metres)",
    "Pick from Stroke and effort, an 11-option list that prints each option's Compendium MET beside it, from Treading water, moderate effort at 3.5 MET to Butterfly, general at 13.8 MET; there is no calculate button, the figures recompute as you type",
    "Calories burned shows the gross kcal, with Net calories (resting burn removed), Burn rate, Pace, Calories per 100 m and Calories per length beneath it plus a Same session, other strokes table; Copy result puts the summary on the clipboard and Reset restores the 70 kg defaults",
  ],
  intro:
    "This calculator estimates the energy cost of a swim from the MET value of your stroke and effort, using the ACSM formula kcal/min = MET × 3.5 × body-mass-in-kg ÷ 200. Pick a stroke — the MET values come from the 2011 Compendium of Physical Activities, water-activity category 18, ranging from 3.5 for moderate treading to 13.8 for butterfly — enter your weight and minutes in the water, and optionally your lengths and pool length to get distance, pace per 100 m and calories per length. It reports both gross calories and net calories with the resting 1 MET removed, which is the figure to use when comparing a swim against food.",
  useCases: [
    "You swim 40 lengths of a 25 m pool a few times a week and want a realistic figure for the session rather than the number the gym treadmill-style chart on the wall gives",
    "You are deciding whether to spend your pool time on steady freestyle or hard breaststroke sets, and want to see how a 5.8 MET moderate crawl compares with a 10.3 MET training breaststroke at your body weight",
    "You logged a swim in a fitness app that only accepts calories, and you need a defensible number to enter along with the pace per 100 m you actually held",
  ],
  benefits: [
    ["Net as well as gross calories", "It subtracts the 1 MET you would have burned resting anyway, so the number you compare against food is not inflated by roughly 60–100 kcal an hour."],
    ["Eleven stroke and effort options with their source codes", "Each option carries its published Compendium MET value and activity code, so recreational backstroke at 4.8 MET is never confused with training backstroke at 9.5."],
    ["Pace and cost per 100 m from your lengths", "Enter lengths and pool length and it derives total distance, minutes per 100 m and calories per 100 m alongside the session total."],
  ],
  faqs: [
    [
      "How many calories does an hour of swimming burn?",
      "For a 70 kg swimmer doing steady freestyle at 5.8 MET, roughly 425 kcal an hour gross — the formula is 5.8 × 3.5 × 70 ÷ 200, or about 7.1 kcal per minute. Hard freestyle at 9.8 MET roughly doubles that, and the figure scales directly with body mass, so a 90 kg swimmer burns about 29% more than a 70 kg one at the same stroke.",
    ],
    [
      "What is a MET and why does the number change with my weight?",
      "One MET is resting metabolic rate, defined as 3.5 mL of oxygen per kilogram of body mass per minute. Because it is expressed per kilogram, a heavier body consumes proportionally more oxygen at the same MET, and one litre of oxygen is taken as 5 kcal — which is where the ÷ 200 in the formula comes from.",
    ],
    [
      "Should I use the gross or the net figure?",
      "Use net when you are comparing the swim against calories eaten, and gross when you are logging total energy expenditure for the day. Net removes the 1 MET of resting metabolism you would have spent lying on the sofa for the same period, which is around 70 kcal an hour for a 70 kg person.",
    ],
    [
      "How accurate is this for me personally?",
      "Treat it as an estimate with a wide margin. Compendium MET values are population averages that ignore swimming technique, water temperature, rest between sets and individual efficiency — a skilled swimmer covers the same distance for far less energy than a beginner. It is informational only; talk to a doctor or a dietitian before building a weight-loss plan around any calorie figure.",
    ],
  ],
};

export default seo;
