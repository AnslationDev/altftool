const seo = {
  intro:
    "Long Weekend Planner reads a year of Indian public holidays, finds every stretch where a handful of leave days bridges a holiday to a weekend, and then runs a knapsack optimiser to pick the exact combination of dates that buys the most total days off within your leave budget. It only proposes a bridge when the payoff is at least 2 days off per leave applied and never spends more than 4 leaves on a single block, so nothing in the plan is a bad trade. Salaried employees planning the year in January get a dated list of leaves to file, not a generic holiday calendar.",
  useCases: [
    "It is the first week of January, your company opens the leave calendar, and you want to book the highest-value dates before colleagues claim the same Diwali and Christmas bridges.",
    "You have exactly 6 casual leaves left for the year and need to know whether to spend them on one long break or spread them across three four-day weekends.",
    "You work a 6-day week with only Sunday off, so the standard 'long weekend' lists everyone shares are wrong for you and you need the bridges recomputed for your actual working pattern.",
  ],
  benefits: [
    [
      "Optimised, not just listed",
      "A dynamic-programming pass over non-overlapping holiday clusters picks the combination that maximises total days off for your budget, instead of showing every opportunity and leaving the maths to you.",
    ],
    [
      "Honest about leverage",
      "Blocks costing leave must return at least 2 days off per leave day and run 4 days or longer, so a one-leave-for-one-day 'opportunity' never reaches the plan.",
    ],
    [
      "Built for a 6-day week too",
      "Switch between Sat+Sun off and Sun-only and the whole year is rebuilt, because Saturday holidays are a loss for one pattern and irrelevant for the other.",
    ],
  ],
  faqs: [
    [
      "How many leave days should I plan for the year?",
      "Start with whatever your policy actually grants — the planner defaults to a budget of 6 and accepts up to 60. Raise the number one at a time and watch the total days off: the curve flattens once the high-leverage bridges are taken, and that flat point is where extra leaves stop buying long breaks.",
    ],
    [
      "Which holidays does it use, and are the dates confirmed?",
      "It uses the Indian public holiday list for 2024 through 2028. Festival dates that follow the lunar calendar — Diwali, Holi, Eid, Janmashtami and similar — are marked as approximate because they are fixed by moon sighting or the official gazette, so confirm those against your employer's declared holiday list before filing leave.",
    ],
    [
      "What counts as a long weekend here?",
      "Any run of 3 or more consecutive days off that contains at least one public holiday. If the run costs you leave it must be at least 4 days long and return two days off for every leave day, otherwise it is not offered as an opportunity.",
    ],
    [
      "Can I add my company's own holidays or a restricted holiday?",
      "Yes — custom holidays you add are merged into the year alongside the public ones and are saved in your browser's local storage, so they persist for the next visit. They are treated as fixed dates rather than approximate, which is right for company-declared and optional restricted holidays.",
    ],
  ],
};

export default seo;
