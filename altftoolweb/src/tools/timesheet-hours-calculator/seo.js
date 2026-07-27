const seo = {
  "intro": "Timesheet Hours Calculator turns a week of clock in and clock out times into a payable total. Each day takes an in time, an out time and unpaid break minutes; the tool handles shifts that run past midnight, then splits the week into regular and overtime hours against a threshold you set. It also estimates gross pay from an hourly rate and an overtime multiplier, so hourly staff, shift workers and small employers can check a payslip before it is submitted.",
  "useCases": [
    "Add up a retail or hospitality week where shifts start and finish at different times each day.",
    "Check a payroll timesheet before submitting it, including a 30-minute unpaid lunch on each weekday.",
    "Work out how many hours went over a 40-hour week and what they are worth at a 1.5x overtime rate."
  ],
  "benefits": [
    [
      "Whole week in one view",
      "Seven editable days with per-day totals and a running weekly figure in hours and decimal hours."
    ],
    [
      "Breaks and night shifts handled",
      "Unpaid breaks are deducted per day and an out time earlier than the in time is treated as the next morning."
    ],
    [
      "Overtime split and pay estimate",
      "Set your own overtime threshold and multiplier to see regular pay, overtime pay and the gross total."
    ]
  ],
  "faqs": [
    [
      "How do I calculate total hours worked in a week?",
      "Work out each day's elapsed time, subtract unpaid breaks, then add the daily totals together. This tool does all three steps and also converts the result to decimal hours for payroll entry."
    ],
    [
      "Are unpaid lunch breaks deducted from worked hours?",
      "Normally yes — an unpaid meal break is not working time, so it is subtracted from the shift. Enter only unpaid minutes; paid rest breaks should be left out of the break field."
    ],
    [
      "How is overtime calculated?",
      "Hours above your weekly threshold count as overtime and are paid at the multiplier you set, commonly 1.5x. Thresholds and premiums vary by country, contract and award, so use your own figures — this is an estimate, not legal advice."
    ],
    [
      "Does this handle shifts that cross midnight?",
      "Yes. If the clock out time is the same as or earlier than the clock in time, the day is treated as running into the next morning, so a 21:00 to 05:00 shift counts as 8 hours."
    ]
  ]
};

export default seo;
