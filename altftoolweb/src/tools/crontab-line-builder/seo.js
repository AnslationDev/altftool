const seo = {
  title: "Crontab Line Builder: Next-Run Preview & flock",
  metaDescription:
    "Validate a five-field cron schedule, read it in plain English, preview next runs in your timezone, and wrap the command with logging, timeout and flock.",
  steps: [
    "Type the \"Schedule (minute hour day month weekday, or @daily style)\" or tap a preset chip, then enter the \"Command to run\".",
    "Optionally set \"Log file\", \"Lock file for flock\", \"Working directory\", \"Timeout in seconds\", MAILTO, and the \"Set a sane PATH\" and \"Set SHELL=/bin/bash\" checkboxes.",
    "Check the \"In plain English\" readout and the \"Next run (your timezone)\" list, then click \"Copy crontab block\" and install it with crontab -e.",
  ],
  intro:
    "This builder assembles a complete, safe crontab entry: it validates the five-field schedule against Vixie cron syntax (man 5 crontab), translates it into plain English, previews the next run times in your timezone, and wraps the command with output logging, a timeout and an flock guard so runs never overlap. It is made for developers and sysadmins who want more than a bare '30 2 * * * script.sh' — including the SHELL, PATH and MAILTO lines cron actually needs.",
  useCases: [
    "Scheduling a nightly backup at 02:30 with logging to /var/log and flock so a slow run never overlaps the next",
    "Decoding an inherited crontab line into plain English and checking exactly when it will fire next",
    "Debugging a job that works in the terminal but fails under cron because of cron's minimal PATH=/usr/bin:/bin",
  ],
  benefits: [
    ["Validated, explained, previewed", "Every field is checked against real cron ranges, described in words, and projected onto the next five run times."],
    ["Overlap-safe wrapper", "Optional flock -n and timeout wrappers stop stacked or hung runs — the two classic cron failure modes."],
    ["The env lines included", "Emits SHELL, PATH and MAILTO so the job runs the same under cron as it does in your shell."],
  ],
  faqs: [
    [
      "Why does my script work in the terminal but fail in cron?",
      "Almost always PATH: cron runs commands with a minimal environment where PATH is just /usr/bin:/bin, no profile is sourced, and SHELL defaults to /bin/sh. Use absolute paths or set PATH= at the top of the crontab — the builder adds both for you.",
    ],
    [
      "What do the five fields in a crontab line mean?",
      "In order: minute (0-59), hour (0-23), day of month (1-31), month (1-12 or JAN-DEC) and day of week (0-7 or SUN-SAT, where both 0 and 7 are Sunday). Each accepts lists (1,15), ranges (9-17) and steps (*/5).",
    ],
    [
      "What happens if I set both day-of-month and day-of-week in cron?",
      "The job runs when EITHER matches, not both — '0 0 13 * 5' fires on every 13th AND every Friday. This union rule is in the crontab(5) man page and surprises almost everyone; leave one of the two fields as * unless you really want the union.",
    ],
    [
      "How do I stop a cron job from running twice at once?",
      "Wrap the command in flock: flock -n /tmp/job.lock -c 'your-command' exits immediately when a previous run still holds the lock. The builder adds this wrapper plus an optional timeout so a hung run cannot hold the lock forever.",
    ],
  ],
};

export default seo;
