const seo = {
  title: "Table Tennis Calorie Calculator",
  metaDescription:
    "Calories from kcal/min = MET × 3.5 × kg / 200, using the Compendium's 4.0 METs for table tennis and 1.3 for standing between games.",
  steps: [
    "Enter Body weight in kg or lb, then pick How hard were you playing? — Casual / social rallying (4.0 MET), Club practice with multiball drills (5.0 MET) or Competitive match play (6.0 MET).",
    "Set Games played, Average minutes per game and Total break time between games (minutes); break time is priced at 1.3 METs, not the playing rate.",
    "Read Total calories burned with the playing-minutes split and the MET basis line underneath, then press Copy result.",
  ],
  intro:
    "The Table Tennis Calorie Calculator estimates the energy cost of a table tennis session from your body weight, the number of games, minutes per game and time spent waiting between them. It applies the MET equation kcal/min = MET x 3.5 x kg / 200, anchored on the Compendium of Physical Activities value of 4.0 METs for table tennis, with higher settings for drill work and competitive match play. It is useful for office players, club members and coaches who want the burn split between real play and standing around.",
  useCases: [
    "Price a lunchtime office session of six quick games with plenty of chat between points.",
    "Compare a club night of multiball drills against the same length of casual rallying.",
    "Estimate the calorie cost of a five-game competitive match at your own body weight.",
    "Show that a two-hour table booking with only 45 minutes of play is not a two-hour workout.",
  ],
  benefits: [
    ["Play and breaks separated", "Standing between games is priced at 1.3 METs so totals are not inflated."],
    ["Per-game number", "Splits the session into a per-game figure you can scale to any night's play."],
    ["Transparent sourcing", "States which MET values come from the Compendium and which are interpolated."],
  ],
  faqs: [
    [
      "How many calories does table tennis burn per hour?",
      "About 275 kcal an hour for a 65 kg player at the Compendium's 4.0 MET rating for table tennis. Competitive match play modelled at 6.0 METs takes the same player closer to 410 kcal an hour of actual play.",
    ],
    [
      "Is table tennis a good workout?",
      "It is a moderate-intensity activity at 4.0 METs, on par with brisk walking, so it counts towards the WHO target of 150 to 300 weekly minutes of moderate activity. Competitive play with long rallies and heavy footwork pushes into the vigorous range.",
    ],
    [
      "How long is a game of table tennis?",
      "A game to 11 points typically runs 6 to 12 minutes depending on rally length and how quickly players serve, and a best-of-five match usually lands between 30 and 50 minutes including changeovers.",
    ],
    [
      "Why is the total lower than my fitness tracker says?",
      "Trackers usually count the whole time you were at the table, including breaks, and infer effort from heart rate. This calculator prices only your stated playing minutes at the activity MET and the rest at the standing rate, which is normally the more conservative answer. Treat both as informational.",
    ],
  ],
};

export default seo;
