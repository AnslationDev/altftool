const seo = {
  title: "Cognitive Performance Tracker: Daily 0-100 Score",
  metaDescription:
    "Log sleep, water, mood, energy, exercise and meditation; get a 0-100 daily score, a 7-day trend and up to 365 days of history. Not a medical test.",
  intro:
    "The Cognitive Performance Tracker logs a daily check-in across eight habit inputs — sleep, water, mood, energy, study hours, work hours, exercise and meditation — and turns six of them into a single 0-100 daily score, then charts how that score moves over weeks. It is a self-tracking log for students, shift workers and anyone trying to see which habits line up with their sharper days; it is informational and not a clinical or diagnostic assessment. Check-ins, goals and badges are kept in your browser's local storage, up to 365 days.",
  useCases: [
    "You suspect that nights under six hours of sleep wreck the next day's focus, and you want a month of your own data instead of a hunch.",
    "You are in an exam term and want to see whether the days you meditated or exercised actually scored higher than the days you only added study hours.",
    "You changed one thing — cut caffeine, moved your workout to the morning — and want to compare the last seven days against the seven before.",
  ],
  benefits: [
    ["A defined scoring rule, not a vibe", "The daily score is the plain average of the sub-scores you filled in, so a blank field is skipped rather than counted as zero."],
    ["Trend detection with a threshold", "The insights view calls your trend improving or declining only when the last 7 days differ from the previous 7 by more than 5 points."],
    ["A year of history in one chart", "Check-ins are stored for up to 365 days and the timeline chart plots score, sleep, mood, energy and exercise for the most recent 30."],
  ],
  faqs: [
    [
      "How is the daily score calculated?",
      "It is the average of six sub-scores, each on a 0-100 scale: sleep, water, mood, energy, exercise and meditation. Sleep scores 100 at 7-9 hours, 70 at 6 or more, and 40 below that; water hits 100 at 8 glasses, exercise at 45 minutes, meditation at 20 minutes; mood and energy are the 1-5 rating divided by 5.",
    ],
    [
      "How many days do I need to log before I see insights?",
      "Three. Below that the insights panel just tells you to keep logging. Trend direction needs more — it compares your most recent 7 check-ins against the 7 before them, so it becomes meaningful around two weeks in.",
    ],
    [
      "How does the streak work, and can I edit a past day?",
      "The streak counts back from today and stops at the first missed calendar day, so a single skipped day resets it. Saving a check-in for a date you already logged overwrites that entry rather than adding a duplicate, so you can correct yesterday's numbers.",
    ],
    [
      "Is this a cognitive or medical test?",
      "No. It records habits you enter yourself and scores them against general wellness reference points such as 7-9 hours of sleep and 30-plus minutes of exercise; it does not measure cognition and diagnoses nothing. Talk to a doctor about persistent problems with memory, concentration, mood or sleep.",
    ],
  ],
};

export default seo;
