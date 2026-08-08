const seo = {
  title: "Cron Expression Generator With Next 5 Run Times",
  metaDescription:
    "Turn hourly, daily, weekly, monthly or every-N-minutes into a five-field cron string, with a plain-English reading and the next five run times.",
  intro:
    "The Cron Expression Generator turns a plain schedule choice — every minute, hourly, daily, weekly, monthly, or every N minutes — into a standard five-field cron string (minute, hour, day-of-month, month, day-of-week) and shows the next five times it will actually fire. It is for anyone wiring up a crontab entry, a CI job, or a scheduled task who wants to confirm the expression means what they think before it goes live. Alongside the expression you get a plain-English summary such as \"Runs every Monday at 09:30\" and a list of the upcoming run times in your local timezone.",
  useCases: [
    "You are adding a nightly database backup to a server crontab and need the exact string for 02:15 every day without second-guessing which field is the hour.",
    "A weekly report job is meant to run Monday morning, but you are not sure whether Monday is 0 or 1 in the day-of-week field — the preview lists the next five run dates so you can see the weekday it lands on.",
    "You want a health check every 15 minutes and need the step syntax (*/15) written correctly rather than typing out four separate minute values.",
  ],
  benefits: [
    [
      "Shows the next five real run times",
      "The generator walks the clock forward minute by minute from now, so you see actual dates and times rather than trusting the expression on faith.",
    ],
    [
      "Plain-English summary next to the syntax",
      "Every expression comes with a one-line reading of what it does, which is what catches an hour and minute swapped by mistake.",
    ],
    [
      "Presets that map to the field you actually change",
      "Picking hourly, daily, weekly or monthly exposes only the inputs that matter for that shape, instead of five raw fields you have to reason about together.",
    ],
  ],
  faqs: [
    [
      "What do the five fields in a cron expression mean?",
      "In order, they are minute (0–59), hour (0–23), day of month (1–31), month (1–12), and day of week (0–6). This generator emits that standard five-field form, so `30 9 * * 1` means 09:30 every Monday.",
    ],
    [
      "How do I write a cron job that runs every 15 minutes?",
      "Use `*/15 * * * *`. The `*/N` step syntax in the minute field fires whenever the minute is divisible by N, so every 15 minutes means it runs at :00, :15, :30 and :45 of every hour.",
    ],
    [
      "Is Sunday 0 or 7 in cron?",
      "In the day-of-week field this generator uses 0 for Sunday through 6 for Saturday. Many cron implementations also accept 7 as an alias for Sunday, but 0 is the value that works everywhere, so that is what is emitted.",
    ],
    [
      "What timezone are the preview run times in?",
      "The preview times are rendered in your own browser's local timezone. Your server almost certainly runs cron in its own configured timezone — often UTC — so compare the offset before relying on the preview for a production schedule.",
    ],
  ],
};

export default seo;
