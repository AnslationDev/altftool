const seo = {
  intro:
    "The Batch Timestamp Conversion Tool takes a pasted list of mixed Unix epochs and written dates and converts every row at once, deciding whether a number is seconds, milliseconds, microseconds or nanoseconds from its digit count. It is aimed at anyone reading raw logs, database dumps or API responses who needs the whole column in a readable timezone rather than one value at a time. Every row is converted through the IANA timezone database, and rows that cannot be parsed are listed separately instead of silently becoming a wrong date.",
  useCases: [
    "A log export gives you a column of 13-digit values and you need to know which entries fall inside last Tuesday's incident window in your own timezone.",
    "Two services disagree about when an event happened because one writes epoch seconds and the other writes ISO strings — paste both columns and compare the ISO output side by side.",
    "You are filing a bug and need every timestamp in the ticket rendered in Asia/Kolkata rather than UTC, then exported as CSV to attach.",
  ],
  benefits: [
    ["Unit detection by digit width", "Seconds, milliseconds, microseconds and nanoseconds are told apart automatically, so you do not have to divide by a thousand and hope."],
    ["Bad rows are surfaced, not swallowed", "Unparseable values get an invalid badge and their own validation list, with a success percentage across the batch."],
    ["Both directions in one pass", "Numbers become readable dates and written dates become epoch seconds, in the same table, from the same paste."],
  ],
  faqs: [
    [
      "How does it know if my number is seconds or milliseconds?",
      "By digit count. Up to 10 digits is read as Unix seconds, 11-13 digits as milliseconds, 14-16 as microseconds, and anything longer as nanoseconds. All four are normalised to milliseconds internally before formatting.",
    ],
    [
      "How many timestamps can I convert at once?",
      "2,000 rows per batch. Input is split on line breaks, tabs and spaces, surrounding quotes are stripped, and anything past the 2,000th value is ignored.",
    ],
    [
      "Which timezones are supported?",
      "Any IANA zone name, such as Asia/Kolkata or Europe/London, entered in the custom field, plus quick picks for UTC, your detected local zone, Kolkata, Los Angeles, New York, London and Tokyo. An unrecognised zone name falls back to UTC with a visible warning rather than failing.",
    ],
    [
      "What date formats will it accept as input?",
      "ISO 8601 plus common written forms including YYYY-MM-DD HH:mm:ss, MM/DD/YYYY, DD/MM/YYYY, YYYYMMDD, YYYYMMDDHHmmss, 'MMM D, YYYY' and RFC-style strings. A value that already carries a zone offset, Z, GMT or UTC is honoured as written; anything without one is read in the timezone you selected.",
    ],
  ],
};

export default seo;
