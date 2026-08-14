const seo = {
  title: "Occasion Reminder: Recurring Dates and Lead Times",
  metaDescription:
    "Roll yearly or monthly dates forward, set a per-entry lead time, and sort into Today, This Week, Upcoming, Missed or Completed. Export JSON or CSV.",
  steps: [
    "Press '+ Add Occasion' (or Load Preset Pack) and fill in the title, a Category of Personal, Family, Work or Finance, the event date, a Recurrence of One Time, Monthly or Yearly, the remind-days-before figure and a Priority of Low, Medium or High.",
    "Narrow the list with the All Status and All Categories dropdowns, and tick Completed on anything already handled.",
    "The Reminder Timeline table lists Next Date, Reminder Date and a status of Upcoming, This Week, Today, Missed, Completed or Need Date, 'Clear Next Steps' ranks six actions, and Export JSON or Export CSV downloads occasion-reminders.json or occasion-reminders.csv.",
  ],
  intro:
    "The Occasion Reminder builds a prep schedule from a list of dates: for each occasion it rolls a yearly or monthly recurrence forward to the next date still in the future, subtracts your chosen lead time to get a reminder date, and sorts everything into Today, This Week, Upcoming, Missed or Completed. A priority score — 30 points for high, 15 for medium, 5 for low, plus 30 if the date is today and 20 if it falls within seven days — ranks the top six things to act on next. The whole list exports to JSON or CSV so it can move into a calendar or task manager.",
  useCases: [
    "You keep forgetting your mother's birthday until the day before — set a 14-day lead so the reminder date lands while there is still time to order a gift.",
    "Rent, an insurance premium and a subscription all renew on different days each month, and you want one view showing which of them falls inside the next seven days.",
    "You are handing over a set of recurring team dates to a colleague and want them as a CSV with the event date, reminder date and status already computed.",
  ],
  benefits: [
    [
      "Recurrence rolls forward automatically",
      "A yearly or monthly date advances until it is in the future, so a 2019 anniversary shows its next occurrence rather than reading as long overdue.",
    ],
    [
      "Reminder date, not just event date",
      "Each entry carries its own lead time, so a 3-day heads-up for rent and a 14-day one for a gift sit in the same list without compromise.",
    ],
    [
      "Ranked next actions",
      "The priority score combines importance with urgency and surfaces six specific instructions, instead of leaving you to scan the whole list.",
    ],
  ],
  faqs: [
    [
      "Does this send me notifications?",
      "No. It calculates and displays reminder dates rather than pushing alerts — nothing is emailed, texted or sent to your phone. Export the schedule as CSV or JSON and import it into a calendar or task app if you want the actual alerts.",
    ],
    [
      "How far ahead should I set the reminder lead time?",
      "Match it to how long the preparation takes: 3 days is enough for a payment transfer, while 14 days is the default in the built-in preset for a birthday that needs a gift ordered and delivered. The tool defaults to 7 days and computes the reminder date as the event date minus that many days.",
    ],
    [
      "What do the status labels mean?",
      "Today means the next occurrence is today, This Week means it falls within the next 7 days, Upcoming is anything beyond that, and Missed means the date has passed without being marked complete. Need Date simply means the entry has no date filled in yet.",
    ],
    [
      "Is my list saved if I close the tab?",
      "No. Entries live only in the current page session and are cleared on reload, which is why the export buttons exist. Download the JSON or CSV before closing if you want to keep the schedule.",
    ],
  ],
};

export default seo;
