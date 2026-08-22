const seo = {
  title: "Week Number Calculator: ISO-8601 for Any Date",
  metaDescription:
    "Get the ISO-8601 week number and week-year for any date, plus the Monday and Sunday that bound it, the day of year, month and quarter.",
  steps: [
    "Open the 'Date' picker in the Inputs panel; it starts empty and the Result card reads 'Select a date.' until you choose one.",
    "Pick the day you need — there is no calculate button, and the result recomputes at once using the ISO rule that shifts the date to the Thursday of its own week and compares it with the week containing 4 January.",
    "Read the 'Week 34' style headline with its 'ISO Year' caption, then the 'Week Start (Mon)', 'Week End (Sun)', 'Day of Week', 'Day of Year', 'Month' and 'Quarter' tiles, and press Copy for a text summary.",
  ],
  intro:
    "Week Number Calculator returns the ISO-8601 week number for any date, using the standard's rule that weeks run Monday to Sunday and week 1 is the week containing that year's first Thursday. Alongside the number it gives the ISO week-year, the Monday and Sunday that bound the week, the day of the week, the day of the year, the month and the calendar quarter. It is for anyone whose planning system talks in week numbers — manufacturing schedules, European project plans, sprint calendars, delivery dates quoted as week 34.",
  useCases: [
    "A supplier quotes delivery in week 42 and you need the actual Monday-to-Sunday dates to put in the project plan",
    "You are reconciling a timesheet export that labels rows by ISO week and want to confirm which week a specific Saturday belongs to",
    "A deadline falls in early January and you need to know whether it counts as week 1 of the new year or week 52 of the old one before you file the report",
  ],
  benefits: [
    [
      "Reports the ISO week-year, not just the calendar year",
      "For dates in late December or early January those two differ, and using the wrong one is the classic way a week number ends up off by a whole year.",
    ],
    [
      "The week's actual date range, spelled out",
      "You get the Monday it starts and the Sunday it ends, so a quoted week number turns straight into dates you can put in a calendar.",
    ],
    [
      "Day of year and quarter in the same answer",
      "One lookup covers the other calendar figures reports usually ask for next, instead of sending you to a second tool.",
    ],
  ],
  faqs: [
    [
      "How is the ISO week number calculated?",
      "Weeks run Monday through Sunday, and week 1 is the week that contains the year's first Thursday — equivalently, the week containing 4 January. The calculation shifts the date to the Thursday of its own week, compares that with the Thursday of week 1, and divides the gap by seven days.",
    ],
    [
      "Can a year have 53 weeks?",
      "Yes. An ISO year has 53 weeks when 1 January falls on a Thursday, or when it falls on a Wednesday in a leap year; otherwise it has 52. Roughly 71 of every 400 years are 53-week years, which is why annual reports built on week numbers occasionally get an extra period.",
    ],
    [
      "Why does 1 January sometimes show as week 52 or 53?",
      "Because ISO weeks never split across the boundary — a week belongs entirely to whichever year holds its Thursday. So 1, 2 and 3 January can fall in the last week of the previous ISO year, and 29, 30 and 31 December can fall in week 1 of the next one. That is what the ISO week-year field tells you.",
    ],
    [
      "Is the US week numbering the same as ISO week numbering?",
      "No. The common North American convention starts weeks on Sunday and counts the week containing 1 January as week 1, which frequently gives a number one higher than ISO for the same date early in the year. This tool follows ISO-8601 throughout, so confirm which convention a counterparty uses before exchanging week numbers.",
    ],
  ],
};

export default seo;
