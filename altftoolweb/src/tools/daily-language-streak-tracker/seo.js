const seo = {
  title: "Daily Language Streak Tracker with Rest Days",
  metaDescription:
    "Log minutes per language and track current streak, longest streak and goal adherence. A day counts once minutes hit your goal; 0-3 rest days allowed.",
  steps: [
    "Set your Daily goal (minutes) between 1 and 600, and choose how many rest days a streak may survive — none up to 3.",
    "Log each session with its date, language and Minutes studied (1 to 1440), then press Add session.",
    "Read your current streak, longest streak and goal adherence, and press Copy result to copy the text summary.",
  ],
  intro:
    "This tracker logs the minutes you spend on each language per day and reports your current streak, longest streak and goal adherence. A calendar day counts towards the streak once the minutes logged for that date reach the daily goal you set, today is never scored as a miss until it is over, and an optional rest-day allowance lets a run survive one to three missed days. Aimed at self-taught learners who want an honest picture of consistency rather than a badge.",
  useCases: [
    "Hold a 20-minute-a-day Spanish habit and see immediately how many minutes are still needed today to keep the streak.",
    "Study two languages at once and switch between counting them together and counting only one towards the streak.",
    "Allow yourself one rest day a week without losing a 40-day run, and see how the streak looks under both rules.",
    "Check the last-30-days total before a class to see whether your real study time matches what you told your tutor.",
  ],
  benefits: [
    ["Clear counting rule", "A day counts when logged minutes reach the goal, so the streak number can always be checked by hand."],
    ["Per-language view", "Filter to one language to see that language's own streak, minutes and adherence on their own, separate from your combined total across every language you log."],
    ["Adherence, not just streaks", "Shows days met against days elapsed, which is the number that predicts progress."],
  ],
  faqs: [
    [
      "How many minutes a day should I study a language?",
      "Consistency matters more than length: 15 to 30 minutes every day generally beats three hours once a week, because spaced review is what moves vocabulary into long-term memory. Set the goal at a level you can hit on your worst day, then log extra time when you have it.",
    ],
    [
      "Does missing one day reset the streak?",
      "With the default setting, yes. Set the rest-day allowance to 1, 2 or 3 and a run survives that many missed days before it breaks; frozen days do not add to the streak length. Today is not counted as a miss until the date changes, so a streak is only flagged at risk, never broken, mid-day.",
    ],
    [
      "What counts as language study?",
      "Anything you can honestly attribute to the language: flashcards, a lesson, reading, a podcast you actively followed, or a conversation. Passive background listening is usually not worth logging, because it does not produce the retrieval practice that makes the time count.",
    ],
    [
      "Is my study data saved anywhere?",
      "No. Sessions are held in the browser tab and disappear on refresh. Nothing is uploaded to a server and no account is needed, so copy the summary if you want a record.",
    ],
  ],
};

export default seo;
