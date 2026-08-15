const seo = {
  title: "Running Pace Calculator: Min/km, Min/mile & Race Times",
  metaDescription:
    "Enter distance (km) and time (minutes) to get pace per km and per mile, average speed, and predicted 5K, 10K, half marathon and marathon finish times.",
  steps: [
    "Enter your run in the 'Distance (km)' and 'Time (minutes)' boxes under Inputs — they open at 5 km and 30 minutes.",
    "The Result recomputes as you type, showing pace as 6:00 /km for the defaults with average speed as the caption — there is no calculate button.",
    "Read the cards for Pace per mile (exact 1.609344 factor), Average Speed and the 5K, 10K, Half Marathon and Marathon Predictions; Copy copies inputs and results.",
  ],
  intro:
    "The Running Pace Calculator turns a distance and a finish time into your pace per kilometre (time ÷ distance), your pace per mile using the exact 1.609344 conversion, and your average speed in km/h. It then projects finish times for 5K, 10K, the half marathon at 21.0975 km and the marathon at 42.195 km if you held that same pace throughout. It is for runners checking what today's session actually means for race day, in the units the race clock uses.",
  useCases: [
    "You ran 5 km in 30 minutes and want to know the pace that works out to, and what it would mean over a half marathon.",
    "Your watch reports minutes per mile but the race you have entered posts kilometre splits, and you need the same effort expressed both ways.",
    "You have a target marathon time in mind and want to see what per-kilometre pace it demands before deciding which pace group to join.",
  ],
  benefits: [
    [
      "Both units from one run",
      "Gives pace per km and per mile side by side using the exact 1.609344 km-per-mile factor, so the two never drift apart.",
    ],
    [
      "Race distances, not round numbers",
      "Projects against the official 21.0975 km and 42.195 km distances rather than a rounded 21 and 42.",
    ],
    [
      "States its assumption plainly",
      "The projections assume you hold the same average pace throughout, which is the honest reading of a flat pace calculation.",
    ],
  ],
  faqs: [
    [
      "How do you calculate running pace per kilometre?",
      "Divide total time by distance: 30 minutes over 5 km is 6.0 minutes per km, shown as 6:00/km. Multiply that by 1.609344 to get pace per mile — in this case about 9:39/mile — and divide distance by time in hours for speed, here 10.00 km/h.",
    ],
    [
      "What pace do I need to run a marathon in under 4 hours?",
      "Roughly 5:41 per kilometre, or about 9:09 per mile, across the full 42.195 km. Enter 42.195 km and 240 minutes to see it, and remember that most runners target a slightly faster pace early to leave a buffer.",
    ],
    [
      "Are the predicted race times realistic?",
      "They assume you hold your current average pace for the whole distance, which almost never happens over longer races — pace usually slows as distance grows. Fatigue-adjusted models such as Riegel's, which scales time by (new distance ÷ old distance) raised to about 1.06, predict longer races more conservatively. Treat these projections as an upper bound on what today's pace implies.",
    ],
    [
      "What is the difference between pace and speed?",
      "Pace is time per unit distance (minutes per km) and speed is distance per unit time (km/h), so they move in opposite directions — a faster run has a lower pace number and a higher speed. A 6:00/km pace is 10.00 km/h; 5:00/km is 12.00 km/h.",
    ],
  ],
};

export default seo;
