const seo = {
  title: "Age Calculator — Exact Age from Your Date of Birth",
  h1: "Age Calculator",
  metaDescription:
    "Enter your date of birth and get your exact age in years, months, days, hours and seconds — updating live. Runs in your browser; nothing is stored.",
  intro:
    "The Age Calculator turns a date of birth into an exact age using native JavaScript Date arithmetic — no date library and no server call. Calendar years, months and days are computed by borrowing the real length of the previous month (28, 29, 30 or 31 days, so leap days resolve correctly), while total weeks, days, hours, minutes and seconds come from the raw millisecond difference between your birth moment and now. A one-second interval re-runs the whole calculation while the page is open, so the seconds lived and the next-birthday countdown tick live on screen.",
  useCases: [
    "Getting an exact age in years, months and days for a form, application or record where an approximate figure isn't enough.",
    "Counting down to a birthday — days, hours, minutes and seconds left, the weekday it falls on, and the age being turned.",
    "Comparing two birth dates side by side to find the precise age gap between two people in years, months and days.",
  ],
  benefits: [
    [
      "Calendar maths, not rounded months",
      "Days and months are worked out against the actual length of each calendar month, so a birth date late in a long month doesn't drift the way fixed 30-day arithmetic does, and leap days are counted.",
    ],
    [
      "Live to the second",
      "The calculation re-runs every second while the page is open, so seconds lived, total hours and the countdown to your next birthday update as you watch.",
    ],
    [
      "Nothing leaves your device",
      "The calculation makes no network requests, has no upload step and writes nothing to local storage — your date of birth stays in page memory and disappears when you close the tab.",
    ],
    [
      "Free, no account, no limits",
      "No signup and no cap on how many dates you calculate. Results can be copied as text, copied as a link, shared, or sent to your browser's print dialog to save as PDF.",
    ],
  ],
  faqs: [
    [
      "How do I calculate my exact age from my date of birth?",
      "Enter your date of birth and press Calculate Age. The result shows exact calendar years, months and days, plus totals for weeks, days, hours, minutes and seconds lived. The time-of-birth field is optional — adding it makes the hour, minute and second figures exact instead of counted from midnight.",
    ],
    [
      "How many days old am I?",
      "The calculator answers directly: total days is the millisecond gap between your birth moment and right now divided by 86,400,000 and rounded down. It's shown next to your 1,000-, 5,000-, 10,000- and 25,000-day milestones, each with the calendar date it falls (or fell) on, plus the date you'd reach 100 years.",
    ],
    [
      "Does this age calculator account for leap years?",
      "Yes. Ages come from native JavaScript Date arithmetic rather than a flat 365-day year, so every 29 February between your birth date and today is counted. When the day figure needs to borrow, it borrows the true length of the preceding calendar month — 28, 29, 30 or 31 days.",
    ],
    [
      "Why is my age different on another age calculator?",
      "Usually rounding. Many calculators divide total days by 30 for months or 365 for years, which drifts by several days. This one reads years, months and days from the calendar itself and reports the raw totals separately, so it won't always match a rounded estimate.",
    ],
    [
      "Is my date of birth stored or sent anywhere?",
      "No. Everything runs in your browser in JavaScript — there's no upload, no API call and no localStorage write. The date exists only in the page's memory for the session.",
    ],
    [
      "Can I calculate my age including my time of birth?",
      "Yes. Leave the time field blank and the count starts at 00:00 on your birth date in your device's local time zone; fill it in and the hours, minutes and seconds lived become exact, with the next-birthday countdown aligned to the hour you were born.",
    ],
    [
      "How many days until my next birthday?",
      "The countdown shows days, hours, minutes and seconds remaining, the weekday the birthday falls on, and the age you'll turn. If this year's birthday has already passed, it rolls to next year's date automatically.",
    ],
    [
      "What extra facts does it show about my birth date?",
      "It derives your Western zodiac sign and its associated colour, your Chinese zodiac animal from the 12-year cycle anchored to 1900, your generation label (Greatest Generation through Gen Beta), and the traditional birthstone and birth flower for your birth month. Heartbeat and breath counts are illustrative figures based on average rates of 72 beats and 16 breaths per minute — estimates, not measurements.",
    ],
  ],
  steps: [
    "Enter your date of birth, and optionally your time of birth, in the fields at the top.",
    "Press Calculate Age to see exact years, months and days plus total weeks, days, hours, minutes and seconds.",
    "Scroll for your next-birthday countdown, day milestones, birth-date facts, and a side-by-side age comparison with someone else.",
  ],
};

export default seo;
