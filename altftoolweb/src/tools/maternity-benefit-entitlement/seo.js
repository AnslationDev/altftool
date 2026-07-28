const seo = {
  intro:
    "This calculator answers the question the Maternity Benefit Act, 1961 asks first: on what date will a woman have actually worked eighty days for her employer inside the twelve months immediately preceding her expected date of delivery, which is the section 5(2) condition without which no maternity benefit is payable at all. From there it dates the whole entitlement — 26 weeks under section 5(3), of which not more than eight may precede the expected date of delivery, or 12 weeks with not more than six preceding it for a woman who already has two or more surviving children — and prints the earliest permissible leave start, the leave end and the rejoining date. It is built for HR and payroll teams applying the Act as amended by the Maternity Benefit (Amendment) Act, 2017, and for women who need to see whether the eighty-day clock lands before or after their leave begins.",
  useCases: [
    "An HR manager processing a maternity notice from someone who joined four months ago, needing the exact date the eighty days of actual work under section 5(2) will be completed and whether that date falls before her intended leave start.",
    "A payroll executive dating a 26-week block that starts eight weeks before the expected delivery date, and checking the rejoining date against the section 4(2) bar on employing a woman during the six weeks immediately following delivery.",
    "A compliance officer working out the 12-week block for a commissioning mother under section 5(4), the six weeks after a medical termination under section 9, or the two weeks after a tubectomy under section 9A.",
  ],
  benefits: [
    [
      "The qualification date, not just a yes or no",
      "When the eighty days are not yet complete, the page gives the calendar date the eightieth day of actual work falls on, and says whether that date is still inside the twelve-month window preceding the expected delivery date.",
    ],
    [
      "Every figure carries its section",
      "80 days from section 5(2), 26 or 12 weeks from section 5(3), 8 or 6 pre-natal weeks from the same sub-section, 12 weeks from section 5(4), 6 from section 9, 2 from section 9A, 15 months of nursing breaks from section 11 and the 50-employee creche line from section 11A.",
    ],
    [
      "Flags the collisions the Act creates",
      "A 12-week block begun at the full six weeks before the expected delivery date ends one day inside the section 4(2) six-week post-delivery employment bar — the page names that clash instead of printing a clean date.",
    ],
  ],
  faqs: [
    [
      "How many days must I have worked to get maternity leave in India?",
      "Eighty days of actual work with the employer you are claiming from, inside the twelve months immediately preceding your expected date of delivery. That is section 5(2) of the Maternity Benefit Act, 1961. The Explanation to that sub-section counts days you were laid off and days declared as holidays with wages as days actually worked, and the proviso removes the eighty-day condition for a woman who immigrated into the State of Assam while pregnant.",
    ],
    [
      "Is maternity leave in India 26 weeks or 12 weeks?",
      "26 weeks, unless you already have two or more surviving children, in which case section 5(3) caps it at 12 weeks. Of the 26 weeks not more than 8 may fall before the expected date of delivery; of the 12 weeks not more than 6 may. An adopting mother of a child under three months and a commissioning mother get 12 weeks from the date the child is handed over, under section 5(4).",
    ],
    [
      "How much leave is allowed for a miscarriage or a tubectomy?",
      "Six weeks immediately following the day of a miscarriage or medical termination of pregnancy under section 9, and two weeks immediately following the day of a tubectomy operation under section 9A, both with wages at the rate of maternity benefit. Section 10 adds up to one further month of leave for illness arising out of pregnancy, delivery, premature birth, miscarriage, medical termination or tubectomy.",
    ],
    [
      "What does the employer owe after I return to work?",
      "Two nursing breaks a day in addition to the rest interval, until the child is fifteen months old, under section 11. An establishment with fifty or more employees must have a creche and must allow four visits a day to it under section 11A. Section 12 makes discharge or dismissal during, or on account of, that absence void, and section 27 lets any award, agreement or contract give more than the Act — never less.",
    ],
  ],
};

export default seo;
