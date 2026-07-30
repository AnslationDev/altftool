const seo = {
  intro:
    "JSON Compare parses both inputs, re-serialises each one with two-space indentation, then aligns the two using a longest-common-subsequence diff so only genuine differences are highlighted — reformatting, minification and stray whitespace disappear before the comparison starts. Added lines are marked on the right panel, removed lines on the left, and a running count of each is shown above the result. You can paste the two documents, upload files, or fetch them from URLs, and invalid JSON is reported per panel with the parser's own error message.",
  useCases: [
    "A staging API and production API return what should be the same payload, and you need to find the one field that differs before filing the bug",
    "A config file broke after a deploy and you want to compare the version that worked against the one that shipped, without minified-versus-pretty formatting drowning the real change",
    "You are reviewing a fixture update in a pull request and the diff is unreadable because the whole file was re-indented alongside three actual value changes",
  ],
  benefits: [
    ["Formatting is normalised first", "Both sides are parsed and re-printed at two-space indentation, so a minified document and a pretty-printed one compare as equal when their data matches."],
    ["LCS alignment, not line-by-line", "The longest-common-subsequence pass keeps matching lines aligned across insertions, instead of reporting everything after an added field as changed."],
    ["Invalid input is named, not swallowed", "Each panel is parsed separately and reports which side failed along with the parser's message, so you know whether A or B is malformed."],
  ],
  faqs: [
    [
      "Will it ignore differences in formatting and indentation?",
      "Yes. Both documents are parsed and re-serialised with `JSON.stringify(value, null, 2)` before the diff runs, so tabs versus spaces, minified versus expanded, and trailing whitespace never appear as differences. Only structural and value changes survive that step.",
    ],
    [
      "Does reordering keys count as a difference?",
      "Yes, it does. Re-serialisation preserves the original key insertion order, so `{\"a\":1,\"b\":2}` and `{\"b\":2,\"a\":1}` are semantically the same object but produce four changed lines. Sort keys the same way on both sides if order is not meaningful to you.",
    ],
    [
      "Can I compare two live API responses by URL?",
      "Yes — paste a URL into each panel and fetch it. Because the request is made from your browser, the endpoint must send permissive CORS headers and be reachable without authentication; if it is not, copy the response body out of your API client and paste it instead.",
    ],
    [
      "How large a file can it handle?",
      "The diff is a classic dynamic-programming LCS, so work grows with the product of the two line counts — two 1,000-line documents mean a million cells, which is fine, while two 20,000-line documents mean 400 million and will stall the tab. For very large payloads, compare the relevant subtree rather than the whole document.",
    ],
  ],
};

export default seo;
