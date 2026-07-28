const seo = {
  intro:
    "This planner checks a set of paternity leave blocks against the four limits every paternity policy is built from: the total day allowance, the window that runs from the birth date, the smallest block you are allowed to take, and how many separate blocks are permitted. Enter the birth or due date and the leave you want to book, and it returns each block's end date, days still available, and a plain warning for any block that starts too early, finishes after the window closes, overlaps another, or breaks the minimum block rule. Presets cover UK statutory paternity leave, India's Rule 43-A for central government staff and Singapore's government-paid scheme, and every field stays editable for a company policy.",
  useCases: [
    "Splitting two weeks of UK statutory paternity leave into one week at the birth and one week when the partner returns to work.",
    "Checking that a second block still finishes inside the 52-week window before requesting it.",
    "An HR team validating a leave request against a company handbook that allows three blocks of at least five days.",
    "A central government employee in India confirming that leave taken 10 days before delivery is inside the Rule 43-A window.",
  ],
  benefits: [
    ["Catches window breaches", "Flags any block that ends after the window closes, using the exact closing date."],
    ["Overlap detection", "Sorts blocks by date and reports blocks that collide instead of silently double-counting days."],
    ["Editable policy", "Presets fill the fields, but every limit can be overwritten to match your own handbook."],
  ],
  faqs: [
    [
      "How much paternity leave can I take in the UK?",
      "Two weeks of statutory paternity leave, taken as a single two-week block or as two separate one-week blocks, and it must be finished within 52 weeks of the birth. You cannot take odd days — each block is a whole week.",
    ],
    [
      "Is there statutory paternity leave in India?",
      "There is no statutory paternity leave for private-sector employees in India. Male central government servants with fewer than two surviving children get 15 days under Rule 43-A of the CCS (Leave) Rules, from 15 days before delivery up to 6 months after it; private employers set their own policy, commonly 5 to 15 days.",
    ],
    [
      "Can paternity leave be split into separate blocks?",
      "It depends on the scheme. UK statutory leave allows two blocks of one week, Singapore's four weeks can be taken flexibly within 12 months, and many company policies allow two or three blocks. This planner lets you set the maximum block count and minimum block length so the check matches your own rule.",
    ],
    [
      "Does the planner count working days or calendar days?",
      "Calendar days. If your policy is written in working days, enter the equivalent calendar span for each block, or treat the day figures as working days and read the end dates as indicative. Weekends and public holidays are not deducted.",
    ],
  ],
};

export default seo;
