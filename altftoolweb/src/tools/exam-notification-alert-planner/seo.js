const seo = {
  intro:
    "This planner turns the expected notification month of every exam you follow into concrete dates: the 1st of that month as the earliest-plausible drop date, and a reminder date a chosen lead (default 15 days) before it. It is for aspirants tracking several recruitment cycles at once — UPSC, SSC, banking, NTA exams — who want a single sorted list of what is coming next instead of refreshing six websites.",
  useCases: [
    "An aspirant preparing for both SSC CGL and IBPS PO sees which notification is expected first and when to start arranging documents",
    "A final-year student following JEE Main session 1 sets a reminder two weeks before November so registration photos and IDs are ready",
    "A UPSC candidate returning after a break rebuilds their annual calendar of expected notification months in one list",
  ],
  benefits: [
    ["One sorted timeline", "Every followed exam ranked by days until its expected notification month."],
    ["Reminder dates, not vibes", "A concrete calendar date to set your phone alert, with a configurable lead."],
    ["Prepare-now flags", "Exams whose reminder date has already passed are flagged before the window opens."],
  ],
  faqs: [
    [
      "When are government exam notifications usually released?",
      "Each body keeps a broadly stable month across cycles — for example UPSC Civil Services notifications have typically appeared around February and SSC CGL around June in recent years — but exact dates move annually. Anchor plans to the start of the expected month and verify against the body's official annual calendar when it is published.",
    ],
    [
      "How many days before a notification should I set a reminder?",
      "This planner defaults to 15 days before the expected month begins. Most application windows stay open only 3-4 weeks, so a two-week head start gives time to arrange scanned photographs, category certificates and fee payment without racing the deadline.",
    ],
    [
      "Does this tool send me actual notifications?",
      "No — it computes the dates and you add them to your phone or calendar app yourself. The exam list lives only in the page while it is open, so copy the plan out with the copy button when you are done.",
    ],
    [
      "What happens if a notification month has already passed this year?",
      "The planner rolls the alert to the same month next year automatically. If the expected month has arrived but the notification is not out yet, the exam is flagged so you know to check the official site directly.",
    ],
  ],
};

export default seo;
