const seo = {
  title: "Laundry Calorie Burn Calculator (MET-Based)",
  metaDescription:
    "Prices seven laundry stages at published MET values — hand washing 4.0, folding 2.0, stairs with a basket 7.5 — and totals kcal per day, week and year.",
  steps: [
    "Enter your Body weight in kilograms or pounds and your Laundry days per week (1–7).",
    "Fill in Minutes per laundry day for each of the seven stages — each field shows its MET value and Compendium code underneath.",
    "Read the one-laundry-day kcal total, the net-above-resting figure, week, month and year projections and the stage-by-stage breakdown table; Copy result exports it all as text.",
  ],
  intro:
    "This calculator prices each part of a laundry day at its own published MET value and converts it to calories with the formula kcal/min = MET x 3.5 x kg / 200. Hand washing and hanging wash are listed at 4.0 METs, folding and loading a machine at 2.0, ironing at 1.8 and carrying a basket upstairs at 7.5, so a machine-only routine and a hand-wash routine give very different totals. It is aimed at anyone auditing household movement, and it projects a single laundry day out to a week, month and year.",
  useCases: [
    "Compare a machine-only routine against hand washing and line drying when you want to know how much movement a washing machine removed from your week.",
    "Add a realistic chores line to an activity log instead of counting laundry day as sedentary time.",
    "See how much the stair trips with a full basket contribute — at 7.5 METs they are usually the highest-intensity part of the day.",
  ],
  benefits: [
    [
      "Seven separate stages",
      "Sorting, hand washing, hanging, folding, ironing, changing linen and stair carries each carry their own MET value.",
    ],
    [
      "Machine versus hand comparison",
      "Set hand washing to zero and the machine stages to real minutes to see the gap immediately.",
    ],
    [
      "Week, month and year totals",
      "Multiplies a single laundry day by your actual number of laundry days rather than assuming a fixed schedule.",
    ],
  ],
  faqs: [
    [
      "How many calories does doing laundry burn?",
      "A typical machine-based laundry day of about 50 minutes burns roughly 180 kcal for a 70 kg adult, of which about 124 kcal is above resting metabolism. The figure rises quickly if you hand wash, because hand washing and hanging wash are 4.0 METs against 2.0 METs for folding and loading.",
    ],
    [
      "Does hand washing clothes burn more calories than using a machine?",
      "Yes, roughly double per minute and far more in total because it takes longer. Hand washing is 4.0 METs, about 4.9 kcal a minute at 70 kg, while loading a machine and folding is 2.0 METs or about 2.5 kcal a minute.",
    ],
    [
      "Is ironing good exercise?",
      "Not really — ironing is listed at 1.8 METs, below the 3.0 MET threshold for moderate-intensity activity, so it is classed as light activity. It burns about 2.2 kcal a minute for a 70 kg adult, similar to standing and washing dishes.",
    ],
    [
      "Why is carrying laundry upstairs rated so much higher?",
      "Because stair climbing with a load raises your whole body mass plus the basket against gravity. The compendium rates carrying a load upstairs at 7.5 METs, more than triple hanging wash, which is why a few minutes of stair trips can rival twenty minutes of folding.",
    ],
  ],
};

export default seo;
