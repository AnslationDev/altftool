const seo = {
  intro:
    "This planner converts a semester fee schedule into the amount you actually have to set aside each month, treating every instalment as its own sinking fund rather than dividing the total by the number of months. Each instalment's monthly set-aside is the annuity payment that grows to that instalment by its own due date, existing savings are applied to the earliest due dates first, and the plan reports the due date and a reminder date for every payment.",
  useCases: [
    "A four-semester programme charges ₹1 lakh every six months and you want the monthly amount to start saving now.",
    "You already hold ₹1.5 lakh towards fees and want to know how much of the schedule that clears before you commit to a monthly transfer.",
    "Building a calendar of fee due dates with a 15-day reminder so a late fee is never triggered.",
  ],
  benefits: [
    ["Nearest due date funded first", "Dividing the total by total months under-funds the instalment that falls due soonest; per-instalment sinking funds do not."],
    ["A commitment that steps down", "The monthly figure drops each time a semester is paid, so you can see when the pressure eases."],
    ["Reminder dates included", "Every due date carries a calculated reminder date at your chosen lead time."],
  ],
  faqs: [
    [
      "How much should I save monthly for college fees?",
      "Work out each instalment separately: divide it by the number of monthly deposits you can make before its own due date, then add those figures for every unpaid instalment. For ₹1 lakh due in 1 month and three more ₹1 lakh instalments at 7, 13 and 19 months, the first month needs about ₹1.27 lakh and later months around ₹27,000.",
    ],
    [
      "Why is dividing the total fee by the total months wrong?",
      "Because the money must exist on each due date, not at the end. Splitting ₹4 lakh over 19 months gives about ₹21,000 a month, which leaves you far short of the ₹1 lakh due next month while over-saving for the instalment due in year two.",
    ],
    [
      "Where should college fee savings be kept?",
      "In something you can withdraw on the due date without a loss or a lock-in — a savings account, a recurring deposit maturing before the due date, or a liquid fund. Equity is unsuitable for money needed within a year or two because a fall in the wrong month cannot be waited out.",
    ],
    [
      "Does the tool send reminders?",
      "No. It calculates a reminder date at your chosen lead time — 15 days before the due date by default — and shows it alongside each instalment so you can add it to your own calendar. Always confirm the exact dates and any late-fee rule in the institution's fee notice.",
    ],
  ],
};

export default seo;
