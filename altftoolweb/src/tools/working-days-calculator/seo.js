const seo = {
  "intro": "Working Days Calculator counts the business days between any two dates, skipping weekends and any holidays you add. You choose which days of the week count as your weekend — Saturday and Sunday, Sunday only, or a Friday-Saturday week — so it works for six-day offices and non-standard rosters too. Alongside the business-day count it reports weekend days, holidays removed, working days per weekday and the total working hours at your chosen hours-per-day.",
  "useCases": [
    "Work out the real delivery or SLA date when a contract promises '15 working days'.",
    "Calculate billable days for a contractor or agency invoice over a project period.",
    "Plan a project timeline that has to skip public holidays and your company's fixed offs.",
    "Check how many working days of leave a date range actually consumes before applying."
  ],
  "benefits": [
    [
      "Custom weekend, not just Sat-Sun",
      "Toggle any combination of weekdays as non-working, which suits six-day weeks and rotational shifts."
    ],
    [
      "Your own holiday list",
      "Add dated holidays with names, or insert India's three fixed national holidays for every year in the range in one click."
    ],
    [
      "Hours as well as days",
      "Set hours per working day and the tool converts the business-day count into total working hours for billing or capacity planning."
    ]
  ],
  "faqs": [
    [
      "Does the count include the start and end dates?",
      "The start date is always included if it is a working day. The end date is included by default, and you can switch it off if your range is meant to be exclusive."
    ],
    [
      "What happens if a holiday falls on a weekend?",
      "It is counted once, as a weekend day. It does not reduce the working-day total a second time, and it is left out of the 'holidays removed' list."
    ],
    [
      "Which holidays are built in?",
      "Only India's three fixed-date national holidays — Republic Day on 26 January, Independence Day on 15 August and Gandhi Jayanti on 2 October. Festival dates move each year and state holiday lists differ, so add those manually from your official calendar."
    ],
    [
      "Can I use it for a six-day working week?",
      "Yes. Deselect Saturday in the weekend picker so only Sunday is treated as non-working, and the count updates immediately."
    ]
  ]
};

export default seo;
