const seo = {
  intro:
    "Swim pace is time per 100, calculated as total time multiplied by 100 and divided by the distance swum — a 400 in 6:00 is a pace of 1:30 per 100. This calculator returns that pace along with per-50 and per-25 splits, speed in metres per second, the number of lengths in your pool and the time each length takes. It then predicts times at 50 through 1500 and at triathlon swim distances using Riegel's endurance equation with a swim-appropriate fatigue exponent of 1.03.",
  useCases: [
    "Convert a 400 m time trial into the per-100 pace you need to hold in a set of repeats.",
    "Work out the seconds per length to aim for in a 25 m pool during a threshold set.",
    "Estimate an Olympic-distance triathlon swim split from a recent 400 m swim.",
    "Compare short-course yard times with metric paces when switching pools.",
  ],
  benefits: [
    ["Pace in swimmers' units", "Per 100, per 50 and per 25 in the same unit as your pool, plus metres per second."],
    ["Realistic distance predictions", "Uses a swim fatigue exponent of 1.03 rather than the running value of 1.06."],
    ["Pool-aware", "Handles 25 m, 50 m, 33.3 m and 25-yard pools and reports lengths and time per length."],
  ],
  faqs: [
    [
      "How do you calculate swim pace per 100 m?",
      "Multiply your total time by 100 and divide by the distance. Swimming 400 m in 6 minutes (360 seconds) gives 360 x 100 / 400 = 90 seconds, which is a pace of 1:30 per 100 m.",
    ],
    [
      "Is a 2:00 per 100 m pace good?",
      "For a recreational adult swimmer, 2:00 per 100 m is a solid steady pace; competent club swimmers hold closer to 1:30 and trained competitive swimmers well under 1:20 for repeats. Compare against your own previous times rather than a single benchmark, since stroke and distance change the picture.",
    ],
    [
      "How do I predict a longer swim time from a shorter one?",
      "Use Riegel's equation: the new time equals the old time multiplied by the distance ratio raised to a fatigue exponent. Swimming uses a lower exponent than running — around 1.02 to 1.03 — because drag rather than fuel limits pace, so a 6:00 for 400 m predicts roughly 23:25 for 1500 m.",
    ],
    [
      "Are 25 yard and 25 metre pool times comparable?",
      "Not directly. A yard is 0.9144 metres, so 100 yards is about 8.6 percent shorter than 100 metres and the times are correspondingly faster. Select the pool unit here and the distance in metres is shown alongside so you can compare properly.",
    ],
  ],
};

export default seo;
