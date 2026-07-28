const seo = {
  intro:
    "The Ballet Calorie Burn Calculator splits a class into barre, centre, petit allegro, pointe and grand allegro, prices each part at its own MET value and adds them up with the ACSM equation kcal/min = MET x 3.5 x kg / 200. The Compendium of Physical Activities rates ballet class or rehearsal at 5.0 MET and vigorous ballet performance at 6.8 MET, and the segments here sit around those two published anchors so a barre-heavy class and a jump-heavy rehearsal produce different answers.",
  useCases: [
    "Log a 65-minute open class where half the time was spent at the barre.",
    "Compare a technique class against a repertoire rehearsal with 25 minutes of grand allegro.",
    "Add up the weekly energy cost of three classes plus a pointe session.",
    "Check how many of your ballet minutes each week actually reach the vigorous-intensity threshold.",
  ],
  benefits: [
    ["Class structure, not an average", "Barre at 4.0 MET and grand allegro at 6.8 MET are counted separately."],
    ["Class templates built in", "Presets for a 60-minute open class, a 90-minute technique class, pointe and rehearsal."],
    ["Weekly activity view", "Reports weekly calories and the minutes that count as vigorous intensity."],
  ],
  faqs: [
    [
      "How many calories does a ballet class burn?",
      "A 65-minute class with 30 minutes of barre, 10 of centre, 15 of petit allegro and 10 of grand allegro burns roughly 280 kcal for a 52 kg dancer, an average of about 4.7 MET. A rehearsal weighted toward pointe and grand allegro burns roughly 19% more per minute than that same class.",
    ],
    [
      "Does barre work count as cardio?",
      "Only as light-to-moderate activity. Barre sits around 4.0 MET — below the 6 MET vigorous threshold but above the 3 MET line for moderate activity, so it counts toward the 150 minutes of moderate activity per week in the WHO guidelines rather than the vigorous target.",
    ],
    [
      "Is ballet a good way to lose weight?",
      "It contributes, but energy balance across the whole week decides weight change, not any one class. Three 65-minute classes a week is roughly 840 kcal for a 52 kg dancer — meaningful, but smaller than most people expect from an hour that feels demanding.",
    ],
    [
      "Why do MET tables seem low for grand allegro?",
      "MET values are derived from steady-state oxygen uptake, which is a poor fit for the short, explosive jumps of allegro and does not capture the elevated oxygen consumption in the minutes afterwards. Treat the grand allegro figure as a conservative floor.",
    ],
  ],
};

export default seo;
