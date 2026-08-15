const seo = {
  title: "Skating Calorie Burn Calculator: MET",
  metaDescription:
    "Inline, quad, ice and speed skating calories from your km/h and minutes, matched to the Compendium MET row for that discipline and pace.",
  steps: [
    "Choose a \"Discipline\" — Inline skating / rollerblading, Ice skating (recreational), Quad roller skating / rink session, or Competitive speed skating.",
    "Enter \"Body weight (kg)\", \"Average skating speed (km/h)\" and \"Time skating (minutes)\"; for inline and ice the speed selects the nearest published intensity row.",
    "Read the calories burned with \"Matched Compendium row\", \"Intensity used\" in METs, \"Distance covered\" and \"Energy per km\", then press \"Copy result\".",
  ],
  intro:
    "The Skating Calorie Burn Calculator estimates the energy cost of inline, quad and ice skating from your average speed and time on the skates, using the ACSM equation kcal/min = MET x 3.5 x body mass in kg / 200. Intensity comes from the 2011 Compendium of Physical Activities rows measured for each discipline: 7.5, 9.8, 12.3 and 14.0 METs for in-line skating at 9, 11, 13 and 15 mph, 5.5 METs for ice skating at 9 mph or less and 9.0 METs above that, 7.0 METs for quad roller skating and 13.3 METs for competitive speed skating.",
  useCases: [
    "Score an hour of inline skating on a cycle path once you know the average speed from your watch.",
    "Compare a recreational rink session on quads against the same hour spent skating hard outdoors.",
    "Check whether pushing from 16 km/h to 18 km/h on inline skates actually changes the intensity band.",
    "Work out how long a skating session needs to be to reach a 400 kcal target.",
  ],
  benefits: [
    [
      "Discipline-specific intensity",
      "Ice, inline and quad skating have separate published MET rows instead of one blanket skating value.",
    ],
    [
      "Nearest measured row",
      "In-line speeds map to the closest of the four rows that were actually measured, not an invented curve.",
    ],
    [
      "Distance and per-km cost",
      "Speed and time give the distance covered, so you also get the energy cost per kilometre skated.",
    ],
  ],
  faqs: [
    [
      "How many calories does an hour of rollerblading burn?",
      "About 551 kcal for a 70 kg skater at a recreational 14.4 km/h (9 mph) pace, which is rated 7.5 METs. Pushing to a 17.7 km/h training pace raises that to roughly 720 kcal per hour at 9.8 METs.",
    ],
    [
      "Does ice skating burn more calories than inline skating?",
      "At comparable recreational speeds, inline usually burns more. Ice skating at 9 mph or less is 5.5 METs, while in-line skating at 9 mph is 7.5 METs, because rolling resistance and the wider push cycle demand more work than gliding on a blade.",
    ],
    [
      "Is skating good cardio?",
      "Yes — even a recreational inline pace at 7.5 METs sits well inside the vigorous range used in physical activity guidelines, which classify anything at or above 6 METs as vigorous. It is also low-impact on the knees compared with running, though falls are the main injury risk, so wear a helmet and wrist guards.",
    ],
    [
      "Why does my rink session feel like it burned less than the estimate?",
      "Rink sessions are rarely continuous — coasting, queuing and standing at the barrier all drop the average intensity well below the published row. Enter only the time you were actually moving for a closer figure. All values here are population averages and informational, not medical advice.",
    ],
  ],
};

export default seo;
