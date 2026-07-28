const seo = {
  intro:
    "The Cooper Test VO2 Max Calculator converts the distance you cover in a 12-minute run into an estimated maximal oxygen uptake using Kenneth Cooper's 1968 regression: VO2 max in ml/kg/min equals the distance in metres minus 504.9, divided by 44.73. Alongside the estimate it reports average speed, pace per kilometre, aerobic capacity in METs, and where the distance falls in Cooper's published rating bands for your age and sex. All you need is a flat measured course, a stopwatch and 12 minutes of honest effort.",
  useCases: [
    "Setting a baseline aerobic fitness figure before a training block, then repeating the test 8-12 weeks later.",
    "Estimating VO2 max without a laboratory treadmill test or a chest-strap heart rate monitor.",
    "Working out how many laps of a 400 m track a target distance actually means before you start.",
    "Preparing for a fitness entry standard where a 12-minute run distance is the assessed measure.",
  ],
  benefits: [
    ["The published equation", "Uses Cooper's original (distance − 504.9) ÷ 44.73 formula and cross-checks it against his imperial version."],
    ["Rating for your group", "Shows the full Cooper distance band table for your age and sex, with your result highlighted."],
    ["Pace you can train to", "Converts the distance into km/h and min/km so the test doubles as a pace reference."],
  ],
  faqs: [
    [
      "What is the formula for the Cooper 12-minute run test?",
      "VO2 max in ml/kg/min = (distance in metres − 504.9) ÷ 44.73. Covering 2,400 m in 12 minutes therefore gives about 42.4 ml/kg/min. Cooper also published an imperial form, VO2 max = 35.97 × miles − 11.29, which agrees to within about 0.1.",
    ],
    [
      "What is a good Cooper test distance?",
      "It depends on age and sex. For men aged 20-29, Cooper's bands put 2,400-2,800 m as above average and more than 2,800 m as excellent; for women in the same band, 2,200-2,700 m is above average and above 2,700 m excellent. Both thresholds fall by roughly 100-200 m per decade after 30.",
    ],
    [
      "How accurate is a VO2 max estimated from a 12-minute run?",
      "It is a field estimate, typically within a few ml/kg/min of a laboratory test when the effort is genuinely maximal and the course is flat. Heat, wind, hills, poor pacing and running on grass all shorten the distance, so repeat the test under the same conditions if you want to compare two results.",
    ],
    [
      "Can I walk during the Cooper test?",
      "Yes — the test measures distance covered in 12 minutes, not continuous running, and walking sections still count. That makes it usable across a wide fitness range. It is still a maximal-effort test though, so check with a doctor first if you are inactive, unwell, pregnant, or have a heart, lung or joint condition, and stop if you feel chest pain or dizziness.",
    ],
  ],
};

export default seo;
