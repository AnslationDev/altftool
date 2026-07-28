const seo = {
  intro:
    "The Weekly Planner turns a list of tasks into a dated seven-day time-block schedule and tells you, in minutes, how full each day already is. It works out every day's load as blocked minutes divided by your waking window (08:00-22:00 by default), flags any two blocks that overlap using the standard interval test — a.start < b.end and b.start < a.end — and totals your week by category. It suits anyone doing time blocking, week-ahead reviews or capacity planning, and everything is stored in your own browser.",
  useCases: [
    "Blocking out a Monday-to-Sunday week on Sunday evening and checking that no day goes past 85% booked.",
    "Spotting that a 10:30 stand-up overlaps a 09:00-11:00 deep work block before the week starts rather than during it.",
    "Seeing how many hours a week actually go to meetings versus deep work, split by category.",
  ],
  benefits: [
    ["Clash detection", "Any two blocks that overlap on the same day are highlighted, using exact minute-from-midnight comparison."],
    ["Honest free time", "Overlapping blocks are counted once when free hours are measured, so the remaining time is real."],
    ["Stays on your device", "The whole week is saved in your browser's local storage — nothing is uploaded to a server."],
  ],
  faqs: [
    [
      "How much of my day should I block?",
      "Keep planned blocks under about 85% of your waking window — roughly 12 hours out of a 14-hour 08:00-22:00 day. The planner marks a day overloaded above that, because the remaining time is what absorbs overruns, transitions and interruptions.",
    ],
    [
      "How does the planner decide two blocks clash?",
      "It uses the standard interval overlap test: block A and block B clash when A starts before B ends and B starts before A ends. A 09:00-11:00 block and a 10:30-11:00 block therefore clash; a 09:00-10:30 block and a 10:30-11:00 block do not, since touching edges are not an overlap.",
    ],
    [
      "Can I start my week on Sunday instead of Monday?",
      "Yes. The week start toggle switches between Monday and Sunday, and the planner recomputes the seven dates from the date you are viewing: start of week = date minus ((weekday - week start + 7) mod 7) days.",
    ],
    [
      "Is my plan saved if I close the tab?",
      "Yes. The plan is written to your browser's local storage on this device only. Clearing site data or using a different browser or device starts you with an empty week again.",
    ],
  ],
};

export default seo;
