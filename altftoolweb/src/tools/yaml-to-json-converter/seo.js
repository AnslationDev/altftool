const seo = {
  title: "YAML to JSON Converter – Anchors & Merge Keys",
  metaDescription:
    "Convert YAML 1.2 to JSON in your browser — anchors, aliases and merge keys resolved, multi-document streams become an array, output 2-space to minified.",
  steps: [
    "Paste your YAML into the YAML input box — & anchors, * aliases and << merge keys are resolved during parsing.",
    "Choose the JSON formatting: 2 spaces, 4 spaces, Tabs or Minified.",
    "Review the JSON output with its document count and any conversion warnings, then press Copy JSON.",
  ],
  intro:
    "This converter turns YAML 1.2 into RFC 8259 JSON entirely in your browser, resolving anchors, aliases and merge keys the way a YAML loader does rather than by text substitution. Multi-document streams separated by --- become a JSON array, duplicate keys are rejected as the spec requires, and you choose 2-space, 4-space, tab or minified output. It is built for developers converting Kubernetes manifests, CI pipelines and app config into JSON for APIs, scripts or schema validation.",
  useCases: [
    "Converting a docker-compose.yml or Kubernetes manifest to JSON to feed a tool that only accepts JSON",
    "Resolving &anchor / *alias / << merge-key inheritance in a config file to see the final effective values",
    "Turning a multi-document GitHub Actions or GitLab CI stream into a JSON array for scripting with jq",
  ],
  benefits: [
    ["Anchors fully resolved", "Aliases and << merge keys expand to their final values, exactly as a YAML 1.2 loader sees them."],
    ["Multi-document aware", "Streams with --- separators convert to one JSON array with a per-document count."],
    ["Strict and safe", "Duplicate keys and recursive aliases are reported as errors instead of producing silently wrong JSON."],
  ],
  faqs: [
    [
      "Does converting YAML to JSON resolve anchors and aliases?",
      "Yes — anchors (&), aliases (*) and merge keys (<<) are resolved during parsing, so the JSON contains the final expanded values. JSON has no reference syntax, which means shared nodes are duplicated in the output; a recursive alias is reported as an error because JSON cannot represent a cycle.",
    ],
    [
      "Is every YAML file convertible to JSON?",
      "Almost, because JSON is a subset of YAML 1.2, but not perfectly in reverse. YAML values JSON lacks — .inf and .nan become null, comments are dropped, and non-string mapping keys are coerced to strings. This tool flags each such substitution instead of hiding it.",
    ],
    [
      "How are multiple YAML documents in one file converted?",
      "Each document separated by --- is parsed separately and the result is a single JSON array with one element per document. A file with one document converts to that value directly, not wrapped in an array.",
    ],
    [
      "Why does the converter reject my YAML with a duplicated mapping key error?",
      "Because the YAML specification requires mapping keys to be unique, and silently keeping the last value — what many loose parsers do — hides real configuration bugs. Find the repeated key on the reported line and remove or rename one of the entries.",
    ],
  ],
};

export default seo;
