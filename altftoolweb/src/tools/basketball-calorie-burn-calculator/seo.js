const seo = {
  intro:
    "The Basketball Calorie Burn Calculator estimates how many calories a game, pick-up run, practice or shooting session costs, from your body weight and minutes on the floor. It applies the MET equation kcal/min = MET x 3.5 x kg / 200 with published Compendium of Physical Activities values: 8.0 METs for a full-court game, 6.0 for non-game half-court play, 9.3 for structured drills, 4.5 for shooting baskets and 7.8 for wheelchair basketball. Bench time is priced separately at the 1.3 MET standing rate so a substitute's total is not inflated.",
  useCases: [
    "Work out what 40 minutes of a FIBA game costs against 40 minutes of half-court pick-up.",
    "Estimate a rotation player's burn when 25 minutes were on court and 15 on the bench.",
    "Compare a drills-heavy practice with an actual game at the same body weight and duration.",
    "Show a beginner that an hour of shooting around is roughly half the burn of a full-court game.",
  ],
  benefits: [
    ["Five published intensities", "Game, pick-up, drills, shooting and wheelchair basketball each use their own Compendium value."],
    ["Bench time separated", "Minutes off the floor are counted at the standing rate rather than the game rate."],
    ["Per-quarter figure", "Breaks the total down per 10-minute quarter for easy scaling."],
  ],
  faqs: [
    [
      "How many calories does an hour of basketball burn?",
      "About 670 kcal for an 80 kg player in a full-court game, using the Compendium's 8.0 MET value. Half-court pick-up at 6.0 METs comes to roughly 500 kcal an hour, and structured drills at 9.3 METs reach about 780 kcal.",
    ],
    [
      "Does practice burn more calories than a game?",
      "Often yes, per minute. The Compendium rates basketball drills and practice at 9.3 METs against 8.0 for a game, because practice keeps players moving continuously while games include free throws, timeouts and dead-ball stoppages.",
    ],
    [
      "Should I use the game clock or the elapsed time?",
      "Use the minutes you were actually on the floor. A 40-minute FIBA game clock typically runs 90 to 120 minutes of real time, and counting all of that at the game MET would badly overstate the burn.",
    ],
    [
      "Why do heavier players burn more calories in the same game?",
      "The MET equation scales directly with body mass, so moving a heavier body over the same court costs more energy. At 8.0 METs an hour of play is about 420 kcal for a 50 kg player and about 840 kcal for a 100 kg player. Treat all such figures as informational and speak to a professional before using them for weight decisions.",
    ],
  ],
};

export default seo;
