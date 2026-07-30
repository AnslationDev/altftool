const seo = {
  intro:
    "The ISO 8601 Formatter converts any date/time your browser can parse into the canonical ISO 8601 UTC string, YYYY-MM-DDTHH:mm:ss.sssZ, and shows the same instant as a Unix timestamp in seconds, a UTC string and your local time. Type something like 2026-07-20 15:30 and you get 24-character ISO output plus the epoch value, with an explicit error when the input cannot be parsed. It is for developers writing API payloads, log formats and database values that must be timezone-unambiguous.",
  useCases: [
    "An API rejects your date field and you need the exact ISO 8601 form, with the T separator, milliseconds and trailing Z, to paste into the request body.",
    "You have a human-readable timestamp from a bug report and want the matching Unix seconds value to grep the logs with.",
    "You are checking how a local wall-clock time such as 15:30 maps to UTC before scheduling a cron job or a cross-timezone deployment window.",
  ],
  benefits: [
    [
      "Four representations of one instant",
      "Shows ISO 8601 UTC, Unix seconds, the UTC string and your local time together, so you can see the offset between them rather than converting twice.",
    ],
    [
      "Accepts loose input",
      "Parses everyday forms like '2026-07-20 15:30' as well as strict ISO strings, and says plainly when a value is unparseable instead of returning a wrong date.",
    ],
    [
      "Always normalises to UTC",
      "The ISO output is emitted in UTC with a Z suffix, which is the form that removes any ambiguity about which offset a stored timestamp was written in.",
    ],
  ],
  faqs: [
    [
      "What does an ISO 8601 timestamp look like?",
      "YYYY-MM-DDTHH:mm:ss.sssZ — for example 2026-07-20T10:00:00.000Z. The T separates date from time, the fractional part carries three digits of milliseconds, and the trailing Z means UTC (Zulu time), a zero offset.",
    ],
    [
      "Why is the ISO result different from the time I typed?",
      "Because a date typed without an offset is read as your local wall-clock time and then converted to UTC for the ISO output. In a UTC+05:30 timezone, 2026-07-20 15:30 becomes 2026-07-20T10:00:00.000Z — the same instant written in a different zone.",
    ],
    [
      "How do I get a Unix timestamp from a date?",
      "Enter the date and read the Unix (s) row: it is the number of whole seconds since 1 January 1970 00:00:00 UTC, floored rather than rounded. Multiply by 1000 if the system you are feeding expects milliseconds.",
    ],
    [
      "Why does my date show as invalid?",
      "Because the parser could not interpret it. Ambiguous or locale-specific forms such as 20/07/2026 are unreliable across engines — write the date as YYYY-MM-DD, optionally followed by a time as HH:mm or HH:mm:ss, and it will parse consistently.",
    ],
  ],
};

export default seo;
