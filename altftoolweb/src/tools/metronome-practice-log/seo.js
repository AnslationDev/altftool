const seo = {
  title: "Metronome Practice Log with Tempo Ladder",
  metaDescription:
    "Log tempo and minutes per block, then see total time, per-exercise BPM gains, day streaks and a next-session tempo ladder. Stays in your browser.",
  steps: [
    "Fill the 'Log a practice block' form — Date, 'Exercise or passage', 'Metronome tempo (BPM)' and 'Minutes practised' — then press 'Add block'.",
    "The summary updates instantly: 'Total practice logged' in minutes, weighted average tempo, current and longest streaks, and a 'Tempo progress by exercise' table showing first → last BPM and the gain.",
    "Press 'Copy summary' for a plain-text report, and plan the next session under 'Next tempo ladder' by setting start tempo, target tempo, step size and minutes per step to get the list of rungs.",
  ],
  intro:
    "A metronome practice log records three numbers per block — what you practised, the tempo you set, and how long you spent — so progress can be measured in beats per minute rather than by feel. This tool totals your minutes, tracks the first and last tempo reached on every exercise, counts consecutive practice days, and builds the next tempo ladder from a start tempo, a target and a step size. Everything stays in your browser.",
  useCases: [
    "Proving to yourself that a tricky passage really has moved from 72 to 96 BPM over three weeks, not just on a good day",
    "Splitting an hour of practice into blocks so you can see how much of it actually went on scales versus repertoire",
    "Planning the rungs for tomorrow's session — start at 76, step 6 BPM, four minutes per rung — before you sit down",
  ],
  benefits: [
    ["Tempo gain per exercise", "First and last logged BPM sit side by side, so progress is a number, not an impression."],
    ["Minute-weighted average tempo", "Long blocks count more than short ones, which stops a single fast run flattering the average."],
    ["Streaks from real dates", "Consecutive practice days are counted from the log, and today counts as unbroken if you practised yesterday."],
  ],
  faqs: [
    [
      "How much should I raise the metronome each time?",
      "Small steps of about 4 to 8 BPM are usual, because that is roughly a 5 to 10 percent jump at typical practice tempos and stays below the point where technique breaks down. Only move up once the passage is clean twice in a row at the current rung.",
    ],
    [
      "What tempo should I start slow practice at?",
      "Start at the fastest tempo you can play the passage accurately with no hesitation — often 50 to 60 percent of the performance tempo. A metronome click at 60 BPM is one second apart; at 120 BPM it is 500 milliseconds, so halving the tempo doubles the time you have per note.",
    ],
    [
      "How long should a practice block be?",
      "Short focused blocks of 10 to 20 minutes on one specific problem generally beat one long undirected session, and logging them separately is what makes the split visible. This log accepts any block from one minute upward and totals them per day.",
    ],
    [
      "Is my practice log saved anywhere?",
      "It is saved in your browser's local storage on this device only. Nothing is uploaded, so clearing site data or switching browser or device will lose it — copy the summary out if you want a permanent record.",
    ],
  ],
};

export default seo;
