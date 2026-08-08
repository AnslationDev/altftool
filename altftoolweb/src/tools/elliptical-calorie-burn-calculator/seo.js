const seo = {
  title: "Elliptical Calorie Burn Calculator by Heart Rate",
  metaDescription:
    "Estimates cross-trainer calories from average heart rate with the Keytel equation, or from console watts at 10.8 mL O2 per watt per minute.",
  steps: [
    "Under 'Which measurement do you have?' pick 'Average heart rate', then enter 'Body weight' in kg or lb, 'Duration (minutes)', 'Average heart rate (bpm)', 'Age (years)' and sex.",
    "Switch to 'Console watts' and enter 'Average power (watts)' if your machine reports power; 'Resistance level (logged only)' and 'Ramp angle in degrees (logged only)' are recorded, never turned into multipliers.",
    "Read 'Calories burned (gross)' with 'Net calories (above resting)', 'Average intensity' in METs and 'Oxygen uptake', then press 'Copy result'.",
  ],
  intro:
    "Cross-trainers have no standardised work-rate scale, so this calculator estimates elliptical calorie burn from average heart rate using the Keytel equation (Journal of Sports Sciences, 2005), which predicts energy expenditure in kJ per minute from heart rate, body mass, age and sex. If your console reports average watts, a second mode prices that external work at the ACSM figure of 10.8 mL of oxygen per watt per minute plus a 7 mL/kg/min baseline. Resistance level and ramp angle are logged with the session but never applied as invented multipliers — their real effect already shows up in your heart rate.",
  useCases: [
    "Convert a 35-minute cross-trainer session at an average of 138 bpm into a calorie figure you can compare with a run.",
    "Check whether the machine's calorie readout is plausible when it has no idea of your weight, age or sex.",
    "Compare a high-ramp, low-resistance session against a low-ramp, high-resistance one at the same average heart rate.",
    "Keep a consistent record of energy cost across gyms where the machines report completely different numbers.",
  ],
  benefits: [
    [
      "A validated heart rate equation",
      "The Keytel model uses heart rate, weight, age and sex rather than a one-size MET value.",
    ],
    [
      "No invented multipliers",
      "Resistance and ramp dials are recorded but not converted into fake wattage, because no common calibration exists.",
    ],
    [
      "Gross and net figures",
      "Separates total energy from the extra energy above resting metabolism, which is the number that matters for a deficit.",
    ],
  ],
  faqs: [
    [
      "How many calories does 30 minutes on an elliptical burn?",
      "Using the Keytel equation, an 80 kg 35-year-old man averaging 140 bpm burns roughly 403 kcal gross in 30 minutes, and a 60 kg 30-year-old woman averaging 130 bpm burns roughly 232 kcal. Body weight, heart rate, age and sex all move the figure, which is why a single machine readout is rarely right for you.",
    ],
    [
      "Is the elliptical calorie counter accurate?",
      "Usually not. Consoles typically assume a default body weight, do not know your age or sex, and report gross calories. Independent testing has repeatedly found cardio machines overestimating energy expenditure, with ellipticals among the worst offenders — often by 20% or more.",
    ],
    [
      "Does raising the ramp burn more calories?",
      "Raising the ramp shifts muscle recruitment toward the glutes and hamstrings and usually raises perceived effort, and if you keep the same stride rate your heart rate typically rises with it. That rise is what actually reflects the extra energy cost — there is no validated equation that converts a ramp angle directly into calories, so this tool records the setting rather than guessing at a multiplier.",
    ],
    [
      "Does the elliptical burn more calories than the treadmill?",
      "At the same heart rate they are broadly comparable, but for a given perceived effort the treadmill usually costs more because you support and propel your full body weight with each step. The elliptical's advantage is that it removes impact, which matters for joint problems and for high training volume. These are estimates — talk to a doctor or dietitian before planning a strict energy deficit.",
    ],
  ],
};

export default seo;
