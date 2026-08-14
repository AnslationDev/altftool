const seo = {
  title: "VO2 Max Estimator: Cooper, Rockport and Step Test",
  metaDescription:
    "VO2 max in ml/kg/min from a Cooper 12-minute run, 1.5-mile run, Rockport walk, Queens College step test or resting heart rate, rated on Cooper norms.",
  intro:
    "The VO2 Max Estimator converts a simple field test into an estimate of your maximal oxygen uptake in ml/kg/min, then places it on the Cooper Institute norm table for your age and sex. It implements five published equations — the Cooper 12-minute run, the 1.5-mile run, the Rockport 1-mile walk (Kline 1987), the Queens College step test (McArdle 1972) and the resting heart-rate method (Uth 2004) — so you can pick whichever test you can actually do. It is for runners, cyclists and anyone tracking aerobic fitness without lab access.",
  useCases: [
    "A runner who just covered 2,400 m in a 12-minute Cooper test and wants the VO2 max figure and fitness rating that goes with it.",
    "Someone returning from injury who can only walk, using the Rockport 1-mile walk time and finishing heart rate instead of a run.",
    "Comparing an estimate from a step test against one from resting heart rate to see how consistent the two methods are.",
  ],
  benefits: [
    ["Five real equations", "Cooper, 1.5-mile, Rockport, Queens College and Uth resting-HR, each used exactly as published."],
    ["Rated, not just numbered", "Your score is placed in the Very poor to Superior bands of the Cooper Institute table for your age and sex."],
    ["METs and litres too", "Converts the result to METs (1 MET = 3.5 ml/kg/min) and, with body weight, to absolute litres of oxygen per minute."],
  ],
  faqs: [
    [
      "How do you calculate VO2 max from the Cooper 12-minute run?",
      "VO2 max = (distance in metres - 504.9) / 44.73. Covering 2,400 m in 12 minutes gives (2400 - 504.9) / 44.73 = 42.4 ml/kg/min. The test was published by Kenneth Cooper in JAMA in 1968 and assumes an all-out, evenly paced effort.",
    ],
    [
      "What is a good VO2 max for my age?",
      "On the Cooper Institute norms, a man aged 30-39 needs 41.0 ml/kg/min to reach Good and 49.5 to reach Superior; a woman of the same age needs 31.5 and 40.1. The thresholds fall with age — for men aged 60+ Good starts at 32.3 ml/kg/min.",
    ],
    [
      "Can I estimate VO2 max without doing a test?",
      "Yes, approximately. The Uth-Sorensen-Overgaard-Pedersen method uses VO2 max = 15.3 x (HRmax / HRrest). With a maximum heart rate of 190 and a resting rate of 60 that is 48.5 ml/kg/min. It is the least precise of the five methods because resting heart rate varies with sleep, caffeine and stress.",
    ],
    [
      "How many METs is my VO2 max?",
      "Divide by 3.5, since one metabolic equivalent is defined as 3.5 ml of oxygen per kg per minute. A VO2 max of 42.4 ml/kg/min is 12.1 METs, meaning your peak effort is about 12 times your resting metabolic rate.",
    ],
  ],
};

export default seo;
