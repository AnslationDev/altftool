const seo = {
  title: "Base URL Path Joiner: Safe Join vs RFC 3986 Result",
  metaDescription:
    "Join a base URL with path segments and see both answers: the safe concatenation and what new URL()/fetch resolves, with the RFC 3986 rule named.",
  steps: [
    "Enter your base URL in the Base URL field and add each path segment with Add segment.",
    "Set Duplicate query keys, then tick Force a trailing slash or Percent-encode each segment.",
    "Read the Joined URL beside What new URL() / fetch resolves, then press Copy result.",
  ],
  intro:
    "This joiner takes a base URL and a list of path segments and produces two answers: the safe concatenation, which always preserves the base path, and the RFC 3986 section 5 reference resolution that fetch and the WHATWG URL parser actually perform. Where the two disagree it names the rule responsible — a path-absolute reference replacing the base path, a missing trailing slash dropping the last base segment, or the base query string being discarded. Dot segments are removed with the algorithm in section 5.2.4.",
  useCases: [
    "Debugging an API client where a configured path like \"/v2/users\" silently drops the /v1 prefix from the base URL.",
    "Working out why a base of https://api.example.com/v1 behaves differently from https://api.example.com/v1/ when the same relative path is appended.",
    "Building a CDN asset URL that walks up two directories with ../../ and confirming what path actually reaches the origin.",
  ],
  benefits: [
    ["Both answers at once", "See the naive join and the spec resolution together instead of discovering the gap in production."],
    ["Names the rule", "Every difference is explained by the specific RFC 3986 clause that caused it."],
    ["Query and fragment aware", "Merges query strings from the base and the segments and warns when two fragments collide."],
  ],
  faqs: [
    [
      "Why does new URL('/api/v2', base) remove the path from my base URL?",
      "Because a reference starting with \"/\" is path-absolute. RFC 3986 section 5.2.2 replaces the entire base path with it and keeps only the scheme and authority, so https://example.com/v1/ plus /api/v2 gives https://example.com/api/v2. Drop the leading slash to get relative merging instead.",
    ],
    [
      "Does a trailing slash on a base URL matter?",
      "Yes, and it changes the result. RFC 3986 section 5.3 merges a relative reference by removing everything after the last \"/\" in the base path. So base .../v1 plus \"users\" resolves to .../users, while base .../v1/ plus \"users\" resolves to .../v1/users. Always give an API base URL a trailing slash.",
    ],
    [
      "How do I join a base URL and a path without losing anything?",
      "Strip trailing slashes from the base path and leading slashes from each segment, join them with a single \"/\", then run the RFC 3986 remove-dot-segments algorithm on the result. That keeps the full base path, which is what most people want, but it is not what new URL() does — so do not assume the two agree.",
    ],
    [
      "What happens to the query string on the base URL?",
      "Reference resolution throws it away. RFC 3986 section 5.3 keeps the base query only when the reference is entirely empty; any relative path at all replaces the query with the reference's own, which is usually nothing. If you need base parameters preserved, merge them yourself after resolving.",
    ],
  ],
};

export default seo;
