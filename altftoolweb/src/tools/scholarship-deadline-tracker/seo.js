const seo = {
  title: "Scholarship Deadline Tracker: Days Left",
  steps: [
    "Fill each deadline row with the scholarship or task name, an optional 'Opens' date and its 'Closes' date, adding more rows with 'Add deadline'.",
    "Set 'Count days from' (defaults to today) and the closing-soon horizon in days (default 7) to control how each deadline is classified.",
    "Read the 'Next deadline' countdown with open / closing soon / not open / closed counts and per-row days left, then hit 'Copy result' for a text summary.",
  ],
  intro:
    "The Scholarship Deadline Tracker computes the exact number of days left on every scholarship application window, renewal and document deadline you enter, and sorts them by urgency. It classifies each entry as open, closing soon, not yet open or closed using plain calendar-day arithmetic from a reference date you control, so students juggling NSP, state-portal and college deadlines can see at a glance what needs attention this week.",
  useCases: [
    "A student with fresh and renewal applications on the National Scholarship Portal checking how many days remain before the portal closes",
    "A parent tracking income certificate, bonafide certificate and bank-passbook submission dates alongside the main application deadline",
    "A class teacher keeping one list of every scholarship her students applied to, sorted by whichever closes first",
  ],
  benefits: [
    ["Days-left countdown", "Every deadline shows a precise day count from your chosen reference date, not a vague month."],
    ["Urgency sorting", "Entries are ordered soonest-first with closed items pushed to the bottom, so the top row is always the next action."],
    ["Window aware", "An optional open date marks schemes that have not started accepting applications yet."],
  ],
  faqs: [
    [
      "When do National Scholarship Portal applications usually close?",
      "The NSP window typically runs from around July to October-November each year, but the exact close date changes annually and is often extended by notification. Because the dates move, enter the deadline published on scholarships.gov.in for the current cycle and track the day count from there.",
    ],
    [
      "What happens if I miss a scholarship deadline?",
      "Most portals hard-close on the deadline and late applications are simply not accepted; a missed renewal usually means reapplying as fresh the next cycle, if the scheme allows it. A few schemes reopen with an extended date, so keep the closed entry in your list and watch the official portal for extension notices.",
    ],
    [
      "What does the closing-soon flag mean in this tracker?",
      "By default any deadline within 7 days (including today) is flagged as closing soon; you can change the horizon to any number of days. A deadline that falls on the reference date itself shows 0 days left and is still counted as actionable, not closed.",
    ],
    [
      "Does this tracker send me reminders?",
      "No — it is a calculator, not a notification service, and your dates never leave the page. Copy the summary into your notes or calendar app and set reminders there; re-open the page any day to get fresh day counts.",
    ],
  ],
};

export default seo;
