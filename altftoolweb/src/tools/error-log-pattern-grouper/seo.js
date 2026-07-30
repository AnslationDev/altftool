const seo = {
  intro:
    "This log grouper collapses a wall of log lines into a ranked list of distinct error patterns by masking the parts that vary — timestamps, IPs, UUIDs, hex and long ids, URLs, emails, file paths, query-string values and every bare number become placeholders like <ip>, <uuid> and <number> — and then counting the identical normalised messages that remain. Each group reports its severity, occurrence count, first and last seen times, whether it is increasing or decreasing, and the stack frame most of its entries share. It is for engineers triaging a log dump who need to know which three errors matter, not which two thousand lines exist.",
  useCases: [
    "You have exported an hour of production logs after an incident and need to know whether one failure repeated 400 times or 400 different things broke",
    "A service is noisy with per-user error lines like \"Request failed for user 48291\" and you want them folded into one pattern with a count",
    "Preparing a post-incident write-up and needing a table of pattern, severity, count, first and last seen that you can paste straight into the doc",
  ],
  benefits: [
    ["Grouping that survives varying payloads", "Ids, IPs, UUIDs, paths, URLs and numbers are masked before comparison, so lines differing only by request data land in the same group."],
    ["Multi-line entries stay intact", "Stack traces and indented continuation lines are attached to the entry that started them, and JSON-per-line logs are parsed for level, service and message."],
    ["Triage context, not just counts", "Each group carries a trend, a burst flag, the services or modules involved and the stack frame shared by most occurrences, exportable as CSV or Markdown."],
  ],
  faqs: [
    [
      "How does it decide two log lines are the same error?",
      "It rewrites the variable parts of each message into placeholders and compares what is left, case-insensitively. URLs, email addresses, UUIDs, IPv4 addresses, hex values, ids of 16 or more hex characters, query-string values, multi-segment file paths and all plain numbers are masked, so \"timeout after 30000ms for user 48291\" and \"timeout after 5000ms for user 77302\" become one pattern.",
    ],
    [
      "What counts as a burst?",
      "A group is flagged as a burst when any two of its entries have timestamps 60 seconds or less apart. That separates a spike from the same error trickling in steadily over hours, and it works from the timestamps in the log itself rather than from when you paste them.",
    ],
    [
      "What do the Increasing and Decreasing trends mean?",
      "The entries are split at the midpoint of the pasted log and the two halves are compared: more occurrences in the second half is Increasing, more in the first half is Decreasing, an equal split is Stable, and a single occurrence is labelled Single. It is a position-based signal within what you pasted, not a projection.",
    ],
    [
      "Which severity levels are recognised?",
      "TRACE, DEBUG, INFO, NOTICE, WARN, ERROR and FATAL. WARNING is normalised to WARN, and FATAL, CRITICAL and SEVERE are all reported as FATAL; JSON logs are read from their level, severity or logLevel field, and anything unrecognised is marked UNKNOWN.",
    ],
  ],
};

export default seo;
