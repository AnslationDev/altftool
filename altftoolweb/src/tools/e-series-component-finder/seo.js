const seo = {
  intro:
    "E-Series Component Finder takes a calculated target value for a resistor, capacitor or inductor and returns the nearest value that actually exists in the E6, E12, E24, E48 or E96 preferred-number series, along with the percentage error you incur by using it. It generates the series the way the IEC 60063 standard defines it — using the standard's own published per-decade mantissa tables (two significant figures for E6, E12 and E24; three for E48 and E96), not an approximated geometric-progression formula — then ranks the six closest candidates and shows the nearest value below and above your target. It is for anyone who has just solved a divider or filter equation and needs a part they can genuinely order.",
  useCases: [
    "Your voltage-divider maths says 4,720 Ω and you need to know which E24 resistor to actually buy and how far off that puts the output.",
    "A design must move from E24 to E96 because the reference divider needs tighter tolerance, and you want to see how much the error shrinks before committing to the more expensive parts.",
    "You are choosing an RC time-constant capacitor and want both the nearest standard value below and above your target so you can decide which direction to round the corner frequency.",
  ],
  benefits: [
    [
      "Six candidates, not just one",
      "The result table lists the six nearest standard values with signed error percentages, so you can pick the one that errs in the safe direction for your circuit.",
    ],
    [
      "Correct rounding per series",
      "E6, E12 and E24 are rounded to two significant figures and E48 and E96 to three, matching how the series are actually published rather than raw powers of ten.",
    ],
    [
      "Works across decades and part types",
      "Candidates are generated one decade either side of the target, and because the series are dimensionless the same lookup applies to ohms, farads and henries.",
    ],
  ],
  faqs: [
    [
      "What are the E-series values?",
      "They are the standard preferred component values defined in IEC 60063, spaced logarithmically so each decade is divided into equal ratio steps: 6 values in E6, 12 in E12, 24 in E24, 48 in E48 and 96 in E96. The nth value in a series is 10^(n/series) scaled to the decade, which is why E12 runs 1.0, 1.2, 1.5, 1.8, 2.2 and so on.",
    ],
    [
      "Which E-series matches which tolerance?",
      "Conventionally E6 pairs with ±20% parts, E12 with ±10%, E24 with ±5%, E48 with ±2% and E96 with ±1% — the step size is set so adjacent values' tolerance bands just cover the gap between them. Always confirm the tolerance printed on the actual part's datasheet, since the pairing is a convention rather than a guarantee.",
    ],
    [
      "What is the closest E24 resistor to 4.72 kΩ?",
      // Sync note: matches spec.js compute({ target: 4720, series: "24" }) => 4700, -0.4237% error.
      "4.7 kΩ, which is an E24 value and sits about 0.42% below the 4,720 Ω target. The tool shows that error figure directly, along with the next value up so you can see the cost of rounding the other way.",
    ],
    [
      "Can I use this for capacitors and inductors too?",
      "Yes. The E-series are dimensionless ratios applied to whatever unit you are working in, so entering a target in farads or henries returns the same preferred numbers. Note that capacitors in practice are often stocked only in E6 or E12 steps even when the calculated series suggests finer resolution.",
    ],
  ],
};

export default seo;
