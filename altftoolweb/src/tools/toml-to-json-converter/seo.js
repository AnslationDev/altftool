const seo = {
  title: "TOML to JSON Converter (Strict TOML v1.0.0 Parser)",
  metaDescription:
    "Convert Cargo.toml, pyproject.toml or any TOML v1.0.0 to JSON — dotted keys, arrays of tables and date-times handled; parse errors report the line.",
  steps: [
    "Paste your TOML — Cargo.toml, pyproject.toml, netlify.toml — into the TOML input box; it converts live, and spec violations like duplicate keys fail with the line number reported.",
    "Choose the JSON formatting: 2 spaces, 4 spaces, Tabs or Minified; the stats panel counts Keys converted, Tables, Arrays of tables and Output size in chars.",
    "Read the substitution warnings (date-times become strings, inf/nan become null) and press Copy JSON to copy the RFC 8259 output.",
  ],
  intro:
    "This converter parses TOML v1.0.0 — tables, arrays of tables, dotted keys, inline tables, multi-line strings and RFC 3339 date-times — and emits clean RFC 8259 JSON, entirely in your browser. Duplicate keys and redefined tables are rejected exactly as the TOML spec demands, so a file that converts here is a file a strict parser will accept. It is built for developers who need Cargo.toml, pyproject.toml, netlify.toml or any app config as JSON for scripts, APIs or schema validation.",
  useCases: [
    "Turning pyproject.toml or Cargo.toml into JSON to query dependencies with jq or a script",
    "Converting [[workflow]] style arrays of tables into JSON arrays a web dashboard can consume",
    "Validating that a hand-edited TOML config parses cleanly before deploying it",
  ],
  benefits: [
    ["Spec-strict parsing", "Duplicate keys, redefined tables and invalid escapes fail with the line number, per TOML v1.0.0."],
    ["Full syntax coverage", "Dotted keys, inline tables, hex/octal/binary integers, underscored numbers and multi-line strings all convert."],
    ["Honest JSON output", "Date-times become strings and inf/nan become null, with a note for every substitution JSON forces."],
  ],
  faqs: [
    [
      "How does a TOML array of tables convert to JSON?",
      "Each [[name]] header appends one object to a JSON array under that key, so two [[products]] blocks become \"products\": [ {...}, {...} ]. Sub-tables declared between the headers, such as [products.details], attach to the most recent element, and this converter follows that TOML v1.0.0 rule.",
    ],
    [
      "What happens to TOML dates and times in JSON?",
      "They become plain strings, because JSON has no date type. TOML's four RFC 3339 shapes — offset date-time, local date-time, local date and local time — are all preserved character-for-character (for example 1979-05-27T07:32:00Z), and the tool reports how many were converted.",
    ],
    [
      "Why does the converter say my key is defined twice?",
      "Because the TOML specification makes redefining a key or table a hard error, not a warning — the second definition does not silently win as it does in some INI parsers. Check the reported line: the same key may be set once as a dotted key and again inside a [table] header covering the same path.",
    ],
    [
      "Can TOML integers like 0xFF or 1_000_000 be converted?",
      "Yes. Hexadecimal (0x), octal (0o) and binary (0b) integers and underscore-separated numbers are parsed to their numeric values, so 0xFF becomes 255 and 1_000_000 becomes 1000000 in the JSON output. Decimal integers with leading zeros are rejected, as the spec requires.",
    ],
  ],
};

export default seo;
