const seo = {
  title: "Bhangra Calorie Burn Calculator with MET Values",
  metaDescription:
    "Estimate bhangra calories from weight, minutes and intensity using kcal/min = MET x 3.5 x kg / 200, with break time at 1.5 MET and a net figure.",
  steps: [
    "Enter 'Body weight' with the kg or lb unit selector beside it, then 'Session length (minutes)', or tap one of the 15, 30, 45, 60 and 90 min presets.",
    "Pick 'How hard were you going?' — from 'Learning steps (walk-through pace)' up to 'Performance / competition tempo, non-stop', each option showing its MET value — then set 'Share of session actually dancing (%)' and 'Sessions per week'.",
    "Read 'Calories burned' in kcal, with 'Net of resting metabolism', 'Rate while dancing' in kcal/min, 'Per hour of non-stop bhangra', 'Average MET across the session' and 'Weekly total' beneath it, then press 'Copy result'.",
  ],
  intro:
    "The Bhangra Calorie Burn Calculator estimates how much energy a bhangra session costs by multiplying a MET intensity value by your body weight and the minutes you danced. It uses the ACSM relationship kcal/min = MET x 3.5 x kg / 200, splits the session into dancing time and break time so standing around is not counted as full-effort dance, and reports both gross calories and calories net of resting metabolism. Useful for dancers, Vaisakhi and wedding performers, and anyone using bhangra practice as their main cardio.",
  useCases: [
    "Log a 45-minute bhangra practice as cardio in a food-and-exercise diary without guessing the calorie figure.",
    "Compare a relaxed learning class at 4.5 MET against a competition-tempo set at 9.5 MET for the same 60 minutes.",
    "Work out the weekly energy cost of three rehearsals before a Vaisakhi or wedding performance.",
    "See how much of a two-hour dandiya-and-bhangra night is actually active dancing once you account for breaks.",
  ],
  benefits: [
    ["Break time counted honestly", "Standing between songs is priced at 1.5 MET instead of full dance intensity."],
    ["Gross and net figures", "Shows calories over and above the resting metabolism you would have burned anyway."],
    ["Transparent MET source", "Every level names the Compendium of Physical Activities value it is mapped to."],
  ],
  faqs: [
    [
      "How many calories does bhangra burn in an hour?",
      "A 70 kg dancer doing a typical non-stop bhangra set at roughly 7.8 MET burns about 573 kcal per hour; at learning pace (4.5 MET) that falls to about 330 kcal, and at competition tempo (9.5 MET) it rises to about 700 kcal. Multiply or divide roughly in proportion to your own weight.",
    ],
    [
      "Is bhangra a good workout for weight loss?",
      "Yes as cardio — sustained bhangra sits in the vigorous band (over 6 MET), the same intensity category as jogging or an aerobics class, so it counts toward the 75 minutes of vigorous activity per week in the WHO physical activity guidelines. Weight change still depends on total energy balance across the whole week, not one session.",
    ],
    [
      "What is a MET and why does the calculator use it?",
      "A MET is a multiple of resting metabolic rate, defined as an oxygen uptake of 3.5 mL per kg per minute. Because it scales with body mass, one published MET value can be turned into a calorie figure for any person with the formula kcal/min = MET x 3.5 x kg / 200.",
    ],
    [
      "Should I subtract the calories I would have burned anyway?",
      "For diet tracking, yes — the net figure shown here removes 1 MET of resting metabolism for the session length, which is the part already included in your daily maintenance calories. Counting the gross figure on top of a full-day calorie target double-counts roughly 70-100 kcal per hour for an average adult.",
    ],
  ],
};

export default seo;
