const info = {
  "date-calculator": {
    intro: [
      "The Date Calculator works two ways. In Difference mode it tells you exactly how much time separates two calendar dates — as a total number of days and as a tidy years / months / days breakdown. In Add/Subtract mode it starts from a date and shifts it forward or backward by a chosen number of days, weeks, months or years to give you the resulting date.",
      "It is handy for counting down to deadlines, working out contract or notice-period end dates, checking how long ago something happened, or finding a date that is, say, exactly 90 days from today.",
    ],
    formula: {
      expression: "Days = (End − Start) ÷ 86,400,000 ms",
      where: [
        ["Start", "the earlier date (taken at local midnight)"],
        ["End", "the later date (taken at local midnight)"],
        ["86,400,000 ms", "the number of milliseconds in one day"],
      ],
      note:
        "The years / months / days breakdown is counted by calendar, so unequal month lengths (28–31 days) and leap years are handled automatically. In Add/Subtract mode the date is shifted by whole units; when adding months or years the day is clamped to the last valid day of the target month (e.g. Jan 31 + 1 month → Feb 28).",
    },
    howToUse: [
      "Choose Difference to compare two dates, or Add/Subtract to shift a date.",
      "In Difference mode, pick a start date and an end date.",
      "In Add/Subtract mode, pick a start date, choose Add or Subtract, then enter the amount and its unit (days, weeks, months or years).",
      "Read the result instantly — total days and the full breakdown, or the resulting date with its weekday.",
    ],
    goodToKnow: [
      "The day count is the number of nights between the dates: from the 1st to the 8th is 7 days, not 8.",
      "If you enter the end date before the start date, the gap is still shown as a positive span.",
      "Months and years are inherently variable in length, so 30 days is not always exactly '1 month' — the breakdown reflects real calendar months.",
      "All calculations run in your browser using your device's local time; no dates are sent anywhere.",
    ],
    faqs: [
      {
        q: "Does the difference include both the start and end day?",
        a: "It counts the days between the two dates — effectively the number of nights. To count both endpoints inclusively (common for booking nights or event days), add 1 to the total days shown.",
      },
      {
        q: "What happens when I add a month to the 31st?",
        a: "The result is clamped to the last day of the target month. Adding one month to January 31 gives February 28 (or 29 in a leap year), which matches how most date calculators and calendar apps behave.",
      },
      {
        q: "Are leap years taken into account?",
        a: "Yes. February 29 and the extra day in leap years are handled automatically in both the day count and the years/months/days breakdown.",
      },
      {
        q: "Can I calculate business days only?",
        a: "This tool counts calendar days, including weekends and holidays. For working-day counts you would need to subtract weekends and any public holidays separately.",
      },
    ],
  },

  "time-calculator": {
    intro: [
      "The Time Calculator adds or subtracts two durations expressed in hours, minutes and seconds. Each duration is converted to a total number of seconds, the two are combined, and the answer is shown back in clean H:MM:SS form alongside the total in hours, minutes and seconds.",
      "Use it to total up timesheets, add lap or leg times together, work out how much time is left after several tasks, or find the gap between two elapsed times.",
    ],
    formula: {
      expression: "Total = (h₁·3600 + m₁·60 + s₁) ± (h₂·3600 + m₂·60 + s₂)",
      where: [
        ["h, m, s", "the hours, minutes and seconds of each duration"],
        ["3600", "seconds in one hour"],
        ["60", "seconds in one minute"],
        ["±", "plus when adding, minus when subtracting"],
      ],
      note:
        "Fields are normalised automatically, so entering 90 minutes is treated as 1 hour 30 minutes. If a subtraction would fall below zero the result is clamped to 0:00:00, since a duration cannot be negative.",
    },
    howToUse: [
      "Enter the first duration as hours, minutes and seconds.",
      "Choose Add to combine the two durations or Subtract to find the difference.",
      "Enter the second duration in the same way.",
      "Read the combined time in H:MM:SS, plus the totals in hours, minutes and seconds.",
    ],
    goodToKnow: [
      "You can enter values above the usual limits (e.g. 75 minutes); they roll over correctly into hours.",
      "Subtracting a larger duration from a smaller one gives a negative result, which is shown as 0:00:00 — swap the two durations to see the gap.",
      "This adds lengths of time (durations), not clock times. To find the elapsed time between two clock readings, use the Time Duration Calculator.",
    ],
    faqs: [
      {
        q: "What is the difference between this and a time duration calculator?",
        a: "This tool combines two lengths of time, such as 2h 30m + 1h 45m. A duration calculator finds the elapsed time between two points on the clock, such as 09:00 to 17:30.",
      },
      {
        q: "Why does subtracting sometimes show 0:00:00?",
        a: "Durations cannot be negative. If the second duration is larger than the first, the answer would be below zero, so it is clamped to 0:00:00. Swap the inputs to measure the positive gap instead.",
      },
      {
        q: "Can I add more than two durations?",
        a: "Add the first two, note the H:MM:SS result, then enter that total as the first duration and add the next one. Repeat to chain any number of durations.",
      },
    ],
  },

  "age-calculator": {
    intro: [
      "The Age Calculator finds how old someone is on a given day, expressed as complete years, months and days. Leave the second date blank to get the age as of today, or set it to any date to find the age on a birthday, anniversary or milestone.",
      "It also converts the age into total months, weeks, days and hours, which is useful for babies' ages, record-keeping and eligibility checks.",
    ],
    formula: {
      expression: "Age = complete calendar years, months and days from birth date to the reference date",
      where: [
        ["Birth date", "the starting date"],
        ["Reference date", "the date you are measuring the age on (defaults to today)"],
      ],
      note:
        "Years, months and days are counted by calendar rather than by fixed lengths: months carry the number of days they actually have, and leap days are included. Total days is (reference − birth) ÷ 86,400,000 ms.",
    },
    howToUse: [
      "Enter the date of birth.",
      "Leave the second date blank for today's age, or pick a specific date.",
      "Read the age in years, months and days.",
      "Check the totals in months, weeks, days and hours below.",
    ],
    goodToKnow: [
      "Age counts completed periods: you turn 30 only on your 30th birthday, not the day before.",
      "The calculation follows the common Western convention where age increments on the birthday.",
      "Leap-year birthdays (Feb 29) are counted against the actual calendar, so ages stay accurate across leap years.",
      "The reference date must be on or after the birth date.",
    ],
    faqs: [
      {
        q: "Can I find my age on a future date?",
        a: "Yes. Set the second date to any future day to see how old you will be then, for example on a specific anniversary or exam date.",
      },
      {
        q: "How is age counted in months and days?",
        a: "It uses whole calendar months and the remaining days, so the months figure respects each month's real length rather than assuming 30 days.",
      },
      {
        q: "Why might my age differ from other calculators by a day?",
        a: "Differences usually come from time zones or whether the current day is counted. This tool measures from midnight to midnight in your local time.",
      },
    ],
  },

  "time-duration-calculator": {
    intro: [
      "The Time Duration Calculator measures the elapsed time between a start clock time and an end clock time, returning it as hours and minutes, as total minutes, and as decimal hours. It handles shifts that run past midnight when you mark the duration as overnight.",
      "It is ideal for working out shift lengths, billable hours, study or workout sessions, and any 'from X to Y' time span.",
    ],
    formula: {
      expression: "Duration (minutes) = End − Start  (+ 1440 if it crosses midnight)",
      where: [
        ["Start", "start clock time in minutes from midnight"],
        ["End", "end clock time in minutes from midnight"],
        ["1440", "minutes in a full day, added when the end time is on the next day"],
      ],
      note:
        "Decimal hours = total minutes ÷ 60. When a shift runs past midnight (e.g. 22:00 to 06:00), a full day is added so the span comes out positive.",
    },
    howToUse: [
      "Enter the start time.",
      "Enter the end time.",
      "If the end time is on the next day, mark the duration as overnight.",
      "Read the result in hours and minutes, total minutes and decimal hours.",
    ],
    goodToKnow: [
      "Decimal hours (e.g. 8.5) are what most payroll and billing systems expect.",
      "Without the overnight option, an end time earlier than the start time would give a negative span; marking it overnight fixes this.",
      "This measures clock-to-clock elapsed time, unlike the Time Calculator which adds and subtracts lengths of time.",
    ],
    faqs: [
      {
        q: "How do I calculate a shift that ends after midnight?",
        a: "Enter the start and end times and turn on the overnight option. The tool adds a full day so, for example, 22:00 to 06:00 correctly returns 8 hours.",
      },
      {
        q: "How do I convert the result to decimal hours for payroll?",
        a: "The decimal-hours figure is shown automatically. It is simply the total minutes divided by 60, so 8 h 30 m becomes 8.5 hours.",
      },
      {
        q: "Does it subtract a lunch break?",
        a: "No. It measures the raw span between the two times. Subtract any unpaid break separately, or use the Time Calculator to take it off.",
      },
    ],
  },

  "countdown-calculator": {
    intro: [
      "The Day Counter tells you how many days remain until a target date, or how many days have passed since one. It also expresses that span in weeks and approximate months so you can see the distance at a glance.",
      "Use it to count down to a holiday, deadline, launch, birthday or exam, or to count up the days since a memorable event.",
    ],
    formula: {
      expression: "Days = (Target − Today) ÷ 86,400,000 ms",
      where: [
        ["Target", "the date you are counting to or from (at midnight)"],
        ["Today", "the current date (at midnight)"],
        ["86,400,000 ms", "milliseconds in one day"],
      ],
      note:
        "Both dates are taken at local midnight, so the count is whole days. A positive result means the date is in the future (days to go); a negative one means it is in the past (days since).",
    },
    howToUse: [
      "Pick the target date.",
      "Read the number of days remaining, or days since if the date has passed.",
      "See the same span shown in weeks and approximate months below.",
    ],
    goodToKnow: [
      "Counting is done from midnight to midnight in your local time, so the figure is a whole number of days.",
      "A future date shows days to go; a past date shows days since; the same date shows zero (today).",
      "The 'approximate months' figure uses an average month of about 30.44 days, so it is a rough guide rather than an exact calendar count.",
    ],
    faqs: [
      {
        q: "Does the count include today?",
        a: "Today counts as day zero. A target set to tomorrow shows 1 day to go, so the number reflects the whole days between now and the target midnight.",
      },
      {
        q: "What if the date has already passed?",
        a: "The tool switches to counting up, showing how many days have gone by since that date.",
      },
      {
        q: "Why are the months only approximate?",
        a: "Months vary from 28 to 31 days, so the month figure uses an average length for a quick estimate. For an exact years/months/days breakdown, use the Date Calculator's Difference mode.",
      },
    ],
  },
};

export default info;
