const seo = {
  title: "Sexual Health Test Tracker with Retest Reminders",
  metaDescription:
    "Log each screening as test | date | result | next review | reference and see days left or days overdue against a reminder window you set.",
  steps: [
    "Enter one screening per line in 'Private test records' as test name | date taken | result or status | next review date | private reference.",
    "Set 'Review date' to today and 'Reminder window (days)' to the lead time you want — it starts at 30.",
    "Read the Reminder column of the results table: it shows a countdown marked upcoming inside the window, or the number of days overdue past the next review date.",
  ],
  intro:
    "This tracker keeps a private list of sexual health screenings — test name, the date it was taken, the result you were given, the next review date and your own reference — and counts the days between today and each next-review date so you can see what is coming up or already overdue. Anything falling within your reminder window, 30 days by default, is flagged as upcoming; anything past its date is shown with the number of days it has been outstanding. It is an organiser for people managing a regular testing schedule, not a source of results or interpretation.",
  useCases: [
    "Your clinic told you to come back in six months for a repeat screen and you want one line that tells you how many days are left rather than counting on a calendar.",
    "You have had tests done at three different places — a clinic, a home kit and a GP — and want them in a single list with the portal or reference for each.",
    "You are between partners and want to check, before a conversation about testing, exactly which screens are current and which have lapsed.",
  ],
  benefits: [
    [
      "Turns dates into a countdown",
      "Every row shows days remaining, or how many days overdue, instead of leaving you to compare two dates in your head.",
    ],
    [
      "One adjustable warning window",
      "Change the reminder window once and every record is re-flagged against it, so a 14-day lead time or a 60-day one is a single edit.",
    ],
    [
      "Your own reference column",
      "Each entry carries a free-text reference — clinic portal, kit number, a doctor's name — so you know where to go to retrieve the actual report.",
    ],
  ],
  faqs: [
    [
      "Is anything I type here sent anywhere?",
      "No. The calculation runs in your browser and the entries are saved only to that browser's local storage on that device — there is no account and no upload. Anyone with access to the same browser profile could see them, so use a device only you unlock, and clear the field if you are on a shared computer.",
    ],
    [
      "How do I enter a record?",
      "One test per line with five parts separated by the pipe character: test name, date taken, result or status, next review date, and a private reference. For example: HIV screening | 2026-05-01 | Negative | 2026-11-01 | Clinic portal.",
    ],
    [
      "What counts as due for review?",
      "Anything whose next review date has already passed is marked overdue with the day count, and anything within the reminder window — 30 days unless you change it — is marked upcoming. A row with a missing or unreadable next date is flagged so you go back and fill it in.",
    ],
    [
      "Can it tell me how often I should be tested?",
      "No, and it does not interpret results. Which tests you need, how often, window periods before a result is reliable, prophylaxis after an exposure, and vaccination are all clinical decisions that depend on your circumstances — speak to a sexual health clinic or your doctor. A possible recent exposure can be time-critical, so seek care straight away rather than waiting for a scheduled review.",
    ],
  ],
};

export default seo;
