const seo = {
  title: "Rowing Machine Calorie Calculator",
  metaDescription:
    "Distance and time become watts, 500 m split and calories via Concept2's own formulas, plus a weight-adjusted figure - the monitor assumes a 175 lb rower.",
  intro:
    "This calculator takes the distance and time from an indoor rowing session and returns the average power in watts, the 500 m split and the calories burned, using Concept2's own published formulas: watts = 2.80 ÷ (seconds per metre)³ and kcal per hour = (4 × watts) + 300. It shows both the number the monitor would display and a version adjusted for your body weight, because the 300 kcal/hr term in that formula assumes a 175 lb (79.4 kg) rower. Enter an average stroke rate as well and you also get strokes taken, metres per stroke and joules per stroke.",
  useCases: [
    "You rowed 5,000 m in 22:30 and want to know the watts and split behind it so you can compare the piece with last week's.",
    "You weigh well under or over 79 kg and want to see how far the erg's calorie readout drifts from a weight-adjusted estimate for your session.",
    "You are logging a workout in a food or training app that wants net calories, and you need the resting metabolic cost of those minutes taken out of the total.",
  ],
  benefits: [
    ["Two calorie numbers, side by side", "The monitor's 175 lb figure and a body-weight-adjusted one, so you can see the size of the difference instead of guessing."],
    ["Power derived, not assumed", "Watts come from the cube-law pace formula the Concept2 PM uses, so a 2:00 split returns 202.5 W exactly as their chart does."],
    ["Stroke economy from one extra field", "Add your average rate and it reports metres per stroke and joules per stroke, the numbers that expose a rushed drive."],
  ],
  faqs: [
    [
      "How does a rowing machine calculate calories?",
      "Concept2 monitors use kcal per hour = (4 × watts) + 300, where watts come from your pace. The 4 kcal per watt-hour reflects a gross mechanical efficiency near 21.5%, and the fixed 300 kcal/hr covers the non-propulsive cost of moving your own body up and down the slide.",
    ],
    [
      "Why does the erg's calorie count assume a 175 lb rower?",
      "Because Concept2 fixes the 300 kcal/hr baseline term rather than asking for your weight, and 175 lb (79.4 kg) is the reference body mass behind it. Only that baseline scales with body mass — a watt costs the same energy whoever produces it — so this tool rescales the 300 by your weight ÷ 79.4 kg and leaves the propulsive term alone.",
    ],
    [
      "How do I convert my split into watts?",
      "Divide your 500 m split in seconds by 500 to get seconds per metre, then compute 2.80 ÷ (seconds per metre)³. A 2:00 split is 0.24 s/m, giving 2.80 ÷ 0.24³ = 202.5 watts; because the relationship is cubic, going 10% faster costs roughly 37% more power.",
    ],
    [
      "What is the difference between gross and net calories?",
      "Gross calories are everything your body burned during the session; net calories subtract what you would have burned at rest over the same minutes. This tool computes the resting portion at 1 MET — 3.5 mL of oxygen per kg per minute, at 5 kcal per litre of oxygen — and reports the net figure separately, which is the more honest number for a food diary.",
    ],
  ],
};

export default seo;
