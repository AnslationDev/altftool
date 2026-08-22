const seo = {
  title: "Wilks Score Calculator: Original 1994 Formula",
  metaDescription:
    "Enter bodyweight, squat, bench and deadlift in kg or lb to get your Wilks coefficient and score, plus totals needed for 300, 400 and 500 at your weight.",
  steps: [
    "Choose Men or Women under Coefficient set and Kilograms or Pounds under Units, then enter your Bodyweight, Squat, Bench press and Deadlift.",
    "The Wilks score recomputes as you type — your total multiplied by the 1994 Wilks coefficient — with a warning when your bodyweight falls outside the polynomial's fitted range.",
    "Read the Total lifted, Wilks coefficient and Band rows, check 'Totals needed at this bodyweight' for the 300, 400 and 500 Wilks targets, and press Copy result.",
  ],
  intro:
    "The Wilks score is a powerlifting total multiplied by a bodyweight coefficient, so lifters in different weight classes can be ranked on one scale. The coefficient comes from Robert Wilks' 1994 fifth-order polynomial, 500 ÷ (a + bx + cx² + dx³ + ex⁴ + fx⁵) with x as bodyweight in kilograms, and it has separate constants for men and women. Enter a squat, bench and deadlift in kilograms or pounds and this returns the coefficient, the score and the total needed for common targets.",
  useCases: [
    "Settle who had the better day at a meet when one lifter weighed 74 kg and the other 105 kg.",
    "Track relative strength across a cut, where the total may drop while the Wilks score holds or rises.",
    "Work out the total you would need at your current bodyweight to cross a 400 or 500 Wilks target.",
    "Compare your own results with older meet records that were scored in Wilks rather than IPF GL points.",
  ],
  benefits: [
    ["Original 1994 constants", "Uses the published Wilks polynomial rather than a lookup table or approximation."],
    ["Kilograms or pounds", "Bodyweight and lifts convert with the exact 0.45359237 kg pound."],
    ["Target totals", "Shows the total required for 300, 400 and 500 Wilks at your bodyweight."],
  ],
  faqs: [
    [
      "How is a Wilks score calculated?",
      "Multiply your three-lift total in kilograms by the Wilks coefficient for your bodyweight and sex. The coefficient is 500 divided by a fifth-order polynomial in bodyweight — at 100 kg a man's coefficient is about 0.6086, so a 600 kg total scores roughly 365.",
    ],
    [
      "What is a good Wilks score?",
      "As a rough gym convention, around 300 is a solid intermediate lifter, 400 is advanced, 500 is national level and 600 or more is world class. These are informal bands rather than federation classifications, and they assume a full raw three-lift total.",
    ],
    [
      "Is Wilks still used in competition?",
      "The IPF replaced Wilks with IPF GL points in 2019, and several other federations have followed with their own formulas such as DOTS. Wilks remains widely quoted in gyms, on lifting apps and in historical results, which is why it is still worth calculating.",
    ],
    [
      "Why does the Wilks score favour some bodyweights?",
      "The polynomial was fitted to competitive data roughly between 40 kg and 200 kg, and it curves oddly beyond that — coefficients can even start rising again at very heavy bodyweights. That is one of the main criticisms that led to newer formulas, so treat results outside the fitted range as unreliable.",
    ],
  ],
};

export default seo;
