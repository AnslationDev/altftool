const seo = {
  title: "Time Duration Calculator: Hours Between Two Times",
  metaDescription:
    "Hours between two times as h:mm, decimal hours and total minutes — overnight shifts handled, unpaid breaks deducted, rounding to 5, 6, 15 or 30 minutes.",
  steps: [
    "Enter a \"Start time\" and \"End time\", plus any \"Unpaid break (minutes)\" and \"Extra full days between\" — or tap a Quick example like \"Night shift 22:00 to 06:00\".",
    "Pick a \"Rounding\" option: Exact (1 minute), or nearest 5, 6 (0.1 h), 15 or 30 minutes — an end time earlier than the start is automatically treated as the next day.",
    "Read the Duration in hours and minutes with decimal hours, total minutes, total seconds and share of an 8-hour day, then click \"Copy result\".",
  ],
  "intro": "Time Duration Calculator measures the exact gap between two clock times and returns it three ways: hours and minutes, decimal hours, and total minutes. It handles overnight periods automatically, deducts unpaid breaks, and can round to the nearest 5, 6, 15 or 30 minutes — the increments payroll and billing systems actually use. Useful for shift workers, freelancers filling timesheets, and anyone converting 8h 45m into 8.75 hours.",
  "useCases": [
    "Convert a 09:15 to 17:40 shift with a 30-minute lunch into decimal hours for a payroll form.",
    "Work out paid hours for a night shift that starts at 22:00 and finishes at 06:00 the next morning.",
    "Check how long a client call or study block actually ran before logging it against a project."
  ],
  "benefits": [
    [
      "Decimal hours instantly",
      "See 8h 45m as 8.75 hours, the format most payroll and invoicing systems expect."
    ],
    [
      "Overnight aware",
      "If the end time is earlier than the start time it is treated as the next day, so night shifts add up correctly."
    ],
    [
      "Payroll rounding built in",
      "Round to the nearest 5, 6, 15 or 30 minutes and still see the exact unrounded duration."
    ]
  ],
  "faqs": [
    [
      "How do I convert minutes to decimal hours?",
      "Divide the minutes by 60. So 45 minutes is 45 / 60 = 0.75, making 8h 45m equal to 8.75 decimal hours. The calculator does this for you and shows both formats side by side."
    ],
    [
      "How does the calculator handle a shift that crosses midnight?",
      "If the end time is the same as or earlier than the start time and no extra days are set, it adds 24 hours. A 22:00 to 06:00 shift is therefore counted as 8 hours, not a negative value."
    ],
    [
      "Should I deduct my lunch break from worked hours?",
      "That depends on your contract. Unpaid meal breaks are normally deducted from paid time, while short paid rest breaks are not. Enter only the unpaid minutes in the break field."
    ],
    [
      "Why do employers round time to 6 or 15 minutes?",
      "Six minutes equals 0.1 of an hour and 15 minutes equals 0.25, so both convert to clean decimal values on a payslip or invoice. This tool offers both, plus 5 and 30 minute rounding, and always shows the exact figure too."
    ]
  ]
};

export default seo;
