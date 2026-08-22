const seo = {
  title: "Age Difference Calculator: Years, Months and Days",
  metaDescription:
    "Exact age gap between two birth dates in years, months and days, plus total days, weeks and months — calendar-accurate with leap years handled.",
  steps: [
    "Enter each person's name (optional) and \"Date of birth\" — the order does not matter, and \"Swap the two people\" flips the entries.",
    "Optionally set \"Show ages as of\" to today or any past or future date to see how old each person is on that day.",
    "Read the \"Age difference\" in years, months and days, with total days, weeks, months and decimal years below it, then click \"Copy result\".",
  ],
  "intro": "Age Difference Calculator works out the exact gap between two dates of birth in years, months and days, and backs it up with the total days, weeks and months between them. It counts calendar-style — full years first, then whole months, then the leftover days — so leap years and 28-to-31 day months are handled correctly instead of being averaged away. You can also pick any reference date to see how old each person is on that day.",
  "useCases": [
    "Check the exact age gap between siblings, partners or classmates rather than rounding to whole years.",
    "Fill in a form or application that asks for an age difference in years and months.",
    "Work out how far apart two children are for school-admission cut-off dates.",
    "See how old two people will each be on a future date such as a wedding or a milestone birthday."
  ],
  "benefits": [
    [
      "Calendar-accurate, not averaged",
      "Months are counted as real calendar months and leap days are included, so the answer matches how people actually count age."
    ],
    [
      "Multiple views of the same gap",
      "Get years-months-days plus total days, total weeks with leftover days, total months and a decimal-years figure."
    ],
    [
      "Any reference date",
      "Set the 'as of' date to today or any past or future day to see both ages side by side."
    ]
  ],
  "faqs": [
    [
      "How is the age gap in months and days worked out?",
      "The calculator counts the largest number of whole calendar months that fit between the two dates, then adds that many months to the earlier date (clamping to the last day of the target month, so 31 January plus one month lands on 28 or 29 February). Whatever days are left over after that point become the day count. This calendar-anchored approach is why month-end dates such as 31 January to 28 February come out as '1 month, 0 days' rather than '0 months, 28 days'."
    ],
    [
      "Does the order of the two dates matter?",
      "No. The calculator detects which date is earlier and always reports a positive gap, labelling who is older. A swap button is there if you simply want to flip the two entries."
    ],
    [
      "Why does the day count change if I shift both dates by a month?",
      "Because calendar months differ in length. A gap that spans February will show different leftover days than one spanning July. The total-days figure never changes for the same interval, which is why it is shown alongside."
    ],
    [
      "Are leap years included?",
      "Yes. February 29 is counted as a real day, and dates in leap years are validated properly, so the total-days figure is exact."
    ]
  ]
};

export default seo;
