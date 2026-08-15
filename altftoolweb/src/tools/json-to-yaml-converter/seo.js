const seo = {
  title: "JSON to YAML Converter with 2-Space Block Style",
  steps: [
    "Paste a JSON object or array into the JSON input textarea — a sample object is pre-loaded to start from.",
    "The YAML output pane converts on every keystroke into block style with two-space indents; invalid JSON shows the parser's error message instead.",
    "Press Copy (disabled while the JSON is invalid) to put the YAML on your clipboard — the button reads Copied briefly.",
  ],
  intro:
    "The JSON to YAML Converter rewrites a JSON object or array as block-style YAML, using two spaces per nesting level and quoting only the strings that would otherwise be misread by a YAML parser. Values that contain characters like a colon, hash, dash or brace, or that begin or end with a space, are wrapped in double quotes; numbers, booleans and null are left bare. It is for anyone hand-editing a config that wants YAML but whose source of truth arrived as JSON.",
  useCases: [
    "You exported a settings object as JSON and need it as YAML to drop into a docker-compose, GitHub Actions or Kubernetes manifest.",
    "A colleague pasted a JSON API example into a ticket and your docs use YAML code blocks, so you need the same data in the other notation.",
    "You are checking whether a string in your data — a timestamp, a version range, a value starting with a dash — needs quoting before it breaks the YAML parser.",
  ],
  benefits: [
    ["Quotes only where it matters", "Strings containing YAML-significant characters or edge whitespace are quoted; everything else stays unquoted and readable."],
    ["Block style, not flow style", "Nested objects and lists are expanded across lines with two-space indents rather than collapsed into inline braces and brackets."],
    ["Errors surface as you type", "The conversion re-runs on every keystroke and shows the JSON parser's own message the moment the input stops being valid."],
  ],
  faqs: [
    [
      "How many spaces does it indent?",
      "Two spaces per level, which is the conventional YAML indent and the one used by Kubernetes, GitHub Actions and docker-compose examples. Tabs are never emitted, since the YAML spec forbids them for indentation.",
    ],
    [
      "Why did some of my strings come out in quotes?",
      "A string is quoted when it contains any of the YAML-significant characters : # { } [ ] , & * ? | - < > = ! % @ or a backtick, or when it starts or ends with whitespace. Without those quotes the parser would read the value as a mapping, comment, anchor or list item instead of text.",
    ],
    [
      "What happens to empty objects and arrays?",
      "An empty object is written as {} and an empty array as [], the flow-style forms, because block style has no way to express a container with nothing in it. An empty string becomes a pair of double quotes.",
    ],
    [
      "Can I convert a top-level JSON array?",
      "Yes — a top-level array becomes a sequence of dash-prefixed entries, and any object inside it is expanded on the lines below its dash. Scalars, objects and arrays can be mixed within the same list.",
    ],
  ],
};

export default seo;
