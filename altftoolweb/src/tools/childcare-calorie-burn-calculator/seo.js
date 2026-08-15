const seo = {
  title: "Childcare Calorie Burn Calculator: MET-Based",
  metaDescription:
    "Calories from feeding, standing care, pram walking and play using published MET values, counting only the active share of playtime at play intensity.",
  steps: [
    "Enter Body weight and pick kg or lb, then fill the minutes boxes for seated or kneeling care (2.0 MET), standing care (3.0), housework with a toddler in tow (3.5), pram walking (4.0), moderate play (3.5) and vigorous play (5.8).",
    "Set Active share of play (%) — 60 by default — so the rest of playtime is credited at the 1.3 MET standing-quietly value instead of the play MET, and set Days per week; every figure recalculates as you type.",
    "Read Daily gross calories in kcal with the kcal-above-resting line beneath it, then the Average MET, Weekly gross, Weekly net and Year gross tiles; the Reset button restores the 70 kg and 60% defaults.",
  ],
  intro:
    "This calculator estimates the calories a day of looking after young children costs, using kcal/min = MET x 3.5 x kg / 200 with the published child-care MET values: 2.0 for seated or kneeling care such as feeding and dressing, 3.0 for standing care, 4.0 for walking with a pram, 3.5 for moderate active play and 5.8 for vigorous play. Crucially, the compendium defines those play values for active periods only, so the tool asks what share of playtime is genuinely active and credits the rest at the 1.3 MET standing-quietly value instead of inflating the total. That makes it useful for parents and carers who want a realistic number rather than a flattering one.",
  useCases: [
    "Estimate what a full day at home with a toddler adds to daily energy expenditure when you are new to tracking activity.",
    "Compare a pram-heavy day out against a mostly indoor day of feeding and floor play.",
    "Sanity-check a fitness tracker that credits an entire afternoon of childcare as continuous moderate exercise.",
  ],
  benefits: [
    [
      "Active-periods correction",
      "Playtime is split into genuinely active minutes and supervising minutes, which is how the source values are defined.",
    ],
    [
      "Six distinct care activities",
      "Seated care, standing care, chores with a child in tow, pram walking and two levels of play each carry their own MET value.",
    ],
    [
      "Effective MET per activity",
      "The breakdown shows the intensity you actually averaged for each activity after the active-share correction.",
    ],
  ],
  faqs: [
    [
      "How many calories does looking after a toddler burn?",
      "Roughly 600 kcal for a busy three-hour stretch at 70 kg body weight — about 400 kcal of that above resting metabolism. It depends heavily on how much of the time is active: an hour of play credited at 100% active gives about 257 kcal, while the same hour at 60% active gives about 193 kcal.",
    ],
    [
      "Does childcare count as moderate-intensity exercise?",
      "Parts of it do. Standing care is 3.0 METs, moderate active play is 3.5 and pram walking is 4.0, all of which sit in the 3.0 to 5.9 MET moderate band. Seated feeding and dressing at 2.0 METs is light activity and does not count toward weekly activity targets.",
    ],
    [
      "Why does the calculator ask what share of playtime is active?",
      "Because the source values for playing with children are explicitly defined for active periods only. An hour on the floor typically includes long stretches of sitting and watching, and counting the whole hour at 3.5 METs can overstate the burn by 30 to 40 percent.",
    ],
    [
      "Is pushing a pram good exercise?",
      "It is reasonable moderate activity — pushing a stroller at 2.5 to 3 mph is rated 4.0 METs, slightly above walking the same pace unloaded, because you are also moving the pram and child. Thirty minutes at 70 kg is about 147 kcal.",
    ],
  ],
};

export default seo;
