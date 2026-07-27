const seo = {
  intro:
    "The Thyroid Medication Timing Planner measures the gap between your levothyroxine tablet and everything that blocks its absorption, then tells you which gaps are long enough. It applies the separations in the product labelling and the trials behind them: at least 30 minutes before food (60 is better), 60 minutes from coffee, 4 hours from calcium, iron, antacids, proton-pump inhibitors, soy and high-fibre meals, and 3 hours after the last meal if you dose at bedtime. Useful for anyone whose TSH keeps drifting despite taking the same dose every day.",
  useCases: [
    "You take your tablet at 6am but drink coffee at 6:20 — check how much of the dose that is costing you.",
    "You are moving from morning to bedtime dosing and need to know how early dinner has to finish.",
    "A new calcium or iron supplement has been added and you want to find a slot 4 hours clear of the tablet.",
    "Your TSH rose after starting a proton-pump inhibitor and you want to see whether the timing overlaps.",
  ],
  benefits: [
    ["Every gap, measured", "Checks food, coffee, calcium, iron, acid drugs and fibre against their own separation, not one blanket rule."],
    ["Concrete fix, not a warning", "When a gap is short it names the exact clock time to move the tablet or the item to."],
    ["Bedtime routine supported", "Handles overnight dosing, including times that cross midnight, using the 3-hour post-meal rule."],
  ],
  faqs: [
    [
      "How long after levothyroxine can I eat breakfast?",
      "At least 30 minutes, and 60 minutes gives more consistent absorption. Food roughly halves the fraction of the dose that reaches the blood, which is why the tablet is taken with water on an empty stomach.",
    ],
    [
      "How long should I wait to drink coffee after taking levothyroxine?",
      "60 minutes. A 2008 study in Thyroid showed espresso taken with or shortly after the tablet significantly reduced absorption, and the effect persisted even without milk, so black coffee is not a workaround.",
    ],
    [
      "How far apart should levothyroxine and calcium or iron be?",
      "Four hours. Calcium carbonate and ferrous sulfate bind levothyroxine into complexes the gut cannot absorb, so most people put the tablet in the morning and the supplement at lunch or later.",
    ],
    [
      "Is it better to take levothyroxine at night?",
      "Both work if you are consistent. A randomised crossover trial published in 2010 found bedtime dosing produced slightly lower TSH than morning dosing, probably because an empty overnight stomach is easier to achieve — but it only works if your last meal was at least 3 hours earlier. Discuss any switch with your doctor and have TSH retested about six weeks later.",
    ],
  ],
};

export default seo;
