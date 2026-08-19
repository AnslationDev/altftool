const seo = {
  title: "Unix Timestamp Converter: Epoch, Local, UTC & ISO",
  metaDescription:
    "Paste epoch seconds or milliseconds — over 10 digits is read as ms — and get local time, UTC, ISO 8601 and your offset in minutes. Converts back too.",
  steps: [
    "Paste the value into the Unix timestamp field — anything longer than 10 digits is read as milliseconds and anything shorter as seconds — or press Now to load the current instant.",
    "To go the other way, pick a moment in the Date and time picker; it writes the matching epoch seconds straight back into the timestamp field.",
    "The panel shows Seconds, Milliseconds, Local time, UTC time, ISO 8601 and Timezone offset in minutes side by side; Copy seconds puts the integer on the clipboard.",
  ],
  intro:
    "The Unix Timestamp Converter turns an epoch value — seconds or milliseconds since 1970-01-01 00:00:00 UTC — into six readable forms at once: seconds, milliseconds, your local time, the UTC string, ISO 8601, and your current UTC offset in minutes. It detects the unit automatically, treating any value longer than 10 digits as milliseconds and anything shorter as seconds, so you can paste a log value without stopping to count zeros. The conversion runs both ways: pick a date and time and it gives you back the epoch seconds to copy.",
  useCases: [
    "A log line or a JSON payload contains created_at: 1767225600 and you need to know what moment that actually was in your own timezone before replying to the incident.",
    "You are writing a database query or a test fixture that needs an exact epoch value for a specific date, and you want the seconds figure without doing the arithmetic.",
    "Two systems disagree about when an event happened and you suspect one is reporting milliseconds while the other reports seconds, so you convert both and compare.",
  ],
  benefits: [
    [
      "Seconds and milliseconds auto-detected",
      "Values over 10 digits are read as milliseconds, so a Java or JavaScript timestamp and a Unix seconds value both resolve correctly without a unit switch.",
    ],
    [
      "Local, UTC and ISO side by side",
      "All three renderings are shown at once, which is what you need when the bug is precisely that two systems disagree about the timezone.",
    ],
    [
      "Converts in both directions",
      "The date-and-time picker writes back to the timestamp field, so you can go from a calendar date to an epoch value as easily as the reverse.",
    ],
  ],
  faqs: [
    [
      "What is a Unix timestamp?",
      "It is the number of seconds elapsed since 1970-01-01 00:00:00 UTC, known as the Unix epoch, ignoring leap seconds. Because it is a single integer with no timezone attached, it is the standard way systems store and exchange an instant in time.",
    ],
    [
      "How do I tell whether a timestamp is in seconds or milliseconds?",
      "Count the digits: current-era values in seconds are 10 digits, and the same instant in milliseconds is 13. This converter uses that rule, treating anything longer than 10 digits as milliseconds, and seconds values have been 10 digits since 1,000,000,000 was reached on 9 September 2001.",
    ],
    [
      "What does the timezone offset in minutes mean?",
      "It is how far your local time sits from UTC, shown so that locations east of UTC are positive — India Standard Time reads +330 minutes, Central European Time +60, US Eastern Standard Time -300. Add it to the UTC time to get the local time shown above it.",
    ],
    [
      "What is the year 2038 problem?",
      "Systems that store Unix time in a signed 32-bit integer overflow at 2,147,483,647 seconds, which is 03:14:07 UTC on 19 January 2038, after which the value wraps to a negative number and reads as 1901. Modern platforms use 64-bit time, and this converter is not limited by the 32-bit range.",
    ],
  ],
};

export default seo;
