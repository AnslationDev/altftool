const seo = {
  title: "JSON Parser: Type-Coloured Tree View & Validator",
  metaDescription:
    "Validate JSON with JSON.parse and read it as a type-coloured tree with indexed arrays, a two-space formatted view, minify, and the exact error.",
  steps: [
    "Paste your JSON into the input box (placeholder {\"name\": \"John\", \"age\": 30}) or press 'Sample' to load one.",
    "Press 'Parse JSON' — invalid input shows the engine's own error message; 'Minify' rewrites the input with no whitespace and 'Clear' empties it.",
    "Switch the output between 'Tree' and 'Formatted', then press 'Copy' or 'Download' to save data.json.",
  ],
  intro:
    "The JSON parser validates a document with the browser's own JSON.parse and then renders it three ways: an indented tree that colour-codes each value by its actual type, a formatted two-space view, and the raw text. Because the tree is built from the parsed value rather than the text, it shows you what the data really is — a number `42` and a string `\"42\"` are drawn differently, and array entries are labelled by index. Beautify and minify rewrite the input in place, and if parsing fails you get the parser's own error message instead of a blank panel.",
  useCases: [
    "An API returned a deeply nested response and you need to find the path to one field without counting brackets in a wall of text",
    "A numeric ID is being compared incorrectly in your code and you want to confirm whether the payload sends it as a number or as a quoted string",
    "A config file will not load and you need to know exactly where the syntax breaks before you start deleting lines to bisect it",
  ],
  benefits: [
    ["Types are visible, not inferred", "Strings, numbers, booleans and null are coloured separately in the tree, so quoted numbers and stringified booleans stand out immediately."],
    ["Tree, formatted and raw from one parse", "Switch views without re-pasting: the same parsed value drives the structural tree and the two-space text."],
    ["Arrays are index-labelled", "Every array element shows its position, which is what you need when an error message points at index 7 of a list."],
  ],
  faqs: [
    [
      "Why does my JSON fail to parse?",
      "Usually because it is a JavaScript object literal rather than JSON. JSON forbids trailing commas, single-quoted strings, unquoted keys, comments, `undefined` and `NaN`, all of which are legal in JS. The error message shown is the engine's own and names the position where parsing stopped.",
    ],
    [
      "What is the difference between beautify and minify here?",
      "Beautify rewrites your input as `JSON.stringify(value, null, 2)` — two-space indentation, one key per line. Minify rewrites it with no whitespace at all, which is the compact form you send over the wire. Both reparse first, so either button also confirms the document is valid.",
    ],
    [
      "Does the tree view preserve key order?",
      "It follows the object's own property order, which for parsed JSON is the order the keys appeared in the text — with one JavaScript rule applied: keys that look like non-negative integers are ordered numerically ahead of the rest. That only affects display, never the data.",
    ],
    [
      "Is my data uploaded anywhere?",
      "No. Parsing, formatting and rendering all happen in the page with the browser's built-in JSON support, and the copy and download actions read from the value already in memory. Pasting a response that contains tokens or personal data does not send it anywhere.",
    ],
  ],
};

export default seo;
