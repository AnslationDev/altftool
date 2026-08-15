const seo = {
  title: "Kettlebell Swing Calories by Bell Weight and Cadence",
  metaDescription:
    "Estimates swing calories from the measured 9.8 MET cost of two-hand swings, scaled by bell-to-body-mass ratio, with rest costed at 2 METs.",
  steps: [
    "Enter Body weight (kg), Bell weight (kg), Sets and Swings per set — the defaults are 75 kg, a 16 kg bell and 10 sets of 15.",
    "Set Cadence (swings/min) and Rest between sets (seconds), plus a Target calories for swing estimate.",
    "The Swing calorie estimate panel returns Net calories, Calories per swing, work and rest minutes and Swings for target; press Copy output.",
  ],
  intro:
    "This calculator estimates the energy cost of a kettlebell swing session from swing count, bell weight, cadence and rest between sets. It is anchored on the measured oxygen cost of continuous two-hand swings — about 9.8 METs with a 16 kg bell in Farrar, Mayhew and Koch's 2010 study — then scaled for how heavy your bell is relative to your own body mass and how fast you swing, and converted with the ACSM equation kcal/min = METs x 3.5 x kg / 200. Rest between sets is costed separately at 2 METs, because that is where most of the clock in a swing session actually goes.",
  useCases: [
    "Cost a 10 x 20 swing session with a minute of rest between sets before logging it.",
    "See how much moving from a 16 kg to a 24 kg bell changes the calories for the same 200 swings.",
    "Compare a dense EMOM-style session against the same swings with long rests.",
    "Work out how many swings a 300 kcal target needs at your usual bell and cadence.",
  ],
  benefits: [
    [
      "Anchored on measured data",
      "Starts from a published oxygen-cost measurement of swings, not a generic weight-training MET.",
    ],
    [
      "Bell weight actually matters",
      "Scales intensity by the bell-to-body-mass ratio instead of ignoring the load you chose.",
    ],
    [
      "Rest counted honestly",
      "Separates swinging minutes from resting minutes so a long-rest session is not overstated.",
    ],
  ],
  faqs: [
    [
      "How many calories does 100 kettlebell swings burn?",
      "Roughly 46 kcal for an 80 kg person swinging a 16 kg bell continuously at 30 swings a minute, which is about 0.46 kcal a swing. Spread the same 100 swings across five sets with a minute of rest and the session total rises to about 60 kcal, but only because the clock is longer.",
    ],
    [
      "Is the kettlebell swing good cardio?",
      "Yes — continuous two-hand swings have been measured at roughly 9.8 METs, comparable to running at about 8 to 9 km/h, with average heart rates around 165 bpm in the same study. That makes swings an unusually efficient way to combine a strength stimulus with a genuine cardiovascular one.",
    ],
    [
      "Does a heavier kettlebell burn more calories?",
      "It does, but less than proportionally. Moving from a 16 kg to a 24 kg bell at 80 kg body weight raises the estimated intensity by roughly a fifth, not by half, because a large part of the effort is accelerating your own trunk and hips, which does not change with the bell.",
    ],
    [
      "How many swings should I do in a workout?",
      "Common programmes sit between 100 and 300 swings a session, built from sets of 10 to 20 with enough rest to keep the hip hinge sharp. Volume matters less than form: swings are a hip-hinge power movement, and once the back starts rounding the set is over regardless of the number on the plan.",
    ],
  ],
};

export default seo;
