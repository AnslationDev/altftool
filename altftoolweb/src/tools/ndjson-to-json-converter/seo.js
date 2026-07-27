const seo = {
  intro:
    "This converter transforms NDJSON — newline-delimited JSON, also known as JSON Lines — into a single JSON array, and unwraps a JSON array back into one minified record per line. It applies the format's core rule that every line must be one complete RFC 8259 JSON value, reports the exact line number of any malformed record, and handles CRLF endings and blank lines. It is built for developers wrangling log exports, Elasticsearch bulk files, BigQuery exports and streaming API output.",
  useCases: [
    "Converting an exported application log or Elasticsearch bulk file into a JSON array a REST API or spreadsheet importer accepts",
    "Preparing a JSON array of records as NDJSON for BigQuery load jobs or bulk-import endpoints that require one document per line",
    "Finding the exact broken line in a large .ndjson export that a strict loader keeps rejecting",
  ],
  benefits: [
    ["Both directions", "NDJSON to JSON array and JSON array back to NDJSON, with a shared record count."],
    ["Per-line error reporting", "A malformed record fails with its line number instead of a vague whole-file error."],
    ["Format-correct output", "Written NDJSON is minified one value per line, because the format forbids literal newlines inside a value."],
  ],
  faqs: [
    [
      "What is the difference between NDJSON and JSON?",
      "A JSON file is one single value, while NDJSON is a stream of many JSON values separated by newlines — one complete value per line. That structure lets tools process records line by line without loading the whole file, which is why log pipelines, jq, BigQuery and Elasticsearch bulk APIs use it.",
    ],
    [
      "Why is my pretty-printed JSON not valid NDJSON?",
      "Because NDJSON requires each line to be a complete JSON value, and pretty-printing spreads one value across many lines. Convert the array with this tool instead: each element is re-serialised minified onto its own line, which is the only layout the format allows.",
    ],
    [
      "How do I convert NDJSON to a JSON array on the command line?",
      "jq -s '.' file.ndjson slurps every line into one array, which is exactly the transformation this tool performs in the browser — with the addition that a broken line is reported by number rather than failing the whole slurp.",
    ],
    [
      "Are blank lines and CRLF line endings allowed in NDJSON?",
      "Strictly a value per line is expected, but real-world files end with a trailing newline and Windows tools write CRLF, so this converter strips the \\r before parsing and skips blank lines while counting them. Anything else on a line must parse as JSON or the conversion stops with that line number.",
    ],
  ],
};

export default seo;
