const seo = {
  title: "DOTS Score Calculator (Powerlifting, kg or lb)",
  metaDescription:
    "Enter bodyweight, squat, bench and deadlift in kg or lb to get your DOTS coefficient and score, plus the totals behind 300-600 DOTS targets.",
  steps: [
    "Choose the Coefficient set — Men (40–210 kg) or Women (40–150 kg) — and Kilograms or Pounds under Units.",
    "Enter Bodyweight, Squat, Bench press and Deadlift; the score recomputes as you type.",
    "Read the DOTS score with its coefficient, lift split and the 'Totals behind each DOTS target' table for 300-600, then press Copy result.",
  ],
  intro:
    "DOTS — Dynamic Objective Team Scoring — converts a powerlifting total into a bodyweight-adjusted score using the coefficient 500 ÷ (Ax⁴ + Bx³ + Cx² + Dx + E), where x is bodyweight in kilograms. Tim Konertz designed it as a raw-lifting replacement for Wilks, and it is the score OpenPowerlifting and several federations now publish. Enter bodyweight and the three lifts in kilograms or pounds to get the coefficient, the score and the total needed for common targets.",
  useCases: [
    "Rank a club meet where lifters span 59 kg to 120 kg without splitting them into weight classes first.",
    "Decide whether dropping a weight class would raise or lower your score by comparing coefficients at two bodyweights.",
    "Convert an old Wilks-scored personal best into DOTS so it can sit alongside current results.",
    "Set a concrete total target by reading off the kilograms needed for 400, 500 or 600 DOTS at your bodyweight.",
  ],
  benefits: [
    ["Published DOTS constants", "Uses the official fourth-order polynomial and the sex-specific coefficient sets."],
    ["Correct bodyweight clamping", "Applies the formula's own 40–210 kg (men) and 40–150 kg (women) limits instead of extrapolating."],
    ["Target totals", "Shows the total each DOTS landmark needs at your exact bodyweight."],
  ],
  faqs: [
    [
      "How is a DOTS score calculated?",
      "Multiply your total in kilograms by 500 divided by a fourth-order polynomial in bodyweight, using the men's or women's constants. At 100 kg a man's DOTS coefficient is about 0.6155, so a 620 kg total scores roughly 382.",
    ],
    [
      "What is the difference between DOTS and Wilks?",
      "DOTS uses a fourth-order polynomial fitted to raw lifting data, while Wilks uses a fifth-order polynomial fitted in 1994 to largely equipped data. DOTS also clamps bodyweight rather than extrapolating, which removes the odd behaviour Wilks shows at very heavy bodyweights. The two scores land in a similar range, so a 400 in either means roughly the same thing.",
    ],
    [
      "What is a good DOTS score?",
      "As a rough convention, 300 marks a solid intermediate lifter, 400 is advanced, 500 is national level and 600 or more is international. These are community landmarks rather than official classifications, and they assume a raw three-lift total.",
    ],
    [
      "Why does the calculator cap bodyweight at 210 kg?",
      "The DOTS polynomial is only defined between 40 kg and 210 kg for men and 40 kg to 150 kg for women. Above or below that the formula clamps to the nearest limit, so a 230 kg man is scored with the 210 kg coefficient — that is part of the specification, not an approximation made here.",
    ],
  ],
};

export default seo;
