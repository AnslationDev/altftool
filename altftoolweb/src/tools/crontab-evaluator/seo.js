const seo = {
  intro:
    "A crontab evaluator parses a five-field cron expression — minute, hour, day-of-month, month, day-of-week — and lists the exact wall-clock times it will fire next. It implements the crontab(5) rules used by Vixie cron and cronie, including ranges, steps, name aliases such as MON and JAN, the @daily family of macros, and the rule that a day matches if either day field matches when both are restricted. It is for anyone shipping a scheduled job who wants to confirm the schedule before it runs in production.",
  useCases: [
    "Confirm that a backup written as 0 2 * * 0 really runs at 02:00 on Sunday and not on Saturday night",
    "Catch an expression that can never fire, such as 0 0 31 2 * (31 February), before it silently does nothing",
    "Check how far apart runs actually land for a step expression like */7 * * * *, where the gap resets each hour",
  ],
  benefits: [
    ["Real next-run list", "Shows the next occurrences with weekday and date, not just a description of the pattern."],
    ["Both day fields handled correctly", "Implements the OR rule that catches most people out when day-of-month and day-of-week are both set."],
    ["Never-fires detection", "Impossible date and month combinations return a clear message instead of an empty table."],
  ],
  faqs: [
    [
      "What do the five cron fields mean, in order?",
      "Minute (0-59), hour (0-23), day of month (1-31), month (1-12 or JAN-DEC) and day of week (0-7 or SUN-SAT, where both 0 and 7 mean Sunday). So 30 9 * * 1-5 means 09:30, Monday to Friday. A sixth leading field for seconds exists in Quartz and some libraries, but not in standard Unix cron.",
    ],
    [
      "What happens if I set both day-of-month and day-of-week?",
      "Cron fires when EITHER field matches, not both. 0 0 1 * 1 runs at midnight on the 1st of every month AND on every Monday. This OR behaviour only applies when both fields are restricted — if one is *, only the other is consulted. It is documented in crontab(5) and is the single most common cron misunderstanding.",
    ],
    [
      "Does */5 mean every five minutes from when the job was added?",
      "No. Step values are counted from the start of the field's range, not from any start time, so */5 fires at minute 0, 5, 10 … 55 of every hour. That also means a step that does not divide the range evenly resets at the boundary: */7 fires at minutes 0, 7, 14, 21, 28, 35, 42, 49, 56 — and then again at 0, only 4 minutes later.",
    ],
    [
      "Which shorthand macros are supported?",
      "@yearly and @annually (0 0 1 1 *), @monthly (0 0 1 * *), @weekly (0 0 * * 0), @daily and @midnight (0 0 * * *), and @hourly (0 * * * *). @reboot exists in cron but has no fixed time, so it cannot be previewed here.",
    ],
  ],
};

export default seo;
