const seo = {
  intro:
    "The Cricket Calorie Burn Calculator costs a match role by role instead of applying one number to the whole game. The Compendium of Physical Activities gives cricket a single 4.8 MET value (code 15200) covering batting, bowling and fielding together, which flattens the difference between a fast bowler's twenty overs and an afternoon at deep midwicket. This tool keeps 4.8 as the whole-game anchor but splits the day into bowling, batting, fielding and time padded up, converting each with the ACSM equation kcal/min = METs x 3.5 x kg / 200.",
  useCases: [
    "Work out what a full Sunday league day actually cost you, including the hours sat waiting to bat.",
    "Compare a twenty-over fast-bowling spell against the same time spent fielding in the deep.",
    "Add up the distance you ran between the wickets across an innings — every completed run is 17.68 m.",
    "Give a club coach a defensible number for the training load of a match day.",
  ],
  benefits: [
    [
      "Role by role",
      "Fast bowling, spin, wicketkeeping, close fielding and deep fielding all carry different intensities.",
    ],
    [
      "Counts the dead time honestly",
      "Time padded up in the pavilion is costed at 1.5 METs rather than quietly ignored or overstated.",
    ],
    [
      "Real cricket units",
      "Takes overs rather than minutes for bowling, and converts runs into metres using the 17.68 m between creases.",
    ],
  ],
  faqs: [
    [
      "How many calories does a cricket match burn?",
      "For a 75 kg club player fielding for three hours, batting for 45 minutes, bowling ten overs of medium pace and waiting an hour to bat, the estimate is about 1,730 kcal across the day, of which roughly 1,310 kcal is above resting metabolism. Fast bowlers doing a long spell come out considerably higher, and a batter dismissed early considerably lower.",
    ],
    [
      "Is cricket good exercise?",
      "It depends entirely on your role. Fast bowling is genuinely demanding, at roughly 8.5 METs during a spell — comparable to running — while fielding in the deep sits closer to 3.8 METs, which is only light activity. The length of a match means even the light roles accumulate a large total, but the sport is far better at building volume than intensity.",
    ],
    [
      "How far does a batter run in an innings?",
      "Each completed run covers 17.68 m, the distance between the popping creases, since the pitch is 22 yards (20.12 m) stump to stump and each crease sits four feet in front of the stumps. A batter who runs 50 of their runs therefore covers about 884 m, before counting the walking and repositioning between deliveries.",
    ],
    [
      "Do bowlers burn more calories than batters?",
      "Per minute of activity, yes — fast bowling is estimated here at 8.5 METs against 5.5 for batting — but a bowler is only working during their overs while a batter can occupy the crease for hours. Over a full day the totals often converge, which is why costing the time in each role separately gives a more useful answer than either figure alone.",
    ],
  ],
};

export default seo;
