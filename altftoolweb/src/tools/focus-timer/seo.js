const seo = {
  intro:
    "A focus timer that runs Pomodoro-style focus and break cycles and scores each session on what you actually did: +20 for finishing a focus block, +10 for taking the break, -5 each time you tap 'I got distracted' and -10 if you abandon a running session. It ships with three presets — Pomodoro 25/5, Deep Work 50/10 and Quick Focus 15/3 — plus a custom option from one minute upwards, and keeps a daily streak, a session count and per-day stats in your browser's own storage. Optional rain, forest or ocean loops play during focus and pause automatically on break.",
  useCases: [
    "You keep starting 25-minute blocks and quietly bailing at minute nine, and you want a session score that records the abandon instead of letting you restart clean",
    "You are trying to work out whether you actually get distracted every few minutes or just feel like it, so you tap the distraction button and read the average gap it calculates",
    "You want a long-form 50/10 Deep Work cycle to auto-chain all afternoon, with a three-second countdown before each next block so you can cancel if a call comes in",
  ],
  benefits: [
    ["Scores the session, not just the clock", "Completing, breaking, getting distracted and quitting all move a 0-100 session score, so a finished block and an abandoned one do not look the same."],
    ["Counts distractions with timing", "Each tap is stamped against elapsed time and the tracker reports the average interval between them, so you get a rate rather than a tally."],
    ["Streaks and levels persist locally", "Daily stats, streak and a ten-level ladder from Beginner to Focus Master are stored in your browser, so progress survives a refresh without an account."],
  ],
  faqs: [
    [
      "What are the preset timer lengths?",
      "Three: Pomodoro at 25 minutes focus with a 5-minute break, Deep Work at 50/10, and Quick Focus at 15/3. A Custom option takes any focus length from 1 minute upward and any break length including zero, which turns off breaks entirely.",
    ],
    [
      "How does the session score work?",
      "It starts at zero and is clamped between 0 and 100. Finishing a focus block adds 20, completing a break adds 10, each distraction you log subtracts 5, and resetting a focus session while it is running subtracts 10 and clears your streak.",
    ],
    [
      "How do I keep my streak going?",
      "Complete at least one focus session on consecutive days. The streak increments once per day and is kept only if your last recorded session was today or yesterday — miss a full day and it drops back to zero. Resetting a running focus session also clears it.",
    ],
    [
      "How many sessions does each level need?",
      "Ten levels, keyed to lifetime completed sessions: Level 1 Beginner at 0, then 5, 10, 20, 35, 50, 70, 100, 150, and Level 10 Focus Master at 200 sessions. The totals come from per-day stats held in your browser, so clearing site data resets them.",
    ],
  ],
};

export default seo;
