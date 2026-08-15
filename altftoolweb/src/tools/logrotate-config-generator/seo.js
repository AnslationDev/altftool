const seo = {
  title: "Logrotate Config Generator with Conflict Warnings",
  metaDescription:
    "Build an /etc/logrotate.d/ rule — frequency, rotate N, compression, create modes and a postrotate hook — with warnings for size vs maxsize conflicts.",
  steps: [
    "Enter the log path or glob (default /var/log/myapp/*.log), pick a rotation frequency and set 'Rotations to keep (rotate N)'.",
    "Choose a size trigger (maxsize, size or minsize), toggle directives like compress, delaycompress, dateext or copytruncate, and type postrotate command(s) one per line.",
    "Click 'Copy config' to copy the generated /etc/logrotate.d/ rule; the install hint names the target file and warnings flag conflicting directives.",
  ],
  intro:
    "This generator builds a complete logrotate rule — the /etc/logrotate.d/ block that controls when a log rotates, how many old copies are kept, whether they are compressed, and what runs afterwards — using the directive syntax of logrotate(8). It is aimed at Linux administrators who want a correct rule with create modes, delaycompress and a postrotate reload hook, and it flags the classic conflicts such as size vs maxsize and copytruncate vs create.",
  useCases: [
    "Writing a rotation rule for a custom app in /var/log/myapp that keeps 14 daily compressed rotations and reloads the service afterwards",
    "Capping a runaway container or nginx log with maxsize 100M so it rotates early without abandoning the daily schedule",
    "Choosing between copytruncate and create for a daemon that cannot reopen its log file on SIGHUP",
  ],
  benefits: [
    ["Real logrotate syntax", "Emits directives exactly as logrotate(8) defines them, ready for /etc/logrotate.d/."],
    ["Conflict warnings", "Explains that size overrides the schedule, create is ignored under copytruncate, and delaycompress needs compress."],
    ["Postrotate done right", "Wraps your reload command in sharedscripts + postrotate/endscript so it runs once per pattern."],
  ],
  faqs: [
    [
      "What is the difference between size and maxsize in logrotate?",
      "size rotates ONLY on file size and makes logrotate ignore the daily/weekly/monthly schedule entirely, while maxsize rotates when either the size is exceeded or the scheduled time arrives — whichever happens first. For \"daily, but sooner if it hits 100M\", use maxsize 100M with daily.",
    ],
    [
      "Should I use copytruncate or create with postrotate?",
      "Prefer create plus a postrotate signal (for example systemctl reload nginx) when the daemon can reopen its log file. copytruncate copies the log and truncates the original in place, so any lines written between the copy and the truncate are permanently lost — it exists for programs that keep a file handle open forever and cannot be signalled.",
    ],
    [
      "What does rotate 14 mean in logrotate?",
      "It keeps 14 rotated copies before deleting the oldest, so with daily rotation you retain roughly two weeks of history. rotate 0 keeps nothing — the old log is deleted immediately at rotation.",
    ],
    [
      "Why does logrotate need delaycompress?",
      "delaycompress postpones compression by one rotation cycle, leaving the most recent rotated file uncompressed. That matters when a daemon may keep writing briefly to the old file after rotation — compressing it immediately would corrupt those final writes. It only works together with the compress directive.",
    ],
  ],
};

export default seo;
