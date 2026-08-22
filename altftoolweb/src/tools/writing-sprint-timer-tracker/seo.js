const seo = {
  title: "Writing Sprint Timer with WPM Tracking",
  metaDescription:
    "Run 25/5 Pomodoro writing sprints with a long break after every fourth, log words per sprint, and see your wpm and how many sprints your target needs.",
  steps: [
    "Set Sprint length (minutes), Break length (minutes), Sprints in this session and your Word target for the day, then press Start",
    "When each countdown ends, type Words written in that sprint and press Add sprint to log it",
    "Read your measured pace in wpm, your best sprint, and how many sprints the target still needs, then press Copy log to save the session",
  ],
  intro:
    "A writing sprint timer runs a focused countdown, then a break, then repeats — the Pomodoro pattern of a 25-minute interval, a 5-minute short break, and a longer 15-minute break after every fourth sprint. What makes it a tracker rather than a clock is the log: enter the words you produced in each sprint and it computes words per minute for every sprint, your overall pace, whether you are speeding up or slowing down, and how many more sprints your word target actually needs.",
  useCases: [
    "Run four 25-minute sprints in an evening and find out that your real pace is 22 words a minute, not the 40 you assumed.",
    "See whether your fourth sprint is measurably slower than your first, and decide whether a longer break is worth more than pushing on.",
    "Work out that a 1,667-word daily target at your measured pace needs four sprints and about an hour and 55 minutes on the clock.",
    "Run 15-minute sprints in a group session where everyone starts and stops together.",
  ],
  benefits: [
    ["Pace measured, not guessed", "Words per minute comes from your own logged sprints, so projections use your real speed."],
    ["Fatigue visible", "Compares the second half of the session with the first and tells you which way your pace is going."],
    ["Full schedule up front", "Shows total clock time for the session including every break before you start."],
  ],
  faqs: [
    [
      "How long should a writing sprint be?",
      "Twenty-five minutes is the standard Pomodoro interval and works well for drafting. Shorter 10 or 15 minute sprints suit editing and getting started when a blank page is the problem; 45-minute blocks suit deep revision where the setup cost of getting back into a chapter is high.",
    ],
    [
      "How many words can you write in a 25 minute sprint?",
      "It depends entirely on your pace and whether you are drafting or revising. A drafting pace of 20-25 words per minute produces roughly 500-625 words in a 25-minute sprint; that is why the tool measures your own rate rather than assuming one.",
    ],
    [
      "What is the Pomodoro Technique for writing?",
      "Work in a fixed interval — classically 25 minutes — with no interruptions, then take a 5-minute break, and after four intervals take a longer break of 15 to 30 minutes. The method was developed by Francesco Cirillo, and its value for writing is that the interval is short enough to start even on a bad day.",
    ],
    [
      "Does this timer save my sprint log?",
      "No. Everything stays in the browser tab and is cleared when you close or reload the page, so nothing is uploaded or stored. Use the copy button to save the log somewhere before you leave.",
    ],
  ],
};

export default seo;
