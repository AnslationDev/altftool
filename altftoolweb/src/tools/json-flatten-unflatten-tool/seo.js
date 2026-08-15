const seo = {
  title: "JSON Flatten and Unflatten: Dot Notation Both",
  metaDescription:
    "Flatten nested JSON to dot-notation paths or rebuild it, with bracket [0] or dot .0 array indices; conflicting paths error instead of overwriting.",
  steps: [
    "Set Direction to 'Flatten — nested to dot notation' or 'Unflatten — dot notation to nested', then paste your document into the input box, which is labelled 'Nested JSON input' or 'Flat JSON input (path keys)' to match.",
    "Pick the Array index style — 'Bracket indices — users[0].name' or 'Dot indices — users.0.name' — and the Output formatting: 2 spaces, 4 spaces or Minified.",
    "Read the headline leaf or path count with the Max depth or Null-filled indices row and any warnings about dotted keys, then press 'Copy JSON' to take the converted document.",
  ],
  intro:
    "This tool flattens nested JSON into a single-level object of dot-notation paths — user.address.city or users[0].name — and rebuilds the nested structure from those paths, in either direction. It supports both common conventions: lodash-style bracket indices ([0]) and flat-package-style dot indices (.0), keeps empty objects and arrays as leaves so round-trips are lossless, and treats conflicting paths as errors rather than silent overwrites. It is built for developers preparing JSON for CSV export, diffing deeply nested API responses, or authoring config as flat key lists.",
  useCases: [
    "Flattening a nested API response so every leaf becomes one column for a CSV or spreadsheet export",
    "Diffing two deployment configs by flattening both and comparing the sorted path lists line by line",
    "Rebuilding nested JSON from flat environment-style keys such as user.address.city collected in a form or key-value store",
  ],
  benefits: [
    ["Both path styles", "Bracket indices (users[0].name, lodash-compatible) or dot indices (users.0.name, flat-package style)."],
    ["Lossless round-trips", "Empty {} and [] are preserved as leaf values, so flatten then unflatten returns the original document."],
    ["Conflicts are errors", "a = 1 next to a.b = 2 fails with the offending path instead of silently discarding data."],
  ],
  faqs: [
    [
      "What does it mean to flatten a JSON object?",
      "Flattening converts a nested document into a single-level object whose keys are the full paths to each leaf value, so {\"user\":{\"name\":\"Ada\"}} becomes {\"user.name\":\"Ada\"}. Every scalar keeps exactly one row, which makes the data trivial to diff, grep, or map onto CSV columns.",
    ],
    [
      "How are arrays represented in flattened JSON?",
      "Two conventions exist and this tool supports both: bracket style writes users[0].name, matching lodash get/set paths, while dot style writes users.0.name, matching the npm flat package. Pick the style your downstream tool expects — and note that in dot style an object key that is purely numeric will be rebuilt as an array index.",
    ],
    [
      "Why does unflattening my JSON report a path conflict?",
      "Because two keys claim the same location with incompatible shapes — for example a = 1 alongside a.b = 2, or a[0] alongside a.b, which force a to be a scalar, an object and an array at once. The tool names the conflicting path so you can fix the key; silently picking a winner would corrupt the output.",
    ],
    [
      "Do keys that contain dots break flattening?",
      "They make the flat form ambiguous: {\"a.b\": 1} and {\"a\": {\"b\": 1}} both flatten to the path a.b. The tool flattens them anyway but warns you, because unflattening will always rebuild the nested interpretation — if exact round-trips matter, rename such keys first.",
    ],
  ],
};

export default seo;
