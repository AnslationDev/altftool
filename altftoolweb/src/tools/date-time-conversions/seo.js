const seo = {
  title: "Date & Time Converter: Units, Unix Timestamps",
  metaDescription:
    "Four panels convert time units, turn Unix timestamps into UTC/ISO 8601 dates and back, rewrite dates in eight formats, and give exact date differences.",
  steps: [
    "Pick a panel from the Time Units, Unix Timestamp, Date Format and Date Difference tabs.",
    "Enter your value — a number with its unit, a Unix timestamp in seconds (or press Now), any date such as 2025-12-31, or a start and end date.",
    "Results update as you type: all eight units, UTC/Local/ISO 8601 strings, eight date formats, or a years-months-days duration — each with its own Copy button.",
  ],
  intro:
    "Date / Time Conversions is a four-panel converter that handles time units, Unix timestamps, date formats and date differences in one place. It converts between eight units from milliseconds to years, turns a Unix epoch seconds value into UTC, local and ISO 8601 strings and back, rewrites any parsed date into eight formats including ISO 8601, US, European and YYYYMMDD compact, and reports the gap between two dates as calendar years-months-days alongside exact days, hours, minutes and seconds.",
  useCases: [
    "Reading a log line that records a Unix timestamp like 1767139200 and needing the human date, weekday and ISO string it corresponds to.",
    "Receiving a spreadsheet with dates as 31/12/2025 that a US system expects as 12/31/2025, and converting the format without misreading day and month.",
    "Working out how long a contract has run — both as '2y 3m 14d' and as an exact number of days — for an invoice or a notice period.",
  ],
  benefits: [
    [
      "Calendar difference and exact difference together",
      "The date difference panel gives true calendar years-months-days by borrowing days from the previous month, plus raw totals in days, hours, minutes and seconds.",
    ],
    [
      "Both timestamp directions",
      "Timestamp to date returns UTC, local, ISO 8601 and weekday at once; date to timestamp returns both the seconds value and the milliseconds value.",
    ],
    [
      "Flexible date parsing",
      "The format panel accepts YYYY-MM-DD, MM/DD/YYYY, YYYYMMDD and DD-Mon-YYYY input, then shows all eight output formats side by side with a copy button on each.",
    ],
  ],
  faqs: [
    [
      "What is a Unix timestamp?",
      "A Unix timestamp is the number of seconds elapsed since 00:00:00 UTC on 1 January 1970, known as the Unix epoch. This tool takes seconds (not milliseconds) as input and also reports the millisecond value when converting a date the other way, which is what JavaScript's Date.getTime() returns.",
    ],
    [
      "How many seconds are in a day, week or year?",
      "A day is 86,400 seconds, a week is 604,800 seconds, and the unit converter treats a month as 30 days (2,592,000 seconds) and a year as 365 days (31,536,000 seconds). Those last two are conventional approximations, since real months vary from 28 to 31 days and leap years have 366.",
    ],
    [
      "Why does the date difference show a different number of months than days divided by 30?",
      "The headline duration counts real calendar months by comparing year, month and day separately and borrowing from the previous month when needed, so 31 January to 1 March is 1 month 1 day. The averaged figures beneath it use 30.4375 days per month and 365.25 days per year, which accounts for leap years across long spans.",
    ],
    [
      "What is ISO 8601 date format and why use it?",
      "ISO 8601 writes dates as YYYY-MM-DD, for example 2025-12-31. It is unambiguous worldwide — unlike 12/31/2025 versus 31/12/2025 — and it sorts correctly as plain text, which is why it is the safest format for filenames, APIs and databases.",
    ],
  ],
};

export default seo;
