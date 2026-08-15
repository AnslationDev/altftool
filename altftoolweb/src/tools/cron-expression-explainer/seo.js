const seo = {
  title: "Cron Expression Explainer with Next 5 Run Times",
  metaDescription:
    "Turn any crontab expression or @macro into plain English, a field-by-field breakdown and the next five run times in UTC, either/or day rule included.",
  steps: [
    "Type a 5-field crontab expression or an @macro into Cron expression, or tap an example chip like */15 9-17 * * MON-FRI.",
    "Set Predict next runs from (UTC) — parsing is live, so the plain-English sentence and Field-by-field breakdown update as you type.",
    "Read Next 5 runs (UTC) and press Copy result to copy the sentence, breakdown and run times as one text block.",
  ],
  intro:
    "This explainer parses any standard 5-field crontab expression — minute, hour, day-of-month, month, day-of-week — and translates it into a plain-English sentence, a field-by-field breakdown and the next five run times in UTC. It implements the crontab(5) grammar exactly, including @macros like @daily, name tokens like MON or JAN, and Vixie cron's either/or rule when both day fields are restricted, so what it says matches what your cron daemon will actually do.",
  useCases: [
    "A developer reviewing a pull request who wants to verify that */15 9-17 * * MON-FRI really means every 15 minutes during office hours",
    "An SRE debugging why a job fired on a Wednesday when the crontab said day 15 — the either/or day rule in action",
    "A student learning cron who wants each of the five fields decoded with its allowed range and matched values",
  ],
  benefits: [
    ["True crontab semantics", "Implements the crontab(5) grammar including steps, ranges, lists, names and 7-as-Sunday."],
    ["Next runs, not just words", "Shows the next five occurrences in UTC computed from any start time you choose."],
    ["Either/or rule handled", "When both day-of-month and day-of-week are set, the schedule matches either — exactly like Vixie cron."],
  ],
  faqs: [
    [
      "What do the 5 fields in a cron expression mean?",
      "In order: minute (0-59), hour (0-23), day-of-month (1-31), month (1-12 or JAN-DEC) and day-of-week (0-7 or SUN-SAT, where both 0 and 7 mean Sunday). Each field takes a value, a range like 9-17, a step like */15, or a comma-separated list, and an asterisk means every allowed value.",
    ],
    [
      "What happens when both day-of-month and day-of-week are set in cron?",
      "The job runs when either field matches, not both — this is the rule from crontab(5) that surprises most people. So 0 12 15 * 3 runs at noon on the 15th of every month and on every Wednesday, which is why a job restricted to \"the 15th\" can also fire mid-week.",
    ],
    [
      "What does */15 mean in a cron expression?",
      "It means every 15th value across the field's full range — in the minute field, minutes 0, 15, 30 and 45. A step can also apply to a range: 9-17/2 in the hour field matches 9, 11, 13, 15 and 17, and a bare value with a step like 5/10 means from 5 to the maximum in steps of 10.",
    ],
    [
      "Does cron run in UTC or local time?",
      "Classic cron daemons evaluate expressions in the server's local timezone, not UTC, though many modern runners (Kubernetes CronJobs by default, most CI schedulers) use UTC. This tool predicts run times in UTC; if your server runs in another timezone, shift the predictions by that offset or set CRON_TZ where your cron implementation supports it.",
    ],
  ],
};

export default seo;
