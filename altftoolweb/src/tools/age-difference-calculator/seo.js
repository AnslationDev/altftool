const seo = {
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
      "The calculator subtracts the earlier date from the later one field by field. If the day number goes negative it borrows the actual number of days from the preceding calendar month, and if the month goes negative it borrows 12 months from the year."
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
