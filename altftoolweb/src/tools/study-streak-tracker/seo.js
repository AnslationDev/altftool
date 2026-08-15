const seo = {
  title: "Study Streak Tracker with Streak Freezes & Adherence",
  metaDescription:
    "Paste your daily study hours and a goal to see current and longest streaks, with 0-3 streak freezes per rolling 7 days and an honest goal-adherence rate.",
  steps: [
    "Enter your log in Hours studied per day (oldest first, comma separated) - e.g. 2, 2.5, 0, 3 - set the Daily goal (hours), and pick Streak freezes per 7 days, from 0 (strict, any miss breaks the streak) up to 3.",
    "The tracker computes your current streak instantly and maps every logged day as a numbered tile: solid for goal met, outlined for freeze used, red for missed.",
    "Read Longest streak, Goal adherence, Freezes used, Total hours logged and Average hours per day in the summary list, then press Copy result to put the streak report on the clipboard.",
  ],
  intro:
    "This tracker computes your current and longest study streaks from a simple list of daily hours and a daily goal, using a Duolingo-style streak-freeze rule: a limited number of off-days per rolling 7-day window preserve an active streak without extending it. It also reports goal adherence, total hours and your day-by-day record. It is built for students who want the motivational pull of a streak without one bad day erasing weeks of effort.",
  useCases: [
    "An exam aspirant logging the last two weeks of study hours to see whether a 2-hour daily habit is actually holding",
    "A student choosing a strict zero-freeze rule during the final month before boards to enforce daily revision",
    "Someone rebuilding a habit after a break, using one freeze per week so a single busy day does not reset progress",
  ],
  benefits: [
    ["Recovery rules built in", "Configure 0-3 streak freezes per rolling 7 days, so realistic schedules do not collapse to zero."],
    ["Honest adherence rate", "Frozen days protect the streak but never count as goal-met days in the adherence percentage."],
    ["Day-by-day map", "Every logged day is shown as met, frozen or missed, so you can spot the pattern behind the number."],
  ],
  faqs: [
    [
      "How does a study streak work?",
      "A streak counts consecutive days on which you met your study goal — here, days where logged hours reached your daily target. Meeting the goal adds a day; missing it normally resets the count to zero unless a streak freeze protects it.",
    ],
    [
      "What is a streak freeze and how many do I get?",
      "A freeze lets one missed day preserve an active streak without adding to it, the same behaviour Duolingo popularised. In this tool you choose 0 to 3 freezes per rolling 7-day window; 0 means strict mode where any miss breaks the streak.",
    ],
    [
      "Does a frozen day count towards my study consistency?",
      "No. A frozen day keeps the streak alive but is excluded from the adherence percentage, which only counts days where the goal was genuinely met. That keeps the consistency number honest even when freezes are used.",
    ],
    [
      "What is a good daily study hour goal?",
      "One you can meet at least 80% of days — consistency beats intensity for habit formation. Many students start at 1-2 focused hours daily and raise the goal only after holding a two-week streak, rather than starting at 6 hours and breaking immediately.",
    ],
  ],
};

export default seo;
