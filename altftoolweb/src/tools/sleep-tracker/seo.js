const seo = {
  intro:
    "The Sleep Tracking & Sleep Quality Analyzer turns a nightly log — bedtime, wake time, how long you took to fall asleep, minutes spent awake and how many times you woke — into a sleep score out of 100, built from 50 points for duration against your goal, 30 for sleep efficiency and 20 for going uninterrupted, minus 4 points per awakening. It also reports your sleep efficiency as a percentage, the debt against your nightly goal, and a 7-night duration trend. Logs stay in your browser, so you can build up a picture over weeks without handing your sleep data to anyone.",
  useCases: [
    "You are in bed a full eight hours but still waking up tired, and want to see how much of that is actual sleep once you subtract the 40 minutes spent falling asleep and the time awake at 3 a.m.",
    "You want to test whether cutting evening coffee changes anything, so you log caffeine cups alongside each night and compare scores over a fortnight.",
    "A doctor has asked how you have been sleeping, and instead of guessing you print a report of the last two weeks with bedtimes, wake times and durations.",
  ],
  benefits: [
    ["Time in bed and time asleep are separated", "Efficiency is computed as actual sleep divided by time in bed, so long unproductive nights are not counted as good sleep."],
    ["A score you can decompose", "The 100 points split explicitly into duration, efficiency and continuity, so a low score tells you which of the three is the problem."],
    ["Habits logged next to outcomes", "Caffeine, alcohol, screen time before bed, stress and room environment sit alongside each night's result, which is what makes a pattern visible."],
  ],
  faqs: [
    [
      "What is a good sleep efficiency percentage?",
      "Above 85% is the usual target — that is time actually asleep divided by time in bed. Consistently below it usually means you are spending too long in bed awake, either taking a long time to fall asleep or waking during the night.",
    ],
    [
      "How is the sleep score calculated?",
      "Out of 100: up to 50 points for duration as a share of your sleep goal, up to 30 for efficiency, and 20 for continuity with 4 points deducted per night awakening. 85 and above reads as excellent, 70 to 84 good, 60 to 69 fair, below 60 poor.",
    ],
    [
      "Why does my score drop when I sleep the same number of hours?",
      "Because duration is only half the score. Five awakenings wipes out the full 20-point continuity block, and lying awake pushes efficiency down even when total sleep is unchanged — fragmented sleep of the same length scores lower, which matches how it feels.",
    ],
    [
      "Is this a medical sleep study?",
      "No. It records what you enter and does not measure sleep stages, breathing or heart rate, and it cannot diagnose anything. Loud snoring with daytime sleepiness, insomnia lasting more than a few weeks, or unexplained exhaustion should be discussed with a doctor, who may order a proper sleep study.",
    ],
  ],
};

export default seo;
