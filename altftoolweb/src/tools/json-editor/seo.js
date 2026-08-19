const seo = {
  title: "JSON Editor: Validate, Format, Minify, CSV Export",
  metaDescription:
    "Validate JSON to RFC 8259 with the line and column of the first fault and any duplicate keys, then pretty-print, minify, flatten or export RFC 4180 CSV.",
  steps: [
    "Paste your document into the \"JSON document\" textarea — it accepts up to 2,000,000 characters and nothing is uploaded.",
    "Choose an \"Output\" mode — \"Format (pretty-print)\", \"Minify\", \"Flatten to dot paths\" or \"Export array to CSV\" — set \"Indent\" to 2 spaces, 4 spaces or Tab, and tick \"Sort keys alphabetically\" if you want them ordered.",
    "An invalid document shows a \"Line N, column N\" error naming the fault; a valid one fills the \"Root type\", \"Nesting depth\", \"Duplicate keys\" and \"Input size (UTF-8)\" rows, and \"Copy result\" takes the output.",
  ],
  intro:
    "The JSON Editor validates a document against RFC 8259, reports the exact line and column of the first fault, and then reformats it — pretty-printed at 2 spaces, 4 spaces or tabs, minified, key-sorted, flattened to dot paths, or exported as RFC 4180 CSV. It uses a hand-written scanner alongside the browser's own parser, which is how it can also flag duplicate object keys that JSON.parse silently collapses to the last value. Built for developers debugging an API response, a config file or a webhook payload without pasting it into someone else's server.",
  useCases: [
    "Find the exact line where a 12 KB API response breaks instead of reading 'Unexpected token' with no position.",
    "Minify a config blob before pasting it into an environment variable, then pretty-print it again later.",
    "Turn a JSON array of order objects into a CSV you can open in Excel or Google Sheets.",
  ],
  benefits: [
    ["Line and column errors", "A full RFC 8259 walk pinpoints the fault, which modern V8 error messages no longer do."],
    ["Duplicate key warnings", "Repeated keys are listed rather than silently discarded by the parser."],
    ["Local only", "Validation, formatting and CSV export all run in the page — nothing is uploaded."],
  ],
  faqs: [
    [
      "Why does my JSON fail with a trailing comma?",
      "Because RFC 8259 does not allow one. `{\"a\": 1,}` is invalid JSON even though JavaScript object literals accept it. Formats that permit trailing commas and comments are JSON5 or JSONC, not JSON — strip them before sending the payload.",
    ],
    [
      "What happens to duplicate keys in JSON?",
      "The specification calls the behaviour undefined; every browser's JSON.parse keeps the last occurrence, so `{\"a\":1,\"a\":3}` becomes `{\"a\":3}`. This editor lists any duplicated key so you notice the value you lost.",
    ],
    [
      "Can JSON have comments?",
      "No. The grammar has six value types — object, array, string, number, boolean and null — and no comment syntax at all. If your tool accepts `//` lines it is reading JSONC, as used by VS Code settings and tsconfig.json.",
    ],
    [
      "How much smaller does minifying make a JSON file?",
      "Typically 15–30% on a 2-space indented document, because only whitespace is removed — the keys and values are untouched. Gzip on the wire saves far more; minifying mainly matters for inline payloads and environment variables.",
    ],
  ],
};

export default seo;
