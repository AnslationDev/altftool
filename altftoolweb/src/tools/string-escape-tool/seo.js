const seo = {
  title: "JSON Escape / Unescape - String Escape Tool",
  metaDescription:
    "Escape quotes, backslashes, newlines and tabs with JSON.stringify rules, or unescape back to plain text - outer quotes stripped, ready to paste.",
  steps: [
    "Paste text into the Input box, or click Load sample to try a two-line example with quotes.",
    "Set Mode to Escape or Unescape - the Result pane updates live using JSON.stringify / JSON.parse rules, with the outer double quotes stripped from escaped output.",
    "Click Copy to grab the Result; a malformed unescape shows 'Invalid escaped string' instead of half-decoded text.",
  ],
  intro:
    "The String Escape Tool converts raw text into a JSON-safe string literal — escaping double quotes as \\\", backslashes as \\\\, newlines as \\n, tabs as \\t and other control characters as \\u sequences — and reverses the process on demand. It uses the same rules as JavaScript's JSON.stringify and JSON.parse, so the output is exactly what a JSON parser expects. Paste text in, pick Escape or Unescape, and copy the result straight into your code or config file.",
  useCases: [
    "Dropping a multi-line error message or SQL query into a JSON config file without the parser choking on the line breaks and quotes.",
    "Reading a log line that arrived as \\\"user said \\\\\\\"hello\\\\\\\"\\\" and turning it back into the plain text a human can actually read.",
    "Building a test fixture where a string field must contain quotes, tabs or a Windows CRLF and you need the literal escaped correctly the first time.",
  ],
  benefits: [
    ["Round-trips both ways", "Escape and unescape share one parser, so text that goes through both comes back byte-for-byte identical."],
    ["Handles control characters", "Tabs, carriage returns, form feeds and non-printables become \\t, \\r, \\f and \\uXXXX instead of silently breaking the file."],
    ["Tells you when input is broken", "An unescape on a malformed sequence reports an invalid escaped string rather than returning half-decoded text."],
  ],
  faqs: [
    [
      "What characters does JSON escaping actually change?",
      "Seven characters get short escapes — double quote (\\\"), backslash (\\\\), backspace (\\b), form feed (\\f), newline (\\n), carriage return (\\r) and tab (\\t) — and every other control character below U+0020 becomes a six-character \\u00XX sequence. Ordinary letters, digits, punctuation and Unicode text pass through unchanged.",
    ],
    [
      "Does single quote need escaping?",
      "No. JSON strings are delimited by double quotes only, so an apostrophe or single quote is an ordinary character and is left alone. If you are pasting into a single-quoted JavaScript or Python literal, you will need to escape it yourself for that language.",
    ],
    [
      "Why does my escaped output have no surrounding quotes?",
      "The outer pair of double quotes is stripped so you get just the string body, ready to paste between quotes you already typed. Add them back if you need a complete JSON value rather than a fragment.",
    ],
    [
      "Can I use the escaped output in languages other than JSON?",
      "Usually yes. C, C++, Java, JavaScript, Go and C# share the same backslash escapes for quotes, newlines and tabs, so the output pastes in cleanly; the main difference is Unicode, where some languages expect \\uXXXX pairs or \\U00XXXXXX for characters above U+FFFF.",
    ],
  ],
};

export default seo;
