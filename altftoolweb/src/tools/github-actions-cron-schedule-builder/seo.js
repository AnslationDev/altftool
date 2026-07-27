const seo = {
  intro:
    "This builder converts a local wall-clock time into the UTC cron expression GitHub Actions actually requires for on.schedule triggers, using POSIX 5-field cron syntax. It handles the part people get wrong by hand: when the UTC conversion crosses midnight it shifts the day-of-week field too, so a Monday 02:00 IST job correctly becomes 30 20 * * 0 (Sunday in UTC). A preview table shows the run time for teammates in six timezones.",
  useCases: [
    "Scheduling a nightly build at 2 a.m. India time and getting the correct previous-day UTC cron with the day field shifted",
    "Moving a weekly report job off 00:00 UTC after noticing runs arrive 30 minutes late during peak load",
    "Documenting for a distributed team exactly when the Monday/Wednesday/Friday dependency scan fires in each office",
  ],
  benefits: [
    ["Midnight-crossing handled", "Day-of-week and day-shift arithmetic is done for you when local time maps to the previous or next UTC day."],
    ["Load-aware warnings", "Flags 00:00 UTC and on-the-hour schedules, the slots GitHub's own docs warn get delayed or dropped."],
    ["Team preview", "Shows the resulting run time in UTC, New York, Los Angeles, Berlin, India and Tokyo."],
  ],
  faqs: [
    [
      "What timezone does GitHub Actions cron use?",
      "UTC, always — the schedule event has no timezone setting. To run at a local time you must convert it to UTC yourself, and re-check the entry when daylight saving shifts your offset, because cron cannot follow DST.",
    ],
    [
      "What is the minimum interval for a GitHub Actions schedule?",
      "Five minutes — */5 * * * * is the most frequent schedule GitHub accepts. Anything shorter is invalid, and even valid schedules are best-effort: runs can be delayed or skipped entirely during periods of high load on GitHub's infrastructure.",
    ],
    [
      "Why does my scheduled GitHub Actions workflow not run exactly on time?",
      "Scheduled workflows are queued, not guaranteed, and the start of every hour — especially 00:00 UTC — is when thousands of workflows fire at once. GitHub's documentation recommends choosing an arbitrary minute like :17 or :43 to avoid the rush; delays of many minutes at popular slots are normal.",
    ],
    [
      "Why did my scheduled workflow stop running?",
      "On public repositories GitHub automatically disables scheduled workflows after 60 days without repository activity, and schedules only run from the default branch. A commit or manual re-enable in the Actions tab restores them; workflows on other branches never fire on schedule.",
    ],
  ],
};

export default seo;
