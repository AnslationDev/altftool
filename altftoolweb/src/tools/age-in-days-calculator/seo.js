const seo = {
  title: "Age in Days Calculator: Exact Days, Weeks & Hours",
  metaDescription:
    "Enter a birth date to count exact days lived — leap days included — plus weeks, whole months, hours and the days left until your next birthday.",
  intro:
    "The Age in Days Calculator counts the exact number of days elapsed between your date of birth and today, then restates the same span as weeks, whole months, hours, and calendar years-and-months, and tells you how many days remain until your next birthday. It counts real elapsed time rather than assuming a 365-day year, so every leap day you have lived through is already included. Enter one date; everything is computed in your device's local time zone and nothing is sent anywhere.",
  useCases: [
    "You want to know which date your 10,000th day falls on so you can mark it — it lands roughly 27 years and 4 months after birth",
    "You are filling in a form or a school project that asks for an age in months rather than years and need the exact whole-month count",
    "You are planning a surprise and need to know precisely how many days are left until someone's next birthday",
  ],
  benefits: [
    ["Counts leap days automatically", "The day figure comes from actual elapsed time, so 29 February birthdays and leap years are already accounted for rather than approximated."],
    ["Four units from one date", "Days, weeks, whole months and hours appear together, alongside the conventional years-and-months reading of the same age."],
    ["Includes the countdown to your next birthday", "The next-birthday figure rolls to the following year automatically once this year's date has passed."],
  ],
  faqs: [
    [
      "How many days old am I if I am 25?",
      "Around 9,131 or 9,132 days, depending on how many 29 Februaries fell inside that span and whether your birthday has already passed this year. The calculator does not multiply by 365 — it measures the actual interval between the two dates, so the leap days are counted individually.",
    ],
    [
      "When do I turn 10,000 days old?",
      "About 27 years and 4 months after birth, since 10,000 days divided by the Gregorian average of 365.2425 days per year is roughly 27.38 years. The 20,000-day mark falls near 54 years 9 months, and 30,000 days near 82 years 1 month.",
    ],
    [
      "Why does the month count not match days divided by 30?",
      "Because months are counted on the calendar, not as fixed 30-day blocks. The tool compares the day of the month directly and only counts a month once that day has arrived, which is why a 31 January birth date and a 28 February today reads as 0 whole months rather than 1.",
    ],
    [
      "Does the time of day or my time zone affect the result?",
      "Slightly. The count runs from midnight on your birth date to the current moment in your device's local time zone, so a browser set to a different zone can shift the day figure by one either side of midnight. For a birthday countdown or a milestone date that is not a problem; for anything official, use the date itself rather than the day count.",
    ],
  ],
};

export default seo;
