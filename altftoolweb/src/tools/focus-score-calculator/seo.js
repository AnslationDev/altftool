const seo = {
  intro:
    "This calculator turns five everyday habits into a single focus score out of 100, weighting sleep 35 points, non-work screen time 25, exercise 20 and deep-work sessions 20. You answer five questions — sleep duration, sleep quality, daily non-work screen hours, exercise frequency and how often you protect uninterrupted blocks — and get a numbered score, a band from Depleted to Elite Focus, a breakdown of where the points came from, and tips aimed at whichever category scored lowest. It is a self-reflection aid, not a clinical or diagnostic assessment.",
  useCases: [
    "You have had three unproductive weeks and want to see whether the bigger drag is your 6-hour nights or the four extra hours of evening scrolling",
    "You are deciding what to change first — an earlier bedtime or a standing gym slot — and want the weighting laid out instead of guessing which matters more",
    "You want a baseline number before a 30-day habit experiment, so you can rerun the same five questions afterwards and compare the score",
  ],
  benefits: [
    ["Shows the weighting, not just a verdict", "The donut breaks the total into Sleep, Digital Habits, Physical Activity and Deep Work, so you can see which category cost you the points."],
    ["Penalises screen time on a stated curve", "Non-work screen hours above two subtract 2.5 points each, so the trade-off between an extra hour and your score is explicit."],
    ["Tips fire off thresholds, not vibes", "Advice only appears for categories that fall below their cut-off, so you are not handed five generic suggestions at once."],
  ],
  faqs: [
    [
      "How is the focus score calculated?",
      "Out of 100, split across four categories: sleep 35 points (20 for duration, 15 scaled from your quality rating), non-work screen time 25, exercise frequency 20 and deep-work sessions 20. The four sub-scores are added and rounded to give the final number.",
    ],
    [
      "What is a good focus score?",
      "85 and above is the top band, labelled Elite Focus. 70 to 84 is Good Focus, 50 to 69 is Average, and anything under 50 is flagged as Depleted. The bands are for comparing your own results over time, not for ranking yourself against anyone else.",
    ],
    [
      "How much sleep gets the full duration points?",
      "Seven to nine hours scores the full 20. Six to seven hours or more than nine scores 15, five to six scores 8, and under five scores zero. Sleep quality is rated separately on a four-step scale worth up to 15 more points.",
    ],
    [
      "Why does screen time cost me so many points?",
      "Because the score allows two hours of non-work screen time for free and then removes 2.5 points for every hour beyond that, down to a floor of zero. Twelve hours a day therefore wipes out the whole 25-point category. Work screens are not counted — answer for leisure use only.",
    ],
  ],
};

export default seo;
