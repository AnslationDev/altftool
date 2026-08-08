const seo = {
  title: "Yoga Calorie Estimator From Published MET Values",
  metaDescription:
    "Calories from MET x 3.5 x kg / 200 across twelve yoga styles, with the net-of-resting figure, MET-minutes and share of 150 weekly minutes.",
  steps: [
    "Pick a Yoga style from the twelve listed with their MET numbers — Hatha 2.5, Surya Namaskar 3.3, Power 4.0 — then set Session length (minutes) and Sessions per week.",
    "Enter your Body weight and switch Weight unit between kilograms and pounds.",
    "Calories this session shows the kcal total and the kcal per minute at that MET, with Net of resting metabolism, MET-minutes, whether it Counts as moderate intensity and the share of the 150 min weekly target, plus a table of every style at your weight.",
  ],
  intro:
    "This estimator converts a yoga session into calories using MET values and the standard ACSM relationship: kcal per minute = MET × 3.5 × body weight in kg ÷ 200. Four of the twelve styles use MET values published directly in the Compendium of Physical Activities — Hatha at 2.5, Surya Namaskar at 3.3, Power at 4.0 and breath-led practice at 2.0 — and the rest are positioned against those anchors and labelled as estimates. It also shows the net figure after subtracting resting metabolism, MET-minutes, and whether the style is intense enough to count toward the 150 minutes of weekly moderate activity recommended for adults.",
  useCases: [
    "Compare a 60-minute hatha class with a 60-minute power class at your own body weight.",
    "Check whether your three vinyasa classes a week already meet the 150-minute moderate activity target.",
    "See how much of a 'calorie burn' claim for hot yoga survives once heat and water loss are set aside.",
    "Work out MET-minutes for a workplace or insurance wellness programme that tracks them.",
  ],
  benefits: [
    [
      "Sourced MET values",
      "Every style says whether its MET number is published in the Compendium or estimated against it.",
    ],
    [
      "Gross and net side by side",
      "The net figure removes the calories you would have burned anyway, which is the honest comparison.",
    ],
    [
      "Weekly view",
      "Session frequency turns into weekly minutes, weekly calories and progress toward the 150-minute target.",
    ],
  ],
  faqs: [
    [
      "How many calories does an hour of yoga burn?",
      "For a 70 kg adult, an hour of general Hatha yoga at 2.5 METs is about 184 kcal, Surya Namaskar or vinyasa at 3.3 METs about 243 kcal, and power yoga at 4.0 METs about 294 kcal. Subtract roughly 40 percent if you want the figure net of the calories you would have burned resting.",
    ],
    [
      "Does hot yoga burn more calories?",
      "Not by much. The heat raises heart rate, sweat rate and perceived effort far more than it raises the actual energy cost of the postures, and the weight lost during a hot class is mostly water that returns with rehydration. Studies of Bikram classes have put the average intensity at roughly 3 to 4 METs, similar to a moving vinyasa class.",
    ],
    [
      "Is yoga enough exercise on its own?",
      "Styles at 3 METs or more count as moderate-intensity activity, so vinyasa, ashtanga, power and continuous sun salutations contribute to the 150 minutes a week recommended for adults. Gentler styles below 3 METs are valuable for mobility, balance and stress but do not count toward that target, and no yoga style replaces the separate recommendation for muscle-strengthening work twice a week.",
    ],
    [
      "What is a MET and why is it used here?",
      "One MET is the oxygen cost of sitting quietly, about 3.5 mL of oxygen per kilogram per minute. An activity at 4 METs uses roughly four times that. Because MET values are published per activity and scale with body weight, they give a repeatable estimate without needing a heart rate monitor — though they describe an average adult, not you specifically.",
    ],
  ],
};

export default seo;
