const seo = {
  intro:
    "This converter turns a counted number of pool laps into metres, kilometres, yards and miles for any lane length, using the exact international yard (0.9144 m) and statute mile (1609.344 m). Because 'lap' means one length to competitive swimmers and a there-and-back to most gym swimmers, you choose the convention first and the maths follows it. Add your total swim time and it also returns pace per 100 m and average speed.",
  useCases: [
    "Work out whether the 32 lengths you swam in a 25 m pool actually made the 800 m you were aiming for.",
    "Convert a US short-course-yards session (25 yd lanes) into metres so it lines up with a metric training plan.",
    "Find how many laps of a 15 m hotel pool add up to the 1500 m metric swim mile while travelling.",
    "Check pace per 100 m for a 1 km set to see if you are on track for an open-water event cut-off.",
  ],
  benefits: [
    [
      "Settles the lap argument",
      "Pick 1 lap = 1 length or 1 lap = down and back, and every figure updates to match.",
    ],
    [
      "Exact unit constants",
      "Yards and miles use the 1959 international definitions, not rounded approximations.",
    ],
    [
      "Goal and pace in one view",
      "Shows laps remaining to your target distance and pace per 100 m from your session time.",
    ],
  ],
  faqs: [
    [
      "Is a lap in a pool one length or two?",
      "In competitive swimming a lap is one length — the distance from one end wall to the other — which is why races are described as 25 m or 50 m per length. Recreational swimmers and most gym signage use lap to mean down and back, or 2 lengths. This tool asks you which convention you are counting in before converting.",
    ],
    [
      "How many laps is 1 km in a 25 m pool?",
      "1 km is 40 lengths of a 25 m pool, which is 40 laps if you count each length as a lap or 20 laps if a lap means there and back. In a 50 m Olympic pool it is 20 lengths, and in a 25 yd pool it is about 43.7 lengths because 25 yd is only 22.86 m.",
    ],
    [
      "How far is a swimming mile?",
      "There are two: the metric swim mile of 1500 m used in Olympic and open-water events, and the US 'swimmer's mile' of 1650 yd (1508.76 m) swum in short-course-yards pools. Neither equals a true statute mile of 1609.344 m, which is 1760 yd.",
    ],
    [
      "What is a good pace per 100 m for a lap swimmer?",
      "Recreational lap swimmers commonly cover 100 m in about 2:00 to 2:30 of freestyle, fitness swimmers around 1:30 to 2:00, and trained club swimmers under 1:30. Pace depends on stroke, rest between lengths and pool length, so compare your own trend over weeks rather than against a single benchmark.",
    ],
  ],
};

export default seo;
