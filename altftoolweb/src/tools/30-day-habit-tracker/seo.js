const seo = {
  intro:
    "A 30-day habit tracker that gives one habit a fixed 30-square grid and marks each day completed, skipped or still pending, then derives a completion rate, a current streak and a longest streak from those marks. Every day can carry a short note, so you record not just whether you kept the habit but what got in the way. Each habit also stores a start date and a reward you have promised yourself for finishing the run, and the whole board can be exported as a plain-text progress report.",
  useCases: [
    "You have promised yourself you will read every day for a month and want a single page that shows, on day 19, exactly how many days you actually kept and where the chain broke",
    "You are trying to work out why a habit keeps collapsing, so you log a note on each skipped day and read them back to see whether it is always the same weekday or the same excuse",
    "You want to hand a coach, an accountability partner or your own journal a plain-text summary of the month rather than a screenshot of a grid",
  ],
  benefits: [
    ["Skipped is not the same as pending", "A day you deliberately missed and a day you have not reached yet are tracked separately, so the completion rate is not quietly inflated by future days."],
    ["Two streaks, not one", "Longest streak measures the best run anywhere in the 30 days; current streak only counts if your last completed day is today or yesterday, so a stale chain does not keep showing as active."],
    ["Notes attached to the day, not the habit", "Each square holds its own comment, which is what makes the exported report useful for spotting patterns instead of just a score."],
  ],
  faqs: [
    [
      "Does it really take 30 days to build a habit?",
      "No — 30 days is a convenient commitment window, not a scientific threshold. The often-repeated 21-day figure comes from a 1960s surgeon's observation about patients adjusting to appearance changes, not from habit research, and later studies found automaticity takes anywhere from a few weeks to several months depending on the behaviour. A 30-day block is useful because it is short enough to finish and long enough to show a pattern.",
    ],
    [
      "What happens to my streak if I miss one day?",
      "The streak resets to zero. Any day marked skipped or left pending breaks the run, so the longest streak is the best unbroken block of completed days across the 30. The completion rate is separate and is unaffected by where the gaps fall — 24 completed days is 80% whether they are consecutive or scattered.",
    ],
    [
      "Where is my data stored, and will I lose it?",
      "It is saved in your browser's local storage on this device only. Nothing is uploaded and there is no account, so clearing site data, switching browsers or using a private window will lose the board. Export the text report if you want a copy that survives.",
    ],
    [
      "Can I track more than one habit at a time?",
      "Yes, you can add several habits and switch between them, each with its own 30-day grid, start date, category and reward. Tracking two or three at once is usually the practical limit, though — the more simultaneous habits you start, the more likely all of them stall.",
    ],
  ],
};

export default seo;
