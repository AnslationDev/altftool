const seo = {
  intro:
    "This library provides seven copy-ready regular expressions for dates and times: ISO 8601 / RFC 3339 dates and timestamps, day-first DD/MM/YYYY and US MM/DD/YYYY slash dates, 24-hour and 12-hour clock times, the RFC 3164 syslog prefix and the Apache Common Log Format %t field. Digit ranges — months 01–12, days 01–31, hours 00–23, minutes and seconds 00–59 — are enforced by alternation, and every pattern documents exactly what a regex cannot check, like month lengths and leap years.",
  useCases: [
    "An API developer validating that request payload fields are RFC 3339 timestamps like 2026-07-26T14:30:00Z before parsing",
    "An SRE grepping mixed logs for syslog-prefixed lines or extracting Apache [26/Jul/2026:14:30:05 +0530] timestamps",
    "A data engineer classifying a messy CSV column as ISO, day-first or US-format dates before choosing a parser",
  ],
  benefits: [
    ["Real digit-range checks", "Months cap at 12, days at 31 and hours at 23 through alternations, so 2026-13-01 and 24:00 fail instead of slipping through."],
    ["Log formats included", "Syslog RFC 3164 and Apache CLF timestamp patterns are ready for grep, awk or extraction pipelines."],
    ["Ambiguity called out", "The DD/MM vs MM/DD overlap for days up to 12 is documented so you decide the convention per data source."],
  ],
  faqs: [
    [
      "What is the regex for an ISO 8601 date?",
      "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$ matches YYYY-MM-DD with the month held to 01–12 and the day to 01–31. It cannot know that April has 30 days or apply leap-year rules — 2026-02-31 still passes — so parse the match with a date library to confirm the day exists.",
    ],
    [
      "How do I match an ISO 8601 timestamp with timezone in regex?",
      "Extend the date pattern with a T or space separator, hh:mm:ss where hours are ([01]\\d|2[0-3]), optional fractional seconds, and an optional Z or ±hh:mm offset. The full pattern in this library accepts 2026-07-26T14:30:00Z and 2026-07-26 09:15:59.123+05:30 while rejecting minute or second values of 60.",
    ],
    [
      "Can regex tell DD/MM/YYYY apart from MM/DD/YYYY?",
      "Only when a value is out of range for one of them — 26/07/2026 can only be day-first because 26 exceeds 12 months, but 01/02/2026 matches both patterns and is genuinely ambiguous. The order must come from context (locale or data-source convention); no regex can recover it from the string alone.",
    ],
    [
      "Why doesn't my date regex catch 31 February?",
      "Because per-month day counts and leap years are calendar logic, not string shape — encoding them in a regex needs a huge alternation per month plus a leap-year rule the regex cannot express cleanly. The standard practice is a two-step check: regex for format, then a date parser (like Date or a library) to verify the date really exists.",
    ],
  ],
};

export default seo;
