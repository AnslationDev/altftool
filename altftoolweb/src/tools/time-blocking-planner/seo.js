const seo = {
  intro:
    "Time blocking is the practice of assigning every hour of the working day to a named task in advance, so the calendar — not the inbox — decides what happens next. This planner turns a list of blocks into the numbers that matter: booked minutes against the length of your day, overlapping appointments, gaps too short to use, and the longest stretch of uninterrupted focus you have actually protected. It is for anyone running a maker schedule who wants the plan checked before the day starts.",
  useCases: [
    "Spot that two meetings overlap by 15 minutes before you accept the second invite",
    "Check whether a day of back-to-back calls leaves any focus run longer than 45 minutes",
    "Find the 10-minute stubs between meetings that are too short to start real work in",
  ],
  benefits: [
    ["Clash detection", "Every pair of blocks is compared, so a double booking is flagged with the exact overlap in minutes."],
    ["Break budget from data", "Recommended break time is sized from the 52/17 work-rest rhythm, not a guess."],
    ["Stays on your machine", "The day autosaves to browser local storage; nothing is sent anywhere."],
  ],
  faqs: [
    [
      "How much of the day should I actually block?",
      "Aim for 60-80% booked, not 100%. Leaving a fifth of the day unblocked absorbs the overruns, the urgent request and the task that turns out to be twice as big as you thought — without that buffer, one slipped block cascades through everything after it.",
    ],
    [
      "How long should each block be?",
      "Long enough to reach depth and short enough to finish: 60 to 120 minutes for focused work. This planner treats anything under 5 minutes as invalid and flags gaps under 15 minutes as dead time, because a quarter of an hour is roughly the floor for starting something that needs concentration.",
    ],
    [
      "How much deep work can I schedule in one day?",
      "About four hours is the practical ceiling. Cal Newport's Deep Work puts the limit at roughly one hour a day for beginners and up to four for experienced practitioners, so this tool warns once your deep-work blocks pass 240 minutes.",
    ],
    [
      "How much break time do I need?",
      "Roughly 17 minutes of break for every 52 minutes of work — about a third. That ratio comes from DeskTime's 2014 analysis of its most productive 10% of users, and it is what the planner uses to size the recommended break total against the focus time you have scheduled.",
    ],
  ],
};

export default seo;
