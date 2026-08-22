const seo = {
  title: "Add or Subtract Days, Weeks, Months from a Date",
  metaDescription:
    "Move any date by years, months, weeks or days — end-of-month-safe arithmetic, a business-day mode that skips weekends, plus ISO week and day of year.",
  steps: [
    "Pick the \"Starting date\", choose \"Add\" or \"Subtract\", and fill in Years, Months, Weeks and Days — or tap a quick chip like \"+90 days\" or \"+6 months\".",
    "Optionally tick \"Count business days only (skip Saturdays and Sundays)\" — then only the Days field applies and weekends are stepped over.",
    "Read the \"Resulting date\" with its ISO date, ISO week, day of year, weekday-or-weekend and leap-year rows, then click \"Copy result\".",
  ],
  "intro": "Date Add Subtract Calculator moves any date forwards or backwards by a mix of years, months, weeks and days and shows the exact resulting date with its weekday, ISO week number and day of year. Month arithmetic is end-of-month safe, so 31 January plus one month correctly lands on the last day of February rather than spilling into March. A business-day mode steps over Saturdays and Sundays for deadline and turnaround calculations.",
  "useCases": [
    "Find the exact expiry date when a document, warranty or visa is valid for 90 days or 6 months.",
    "Work out a project deadline 45 working days from today, skipping weekends.",
    "Calculate a notice-period end date three months after a resignation date.",
    "Set a reminder date 21 days before an event by subtracting from the event date."
  ],
  "benefits": [
    [
      "End-of-month safe",
      "Adding months to the 29th, 30th or 31st clamps to the last valid day of the target month instead of rolling over, and the tool tells you when it happened."
    ],
    [
      "Mix all four units at once",
      "Years, months, weeks and days can be combined in a single calculation, applied in a consistent, documented order."
    ],
    [
      "Business-day mode",
      "Switch on business days and the calculator steps forward or backward over weekends, which is how most SLA and turnaround clauses count."
    ]
  ],
  "faqs": [
    [
      "What is 31 January plus one month?",
      "28 February, or 29 February in a leap year. Since 31 February does not exist, the calculator clamps to the last day of the target month, which is how date libraries and most contracts treat it."
    ],
    [
      "In what order are years, months, weeks and days applied?",
      "Years and months first, with end-of-month clamping, then weeks and days as plain calendar days. The order matters near month ends, so it is kept fixed and shown on the page."
    ],
    [
      "How does business-day mode differ?",
      "It ignores the years, months and weeks fields and moves the date one working day at a time, skipping Saturday and Sunday. It does not know about public holidays — add those manually or use a working-days calculator."
    ],
    [
      "Is the ISO week number the same as the calendar week?",
      "Not always. ISO weeks start on Monday and week 1 is the week containing the first Thursday of the year, so early January dates can fall in week 52 or 53 of the previous year."
    ]
  ]
};

export default seo;
