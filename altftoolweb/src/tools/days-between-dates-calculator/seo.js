const seo = {
  title: "Days Between Dates Calculator - Weeks, Months & Years",
  metaDescription:
    "Counts whole days between two dates and converts to weeks, months (30.44-day average) and years (365.25). Reversed dates return the gap, not an error.",
  intro:
    "The Days Between Dates Calculator counts the whole days from one date to another and also expresses the same gap in weeks and days, weeks, months and years. It subtracts the two dates in milliseconds and divides by 86,400,000, then converts using 7 days per week, 30.44 days per average month and 365.25 days per average year. If the end date falls before the start date it still reports the size of the gap and flags the reversed order.",
  useCases: [
    "Checking how many days remain until a deadline, visa expiry or exam date so you know whether a 90-day window is still open.",
    "Working out the length of a stay or a project in weeks and days — the calculator reports it as '12 weeks 3 days' as well as a plain day count.",
    "Counting days served or elapsed between two past dates when a form asks for duration rather than start and end.",
  ],
  benefits: [
    [
      "Four units from one subtraction",
      "The same interval comes back as days, weeks-plus-days, decimal weeks, months and years, so you do not need a second conversion step.",
    ],
    [
      "Leap-year-aware averages",
      "Years use 365.25 days and months use 30.44 days, so a multi-year span is not skewed by assuming every year has 365 days.",
    ],
    [
      "Reversed dates still answer",
      "Entering an end date earlier than the start returns the absolute gap and tells you the order is reversed instead of showing a negative or an error.",
    ],
  ],
  faqs: [
    [
      "How do you calculate the number of days between two dates?",
      "Subtract the earlier date from the later one and divide the difference in milliseconds by 86,400,000, the number of milliseconds in a day. This calculator rounds that result to the nearest whole day, so daylight-saving shifts of an hour do not push the count off by one.",
    ],
    [
      "Does the count include both the start and end date?",
      "No — it is the difference between the two dates, so 1 January to 8 January returns 7 days, not 8. If you need an inclusive count, such as billing every calendar day of a stay, add 1 to the result.",
    ],
    [
      "Why does the month figure use 30.44 days?",
      "Because calendar months are 28 to 31 days long, an average month over the 400-year Gregorian cycle is about 30.44 days. Using that average keeps a long span roughly accurate; for an exact calendar count such as '2 months and 3 days', compare the day-of-month values directly.",
    ],
    [
      "How many days are in a year in this calculator?",
      "365.25, the average length of a Gregorian year once leap days are spread across the cycle. That is why 730 days shows as 2.00 years while a span crossing several leap years converts slightly differently from a plain 365-day assumption.",
    ],
  ],
};

export default seo;
