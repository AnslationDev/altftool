const seo = {
  title: "Stationary Bike Calorie Calculator (ACSM Watts)",
  metaDescription:
    "Exercise bike calories from the ACSM leg-cycling equation - watts, or resistance level and cadence. Gross and net kcal, METs, kJ and efficiency.",
  steps: [
    "Choose 'Average power (watts)' if your console shows watts, or 'Resistance level + cadence' if it only shows a dial.",
    "Enter Body weight and Duration (minutes), then either the average power or the resistance level, levels on your bike and average cadence (rpm).",
    "Read the gross calories burned plus net calories, estimated power, METs, oxygen uptake, mechanical work in kJ and gross mechanical efficiency.",
  ],
  intro:
    "This calculator converts an exercise bike session into calories using the ACSM leg-cycle-ergometry equation, VO2 (mL/kg/min) = (10.8 × watts) / body mass in kg + 7, with oxygen uptake priced at 5 kcal per litre. If your console shows watts, that is the accurate route. If it only shows a resistance level, power is approximated from flywheel physics — braking torque times angular velocity — which is transparent about being an estimate rather than pretending a dial number is a wattage. Gross and net calories, METs, mechanical work in kilojoules and gross efficiency are all reported.",
  useCases: [
    "Turn a 45-minute ride at 150 W into a calorie figure you can actually compare against a run.",
    "Estimate energy cost on a spin bike that shows only a 1–20 resistance dial and a cadence readout.",
    "Check whether your gym bike's calorie display is realistic given your body weight.",
    "Compare the energy cost of high cadence at low resistance against low cadence at high resistance for the same power.",
  ],
  benefits: [
    [
      "Watts when you have them",
      "Power is the one input that makes cycling energy cost genuinely calculable rather than guessed.",
    ],
    [
      "Honest resistance mode",
      "The dial estimate is derived from torque × angular velocity and is clearly flagged as an approximation.",
    ],
    [
      "Kilojoules and efficiency too",
      "Shows the mechanical work done and the gross efficiency, which normally lands near the expected 20-24%.",
    ],
  ],
  faqs: [
    [
      "How many calories does 45 minutes on a stationary bike burn?",
      "For a 70 kg rider holding 150 W, the ACSM equation gives about 475 kcal gross and about 420 kcal net of resting metabolism over 45 minutes. At 100 W the same rider is closer to 345 kcal gross. Power, not time alone, drives the number.",
    ],
    [
      "How do I convert resistance level to watts?",
      "There is no universal conversion — manufacturers do not calibrate dials to a common scale. A physics estimate treats braking torque as rising with the setting and multiplies by pedal angular velocity, so roughly half resistance at 80 rpm on a 20-level bike lands near 150 W. Treat that as an approximation and prefer a watts readout or a power meter.",
    ],
    [
      "Is one kilojoule on the bike the same as one calorie?",
      "Not the same, but conveniently close in practice. A kilojoule of mechanical work costs roughly 1 kcal of metabolic energy because human cycling efficiency sits near 24%, and 1 kcal = 4.184 kJ. That is why many cyclists treat the kJ figure on a power meter as approximately the calorie figure.",
    ],
    [
      "Why does the gym bike show more calories than this?",
      "Console readouts usually assume a default body weight, report gross rather than net calories, and sometimes apply an optimistic conversion. Lighter riders in particular tend to see inflated numbers. These figures are informational estimates — consult a dietitian or doctor before planning an energy deficit around them.",
    ],
  ],
};

export default seo;
