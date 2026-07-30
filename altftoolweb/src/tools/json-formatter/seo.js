const seo = {
  intro:
    "This JSON formatter pretty-prints or minifies a document and also converts the two other shapes API parameters arrive in — a GET query string and an x-www-form-urlencoded POST body — into JSON objects, using the browser's own URLSearchParams to split them. Indentation is selectable at 2, 4 or 8 spaces or a real tab, and an editable key/value table stays in sync both ways, so editing a row rewrites the URL, the form body or the JSON depending on which mode you are in. Nothing is transmitted: the request preview that shows method, headers and body is a local illustration, not a live call.",
  useCases: [
    "You copied a long GET URL out of a browser network tab and want its fifteen query parameters as a readable JSON object instead of one unbroken string",
    "An OAuth token endpoint takes an x-www-form-urlencoded body and you have the values as JSON, so you need the encoded form string to paste into your client",
    "A minified API response landed in your terminal as one line and you need it indented at your team's four-space setting before you can find the field you are debugging",
  ],
  benefits: [
    ["Three input shapes, one output", "Raw JSON, a GET query string and a urlencoded form body all normalise into the same formatted JSON object."],
    ["Two-way parameter table", "Edit a key or value in the table and the URL, form body or JSON text is rewritten to match, so you never hand-edit percent-encoding."],
    ["Formatted and minified together", "Every parse produces both the indented version and the single-line minified version, so you can take whichever the next tool needs."],
  ],
  faqs: [
    [
      "Does this actually send the API request?",
      "No. The GET, POST-form and POST-JSON panels build and display what the request would look like — method, target, headers and body — but nothing leaves your browser. Use it to prepare and check a payload, then paste it into your own HTTP client.",
    ],
    [
      "What indentation options are there?",
      "Four: 2 spaces, 4 spaces, 8 spaces, or a literal tab character. The same setting drives both the formatted output and anything the parameter table writes back into the JSON panel.",
    ],
    [
      "How does it convert a query string into JSON?",
      "It splits the URL at the first `?` and hands the rest to URLSearchParams, which decodes percent-encoding and `+` for you, then builds one JSON key per parameter. A parameter that repeats keeps only its last value, since a plain JSON object cannot hold two entries with the same key.",
    ],
    [
      "Why does my JSON fail to parse?",
      "Almost always because it is JavaScript rather than JSON: trailing commas, single-quoted strings, unquoted keys, comments and `undefined` are all valid in a JS object literal and all rejected by JSON. The panel shows the parser's own message, which names the character position where it stopped.",
    ],
  ],
};

export default seo;
